# 🚀 Deployment Guide - Netlify + GitHub Actions

Complete step-by-step guide to deploy your blog frontend to Netlify with automatic CI/CD.

## Prerequisites

- GitHub account with the repository already pushed
- Netlify account (free: https://app.netlify.com/signup)
- Basic understanding of GitHub/Netlify

## 📋 Step 1: Generate Netlify Auth Token

1. Go to [Netlify App Settings](https://app.netlify.com/user/settings/applications)
2. Click **"New access token"**
3. Copy the token and save it securely
4. This is your `NETLIFY_AUTH_TOKEN`

## 📋 Step 2: Create Netlify Site

### Option A: Manual Setup

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub and authorize
4. Choose repository: `Anivesh00/blog-post-frontend`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.svelte-kit/output/client`
6. Click **"Deploy site"**

### Option B: netlify.toml (Automatic)

The `netlify.toml` file in the repo already has all settings. Just connect your GitHub repo and Netlify handles the rest.

## 📋 Step 3: Get Netlify Site ID

1. After site is created, go to Site settings
2. Scroll to "General" section
3. Find **"Site ID"** field
4. Copy it - this is your `NETLIFY_SITE_ID`

## 📋 Step 4: Add GitHub Secrets

1. Go to your GitHub repo
2. Settings → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these secrets:

```
Name: NETLIFY_AUTH_TOKEN
Value: [paste your Netlify auth token from Step 1]

Name: NETLIFY_SITE_ID
Value: [paste your Netlify Site ID from Step 3]

Name: PUBLIC_API_BASE_URL
Value: https://l3x9sj5t5l.execute-api.ap-south-1.amazonaws.com/dev

Name: PUBLIC_S3_BUCKET_URL
Value: https://serverless-blog-post-media-dev.s3.ap-south-1.amazonaws.com
```

## 📋 Step 5: Verify Environment Variables in Netlify

1. Go to your Netlify site
2. Site settings → **Build & deploy** → **Environment**
3. Add the same variables:

```
PUBLIC_API_BASE_URL = https://l3x9sj5t5l.execute-api.ap-south-1.amazonaws.com/dev
PUBLIC_S3_BUCKET_URL = https://serverless-blog-post-media-dev.s3.ap-south-1.amazonaws.com
```

## 🚀 Deployment Triggers

After setup, deployments happen automatically:

### Production Deployment
```bash
# Push to main branch
git push origin main

# Netlify automatically:
# 1. Pulls latest code
# 2. Installs dependencies
# 3. Runs build
# 4. Deploys to production
```

### Preview Deployment
```bash
# Create/push to feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Netlify creates preview deployment
# GitHub Actions tests and comments preview URL
```

## 📊 CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) does:

1. **On every push/PR**:
   - Install Node.js 18
   - Install dependencies
   - Run linter (if configured)
   - Build project
   
2. **On main branch push**:
   - Deploy to Netlify production
   - Creates live site URL

3. **On PR**:
   - Creates preview deployment
   - Comments preview URL on PR
   - Marks ready for review

## 🔍 Monitor Deployments

### GitHub Actions
1. Go to repo → **Actions** tab
2. See all workflow runs
3. Click run to see details
4. Check logs if build fails

### Netlify Deployments
1. Go to Netlify site
2. **Deploys** tab shows history
3. Click deploy to see details
4. View logs for any issues

## 🆘 Troubleshooting

### Build Fails on Netlify

**Check GitHub Actions logs first:**
1. Repo → Actions → Latest run
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Dependency conflicts

**Solution:**
```bash
# Locally test production build
npm run build

# If it fails, debug locally first
# Then commit fix and push
```

### Secrets Not Available

**Netlify says environment variables are undefined:**
1. Check all secrets are added to GitHub
2. Check environment variables in Netlify site settings
3. Rebuild site in Netlify dashboard

**Fix:**
1. Go to Netlify site → Site settings
2. **Build & deploy** → **Trigger deploy** → **Deploy site**

### Wrong Environment Variables

**Using dev API in production:**
1. Check `.env.production` file
2. Check Netlify environment variables
3. Rebuild

**Fix:**
```bash
# Update .env.production with correct URLs
# Commit and push
git add .env.production
git commit -m "Update production environment variables"
git push origin main
```

## 📝 Custom Domain

### Add Custom Domain to Netlify

1. Go to site → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `blog.example.com`)
4. Follow DNS setup instructions
5. Wait for DNS propagation (5-48 hours)

### Update API CORS

If your API requires CORS updates for the new domain:
1. Update your backend API CORS settings
2. Add your Netlify domain
3. Test with custom domain

## 🔒 Production Checklist

Before going live, verify:

- [ ] Environment variables set correctly
- [ ] API endpoint is production-ready
- [ ] S3 bucket is publicly accessible
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate auto-generated (Netlify does this)
- [ ] Build completes without errors
- [ ] Site loads and functions correctly
- [ ] Console has no errors
- [ ] API calls work correctly
- [ ] Authentication works
- [ ] File uploads work

## 📞 Support

### GitHub Actions Issues
- Check workflow file: `.github/workflows/deploy.yml`
- View logs in Repo → Actions
- Verify secrets are set correctly

### Netlify Issues
- Check Netlify Dashboard
- View build logs
- Check site settings
- Verify environment variables

## 🎉 You're Live!

Your site is now:
- ✅ Automatically deployed on every push
- ✅ Preview deployments on pull requests
- ✅ Custom domain ready
- ✅ HTTPS enabled by default
- ✅ Global CDN for fast loading

**Next steps:**
1. Share your live URL
2. Monitor deployments in GitHub Actions
3. Check Netlify dashboard for performance

---

**Happy deploying! 🚀**
