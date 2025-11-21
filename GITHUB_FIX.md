# Fix GitHub Secret Scanning Warning

## The Problem

GitHub is detecting your API key in the **commit history**, even though it's removed from current files.

## Solution: Remove from Git History

### Option 1: Remove Config File from Git (Recommended)

1. **Remove the config file from Git tracking:**
   ```bash
   git rm --cached assets/js/airtable-config.js
   ```

2. **Commit the removal:**
   ```bash
   git commit -m "Remove API key from Git tracking"
   ```

3. **The file stays on your computer** - it's just removed from Git

4. **Push to GitHub:**
   ```bash
   git push
   ```

### Option 2: Clean Git History (If Option 1 doesn't work)

If GitHub still detects it in old commits, you need to remove it from history:

**⚠️ WARNING: This rewrites Git history. Only do this if you're the only one working on this repo.**

```bash
# Remove API key from all commits in Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch assets/js/airtable-config.js survey-page-1.html survey-page-2.html survey-page-3.html host-pricing-page.html" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (be careful - this rewrites history!)
git push origin --force --all
```

## After Fixing

1. **Make sure `assets/js/airtable-config.js` exists locally** (it has your API key)
2. **It's in `.gitignore`** so it won't be committed again
3. **For Vercel deployment:** You'll need to manually add the file or use environment variables

## Quick Fix for GitHub Desktop

1. Open GitHub Desktop
2. Go to **Repository** → **Open in Command Prompt** (or Terminal)
3. Run: `git rm --cached assets/js/airtable-config.js`
4. Commit the change
5. Push to GitHub

The warning should disappear!

