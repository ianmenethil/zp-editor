# Quick Start: Deploy to GitHub Pages

## TL;DR

```bash
# Method 1: Automated script (recommended)
npm run deploy:github

# Method 2: Manual
npm run deploy
```

Your app will be live at: `https://ianmenethil.github.io/zp-editor/`

---

## Features That Work

✅ **Sharing code** → Short URLs (365-day expiry via dpaste) + Long URLs (permanent)

✅ **Saving projects** → Browser LocalStorage (unlimited, no account needed)

✅ **Permalinks** → Create permanent links via compressed URLs or dpaste

✅ **GitHub integration** → Sync to/from GitHub (requires GitHub login)

✅ **Deploy projects** → Deploy individual projects to GitHub Pages

✅ **All 90+ languages** → Full code playground functionality

---

## Deployment Methods

### Option 1: Automated Script (Recommended)

The script performs all checks, builds, and deploys automatically:

```bash
npm run deploy:github
```

**What it does:**
1. ✓ Checks git, node, and dependencies
2. ✓ Shows deployment URL preview
3. ✓ Asks for confirmation
4. ✓ Exports i18n strings
5. ✓ Builds the application
6. ✓ Deploys to GitHub Pages
7. ✓ Shows post-deployment instructions

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Export i18n strings (required)
npm run i18n-export

# 2. Build the application
npm run build

# 3. Deploy to GitHub Pages
npm run deploy
```

---

## First-Time Setup

After deploying for the first time, enable GitHub Pages:

1. Go to: https://github.com/ianmenethil/zp-editor/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** gh-pages / (root)
4. Click **Save**
5. Wait 2-5 minutes for deployment

---

## Verify Deployment

After deployment, test these features:

1. **Visit:** https://ianmenethil.github.io/zp-editor/
2. **Write code** in any language
3. **Save a project** (automatic to LocalStorage)
4. **Share** → Click Share button → Generate short URL
5. **GitHub** → Click GitHub icon → Sign in → Sync a project

---

## Troubleshooting

### Site shows 404

Enable GitHub Pages in repository settings (see First-Time Setup above).

### Short URLs not working

Use long URLs instead or check internet connection. dpaste.com might be temporarily unavailable.

### Projects not saving

Check browser allows LocalStorage for the site in privacy settings.

---

## Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed architecture explanation
- Service configuration
- Advanced deployment options
- Docker setup for permanent short URLs
- Troubleshooting guide

---

## Need Help?

- **File an issue:** https://github.com/live-codes/livecodes/issues
- **Start a discussion:** https://github.com/live-codes/livecodes/discussions
- **Read the docs:** https://livecodes.io/docs/

---

🚀 **Ready?** Run `npm run deploy:github` now!
