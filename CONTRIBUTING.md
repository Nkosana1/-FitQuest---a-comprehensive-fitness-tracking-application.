# Contributing

Thanks for contributing to FitQuest!

## Branching Strategy
- main/master: stable, production-ready
- feature/*: new features
- fix/*: bug fixes
- docs/*: documentation changes

Create branches from the latest main and open PRs into main.

## Setup
- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`

## Scripts
- Backend dev: `npm run dev`
- Frontend dev: `npm run dev`
- Frontend lint: `npm run lint`

## Commit Messages
Use clear, conventional messages, e.g. `feat: add workout builder` or `fix: handle 401 error`.

## PR Guidelines
- Keep PRs focused and small
- Update docs and env examples if behavior changes
- Include screenshots for UI changes
- Ensure CI passes
