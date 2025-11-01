# FitQuest Production Setup Guide

## Prerequisites
- GitHub account with this repo
- MongoDB Atlas account (free tier available)
- Vercel account (free tier)
- Render account (free tier)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and sign up/login
2. Create a new project (e.g., "FitQuest")
3. Create a **FREE** cluster (M0)
4. Click **"Database Access"** → **"Add New Database User"**
   - Username: `fitquest-user` (or your choice)
   - Password: Generate or create a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
5. Click **"Network Access"** → **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0) for now
   - Or add Render IP ranges when you know them
6. Click **"Database"** → **"Connect"** → **"Connect your application"**
   - Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/...`)
   - Replace `<password>` with your database user password
   - Save this as your `MONGODB_URI`

---

## Step 2: Backend Deployment on Render

1. Go to https://dashboard.render.com and sign up/login
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select your **FitQuest repo**
5. Render should auto-detect `render.yaml` - click **"Apply"**
6. Configure environment variables:
   - Go to your service → **"Environment"** tab
   - Add these variables:
     ```
     MONGODB_URI = your_atlas_connection_string_here
     JWT_SECRET = create_a_random_long_string_here
     FRONTEND_URL = https://your-vercel-url.vercel.app (update after frontend deploy)
     NODE_ENV = production
     JWT_EXPIRES_IN = 30d
     MONGODB_POOL_SIZE = 10
     ```
   - **JWT_SECRET**: Generate a random string (use: `openssl rand -hex 32` or online generator)
7. Click **"Create Web Service"**
8. Wait for deployment (~5 minutes)
9. Copy your backend URL (e.g., `https://fitquest-api.onrender.com`)

---

## Step 3: Frontend Deployment on Vercel

1. Go to https://vercel.com and sign up/login
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (click "Edit" and type "frontend")
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
5. **Environment Variables**:
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com` (from Step 2)
6. Click **"Deploy"**
7. Wait for deployment (~2 minutes)
8. Copy your frontend URL (e.g., `https://fitquest.vercel.app`)

---

## Step 4: Update Environment Variables

### Update Backend (Render)
1. Go back to Render dashboard
2. Your service → **"Environment"** tab
3. Update `FRONTEND_URL` to your actual Vercel URL
4. Click **"Save Changes"** → Render will auto-redeploy

### Optional: Update Frontend (Vercel)
If your backend URL changed, update `VITE_API_URL` in Vercel project settings.

---

## Step 5: Post-Deployment Setup

### Run Database Migrations (Render)
1. In Render dashboard, go to your backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd backend
   npm run migrate:indexes
   npm run seed:exercises
   ```

---

## Step 6: Verify Everything Works

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/health`
   - Should return: `{"success":true,"message":"FitQuest API is running",...}`

2. **Frontend**: Visit your Vercel URL
   - Should load the landing page
   - Try registering a new account
   - Check browser console for errors

3. **Test API Connection**:
   - Open browser DevTools → Network tab
   - Try logging in/registering
   - Check if API calls go to your Render backend

---

## Troubleshooting

### Backend Issues
- **502 Bad Gateway**: Check Render logs, verify MongoDB connection string
- **Database connection errors**: Verify Atlas IP whitelist includes Render IPs
- **Environment variables**: Ensure all required vars are set in Render

### Frontend Issues
- **404 errors**: Check Vercel root directory is set to `frontend`
- **API 404**: Verify `VITE_API_URL` matches your Render backend URL
- **CORS errors**: Update `FRONTEND_URL` in Render backend env vars

### MongoDB Issues
- **Connection timeout**: Check Atlas Network Access whitelist
- **Authentication failed**: Verify username/password in connection string
- **No database**: Atlas creates databases automatically on first connection

---

## Quick Reference

### Backend (Render)
- **Service URL**: Check Render dashboard
- **Logs**: Render dashboard → Your service → "Logs"
- **Environment**: Render dashboard → Your service → "Environment"

### Frontend (Vercel)
- **Site URL**: Check Vercel dashboard
- **Logs**: Vercel dashboard → Your project → "Deployments" → Click deployment → "Logs"
- **Environment**: Vercel dashboard → Your project → "Settings" → "Environment Variables"

---

## Next Steps

Once deployed:
1. Update `LINKS.md` with your actual URLs
2. Update `README.md` with your production links
3. Test all features end-to-end
4. Set up monitoring (optional)
5. Configure custom domain (optional)

**You're all set! 🚀**

