# Fix GitHub Secret Scanning Warning - Simple Steps

## The Problem
GitHub is detecting your API key in **previous commits** (Git history), even though it's removed from current files.

## ✅ Simple Fix (Do This First)

### Step 1: Remove Config File from Git

**In GitHub Desktop:**

1. Open your repository in GitHub Desktop
2. Click **Repository** → **Open in Command Prompt** (or Terminal/PowerShell)
3. Run this command:
   ```bash
   git rm --cached assets/js/airtable-config.js
   ```
4. Go back to GitHub Desktop
5. You'll see the file removed - **commit this change**
6. **Push to GitHub**

### Step 2: Verify .gitignore

Make sure `.gitignore` contains:
```
assets/js/airtable-config.js
```

✅ **The file stays on your computer** - it just won't be in Git anymore!

## 🔄 If Warning Still Appears

If GitHub still shows the warning, the API key is in **old commits**. You need to clean Git history:

### Option A: Bypass the Warning (Easiest)

1. In GitHub Desktop, when you see the warning
2. Click **"Bypass"** button
3. Continue with your push

⚠️ **Note:** This doesn't remove the secret from history, but allows you to push.

### Option B: Clean Git History (Permanent Fix)

**⚠️ WARNING: Only do this if you're the only one working on this repo!**

1. Open Command Prompt/Terminal in your project folder
2. Run these commands:

```bash
# Remove API key from all files in Git history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch assets/js/airtable-config.js survey-page-1.html survey-page-2.html survey-page-3.html host-pricing-page.html" --prune-empty --tag-name-filter cat -- --all

# Force push (this rewrites history)
git push origin --force --all
```

## ✅ After Fixing

1. **Keep `assets/js/airtable-config.js` on your computer** (it has your API key)
2. **It's in `.gitignore`** - won't be committed again
3. **For Vercel:** You'll need to manually upload the config file or add it during deployment

## 🎯 Quick Summary

**Easiest way:**
1. Run: `git rm --cached assets/js/airtable-config.js`
2. Commit and push
3. If warning persists, click "Bypass" in GitHub Desktop

**Your code will work perfectly** - the config file stays on your computer!

