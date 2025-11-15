/**
 * Google Apps Script for Survey Data Submission
 * 
 * This script receives survey data from your website and writes it to a Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with headers in Row 1 (see GOOGLE_SHEETS_SETUP.md)
 * 2. Copy this code into Google Apps Script (Extensions → Apps Script)
 * 3. Replace 'YOUR_SHEET_NAME' below with your actual sheet name
 * 4. Deploy as Web App (Deploy → New deployment → Web app)
 * 5. Set "Who has access" to "Anyone"
 * 6. Copy the Web App URL and update survey-data-handler.js
 */

// CONFIGURATION: Replace with your Google Sheet names
// You can use the same sheet with different tabs, or different sheets
const SHEET_PAGE1 = 'Sheet1'; // Sheet name for Page 1 data (6 columns)
const SHEET_PAGE7 = 'Sheet1'; // Sheet name for Page 7 data (8 columns) - can be same or different
const SHEET_PLAN = 'Sheet1'; // Sheet name for Plan data (1 column) - can be same or different

// If you want to use different tabs in the same sheet, use tab names like:
// const SHEET_PAGE1 = 'Page1Data';
// const SHEET_PAGE7 = 'Page7Data';
// const SHEET_PLAN = 'PlanData';

/**
 * Handle GET requests (for testing/verification)
 */
function doGet(e) {
  return ContentService.createTextOutput('Survey Data Handler is active and ready to receive POST requests.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main function that handles POST requests from your website
 */
function doPost(e) {
  try {
    // Get the active spreadsheet (the one this script is attached to)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging (check Apps Script logs: View → Logs)
    Logger.log('Received data: ' + JSON.stringify(data));
    
    let rowData;
    let targetSheet;
    
    // Check dataType to determine which sheet/columns to use
    if (data.dataType === 'page7') {
      // Get the SAME sheet as page 1 (they should be in the same sheet, same row)
      targetSheet = spreadsheet.getSheetByName(SHEET_PAGE1);
      if (!targetSheet) {
        throw new Error('Sheet "' + SHEET_PAGE1 + '" not found. Please check the sheet name.');
      }
      
      // Page 7 data - 8 columns: 5 toggles FIRST, then zip + name + email
      // IMPORTANT: Order must be: 1. Has pets/children, 2. Interested in additional pay, 3. Owns car, 4. Has references, 5. Has college degree, 6. Zip Code, 7. First Name, 8. Email
      // NO TIMESTAMP - explicitly exclude timestamp if it exists
      rowData = [
        data['Has pets or children'] || 'no',
        data['Interested in additional hourly pay'] || 'no',
        data['Owns a car'] || 'no',
        data['Has references'] || 'no',
        data['Has college degree'] || 'no',
        data.zipCode || '',
        data.firstName || '',
        data.email || ''
      ];
      
      // Log to verify no timestamp
      Logger.log('Page 7 data keys: ' + Object.keys(data).join(', '));
      Logger.log('Page 7 rowData (8 items): ' + rowData.length);
      
      // Find the last row (which should have page 1 data) and append page 7 data to it
      const lastRow = targetSheet.getLastRow();
      if (lastRow < 2) {
        // No data row exists yet, create a new row
        targetSheet.appendRow(rowData);
        Logger.log('Created new row with page 7 data (no page 1 data found)');
      } else {
        // Append page 7 data to the last row (same row as page 1 data)
        const existingRow = targetSheet.getRange(lastRow, 1, 1, targetSheet.getLastColumn()).getValues()[0];
        const newRow = existingRow.concat(rowData);
        targetSheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
        Logger.log('Appended page 7 data to row ' + lastRow + ' (same row as page 1 data)');
      }
      
      Logger.log('Saving page 7 data (8 columns) to sheet: ' + SHEET_PAGE1);
      Logger.log('Row data: ' + JSON.stringify(rowData));
      
      // Return early since we already saved the data
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Page 7 data saved successfully to same row',
        rowCount: targetSheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
      
    } else if (data.dataType === 'plan') {
      // Get the sheet for plan data
      targetSheet = spreadsheet.getSheetByName(SHEET_PLAN);
      if (!targetSheet) {
        throw new Error('Sheet "' + SHEET_PLAN + '" not found. Please check the sheet name.');
      }
      
      // Plan selection - 1 column: Plan (Basic or Premium)
      rowData = [
        data.plan || ''
      ];
      Logger.log('Saving plan selection (1 column) to sheet: ' + SHEET_PLAN);
      Logger.log('Row data: ' + JSON.stringify(rowData));
    } else if (data.dataType === 'page1') {
      // Get the sheet for page 1 data
      targetSheet = spreadsheet.getSheetByName(SHEET_PAGE1);
      if (!targetSheet) {
        throw new Error('Sheet "' + SHEET_PAGE1 + '" not found. Please check the sheet name.');
      }
      
      // Page 1 data - 6 columns: Duration, Work/Study, Age, Gender, Location, Help Areas
      // NO TIMESTAMP - matching your 6 headers
      rowData = [
        data.duration || '',
        data.workStudy || '',
        data.age || '',
        data.gender || '',
        data.locationPreferences || '',
        data.helpAreas || ''
      ];
      Logger.log('Saving page 1 data (6 columns, no timestamp) to sheet: ' + SHEET_PAGE1);
      Logger.log('Row data: ' + JSON.stringify(rowData));
    } else {
      // Fallback for old format (without dataType)
      targetSheet = spreadsheet.getSheetByName(SHEET_PAGE1);
      if (!targetSheet) {
        throw new Error('Sheet "' + SHEET_PAGE1 + '" not found. Please check the sheet name.');
      }
      
      // Page 1 data - 6 columns: Duration, Work/Study, Age, Gender, Location, Help Areas
      // NO TIMESTAMP - matching your 6 headers
      rowData = [
        data.duration || '',
        data.workStudy || '',
        data.age || '',
        data.gender || '',
        data.locationPreferences || '',
        data.helpAreas || ''
      ];
      Logger.log('Saving page 1 data (6 columns, no timestamp, fallback) to sheet: ' + SHEET_PAGE1);
      Logger.log('Row data: ' + JSON.stringify(rowData));
    }
    
    // Append the row to the appropriate sheet (only if not page7, which is handled above)
    if (data.dataType !== 'page7') {
      targetSheet.appendRow(rowData);
      Logger.log('Data saved successfully. Row count: ' + targetSheet.getLastRow());
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully',
      rowCount: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - you can run this manually to test the script
 * (Run → Run function → testSubmission)
 */
function testSubmission() {
  const testData = {
    timestamp: new Date().toISOString(),
    duration: '3-6 months',
    workStudy: 'I will work/study from home',
    age: '25-35',
    gender: 'Female',
    locationPreferences: 'I want to stay within my local area',
    helpAreas: 'Cooking; Cleaning',
    zipCode: '12345',
    firstName: 'Test User',
    email: 'test@example.com',
    'Has pets or children': 'no',
    'Interested in additional hourly pay': 'yes',
    'Owns a car': 'yes',
    'Has references': 'yes',
    'Has college degree': 'yes'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

