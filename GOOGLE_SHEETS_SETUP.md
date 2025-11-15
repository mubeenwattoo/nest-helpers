# Google Sheets Setup Instructions

This guide will help you set up Google Sheets integration to automatically save survey responses.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Survey Responses" or "Guest Survey Data"
4. In the first row (Row 1), add these column headers:
   - Timestamp
   - Duration
   - Work/Study Situation
   - Age
   - Gender
   - Location Preferences
   - Help Areas
   - Zip Code
   - First Name
   - Email
   - Has Pets or Children
   - Interested in Additional Pay
   - Owns Car
   - Has References
   - Has College Degree

## Step 2: Create Google Apps Script

1. In your Google Sheet, click on **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy and paste the code from `google-apps-script-code.gs` (see below)
4. Click **Save** (💾 icon) or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
5. Name your project (e.g., "Survey Data Handler")

## Step 3: Deploy as Web App

1. Click on **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Fill in the deployment settings:
   - **Description**: "Survey Data Submission Handler" (optional)
   - **Execute as**: "Me" (your account)
   - **Who has access**: "Anyone" (this allows your website to submit data)
4. Click **Deploy**
5. **IMPORTANT**: Copy the **Web App URL** that appears
   - It will look like: `https://script.google.com/macros/s/AKfycby.../exec`
6. Click **Authorize access** if prompted and follow the authorization steps

## Step 4: Update Your Website

1. Open `assets/js/survey-data-handler.js`
2. Find the line: `const GOOGLE_SHEETS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web App URL you copied
4. Save the file

## Step 5: Test It!

1. Fill out the survey on your website
2. Submit the form
3. Check your Google Sheet - you should see a new row with the submitted data!

## Troubleshooting

### Data not appearing in Google Sheets?
- Make sure you set "Who has access" to "Anyone" in the deployment settings
- Check the browser console (F12) for any error messages
- Verify the Web App URL is correct in `survey-data-handler.js`

### Getting permission errors?
- Make sure you authorized the script when deploying
- Try redeploying and authorizing again

### CSV download instead of Google Sheets?
- This is the fallback method - it means the Google Sheets URL isn't configured or there was an error
- Check that the URL in `survey-data-handler.js` is correct
- The CSV will still download with all the data, so your data is safe!

## Alternative: CSV-Only Mode

If you prefer to only use CSV downloads (no Google Sheets setup needed):
- The system will automatically download CSV files when Google Sheets isn't configured
- Each submission creates a CSV file with all responses
- You can manually import these CSV files into Google Sheets or Excel later

