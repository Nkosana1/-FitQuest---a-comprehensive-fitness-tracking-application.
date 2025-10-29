# Troubleshooting

## Backend
- 500 errors: check JWT_SECRET, Mongo connectivity, and logs
- Mongo timeouts: increase MONGODB_SERVER_SELECTION_TIMEOUT_MS; verify Atlas IP allowlist
- CORS blocked: set FRONTEND_URL to your Vercel domain

## Frontend
- Blank page: ensure SPA rewrites to /index.html (Vercel)
- API 404: verify VITE_API_URL and that backend /health is OK
- Stale PWA: hard refresh to update service worker

## CI/CD
- Install failures: clear lockfiles; Node >= 18
- Lint errors: run npm run lint in frontend/

## Data
- Missing seed: npm run seed:exercises in backend/
- Slow queries: npm run migrate:indexes after deploy
