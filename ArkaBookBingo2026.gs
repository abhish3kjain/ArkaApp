/**
 * ============================================================================
 * ARKA READERS CLUB - BACKEND SYSTEM (Google Apps Script)
 * ============================================================================
 * This file acts as the "Server" for the app. It handles all the reading and 
 * writing to the Google Sheets database. The frontend HTML file calls these 
 * functions using `google.script.run`.
 */

/**
 * @typedef {Object} MemberRecord
 * @property {string} memberId - Unique ID: ARKA_MEMBER_X (Col A)
 * @property {string} email - Primary and Alternate Gmails (Col B)
 * @property {string} fullName - The "Signature" name (Col C)
 * @property {string} displayName - Primary handle/nickname (Col D)
 * @property {string} joinDate - Date user registered: dd-MMM-yyyy (Col E)
 * @property {string} country - User-provided location (Col F)
 * @property {string} shortBio - Personal introduction text (Col G)
 * @property {string} langSpoken - Languages and levels (Col H)
 * @property {string} linkedIn - Full URL to LinkedIn profile (Col I)
 * @property {string} goodreads - Full URL to Goodreads profile (Col J)
 * @property {string} favGenre - Preferred book categories (Col K)
 * @property {string} readingGoal - Personal reading goal (Col L)
 * @property {string} lastAccessed - Timestamp of last app open (Col M)
 * @property {string} badges - List of earned awards or "None" (Col N)
 * @property {number} totalClubPoints - Numeric sum of points (Col O)
 * @property {number} totalPages - Lifetime pages read (Col P)
 * @property {number} totalBooks - Lifetime books finished (Col Q)
 * @property {string} imageUrl - Direct link to Google Drive avatar (Col R)
 */

/**
 * @typedef {Object} LibraryRecord
 * @property {string} bookId - Unique ID: ARKA_BOOK_X (Col A)
 * @property {string} title - Formal name of the book (Col B)
 * @property {string} author - Writer's name (Col C)
 * @property {string} genre - Primary genre/category (Col D)
 * @property {number} pages - Total page count (Col E)
 * @property {string} addedBy - MemberID of person who added the book (Col F)
 * @property {string} addedDate - Simple date: dd-MMM-yyyy (Col G)
 * @property {string} lastModifiedDate - Timestamp of last info update (Col H)
 * @property {string} lastModifiedBy - MemberID of person who last edited (Col I)
 * @property {string} coverUrl - External link to book cover image (Col J)
 * @property {string} isbn13 - 13-digit standard book identifier (Col K)
 * @property {string|number} publishedDate - Year or date book was released (Col L)
 * @property {string} blurb - Short summary or description (Col M)
 */

/**
 * @typedef {Object} ShelfRecord
 * @property {string} shelfId - Unique ID: ARKA_SHELF_X (Col A)
 * @property {string} memberId - ARKA_MEMBER_X owning this shelf (Col B)
 * @property {string} bookId - ARKA_BOOK_X being tracked (Col C)
 * @property {string} status - To Read, Reading, Finished, or Did Not Finish (Col D)
 * @property {number} rating - Numeric rating from 1 to 5, 0 = Unrated (Col E)
 * @property {string} review - Text-based thoughts (Col F)
 * @property {string} dateAdded - When book was first put on shelf (Col G)
 * @property {string} dateUpdated - When status/pages were last changed (Col H)
 * @property {string} dateFinished - Date user finished the book (Col I)
 * @property {number} pagesRead - Current page number reached (Col J)
 * @property {string} lastModifiedOn - Full technical timestamp (Col K)
 */

/**
 * @typedef {Object} ActivityLogRecord
 * @property {string} activityId - Unique ID: ARKA_ACT_X (Col A)
 * @property {string} activityTypeId - Code for action, e.g., ARKA_ACTTYP_BOOKREAD (Col B)
 * @property {string} activityDate - Timestamp: dd-mm-yyyy hh:mm:ss Z (Col C)
 * @property {string} memberId - Who performed the action (Col D)
 * @property {string} description - Extra context like BookID or ShelfID (Col E)
 * @property {string} source - App version or external app name (Col F)
 * @property {number} cpAwarded - Points granted for this action (Col G)
 */

/**
 * @typedef {Object} BookPostRecord
 * @property {string} postId - Unique ID: ARKA_BOOKPOST_X (Col A)
 * @property {string} bookId - ARKA_BOOK_X being discussed (Col B)
 * @property {string} memberId - ARKA_MEMBER_X of the post author (Col C)
 * @property {string} timestamp - Date and time of the post: dd-mm-yyyy hh:mm:ss Z (Col D)
 * @property {string} postType - Category of the post (e.g., 'General Note', 'Quote I Loved') (Col E)
 * @property {string} content - The actual text content of the post (Col F)
 * @property {string} status - Visibility status: 'Active' or 'Deleted' (Col G)
 * @property {number} likeCount - Numeric sum of likes received (Col H)
 */
 
/**
 * @typedef {Object} ChallengeRecord
 * @property {string}  challengeId     - Unique ID: ARKA_CHAL_X               (Col A)
 * @property {string}  challengeType   - HABIT_STREAK | BINGO_GRID | etc.     (Col B)
 * @property {string}  title           - Display name                          (Col C)
 * @property {string}  description     - What members need to do               (Col D)
 * @property {string}  startDate       - dd-MMM-yyyy                           (Col E)
 * @property {string}  endDate         - dd-MMM-yyyy or blank if open-ended    (Col F)
 * @property {number}  goalValue       - Primary numeric target                (Col G)
 * @property {string}  goalUnit        - pages | books | letters | countries   (Col H)
 * @property {string}  goalConfigJson  - Type-specific config as JSON string   (Col I)
 * @property {string}  status          - Active | Upcoming | Completed |       (Col J)
 *                                       Archived
 * @property {boolean} isCompetitive   - Show Club leaderboard tab?            (Col K)
 * @property {string}  seriesTag       - Groups editions e.g. BOOK_BINGO       (Col L)
 * @property {boolean} isPinned        - Pin to top of Challenges list         (Col M)
 * @property {string}  createdBy       - ARKA_MEMBER_X                         (Col N)
 * @property {string}  createdOn       - dd-MM-yyyy HH:mm:ss Z                 (Col O)
 */
 
/**
 * @typedef {Object} ChallengeEnrollmentRecord
 * @property {string} enrollmentId         - Unique ID: ARKA_ENRL_X           (Col A)
 * @property {string} challengeId          - ARKA_CHAL_X                      (Col B)
 * @property {string} memberId             - ARKA_MEMBER_X                    (Col C)
 * @property {string} enrolledOn           - dd-MM-yyyy HH:mm:ss Z            (Col D)
 * @property {string} enrollmentStatus     - Active | Winner | Finisher |     (Col E)
 *                                           Dropped
 * @property {number} currentProgressValue - Quick-read integer progress      (Col F)
 * @property {string} progressStateJson    - Full progress state as JSON str  (Col G)
 * @property {string} lastProgressUpdate   - dd-MM-yyyy HH:mm:ss Z            (Col H)
 * @property {string} completedOn          - dd-MM-yyyy HH:mm:ss Z or blank   (Col I)
 */

const APP_VERSION = "v38";
const SPREADSHEET_ID = '1qXsAAO_9aIEJuTTQ1ziX9s5plvm6WHaVI_zaKcSXF-4';
const MEMBERS_SHEET = "MemberDB";
const LIBRARY_SHEET = "ArkaLibraryDB";
const SHELF_SHEET = "MemberShelfDB";
const ACTIVITYLOG_SHEET = "ActivityLogDB";
const FEEDBACK_SHEET ="FeedbackDB";
const PAGELOG_SHEET = "PageLogDB";
const PROFILE_PICS_FOLDER_ID = '11n3v_TfITYYOCg-IQRFSrgqs89M0T1j8';
const BADGE_DB_SHEET = "BadgeDB";
const BADGE_AWARD_DB_SHEET = "BadgeAwardDB";
const ANNOUNCEMENT_SHEET = "AnnouncementDB";
const EVENT_SHEET           = "EventDB";
const EVENT_RSVP_SHEET      = "EventRSVPDB";
const CHALLENGE_SHEET            = "ChallengeDB";
const CHALLENGE_ENROLLMENT_SHEET = "ChallengeEnrollmentDB";
const BADGE_IMAGES_FOLDER_ID  = '1WLX0fy5RkuvMzpQwCkQjjSVlFTajxY59';
const EVENT_ASSETS_FOLDER_ID = '1R0-aaxcymLuemLRXK2E_E0sqYEQdFC37';
/**
 * Member IDs that have administrative privileges.
 * Update this array to add or remove admins.
 * Must be kept in sync with ADMIN_MEMBER_IDS on the frontend.
 * @type {string[]}
 */
const ADMIN_MEMBER_IDS_BACKEND = ['ARKA_MEMBER_1'];

/**
 * 1. Serve the HTML page
 * This is the entry point for any Google Apps Script Web App. 
 * When a user opens the URL, this function sends them the HTML file.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('ArkaClubApp')
      .setTitle('Arka Readers Club')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // Allows embedding if needed
      .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // Makes it mobile-responsive
}

/**
 * 2. Check if user exists on load
 * Runs immediately when the app opens to see if the logged-in Google account 
 * is already registered in the MemberDB.
 * @returns {Object} Status of the user ("exists" or "new") and their basic info.
 */

function initializeUser() {
  const email = Session.getActiveUser().getEmail(); // Get their Google email
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // Loop through all members (skipping the header row at index 0)
  for (let i = 1; i < data.length; i++) {
    let storedEmails = data[i][1].toString().split(','); // Column B: Emails (Primary, Alternate)
    
    // Check if the current user's email matches any stored emails
    if (storedEmails.map(e => e.trim()).includes(email)) {
      let row = i + 1; // +1 because sheet rows start at 1, array starts at 0
      let now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");
      
      // Update their 'LastAccessed' timestamp
      sheet.getRange(row, 13).setValue(now); 
      return { status: "exists", memberID: data[i][0], version: APP_VERSION };
    }
  }
  // If no match is found, they are a new user
  return { status: "new", email: email, version: APP_VERSION }; 
}

/**
 * 3. Register a new member
 * Takes data from the registration form and creates a new row in MemberDB.
 * @param {Object} formData - Contains the user's email and desired display name.
 * @returns {Object} Success or error message (e.g., if name is taken).
 */
function registerNewMember(formData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // --- Prevent Duplicate Display Names ---
  const desiredName = formData.displayName.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]).toLowerCase() === desiredName) {
      return { status: "error", message: "That Display Name is already taken. Please choose another one." };
    }
  }

  // --- Generate a Unique Member ID (e.g., ARKA_MEMBER_42) ---
  let newIdNum = 1;
  if (data.length > 1) {
    let lastIdString = data[data.length - 1][0]; 
    let lastNum = parseInt(lastIdString.split('_')[2]);
    if (!isNaN(lastNum)) newIdNum = lastNum + 1;
  }
  let memberId = "ARKA_MEMBER_" + newIdNum;

  // Setup standard dates
  let joinDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy");
  let lastAccessed = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");

  // Build the new row matching the exact spreadsheet columns
  const newRow = [
    memberId,
    formData.email,
    "",                     // FullName (Blank on reg)
    formData.displayName, 
    joinDate,
    "",                     // Country
    "",                     // ShortBio
    "",                     // LangSpoken
    "",                     // LinkedIn
    "",                     // Goodreads
    "",                     // FavGenre
    "",                     // ReadingGoal
    lastAccessed,
    "None",                 // Badges
    1,                      // TotalClubPoints 
    0,                      // TotalPages 
    0,                      // TotalBooks
    ""                      // Image URL
  ];
  
  sheet.appendRow(newRow); // Save to database

  // Log the registration activity silently
  try { logActivity(memberId, "ARKA_ACTTYP_PROFILENEW", 1); } catch(e) {}
  return { status: "success", id: memberId };
}

/**
 * 4. Update existing member profile
 * Saves changes made on the "Edit Profile" screen, handling text fields and image uploads.
 * @param {Object} formData - All updated profile fields, including base64 image data.
 * @returns {Object} Success status, new activity log, and updated image URL.
 */
function updateMemberProfile(formData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  const sessionEmail = Session.getActiveUser().getEmail().toLowerCase();

  let currentUserRowIndex = -1;
  let currentMemberId = "";

  // Step 1: Security check - find the user's exact row using their active Google session
  for (let i = 1; i < data.length; i++) {
    let storedEmails = data[i][1].toString().toLowerCase().split(',');
    if (storedEmails.map(e => e.trim()).includes(sessionEmail)) {
      currentUserRowIndex = i;
      currentMemberId = data[i][0]; // Col A: Member ID
      break;
    }
  }

  if (currentUserRowIndex === -1) {
    return { status: "error", message: "User not found. Your session may have expired." };
  }

  // Extract the new alternate email if the user provided one
  let newEmails = (formData.updatedEmails || "").toLowerCase().split(',').map(e => e.trim());
  let altEmail = newEmails.length > 1 ? newEmails[1] : null;

  // Step 2: Check if the new display name or alternate email is already taken by someone else
  const desiredName = (formData.displayName || "").toLowerCase().trim();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === currentMemberId) continue; // Skip the user's own record
    
    // Check Display Name
    let existingName = String(data[i][3]).toLowerCase().trim();
    if (existingName === desiredName) {
      return { status: "error", message: "That Display Name is already taken by another member." };
    }

    // Check Alternate Email
    if (altEmail) {
      let existingEmails = data[i][1].toString().toLowerCase().split(',').map(e => e.trim());
      if (existingEmails.includes(altEmail)) {
        return { status: "error", message: "That alternate email is already linked to another member's account." };
      }
    }
  }

  // Step 3: Handle Profile Image Upload to Google Drive
  let finalImageUrl = data[currentUserRowIndex][17] || ""; // Keep existing if no new one provided

  if (formData.newProfilePic) {
    const folder = DriveApp.getFolderById(PROFILE_PICS_FOLDER_ID);
    const fileName = currentMemberId + "_profilepic.jpg";
    
    // Delete the old picture to save Drive space
    const existingFiles = folder.getFilesByName(fileName);
    while (existingFiles.hasNext()) {
      existingFiles.next().setTrashed(true);
    }
    
    // Decode the base64 string from the frontend and save as an image file
    const imgData = formData.newProfilePic.split(',')[1];
    const blob = Utilities.newBlob(Utilities.base64Decode(imgData), 'image/jpeg', fileName);
    const newFile = folder.createFile(blob);
    
    // Generate Direct Link for the app to use and save to Column 18
    finalImageUrl = "https://drive.google.com/thumbnail?id=" + newFile.getId() + "&sz=w300";
    sheet.getRange(currentUserRowIndex + 1, 18).setValue(finalImageUrl);
  }

  // Step 4: Batch update all text columns at once for speed
  let row = currentUserRowIndex + 1;      //+1 to account for header
  // Update columns (Remember: Sheets are 1-indexed)
  const updatedValues = [[
    formData.updatedEmails,        // Col B
    formData.fullName || "",       // Col C
    formData.displayName,          // Col D
    data[currentUserRowIndex][4],  // Col E (JoinDate - Keep existing!)
    formData.country || "",        // Col F
    formData.shortBio || "",       // Col G
    formData.langSpoken || "",     // Col H
    formData.linkedin || "",       // Col I
    formData.goodreads || "",      // Col J
    formData.favGenre || "",       // Col K
    formData.readingGoal || "",    // Col L
  ]];
  
  // Single hit to the database instead of 10!
  sheet.getRange(row, 2, 1, 11).setValues(updatedValues);

  let newActivity = null;
  try { 
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_PROFILEUPDATE", 1, "", formData.activityPointsMap || {});
  } catch(e) {}
  
  return { status: "success", newActivity: newActivity, newImageURL: finalImageUrl }; 
}

/**
 * 5. Central Activity Logger
 * A universal function used by all other functions to log actions into the ActivityLogDB.
 * @param {string} memberId - The user performing the action.
 * @param {string} activityTypeID - The code for the action (e.g., ARKA_ACTTYP_BOOKADDED).
 * @param {number} activityValue - Usually 1, multiplied by the point value of the action.
 * @param {string} description - Optional extra details (like a Book ID or Shelf ID).
 * @returns {Object} The compiled log object (useful for returning to the frontend).
 */
function logActivity(memberId, activityTypeID, activityValue, description = "", clientPointsMap = {}) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const multiplier = getActivityMultiplier(activityTypeID, clientPointsMap, ss);
  const cpAwarded = activityValue * multiplier;
  
  // B: Generate sequential ID — 1 cell read instead of full table read
  const logSheet = ss.getSheetByName(ACTIVITYLOG_SHEET);
  const nextActNum = getNextActivityNumber(logSheet); // <-- USES HELPER
  const activityId = "ARKA_ACT_" + nextActNum;
  
  // C: Stamp and save
  const activityDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");
  
  const newRow = [
    activityId,
    activityTypeID,
    activityDate,
    memberId,      
    description,              
    "ArkaClubApp " + APP_VERSION,
    cpAwarded
  ];
  
  logSheet.appendRow(newRow);
  
  return {
    activityID: activityId,
    activityTypeID: activityTypeID,
    activityDate: activityDate,
    activityMemberID: memberId,
    activityDesc: description,
    activitySource: "ArkaClubApp " + APP_VERSION,
    activityCPAwarded: cpAwarded
  };
}

/**
 * 5A Central Activity Logger (Batch Optimized)
 * Logs one or multiple actions into the ActivityLogDB efficiently. 
 * Uses ScriptLocks to prevent ID duplication during concurrent user actions.
 * * @param {string} memberId - The user performing the action.
 * @param {Array<Object>|string} activityData - Either an array of activity objects or a single ActivityTypeID string.
 * @param {number} [activityValue=1] - Multiplier for points (used only if activityData is a string).
 * @param {string} [description=""] - Optional extra details (used only if activityData is a string).
 * @returns {Array<Object>} An array of the compiled log objects that were written.
 */
function logActivityBatch(memberId, activityData, activityValue = 1, description = "", clientPointsMap = {}) {
  const lock = LockService.getScriptLock();
  // Wait up to 5 seconds for other processes to finish writing
  if (!lock.tryLock(5000)) {
    console.error("System busy. Could not write activity log.");
    return [];
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // 2. Normalize input to an array so we can always batch process
    let pendingLogs = [];
    if (Array.isArray(activityData)) {
      pendingLogs = activityData; // Format expected: [{typeId: "...", val: 1, desc: "..."}, ...]
    } else {
      pendingLogs = [{ typeId: activityData, val: activityValue, desc: description }];
    }

    // 3. Get starting ID — 1 cell read instead of full table read
    const logSheet = ss.getSheetByName(ACTIVITYLOG_SHEET);
    let currentActNum = getNextActivityNumber(logSheet) - 1; // Subtract 1; loop increments it
    
    const activityDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");
    const rowsToWrite = [];
    const returnedLogs = [];

    // 4. Build the data grid in memory
    pendingLogs.forEach(log => {
      currentActNum++;
      let activityId = "ARKA_ACT_" + currentActNum;
      const multiplier = getActivityMultiplier(log.typeId, clientPointsMap, ss);
      const cpAwarded = (log.directCp !== undefined && log.directCp !== null)
        ? Number(log.directCp)
        : (log.val || 1) * multiplier;
      
      rowsToWrite.push([
        activityId,
        log.typeId,
        activityDate,
        memberId,      
        log.desc || "",              
        "ArkaClubApp " + APP_VERSION,
        cpAwarded
      ]);

      returnedLogs.push({
        activityID: activityId,
        activityTypeID: log.typeId,
        activityCPAwarded: cpAwarded
      });
    });

    // 5. Fire one single write command to the database
    if (rowsToWrite.length > 0) {
      const appendStartRow = logSheet.getLastRow() + 1;
      logSheet.getRange(appendStartRow, 1, rowsToWrite.length, rowsToWrite[0].length).setValues(rowsToWrite);
    }

    return returnedLogs;

  } catch (error) {
    console.error("Failed to log activity: ", error);
    return [];
  } finally {
    lock.releaseLock();
  }
}

/**
 * 6. Fetch safe public data for the Member Directory
 * Returns a list of members, carefully omitting private info like email addresses.
 */
function getMembersList() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // Fetch leveling logic to determine titles
  let levelData = [];
  try { 
    const levelSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ClubPointLevelDB");
    levelData = levelSheet.getDataRange().getValues(); 
  } catch(e) {}
  
  let publicMembers = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][3]) { 
      let userClubPoints = Number(data[i][14]) || 0; 
      let levelName = "Reader"; 

      // Calculate their rank
      if (levelData.length > 0) {
        for (let j = 1; j < levelData.length; j++) {
          levelName = levelData[j][2]; 
          let maxPoints = Number(levelData[j][1]); 
          if (userClubPoints <= maxPoints) break;
        }
      }

      let joinDate = data[i][4] ? new Date(data[i][4]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : "Unknown";

      publicMembers.push({
        id: data[i][0],
        displayName: data[i][3],
        levelName: levelName,
        pages: data[i][15] || 0,
        books: data[i][16] || 0,
        joinDate: joinDate,
        country: data[i][5] || "",
        bio: data[i][6] || "No bio added yet.",
        langs: data[i][7] || "Unknown",
        linkedin: data[i][8] || "",
        goodreads: data[i][9] || "",
        genres: data[i][10] || "None listed.",
        goal: data[i][11] || "None set."
      });
    }
  }
  
  publicMembers.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return publicMembers;
}


/**
 * 7. Fetch all books from the Library
 */
function getLibraryCatalog() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(LIBRARY_SHEET);
  const data = sheet.getDataRange().getValues();
  
  let catalog = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { 
      catalog.push({
        id: data[i][0],
        title: data[i][1],
        author: data[i][2],
        genre: data[i][3] || "Uncategorized",
        pages: data[i][4] || 0,
        addedBy: data[i][5],
        coverUrl: data[i][9] || "" 
      });
    }
  }
  
  catalog.sort((a, b) => a.title.localeCompare(b.title));
  return catalog;
}

/**
 * 8. Add a new book to the Arka Library
 * @param {Object} bookData - Title, author, genre, pages, coverUrl
 */
function addBookToLibrary(bookData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(LIBRARY_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // Security Check: Ensure the user is who they say they are
  const currentMemberId = getVerifiedMemberId(); 
  if (!currentMemberId) return { status: "error", message: "Unauthorized session." };

 // Failsafe: Fuzzy match to prevent adding "The Hobbit" if "Hobbit, The" exists
  const normalizedNewTitle = normalizeTitleInternal(bookData.title);
  
  for (let i = 1; i < data.length; i++) {
    const existingTitle = data[i][1]; // Column B
    if (normalizeTitleInternal(existingTitle) === normalizedNewTitle) {
      return { 
        status: "error", 
        message: "Duplicate Alert! '" + existingTitle + "' is already in the library." 
      };
    }
  }

  // Generate ID and Dates
  let newBookNum = 1;
  if (data.length > 1) {
    let lastIdString = data[data.length - 1][0]; 
    let lastNum = parseInt(lastIdString.split('_')[2]);
    if (!isNaN(lastNum)) newBookNum = lastNum + 1;
  }
  const newBookId = "ARKA_BOOK_" + newBookNum;

  const dateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy");
  const dateTimeFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");

  // Save Book
  const newRow = [
    newBookId, 
    bookData.title.trim(), 
    bookData.author.trim(), 
    bookData.genre.trim(), 
    Number(bookData.pages) || 0, 
    currentMemberId, 
    dateFormatted, 
    dateTimeFormatted, 
    currentMemberId, 
    bookData.coverUrl || ""
  ];
  sheet.appendRow(newRow);

  // LOG ACTIVITY
  let newActivity = null;
  try { 
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_BOOKADDED", 1, newBookId, bookData.activityPointsMap || {});
  } catch(e) {}

  return { 
    status: "success", 
    message: "Book added to Arka Library!", 
    bookId: newBookId,
    newActivity: newActivity 
  };
}

/**
 * 9 Updates or creates a member's reading shelf record for a specific book.
 * Incorporates LockService for concurrency safety and uses a batch queue for activity logging 
 * to minimize database write operations and optimize speed.
 * * @param {Object} shelfData - The payload containing shelf update details from the frontend.
 * @param {string} shelfData.memberId - The ID of the member making the update.
 * @param {string} shelfData.bookId - The ID of the book being updated.
 * @param {string} shelfData.status - The new reading status (e.g., "To Read", "Reading", "Finished").
 * @param {number|string} shelfData.pagesRead - Current pages read by the member.
 * @param {number|string} shelfData.totalBookPages - Total pages in the book.
 * @param {string} shelfData.rating - Star rating given to the book (0-5).
 * @param {string} shelfData.review - Text review written by the member.
 * @param {string} shelfData.isEditMode - Flag indicating if this is a historical edit ("true" or "false").
 * @param {string} shelfData.editRecordId - The exact ShelfRecordID if in edit mode.
 * @param {string} shelfData.manualDateFinished - Manual finish date string from the UI.
 * @returns {Object} A success or error response object to be returned to the frontend.
 */
function updateMemberShelf(shelfData) {
  const currentMemberId = shelfData.memberId;
  const totalBookPages = Number(shelfData.totalBookPages) || 0;
  const isEditMode = shelfData.isEditMode === 'true';
  const targetRecordId = shelfData.editRecordId;
  
  if (!currentMemberId) return { status: "error", message: "User not found." };
  // 1. ENGAGE THE DATABASE LOCK
  // Prevents concurrent writes from duplicating Shelf IDs or overlapping edits
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return { status: "error", message: "System is currently busy. Please try again." };
  }
  try{
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const shelfSheet = ss.getSheetByName(SHELF_SHEET);
    const now = new Date();
    const dateFormatted = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd-MMM-yyyy");
    const dateTimeFormatted = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");
    
    let finalStatus = shelfData.status || "To Read";
    let finalPagesRead = Number(shelfData.pagesRead) || 0;
    if (finalStatus === "Finished" && totalBookPages > 0) finalPagesRead = totalBookPages;

    // Format the Manual Date from the HTML5 picker (YYYY-MM-DD -> dd-MMM-yyyy)
    let finalDateFinished = "";
    if (finalStatus === "Finished" || finalStatus === "Did Not Finish") {
      if (shelfData.manualDateFinished) {
        // Append T12:00:00 so timezone shifts don't accidentally push it to the day before
        let d = new Date(shelfData.manualDateFinished + "T12:00:00"); 
        finalDateFinished = Utilities.formatDate(d, Session.getScriptTimeZone(), "dd-MMM-yyyy");
      } else {
        finalDateFinished = dateFormatted;
      }
    }

    const shelfDataRange = shelfSheet.getDataRange().getValues();
    let existingRowIndex = -1;
    let shelfRecordId = "";
    let previousStatus = "";
    let previousRating = 0;
    let previousReview = "";
    
    // Locate the exact row we need to interact with
    if (isEditMode && targetRecordId) {
      // Exact Match Search (Editing History)
      for (let i = 1; i < shelfDataRange.length; i++) {
        if (shelfDataRange[i][0] === targetRecordId) {
          existingRowIndex = i + 1;
          shelfRecordId = shelfDataRange[i][0];
          previousStatus = shelfDataRange[i][3];
          previousRating = Number(shelfDataRange[i][4]) || 0;
          previousReview = shelfDataRange[i][5] || "";
          break;
        }
      }
    } else {
      // Standard Search (Find latest active record backwards)
      for (let i = shelfDataRange.length - 1; i >= 1; i--) {
        if (shelfDataRange[i][1] === currentMemberId && shelfDataRange[i][2] === shelfData.bookId) {
          existingRowIndex = i + 1; 
          shelfRecordId = shelfDataRange[i][0];
          previousStatus = shelfDataRange[i][3];
          previousRating = Number(shelfDataRange[i][4]) || 0;
          previousReview = shelfDataRange[i][5] || "";
          break;
        }
      }
    }

    let newActivitiesQueue = [];

    /**
     * Helper to map shelf status to corresponding ActivityType ID.
     * @param {string} status - The new reading status.
     * @returns {string} The ActivityType ID.
     */
    function getStatusActivityType(status) {
      if (status === "To Read") return "ARKA_ACTTYP_BOOKTOREAD";
      if (status === "Reading") return "ARKA_ACTTYP_BOOKREADING";
      if (status === "Finished") return "ARKA_ACTTYP_BOOKREAD";
      if (status === "Did Not Finish") return "ARKA_ACTTYP_BOOKDNF";
      return "ARKA_ACTTYP_SHELFUPDATE";
    }

    // --- CASE 1: SURGICAL EDIT OF A PAST RECORD ---
    if (isEditMode && existingRowIndex > -1) {
      let originalDateAdded = shelfDataRange[existingRowIndex - 1][6];
      let originalDateUpdated = shelfDataRange[existingRowIndex - 1][7];
      
      // Write updates directly without changing the original creation dates
      const updatedValues = [[
        finalStatus, shelfData.rating || 0, shelfData.review || "", 
        originalDateAdded, originalDateUpdated, finalDateFinished, finalPagesRead, dateTimeFormatted
      ]];
      shelfSheet.getRange(existingRowIndex, 4, 1, 8).setValues(updatedValues);
      
      // Log rating/review changes if they fixed them
      if (Number(shelfData.rating) > 0 && Number(shelfData.rating) !== previousRating) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKRATING", val: 1, desc: shelfRecordId });
      } 
      if (shelfData.review && shelfData.review !== previousReview) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKREVIEW", val: 1, desc: shelfRecordId });
      }
    }
    // --- CASE 2: NORMAL PROGRESSION UPDATE (To Read -> Reading -> Finished) ---
    else if (!isEditMode && existingRowIndex > -1 && (previousStatus === "To Read" || previousStatus === "Reading")) {
      let originalDateAdded = shelfDataRange[existingRowIndex - 1][6];
      
      const updatedValues = [[
        finalStatus, shelfData.rating || 0, shelfData.review || "", 
        originalDateAdded, dateFormatted, finalDateFinished, finalPagesRead, dateTimeFormatted
      ]];
      shelfSheet.getRange(existingRowIndex, 4, 1, 8).setValues(updatedValues);
      
      if (finalStatus !== previousStatus) {
        newActivitiesQueue.push({ typeId: getStatusActivityType(finalStatus), val: 1, desc: shelfRecordId });
      }
      
      const previousPagesRead = Number(shelfDataRange[existingRowIndex - 1][9]) || 0;
      const pagesGained = finalPagesRead - previousPagesRead;
      if (pagesGained > 0 && finalStatus !== "Finished") {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_SHELFUPDATE", val: 1, desc: `${shelfRecordId}, Previous Pages: ${previousPagesRead}, Current: ${finalPagesRead}` });
      }

      if (Number(shelfData.rating) > 0 && Number(shelfData.rating) !== previousRating) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKRATING", val: 1, desc: shelfRecordId });
      } 
      if (shelfData.review && shelfData.review !== previousReview) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKREVIEW", val: 1, desc: shelfRecordId });
      }
    } 
    // --- CASE 3: BRAND NEW RECORD (Add to Shelf / Read Again) ---
    else {
      let newShelfNum = 1;
      if (shelfDataRange.length > 1) {
        let lastIdString = shelfDataRange[shelfDataRange.length - 1][0]; 
        let lastNum = parseInt(lastIdString.split('_')[2]);
        if (!isNaN(lastNum)) newShelfNum = lastNum + 1;
      }
      shelfRecordId = "ARKA_SHELF_" + newShelfNum;

      const newRow = [
        shelfRecordId, currentMemberId, shelfData.bookId, finalStatus, 
        shelfData.rating || 0, shelfData.review || "", dateFormatted, 
        dateFormatted, finalDateFinished, finalPagesRead, dateTimeFormatted
      ];
      
      shelfSheet.appendRow(newRow);
      
      newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKSHELVED", val: 1, desc: shelfRecordId });
      newActivitiesQueue.push({ typeId: getStatusActivityType(finalStatus), val: 1, desc: shelfRecordId });
      
      if (finalPagesRead > 0 && finalStatus !== "Finished") {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_SHELFUPDATE", val: 1, desc: `${shelfRecordId}, Current Pages Read: ${finalPagesRead}` });
      }
      if (Number(shelfData.rating) > 0) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKRATING", val: 1, desc: shelfRecordId });
      }
      if (shelfData.review) {
        newActivitiesQueue.push({ typeId: "ARKA_ACTTYP_BOOKREVIEW", val: 1, desc: shelfRecordId });
      }
    }

    // EXECUTE BATCH LOGGING
    // Process all accumulated activities in a single database operation
    let finalActivitiesLogged = [];
    if (newActivitiesQueue.length > 0) {
      finalActivitiesLogged = logActivityBatch(currentMemberId, newActivitiesQueue, 1, "", shelfData.activityPointsMap || {});
    }

    // COMPILE UI RESPONSE DATA
    // Find the exact dates to return to the frontend so the UI updates instantly
    let returnDateAdded = dateFormatted, returnDateUpdated = dateFormatted;
    if (existingRowIndex > -1) {
      let rawAdded = shelfDataRange[existingRowIndex - 1][6];
      let rawUpdated = isEditMode ? shelfDataRange[existingRowIndex - 1][7] : dateFormatted;
      
      // CRITICAL FIX: Convert Date objects to strings so GAS doesn't crash sending them to the frontend
      returnDateAdded = rawAdded instanceof Date ? Utilities.formatDate(rawAdded, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawAdded);
      returnDateUpdated = rawUpdated instanceof Date ? Utilities.formatDate(rawUpdated, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawUpdated);
    }

    return { 
      status: "success", 
      message: isEditMode ? "Past read updated! ✏️" : "Shelf updated! 📚", 
      newActivities: finalActivitiesLogged,
      updatedShelf: { 
          shelfId: shelfRecordId, memberId: currentMemberId, bookId: shelfData.bookId, 
          status: finalStatus, 
          rating: Number(shelfData.rating) || 0,  // FIX: Force it to be a pure number
          review: shelfData.review || "", 
          pagesRead: finalPagesRead, dateAdded: returnDateAdded, dateUpdated: returnDateUpdated,
          dateFinished: finalDateFinished, lastModifiedOn: dateTimeFormatted
        }
    };
  } catch (error) {
    console.error("Error in updateMemberShelf:", error);
    return { status: "error", message: "An error occurred while updating the shelf." };
  } finally {
    // ALWAYS release the lock so the system doesn't freeze for other users
    lock.releaseLock();
  }
}

/**
 * 10. Update an existing book in the Arka Library
 * Used when someone edits a typo in a book title or updates the page count.
 */
function updateLibraryBook(bookData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(LIBRARY_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const currentMemberId = getVerifiedMemberId(); // Secure, one-line lookup!
  if (!currentMemberId) return { status: "error", message: "User Not Found." };

  let existingRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookData.bookId) { 
      existingRowIndex = i + 1; 
      break;
    }
  }

  if (existingRowIndex === -1) {
    return { status: "error", message: "Book not found in the club library." };
  }

  const dateTimeFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");

  // Perform surgical updates only on provided fields
  if (bookData.title) sheet.getRange(existingRowIndex, 2).setValue(bookData.title.trim());       
  if (bookData.author) sheet.getRange(existingRowIndex, 3).setValue(bookData.author.trim());      
  if (bookData.genre) sheet.getRange(existingRowIndex, 4).setValue(bookData.genre.trim());        
  if (bookData.pages !== undefined) sheet.getRange(existingRowIndex, 5).setValue(Number(bookData.pages) || 0); 
  
  sheet.getRange(existingRowIndex, 8).setValue(dateTimeFormatted);                                
  sheet.getRange(existingRowIndex, 9).setValue(currentMemberId);                                  
  
  if (bookData.coverUrl !== undefined) sheet.getRange(existingRowIndex, 10).setValue(bookData.coverUrl.trim()); 

  // --- LOG THE ACTIVITY ---
  let newActivity = null;
  try { 
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_BOOKUPDATE", 1, bookData.bookId, bookData.activityPointsMap || {});
  } catch(e) {}
  
  return { 
    status: "success", 
    message: "Library book updated successfully!",
    newActivity: newActivity // Return this for local sync!
  };
}

/**
 * 11. Fetch full details for the Book View
 * Compiles a specific book's data along with all the community reviews and ratings.
 */
function getFullBookDetails(bookId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const libData = ss.getSheetByName("ArkaLibraryDB").getDataRange().getValues();
  let bookData = null;
  for (let i = 1; i < libData.length; i++) {
    if (libData[i][0] === bookId) {
      let rawDate = libData[i][6];
      let safeDateString = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate);

      bookData = {
        id: libData[i][0],
        title: libData[i][1],
        author: libData[i][2],
        genre: libData[i][3],
        pages: libData[i][4],
        addedByRaw: libData[i][5], 
        addedDate: safeDateString
      };
      break;
    }
  }
  if (!bookData) return { status: "error", message: "Book not found." };

  bookData.addedByName = bookData.addedByRaw; 
  const memData = ss.getSheetByName(MEMBERS_SHEET).getDataRange().getValues();
  
  if (String(bookData.addedByRaw).startsWith("ARKA_MEMBER_")) {
    for (let i = 1; i < memData.length; i++) {
      if (memData[i][0] === bookData.addedByRaw) {
        bookData.addedByName = memData[i][3]; 
        break;
      }
    }
  }

  // Aggregate Reviews and Stats
  const shelfData = ss.getSheetByName("MemberShelfDB").getDataRange().getValues();
  let totalRatingSum = 0;
  let ratingCount = 0;
  let reviewCount = 0;
  
  let clubActivity = {
    "Reading": [],
    "Finished": [],
    "To Read": []
  };

  for (let i = 1; i < shelfData.length; i++) {
    if (shelfData[i][2] === bookId) { 
      let memberId = shelfData[i][1];
      let status = shelfData[i][3];
      let rating = Number(shelfData[i][4]) || 0;
      let review = shelfData[i][5] || "";
      let pagesRead = shelfData[i][9] || 0;

      let displayName = "Unknown Reader";
      for (let m = 1; m < memData.length; m++) {
        if (memData[m][0] === memberId) {
          displayName = memData[m][3];
          break;
        }
      }

      if (rating > 0) {
        totalRatingSum += rating;
        ratingCount++;
      }
      if (review.trim().length > 0) {
        reviewCount++;
      }

      if (clubActivity[status]) {
        clubActivity[status].push({
          name: displayName,
          rating: rating,
          review: review,
          pagesRead: pagesRead
        });
      }
    }
  }

  bookData.avgRating = ratingCount > 0 ? (totalRatingSum / ratingCount).toFixed(1) : "0.0";
  bookData.totalRatings = ratingCount;
  bookData.totalReviews = reviewCount;
  bookData.activity = clubActivity;

  return { status: "success", data: bookData };
}

/**
 * 12. The "Big Gulp" - Fetch all app data in one single call
 * This is a highly optimized function! Instead of the app asking the server 
 * for books, then members, then activity (taking 5 seconds total), it grabs 
 * everything at once in about 1 second.
 * @returns {Object} A massive object containing arrays of all database tables.
 */
function getAppMasterData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Fetch the Level Rules 
  const levelSheet = ss.getSheetByName("ClubPointLevelDB");
  let levelList = [];
  if (levelSheet) {
    const levelData = levelSheet.getDataRange().getValues();
    for (let i = 1; i < levelData.length; i++) {
      if (levelData[i][0] !== "") { 
        levelList.push({
          levelNum: parseInt(levelData[i][0]) || 0, 
          maxClubPoints: parseInt(levelData[i][1]) || 0,    
          levelName: levelData[i][2] || "Reader"            
        });
      }
    }
  }

  // 2. Fetch Members
  const memSheet = ss.getSheetByName(MEMBERS_SHEET);
  const memData = memSheet.getDataRange().getValues();
  let membersList = [];
  
  for (let i = 1; i < memData.length; i++) {
    if (memData[i][0]) {     
      membersList.push({
        id: memData[i][0],
        email: memData[i][1] || "emailnotset@email.com",
        fullName : memData[i][2],
        displayName: memData[i][3],
        country: memData[i][5] || "",
        clubPoints: Number(memData[i][14]) || 0,
        pages: Number(memData[i][15]) || 0,
        books: Number(memData[i][16]) || 0,
        joinDate: memData[i][4] ? Utilities.formatDate(new Date(memData[i][4]), Session.getScriptTimeZone(), "dd-MMM-yyyy") : "Unknown",
        bio: memData[i][6] || "No bio added yet.",
        goal: memData[i][11] || "None set.",
        genres: memData[i][10] || "None listed.",
        langs: memData[i][7] || "Unknown",
        linkedin: memData[i][8] || "",
        goodreads: memData[i][9] || "",
        imageURL: memData[i][17] || ""
      });
    }
  }

  // 3. Fetch Library
  const libSheet = ss.getSheetByName("ArkaLibraryDB");
  const libData = libSheet.getDataRange().getValues();
  let libraryList = [];
  for (let i = 1; i < libData.length; i++) {
    if (libData[i][0]) {
      let rawDate = libData[i][6];
      let safeDateString = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate);
      
      libraryList.push({
        id: libData[i][0],
        title: libData[i][1],
        author: libData[i][2],
        genre: libData[i][3] || "Uncategorized",
        pages: libData[i][4] || 0,
        addedByRaw: libData[i][5],
        addedDate: safeDateString,
        lastModifiedDate: libData[i][7],
        lastModifiedBy: libData[i][8], // FIX: Changed duplicated key to lastModifiedBy
        coverImageURL: libData[i][9] || "",
        isbn13: libData[i][10] || "",             
        publishedDate: libData[i][11] || "",       
        blurb:  libData[i][12] || ""              
      });
    }
  }

  // 4. Fetch Shelves
  const shelfSheet = ss.getSheetByName("MemberShelfDB");
  const shelfData = shelfSheet.getDataRange().getValues();
  let shelvesList = [];
  for (let i = 1; i < shelfData.length; i++) {
    if (shelfData[i][0]) {
      let rawDate1 = shelfData[i][6];  
      let rawDate2 = shelfData[i][7];  
      let rawDate3 = shelfData[i][8];   

      let safeDateString1 = rawDate1 instanceof Date ? Utilities.formatDate(rawDate1, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate1);
      let safeDateString2 = rawDate2 instanceof Date ? Utilities.formatDate(rawDate2, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate2);
      let safeDateString3 = rawDate3 instanceof Date ? Utilities.formatDate(rawDate3, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate3);

      shelvesList.push({
        shelfId: shelfData[i][0],
        memberId: shelfData[i][1],
        bookId: shelfData[i][2],
        status: shelfData[i][3],
        rating: Number(shelfData[i][4]) || 0,
        review: shelfData[i][5] || "",
        pagesRead: shelfData[i][9] || 0,
        dateAdded: safeDateString1,
        dateUpdated: safeDateString2,
        dateFinished: safeDateString3,
        lastModifiedOn: shelfData[i][10]
      });
    }
  }

  // 5. Fetch Activity Type DB
  const activityTypeSheet = ss.getSheetByName("ActivityTypeDB");
  const activityTypeData = activityTypeSheet.getDataRange().getValues();
  let activityTypeList = [];
  for (let i = 1; i < activityTypeData.length; i++) {
    if (activityTypeData[i][0]) {
      let rawDate = activityTypeData[i][3];  
      let safeDateString = rawDate instanceof Date ? Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "dd-MMM-yyyy") : String(rawDate);

      activityTypeList.push({
        activityTypeID: activityTypeData[i][0],
        activityType: activityTypeData[i][1],
        activityDesc: activityTypeData[i][2] || "",
        activityIntroDate: safeDateString,
        activityClubPoints: Number(activityTypeData[i][4]) || 0        
      });
    }
  }

  // 6. Fetch Activity Log DB
  const activityLogSheet = ss.getSheetByName("ActivityLogDB");
  const activityLogTotalRows = activityLogSheet.getLastRow();
  const ACTIVITY_LOG_FETCH_LIMIT = 300; // Tune this number up if feed feels sparse

  // Calculate the starting row so we always grab the most recent N entries
  const activityLogStartRow = Math.max(2, activityLogTotalRows - ACTIVITY_LOG_FETCH_LIMIT + 1);
  const activityLogRowCount = activityLogTotalRows - activityLogStartRow + 1;

  let activityLogList = [];
  if (activityLogRowCount > 0) {
    // getRange(row, col, numRows, numCols) — reads only the slice, not the whole sheet
    const activityLogData = activityLogSheet.getRange(
      activityLogStartRow, 1, activityLogRowCount, 7
    ).getValues();
    
    for (let i = 0; i < activityLogData.length; i++) {
      if (activityLogData[i][0]) {
        activityLogList.push({
          activityID:       activityLogData[i][0],
          activityTypeID:   activityLogData[i][1],
          activityDate:     activityLogData[i][2],
          activityMemberID: activityLogData[i][3],
          activityDesc:     activityLogData[i][4] || "",
          activitySource:   activityLogData[i][5] || "",
          activityCPAwarded: Number(activityLogData[i][6]) || 0
        });
      }
    }
  }

  // 7. LOAD PAGE LOG DB ---
  const pageLogSheet = ss.getSheetByName("PageLogDB");
  const pageLogDB = [];
  if (pageLogSheet) {
    const pData = pageLogSheet.getDataRange().getValues();
    for (let i = 1; i < pData.length; i++) {
      if (pData[i][0]) {
        pageLogDB.push({
          logId: pData[i][0].toString(),
          timestamp: pData[i][1].toString(),
          memberId: pData[i][2].toString(),
          bookId: pData[i][3].toString(),
          pagesDelta: Number(pData[i][4]) || 0,
          logSource: pData[i][5].toString()
        });
      }
    }
  }

  // 8. Fetch BadgeDB
  const badgeSheet    = ss.getSheetByName(BADGE_DB_SHEET);
  let   badgesDBList  = [];
  if (badgeSheet) {
    const bData = badgeSheet.getDataRange().getValues();
    for (let i = 1; i < bData.length; i++) {
      if (!bData[i][0]) continue;
      badgesDBList.push({
        id:          bData[i][0].toString(),
        caption:     bData[i][1].toString(),
        description: bData[i][2].toString(),
        imgUrl:      bData[i][3].toString(),
        badgePoints: Number(bData[i][4]) || 0   // Col E
      });
    }
  }
 
  // 9. Fetch BadgeAwardDB — fetches ALL records; frontend filters to Active as needed
  const badgeAwardSheet    = ss.getSheetByName(BADGE_AWARD_DB_SHEET);
  let   badgeAwardsDBList  = [];
  if (badgeAwardSheet) {
    const baData = badgeAwardSheet.getDataRange().getValues();
    for (let i = 1; i < baData.length; i++) {
      if (!baData[i][0]) continue;
      let rawAwardDate   = baData[i][4];
      let safeAwardDate  = rawAwardDate instanceof Date
        ? Utilities.formatDate(rawAwardDate, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
        : String(rawAwardDate);
      badgeAwardsDBList.push({
        awardId:     baData[i][0].toString(),
        badgeId:     baData[i][1].toString(),
        memberId:    baData[i][2].toString(),
        awardedBy:   baData[i][3].toString(),
        awardedDate: safeAwardDate,
        status:      baData[i][5].toString(),
        notes:       baData[i][6] ? baData[i][6].toString() : ''
      });
    }
  }

  // 10. Fetch AnnouncementDB — only Active rows come down; Archived are excluded here.
  const announcementsDBList = fetchActiveAnnouncements(ss);

  // 11. Fetch ChallengeDB and ChallengeEnrollmentDB
  const challengesDBList           = fetchChallenges(ss);
  const challengeEnrollmentsDBList = fetchChallengeEnrollments(ss);

  return {
    status: "success",
    memberLevelsDB: levelList,
    membersDB: membersList,
    booksDB: libraryList,
    shelvesDB: shelvesList,
    activityTypeDB: activityTypeList,
    activityLogDB: activityLogList,
    pageLogDB: pageLogDB,
    badgesDB: badgesDBList,
    badgeAwardsDB: badgeAwardsDBList,
    announcementsDB: announcementsDBList,
    challengesDB           : challengesDBList,
    challengeEnrollmentsDB : challengeEnrollmentsDBList
  };

  


}

// Return latest APP Version as string
function getAppVersion() { return APP_VERSION; }

/**
 * Fetch a single random quote instantly
 * Used on the home screen to give users something cool to look at while the Big Gulp loads.
 */
function getRandomQuote() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("QuotesDB");
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return null; // Prevent errors if the sheet is empty

    // Pick a random row (skipping the header row at index 0)
    const randomIndex = Math.floor(Math.random() * (data.length - 1)) + 1;
    const row = data[randomIndex];

    return {
      quote: row[0], // Column A
      book: row[1],  // Column B
      author: row[2] // Column C
    };
  } catch (e) {
    return null; // Fail silently so it doesn't break the app
  }
}

/**
 * 13. Lightweight Activity Fetcher (For Multiplayer Sync)
 * When a user hits "Sync" on the Home Feed, it only fetches this small piece of data 
 * instead of the whole database to save time and processing power.
 */
function getLatestActivityLog() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ActivityLogDB");
  const SYNC_FETCH_LIMIT = 200; // Sync only needs recent entries
  
  const totalRows = sheet.getLastRow();
  if (totalRows < 2) return [];
  
  const startRow = Math.max(2, totalRows - SYNC_FETCH_LIMIT + 1);
  const rowCount = totalRows - startRow + 1;
  const data = sheet.getRange(startRow, 1, rowCount, 7).getValues();
  
  let logList = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i][0]) {
      logList.push({
        activityID:        data[i][0],
        activityTypeID:    data[i][1],
        activityDate:      data[i][2],
        activityMemberID:  data[i][3],
        activityDesc:      data[i][4] || "",
        activitySource:    data[i][5] || "",
        activityCPAwarded: Number(data[i][6]) || 0
      });
    }
  }
  return logList;
}

/**
 * PRIVATE HELPER: Validates the active session and returns the Member ID.
 * Uses CacheService so the sheet is only scanned once per 6-minute window,
 * not on every individual write operation within a session.
 * @returns {string|null} The ARKA_MEMBER_ID or null if not found.
 */
function getVerifiedMemberId() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  
  // 1. Check the cache first — avoids a sheet scan on repeat calls
  const cache = CacheService.getUserCache();
  const CACHE_KEY = "verified_member_id_" + email.replace(/[^a-z0-9]/g, "_");
  const cachedId = cache.get(CACHE_KEY);
  
  if (cachedId) {
    return cachedId; // Cache hit — no sheet read needed
  }
  
  // 2. Cache miss — do the full scan once
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const storedEmails = data[i][1].toString().toLowerCase().split(',');
    if (storedEmails.map(e => e.trim()).includes(email)) {
      const memberId = data[i][0];
      // Store for 6 minutes (360 seconds) — Google session is longer, this is conservative
      cache.put(CACHE_KEY, memberId, 360);
      return memberId;
    }
  }
  return null;
}

/**
 * PRIVATE HELPER: Normalizes a title for duplicate checking.
 * Strips punctuation and leading articles (The, A, An).
 */
function normalizeTitleInternal(title) {
  if (!title) return "";
  return title.toString().toLowerCase()
    .replace(/[^\w\s]/g, '')        // Strip punctuation
    .replace(/^(the|a|an)\s+/g, '') // Strip leading articles
    .replace(/\s+/g, ' ')           // Condense spaces
    .trim();
}

/**
 * Saves feedback to the sheet and generates a sequential Activity ID.
 * Increments the ID in the format ARKA_ACT_X based on the last entry.
 * * @param {Object} data - Feedback payload from frontend.
 * @returns {Object} Success status and the new activity object.
 */
function saveUserFeedback(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const feedbackSheet = ss.getSheetByName(FEEDBACK_SHEET);
    
    // Generate the standard Arka timestamp (dd-mm-yyyy hh:mm:ss Z)
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");

    // 1. Log the detailed feedback in FeedbackDB
    feedbackSheet.appendRow([
      timestamp, 
      data.memberId, 
      data.memberName, 
      "ArkaClubApp " + APP_VERSION, 
      data.category, 
      data.section, 
      data.description, 
      "Open"
    ]);

    // LOG ACTIVITY
    let newActivity = null;
    try { 
      newActivity = logActivity(data.memberId, "ARKA_ACTTYP_FEEDBACK", 1, `${data.category} in ${data.section}`, data.activityPointsMap || {});
    } catch(e) {
      console.error("Activity log failed but feedback was saved: " + e.toString());
    };
    
        
    // Return for instant UI update
    return { 
      status: "success", 
      newActivity: newActivity
    };
  } catch (e) {
    console.error("Feedback Save Error: " + e.toString());
    return { status: "error", message: e.toString() };
  }
}

/**
 * Fetches all Active posts for a specific book, sorted newest first.
 * @param {string} bookId - The ARKA_BOOK_X to fetch posts for.
 * @returns {Array} Array of post objects.
 */
function getBookPosts(bookId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("BookPostDB");
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  let posts = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    if (data[i][1].toString() !== bookId) continue;
    if (data[i][6].toString() !== "Active") continue;

    posts.push({
      postId:    data[i][0].toString(),
      bookId:    data[i][1].toString(),
      memberId:  data[i][2].toString(),
      timestamp: data[i][3].toString(),
      postType:  data[i][4].toString(),
      content:   data[i][5].toString(),
      status:    data[i][6].toString(),
      likeCount: Number(data[i][7]) || 0
    });
  }

  // Rows are appended in order — reversing gives newest first without sorting
  posts.reverse();
  return posts;
}

/**
 * Saves a new post to BookPostDB.
 * @param {Object} postData - {bookId, postType, content}
 * @returns {Object} {status, newPost}
 */
function saveBookPost(postData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("BookPostDB");
  if (!sheet) return { status: "error", message: "BookPostDB sheet not found." };

  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: "error", message: "Unauthorized." };

  const content = (postData.content || "").trim();
  if (!content || content.length < 3) {
    return { status: "error", message: "Post content is too short." };
  }

  // Generate sequential ID
  const data = sheet.getDataRange().getValues();
  let newNum = 1;
  if (data.length > 1) {
    const lastId = data[data.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const postId = "ARKA_BOOKPOST_" + newNum;
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");

  sheet.appendRow([
    postId,
    postData.bookId,
    currentMemberId,
    timestamp,
    postData.postType || "General Note",
    content,
    "Active",
    0
  ]);

  let newActivity = null;
  try {
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYPE_BOOKPOST", 1, postId, postData.activityPointsMap || {});
  } catch(e) {}

  return {
    status: "success",
    newActivity: newActivity,
    newPost: {
      postId:    postId,
      bookId:    postData.bookId,
      memberId:  currentMemberId,
      timestamp: timestamp,
      postType:  postData.postType || "General Note",
      content:   content,
      status:    "Active",
      likeCount: 0
    }
  };
}

/**
 * Increments the LikeCount for a specific post by 1.
 * Fire-and-forget — frontend does not wait for this response.
 * @param {string} postId - The ARKA_BOOKPOST_X to like.
 */
function incrementPostLike(postId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("BookPostDB");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === postId.toString()) {
      const current = Number(data[i][7]) || 0;
      sheet.getRange(i + 1, 8).setValue(current + 1);
      return;
    }
  }
}

/**
 * Edits the content of an existing book post.
 * Only the original author can edit their own post.
 * @param {Object} postData - {postId, newContent}
 */
function editBookPost(postData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("BookPostDB");
  if (!sheet) return { status: "error", message: "BookPostDB not found." };

  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: "error", message: "Unauthorized." };

  const newContent = (postData.newContent || "").trim();
  if (!newContent || newContent.length < 3) {
    return { status: "error", message: "Post content is too short." };
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== postData.postId.toString()) continue;

    // Security check — only the author can edit
    if (data[i][2].toString() !== currentMemberId) {
      return { status: "error", message: "You can only edit your own posts." };
    }

    sheet.getRange(i + 1, 6).setValue(newContent); // Col F: Content
    return { status: "success", updatedContent: newContent };
  }

  return { status: "error", message: "Post not found." };
}

/**
 * Soft-deletes a book post by setting its Status to "Deleted".
 * Only the original author can delete their own post.
 * @param {string} postId - The ARKA_BOOKPOST_X to delete.
 */
function deleteBookPost(postId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("BookPostDB");
  if (!sheet) return { status: "error", message: "BookPostDB not found." };

  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: "error", message: "Unauthorized." };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== postId.toString()) continue;

    if (data[i][2].toString() !== currentMemberId) {
      return { status: "error", message: "You can only delete your own posts." };
    }

    sheet.getRange(i + 1, 7).setValue("Deleted"); // Col G: Status
    return { status: "success" };
  }

  return { status: "error", message: "Post not found." };
}

/**
 * Helper: Gets the next sequential activity ID by reading only the last row's ID cell.
 * Saves reading the entire ActivityLogDB just to find the highest number.
 * @param {Sheet} logSheet - The ActivityLogDB sheet object.
 * @returns {number} The next activity number to use.
 */
function getNextActivityNumber(logSheet) {
  const lastRow = logSheet.getLastRow();
  if (lastRow < 2) return 1; // Sheet is empty (only header)
  
  // Read just the single ID cell from the last row — not the whole table
  const lastIdString = logSheet.getRange(lastRow, 1).getValue().toString();
  const lastNum = parseInt(lastIdString.split('_')[2]);
  return isNaN(lastNum) ? 1 : lastNum + 1;
}

/**
 * PRIVATE HELPER: Returns the cp multiplier for a given activity type.
 * Uses the client-provided map when available — no sheet read needed.
 * Falls back to a live ActivityTypeDB read for internal callers like
 * registerNewMember that have no frontend context to pass a map.
 * @param {string} activityTypeID
 * @param {Object} clientPointsMap - globalActivityPointsMap from frontend.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Only used on fallback.
 * @returns {number} The points multiplier value.
 */
function getActivityMultiplier(activityTypeID, clientPointsMap, ss) {
  if (clientPointsMap && clientPointsMap[activityTypeID] !== undefined) {
    return Number(clientPointsMap[activityTypeID]) || 0;
  }
  // Fallback: read the sheet (internal callers with no client map)
  const typeData = ss.getSheetByName("ActivityTypeDB").getDataRange().getValues();
  for (let i = 1; i < typeData.length; i++) {
    if (typeData[i][0] === activityTypeID) {
      return Number(typeData[i][4]) || 0;
    }
  }
  return 0;
}

/**
 * PRIVATE HELPER: Checks whether a given member ID has admin privileges.
 * Used as a security gate before every badge write operation.
 *
 * @param   {string}  memberId - The ARKA_MEMBER_X to check
 * @returns {boolean}
 */
function isAdminMember(memberId) {
  return ADMIN_MEMBER_IDS_BACKEND.includes(memberId);
}
 
 
/**
 * PRIVATE HELPER: Keeps the MemberDB Col N badge cache in sync.
 * Col N stores a comma-separated list of badge IDs a member holds,
 * purely as a fast display cache. The source of truth is BadgeAwardDB.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss       - Open spreadsheet instance
 * @param {string}                                    memberId - ARKA_MEMBER_X to update
 * @param {string}                                    badgeId  - ARKA_BADGE_X to add or remove
 * @param {'add'|'remove'}                            action
 */
function updateMemberBadgeCache(ss, memberId, badgeId, action) {
  const memberSheet = ss.getSheetByName(MEMBERS_SHEET);
  const data = memberSheet.getDataRange().getValues();
 
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== memberId) continue;
 
    const rawCache  = data[i][13].toString(); // Col N (0-indexed = 13)
    let badgeList   = (rawCache === 'None' || rawCache === '')
      ? []
      : rawCache.split(',').map(b => b.trim()).filter(b => b);
 
    if (action === 'add') {
      if (!badgeList.includes(badgeId)) badgeList.push(badgeId);
    } else if (action === 'remove') {
      badgeList = badgeList.filter(b => b !== badgeId);
    }
 
    const newCache = badgeList.length > 0 ? badgeList.join(', ') : 'None';
    memberSheet.getRange(i + 1, 14).setValue(newCache); // Col N is the 14th column
    return;
  }
}
 
 
/**
 * ADMIN ONLY: Creates a new badge entry in BadgeDB and uploads the badge image
 * to the dedicated badge images Google Drive folder.
 *
 * @param   {Object} badgeData
 * @param   {string} badgeData.caption      - Short display name for the badge
 * @param   {string} badgeData.description  - Full description of what this badge represents
 * @param   {string} badgeData.imageBase64  - Base64 data URI (image/jpeg) from the frontend canvas
 * @returns {Object} { status, newBadge } | { status: 'error', message }
 */
function addNewBadge(badgeData) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)              return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  if (!badgeData.caption || !badgeData.caption.trim()) {
    return { status: 'error', message: 'Badge caption cannot be empty.' };
  }
  if (!badgeData.imageBase64) {
    return { status: 'error', message: 'Badge image is required.' };
  }
 
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(BADGE_DB_SHEET);
  const data  = sheet.getDataRange().getValues();
 
  // Generate sequential ARKA_BADGE_X ID from the last row
  let newNum = 1;
  if (data.length > 1) {
    const lastId  = data[data.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const badgeId = 'ARKA_BADGE_' + newNum;
 
  // Upload badge image to Drive — replace any previous file with the same name
  const folder   = DriveApp.getFolderById(BADGE_IMAGES_FOLDER_ID);
  const fileName = badgeId + '_badge.jpg';
 
  const existingFiles = folder.getFilesByName(fileName);
  while (existingFiles.hasNext()) existingFiles.next().setTrashed(true);
 
  const rawBase64 = badgeData.imageBase64.split(',')[1];
  const blob      = Utilities.newBlob(Utilities.base64Decode(rawBase64), 'image/jpeg', fileName);
  const newFile   = folder.createFile(blob);
 
  // Store at w400 — frontend swaps the sz parameter for smaller sizes at render time
  const badgeImgUrl = 'https://drive.google.com/thumbnail?id=' + newFile.getId() + '&sz=w400';
 
  const badgePoints = Number(badgeData.badgePoints) || 0;
  sheet.appendRow([badgeId, badgeData.caption.trim(), badgeData.description.trim(), badgeImgUrl, badgePoints]);
 
  return {
    status: 'success',
    newBadge: {
      id:          badgeId,
      caption:     badgeData.caption.trim(),
      description: badgeData.description.trim(),
      imgUrl:      badgeImgUrl,
      badgePoints: badgePoints
    }
  };
}
 
 
/**
 * ADMIN ONLY: Awards a badge to a specific member.
 * Writes a new row to BadgeAwardDB and updates the MemberDB Col N badge cache.
 * Prevents awarding the same badge to the same member twice (if already Active).
 *
 * @param   {Object} awardData
 * @param   {string} awardData.badgeId  - ARKA_BADGE_X to award
 * @param   {string} awardData.memberId - ARKA_MEMBER_X receiving the badge
 * @param   {string} [awardData.notes]  - Optional admin note
 * @returns {Object} { status, newAward } | { status: 'error', message }
 */
function awardBadgeToMember(awardData) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)              return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
  if (!awardData.badgeId || !awardData.memberId) {
    return { status: 'error', message: 'Badge ID and Member ID are both required.' };
  }
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const awardSheet = ss.getSheetByName(BADGE_AWARD_DB_SHEET);
  const existingAwards = awardSheet.getDataRange().getValues();
 
  // Duplicate guard — prevent awarding the same active badge to the same member twice
  for (let i = 1; i < existingAwards.length; i++) {
    if (existingAwards[i][1] === awardData.badgeId &&
        existingAwards[i][2] === awardData.memberId &&
        existingAwards[i][5] === 'Active') {
      return { status: 'error', message: 'This member already holds this badge.' };
    }
  }
 
  // Generate sequential ARKA_AWARD_X ID
  let newNum = 1;
  if (existingAwards.length > 1) {
    const lastId  = existingAwards[existingAwards.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const awardId      = 'ARKA_AWARD_' + newNum;
  const dateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy');
 
  awardSheet.appendRow([
    awardId,
    awardData.badgeId,
    awardData.memberId,
    currentMemberId,       // Col D: who awarded it
    dateFormatted,         // Col E: award date
    'Active',              // Col F: status
    awardData.notes || ''  // Col G: optional admin note
  ]);
 
  // Keep MemberDB Col N cache in sync so the member card shows the badge count
  updateMemberBadgeCache(ss, awardData.memberId, awardData.badgeId, 'add');
  
  // Look up how many points this badge is worth from BadgeDB col E
  // activityValue = badgePoints, multiplier in ActivityTypeDB = 1,
  // so cpAwarded = badgePoints exactly — same pattern as page reads.
  const badgeSheetForPoints = ss.getSheetByName(BADGE_DB_SHEET);
  const badgeRows = badgeSheetForPoints.getDataRange().getValues();
  let badgePointsForActivity = 0;
  for (let i = 1; i < badgeRows.length; i++) {
    if (badgeRows[i][0].toString() === awardData.badgeId) {
      badgePointsForActivity = Number(badgeRows[i][4]) || 0; // Col E: badgePoints
      break;
    }
  }
 
  // Log the badge award activity — description holds the AwardID for traceability
  try {
    logActivity(awardData.memberId, 'ARKA_ACTTYP_BADGEAWARD', badgePointsForActivity, awardId);
  } catch(e) {
    console.error('Badge activity log failed but award was saved: ' + e.toString());
  }

  return {
    status: 'success',
    newAward: {
      awardId:     awardId,
      badgeId:     awardData.badgeId,
      memberId:    awardData.memberId,
      awardedBy:   currentMemberId,
      awardedDate: dateFormatted,
      status:      'Active',
      notes:       awardData.notes || ''
    }
  };
}
 
 
/**
 * ADMIN ONLY: Revokes an existing badge award by setting its status to 'Revoked'.
 * Also removes the badge from the MemberDB Col N cache so the member card
 * updates immediately without requiring a full app reload.
 *
 * @param   {string} awardId - ARKA_AWARD_X to revoke
 * @returns {Object} { status } | { status: 'error', message }
 */
function revokeBadgeAward(awardId) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)              return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const awardSheet = ss.getSheetByName(BADGE_AWARD_DB_SHEET);
  const data       = awardSheet.getDataRange().getValues();
 
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== awardId.toString()) continue;
 
    awardSheet.getRange(i + 1, 6).setValue('Revoked');
    updateMemberBadgeCache(ss, data[i][2], data[i][1], 'remove');

    // Look up badge points to reverse — same lookup as awardBadgeToMember
    const badgeSheetForPoints = ss.getSheetByName(BADGE_DB_SHEET);
    const badgeRows = badgeSheetForPoints.getDataRange().getValues();
    let badgePointsToReverse = 0;
    for (let j = 1; j < badgeRows.length; j++) {
      if (badgeRows[j][0].toString() === data[i][1].toString()) {
        badgePointsToReverse = Number(badgeRows[j][4]) || 0;
        break;
      }
    }

    // activityValue = badgePoints, multiplier in ActivityTypeDB = -1
    // so cpAwarded = badgePoints × -1 = deduction
    try {
      logActivity(data[i][2], 'ARKA_ACTTYP_BADGEREVOKE', badgePointsToReverse, awardId);
    } catch(e) {
      console.error('Revoke activity log failed but revocation was saved: ' + e.toString());
    }

    return { status: 'success' };
  }
 
  return { status: 'error', message: 'Award record not found.' };
}

// ============================================================================
// PRIVATE HELPER
// ============================================================================
 
/**
 * @typedef {Object} AnnouncementRecord
 * @property {string}  announcementId - Unique ID: ARKA_ANN_X         (Col A)
 * @property {string}  title          - Short headline                 (Col B)
 * @property {string}  body           - Full announcement text         (Col C)
 * @property {boolean} isPinned       - TRUE pins to home feed         (Col D)
 * @property {string}  expiryDate     - dd-MMM-yyyy or "" = no expiry (Col E)
 * @property {string}  status         - "Active" | "Archived"         (Col F)
 * @property {string}  createdBy      - ARKA_MEMBER_X                 (Col G)
 * @property {string}  createdOn      - dd-MM-yyyy HH:mm:ss Z         (Col H)
 */
 
/**
 * PRIVATE HELPER: Reads all non-Archived announcements from AnnouncementDB.
 * Reuses the already-open spreadsheet instance passed in from getAppMasterData()
 * to avoid opening a second connection — keeps the Big Gulp fast.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Open spreadsheet instance
 * @returns {AnnouncementRecord[]} Array of active announcement objects
 */
function fetchActiveAnnouncements(ss) {
  const sheet = ss.getSheetByName(ANNOUNCEMENT_SHEET);
  if (!sheet) return []; // Sheet not yet created — fail silently
 
  const data          = sheet.getDataRange().getValues();
  const announcements = [];
 
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;                               // Skip empty rows
    if (data[i][5].toString() === 'Archived') continue;      // Archived = hidden
 
    // Normalise Date objects to strings for consistent frontend handling
    const rawExpiry    = data[i][4];
    const expiryStr    = rawExpiry instanceof Date
      ? Utilities.formatDate(rawExpiry, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
      : String(rawExpiry || '');
 
    const rawCreatedOn = data[i][7];
    const createdOnStr = rawCreatedOn instanceof Date
      ? Utilities.formatDate(rawCreatedOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
      : String(rawCreatedOn || '');
 
    announcements.push({
      announcementId : data[i][0].toString(),
      title          : data[i][1].toString(),
      body           : data[i][2].toString(),
      isPinned       : data[i][3].toString().toUpperCase() === 'TRUE',
      expiryDate     : expiryStr,
      status         : data[i][5].toString(),
      createdBy      : data[i][6].toString(),
      createdOn      : createdOnStr,
      targetMemberId : data[i][8] ? data[i][8].toString() : ''
    });
  }
 
  return announcements;
}

/**
 * PRIVATE HELPER: Reads all non-Archived challenges from ChallengeDB.
 * Reuses the already-open spreadsheet instance from getAppMasterData().
 *
 * Column mapping (0-indexed):
 *   A=0  challengeId       B=1  challengeType     C=2  title
 *   D=3  description       E=4  startDate         F=5  endDate
 *   G=6  goalValue         H=7  goalUnit          I=8  goalConfigJson
 *   J=9  status            K=10 isCompetitive     L=11 seriesTag
 *   M=12 isPinned          N=13 createdBy         O=14 createdOn
 *   P=15 enrollPoints      Q=16 finishPoints      R=17 winPoints
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {ChallengeRecord[]}
 */
function fetchChallenges(ss) {
  const sheet = ss.getSheetByName(CHALLENGE_SHEET);
  if (!sheet) return [];
 
  const data       = sheet.getDataRange().getValues();
  const challenges = [];
 
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    if (row[9].toString() === 'Archived') continue;
 
    const rawStartDate = row[4];
    const rawEndDate   = row[5];
    const rawCreatedOn = row[14];
 
    const startDateStr = rawStartDate instanceof Date
      ? Utilities.formatDate(rawStartDate, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
      : String(rawStartDate || '');
 
    const endDateStr = rawEndDate instanceof Date
      ? Utilities.formatDate(rawEndDate, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
      : String(rawEndDate || '');
 
    const createdOnStr = rawCreatedOn instanceof Date
      ? Utilities.formatDate(rawCreatedOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
      : String(rawCreatedOn || '');
 
    challenges.push({
      challengeId    : row[0].toString(),
      challengeType  : row[1].toString(),
      title          : row[2].toString(),
      description    : row[3].toString(),
      startDate      : startDateStr,
      endDate        : endDateStr,
      goalValue      : Number(row[6]) || 0,
      goalUnit       : row[7].toString(),
      goalConfigJson : row[8].toString(),
      status         : row[9].toString(),
      isCompetitive  : row[10].toString().toUpperCase() === 'TRUE',
      seriesTag      : row[11] ? row[11].toString() : '',
      isPinned       : row[12].toString().toUpperCase() === 'TRUE',
      createdBy      : row[13].toString(),
      createdOn      : createdOnStr,
      // ── NEW: per-challenge points ────────────────────────────────────────
      enrollPoints   : Number(row[15]) || 0,  // Col P
      finishPoints   : Number(row[16]) || 0,  // Col Q
      winPoints      : Number(row[17]) || 0   // Col R
    });
  }
 
  return challenges;
}
 
 
/**
 * PRIVATE HELPER: Reads all ChallengeEnrollmentDB rows.
 * All rows are returned — the frontend filters to the current user's enrollments
 * for the Me tab, and uses the full set for Club leaderboard views.
 *
 * Column mapping (0-indexed):
 *   A=0  enrollmentId          B=1  challengeId         C=2  memberId
 *   D=3  enrolledOn            E=4  enrollmentStatus    F=5  currentProgressValue
 *   G=6  progressStateJson     H=7  lastProgressUpdate  I=8  completedOn
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Open spreadsheet instance
 * @returns {ChallengeEnrollmentRecord[]} Array of all enrollment objects
 */
function fetchChallengeEnrollments(ss) {
  const sheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
  if (!sheet) return []; // Sheet not yet created — fail silently on first deploy
 
  const data        = sheet.getDataRange().getValues();
  const enrollments = [];
 
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip blank rows
 
    // Normalise Date objects → strings
    const rawEnrolledOn          = row[3];
    const rawLastProgressUpdate  = row[7];
    const rawCompletedOn         = row[8];
 
    const enrolledOnStr = rawEnrolledOn instanceof Date
      ? Utilities.formatDate(rawEnrolledOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
      : String(rawEnrolledOn || '');
 
    const lastProgressUpdateStr = rawLastProgressUpdate instanceof Date
      ? Utilities.formatDate(rawLastProgressUpdate, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
      : String(rawLastProgressUpdate || '');
 
    const completedOnStr = rawCompletedOn instanceof Date
      ? Utilities.formatDate(rawCompletedOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
      : String(rawCompletedOn || '');
 
    enrollments.push({
      enrollmentId          : row[0].toString(),
      challengeId           : row[1].toString(),
      memberId              : row[2].toString(),
      enrolledOn            : enrolledOnStr,
      enrollmentStatus      : row[4].toString(),  // Active | Winner | Finisher | Dropped
      currentProgressValue  : Number(row[5]) || 0,
      progressStateJson     : row[6].toString(),  // Raw JSON string — frontend parses on demand
      lastProgressUpdate    : lastProgressUpdateStr,
      completedOn           : completedOnStr
    });
  }
 
  return enrollments;
}

/**
 * ADMIN ONLY: Creates a new challenge or updates an existing one.
 *
 * @param {Object}  data
 * @param {string}  [data.challengeId]
 * @param {string}  data.challengeType
 * @param {string}  data.title
 * @param {string}  [data.description]
 * @param {string}  data.startDate         - dd-MMM-yyyy
 * @param {string}  [data.endDate]
 * @param {number}  data.goalValue
 * @param {string}  data.goalUnit
 * @param {string}  data.goalConfigJson
 * @param {string}  data.status
 * @param {boolean} data.isCompetitive
 * @param {string}  [data.seriesTag]
 * @param {boolean} data.isPinned
 * @param {number}  data.enrollPoints      - ☀️ for enrolling
 * @param {number}  data.finishPoints      - ☀️ for finishing
 * @param {number}  data.winPoints         - ☀️ for winning (0 for personal challenges)
 * @returns {{ status: string, challenge?: ChallengeRecord, message?: string }}
 */
function saveChallenge(data) {
 
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)              return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  const title         = (data.title         || '').trim();
  const challengeType = (data.challengeType || '').trim();
  const startDate     = (data.startDate     || '').trim();
 
  if (!title)         return { status: 'error', message: 'Challenge title cannot be empty.'  };
  if (!challengeType) return { status: 'error', message: 'Challenge type is required.'        };
  if (!startDate)     return { status: 'error', message: 'Start date is required.'            };
 
  const validTypes = [
    'HABIT_STREAK', 'BINGO_GRID', 'BUDDY_READ',
    'COUNTRY_SPREAD', 'ALPHABET', 'BOOK_COUNT', 'PAGE_COUNT'
  ];
  if (!validTypes.includes(challengeType)) {
    return { status: 'error', message: 'Invalid challenge type: ' + challengeType };
  }
 
  const goalConfigJsonStr = (data.goalConfigJson || '{}').trim();
  try { JSON.parse(goalConfigJsonStr); } catch (e) {
    return { status: 'error', message: 'goalConfigJson is not valid JSON.' };
  }
 
  const ss             = SpreadsheetApp.openById(SPREADSHEET_ID);
  const challengeSheet = ss.getSheetByName(CHALLENGE_SHEET);
  if (!challengeSheet) return { status: 'error', message: 'ChallengeDB sheet not found.' };
 
  const timestamp     = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  const status        = (data.status    || 'Active').trim();
  const isPinned      = data.isPinned      === true || data.isPinned      === 'TRUE';
  const isCompetitive = data.isCompetitive === true || data.isCompetitive === 'TRUE';
  const seriesTag     = (data.seriesTag  || '').trim();
  const endDate       = (data.endDate    || '').trim();
  const goalValue     = Number(data.goalValue)    || 0;
  const goalUnit      = (data.goalUnit   || '').trim();
  const description   = (data.description || '').trim();
  const enrollPoints  = Number(data.enrollPoints)  || 0;   // Col P
  const finishPoints  = Number(data.finishPoints)  || 0;   // Col Q
  const winPoints     = Number(data.winPoints)     || 0;   // Col R
 
  // ── UPDATE path ─────────────────────────────────────────────────────────
  if (data.challengeId) {
    const sheetData = challengeSheet.getDataRange().getValues();
    let targetRow   = -1;
 
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0].toString() === data.challengeId.toString()) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow === -1) return { status: 'error', message: 'Challenge not found.' };
 
    const originalCreatedBy = sheetData[targetRow - 1][13].toString();
    const originalCreatedOn = sheetData[targetRow - 1][14].toString();
 
    // Write all 18 columns A–R in one call
    challengeSheet.getRange(targetRow, 1, 1, 18).setValues([[
      data.challengeId, challengeType, title,     description, startDate,
      endDate,          goalValue,     goalUnit,  goalConfigJsonStr,
      status,           isCompetitive, seriesTag, isPinned,
      originalCreatedBy, originalCreatedOn,
      enrollPoints,     finishPoints,  winPoints
    ]]);
 
    const updatedChallenge = {
      challengeId: data.challengeId, challengeType, title, description,
      startDate, endDate, goalValue, goalUnit, goalConfigJson: goalConfigJsonStr,
      status, isCompetitive, seriesTag, isPinned,
      createdBy: originalCreatedBy, createdOn: originalCreatedOn,
      enrollPoints, finishPoints, winPoints
    };
    return { status: 'success', challenge: updatedChallenge, isUpdate: true };
  }
 
  // ── CREATE path ──────────────────────────────────────────────────────────
  const existingData = challengeSheet.getDataRange().getValues();
  let newNum = 1;
  if (existingData.length > 1) {
    const lastId  = existingData[existingData.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const challengeId = 'ARKA_CHAL_' + newNum;
 
  // 18 columns A–R
  const newRow = [
    challengeId,    challengeType,  title,     description,   startDate,
    endDate,        goalValue,      goalUnit,  goalConfigJsonStr,
    status,         isCompetitive,  seriesTag, isPinned,
    currentMemberId, timestamp,
    enrollPoints,   finishPoints,   winPoints
  ];
 
  challengeSheet.appendRow(newRow);
 
  const newChallenge = {
    challengeId, challengeType, title, description,
    startDate, endDate, goalValue, goalUnit, goalConfigJson: goalConfigJsonStr,
    status, isCompetitive, seriesTag, isPinned,
    createdBy: currentMemberId, createdOn: timestamp,
    enrollPoints, finishPoints, winPoints
  };
 
  return { status: 'success', challenge: newChallenge, isUpdate: false };
}

/**
 * Enrols the current user in a challenge.
 * Awards enrollPoints from ChallengeDB via the new ARKA_ACTTYP_CHALLENGE_ENROLL type.
 *
 * @param {Object}  data
 * @param {string}  data.challengeId
 * @param {number}  [data.personalGoal]
 * @param {Object}  [data.activityPointsMap]
 * @returns {{ status: string, enrollment?: ChallengeEnrollmentRecord, message?: string }}
 */
function enrollInChallenge(data) {
 
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
  if (!data.challengeId) return { status: 'error', message: 'Challenge ID is required.' };
 
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
 
  // ── Fetch and validate challenge ─────────────────────────────────────────
  const challengeSheet = ss.getSheetByName(CHALLENGE_SHEET);
  if (!challengeSheet) return { status: 'error', message: 'ChallengeDB sheet not found.' };
 
  const challengeRows = challengeSheet.getDataRange().getValues();
  let targetChallenge = null;
 
  for (let i = 1; i < challengeRows.length; i++) {
    if (challengeRows[i][0].toString() === data.challengeId.toString()) {
      targetChallenge = {
        challengeId    : challengeRows[i][0].toString(),
        challengeType  : challengeRows[i][1].toString(),
        goalValue      : Number(challengeRows[i][6]) || 0,
        goalUnit       : challengeRows[i][7].toString(),
        goalConfigJson : challengeRows[i][8].toString(),
        status         : challengeRows[i][9].toString(),
        enrollPoints   : Number(challengeRows[i][15]) || 0  // Col P
      };
      break;
    }
  }
 
  if (!targetChallenge) return { status: 'error', message: 'Challenge not found.' };
  if (targetChallenge.status !== 'Active') {
    return { status: 'error', message: 'This challenge is not currently active.' };
  }
 
  // ── Duplicate check ───────────────────────────────────────────────────────
  const enrollmentSheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
  if (!enrollmentSheet) return { status: 'error', message: 'ChallengeEnrollmentDB sheet not found.' };
 
  const enrollmentRows = enrollmentSheet.getDataRange().getValues();
  for (let i = 1; i < enrollmentRows.length; i++) {
    if (enrollmentRows[i][1].toString() !== data.challengeId.toString()) continue;
    if (enrollmentRows[i][2].toString() !== currentMemberId) continue;
    if (enrollmentRows[i][4].toString() === 'Dropped') continue;
    return { status: 'error', message: 'You are already enrolled in this challenge.' };
  }
 
  // ── Generate enrollment ID ────────────────────────────────────────────────
  let newNum = 1;
  if (enrollmentRows.length > 1) {
    const lastId  = enrollmentRows[enrollmentRows.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const enrollmentId = 'ARKA_ENRL_' + newNum;
  const timestamp    = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
 
  // ── Build initial progressStateJson ──────────────────────────────────────
  let config = {};
  try { config = JSON.parse(targetChallenge.goalConfigJson || '{}'); } catch (e) {}
 
  const initialProgressState = buildInitialProgressState(
    targetChallenge.challengeType,
    config,
    targetChallenge.goalValue,
    Number(data.personalGoal) || 0
  );
 
  const newRow = [
    enrollmentId, data.challengeId, currentMemberId, timestamp,
    'Active', 0, JSON.stringify(initialProgressState), timestamp, ''
  ];
  enrollmentSheet.appendRow(newRow);
 
  // ── Log ENROLL activity with per-challenge points via directCp ─────────
  if (targetChallenge.enrollPoints > 0) {
    try {
      logActivityBatch(currentMemberId, [{
        typeId  : 'ARKA_ACTTYP_CHALLENGE_ENROLL',
        val     : 1,
        desc    : enrollmentId,
        directCp: targetChallenge.enrollPoints   // ← bypasses multiplier calculation
      }], 1, '', data.activityPointsMap || {});
    } catch (e) {
      console.error('Enrolment activity log failed (non-fatal):', e);
    }
  }
 
  const newEnrollment = {
    enrollmentId, challengeId: data.challengeId,
    memberId: currentMemberId, enrolledOn: timestamp,
    enrollmentStatus: 'Active', currentProgressValue: 0,
    progressStateJson: JSON.stringify(initialProgressState),
    lastProgressUpdate: timestamp, completedOn: ''
  };
 
  return { status: 'success', enrollment: newEnrollment };
}

/**
 * Lightweight fetcher for ChallengeEnrollmentDB.
 * Called lazily when the Challenges view is opened — NOT in the Big Gulp.
 * Returns all rows so the frontend can rebuild counts and myEnrollmentsMap.
 *
 * @returns {ChallengeEnrollmentRecord[]}
 */
function getLatestChallengeEnrollments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                                .getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
    if (!sheet) return [];
 
    const data        = sheet.getDataRange().getValues();
    const enrollments = [];
 
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
 
      const rawEnrolledOn         = row[3];
      const rawLastProgressUpdate = row[7];
      const rawCompletedOn        = row[8];
 
      const toStr = function(v) {
        return v instanceof Date
          ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
          : String(v || '');
      };
 
      enrollments.push({
        enrollmentId         : row[0].toString(),
        challengeId          : row[1].toString(),
        memberId             : row[2].toString(),
        enrolledOn           : toStr(rawEnrolledOn),
        enrollmentStatus     : row[4].toString(),
        currentProgressValue : Number(row[5]) || 0,
        progressStateJson    : row[6].toString(),
        lastProgressUpdate   : toStr(rawLastProgressUpdate),
        completedOn          : toStr(rawCompletedOn)
      });
    }
 
    return enrollments;
  } catch (e) {
    console.error('getLatestChallengeEnrollments failed:', e);
    return [];
  }
}
 
 
/**
 * PRIVATE HELPER: Builds the correct initial progressStateJson object
 * for each challenge type.
 *
 * @param {string} challengeType  - e.g. 'HABIT_STREAK'
 * @param {Object} config         - Parsed goalConfigJson from ChallengeDB
 * @param {number} goalValue      - The challenge's primary goalValue
 * @param {number} personalGoal   - Member's own target (BOOK_COUNT / PAGE_COUNT only)
 * @returns {Object} The initial progress state object (to be JSON.stringified)
 */
function buildInitialProgressState(challengeType, config, goalValue, personalGoal) {
 
  if (challengeType === 'HABIT_STREAK') {
    return {
      currentStreak   : 0,
      longestStreak   : 0,
      totalDaysLogged : 0,
      totalPagesLogged: 0,
      lastLogDate     : '',
      missedDates     : [],
      streakHistory   : []
    };
  }
 
  if (challengeType === 'BINGO_GRID') {
    return {
      cellsCompleted  : [],
      booksLinked     : {},
      linesCompleted  : [],
      hasBingo        : false
    };
  }
 
  if (challengeType === 'BUDDY_READ') {
    return {
      pagesRead              : 0,
      shelfRecordId          : '',
      currentShelfStatus     : 'To Read',
      finishedBeforeDeadline : null
    };
  }
 
  if (challengeType === 'COUNTRY_SPREAD') {
    return {
      countriesVisited  : {},
      totalCountries    : 0,
      continentProgress : {
        Africa    : 0,
        Americas  : 0,
        Asia      : 0,
        Europe    : 0,
        Oceania   : 0,
        MiddleEast: 0
      }
    };
  }
 
  if (challengeType === 'ALPHABET') {
    // Build the full letterMap — all 26 letters set to null (unclaimed)
    const allLetters = (config.allLetters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const letterMap  = {};
    allLetters.forEach(function(letter) { letterMap[letter] = null; });
 
    return {
      letterMap                : letterMap,
      lettersCompleted         : 0,
      optionalLettersCompleted : 0
    };
  }
 
  if (challengeType === 'BOOK_COUNT') {
    // Use personalGoal if provided and allowPersonalGoal is true, else use challenge default
    const effectiveGoal = (config.allowPersonalGoal && personalGoal > 0)
      ? personalGoal
      : (config.defaultGoal || goalValue || 24);
 
    return {
      personalGoal     : effectiveGoal,
      booksRead        : [],
      totalBooks       : 0,
      pacingProjection : 0,
      monthlyBreakdown : {}
    };
  }
 
  if (challengeType === 'PAGE_COUNT') {
    const effectiveGoal = (config.allowPersonalGoal && personalGoal > 0)
      ? personalGoal
      : (config.defaultGoal || goalValue || 5000);
 
    return {
      personalGoal       : effectiveGoal,
      totalPages         : 0,
      monthlyBreakdown   : {},
      weeklyBreakdown    : {},
      pacingProjection   : 0,
      aheadBehindTarget  : ''
    };
  }
 
  // Fallback for unknown types
  return {};
}
 
 
/**
 * Drops the current user from a challenge.
 *
 * Sets enrollmentStatus to 'Dropped'. The row is preserved for audit purposes.
 * A member who has Dropped may re-enrol — enrollInChallenge() skips Dropped rows
 * in its duplicate check.
 *
 * @param {string} challengeId - ARKA_CHAL_X to drop from
 * @returns {{ status: string, message?: string }}
 */
function dropFromChallenge(challengeId) {
 
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  if (!challengeId) return { status: 'error', message: 'Challenge ID is required.' };
 
  const ss              = SpreadsheetApp.openById(SPREADSHEET_ID);
  const enrollmentSheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
  if (!enrollmentSheet) return { status: 'error', message: 'ChallengeEnrollmentDB sheet not found.' };
 
  const enrollmentRows = enrollmentSheet.getDataRange().getValues();
 
  for (let i = 1; i < enrollmentRows.length; i++) {
    if (enrollmentRows[i][1].toString() !== challengeId.toString()) continue;
    if (enrollmentRows[i][2].toString() !== currentMemberId) continue;
    if (enrollmentRows[i][4].toString() === 'Dropped') continue; // Already dropped
 
    enrollmentSheet.getRange(i + 1, 5).setValue('Dropped'); // Col E = enrollmentStatus
    return { status: 'success' };
  }
 
  return { status: 'error', message: 'Active enrollment not found.' };
}

/**
 * Saves updated challenge progress for the current user.
 *
 * Handles all challenge types. The frontend sends the full updated
 * progressStateJson and the engine:
 *   1. Writes the updated state to ChallengeEnrollmentDB
 *   2. Runs completion detection for the challenge type
 *   3. If newly Finished or Won, updates enrollmentStatus and logs points
 *
 * Column write positions (1-based for getRange):
 *   E=5  enrollmentStatus     F=6  currentProgressValue
 *   G=7  progressStateJson    H=8  lastProgressUpdate   I=9  completedOn
 *
 * @param {Object}  data
 * @param {string}  data.enrollmentId        - ARKA_ENRL_X to update
 * @param {number}  data.currentProgressValue - Updated integer progress metric
 * @param {string}  data.progressStateJson    - Full updated state as JSON string
 * @param {Object}  [data.activityPointsMap]  - Client-side points map
 * @returns {{ status: string, updatedEnrollment?: Object, message?: string }}
 */
function saveChallengeProgress(data) {
 
  // ── Auth ─────────────────────────────────────────────────────────────────
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  if (!data.enrollmentId)       return { status: 'error', message: 'Enrollment ID is required.' };
  if (!data.progressStateJson)  return { status: 'error', message: 'Progress state is required.' };
 
  // Validate JSON
  try { JSON.parse(data.progressStateJson); } catch (e) {
    return { status: 'error', message: 'progressStateJson is not valid JSON.' };
  }
 
  const ss              = SpreadsheetApp.openById(SPREADSHEET_ID);
  const enrollmentSheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
  if (!enrollmentSheet) return { status: 'error', message: 'ChallengeEnrollmentDB not found.' };
 
  const enrollmentRows = enrollmentSheet.getDataRange().getValues();
  let   targetRowIndex = -1;
  let   existingRow    = null;
 
  for (let i = 1; i < enrollmentRows.length; i++) {
    if (enrollmentRows[i][0].toString() !== data.enrollmentId.toString()) continue;
    // Security: verify the row belongs to the calling member
    if (enrollmentRows[i][2].toString() !== currentMemberId) {
      return { status: 'error', message: 'You can only update your own progress.' };
    }
    targetRowIndex = i + 1; // 1-based for getRange
    existingRow    = enrollmentRows[i];
    break;
  }
 
  if (targetRowIndex === -1) return { status: 'error', message: 'Enrollment not found.' };
 
  const challengeId       = existingRow[1].toString();
  const currentStatus     = existingRow[4].toString();
 
  // Don't update progress on already-completed or dropped enrollments
  if (currentStatus === 'Dropped') {
    return { status: 'error', message: 'Cannot update progress on a dropped enrollment.' };
  }
 
  // ── Fetch challenge for completion rules ─────────────────────────────────
  const challengeSheet = ss.getSheetByName(CHALLENGE_SHEET);
  if (!challengeSheet) return { status: 'error', message: 'ChallengeDB not found.' };
 
  const challengeRows = challengeSheet.getDataRange().getValues();
  let   challenge     = null;
 
  for (let i = 1; i < challengeRows.length; i++) {
    if (challengeRows[i][0].toString() !== challengeId) continue;
    challenge = {
      challengeType  : challengeRows[i][1].toString(),
      goalValue      : Number(challengeRows[i][6]) || 0,
      goalConfigJson : challengeRows[i][8].toString(),
      isCompetitive  : challengeRows[i][10].toString().toUpperCase() === 'TRUE',
      finishPoints   : Number(challengeRows[i][16]) || 0,  // Col Q
      winPoints      : Number(challengeRows[i][17]) || 0   // Col R
    };
    break;
  }
 
  if (!challenge) return { status: 'error', message: 'Challenge not found.' };
 
  // ── Run completion detection ──────────────────────────────────────────────
  let config = {};
  try { config = JSON.parse(challenge.goalConfigJson || '{}'); } catch (e) {}
 
  const newProgressValue = Number(data.currentProgressValue) || 0;
  const completionResult = detectChallengeCompletion(
    challenge.challengeType,
    config,
    challenge.goalValue,
    data.progressStateJson,
    currentStatus
  );
 
  // completionResult: { newStatus: 'Active'|'Finisher'|'Winner', isNewCompletion: bool }
  const newStatus      = completionResult.newStatus;
  const isNewFinish    = completionResult.isNewCompletion && newStatus === 'Finisher';
  const isNewWin       = completionResult.isNewCompletion && newStatus === 'Winner';
  const timestamp      = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  const completedOnVal = (isNewFinish || isNewWin) ? timestamp : existingRow[8].toString();
 
  // ── Write updated row columns E–I in one range call ──────────────────────
  enrollmentSheet.getRange(targetRowIndex, 5, 1, 5).setValues([[
    newStatus,              // E — enrollmentStatus
    newProgressValue,       // F — currentProgressValue
    data.progressStateJson, // G — progressStateJson
    timestamp,              // H — lastProgressUpdate
    completedOnVal          // I — completedOn
  ]]);
 
  // ── Log finish / win activity with per-challenge points ──────────────────
  if (isNewFinish && challenge.finishPoints > 0) {
    try {
      logActivityBatch(currentMemberId, [{
        typeId  : 'ARKA_ACTTYP_CHALLENGE_FINISH',
        val     : 1,
        desc    : data.enrollmentId,
        directCp: challenge.finishPoints
      }], 1, '', data.activityPointsMap || {});
    } catch (e) { console.error('Finish activity log failed (non-fatal):', e); }
  }
 
  if (isNewWin && challenge.winPoints > 0) {
    try {
      logActivityBatch(currentMemberId, [{
        typeId  : 'ARKA_ACTTYP_CHALLENGE_WIN',
        val     : 1,
        desc    : data.enrollmentId,
        directCp: challenge.winPoints
      }], 1, '', data.activityPointsMap || {});
    } catch (e) { console.error('Win activity log failed (non-fatal):', e); }
  }
 
  const updatedEnrollment = {
    enrollmentId         : data.enrollmentId,
    challengeId          : challengeId,
    memberId             : currentMemberId,
    enrolledOn           : existingRow[3].toString(),
    enrollmentStatus     : newStatus,
    currentProgressValue : newProgressValue,
    progressStateJson    : data.progressStateJson,
    lastProgressUpdate   : timestamp,
    completedOn          : completedOnVal
  };
 
  return {
    status            : 'success',
    updatedEnrollment : updatedEnrollment,
    isNewFinish       : isNewFinish,
    isNewWin          : isNewWin
  };
}

/**
 * Recalculates and syncs progress for all active BOOK_COUNT and PAGE_COUNT
 * challenge enrollments belonging to a given member.
 *
 * Uses ABSOLUTE recalculation from source data — counts finished books from
 * MemberShelfDB and sums pages from PageLogDB since the challenge startDate.
 * Never uses deltas so drift is impossible.
 *
 * Called automatically after:
 *   - A book is marked 'Finished' in updateMemberShelf()
 *   - Pages are logged to PageLogDB
 *
 * @param {string} memberId - ARKA_MEMBER_X whose enrollments to sync
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Open spreadsheet instance
 */
function syncCountChallengeProgress(memberId, ss) {
  try {
    const enrollmentSheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
    const challengeSheet  = ss.getSheetByName(CHALLENGE_SHEET);
    if (!enrollmentSheet || !challengeSheet) return;
 
    const enrollmentRows = enrollmentSheet.getDataRange().getValues();
    const challengeRows  = challengeSheet.getDataRange().getValues();
 
    // Build a quick challenge lookup: challengeId → challenge object
    const challengeLookup = {};
    for (let i = 1; i < challengeRows.length; i++) {
      const row = challengeRows[i];
      if (!row[0]) continue;
      challengeLookup[row[0].toString()] = {
        challengeId   : row[0].toString(),
        challengeType : row[1].toString(),
        goalValue     : Number(row[6]) || 0,
        goalConfigJson: row[8].toString(),
        startDate     : row[4] instanceof Date
          ? Utilities.formatDate(row[4], Session.getScriptTimeZone(), 'dd-MMM-yyyy')
          : String(row[4] || ''),
        finishPoints  : Number(row[16]) || 0,  // Col Q
        winPoints     : Number(row[17]) || 0   // Col R
      };
    }
 
    // Find active BOOK_COUNT and PAGE_COUNT enrollments for this member
    const countTypes = new Set(['BOOK_COUNT', 'PAGE_COUNT']);
    let   rowsToSync = [];
 
    for (let i = 1; i < enrollmentRows.length; i++) {
      const row = enrollmentRows[i];
      if (!row[0]) continue;
      if (row[2].toString() !== memberId) continue;
      if (row[4].toString() === 'Dropped' || row[4].toString() === 'Winner') continue;
 
      const challenge = challengeLookup[row[1].toString()];
      if (!challenge || !countTypes.has(challenge.challengeType)) continue;
 
      rowsToSync.push({ rowIndex: i + 1, enrollmentRow: row, challenge: challenge });
    }
 
    if (rowsToSync.length === 0) return; // Nothing to sync
 
    // Read source data once for all enrollments
    const shelfSheet   = ss.getSheetByName(SHELF_SHEET);
    const pageLogSheet = ss.getSheetByName(PAGELOG_SHEET);
    const shelfRows    = shelfSheet   ? shelfSheet.getDataRange().getValues()   : [];
    const pageLogRows  = pageLogSheet ? pageLogSheet.getDataRange().getValues() : [];
 
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
 
    rowsToSync.forEach(function(item) {
      const challenge   = item.challenge;
      const enrollment  = item.enrollmentRow;
      const currentStatus = enrollment[4].toString();
 
      let config = {};
      try { config = JSON.parse(challenge.goalConfigJson || '{}'); } catch (e) {}
 
      // Parse start date to a comparable number (ms since epoch)
      const startDateMs = parseChallengeStartDate(challenge.startDate);
      const endDateMs = challenge.endDate
         ? parseChallengeStartDate(challenge.endDate) + (24 * 60 * 60 * 1000) // inclusive: add 1 day
         : Infinity;
 
      let newProgressValue = 0;
      let updatedState     = {};
      try { updatedState = JSON.parse(enrollment[6].toString() || '{}'); } catch (e) {}
 
      // ── BOOK_COUNT: count Finished books since challenge start ─────────────
      if (challenge.challengeType === 'BOOK_COUNT') {
        const booksRead    = [];
        const monthlyBreakdown = {};
 
        for (let j = 1; j < shelfRows.length; j++) {
          const sRow = shelfRows[j];
          if (!sRow[0]) continue;
          if (sRow[1].toString() !== memberId) continue;      // wrong member
          if (sRow[3].toString() !== 'Finished') continue;    // not finished
 
          // Use dateFinished (Col I) if available, else dateUpdated (Col H)
          const rawFinished = sRow[8] || sRow[7];
          const finishedMs  = rawFinished instanceof Date
            ? rawFinished.getTime()
            : new Date(rawFinished).getTime();
 
          if (isNaN(finishedMs) || finishedMs < startDateMs || finishedMs > endDateMs) continue;
 
          const bookId     = sRow[2].toString();
          const finishedOn = rawFinished instanceof Date
            ? Utilities.formatDate(rawFinished, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
            : String(rawFinished);
 
          // Get book title from globalBooksDB equivalent — just store bookId
          booksRead.push({ bookId: bookId, title: '', finishedOn: finishedOn });
 
          // Monthly breakdown key: 'Jan', 'Feb', etc.
          const monthKey = ['Jan','Feb','Mar','Apr','May','Jun',
                            'Jul','Aug','Sep','Oct','Nov','Dec'][
            (rawFinished instanceof Date ? rawFinished : new Date(rawFinished)).getMonth()
          ] || '?';
          monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + 1;
        }
 
        newProgressValue = booksRead.length;
        const personalGoal = updatedState.personalGoal || config.defaultGoal || challenge.goalValue || 24;
 
        // Calculate pacing projection
        const pacingProjection = calculatePacingProjection(
          newProgressValue, challenge.startDate, new Date()
        );
 
        updatedState = {
          personalGoal     : personalGoal,
          booksRead        : booksRead,
          totalBooks       : newProgressValue,
          pacingProjection : pacingProjection,
          monthlyBreakdown : monthlyBreakdown
        };
      }
 
      // ── PAGE_COUNT: sum all page logs since challenge start ────────────────
      if (challenge.challengeType === 'PAGE_COUNT') {
        let   totalPages       = 0;
        const monthlyBreakdown = {};
        const weeklyBreakdown  = {};
 
        for (let j = 1; j < pageLogRows.length; j++) {
          const pRow = pageLogRows[j];
          if (!pRow[0]) continue;
          if (pRow[2].toString() !== memberId) continue;
 
          const rawTs  = pRow[1];
          const logMs  = rawTs instanceof Date
            ? rawTs.getTime()
            : new Date(rawTs).getTime();
 
          if (isNaN(logMs) || logMs < startDateMs || logMs > endDateMs) continue;
 
          const pages = Number(pRow[4]) || 0;
          if (pages <= 0) continue;
 
          totalPages += pages;
 
          const logDate = rawTs instanceof Date ? rawTs : new Date(rawTs);
          const monthKey = ['Jan','Feb','Mar','Apr','May','Jun',
                            'Jul','Aug','Sep','Oct','Nov','Dec'][logDate.getMonth()] || '?';
          monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + pages;
 
          const weekNum = getISOWeekNumber(logDate);
          const weekKey = 'W' + String(weekNum).padStart(2, '0');
          weeklyBreakdown[weekKey] = (weeklyBreakdown[weekKey] || 0) + pages;
        }
 
        newProgressValue = totalPages;
        const personalGoal = updatedState.personalGoal || config.defaultGoal || challenge.goalValue || 5000;
        const pacingProjection = calculatePacingProjection(
          newProgressValue, challenge.startDate, new Date()
        );
 
        const aheadBehind = buildAheadBehindLabel(
          newProgressValue, personalGoal, challenge.startDate, new Date()
        );
 
        updatedState = {
          personalGoal      : personalGoal,
          totalPages        : totalPages,
          monthlyBreakdown  : monthlyBreakdown,
          weeklyBreakdown   : weeklyBreakdown,
          pacingProjection  : pacingProjection,
          aheadBehindTarget : aheadBehind
        };
      }
 
      // ── Run completion detection ────────────────────────────────────────────
      const completionResult = detectChallengeCompletion(
        challenge.challengeType,
        config,
        challenge.goalValue,
        JSON.stringify(updatedState),
        currentStatus
      );
      const newStatus         = completionResult.newStatus;
      const isNewFinish       = completionResult.isNewCompletion && newStatus === 'Finisher';
      const completedOnVal    = isNewFinish ? timestamp : enrollment[8].toString();
 
      // ── Write updated row columns E–I ─────────────────────────────────────
      enrollmentSheet.getRange(item.rowIndex, 5, 1, 5).setValues([[
        newStatus,
        newProgressValue,
        JSON.stringify(updatedState),
        timestamp,
        completedOnVal
      ]]);
 
      // ── Log finish activity if newly completed ──────────────────────────────
      if (isNewFinish && challenge.finishPoints > 0) {
        try {
          logActivityBatch(memberId, [{
            typeId  : 'ARKA_ACTTYP_CHALLENGE_FINISH',
            val     : 1,
            desc    : enrollment[0].toString(),
            directCp: challenge.finishPoints
          }], 1, '', {});
        } catch (e) {
          console.error('Count challenge finish log failed (non-fatal):', e);
        }
      }
    });
 
  } catch (e) {
    // Never let challenge sync crash the calling function
    console.error('syncCountChallengeProgress failed (non-fatal):', e);
  }
}

// ============================================================================
// PRIVATE HELPERS for syncCountChallengeProgress
// ============================================================================
 
/**
 * Parses a dd-MMM-yyyy challenge startDate string to milliseconds.
 * Returns 0 (epoch) if parsing fails — meaning all records qualify.
 * @param {string} dateStr - e.g. '01-Jan-2026'
 * @returns {number}
 */
function parseChallengeStartDate(dateStr) {
  if (!dateStr) return 0;
  try {
    // dd-MMM-yyyy → JS Date
    const parts = dateStr.split('-');
    if (parts.length !== 3) return 0;
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,
                     Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const d = new Date(
      parseInt(parts[2]),
      months[parts[1]] !== undefined ? months[parts[1]] : 0,
      parseInt(parts[0])
    );
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch (e) {
    return 0;
  }
}
 
/**
 * Projects year-end total based on current pace.
 * @param {number} currentTotal - Pages or books so far
 * @param {string} startDateStr - Challenge start date dd-MMM-yyyy
 * @param {Date}   now          - Current date
 * @returns {number} Projected year-end total (rounded)
 */
function calculatePacingProjection(currentTotal, startDateStr, now) {
  const startMs  = parseChallengeStartDate(startDateStr);
  const elapsedDays = Math.max(1, (now.getTime() - startMs) / (1000 * 60 * 60 * 24));
  const yearEnd  = new Date(now.getFullYear(), 11, 31);
  const totalDays = Math.max(1, (yearEnd.getTime() - startMs) / (1000 * 60 * 60 * 24));
  return Math.round((currentTotal / elapsedDays) * totalDays);
}
 
/**
 * Returns a human-readable ahead/behind label for PAGE_COUNT.
 * @param {number} currentTotal
 * @param {number} personalGoal
 * @param {string} startDateStr
 * @param {Date}   now
 * @returns {string} e.g. '+340 pages ahead of pace' or '120 pages behind pace'
 */
function buildAheadBehindLabel(currentTotal, personalGoal, startDateStr, now) {
  const startMs     = parseChallengeStartDate(startDateStr);
  const yearEnd     = new Date(now.getFullYear(), 11, 31);
  const totalDays   = Math.max(1, (yearEnd.getTime() - startMs) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(1, (now.getTime() - startMs) / (1000 * 60 * 60 * 24));
  const expectedByNow = Math.round(personalGoal * (elapsedDays / totalDays));
  const diff = currentTotal - expectedByNow;
  if (diff === 0) return 'exactly on pace';
  return (diff > 0 ? '+' : '') + diff.toLocaleString() + ' pages ' + (diff > 0 ? 'ahead of' : 'behind') + ' pace';
}
 
/**
 * Returns the ISO week number (1–53) for a given Date.
 * Matches the getISOWeekNumber() function already used on the frontend.
 * @param {Date} date
 * @returns {number}
 */
function getISOWeekNumber(date) {
  const d    = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day  = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

 
/**
 * PRIVATE HELPER: Detects whether the updated progress state triggers
 * a Finisher or Winner transition for the given challenge type.
 *
 * Only promotes status — never demotes (Winner stays Winner).
 *
 * @param {string} challengeType
 * @param {Object} config          - Parsed goalConfigJson
 * @param {number} goalValue       - Primary goal number from ChallengeDB
 * @param {string} progressJsonStr - Updated progressStateJson string
 * @param {string} currentStatus   - Existing enrollmentStatus
 * @returns {{ newStatus: string, isNewCompletion: boolean }}
 */
function detectChallengeCompletion(challengeType, config, goalValue, progressJsonStr, currentStatus) {
 
  // Already at terminal state — never demote
  if (currentStatus === 'Winner') return { newStatus: 'Winner', isNewCompletion: false };
 
  let state = {};
  try { state = JSON.parse(progressJsonStr); } catch (e) {
    return { newStatus: currentStatus, isNewCompletion: false };
  }
 
  let newStatus        = currentStatus;
  let isNewCompletion  = false;
 
  // ── HABIT_STREAK ─────────────────────────────────────────────────────────
  // Win: reached 365 consecutive days. Finish: reached goalValue days total logged.
  if (challengeType === 'HABIT_STREAK') {
    const totalLogged   = state.totalDaysLogged  || 0;
    const currentStreak = state.currentStreak    || 0;
 
    if (currentStatus !== 'Winner' && currentStreak >= 365) {
      newStatus       = 'Winner';
      isNewCompletion = true;
    } else if (currentStatus === 'Active' && totalLogged >= goalValue) {
      newStatus       = 'Finisher';
      isNewCompletion = true;
    }
  }
 
  // ── BINGO_GRID ────────────────────────────────────────────────────────────
  // Finisher: linesCompleted.length >= 1 (ANY_LINE) or half cells done (HALF_CELLS)
  // Winner: ALL_CELLS completed OR ANY_LINE if that's the win condition
  if (challengeType === 'BINGO_GRID') {
    const cellsDone     = (state.cellsCompleted || []).length;
    const linesCount    = (state.linesCompleted || []).length;
    const winCond       = config.winCondition       || 'ALL_CELLS';
    const finishCond    = config.finisherCondition  || 'ANY_LINE';
    const gridSize      = config.gridSize           || 3;
    const totalCells    = gridSize * gridSize;
 
    const isWinner  = winCond === 'ALL_CELLS'
      ? cellsDone >= totalCells
      : linesCount >= 1;
 
    const isFinisher = finishCond === 'ANY_LINE'
      ? linesCount >= 1
      : cellsDone >= Math.floor(totalCells / 2);
 
    if (currentStatus !== 'Winner' && isWinner) {
      newStatus = 'Winner'; isNewCompletion = true;
    } else if (currentStatus === 'Active' && isFinisher) {
      newStatus = 'Finisher'; isNewCompletion = true;
    }
  }
 
  // ── BUDDY_READ ────────────────────────────────────────────────────────────
  // Finish only: read all pages. Win concept not applicable (winPoints = 0).
  if (challengeType === 'BUDDY_READ') {
    if (currentStatus === 'Active' && (state.pagesRead || 0) >= goalValue && goalValue > 0) {
      newStatus = 'Finisher'; isNewCompletion = true;
    }
  }
 
  // ── COUNTRY_SPREAD ────────────────────────────────────────────────────────
  // Finisher: reached goalValue countries. Winner: same goalValue (no separate bar).
  if (challengeType === 'COUNTRY_SPREAD') {
    const visited = state.totalCountries || 0;
    if (currentStatus !== 'Winner' && visited >= goalValue) {
      newStatus = 'Winner'; isNewCompletion = true;
    }
  }
 
  // ── ALPHABET ─────────────────────────────────────────────────────────────
  // Finish: completed all required letters (goalValue = 26 minus optional count).
  // Win: completed ALL 26 including optional.
  if (challengeType === 'ALPHABET') {
    const required  = state.lettersCompleted         || 0;
    const optional  = state.optionalLettersCompleted || 0;
 
    if (currentStatus !== 'Winner' && (required + optional) >= 26) {
      newStatus = 'Winner'; isNewCompletion = true;
    } else if (currentStatus === 'Active' && required >= goalValue) {
      newStatus = 'Finisher'; isNewCompletion = true;
    }
  }
 
  // ── BOOK_COUNT ────────────────────────────────────────────────────────────
  // Finisher only (winPoints = 0 for personal challenges).
  if (challengeType === 'BOOK_COUNT') {
    const goal  = state.personalGoal || goalValue || 1;
    const total = state.totalBooks   || 0;
    if (currentStatus === 'Active' && total >= goal) {
      newStatus = 'Finisher'; isNewCompletion = true;
    }
  }
 
  // ── PAGE_COUNT ────────────────────────────────────────────────────────────
  // Finisher only.
  if (challengeType === 'PAGE_COUNT') {
    const goal  = state.personalGoal || goalValue || 1;
    const total = state.totalPages   || 0;
    if (currentStatus === 'Active' && total >= goal) {
      newStatus = 'Finisher'; isNewCompletion = true;
    }
  }
 
  return { newStatus, isNewCompletion };
}

/**
 * On-demand sync + fetch for a single enrollment.
 * Runs syncCountChallengeProgress() for the current user then returns the
 * updated enrollment row so the frontend can refresh its local state.
 *
 * Only needed for BOOK_COUNT and PAGE_COUNT — other types update via
 * saveChallengeProgress() which is always called explicitly by the frontend.
 *
 * @param {string} challengeId - ARKA_CHAL_X to sync and fetch
 * @returns {{ status: string, enrollment?: ChallengeEnrollmentRecord }}
 */
function syncAndFetchEnrollment(challengeId) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized.' };
  if (!challengeId)     return { status: 'error', message: 'Challenge ID required.' };
 
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
 
  // Run the sync — this updates the row in ChallengeEnrollmentDB
  syncCountChallengeProgress(currentMemberId, ss);
 
  // Now fetch the updated row and return it
  const enrollmentSheet = ss.getSheetByName(CHALLENGE_ENROLLMENT_SHEET);
  if (!enrollmentSheet) return { status: 'error', message: 'ChallengeEnrollmentDB not found.' };
 
  const rows = enrollmentSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[1].toString() !== challengeId) continue;
    if (row[2].toString() !== currentMemberId) continue;
    if (row[4].toString() === 'Dropped') continue;
 
    const toStr = function(v) {
      return v instanceof Date
        ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
        : String(v || '');
    };
 
    return {
      status: 'success',
      enrollment: {
        enrollmentId         : row[0].toString(),
        challengeId          : row[1].toString(),
        memberId             : row[2].toString(),
        enrolledOn           : toStr(row[3]),
        enrollmentStatus     : row[4].toString(),
        currentProgressValue : Number(row[5]) || 0,
        progressStateJson    : row[6].toString(),
        lastProgressUpdate   : toStr(row[7]),
        completedOn          : toStr(row[8])
      }
    };
  }
 
  return { status: 'error', message: 'Enrollment not found.' };
}

 
 
/**
 * ADMIN ONLY: Archives a challenge (soft-delete).
 * Sets status to 'Archived' — hidden from all member views.
 * Existing enrollments are preserved in ChallengeEnrollmentDB.
 *
 * @param {string} challengeId - ARKA_CHAL_X to archive
 * @returns {{ status: string, message?: string }}
 */
function archiveChallenge(challengeId) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)              return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  if (!challengeId) return { status: 'error', message: 'Challenge ID is required.' };
 
  const ss             = SpreadsheetApp.openById(SPREADSHEET_ID);
  const challengeSheet = ss.getSheetByName(CHALLENGE_SHEET);
  if (!challengeSheet) return { status: 'error', message: 'ChallengeDB sheet not found.' };
 
  const sheetData = challengeSheet.getDataRange().getValues();
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0].toString() !== challengeId.toString()) continue;
    challengeSheet.getRange(i + 1, 10).setValue('Archived'); // Col J = status
    return { status: 'success' };
  }
 
  return { status: 'error', message: 'Challenge not found.' };
}
 
// ============================================================================
// PUBLIC FUNCTIONS
// ============================================================================
 
/**
 * ADMIN ONLY: Creates a new announcement or updates an existing one.
 *
 * Pass `data.announcementId` to update an existing row; omit it (or null)
 * to create a brand-new announcement.
 *
 * Security gate: verified session + admin check on both paths.
 *
 * @param {Object}  data
 * @param {string}  [data.announcementId] - ARKA_ANN_X to update, or omit to create
 * @param {string}  data.title            - Required headline (non-empty)
 * @param {string}  data.body             - Required body text (non-empty)
 * @param {boolean} data.isPinned         - true → pin to home feed
 * @param {string}  [data.expiryDate]     - Optional dd-MMM-yyyy expiry date
 * @param {string} [data.targetMemberId] - ARKA_MEMBER_X for personal notice, blank = club-wide
 * @returns {{ status: string, announcement?: AnnouncementRecord, message?: string }}
 */
function saveAnnouncement(data) {
  // ── Auth gates ────────────────────────────────────────────────────────────
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)                return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  // ── Input validation ──────────────────────────────────────────────────────
  const title = (data.title || '').trim();
  const body  = (data.body  || '').trim();
  if (!title) return { status: 'error', message: 'Title cannot be empty.' };
  if (!body)  return { status: 'error', message: 'Announcement body cannot be empty.' };
 
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ANNOUNCEMENT_SHEET);
  if (!sheet) return { status: 'error', message: 'AnnouncementDB sheet not found. Please create it first.' };
 
  const isPinned   = (data.isPinned === true || data.isPinned === 'TRUE');
  const expiryDate = (data.expiryDate || '').trim();
  const timestamp  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
 
  // ── UPDATE path ───────────────────────────────────────────────────────────
  if (data.announcementId) {
    const rows = sheet.getDataRange().getValues();
 
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() !== data.announcementId.toString()) continue;
 
      // Update editable columns B–E; preserve createdBy (G) and createdOn (H)
      sheet.getRange(i + 1, 2, 1, 4).setValues([[title, body, isPinned, expiryDate]]);
 
      return {
        status: 'success',
        announcement: {
          announcementId : data.announcementId,
          title,
          body,
          isPinned,
          expiryDate,
          status    : rows[i][5].toString(),
          createdBy : rows[i][6].toString(),
          createdOn : rows[i][7].toString()
        }
      };
    }
    return { status: 'error', message: 'Announcement not found.' };
  }
 
  // ── CREATE path ───────────────────────────────────────────────────────────
  // Generate sequential ARKA_ANN_X ID from the last occupied row
  const sheetData = sheet.getDataRange().getValues();
  let newNum = 1;
  if (sheetData.length > 1) {
    const lastId  = sheetData[sheetData.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const announcementId = 'ARKA_ANN_' + newNum;
 
  sheet.appendRow([
    announcementId,  // Col A — ID
    title,           // Col B — Title
    body,            // Col C — Body
    isPinned,        // Col D — isPinned
    expiryDate,      // Col E — expiryDate
    'Active',        // Col F — status
    currentMemberId, // Col G — createdBy
    timestamp,        // Col H — createdOn
    data.targetMemberId || ''     //Col I - targetMember ID where this notice will display, blank - club wide
  ]);

  if (!data.targetMemberId) {
    try { logActivity(currentMemberId, 'ARKA_ACTTYP_ANNOUNCEMENTPOSTED', 1, announcementId); } catch(e) {}
  }
 
  return {
    status: 'success',
    announcement: {
      announcementId,
      title,
      body,
      isPinned,
      expiryDate,
      status    : 'Active',
      createdBy : currentMemberId,
      createdOn : timestamp,
      targetMemberId: data.targetMemberId || ''
    }
  };
}
 
 
/**
 * ADMIN ONLY: Soft-deletes an announcement by setting its status to "Archived".
 * The row is preserved in the sheet for audit purposes; it will be excluded from
 * all frontend reads automatically (fetchActiveAnnouncements filters it out).
 *
 * @param {string} announcementId - ARKA_ANN_X to archive
 * @returns {{ status: string, message?: string }}
 */
function archiveAnnouncement(announcementId) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)                return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  if (!announcementId) return { status: 'error', message: 'Announcement ID is required.' };
 
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ANNOUNCEMENT_SHEET);
  if (!sheet) return { status: 'error', message: 'AnnouncementDB sheet not found.' };
 
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== announcementId.toString()) continue;
    sheet.getRange(i + 1, 6).setValue('Archived'); // Col F = status
    return { status: 'success' };
  }
 
  return { status: 'error', message: 'Announcement not found.' };
}
 
 
/**
 * ADMIN ONLY: Pins or unpins an announcement.
 * Pinned announcements always appear at the top of the Home feed regardless of
 * date, and cannot be dismissed by members.
 *
 * @param {string}  announcementId - ARKA_ANN_X to update
 * @param {boolean} pinState       - true to pin, false to unpin
 * @returns {{ status: string, message?: string }}
 */
function setAnnouncementPin(announcementId, pinState) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId)                return { status: 'error', message: 'Unauthorized session.' };
  if (!isAdminMember(currentMemberId)) return { status: 'error', message: 'Admin access required.' };
 
  if (!announcementId) return { status: 'error', message: 'Announcement ID is required.' };
 
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ANNOUNCEMENT_SHEET);
  if (!sheet) return { status: 'error', message: 'AnnouncementDB sheet not found.' };
 
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== announcementId.toString()) continue;
    sheet.getRange(i + 1, 4).setValue(pinState === true); // Col D = isPinned (boolean)
    return { status: 'success' };
  }
 
  return { status: 'error', message: 'Announcement not found.' };
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
 
/**
 * @typedef {Object} EventRecord
 * @property {string}  eventId        - Unique ID: ARKA_EVENT_X              (Col A)
 * @property {string}  eventType      - Meeting-Virtual | Meeting-F2F |       (Col B)
 *                                      BookBuddyRead | Social | Other
 * @property {string}  title          - Display name of the event             (Col C)
 * @property {string}  description    - Full event details                    (Col D)
 * @property {string}  hostMemberId   - ARKA_MEMBER_X or "" if no host       (Col E)
 * @property {string}  startDate      - dd-MMM-yyyy                          (Col F)
 * @property {string}  startTime      - HH:mm (24hr)                         (Col G)
 * @property {string}  endDate        - dd-MMM-yyyy                          (Col H)
 * @property {string}  endTime        - HH:mm (24hr)                         (Col I)
 * @property {string}  meetingLink    - URL or ""                             (Col J)
 * @property {string}  assetsJson     - JSON string array of asset objects    (Col K)
 * @property {string}  status         - Active | Cancelled | Completed        (Col L)
 * @property {boolean} isPinned       - Pinned to top of events list          (Col M)
 * @property {string}  createdBy      - ARKA_MEMBER_X                        (Col N)
 * @property {string}  createdOn      - dd-MM-yyyy HH:mm:ss Z                (Col O)
 */
 
/**
 * @typedef {Object} EventRSVPRecord
 * @property {string} rsvpId               - Unique ID: ARKA_RSVP_X         (Col A)
 * @property {string} eventId              - ARKA_EVENT_X                   (Col B)
 * @property {string} memberId             - ARKA_MEMBER_X                  (Col C)
 * @property {string} rsvpStatus           - Invited | Yes | No | Maybe     (Col D)
 * @property {string} rsvpDate             - dd-MM-yyyy HH:mm:ss Z          (Col E)
 * @property {string} attendanceConfirmed  - Yes | No | "" (blank=pending)  (Col F)
 * @property {string} confirmedBy          - ARKA_MEMBER_X or ""            (Col G)
 * @property {string} confirmedOn          - timestamp or ""                (Col H)
 * @property {string} addedBy              - ARKA_MEMBER_X who created row  (Col I)
 */
 
/**
 * @typedef {Object} EventAsset
 * @property {string} assetId    - ARKA_EVTASSET_X
 * @property {string} type       - Photo | PDF | PPT | Document | Other
 * @property {string} title      - Display name shown in the app
 * @property {string} driveLink  - Google Drive viewer URL (open in new window)
 * @property {string} uploadedBy - ARKA_MEMBER_X
 * @property {string} uploadedOn - dd-MM-yyyy HH:mm:ss Z
 */
 
 
// ============================================================================
// STEP 5a — PRIVATE HELPERS
// ============================================================================
 
/**
 * PRIVATE HELPER: Checks whether a member has management rights over a specific event.
 * Management rights = can edit details, add participants, confirm attendance, add assets.
 * Three-way check: Admin OR the designated host OR the original creator.
 *
 * IMPORTANT: Always call with a verified memberId from getVerifiedMemberId().
 * The frontend has the same function for UI gating — the backend is the true security gate.
 *
 * @param {string} memberId         - Verified ARKA_MEMBER_X
 * @param {Object} event            - Must contain hostMemberId and createdBy
 * @param {string} event.hostMemberId
 * @param {string} event.createdBy
 * @returns {boolean}
 */
function canManageEvent(memberId, event) {
  return isAdminMember(memberId)
    || (event.hostMemberId && memberId === event.hostMemberId)
    || (event.createdBy    && memberId === event.createdBy);
}
 
/**
 * PRIVATE HELPER: Reads a single event row from EventDB by eventId.
 * Used internally to verify permissions before writes.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} eventSheet - Open EventDB sheet
 * @param {string} eventId - ARKA_EVENT_X to find
 * @returns {{rowIndex: number, event: Object}|null}
 *   rowIndex is 1-based (matches getRange row). Returns null if not found.
 */
function getEventRowById(eventSheet, eventId) {
  const data = eventSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() !== eventId.toString()) continue;
    return {
      rowIndex: i + 1, // 1-based for getRange
      event: {
        eventId      : data[i][0].toString(),
        eventType    : data[i][1].toString(),
        title        : data[i][2].toString(),
        description  : data[i][3].toString(),
        hostMemberId : data[i][4].toString(),
        startDate    : data[i][5].toString(),
        startTime    : data[i][6].toString(),
        endDate      : data[i][7].toString(),
        endTime      : data[i][8].toString(),
        meetingLink  : data[i][9].toString(),
        assetsJson   : data[i][10].toString(),
        status       : data[i][11].toString(),
        isPinned     : data[i][12].toString().toUpperCase() === 'TRUE',
        createdBy    : data[i][13].toString(),
        createdOn    : data[i][14].toString()
      }
    };
  }
  return null;
}
 
/**
 * PRIVATE HELPER: Generates the next sequential asset ID within an existing assetsJson string.
 * Format: ARKA_EVTASSET_X where X is one higher than the highest existing ID in the array.
 *
 * @param {EventAsset[]} existingAssets - Already-parsed assets array
 * @returns {string} New asset ID, e.g. "ARKA_EVTASSET_3"
 */
function getNextAssetId(existingAssets) {
  if (!existingAssets || existingAssets.length === 0) return 'ARKA_EVTASSET_1';
  const nums = existingAssets.map(function(a) {
    const n = parseInt((a.assetId || '').split('_')[2]);
    return isNaN(n) ? 0 : n;
  });
  return 'ARKA_EVTASSET_' + (Math.max.apply(null, nums) + 1);
}
 
 
// ============================================================================
// STEP 5b — LAZY LOADER (called on-demand, NOT in Big Gulp)
// ============================================================================
 
/**
 * Lazy-loads all events and their RSVPs in a single backend call.
 * Called by the frontend when the user first opens Events & Announcements view.
 * NOT included in getAppMasterData() — keeps startup cost at zero.
 *
 * Returns ALL events (Upcoming + Past) so the frontend can filter by status/date.
 * Returns ALL RSVPs so the frontend can resolve attendee lists client-side.
 *
 * @returns {{ status: string, eventsDB: EventRecord[], rsvpsDB: EventRSVPRecord[] }}
 */
function getEventsData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
 
    // ── Read EventDB ────────────────────────────────────────────────────────
    const eventSheet = ss.getSheetByName(EVENT_SHEET);
    const eventsList = [];
 
    if (eventSheet) {
      const eData = eventSheet.getDataRange().getValues();
      for (let i = 1; i < eData.length; i++) {
        if (!eData[i][0]) continue;
 
        // Normalise Date objects to strings
        const rawStartDate = eData[i][5];
        const rawEndDate   = eData[i][7];
        const rawCreatedOn = eData[i][14];
 
        eventsList.push({
          eventId      : eData[i][0].toString(),
          eventType    : eData[i][1].toString(),
          title        : eData[i][2].toString(),
          description  : eData[i][3].toString(),
          hostMemberId : eData[i][4].toString(),
          startDate    : rawStartDate instanceof Date
            ? Utilities.formatDate(rawStartDate, 'Session.getScriptTimeZone()', 'dd-MMM-yyyy')
            : String(rawStartDate || ''),
          startTime : eData[i][6] instanceof Date
            ? Utilities.formatDate(eData[i][6], 'UTC', 'HH:mm')
            : String(eData[i][6] || ''),
          endDate      : rawEndDate instanceof Date
            ? Utilities.formatDate(rawEndDate, Session.getScriptTimeZone(), 'dd-MMM-yyyy')
            : String(rawEndDate || ''),
          endTime   : eData[i][8] instanceof Date
            ? Utilities.formatDate(eData[i][8], 'UTC', 'HH:mm')
            : String(eData[i][8] || ''),
          meetingLink  : eData[i][9].toString(),
          assetsJson   : eData[i][10].toString(),
          status       : eData[i][11].toString(),
          isPinned     : eData[i][12].toString().toUpperCase() === 'TRUE',
          createdBy    : eData[i][13].toString(),
          createdOn    : rawCreatedOn instanceof Date
            ? Utilities.formatDate(rawCreatedOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
            : String(rawCreatedOn || ''),
          eventTimezone : eData[i][15] ? eData[i][15].toString() : 'IST'
        });
      }
    }
 
    // ── Read EventRSVPDB ────────────────────────────────────────────────────
    const rsvpSheet = ss.getSheetByName(EVENT_RSVP_SHEET);
    const rsvpsList = [];
 
    if (rsvpSheet) {
      const rData = rsvpSheet.getDataRange().getValues();
      for (let i = 1; i < rData.length; i++) {
        if (!rData[i][0]) continue;
 
        const rawRsvpDate     = rData[i][4];
        const rawConfirmedOn  = rData[i][7];
 
        rsvpsList.push({
          rsvpId              : rData[i][0].toString(),
          eventId             : rData[i][1].toString(),
          memberId            : rData[i][2].toString(),
          rsvpStatus          : rData[i][3].toString(),
          rsvpDate            : rawRsvpDate instanceof Date
            ? Utilities.formatDate(rawRsvpDate, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
            : String(rawRsvpDate || ''),
          attendanceConfirmed : rData[i][5].toString(),
          confirmedBy         : rData[i][6].toString(),
          confirmedOn         : rawConfirmedOn instanceof Date
            ? Utilities.formatDate(rawConfirmedOn, Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z')
            : String(rawConfirmedOn || ''),
          addedBy             : rData[i][8].toString()
        });
      }
    }
 
    return { status: 'success', eventsDB: eventsList, rsvpsDB: rsvpsList };
 
  } catch (e) {
    console.error('getEventsData error:', e);
    return { status: 'error', message: e.toString(), eventsDB: [], rsvpsDB: [] };
  }
}
 
 
// ============================================================================
// STEP 5c — CREATE / EDIT / STATUS
// ============================================================================
 
/**
 * Creates a new event or updates an existing one.
 *
 * PERMISSION RULES:
 *   Create — Admin can create any event type.
 *             Members can create: BookBuddyRead, Social, Other.
 *             Meeting-Virtual and Meeting-F2F are admin-only.
 *   Update — Admin OR host OR original creator (canManageEvent).
 *
 * Pass data.eventId to update; omit (or null) to create.
 *
 * @param {Object}  data
 * @param {string}  [data.eventId]      - ARKA_EVENT_X to update; omit to create
 * @param {string}  data.eventType      - Meeting-Virtual | Meeting-F2F | BookBuddyRead | Social | Other
 * @param {string}  data.title          - Required
 * @param {string}  [data.description]  - Optional details
 * @param {string}  [data.hostMemberId] - Optional ARKA_MEMBER_X host
 * @param {string}  data.startDate      - dd-MMM-yyyy
 * @param {string}  [data.startTime]    - HH:mm
 * @param {string}  [data.endDate]      - dd-MMM-yyyy
 * @param {string}  [data.endTime]      - HH:mm
 * @param {string}  [data.meetingLink]  - URL
 * @param {boolean} [data.isPinned]     - Admin-only; ignored for non-admins on create
 * @returns {{ status: string, event?: EventRecord, message?: string }}
 */
function saveEvent(data) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  // ── Validate type permission (CREATE only) ────────────────────────────────
  // On edit, the type dropdown is disabled for non-admins so the original type
  // is always preserved. We only need to enforce admin-only types on creation.
  const adminOnlyTypes = ['Meeting-Virtual', 'Meeting-F2F'];
  if (!data.eventId && adminOnlyTypes.includes(data.eventType) && !isAdminMember(currentMemberId)) {
    return { status: 'error', message: 'Only admins can create Meeting events.' };
  }
 
  // ── Validate required fields ──────────────────────────────────────────────
  const title = (data.title || '').trim();
  if (!title)          return { status: 'error', message: 'Event title cannot be empty.' };
  if (!data.eventType) return { status: 'error', message: 'Event type is required.' };
  if (!data.startDate) return { status: 'error', message: 'Start date is required.' };
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventSheet = ss.getSheetByName(EVENT_SHEET);
  if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found. Please create it first.' };
 
  const timestamp  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  const isPinned   = isAdminMember(currentMemberId) ? (data.isPinned === true || data.isPinned === 'TRUE') : false;
 
  // ── UPDATE path ───────────────────────────────────────────────────────────
  if (data.eventId) {
    const found = getEventRowById(eventSheet, data.eventId);
    if (!found) return { status: 'error', message: 'Event not found.' };
 
    if (!canManageEvent(currentMemberId, found.event)) {
      return { status: 'error', message: 'You do not have permission to edit this event.' };
    }
 
    // Update editable columns B–J, M (type, title, desc, host, dates, times, link, isPinned)
    // Preserve assetsJson (Col K), status (Col L), createdBy (Col N), createdOn (Col O)
    eventSheet.getRange(found.rowIndex, 2, 1, 9).setValues([[
      data.eventType,
      title,
      (data.description  || '').trim(),
      (data.hostMemberId || '').trim(),
      (data.startDate    || '').trim(),
      (data.startTime    || '').trim(),
      (data.endDate      || '').trim(),
      (data.endTime      || '').trim(),
      (data.meetingLink  || '').trim()
    ]]);
    // Enforce plain-text format on time cells so Sheets never re-interprets
    // them as Date objects (which would re-introduce the UTC offset bug).
    eventSheet.getRange(found.rowIndex, 7).setNumberFormat('@STRING@'); // Col G: startTime
    eventSheet.getRange(found.rowIndex, 9).setNumberFormat('@STRING@'); // Col I: endTime
    eventSheet.getRange(found.rowIndex, 16).setValue((data.eventTimezone || 'IST').trim());
    // Update isPinned (Col M = column 13)
    eventSheet.getRange(found.rowIndex, 13).setValue(isPinned);
 
    const updatedEvent = Object.assign({}, found.event, {
      eventType    : data.eventType,
      title,
      description  : (data.description  || '').trim(),
      hostMemberId : (data.hostMemberId || '').trim(),
      startDate    : (data.startDate    || '').trim(),
      startTime    : (data.startTime    || '').trim(),
      endDate      : (data.endDate      || '').trim(),
      endTime      : (data.endTime      || '').trim(),
      meetingLink  : (data.meetingLink  || '').trim(),
      isPinned : isPinned,
      createdBy     : found.event.createdBy,    // preserved — never changes
      createdOn     : found.event.createdOn,    // preserved — never changes
      eventTimezone : (data.eventTimezone || 'IST').trim()
    });
 
    return { status: 'success', event: updatedEvent };
  }
 
  // ── CREATE path ───────────────────────────────────────────────────────────
  const sheetData  = eventSheet.getDataRange().getValues();
  let newNum = 1;
  if (sheetData.length > 1) {
    const lastId  = sheetData[sheetData.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const eventId = 'ARKA_EVENT_' + newNum;
 
  eventSheet.appendRow([
    eventId,                              // Col A
    data.eventType,                       // Col B
    title,                                // Col C
    (data.description  || '').trim(),     // Col D
    (data.hostMemberId || '').trim(),     // Col E
    (data.startDate    || '').trim(),     // Col F
    (data.startTime    || '').trim(),     // Col G
    (data.endDate      || '').trim(),     // Col H
    (data.endTime      || '').trim(),     // Col I
    (data.meetingLink  || '').trim(),     // Col J
    '[]',                                 // Col K — empty assets JSON array
    'Active',                             // Col L — status
    isPinned,                             // Col M
    currentMemberId,                      // Col N — createdBy
    timestamp,                             // Col O — createdOn
    (data.eventTimezone || 'IST').trim()   // Col P - timezone
  ]);

  const newRow = eventSheet.getLastRow();
  eventSheet.getRange(newRow, 7).setNumberFormat('@STRING@'); // startTime
  eventSheet.getRange(newRow, 9).setNumberFormat('@STRING@'); // endTime
  try { logActivity(currentMemberId, 'ARKA_ACTTYP_EVENTCREATED', 1, eventId); } catch(e) {}
 
  const newEvent = {
    eventId,
    eventType    : data.eventType,
    title,
    description  : (data.description  || '').trim(),
    hostMemberId : (data.hostMemberId || '').trim(),
    startDate    : (data.startDate    || '').trim(),
    startTime    : (data.startTime    || '').trim(),
    endDate      : (data.endDate      || '').trim(),
    endTime      : (data.endTime      || '').trim(),
    meetingLink  : (data.meetingLink  || '').trim(),
    assetsJson   : '[]',
    status       : 'Active',
    isPinned,
    createdBy    : currentMemberId,
    createdOn    : timestamp,
    eventTimezone : (data.eventTimezone || 'IST').trim()
  };
 
  return { status: 'success', event: newEvent };
}
 
 
/**
 * Updates the status of an event to Cancelled or Completed.
 * Only event managers (admin / host / creator) may do this.
 *
 * @param {string} eventId - ARKA_EVENT_X
 * @param {string} newStatus - 'Cancelled' | 'Completed'
 * @returns {{ status: string, message?: string }}
 */
function updateEventStatus(eventId, newStatus) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  const validStatuses = ['Cancelled', 'Completed', 'Active'];
  if (!validStatuses.includes(newStatus)) {
    return { status: 'error', message: 'Invalid status value.' };
  }
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventSheet = ss.getSheetByName(EVENT_SHEET);
  if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found.' };
 
  const found = getEventRowById(eventSheet, eventId);
  if (!found) return { status: 'error', message: 'Event not found.' };
 
  if (!canManageEvent(currentMemberId, found.event)) {
    return { status: 'error', message: 'You do not have permission to change this event\'s status.' };
  }
 
  eventSheet.getRange(found.rowIndex, 12).setValue(newStatus); // Col L = status
  if (newStatus === 'Cancelled') {
    try { logActivity(currentMemberId, 'ARKA_ACTTYP_EVENTCANCELLED', 1, eventId); } catch(e) {}
  }
  return { status: 'success' };
}
 
 
// ============================================================================
// STEP 5d — RSVP & PARTICIPANTS
// ============================================================================
 
/**
 * Handles both member self-RSVP and manager-added participants.
 *
 * SELF-RSVP: Any member can RSVP Yes/No/Maybe on any Active event.
 *   - If no existing row for this member+event, creates one.
 *   - If row exists with status Invited, updates it to the chosen status.
 *   - If row exists with Yes/No/Maybe, updates it.
 *
 * MANAGER-ADD: Admin/host/creator can add a member with status 'Invited'.
 *   - Creates a row for the target member with rsvpStatus = 'Invited'.
 *   - Auto-creates a targeted personal announcement notifying the invitee.
 *   - Fails silently on the announcement if AnnouncementDB is unavailable.
 *   - Will not duplicate: if member already has any row for this event, returns error.
 *
 * @param {Object} data
 * @param {string} data.eventId     - ARKA_EVENT_X
 * @param {string} data.memberId    - Target ARKA_MEMBER_X (self or admin-added)
 * @param {string} data.rsvpStatus  - 'Yes' | 'No' | 'Maybe' | 'Invited'
 * @returns {{ status: string, rsvp?: EventRSVPRecord, announcement?: Object, message?: string }}
 */
function saveEventRSVP(data) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  const validStatuses = ['Yes', 'No', 'Maybe', 'Invited'];
  if (!validStatuses.includes(data.rsvpStatus)) {
    return { status: 'error', message: 'Invalid RSVP status.' };
  }
 
  const isAddingParticipant = data.rsvpStatus === 'Invited';
 
  // Permission: adding a participant requires management rights
  if (isAddingParticipant) {
    const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
    const eventSheet = ss.getSheetByName(EVENT_SHEET);
    if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found.' };
 
    const found = getEventRowById(eventSheet, data.eventId);
    if (!found) return { status: 'error', message: 'Event not found.' };
 
    if (!canManageEvent(currentMemberId, found.event)) {
      return { status: 'error', message: 'Only admins, the host, or the event creator can add participants.' };
    }
  } else {
    // Self-RSVP: target member must be the caller
    if (data.memberId !== currentMemberId) {
      return { status: 'error', message: 'You can only update your own RSVP.' };
    }
  }
 
  const ss        = SpreadsheetApp.openById(SPREADSHEET_ID);
  const rsvpSheet = ss.getSheetByName(EVENT_RSVP_SHEET);
  if (!rsvpSheet) return { status: 'error', message: 'EventRSVPDB sheet not found.' };
 
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  const rsvpData  = rsvpSheet.getDataRange().getValues();
 
  // ── Check for existing row ────────────────────────────────────────────────
  for (let i = 1; i < rsvpData.length; i++) {
    if (rsvpData[i][1].toString() !== data.eventId.toString()) continue;
    if (rsvpData[i][2].toString() !== data.memberId.toString()) continue;
 
    // Row exists
    if (isAddingParticipant) {
      return { status: 'error', message: 'This member already has an RSVP for this event.' };
    }
 
    // Update existing row — only touch rsvpStatus (Col D) and rsvpDate (Col E)
    rsvpSheet.getRange(i + 1, 4, 1, 2).setValues([[data.rsvpStatus, timestamp]]);

    // Log with the existing rsvpId so the home feed resolves to current status.
    // Only log Yes/Maybe — 'No' entries are filtered out of the feed by design.
    const existingRsvpId = rsvpData[i][0].toString();
    if (data.rsvpStatus === 'Yes' || data.rsvpStatus === 'Maybe') {
      try { logActivity(data.memberId, 'ARKA_ACTTYP_EVENTRSVP', 1, existingRsvpId); } catch(e) {}
    }
 
    return {
      status: 'success',
      rsvp: {
        rsvpId              : existingRsvpId,
        eventId             : data.eventId,
        memberId            : data.memberId,
        rsvpStatus          : data.rsvpStatus,
        rsvpDate            : timestamp,
        attendanceConfirmed : rsvpData[i][5].toString(),
        confirmedBy         : rsvpData[i][6].toString(),
        confirmedOn         : rsvpData[i][7].toString(),
        addedBy             : rsvpData[i][8].toString()
      }
    };
  }
 
  // ── Create new RSVP row ───────────────────────────────────────────────────
  let newNum = 1;
  if (rsvpData.length > 1) {
    const lastId  = rsvpData[rsvpData.length - 1][0].toString();
    const lastNum = parseInt(lastId.split('_')[2]);
    if (!isNaN(lastNum)) newNum = lastNum + 1;
  }
  const rsvpId = 'ARKA_RSVP_' + newNum;
 
  rsvpSheet.appendRow([
    rsvpId,            // Col A
    data.eventId,      // Col B
    data.memberId,     // Col C
    data.rsvpStatus,   // Col D
    timestamp,         // Col E — rsvpDate
    '',                // Col F — attendanceConfirmed (blank until post-event)
    '',                // Col G — confirmedBy
    '',                // Col H — confirmedOn
    currentMemberId    // Col I — addedBy (who created this row)
  ]);

  // Store rsvpId (not eventId) so renderHomeFeed() can look up the live RSVP record,
  // get the current status (correct verb), and filter out 'No' RSVPs dynamically.
  if (data.rsvpStatus === 'Yes' || data.rsvpStatus === 'Maybe') {
    try { logActivity(data.memberId, 'ARKA_ACTTYP_EVENTRSVP', 1, rsvpId); } catch(e) {}
  }
 
  const newRsvp = {
    rsvpId,
    eventId             : data.eventId,
    memberId            : data.memberId,
    rsvpStatus          : data.rsvpStatus,
    rsvpDate            : timestamp,
    attendanceConfirmed : '',
    confirmedBy         : '',
    confirmedOn         : '',
    addedBy             : currentMemberId
  };
 
  // ── Auto-notification for Invited participants (Idea B) ───────────────────
  let createdAnnouncement = null;
  if (isAddingParticipant) {
    try {
      // Fetch the event title for the announcement body
      const eventSheet = ss.getSheetByName(EVENT_SHEET);
      const evtFound   = getEventRowById(eventSheet, data.eventId);
      const eventTitle = evtFound ? evtFound.event.title : 'an upcoming event';
 
      const annResult = saveAnnouncement({
        title          : '📅 You\'ve been invited to an event',
        body           : 'You\'ve been added to "' + eventTitle + '". Open Events & Announcements to RSVP.',
        isPinned       : false,
        expiryDate     : '',
        targetMemberId : data.memberId   // Personal — only this member sees it
      });
 
      if (annResult.status === 'success') createdAnnouncement = annResult.announcement;
    } catch (annErr) {
      // Announcement failure should never block the RSVP write
      console.error('Auto-invite announcement failed (non-fatal):', annErr);
    }
  }
 
  return { status: 'success', rsvp: newRsvp, announcement: createdAnnouncement };
}
 
 
/**
 * Confirms or removes attendance confirmation for a participant post-event.
 * Only event managers (admin / host / creator) can confirm attendance.
 *
 * @param {Object} data
 * @param {string} data.rsvpId              - ARKA_RSVP_X to update
 * @param {string} data.eventId             - ARKA_EVENT_X (used for permission check)
 * @param {string} data.attendanceConfirmed - 'Yes' | 'No' | '' (blank to reset)
 * @returns {{ status: string, message?: string }}
 */
function confirmEventAttendance(data) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventSheet = ss.getSheetByName(EVENT_SHEET);
  if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found.' };
 
  const found = getEventRowById(eventSheet, data.eventId);
  if (!found) return { status: 'error', message: 'Event not found.' };
 
  if (!canManageEvent(currentMemberId, found.event)) {
    return { status: 'error', message: 'Only admins, the host, or the creator can confirm attendance.' };
  }
 
  const rsvpSheet = ss.getSheetByName(EVENT_RSVP_SHEET);
  if (!rsvpSheet) return { status: 'error', message: 'EventRSVPDB sheet not found.' };
 
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  const rsvpRows  = rsvpSheet.getDataRange().getValues();
 
  for (let i = 1; i < rsvpRows.length; i++) {
    if (rsvpRows[i][0].toString() !== data.rsvpId.toString()) continue;
 
    // Update cols F, G, H: attendanceConfirmed, confirmedBy, confirmedOn
    rsvpSheet.getRange(i + 1, 6, 1, 3).setValues([[
      data.attendanceConfirmed || '',
      data.attendanceConfirmed ? currentMemberId : '',
      data.attendanceConfirmed ? timestamp       : ''
    ]]);

    if (data.attendanceConfirmed === 'Yes') {
      // Log against the participant's memberId (not the confirming admin's)
      const attendeeMemberId = rsvpRows[i][2].toString();
      try { logActivity(attendeeMemberId, 'ARKA_ACTTYP_EVENTATTENDED', 1, data.eventId); } catch(e) {}
    }
 
    return { status: 'success' };
  }
 
  return { status: 'error', message: 'RSVP record not found.' };
}
 
 
// ============================================================================
// STEP 5e — ASSETS
// ============================================================================
 
/**
 * Uploads a file to the Event Assets Drive folder and appends the asset
 * metadata to the event's assetsJson column.
 *
 * Only event managers (admin / host / creator) can add assets.
 * Accepts any file type; Drive's built-in viewer handles rendering.
 * The stored driveLink opens the file in a new browser window via Drive viewer.
 *
 * @param {Object} data
 * @param {string} data.eventId      - ARKA_EVENT_X to attach the asset to
 * @param {string} data.assetTitle   - Display name shown in the app
 * @param {string} data.assetType    - Photo | PDF | PPT | Document | Other
 * @param {string} data.fileBase64   - Data URI: "data:mime/type;base64,..."
 * @param {string} data.fileName     - Original filename including extension
 * @param {string} data.mimeType     - MIME type, e.g. "image/jpeg", "application/pdf"
 * @returns {{ status: string, asset?: EventAsset, updatedAssetsJson?: string, message?: string }}
 */
function uploadEventAsset(data) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventSheet = ss.getSheetByName(EVENT_SHEET);
  if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found.' };
 
  const found = getEventRowById(eventSheet, data.eventId);
  if (!found) return { status: 'error', message: 'Event not found.' };
 
  if (!canManageEvent(currentMemberId, found.event)) {
    return { status: 'error', message: 'You do not have permission to add assets to this event.' };
  }
 
  if (!data.fileBase64) return { status: 'error', message: 'No file data received.' };
  if (!data.fileName)   return { status: 'error', message: 'File name is required.' };
 
  // ── Upload to Drive ───────────────────────────────────────────────────────
  const folder    = DriveApp.getFolderById(EVENT_ASSETS_FOLDER_ID);
  const rawBase64 = data.fileBase64.includes(',') ? data.fileBase64.split(',')[1] : data.fileBase64;
  const mimeType  = data.mimeType || 'application/octet-stream';
 
  // Prefix filename with eventId so assets are easy to find in Drive
  const safeFileName = data.eventId + '_' + data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob          = Utilities.newBlob(Utilities.base64Decode(rawBase64), mimeType, safeFileName);
  const uploadedFile  = folder.createFile(blob);
 
  // Make the file accessible to anyone with the link
  uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
 
  // Drive viewer URL — opens in new window without downloading
  const driveLink = 'https://drive.google.com/file/d/' + uploadedFile.getId() + '/view';
 
  // ── Append to assetsJson ──────────────────────────────────────────────────
  const timestamp     = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z');
  let existingAssets  = [];
 
  try {
    const raw = found.event.assetsJson.trim();
    if (raw && raw !== '[]') existingAssets = JSON.parse(raw);
  } catch (e) {
    existingAssets = []; // Corrupt JSON — start fresh, don't block upload
  }
 
  const newAsset = {
    assetId    : getNextAssetId(existingAssets),
    type       : data.assetType  || 'Other',
    title      : (data.assetTitle || data.fileName).trim(),
    driveLink,
    uploadedBy : currentMemberId,
    uploadedOn : timestamp
  };
 
  existingAssets.push(newAsset);
  const updatedAssetsJson = JSON.stringify(existingAssets);
 
  // Write back to Col K (column 11)
  eventSheet.getRange(found.rowIndex, 11).setValue(updatedAssetsJson);
 
  return { status: 'success', asset: newAsset, updatedAssetsJson };
}
 
 
/**
 * Removes a single asset from an event's assetsJson by its assetId.
 * The Drive file is NOT deleted — it remains in the folder for safety.
 * Only event managers can remove assets.
 *
 * @param {Object} data
 * @param {string} data.eventId  - ARKA_EVENT_X
 * @param {string} data.assetId  - ARKA_EVTASSET_X to remove
 * @returns {{ status: string, updatedAssetsJson?: string, message?: string }}
 */
function removeEventAsset(data) {
  const currentMemberId = getVerifiedMemberId();
  if (!currentMemberId) return { status: 'error', message: 'Unauthorized session.' };
 
  const ss         = SpreadsheetApp.openById(SPREADSHEET_ID);
  const eventSheet = ss.getSheetByName(EVENT_SHEET);
  if (!eventSheet) return { status: 'error', message: 'EventDB sheet not found.' };
 
  const found = getEventRowById(eventSheet, data.eventId);
  if (!found) return { status: 'error', message: 'Event not found.' };
 
  if (!canManageEvent(currentMemberId, found.event)) {
    return { status: 'error', message: 'You do not have permission to remove assets from this event.' };
  }

  let assets = [];
  try {
    assets = JSON.parse(found.event.assetsJson || '[]');
  } catch (e) {
    return { status: 'error', message: 'Could not parse assets data.' };
  }
 
  const filtered          = assets.filter(function(a) { return a.assetId !== data.assetId; });
  const updatedAssetsJson = JSON.stringify(filtered);
 
  eventSheet.getRange(found.rowIndex, 11).setValue(updatedAssetsJson);
 
  return { status: 'success', updatedAssetsJson };
}

/**
 * Silently records a single app load timing row to AppLoadTimingDB.
 *
 * Called fire-and-forget from the frontend — no success/failure handler.
 * Never throws; all errors are swallowed so a timing failure cannot
 * surface as a visible error to the user.
 *
 * Schema (AppLoadTimingDB):
 *   A  MemberID    - ARKA_MEMBER_X (or 'UNKNOWN' if session unresolvable)
 *   B  Timestamp   - dd-MM-yyyy HH:mm:ss Z
 *   C  AppVersion  - e.g. 'v37'
 *   D  BigGulpMs   - ms from T0 to Big Gulp success handler firing
 *   E  RenderMs    - ms from Big Gulp done to first render complete
 *   F  TotalMs     - ms from T0 to first render complete (D + E)
 *
 * @param {Object} data
 * @param {string} data.appVersion  - APP_VERSION constant from frontend
 * @param {number} data.bigGulpMs   - Network + GAS execution time
 * @param {number} data.renderMs    - Client-side render time
 * @param {number} data.totalMs     - Total perceived load time
 */
function logAppLoadTime(data) {
  try {
    // Resolve member silently — uses cached value so no extra sheet read
    const memberId  = getVerifiedMemberId() || 'UNKNOWN';
    const timestamp = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm:ss Z'
    );
 
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
                                .getSheetByName('AppLoadTimingDB');
 
    // If sheet doesn't exist yet, fail silently — don't crash the app
    if (!sheet) {
      console.warn('AppLoadTimingDB sheet not found — skipping timing log.');
      return;
    }
 
    sheet.appendRow([
      memberId,
      timestamp,
      data.appVersion || '',
      Number(data.bigGulpMs) || 0,
      Number(data.renderMs)  || 0,
      Number(data.totalMs)   || 0
    ]);
 
  } catch (e) {
    // Swallow everything — timing failure must never affect the user
    console.error('logAppLoadTime failed (non-fatal):', e);
  }
}
 
