# Deploy on Vercel

This repo has:
- Static frontend at project root
- Java Spring Boot backend in `backend/`

Vercel will host the frontend and an API proxy (`/api/*`), while the Java backend should stay on Render.

## 1) Keep backend running (Render)

Use your backend URL, for example:
- `https://student-backend.onrender.com`

## 2) Deploy this repo on Vercel

1. Open Vercel dashboard -> `Add New...` -> `Project`
2. Import this GitHub repository
3. Project name: use lowercase letters, digits, `.`, `_`, or `-` only
4. Framework preset: `Other`
5. Root Directory: `.`
6. Build Command: leave empty
7. Output Directory: leave empty
8. Add Environment Variable:
   - Key: `BACKEND_URL`
   - Value: your Render URL (example: `https://student-backend.onrender.com`)
9. Deploy

## 3) Verify

After deploy:
- Frontend pages should load from Vercel URL.
- API calls go to Vercel `/api/*`, then proxy to Render backend.
- Frontend reads `/api/config` and directly uses `BACKEND_URL` when available.
- Test:
  - `<your-vercel-url>/api/health`
