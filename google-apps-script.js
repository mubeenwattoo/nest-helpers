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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist, if not create them
    const firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell || firstCell !== 'Timestamp') {
      const headers = [
        'Timestamp',
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
        'Selected Plan'
      ];
      const headerRow = sheet.getRange(1, 1, 1, headers.length);
      headerRow.setValues([headers]);
      headerRow.setFontWeight('bold');
      headerRow.setBackground('#5B7B5A');
      headerRow.setFontColor('#FFFFFF');
    }
    
    // Get the form data
    const formData = e.parameter;
    
    // Prepare the row data in the correct sequence
    const rowData = [
      formData.timestamp || new Date().toISOString(),
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
      formData.email || '',
      formData.selectedPlan || ''
    ];
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
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

