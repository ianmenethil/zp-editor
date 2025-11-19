# LiveCodes Deployment Guide

This guide explains how to deploy LiveCodes to GitHub Pages with full support for sharing, saving, and permalinks.

## Quick Start

Run the automated deployment script:

```bash
./scripts/deploy-github.sh
```

Or manually:

```bash
npm run deploy
```

That's it! Your LiveCodes instance will be deployed to GitHub Pages.

---

## Deployment URL

After deployment, your instance will be available at:

```
https://{your-username}.github.io/{repo-name}/
```

For this repository: `https://ianmenethil.github.io/zp-editor/`

---

## Features Available After Deployment

### ✅ Fully Working Features

All core features work perfectly on GitHub Pages:

#### 1. **Code Playground**
- Full-featured code editor with 90+ programming languages
- Monaco, CodeMirror, Blockly, and other editors
- Real-time compilation and execution
- Console, compiled code viewer, and test runner

#### 2. **Save Projects**
- Projects are automatically saved to browser LocalStorage
- No account required
- Unlimited projects
- Data stays in your browser

#### 3. **Share Code**
Two methods for sharing:

**a) Long URLs (No Server Required)**
- Project configuration is compressed and encoded in the URL
- Generated instantly in the browser
- No data sent to any server
- Works forever (URL contains the code)
- Example: `?x=id/js/starter/XQAAgABA...`

**b) Short URLs (Uses dpaste.com)**
- Easier to share (shorter links)
- Code is sent to dpaste.com
- ⚠️ **Links expire after 365 days**
- Example: `?x=id/kh8x2ab9c`

#### 4. **Permalinks**
- Create permanent links to your code
- Uses the same system as sharing (long URLs or dpaste)
- Long URLs work forever
- Short URLs expire after 365 days

#### 5. **GitHub Integration**
- Sync projects to/from GitHub repositories
- Import projects from GitHub
- Requires user to authenticate with GitHub (client-side OAuth)
- Works perfectly on static deployments

#### 6. **Deploy Projects**
- Deploy individual projects to GitHub Pages
- Each project gets its own URL
- Built-in feature in the app

#### 7. **Import/Export**
- Import from GitHub, CodePen, JSFiddle, CodeSandbox, Gitlab, StackBlitz, etc.
- Export as JSON, HTML, ZIP, GitHub gist, CodePen, JSFiddle, or StackBlitz
- All work perfectly

#### 8. **All Other Features**
- Templates (React, Vue, Svelte, Python, etc.)
- External resources
- Assets management
- Themes
- Code formatting
- AI Code Assistant
- Backup/Restore
- And much more...

---

## How Sharing Works

### Architecture

LiveCodes uses different sharing services based on the deployment type:

```
┌─────────────────────────────────────────┐
│   GitHub Pages (Static Deployment)     │
├─────────────────────────────────────────┤
│                                         │
│  Long URLs:  Browser-compressed (✓)    │
│  Short URLs: dpaste.com (365 days)     │
│  Saves:      LocalStorage (✓)          │
│  GitHub:     GitHub API (✓)            │
│                                         │
└─────────────────────────────────────────┘
```

### Service Implementation

The app automatically detects it's running on a static host and uses:

1. **dpaste.com** for short URLs
   - Free service
   - 365-day expiration
   - No configuration needed
   - See: `src/livecodes/services/share.ts:17-46`

2. **Browser LocalStorage** for saving
   - No server required
   - Unlimited projects
   - Data never leaves the browser

3. **GitHub OAuth** for GitHub features
   - Direct GitHub API calls
   - Client-side authentication
   - No backend server needed

---

## Configuration

The deployment is configured via environment variables set during build:

```bash
# Current deployment settings (in package.json)
BASE_URL="/livecodes/"          # Path where app is hosted
SELF_HOSTED="true"              # Enables dpaste for short URLs
```

These are automatically set by `npm run deploy` (see `package.json:35-37`).

---

## Post-Deployment Setup

### 1. Enable GitHub Pages

After first deployment, enable GitHub Pages in your repository:

1. Go to: `https://github.com/{username}/{repo}/settings/pages`
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **(root)**
4. Click **Save**

### 2. Wait for Deployment

GitHub Pages typically takes 2-5 minutes to build and deploy your site.

### 3. Verify Deployment

Visit your deployment URL and test:
- ✅ App loads correctly
- ✅ Can write and run code
- ✅ Can save projects (check browser DevTools → Application → LocalStorage)
- ✅ Can share with long URLs
- ✅ Can share with short URLs (requires internet to reach dpaste.com)
- ✅ Can authenticate with GitHub (test GitHub sync)

---

## Upgrading Features

### Option 1: Keep Static Deployment (Current)

**Pros:**
- Zero cost
- No server maintenance
- GitHub handles everything
- All core features work

**Cons:**
- Short URLs expire after 365 days
- Uses third-party service (dpaste)

**Best for:** Personal use, demos, documentation, embedding

### Option 2: Docker Setup (Advanced)

For permanent short URLs and additional features:

```bash
cd server
docker compose up -d
```

**Provides:**
- Permanent short URLs (your own database)
- Custom domain support
- Broadcast server
- oEmbed support
- Custom headers
- No expiration on shared links

**Requires:**
- VPS or server (DigitalOcean, AWS, etc.)
- Docker and Docker Compose
- Domain name (optional)

**Best for:** Production use, teams, public deployments

See: `docs/docs/advanced/docker.mdx` for full setup guide.

### Option 3: Sponsorship (Managed Hosting)

LiveCodes sponsors (Bronze and above) get:
- Managed Docker hosting
- Permanent short URLs
- Priority support
- All premium features

See: https://livecodes.io/docs/sponsor

---

## Troubleshooting

### Deployment fails with "gh-pages not found"

**Solution:** Install dependencies
```bash
npm install
```

### Deployment succeeds but site shows 404

**Solution:** Enable GitHub Pages in repository settings (see Post-Deployment Setup)

### Short URLs not working

**Cause:** dpaste.com might be blocked by firewall or down

**Solutions:**
1. Use long URLs instead (always work)
2. Check internet connection
3. Try again later
4. Use Docker setup for self-hosted sharing

### Projects not saving

**Cause:** Browser privacy settings blocking LocalStorage

**Solutions:**
1. Check browser settings allow LocalStorage for the site
2. Disable "Block third-party cookies" for your deployment domain
3. Use GitHub sync as backup

### GitHub integration not working

**Cause:** GitHub OAuth redirect URL mismatch

**Solution:** GitHub OAuth requires the correct callback URL. The app handles this automatically, but ensure:
1. You're using the correct deployment URL
2. No browser extensions blocking OAuth
3. Pop-ups are allowed for GitHub authentication

---

## Advanced Configuration

### Deploy to Subdirectory

To deploy to a custom subdirectory:

```bash
npx cross-env BASE_URL="/my-playground/" npm run build
npx gh-pages -d build --nojekyll
```

### Deploy Without Documentation

To deploy only the app (not docs):

```bash
npm run predeploy:no-docs
npm run deploy
```

### Custom Domain

1. Deploy normally
2. Add `CNAME` file to `build` directory with your domain
3. Configure DNS records for your domain
4. Enable HTTPS in GitHub Pages settings

---

## Monitoring Your Deployment

### Check Deployment Status

```bash
# View gh-pages branch
git checkout gh-pages
git log

# Return to your working branch
git checkout claude/add-deployment-docs-01B1BZXDSnPP6eJTT9iUPG6P
```

### View GitHub Actions

GitHub Pages deployments are visible in:
- Repository → Actions tab
- Repository → Settings → Pages

---

## Need Help?

- **Documentation:** https://livecodes.io/docs/
- **Issues:** https://github.com/live-codes/livecodes/issues
- **Discussions:** https://github.com/live-codes/livecodes/discussions

---

## Summary

✅ **One-command deployment** → `./scripts/deploy-github.sh`

✅ **All features work** → Sharing, saving, GitHub integration, deploy, etc.

✅ **Zero cost** → GitHub Pages is free

✅ **Zero maintenance** → No servers to manage

⚠️ **Short URLs expire after 365 days** → Use Docker setup for permanent URLs

🚀 **Ready to deploy?** → Run `./scripts/deploy-github.sh` now!
