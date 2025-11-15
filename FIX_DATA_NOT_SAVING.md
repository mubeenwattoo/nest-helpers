# Fix: Data Not Saving to Google Sheets

## ✅ What I've Fixed

1. **Updated the Google Sheets URL** in `assets/js/survey-data-handler.js` to your new URL
2. **Updated Google Apps Script** to handle 6 columns (no timestamp) for page 1 data
3. **Added data submission** when Continue button is clicked on page 1
4. **Added debugging** to help identify issues

## 🔧 What You Need to Do

### Step 1: Update Your Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Open your project (the one with your Web App URL)
3. **Copy the entire code** from `google-apps-script-code.gs` file
4. **Paste it** into your Apps Script editor (replace all existing code)
5. **Save** the script (Ctrl+S or Cmd+S)
6. **Redeploy**: 
   - Click **Deploy** → **Manage deployments**
   - Click the **pencil/edit icon** next to your deployment
   - Click **Deploy** (or Update)
   - Make sure "Who has access" is set to **"Anyone"**

### Step 2: Verify Your Google Sheet Headers

Make sure your Google Sheet has exactly these 6 headers in Row 1:

1. **Duration**
2. **Work/Study Situation** (or "Work/Study Situation")
3. **Age**
4. **Gender**
5. **Location Preferences**
6. **Help Areas**

**Important**: No "Timestamp" column - just these 6!

### Step 3: Test It

1. Open your website
2. Fill out the survey on page 1
3. Click **Continue**
4. Open your browser's **Developer Console** (Press F12, then click "Console" tab)
5. You should see messages like:
   - "Collected page 1 data: {...}"
   - "Submitting page 1 data: {...}"
   - "Data submitted to Google Sheets (no-cors mode...)"

6. Check your Google Sheet - a new row should appear!

## 🐛 Troubleshooting

### If data still doesn't appear:

#### 1. Check Browser Console
- Press **F12** → Click **Console** tab
- Look for any red error messages
- Share those errors if you need help

#### 2. Check Google Apps Script Logs
- Go to your Apps Script project
- Click **View** → **Logs** (or press Ctrl+Enter)
- Run a test submission
- Check the logs for any errors

#### 3. Verify Sheet Name
- In `google-apps-script-code.gs`, line 16 says: `const SHEET_NAME = 'Sheet1';`
- Make sure this matches your actual sheet tab name
- If your sheet tab is named something else (like "Data" or "Responses"), change it

#### 4. Test the Web App URL
- Visit your Web App URL in a browser: `https://script.google.com/macros/s/AKfycbyPsWbsE38IdmOq1goEyixkt5W3FhkNQEmuqQKpqHsO5pkCqvmgJ4trEFNLJvibW21tig/exec`
- You should see: "Survey Data Handler is active and ready to receive POST requests."
- If you see an error, the script isn't deployed correctly

#### 5. Check Permissions
- Make sure the Web App deployment has "Who has access" set to **"Anyone"**
- If it's set to "Only myself", it won't work from your website

## 📊 Expected Behavior

When you click **Continue** on page 1:
1. Button text changes to "Saving..."
2. Data is collected from all 4 dropdowns and pills
3. Data is sent to Google Sheets
4. Button text changes to "Saved!"
5. After 0.5 seconds, you're redirected to page 7
6. A new row appears in your Google Sheet with 6 columns of data

## 🔍 Debugging Commands

Open browser console (F12) and try:

```javascript
// Check if data is being collected
const page1Data = collectPage1Data();
console.log(page1Data);

// Check if function exists
console.log(typeof submitPage1Data);

// Check localStorage
console.log(localStorage.getItem("surveyPage1Data"));
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Browser console shows "Submitting page 1 data"
- ✅ Button changes to "Saved!" before redirecting
- ✅ New row appears in Google Sheet
- ✅ No errors in browser console
- ✅ No errors in Apps Script logs

If you're still having issues, share:
1. Any error messages from browser console
2. Any error messages from Apps Script logs
3. Screenshot of your Google Sheet headers

