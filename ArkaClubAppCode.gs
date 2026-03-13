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

const APP_VERSION = "v26";
const SPREADSHEET_ID = '1qXsAAO_9aIEJuTTQ1ziX9s5plvm6WHaVI_zaKcSXF-4';
const MEMBERS_SHEET = "MemberDB";
const LIBRARY_SHEET = "ArkaLibraryDB";
const SHELF_SHEET = "MemberShelfDB";
const ACTIVITYLOG_SHEET = "ActivityLogDB";
const FEEDBACK_SHEET ="FeedbackDB";
const PAGELOG_SHEET = "PageLogDB";
const PROFILE_PICS_FOLDER_ID = '11n3v_TfITYYOCg-IQRFSrgqs89M0T1j8';

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
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_PROFILEUPDATE", 1); 
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
function logActivity(memberId, activityTypeID, activityValue, description = "") {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // A: Calculate Club Points earned for this action
  const typeSheet = ss.getSheetByName("ActivityTypeDB");
  const typeData = typeSheet.getDataRange().getValues();
  let multiplier = 0;
  
  for (let i = 1; i < typeData.length; i++) {
    if (typeData[i][0] === activityTypeID) { 
      multiplier = Number(typeData[i][4]) || 0; 
      break;
    }
  }
  
  const cpAwarded = activityValue * multiplier;
  
  // B: Generate a sequential Activity ID
  const logSheet = ss.getSheetByName(ACTIVITYLOG_SHEET);
  const logData = logSheet.getDataRange().getValues();
  let newActNum = 1;
  
  if (logData.length > 1) {
    let lastIdString = logData[logData.length - 1][0]; 
    let lastNum = parseInt(lastIdString.split('_')[2]);
    if (!isNaN(lastNum)) newActNum = lastNum + 1;
  }
  const activityId = "ARKA_ACT_" + newActNum;
  
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
function logActivityBatch(memberId, activityData, activityValue = 1, description = "") {
  const lock = LockService.getScriptLock();
  // Wait up to 5 seconds for other processes to finish writing
  if (!lock.tryLock(5000)) {
    console.error("System busy. Could not write activity log.");
    return [];
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Load Activity Multipliers into a Dictionary for instant lookup (No looping!)
    const typeData = ss.getSheetByName("ActivityTypeDB").getDataRange().getValues();
    let multiplierMap = {};
    for (let i = 1; i < typeData.length; i++) {
      if (typeData[i][0]) multiplierMap[typeData[i][0]] = Number(typeData[i][4]) || 0;
    }

    // 2. Normalize input to an array so we can always batch process
    let pendingLogs = [];
    if (Array.isArray(activityData)) {
      pendingLogs = activityData; // Format expected: [{typeId: "...", val: 1, desc: "..."}, ...]
    } else {
      pendingLogs = [{ typeId: activityData, val: activityValue, desc: description }];
    }

    // 3. Get current state of the Log DB to generate sequential IDs
    const logSheet = ss.getSheetByName(ACTIVITYLOG_SHEET);
    const logData = logSheet.getDataRange().getValues();
    let currentActNum = 1;
    if (logData.length > 1) {
      let lastIdString = logData[logData.length - 1][0]; 
      let lastNum = parseInt(lastIdString.split('_')[2]);
      if (!isNaN(lastNum)) currentActNum = lastNum;
    }

    const activityDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy HH:mm:ss Z");
    const rowsToWrite = [];
    const returnedLogs = [];

    // 4. Build the data grid in memory
    pendingLogs.forEach(log => {
      currentActNum++;
      let activityId = "ARKA_ACT_" + currentActNum;
      let cpAwarded = (log.val || 1) * (multiplierMap[log.typeId] || 0);
      
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
      logSheet.getRange(logData.length + 1, 1, rowsToWrite.length, rowsToWrite[0].length).setValues(rowsToWrite);
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
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_BOOKADDED", 1, newBookId); 
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
      finalActivitiesLogged = logActivityBatch(currentMemberId, newActivitiesQueue);
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
    newActivity = logActivity(currentMemberId, "ARKA_ACTTYP_BOOKUPDATE", 1, bookData.bookId); 
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
  const activityLogData = activityLogSheet.getDataRange().getValues();
  let activityLogList = [];
  for (let i = 1; i < activityLogData.length; i++) {
    if (activityLogData[i][0]) {
      
      activityLogList.push({
        activityID: activityLogData[i][0],
        activityTypeID: activityLogData[i][1],
        activityDate: activityLogData[i][2],
        activityMemberID: activityLogData[i][3],
        activityDesc: activityLogData[i][4] || "",
        activitySource: activityLogData[i][5] || "",
        activityCPAwarded: Number(activityLogData[i][6]) || 0
      });
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

  return {
    status: "success",
    memberLevelsDB: levelList,
    membersDB: membersList,
    booksDB: libraryList,
    shelvesDB: shelvesList,
    activityTypeDB: activityTypeList,
    activityLogDB: activityLogList,
    pageLogDB: pageLogDB
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
  const data = sheet.getDataRange().getValues();
  let logList = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      logList.push({
        activityID: data[i][0],
        activityTypeID: data[i][1],
        activityDate: data[i][2],
        activityMemberID: data[i][3],
        activityDesc: data[i][4] || "", // This holds the BookID
        activitySource: data[i][5] || "",
        activityCPAwarded: Number(data[i][6]) || 0
      });
    }
  }
  return logList;
}

/**
 * PRIVATE HELPER: Validates the active session and returns the Member ID.
 * This is the "Security Guard" that prevents ID spoofing.
 */
function getVerifiedMemberId() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(MEMBERS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    let storedEmails = data[i][1].toString().toLowerCase().split(',');
    if (storedEmails.map(e => e.trim()).includes(email)) {
      return data[i][0]; // Return the ARKA_MEMBER_ID
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
      newActivity = logActivity(data.memberId, "ARKA_ACTTYP_FEEDBACK", 1, `${data.category} in ${data.section}`); 
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
