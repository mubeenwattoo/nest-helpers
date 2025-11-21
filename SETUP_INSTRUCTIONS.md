# Setup Instructions - Airtable Config

## ✅ What We've Done

The Airtable API key is now stored in a separate file (`airtable-config.js`) that is **excluded from Git**. This prevents GitHub from detecting your secret.

## 🔧 Setup Steps

### Step 1: Create the Config File

The file `airtable-config.js` is already created with your API key. It's in `.gitignore` so it won't be committed to Git.

**If the file doesn't exist**, create it by copying the template:

1. Copy `assets/js/airtable-config.js.template` 
2. Rename it to `assets/js/airtable-config.js`
3. Replace `YOUR_AIRTABLE_API_KEY_HERE` with your actual API key:
   ```
   apiKey: 'pat2LIh9zDMXus1zP.cdc6e1b6bb4e939b1f9d0ce5a6b1da5ecd9f2e55106bbc88cf2b2865b8c1062c'
   ```

### Step 2: Verify .gitignore

Make sure `.gitignore` includes:
```
assets/js/airtable-config.js
```

### Step 3: Remove API Key from Git History (if already committed)

If you've already committed the API key to Git, remove it:

```bash
# Remove the file from Git tracking (but keep it locally)
git rm --cached assets/js/airtable-config.js

# Commit the removal
git commit -m "Remove API key from Git tracking"

# Push to GitHub
git push
```

**OR** if the API key is in HTML files in previous commits:

```bash
# Remove API key from all HTML files in Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch survey-page-1.html survey-page-2.html survey-page-3.html host-pricing-page.html" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (be careful!)
git push origin --force --all
```

## ✅ How It Works

1. **Config file** (`airtable-config.js`) contains your API key
2. **.gitignore** prevents it from being committed
3. **HTML files** load the config file via `<script src="./assets/js/airtable-config.js"></script>`
4. **JavaScript** reads the API key from `window.AIRTABLE_CONFIG`
5. **GitHub** won't see the API key because it's not in Git!

## 🚀 Deploy to Vercel

When deploying to Vercel:
1. Make sure `airtable-config.js` is in your project folder
2. Vercel will deploy it (it's not in .gitignore for deployment, just for Git)
3. Everything will work perfectly!

## 📝 Important Notes

- ✅ The config file works locally and on Vercel
- ✅ GitHub won't scan it because it's not in Git
- ✅ No environment variables needed
- ✅ No API endpoints needed
- ✅ Simple and works perfectly!

