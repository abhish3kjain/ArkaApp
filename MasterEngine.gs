/**
 * ARKA MASTER SYNC ENGINE (Standalone Backend)
 * Calculates absolute Club Points, audits for specific point farming rules,
 * issues negative corrections, and batch-updates the MemberDB.
 *
 * Runs every midnight via a time-based trigger.
 *
 * Rule 5 (cpAwarded validation) only scrutinises entries logged AFTER the last
 * MasterSync Engine entry in the ActivityLogDB. Everything before that row was
 * already verified by a prior run, so re-checking it would re-penalise entries
 * that are already correct. The boundary is located by scanning backwards for
 * activitySource === "MasterSync Engine", a string that must never change.
 */

const SPREADSHEET_ID = "1qXsAAO_9aIEJuTTQ1ziX9s5plvm6WHaVI_zaKcSXF-4"; 
const MEMBERS_SHEET_NAME = "MemberDB";
const MASTERSYNC_SOURCE  = "MasterSync Engine"; // Never change this string 

/**
 * Must match the MAX_CP_PER_ACTION ceiling defined in the main app's logActivity.
 * A legitimate entry may equal this value even if the raw ActivityTypeDB multiplier is higher,
 * because the app caps it before writing. We treat capped entries as correct.
 */
const MAX_CP_PER_ACTION = 1000000;

// --- AUDIT CONFIGURATION ---
// Mapped directly to your application's specific ActivityType IDs
const AUDIT_TYPES = {
  META_REVIEW: "ARKA_ACTTYP_BOOKUPDATE",
  RATING: "ARKA_ACTTYP_BOOKRATING",
  REVIEW: "ARKA_ACTTYP_BOOKREVIEW",
  PROFILE_UPDATE: "ARKA_ACTTYP_PROFILEUPDATE",
  STATUS_CHANGES: [
    "ARKA_ACTTYP_BOOKTOREAD", 
    "ARKA_ACTTYP_BOOKDNF", 
    "ARKA_ACTTYP_BOOKREADING", 
    "ARKA_ACTTYP_BOOKREAD"
  ]
};

// --- MILESTONE DEFINITIONS ---
const PAGE_MILESTONES = [
  { threshold: 1000, points: 100 },
  { threshold: 5000, points: 500 },
  { threshold: 10000, points: 1000 },
  { threshold: 25000, points: 2500 },
  { threshold: 50000, points: 5000 },
  { threshold: 100000, points: 10000 },
  { threshold: 250000, points: 25000 },
  { threshold: 500000, points: 50000 },
  { threshold: 750000, points: 75000 },
  { threshold: 1000000, points: 100000 }
];

const BOOK_MILESTONES = [
  { threshold: 10, points: 300 },
  { threshold: 25, points: 750 },
  { threshold: 50, points: 1500 },
  { threshold: 100, points: 3000 },
  { threshold: 200, points: 6000 },
  { threshold: 500, points: 10000 },
  { threshold: 750, points: 20000 },
  { threshold: 1000, points: 50000 },
  { threshold: 2500, points: 100000 },
  { threshold: 5000, points: 250000 }
];

/**
 * Determines the appropriate user level based on their total club points.
 * @param {number} points - The user's true calculated points.
 * @param {Array<Object>} levelRules - Array of objects containing maxClubPoints and levelName.
 * @returns {string} The calculated level name (e.g., "Novice", "Master").
 */
function getLevelName(points, levelRules) {
  if (!levelRules || levelRules.length === 0) return "Reader";
  if (points > levelRules[levelRules.length - 1].maxClubPoints) {
    return levelRules[levelRules.length - 1].levelName;
  }
  for (let level of levelRules) {
    if (points <= level.maxClubPoints) return level.levelName;
  }
  return levelRules[0].levelName;
}

/**
 * Finds the row index (1-based, in the raw 2D array) of the LAST entry whose
 * activitySource is "MasterSync Engine". Returns 0 if none found, meaning the
 * engine has never run before and ALL entries are unverified.
 *
 * Scans backwards so it terminates as soon as the most-recent run is found,
 * making it O(1) in the normal steady-state case.
 *
 * @param {Array<Array<any>>} activityData - Full ActivityLogDB 2D array (row 0 = header).
 * @returns {number} Index of the last MasterSync row, or 0 if not found.
 */
function findLastMasterSyncRowIndex(activityData) {
  for (let i = activityData.length - 1; i >= 1; i--) {
    if ((activityData[i][5] || "").toString().trim() === MASTERSYNC_SOURCE) {
      return i;
    }
  }
  return 0; // Engine has never run — treat all entries as unverified
}

// ============================================================================
// AUDIT ENGINE
// ============================================================================

/**
 * Scans the ActivityLogDB and produces negative correction log rows for:
 *
 *   Rule 1  Book metadata update cooldown (once per book per 30 days)
 *   Rule 2  Duplicate rating or review for the same shelf record
 *   Rule 3  More than one point-earning profile update per day
 *   Rule 4  Multiple reading-status changes for the same book on the same day
 *            (only the last change in the day earns points; earlier ones are reversed)
 *   Rule 5  cpAwarded exceeds what ActivityTypeDB currently authorises for that type
 *            (anti-hack check, applied ONLY to entries after the last MasterSync row
 *             so previously verified entries are never re-penalised)
 *
 * Rules 1–4 still scan the entire history for context (e.g. the 30-day window for
 * Rule 1 must look backwards), but they skip entries that already have a matching
 * correction log to prevent double-penalisation.
 *
 * @param {Array<Array<any>>} activityData      Full ActivityLogDB 2D array.
 * @param {string}            activityDate      Formatted timestamp for new log rows.
 * @param {number}            startingActNum    Next available ARKA_ACT_X integer.
 * @param {Object}            multiplierMap     { activityTypeID: cpValue } from ActivityTypeDB.
 * @param {number}            lastMasterSyncIdx Row index of last MasterSync entry (0 = none).
 * @returns {{ newCorrectionLogs: Array<Array<any>>, nextActNum: number }}
 */
function generateCorrections(activityData, activityDate, startingActNum, multiplierMap, lastMasterSyncIdx) {
  let corrections = [];
  let correctedActIds = new Set(); // IDs already offset by a prior correction log
  let currentActNum = startingActNum;

  // --- Trackers for Rules 1–4 ---
  let metaReviewLastTime = {};        // { "memberId_bookId": lastValidTimestampMs }
  let shelfActionSeen = {};     // { "memberId_shelfId_type": true }
  let dailyProfileSeen = {};// { "memberId_dateString": true }
  let dailyStatusChanges = {}; // { "memberId_shelfId_dateString": [ {actId, points, timeMs} ] }

  // ── Helper: build a correction row ──────────────────────────────────────
  const buildCorrectionRow = (memberId, ptsToReverse, reason, targetActId) => {
    currentActNum++;
    return [
      "ARKA_ACT_" + currentActNum,
      "SYS_ACTTYP_CLUBPOINTS_CORRECTION",
      activityDate,
      memberId,
      `${reason}; ${targetActId}`,
      MASTERSYNC_SOURCE,
      -Math.abs(ptsToReverse)
    ];
  };

  // ── PASS 1: collect already-corrected IDs to prevent double-penalisation ─
  for (let i = 1; i < activityData.length; i++) {
    if (activityData[i][1] === "SYS_ACTTYP_CLUBPOINTS_CORRECTION") {
      let desc = activityData[i][4] || ""; // Assuming LogDescriptionFormat is in Col E
      let matches = desc.match(/ARKA_ACT_\d+/g);
      if (matches) {
        matches.forEach(id => correctedActIds.add(id));
      }
    }
  }

  // ── PASS 2: scan every non-header row for rule violations ─────────────────
  for (let i = 1; i < activityData.length; i++) {
    const actId   = (activityData[i][0] || "").toString();
    const type    = (activityData[i][1] || "").toString();
    const source  = (activityData[i][5] || "").toString().trim();
    const points  = Number(activityData[i][6]) || 0;
    const memberId = (activityData[i][3] || "").toString();
    
    // Skip system-generated rows (MasterSync writes, corrections, update markers)
    if (source === MASTERSYNC_SOURCE) continue;
    // Skip if this activity was already offset by a previous correction
    if (correctedActIds.has(actId)) continue;
    // Skip non-point-awarding logs or system logs
    if (points <= 0 || !memberId) continue; 

    const dateObj = new Date(activityData[i][2]);
    const dateStr = dateObj.toDateString();
    const timeMs  = dateObj.getTime();
    const refId   = (activityData[i][4] || "").toString(); // BookID or ShelfRecordID

    // ── Rule 1: Book metadata update — once per book per 30 days ───────────
    if (type === AUDIT_TYPES.META_REVIEW) {
      const key = `${memberId}_${refId}`;
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      if (
        metaReviewLastTime[key] !== undefined &&
        timeMs - metaReviewLastTime[key] < thirtyDaysMs
      ) {
        corrections.push(buildCorrectionRow(
          memberId, points,
          "Book metadata update within 30-day cooldown window",
          actId
        ));
      } else {
        metaReviewLastTime[key] = timeMs;
      }
    }

    // ── Rule 2: Rating / Review — once per shelf record per action type ─────
    if (type === AUDIT_TYPES.RATING || type === AUDIT_TYPES.REVIEW) {
      const key = `${memberId}_${refId}_${type}`;
      if (shelfActionSeen[key]) {
        corrections.push(buildCorrectionRow(
          memberId, points,
          "Duplicate rating or review for the same shelf record",
          actId
        ));
      } else {
        shelfActionSeen[key] = true;
      }
    }

    // ── Rule 3: Profile update — one point-earning update per day ───────────
    if (type === AUDIT_TYPES.PROFILE_UPDATE) {
      const key = `${memberId}_${dateStr}`;
      if (dailyProfileSeen[key]) {
        corrections.push(buildCorrectionRow(
          memberId, points,
          "Multiple profile updates in one day",
          actId
        ));
      } else {
        dailyProfileSeen[key] = true;
      }
    }

    // ── Rule 4 (setup): Reading status changes — collect for post-loop eval ─
    if (AUDIT_TYPES.STATUS_CHANGES.includes(type)) {
      const key = `${memberId}_${refId}_${dateStr}`;
      if (!dailyStatusChanges[key]) dailyStatusChanges[key] = [];
      dailyStatusChanges[key].push({ actId, points, timeMs });
    }

    // ── Rule 5: cpAwarded must not exceed what ActivityTypeDB currently allows ─
    // Only applied to entries that were written AFTER the last MasterSync run.
    // Entries at or before lastMasterSyncIdx were verified by a prior run —
    // re-checking them would risk penalising entries that were legitimately
    // written under different (but valid-at-the-time) point values.
    if (i > lastMasterSyncIdx) {
      // For activity types not present in ActivityTypeDB (unknown types),
      // we pass through without correction — this covers new types added
      // to the app before the DB is updated.
      if (multiplierMap[type] !== undefined) {
        // The app caps at MAX_CP_PER_ACTION before writing, so we apply the
        // same cap here. An entry equal to MAX_CP_PER_ACTION is always valid
        // even if the raw DB multiplier is higher.
        const expectedCp = Math.min(multiplierMap[type], MAX_CP_PER_ACTION);

        if (points > expectedCp) {
          const excessPoints = points - expectedCp;
          corrections.push(buildCorrectionRow(
            memberId, excessPoints,
            `cpAwarded (${points}) exceeds authorised value (${expectedCp}) for type ${type}`,
            actId
          ));
        }
      }
    }
  }

  // ── PASS 3: Rule 4 evaluation — keep only the last status change per day ──
  for (const key in dailyStatusChanges) {
    const changes = dailyStatusChanges[key];
    if (changes.length <= 1) continue;

    // Sort chronologically: the last change is the one that counts
    changes.sort((a, b) => a.timeMs - b.timeMs);

    // Extract memberId from the composite key (format: memberId_refId_dateStr)
    // memberId is always ARKA_MEMBER_X so splitting on first _ runs of 3 parts
    const memberId = key.split('_').slice(0, 3).join('_');

    // Reverse all but the final change
    for (let j = 0; j < changes.length - 1; j++) {
      corrections.push(buildCorrectionRow(
        memberId, changes[j].points,
        "Multiple reading-status changes for same book on same day — only last counts",
        changes[j].actId
      ));
    }
  }

  return { newCorrectionLogs: corrections, nextActNum: currentActNum };
}

// ============================================================================
// CORE SYNC FUNCTION
// ============================================================================

/**
 * Core execution engine. Locks the database, loads all sheet data, runs the audit,
 * applies corrections, calculates true totals, and batch-writes back to Google Sheets.
 */
function syncAllMemberStats() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.error("Database busy. Aborting sync to prevent data collisions.");
    return;
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. LOAD ALL DATA INTO MEMORY
    const memSheet = ss.getSheetByName(MEMBERS_SHEET_NAME);
    const memData = memSheet.getDataRange().getValues();
    
    const activityData = ss.getSheetByName("ActivityLogDB").getDataRange().getValues();
    const pageLogData = ss.getSheetByName("PageLogDB").getDataRange().getValues();
    const shelfData = ss.getSheetByName("MemberShelfDB").getDataRange().getValues();
    const levelData = ss.getSheetByName("ClubPointLevelDB").getDataRange().getValues();
    
    // Build level rules
    const levelRules = [];
    for (let i = 1; i < levelData.length; i++) {
      if (levelData[i][0] !== "") {
        levelRules.push({
          maxClubPoints: Number(levelData[i][1]) || 0,
          levelName:     levelData[i][2] || "Reader"
        });
      }
    }

    // Build multiplier map from ActivityTypeDB for Rule 5
    const actTypeData     = ss.getSheetByName("ActivityTypeDB").getDataRange().getValues();
    const multiplierMap   = {};
    for (let i = 1; i < actTypeData.length; i++) {
      if (actTypeData[i][0]) {
        multiplierMap[actTypeData[i][0]] = Number(actTypeData[i][4]) || 0;
      }
    }

    // Find the last MasterSync row — entries after this index get Rule 5 applied
    const lastMasterSyncIdx = findLastMasterSyncRowIndex(activityData);

    // Determine next activity ID number from the last row of the log
    let newActNum = 1;
    if (activityData.length > 1) {
      const lastId  = (activityData[activityData.length - 1][0] || "").toString();
      const lastNum = parseInt(lastId.split('_')[2]);
      if (!isNaN(lastNum)) newActNum = lastNum;
    }

    const activityDate = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z"
    );

    // ── 2. RUN AUDIT AND GENERATE CORRECTIONS ─────────────────────────────
    const { newCorrectionLogs, nextActNum } = generateCorrections(
      activityData,
      activityDate,
      newActNum,
      multiplierMap,
      lastMasterSyncIdx
    );
    newActNum = nextActNum;

    // ── 3. ABSOLUTE CALCULATION ENGINE ────────────────────────────────────
    const calculatedPointsMap = {}; // { memberId: totalPoints }
    const calculatedPagesMap  = {}; // { memberId: totalPages }
    const calculatedBooksMap  = {}; // { memberId: Set<bookId> }

    // A. Sum all awarded points from the full activity log
    for (let i = 1; i < activityData.length; i++) {
      const type     = (activityData[i][1] || "").toString();
      const memberId = (activityData[i][3] || "").toString();
      const points   = Number(activityData[i][6]) || 0;

      // Exclude the internal update-marker type (those rows carry 0 points but be explicit)
      if (memberId && type !== "SYS_ACTTYP_CLUBPOINTS_UPDATE") {
        calculatedPointsMap[memberId] = (calculatedPointsMap[memberId] || 0) + points;
      }
    }

    // Apply the in-memory corrections immediately so the final tally is accurate
    newCorrectionLogs.forEach(row => {
      const memberId = (row[3] || "").toString();
      const pts      = Number(row[6]) || 0; // Already negative
      calculatedPointsMap[memberId] = (calculatedPointsMap[memberId] || 0) + pts;
    });

    // B. Sum total pages from PageLogDB
    for (let i = 1; i < pageLogData.length; i++) {
      const memberId   = (pageLogData[i][2] || "").toString();
      const pagesDelta = Number(pageLogData[i][4]) || 0;
      if (memberId) {
        calculatedPagesMap[memberId] = (calculatedPagesMap[memberId] || 0) + pagesDelta;
      }
    }

    // C. Count unique finished books from MemberShelfDB
    for (let i = 1; i < shelfData.length; i++) {
      const memberId = (shelfData[i][1] || "").toString();
      const bookId   = (shelfData[i][2] || "").toString();
      const status   = (shelfData[i][3] || "").toString();
      if (memberId && status === "Finished") {
        if (!calculatedBooksMap[memberId]) calculatedBooksMap[memberId] = new Set();
        calculatedBooksMap[memberId].add(bookId);
      }
    }

    // ── 4. FIND DELTAS AND PREPARE BATCH UPDATES ──────────────────────────
    let changesMade = false;
    const finalActivityLogsToPush = [...newCorrectionLogs];

    for (let i = 1; i < memData.length; i++) {
      const memberId     = (memData[i][0] || "").toString();
      const currentPoints = Number(memData[i][14]) || 0;
      const currentPages  = Number(memData[i][15]) || 0;
      const currentBooks  = Number(memData[i][16]) || 0;

      if (!memberId) continue;

      let truePoints = calculatedPointsMap[memberId] || 0;
      const truePages  = calculatedPagesMap[memberId]  || 0;
      const trueBooks  = calculatedBooksMap[memberId]
        ? calculatedBooksMap[memberId].size
        : 0;

      let pendingBonusPoints = 0;

      // ── Page milestone check ───────────────────────────────────────────
      PAGE_MILESTONES.forEach(milestone => {
        if (currentPages < milestone.threshold && truePages >= milestone.threshold) {
          newActNum++;
          finalActivityLogsToPush.push([
            "ARKA_ACT_" + newActNum,
            "ARKA_ACTTYP_MILESTONE_PAGES",
            activityDate,
            memberId,
            milestone.threshold.toString(),
            MASTERSYNC_SOURCE,
            milestone.points
          ]);
          pendingBonusPoints += milestone.points;
        }
      });

      // ── Book milestone check ───────────────────────────────────────────
      BOOK_MILESTONES.forEach(milestone => {
        if (currentBooks < milestone.threshold && trueBooks >= milestone.threshold) {
          newActNum++;
          finalActivityLogsToPush.push([
            "ARKA_ACT_" + newActNum,
            "ARKA_ACTTYP_MILESTONE_BOOKS",
            activityDate,
            memberId,
            milestone.threshold.toString(),
            MASTERSYNC_SOURCE,
            milestone.points
          ]);
          pendingBonusPoints += milestone.points;
        }
      });

      // Milestone bonuses feed into the final point total
      truePoints += pendingBonusPoints;

      // ── Sync club points ───────────────────────────────────────────────
      if (truePoints !== currentPoints) {
        //console.log(`Member ${memberId}: calculatedPoints=${truePoints}, MemberDB shows=${currentPoints}, pages=${truePages}, books=${trueBooks}`);
        const delta = truePoints - currentPoints;
        newActNum++;
        finalActivityLogsToPush.push([
          "ARKA_ACT_" + newActNum,
          "SYS_ACTTYP_CLUBPOINTS_UPDATE",
          activityDate,
          memberId,
          `${delta > 0 ? '+' : ''}${delta} points synced to profile.`,
          MASTERSYNC_SOURCE,
          0
        ]);

        // Level-up check
        const oldLevel = getLevelName(currentPoints, levelRules);
        const newLevel = getLevelName(truePoints, levelRules);
        if (oldLevel !== newLevel) {
          newActNum++;
          finalActivityLogsToPush.push([
            "ARKA_ACT_" + newActNum,
            "ARKA_ACTTYP_MEMBERLEVELUP",
            activityDate,
            memberId,
            `Previous Level: ${oldLevel} | New Level: ${newLevel}`,
            MASTERSYNC_SOURCE,
            0
          ]);
        }

        memData[i][14] = truePoints;
        changesMade = true;
      }

      // ── Sync total pages ───────────────────────────────────────────────
      if (truePages !== currentPages) {
        const delta = truePages - currentPages;
        if (delta > 0) {
          newActNum++;
          finalActivityLogsToPush.push([
            "ARKA_ACT_" + newActNum,
            "SYS_ACTTYP_TOTALPAGES_UPDATE",
            activityDate,
            memberId,
            `${delta} pages synced to profile.`,
            MASTERSYNC_SOURCE,
            0
          ]);
        }
        memData[i][15] = truePages;
        changesMade = true;
      }

      // ── Sync total books ───────────────────────────────────────────────
      if (trueBooks !== currentBooks) {
        const delta = trueBooks - currentBooks;
        if (delta > 0) {
          newActNum++;
          finalActivityLogsToPush.push([
            "ARKA_ACT_" + newActNum,
            "SYS_ACTTYP_TOTALBOOKS_UPDATE",
            activityDate,
            memberId,
            `${delta} books synced to profile.`,
            MASTERSYNC_SOURCE,
            0
          ]);
        }
        memData[i][16] = trueBooks;
        changesMade = true;
      }
    }

    // ── 5. BATCH WRITE BACK TO GOOGLE SHEETS ──────────────────────────────
    if (changesMade || finalActivityLogsToPush.length > 0) {

      if (changesMade) {
        memSheet.getRange(1, 1, memData.length, memData[0].length).setValues(memData);
      }

      if (finalActivityLogsToPush.length > 0) {
        const startRow = activityData.length + 1;
        ss.getSheetByName("ActivityLogDB").getRange(
          startRow, 1,
          finalActivityLogsToPush.length,
          finalActivityLogsToPush[0].length
        ).setValues(finalActivityLogsToPush);
      }

      console.log(
        `Sync complete. Changes written to MemberDB: ${changesMade}. ` +
        `New activity log rows: ${finalActivityLogsToPush.length}. ` +
        `Rule 5 boundary was row index ${lastMasterSyncIdx} ` +
        `(0 = first ever run, all entries verified).`
      );

    } else {
      console.log("Database is perfectly in sync. No actions required.");
    }

  } catch (error) {
    console.error("CRITICAL ERROR during sync: " + error.message);
  } finally {
    lock.releaseLock();
  }
}
