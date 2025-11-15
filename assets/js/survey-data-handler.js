/**
 * Survey Data Handler
 * Handles collection and submission of survey data to Google Sheets or CSV
 */

// Configuration - UPDATE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyPsWbsE38IdmOq1goEyixkt5W3FhkNQEmuqQKpqHsO5pkCqvmgJ4trEFNLJvibW21tig/exec';

/**
 * Collect all survey data from both pages
 */
function collectAllSurveyData() {
  // Get data from page 1 (stored in localStorage)
  const page1Data = JSON.parse(localStorage.getItem("surveyPage1Data") || "{}");
  
  // Collect data from page 7
  const zipCode = document.getElementById("zipCodeInput")?.value.trim() || "";
  const firstName = document.getElementById("firstNameInput")?.value.trim() || "";
  const email = document.getElementById("emailInput")?.value.trim() || "";
  
  // Get toggle values (Alpine.js)
  const toggles = document.querySelectorAll('[x-data*="on"]');
  const toggleValues = [];
  toggles.forEach((toggle, index) => {
    const input = toggle.querySelector('input[name="toggle_value"]');
    const value = input?.value || "no";
    toggleValues.push(value);
  });
  
  // Map toggle questions
  const toggleQuestions = [
    "Has pets or children",
    "Interested in additional hourly pay",
    "Owns a car",
    "Has references",
    "Has college degree"
  ];
  
  const toggleData = {};
  toggleQuestions.forEach((question, index) => {
    if (toggleValues[index]) {
      toggleData[question] = toggleValues[index];
    }
  });
  
  // Combine all data
  const allData = {
    timestamp: new Date().toISOString(),
    // Page 1 data
    duration: page1Data.duration || "",
    workStudy: page1Data.workStudy || "",
    age: page1Data.age || "",
    gender: page1Data.gender || "",
    locationPreferences: page1Data.locationPreferences || "",
    helpAreas: page1Data.helpAreas || "",
    // Page 7 data
    zipCode: zipCode,
    firstName: firstName,
    email: email,
    ...toggleData
  };
  
  return allData;
}

/**
 * Convert data object to CSV row
 */
function convertToCSVRow(data) {
  const headers = [
    "Timestamp",
    "Duration",
    "Work/Study Situation",
    "Age",
    "Gender",
    "Location Preferences",
    "Help Areas",
    "Zip Code",
    "First Name",
    "Email",
    "Has Pets or Children",
    "Interested in Additional Pay",
    "Owns Car",
    "Has References",
    "Has College Degree"
  ];
  
  const values = [
    data.timestamp || "",
    data.duration || "",
    data.workStudy || "",
    data.age || "",
    data.gender || "",
    data.locationPreferences || "",
    data.helpAreas || "",
    data.zipCode || "",
    data.firstName || "",
    data.email || "",
    data["Has pets or children"] || "",
    data["Interested in additional hourly pay"] || "",
    data["Owns a car"] || "",
    data["Has references"] || "",
    data["Has college degree"] || ""
  ];
  
  // Escape values that contain commas or quotes
  const escapedValues = values.map(value => {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  });
  
  return escapedValues.join(',');
}

/**
 * Get CSV headers
 */
function getCSVHeaders() {
  return [
    "Timestamp",
    "Duration",
    "Work/Study Situation",
    "Age",
    "Gender",
    "Location Preferences",
    "Help Areas",
    "Zip Code",
    "First Name",
    "Email",
    "Has Pets or Children",
    "Interested in Additional Pay",
    "Owns Car",
    "Has References",
    "Has College Degree"
  ].join(',');
}

/**
 * Download data as CSV file
 */
function downloadAsCSV(data) {
  // Check if there's existing CSV data in localStorage
  let csvContent = localStorage.getItem("surveyCSVData") || getCSVHeaders() + "\n";
  
  // Add new row
  csvContent += convertToCSVRow(data) + "\n";
  
  // Save updated CSV to localStorage
  localStorage.setItem("surveyCSVData", csvContent);
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `survey-data-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
}

/**
 * Submit data to Google Sheets via Google Apps Script Web App
 */
async function submitToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_WEB_APP_URL || GOOGLE_SHEETS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('Google Sheets URL not configured. Falling back to CSV download.');
    return { success: false, method: 'csv' };
  }
  
  try {
    // Log the data being sent for debugging
    console.log('Submitting data to Google Sheets:', data);
    
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // With no-cors, we can't read the response, but we assume success
    console.log('Data submitted to Google Sheets (no-cors mode, cannot verify response)');
    return { success: true, method: 'googlesheets' };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return { success: false, method: 'csv', error: error.message };
  }
}

/**
 * Submit page 1 data only (6 columns: Duration, Work/Study, Age, Gender, Location, Help Areas)
 */
async function submitPage1Data(page1Data) {
  // NO TIMESTAMP - only the 6 data fields
  const data = {
    dataType: 'page1', // Marker for Google Apps Script
    duration: page1Data.duration || "",
    workStudy: page1Data.workStudy || "",
    age: page1Data.age || "",
    gender: page1Data.gender || "",
    locationPreferences: page1Data.locationPreferences || "",
    helpAreas: page1Data.helpAreas || ""
  };
  
  console.log('Submitting page 1 data:', data);
  
  // Try Google Sheets first
  const sheetsResult = await submitToGoogleSheets(data);
  
  if (sheetsResult.success) {
    console.log('Page 1 data submitted to Google Sheets successfully');
    return { success: true, method: 'googlesheets' };
  } else {
    // Fallback to CSV download
    console.log('Falling back to CSV download for page 1');
    downloadAsCSV(data);
    return { success: true, method: 'csv' };
  }
}

/**
 * Validate email address - requires proper domain like @gmail.com, @yahoo.com, etc.
 */
function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address (e.g., name@gmail.com)' };
  }
  
  // Extract domain
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Check if domain has at least one dot (e.g., gmail.com, yahoo.co.uk)
  if (!domain || !domain.includes('.')) {
    return { valid: false, message: 'Please enter a valid email address with a proper domain (e.g., name@gmail.com)' };
  }
  
  // Check for common valid email domains
  const validDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 
    'icloud.com', 'mail.com', 'protonmail.com', 'yahoo.co.uk', 'hotmail.co.uk',
    'outlook.co.uk', 'live.com', 'msn.com', 'ymail.com', 'rocketmail.com',
    'zoho.com', 'gmx.com', 'yandex.com', 'rediffmail.com', 'sbcglobal.net',
    'att.net', 'verizon.net', 'comcast.net', 'cox.net', 'earthlink.net'
  ];
  
  // Check if domain is in valid list OR has proper structure (at least 2 parts separated by dot)
  const domainParts = domain.split('.');
  const isValidDomain = validDomains.includes(domain) || 
                       (domainParts.length >= 2 && domainParts[0].length > 0 && domainParts[domainParts.length - 1].length >= 2);
  
  if (!isValidDomain) {
    return { valid: false, message: 'Please enter a valid email address with a proper domain (e.g., name@gmail.com)' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Collect page 7 data only (8 columns: 5 toggles + zip + name + email)
 * Order: 1. Pets/children, 2. Additional pay, 3. Owns car, 4. Has references, 5. Has degree, 6. Zip, 7. Name, 8. Email
 */
function collectPage7Data() {
  const zipCode = document.getElementById("zipCodeInput")?.value.trim() || "";
  const firstName = document.getElementById("firstNameInput")?.value.trim() || "";
  const email = document.getElementById("emailInput")?.value.trim() || "";
  
  // Get toggle values in correct order using data-toggle attributes
  // Read directly from Alpine.js x-data state or from input value
  const toggleOrder = [
    { id: 'pets-children', key: 'Has pets or children' },
    { id: 'additional-pay', key: 'Interested in additional hourly pay' },
    { id: 'owns-car', key: 'Owns a car' },
    { id: 'has-references', key: 'Has references' },
    { id: 'has-degree', key: 'Has college degree' }
  ];
  
  const toggleData = {};
  toggleOrder.forEach((toggle) => {
    // Try to get value from input element
    const input = document.querySelector(`input[data-toggle="${toggle.id}"]`);
    let value = "no";
    
    if (input) {
      // Check if Alpine.js has updated the value
      value = input.value || "no";
      
      // Also check the parent Alpine.js component state if available
      const parent = input.closest('[x-data*="on"]');
      if (parent && parent.__x) {
        // Alpine.js 3.x stores state in __x.$data
        const alpineState = parent.__x.$data;
        if (alpineState && typeof alpineState.on !== 'undefined') {
          value = alpineState.on ? 'yes' : 'no';
        }
      }
    }
    
    toggleData[toggle.key] = value;
  });
  
  return {
    zipCode: zipCode,
    firstName: firstName,
    email: email,
    ...toggleData
  };
}

/**
 * Submit page 7 data only (8 columns: 5 toggles + zip + name + email)
 * Does NOT include page 1 data
 * Order: 5 toggles first, then zip, name, email
 */
async function submitPage7Data() {
  const page7Data = collectPage7Data();
  
  // Validate email
  const emailValidation = validateEmail(page7Data.email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.message };
  }
  
  // Order: 5 toggles first (in exact order), then zip, name, email
  // Construct object explicitly to ensure correct order
  const data = {};
  data.dataType = 'page7'; // Marker for Google Apps Script
  
  // Toggle 1: Pets or children
  data['Has pets or children'] = page7Data['Has pets or children'] || "no";
  // Toggle 2: Additional hourly pay
  data['Interested in additional hourly pay'] = page7Data['Interested in additional hourly pay'] || "no";
  // Toggle 3: Owns a car
  data['Owns a car'] = page7Data['Owns a car'] || "no";
  // Toggle 4: Has references
  data['Has references'] = page7Data['Has references'] || "no";
  // Toggle 5: Has college degree
  data['Has college degree'] = page7Data['Has college degree'] || "no";
  // Then: Zip, Name, Email
  data.zipCode = page7Data.zipCode || "";
  data.firstName = page7Data.firstName || "";
  data.email = page7Data.email || "";
  
  console.log('Submitting page 7 data (8 columns only):', data);
  
  // Try Google Sheets first
  const sheetsResult = await submitToGoogleSheets(data);
  
  if (sheetsResult.success) {
    console.log('Page 7 data submitted to Google Sheets successfully');
    return { success: true, method: 'googlesheets' };
  } else {
    // Fallback to CSV download
    console.log('Falling back to CSV download for page 7');
    downloadAsCSV(data);
    return { success: true, method: 'csv' };
  }
}

/**
 * Submit plan selection (1 column: Basic Plan or Premium Plan)
 */
async function submitPlanSelection(plan) {
  // Format: "Basic Plan" or "Premium Plan"
  const planText = plan === 'Basic' ? 'Basic Plan' : plan === 'Premium' ? 'Premium Plan' : plan || '';
  
  const data = {
    dataType: 'plan', // Marker for Google Apps Script
    plan: planText
  };
  
  console.log('Submitting plan selection:', data);
  
  // Submit immediately without waiting for response (fire and forget for speed)
  try {
    if (GOOGLE_SHEETS_WEB_APP_URL && GOOGLE_SHEETS_WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      // Fire and forget - don't wait for response to speed up navigation
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).catch(err => console.log('Plan submission error (non-blocking):', err));
      
      console.log('Plan selection submitted to Google Sheets:', planText);
      return { success: true, method: 'googlesheets' };
    }
  } catch (error) {
    console.error('Error submitting plan:', error);
  }
  
  return { success: true, method: 'googlesheets' };
}

/**
 * Submit survey data (tries Google Sheets first, falls back to CSV)
 */
async function submitSurveyData() {
  const data = collectAllSurveyData();
  
  // Try Google Sheets first
  const sheetsResult = await submitToGoogleSheets(data);
  
  if (sheetsResult.success) {
    console.log('Data submitted to Google Sheets successfully');
    return { success: true, method: 'googlesheets' };
  } else {
    // Fallback to CSV download
    console.log('Falling back to CSV download');
    downloadAsCSV(data);
    return { success: true, method: 'csv' };
  }
}

