/**
 * Shared utility for submitting survey data to Google Sheets
 * This script handles incremental submission - data is saved immediately after each page
 */

// Track if submission is in progress to avoid duplicate submissions
let submissionInProgress = false;
let pendingSubmission = null;

// Generate or retrieve session ID
function getSessionId() {
    let sessionId = localStorage.getItem('surveySessionId');
    if (!sessionId) {
        // Generate a unique session ID
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('surveySessionId', sessionId);
    }
    return sessionId;
}

// Get Google Apps Script URL
function getGoogleScriptUrl() {
    const scriptTag = document.querySelector('script[data-google-script-url]');
    return scriptTag ? scriptTag.getAttribute('data-google-script-url') : null;
}

/**
 * Submit survey data to Google Sheets immediately
 * This function finds existing row by email or session ID and updates it, or creates new row
 * 
 * @param {Object} pageData - Data collected from the current page
 * @param {string} pageName - Name of the current page (e.g., 'survey-page-1')
 */
async function submitToGoogleSheetsIncremental(pageData, pageName) {
    const GOOGLE_SCRIPT_URL = getGoogleScriptUrl();
    
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        console.warn('Google Apps Script URL not configured. Data will only be saved to localStorage.');
        return { success: false, error: 'Google Script URL not configured' };
    }

    // Get existing data from localStorage
    let allData = {};
    const existingData = localStorage.getItem('surveyData');
    if (existingData) {
        try {
            allData = JSON.parse(existingData);
        } catch (e) {
            console.error('Error parsing existing data:', e);
        }
    }

    // Merge current page data with existing data
    allData = { ...allData, ...pageData };
    allData.page = pageName;
    allData.lastUpdated = new Date().toISOString();

    // Get session ID and email for row identification
    const sessionId = getSessionId();
    const email = allData.email || '';
    
    // Prepare data for submission
    const sheetData = {
        sessionId: sessionId,
        email: email,
        timestamp: allData.timestamp || new Date().toISOString(),
        lastUpdated: allData.lastUpdated,
        services: (allData.services || []).join(', '),
        duration: allData.duration || '',
        workTime: allData.workTime || '',
        genderPreference: allData.genderPreference || '',
        hoursPerWeek: allData.hoursPerWeek || '',
        foodArrangement: allData.foodArrangement || '',
        householdMembers: allData.householdMembers || '',
        headOfHouseholdAge: allData.headOfHouseholdAge || '',
        bedroomCount: allData.bedroomCount || '',
        zipCode: allData.zipCode || '',
        address: allData.address || '',
        firstName: allData.firstName || '',
        selectedPlan: allData.selectedPlan || '',
        currentPage: pageName
    };

    // Update localStorage with merged data
    localStorage.setItem('surveyData', JSON.stringify(allData));

    // Submit to Google Sheets
    const formData = new FormData();
    Object.keys(sheetData).forEach(key => {
        formData.append(key, sheetData[key]);
    });

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Data from ${pageName} submitted successfully to Google Sheets`);
            return { success: true, response: result };
        } else {
            console.error(`❌ Error submitting data from ${pageName}:`, response.statusText);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.error(`❌ Network error submitting data from ${pageName}:`, error);
        // Don't throw - we still want to save to localStorage even if network fails
        return { success: false, error: error.message };
    }
}

/**
 * Auto-submit data when user leaves the page
 * This ensures data is saved even if user doesn't click Continue
 * 
 * @param {Function} collectPageData - Function that collects current page data
 * @param {string} pageName - Name of the current page
 */
function setupAutoSubmitOnLeave(collectPageData, pageName) {
    // Flag to track if we've already submitted
    let hasSubmitted = false;
    
    // Function to submit current page data
    const submitCurrentData = () => {
        if (hasSubmitted || submissionInProgress) {
            return;
        }
        
        try {
            const pageData = collectPageData();
            if (pageData && Object.keys(pageData).length > 0) {
                // Use sendBeacon for reliable submission on page unload
                const GOOGLE_SCRIPT_URL = getGoogleScriptUrl();
                if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
                    // Get existing data
                    let allData = {};
                    const existingData = localStorage.getItem('surveyData');
                    if (existingData) {
                        try {
                            allData = JSON.parse(existingData);
                        } catch (e) {
                            console.error('Error parsing existing data:', e);
                        }
                    }
                    
                    // Merge data
                    allData = { ...allData, ...pageData };
                    allData.page = pageName;
                    allData.lastUpdated = new Date().toISOString();
                    
                    // Prepare submission data
                    const sessionId = getSessionId();
                    const email = allData.email || '';
                    const sheetData = {
                        sessionId: sessionId,
                        email: email,
                        timestamp: allData.timestamp || new Date().toISOString(),
                        lastUpdated: allData.lastUpdated,
                        services: (allData.services || []).join(', '),
                        duration: allData.duration || '',
                        workTime: allData.workTime || '',
                        genderPreference: allData.genderPreference || '',
                        hoursPerWeek: allData.hoursPerWeek || '',
                        foodArrangement: allData.foodArrangement || '',
                        householdMembers: allData.householdMembers || '',
                        headOfHouseholdAge: allData.headOfHouseholdAge || '',
                        bedroomCount: allData.bedroomCount || '',
                        zipCode: allData.zipCode || '',
                        address: allData.address || '',
                        firstName: allData.firstName || '',
                        selectedPlan: allData.selectedPlan || '',
                        currentPage: pageName
                    };
                    
                    // Use sendBeacon for reliable submission (works even when page is closing)
                    const formData = new URLSearchParams();
                    Object.keys(sheetData).forEach(key => {
                        formData.append(key, sheetData[key]);
                    });
                    
                    // Try sendBeacon first (most reliable for page unload)
                    if (navigator.sendBeacon) {
                        const blob = new Blob([formData.toString()], { type: 'application/x-www-form-urlencoded' });
                        const success = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
                        if (success) {
                            console.log(`📤 Auto-submitted data from ${pageName} using sendBeacon`);
                            hasSubmitted = true;
                        } else {
                            // Fallback to fetch if sendBeacon fails
                            fetch(GOOGLE_SCRIPT_URL, {
                                method: 'POST',
                                body: formData,
                                keepalive: true
                            }).catch(err => {
                                console.error('Error in auto-submit fallback:', err);
                            });
                            console.log(`📤 Auto-submitted data from ${pageName} using fetch (sendBeacon failed)`);
                            hasSubmitted = true;
                        }
                    } else {
                        // Fallback: use fetch with keepalive
                        fetch(GOOGLE_SCRIPT_URL, {
                            method: 'POST',
                            body: formData,
                            keepalive: true
                        }).catch(err => {
                            console.error('Error in auto-submit:', err);
                        });
                        console.log(`📤 Auto-submitted data from ${pageName} using fetch`);
                        hasSubmitted = true;
                    }
                    
                    // Update localStorage
                    localStorage.setItem('surveyData', JSON.stringify(allData));
                }
            }
        } catch (error) {
            console.error('Error in auto-submit:', error);
        }
    };
    
    // Submit when page is about to unload
    window.addEventListener('beforeunload', (e) => {
        submitCurrentData();
    });
    
    // Submit when page becomes hidden (user switches tabs, minimizes, etc.)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            submitCurrentData();
        }
    });
    
    // Submit when page is unloaded (fallback)
    window.addEventListener('pagehide', () => {
        submitCurrentData();
    });
    
    // Also submit periodically while user is on the page (every 30 seconds if data changed)
    let lastSubmissionTime = 0;
    const autoSubmitInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastSubmissionTime > 30000) { // 30 seconds
            submitCurrentData();
            lastSubmissionTime = now;
        }
    }, 30000);
    
    // Clean up interval when page unloads
    window.addEventListener('beforeunload', () => {
        clearInterval(autoSubmitInterval);
    });
}

/**
 * Setup real-time submission as user fills out the form
 * Submits data after user stops typing/interacting (debounced)
 * 
 * @param {Function} collectPageData - Function that collects current page data
 * @param {string} pageName - Name of the current page
 * @param {number} debounceMs - Milliseconds to wait before submitting (default: 2000)
 */
function setupRealTimeSubmit(collectPageData, pageName, debounceMs = 2000) {
    let submitTimeout = null;
    
    const debouncedSubmit = () => {
        // Clear existing timeout
        if (submitTimeout) {
            clearTimeout(submitTimeout);
        }
        
        // Set new timeout
        submitTimeout = setTimeout(() => {
            try {
                const pageData = collectPageData();
                // Only submit if there's actual data
                if (pageData && Object.keys(pageData).length > 0) {
                    // Check if data has meaningful content (not just empty arrays/strings)
                    const hasData = Object.values(pageData).some(value => {
                        if (Array.isArray(value)) return value.length > 0;
                        if (typeof value === 'string') return value.trim().length > 0;
                        return value !== null && value !== undefined;
                    });
                    
                    if (hasData) {
                        submitToGoogleSheetsIncremental(pageData, pageName).catch(err => {
                            console.error('Error in real-time submit:', err);
                        });
                    }
                }
            } catch (error) {
                console.error('Error in debounced submit:', error);
            }
        }, debounceMs);
    };
    
    // Listen to all form interactions
    document.addEventListener('click', debouncedSubmit);
    document.addEventListener('change', debouncedSubmit);
    document.addEventListener('input', debouncedSubmit);
    
    // Also submit on blur events (when user leaves a field)
    document.addEventListener('blur', debouncedSubmit, true);
    
    return debouncedSubmit;
}

