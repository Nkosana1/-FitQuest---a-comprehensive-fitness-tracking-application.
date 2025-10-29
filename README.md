# FitQuest

A production-ready MERN fitness tracking platform with social features, analytics, and PWA support.

## Overview

FitQuest helps users track workouts, monitor progress, and connect with friends. This repo includes a hardened Express API and an optimized React (Vite) SPA ready for deployment to Render (backend) and Vercel (frontend).

## Features

- Authentication, profile, and social graph
- Workout builder and exercise library
- Progress analytics and PR tracking
- PWA (offline + installable)
- SEO and social meta tags

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Helmet, Rate limiting, Compression, Morgan
- Frontend: React 18, Vite, React Router, Tailwind, Chart.js, vite-plugin-pwa

## Monorepo Structure

```
backend/   # Express API
frontend/  # React SPA (Vite)
docs/      # Additional documentation
render.yaml
```

## Local Development

1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

2) Configure environment

- Copy `backend/env.example` to `backend/.env` and set values
- Copy `frontend/env.example` to `frontend/.env` and set values

3) Run dev servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Production Builds

- Backend: `cd backend && npm run start:prod` (Render uses `npm run start`)
- Frontend: `cd frontend && npm run build` (Vercel uses `npm run build`)

## Environment Variables

- Backend: see `backend/env.example`
- Frontend: see `frontend/env.example`

## Deployment

- Frontend on Vercel: see `frontend/vercel.json` and `docs/DEPLOYMENT.md`
- Backend on Render: see `render.yaml` and `docs/DEPLOYMENT.md`

## API Documentation

See `API_DOCS.md` and `docs/API_ENDPOINTS.md` for endpoints and examples.

## Contributing

See `CONTRIBUTING.md`. Open issues and PRs are welcome. Please follow the PR template and CI checks.

## License

MIT
