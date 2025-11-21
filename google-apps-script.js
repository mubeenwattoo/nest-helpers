/**
 * Google Apps Script for NestHelpers Survey Data Collection
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete the default code and paste this entire script
 * 4. Replace 'YOUR_SHEET_NAME' with your actual sheet name (or leave as 'Sheet1' if using default)
 * 5. Click the Save icon (💾) and give your project a name
 * 6. Click Deploy > New deployment
 * 7. Click the gear icon ⚙️ next to "Select type" and choose "Web app"
 * 8. Set the following:
 *    - Description: "Survey Data Collector"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL that appears
 * 11. In your host-pricing-page.html, replace 'YOUR_GOOGLE_APPS_SCRIPT_URL' with this URL
 *     OR add a script tag: <script data-google-script-url="YOUR_URL_HERE"></script>
 * 
 * COLUMN HEADERS (will be created automatically):
 * Timestamp, Services, Duration, Work Time, Gender Preference, Hours Per Week, 
 * Food Arrangement, Household Members, Head of Household Age, Bedroom Count, 
 * Zip Code, Address, First Name, Email, Selected Plan
 */

// Test function - allows you to verify the script is working by visiting the URL
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      'status': 'success', 
      'message': 'Google Apps Script is working! Ready to receive POST requests.',
      'instructions': 'This script accepts POST requests with form data. Use it from your website form submission.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Get or create the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Check if headers exist, if not create them
    const firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell || firstCell !== 'Timestamp') {
      const headers = [
        'Timestamp',
        'Last Updated',
        'Session ID',
        'Services',
        'Duration',
        'Work Time',
        'Gender Preference',
        'Hours Per Week',
        'Food Arrangement',
        'Household Members',
        'Head of Household Age',
        'Bedroom Count',
        'Zip Code',
        'Address',
        'First Name',
        'Email',
        'Selected Plan',
        'Current Page'
      ];
      const headerRow = sheet.getRange(1, 1, 1, headers.length);
      headerRow.setValues([headers]);
      headerRow.setFontWeight('bold');
      headerRow.setBackground('#5B7B5A');
      headerRow.setFontColor('#FFFFFF');
    }
    
    // Get the form data
    const formData = e.parameter;
    
    // Get identifier (email preferred, fallback to session ID)
    const email = (formData.email || '').trim();
    const sessionId = (formData.sessionId || '').trim();
    const identifier = email || sessionId;
    
    // Find existing row by email or session ID
    let existingRowIndex = -1;
    if (identifier) {
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Find column indices
      const emailColIndex = 15; // Email column (0-indexed: column 16 = index 15)
      const sessionIdColIndex = 2; // Session ID column (0-indexed: column 3 = index 2)
      
      // Search for existing row
      for (let i = 1; i < values.length; i++) { // Start from row 2 (skip header)
        const rowEmail = (values[i][emailColIndex] || '').toString().trim();
        const rowSessionId = (values[i][sessionIdColIndex] || '').toString().trim();
        
        // Match by email if available, otherwise by session ID
        if (email && rowEmail && rowEmail.toLowerCase() === email.toLowerCase()) {
          existingRowIndex = i + 1; // +1 because sheet rows are 1-indexed
          break;
        } else if (!email && sessionId && rowSessionId === sessionId) {
          existingRowIndex = i + 1;
          break;
        }
      }
    }
    
    // Prepare the row data in the correct sequence
    const rowData = [
      formData.timestamp || new Date().toISOString(),
      formData.lastUpdated || new Date().toISOString(),
      sessionId || '',
      formData.services || '',
      formData.duration || '',
      formData.workTime || '',
      formData.genderPreference || '',
      formData.hoursPerWeek || '',
      formData.foodArrangement || '',
      formData.householdMembers || '',
      formData.headOfHouseholdAge || '',
      formData.bedroomCount || '',
      formData.zipCode || '',
      formData.address || '',
      formData.firstName || '',
      email || '',
      formData.selectedPlan || '',
      formData.currentPage || ''
    ];
    
    if (existingRowIndex > 0) {
      // Update existing row - merge data (keep existing values if new value is empty)
      const existingRow = sheet.getRange(existingRowIndex, 1, 1, rowData.length).getValues()[0];
      const mergedRow = rowData.map((newValue, index) => {
        // For timestamp, keep the original (first submission)
        if (index === 0) return existingRow[index] || newValue;
        // For other fields, prefer new value if not empty, otherwise keep existing
        return (newValue && newValue.toString().trim() !== '') ? newValue : (existingRow[index] || '');
      });
      
      sheet.getRange(existingRowIndex, 1, 1, mergedRow.length).setValues([mergedRow]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          'result': 'success', 
          'action': 'updated', 
          'row': existingRowIndex 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Append new row
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          'result': 'success', 
          'action': 'created', 
          'row': sheet.getLastRow() 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
// Optional: Test function to verify the script works
function testDoPost() {
  const mockEvent = {
    parameter: {
      timestamp: new Date().toISOString(),
      services: 'Cooking, Cleaning',
      duration: 'More than 6 months',
      workTime: 'Daytime',
      genderPreference: 'Either',
      hoursPerWeek: '10 hours or less',
      foodArrangement: 'Provide food or meals',
      householdMembers: '3',
      headOfHouseholdAge: '30-39',
      bedroomCount: '4',
      zipCode: '12345',
      address: '123 Main St',
      firstName: 'Test',
      email: 'test@example.com',
      selectedPlan: 'Premium'
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}


