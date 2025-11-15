# Complete Survey Data Collection Setup Guide

## ✅ What's Been Implemented

### Page 1 (guest-survey-page-1.html)
- **6 columns** saved when user clicks Continue:
  1. Duration
  2. Work/Study Situation
  3. Age
  4. Gender
  5. Location Preferences
  6. Help Areas

### Page 7 (guest-survey-page-7.html)
- **8 columns** saved when user clicks Submit (NO page 1 data repeated):
  1. Has pets or children (yes/no)
  2. Interested in additional hourly pay (yes/no)
  3. Owns a car (yes/no)
  4. Has references (yes/no)
  5. Has college degree (yes/no)
  6. Zip Code
  7. First Name
  8. Email
- **Email validation** added - validates format and shows error if invalid

### Pricing Page (guest-pricing-page.html)
- **1 column** saved when user selects a plan:
  1. Plan (Basic or Premium)

## 📊 Google Sheet Setup

You need **3 separate sheets** (or 3 separate Google Sheets files):

### Sheet 1: Page 1 Data (6 columns)
Headers in Row 1:
1. Duration
2. Work/Study Situation
3. Age
4. Gender
5. Location Preferences
6. Help Areas

### Sheet 2: Page 7 Data (8 columns)
Headers in Row 1:
1. Has pets or children
2. Interested in additional hourly pay
3. Owns a car
4. Has references
5. Has college degree
6. Zip Code
7. First Name
8. Email

### Sheet 3: Plan Selection (1 column)
Headers in Row 1:
1. Plan

## ⚙️ Google Apps Script Configuration

**IMPORTANT**: The current script saves all data to the same sheet. You have two options:

### Option 1: Use Separate Sheets (Recommended)
Update the Google Apps Script to use different sheet names based on data type:

1. In `google-apps-script-code.gs`, change the script to:

```javascript
// Get the sheet based on data type
let targetSheet;
if (data.dataType === 'page7') {
  targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Page7Data'); // Change to your sheet name
} else if (data.dataType === 'plan') {
  targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PlanData'); // Change to your sheet name
} else {
  targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Page1Data'); // Change to your sheet name
}

if (!targetSheet) {
  throw new Error('Sheet not found');
}

// Then use targetSheet instead of sheet
targetSheet.appendRow(rowData);
```

### Option 2: Use Same Sheet with Different Tabs
Create 3 tabs in one Google Sheet:
- Tab 1: "Page1Data" (6 columns)
- Tab 2: "Page7Data" (8 columns)
- Tab 3: "PlanData" (1 column)

Then update the script as shown in Option 1.

## 🔧 Current Setup

The script currently uses `SHEET_NAME = 'Sheet1'` for all data. You need to:

1. **Update Google Apps Script** with the code from `google-apps-script-code.gs`
2. **Modify the script** to use different sheets based on `dataType` (see Option 1 above)
3. **Create your 3 sheets** with the correct headers
4. **Redeploy** the Web App after making changes

## ✉️ Email Validation

Email validation includes:
- ✅ Required field check
- ✅ Format validation (must have @ and domain)
- ✅ Domain validation (must have a dot after @)
- ✅ Visual feedback (red border on error)
- ✅ Error message display

Valid email examples:
- `user@gmail.com` ✅
- `user@yahoo.com` ✅
- `user@company.co.uk` ✅
- `user@domain.com` ✅

Invalid examples:
- `user@domain` ❌ (no dot after @)
- `user@` ❌ (no domain)
- `@domain.com` ❌ (no username)
- `user domain.com` ❌ (no @)

## 🧪 Testing

### Test Page 1:
1. Fill out all fields
2. Click Continue
3. Check Sheet 1 - should see 6 columns of data

### Test Page 7:
1. Fill out all toggles, zip, name, and email
2. Try invalid email - should show error
3. Enter valid email
4. Click Submit
5. Check Sheet 2 - should see 8 columns of data (NO page 1 data)

### Test Pricing Page:
1. Click "Select Plan" on either Basic or Premium
2. Check Sheet 3 - should see "Basic" or "Premium"

## 📝 Important Notes

1. **Page 7 does NOT repeat page 1 data** - it only saves its 8 columns
2. **Each submission goes to a separate row** in the respective sheet
3. **Email validation happens before submission** - invalid emails prevent submission
4. **Plan selection is saved automatically** when user clicks "Select Plan"

## 🐛 Troubleshooting

### Data not appearing?
1. Check browser console (F12) for errors
2. Check Apps Script logs (View → Logs)
3. Verify sheet names match in the script
4. Make sure headers are exactly as listed above

### Email validation not working?
1. Make sure `survey-data-handler.js` is loaded on page 7
2. Check browser console for JavaScript errors
3. Try a valid email format: `test@gmail.com`

### Plan not saving?
1. Make sure `survey-data-handler.js` is loaded on pricing page
2. Check browser console when clicking "Select Plan"
3. Verify the Google Apps Script handles `dataType === 'plan'`

## 🔄 Next Steps

1. **Update Google Apps Script** with the new code from `google-apps-script-code.gs`
2. **Modify it** to use separate sheets (see Option 1 above)
3. **Create your 3 Google Sheets** with the correct headers
4. **Test each page** to ensure data is saving correctly
5. **Redeploy** the Web App after any script changes

