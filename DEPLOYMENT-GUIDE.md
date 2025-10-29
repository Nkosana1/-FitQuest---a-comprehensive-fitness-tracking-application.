# FitQuest Deployment Guide

## Prereqs
- GitHub repo connected
- MongoDB Atlas cluster and user

## Backend (Render)
1) Create Web Service from repo
- Root dir: backend
- Build: npm ci
- Start: npm run start
- Health check: /health

2) Environment Variables
- NODE_ENV=production
- MONGODB_URI=your_atlas_uri
- JWT_SECRET=your_secret
- FRONTEND_URL=https://fitquest.vercel.app

3) Post-deploy
- Run indexes: `npm run migrate:indexes`
- Seed exercises: `npm run seed:exercises`

## Frontend (Vercel)
1) Import project; set Root Directory: frontend
2) Build Command: npm run build
3) Output Directory: dist
4) Env vars
- VITE_API_URL=https://fitquest-api.onrender.com

## SPA Routing & PWA
- `frontend/vercel.json` handles rewrites to `/index.html`
- PWA enabled via `vite-plugin-pwa` in `vite.config.js`

## Troubleshooting
- 404 on Vercel: root dir incorrect or missing rewrites
- CORS errors: set FRONTEND_URL on backend
- Mongo errors: verify MONGODB_URI and whitelist IPs in Atlas
