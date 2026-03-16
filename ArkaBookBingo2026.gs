/**
 * ARKA BOOK BINGO 2026 - Optimized Backend
 */

const SS_ID = '1AaGClZVoDcq-YOnd1cUwWWl6ZgEiuTDS5fvalp71_o0';
const CUES_SHEET = 'BookBingoCueData'; 
const DATA_SHEET = 'BookBingoChallengeData'; 

const CONFIG = {
  YEAR: 2026,
  ROWS: 3,
  COLS: 4,
  TOTAL_CUES: 12
};

function doGet() {
  return HtmlService.createTemplateFromFile('ArkaBookBingo')
    .evaluate()
    .setTitle('Arka Book Bingo ' + CONFIG.YEAR)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getInitialData() {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const dataSheet = ss.getSheetByName(DATA_SHEET);
    const data = dataSheet.getDataRange().getValues();
    
    const names = [...new Set(data.slice(1).map(row => row[2]))].filter(String).sort();
    
    const allStats = names.map(name => {
      const userRows = data.filter(r => r[2] === name && r[0] == CONFIG.YEAR);
      const grid = userRows.map(r => ({
        cueId: r[1],
        status: r[5] || 'Not Started'
      })).sort((a,b) => a.cueId - b.cueId);
      
      const completed = userRows.filter(r => r[5] === 'Completed').length;
      return { name, completed, grid };
    });

    return { names, allStats, config: CONFIG };
  } catch (e) {
    throw new Error("Failed to load initial data: " + e.message);
  }
}

function getMemberStatus(name) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const cueSheet = ss.getSheetByName(CUES_SHEET);
  const dataSheet = ss.getSheetByName(DATA_SHEET);
  
  const cuesData = cueSheet.getDataRange().getValues().slice(1);
  const challengeData = dataSheet.getDataRange().getValues().slice(1);
  
  const cuesMap = {};
  cuesData.filter(r => r[0] == CONFIG.YEAR).forEach(r => {
    cuesMap[r[1]] = r[2];
  });
  
  const userProgress = challengeData.filter(r => r[2] === name && r[0] == CONFIG.YEAR);
  
  const gridData = userProgress.map(r => ({
    cueId: r[1],
    cueText: cuesMap[r[1]] || 'Unknown Cue',
    book: r[3] || '',
    author: r[4] || '',
    status: r[5] || 'Not Started'
  })).sort((a, b) => a.cueId - b.cueId);
  
  return { grid: gridData };
}

function registerNewMember(name) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const dataSheet = ss.getSheetByName(DATA_SHEET);
  const cueSheet = ss.getSheetByName(CUES_SHEET);
  
  // 1. Check for Uniqueness
  const lastRow = dataSheet.getLastRow();
  let existingNames = [];
  if (lastRow > 1) {
    existingNames = dataSheet.getRange(2, 3, lastRow - 1, 1).getValues().flat();
  }
  
  if (existingNames.includes(name)) {
    return "Error: This name is already taken! Try adding an initial or a nickname.";
  }

  // 2. Fetch Cues for current year
  const cues = cueSheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] == CONFIG.YEAR);
    
  if (cues.length === 0) return "Error: No cues found for " + CONFIG.YEAR;
  
  // 3. Prepare rows
  const newRows = cues.map(c => [CONFIG.YEAR, c[1], name, '', '', 'Not Started', '']);
  dataSheet.getRange(dataSheet.getLastRow() + 1, 1, newRows.length, 7).setValues(newRows);
  
  return "Success! You are now registered. Select your name from the list to start.";
}

function updateSheet(name, cueId, book, author, status) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName(DATA_SHEET);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == CONFIG.YEAR && data[i][1] == cueId && data[i][2] === name) {
        const completedDate = (status === 'Completed') ? new Date() : '';
        sheet.getRange(i + 1, 4, 1, 4).setValues([[book, author, status, completedDate]]);
        SpreadsheetApp.flush(); // Ensure data is written before returning
        return true;
      }
    }
    return false;
  } catch (e) {
    throw new Error("Update failed: " + e.message);
  }
}

// --- ADD THIS TO THE BOTTOM OF Code.gs ---

function getLeaderboardData() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const dataSheet = ss.getSheetByName(DATA_SHEET);
  const rawData = dataSheet.getDataRange().getValues().slice(1); // Skip header

  // Filter for current year
  const yearData = rawData.filter(r => r[0] == CONFIG.YEAR);

  // Group data by User
  const userMap = {};
  
  yearData.forEach(r => {
    const name = r[2];
    const cueId = r[1]; // Assuming Cue IDs are starting from 1
    const status = r[5];
    const date = r[6] ? new Date(r[6]).getTime() : 0; // Column G is Completed Date

    if (!userMap[name]) {
      userMap[name] = { 
        name: name, 
        completed: 0, 
        lastActive: 0,
        grid: [] // We will store simple status objects
      };
    }

    if (status === 'Completed') {
      userMap[name].completed++;
      // Track the LATEST completion time for tie-breaking
      if (date > userMap[name].lastActive) userMap[name].lastActive = date;
    }
    
    // Push status for the mini-grid
    userMap[name].grid.push({ id: cueId, status: status });
  });

  // Convert map to array and sort
  const leaderboard = Object.values(userMap).map(u => {
    // Ensure grid is sorted 1-12 so the colors match the board layout
    u.grid.sort((a, b) => a.id - b.id);
    return u;
  });

  // SORTING LOGIC:
  // 1. Most books completed (Descending)
  // 2. If tie, who finished earliest? (Ascending Date)
  leaderboard.sort((a, b) => {
    if (b.completed !== a.completed) return b.completed - a.completed;
    return a.lastActive - b.lastActive;
  });

  return leaderboard;
}
