# CI/CD Setup Guide

This document explains how to set up automatic deployment for both Render and Vercel.

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment Configuration

### 1. Vercel Setup (Frontend)

#### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in/sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `frontend` as root directory

#### Step 2: Add Environment Variables
In Vercel project settings → Environment Variables, add:
- `VITE_API_URL`: `https://real-time-expert-session-booking-system-mlsz.onrender.com/api`
- `VITE_SOCKET_URL`: `https://real-time-expert-session-booking-system-mlsz.onrender.com`

#### Step 3: Get Vercel Secrets for GitHub Actions
Run:
```bash
vercel link
vercel env pull
```

Then get from Vercel dashboard:
- `VERCEL_TOKEN`: Settings → Tokens
- `VERCEL_ORG_ID`: Settings → General (Team ID)
- `VERCEL_PROJECT_ID`: In `.vercel/project.json` file

---

### 2. Render Setup (Backend)

#### Step 1: Connect Repository
1. Go to [render.com](https://render.com) and sign in/sign up
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Select `main` branch

#### Step 2: Configure Service
- **Name**: `expert-session-backend`
- **Environment**: Node
- **Build Command**: (leave as auto-detect)
- **Start Command**: (leave as auto-detect)
- **Root Directory**: `backend`

#### Step 3: Add Environment Variables
In Render service settings, add:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string (min 32 chars)
- `FRONTEND_URL`: `https://real-time-expert-session-booking-system-i6bleals.vercel.app`
- `CORS_ORIGIN`: `https://real-time-expert-session-booking-system-i6bleals.vercel.app`
- `PORT`: `5000`
- `NODE_ENV`: `production`

#### Step 4: Enable Auto Deploy
- Toggle "Auto Deploy" ON
- Select branch: `main`

#### Step 5: Get Deploy Hook URL (For GitHub Actions)
1. Go to Settings → Deploy Hook
2. Create a new deploy hook
3. Copy the URL

#### Step 6: Add to GitHub Secrets
Go to GitHub repository → Settings → Secrets → New repository secret:
- Name: `RENDER_DEPLOY_HOOK_URL`
- Value: Paste the hook URL from Render

---

### 3. GitHub Actions Setup

#### Add Required Secrets
Navigate to GitHub repository → Settings → Secrets → New repository secret

Add these secrets:
```
VERCEL_TOKEN = <Your Vercel Token>
VERCEL_ORG_ID = <Your Vercel Org/Team ID>
VERCEL_PROJECT_ID = <Your Vercel Project ID>
RENDER_DEPLOY_HOOK_URL = <Your Render Deploy Hook URL>
```

#### How GitHub Actions Works
- On every `git push` to `main` branch
- Runs linting and build tests
- Automatically deploys frontend to Vercel
- Automatically triggers backend deployment on Render
- Takes 2-3 minutes for full deployment

---

## Manual Deployment

### Deploy Backend to Render
```bash
git push origin main
```
Render will auto-deploy from its Settings.

### Deploy Frontend to Vercel
```bash
git push origin main
```
Vercel will auto-deploy from its GitHub integration.

---

## Verify Deployment

### Check Frontend
Visit: `https://real-time-expert-session-booking-system-i6bleals.vercel.app`

### Check Backend
Visit: `https://real-time-expert-session-booking-system-mlsz.onrender.com/api/health`

---

## Troubleshooting

### Deployment Failed?
1. Check GitHub Actions logs: Repository → Actions
2. Check Render logs: Dashboard → Service → Logs
3. Check Vercel logs: Project → Deployments → View logs

### 403 Forbidden Error?
- Verify `CORS_ORIGIN` in Render matches your Vercel URL
- Verify `VITE_API_URL` in Vercel points to correct Render backend

### API Not Responding?
- Check backend environment variables on Render
- Check `MONGODB_URI` is correct and cluster is active
- Check network access in MongoDB Atlas

---

## Rollback

To rollback to previous version:
1. **Vercel**: Go to Deployments → Click previous deployment → Promote to Production
2. **Render**: Go to Deploys → Select previous deployment → Cancel current and retry

---

For issues, check `.github/workflows/deploy.yml` for the complete CI/CD configuration.
