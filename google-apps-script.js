// =====================================================
// Google Apps Script - IESE Survey Backend
// =====================================================
// HOW TO SET UP:
// 1. Go to https://script.google.com
// 2. Create a new project (name it "IESE Survey")
// 3. Paste this code in Code.gs
// 4. Click Deploy > New Deployment
// 5. Type: Web App
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. Click Deploy and copy the URL
// 9. Paste the URL into index.html (replace YOUR_GOOGLE_APPS_SCRIPT_URL)
//
// The script auto-creates a Google Sheet called "IESE Survey Responses"
// in your Drive. Share it with your dad so he can see results.
// =====================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      data.timestamp,
      data.name,
      data.rank1_topic,
      data.rank2_topic,
      data.rank3_topic
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Optional: return results as JSON (for an admin dashboard)
  const action = e.parameter.action;

  if (action === 'results') {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok', responses: rows })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'IESE Survey API' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const SHEET_NAME = 'IESE Survey Responses';

  // Look for existing spreadsheet
  const files = DriveApp.getFilesByName(SHEET_NAME);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.open(file).getActiveSheet();
  }

  // Create new spreadsheet
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const sheet = ss.getActiveSheet();

  // Set headers
  sheet.appendRow([
    'Timestamp',
    'Nom',
    '1r Preferit',
    '2n Preferit',
    '3r Preferit'
  ]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, 5);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a2332');
  headerRange.setFontColor('#ffffff');

  // Set column widths
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 200); // Name
  sheet.setColumnWidth(3, 300); // Rank 1
  sheet.setColumnWidth(4, 300); // Rank 2
  sheet.setColumnWidth(5, 300); // Rank 3

  // Freeze header
  sheet.setFrozenRows(1);

  return sheet;
}

// Test function - run this to verify setup
function testSetup() {
  const sheet = getOrCreateSheet();
  Logger.log('Sheet created/found: ' + sheet.getParent().getUrl());
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Rows: ' + sheet.getLastRow());
}
