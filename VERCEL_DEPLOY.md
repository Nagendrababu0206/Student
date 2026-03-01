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
3. Framework preset: `Other`
4. Root Directory: `.`
5. Build Command: leave empty
6. Output Directory: leave empty
7. Add Environment Variable:
   - Key: `BACKEND_URL`
   - Value: your Render URL (example: `https://student-backend.onrender.com`)
8. Deploy

## 3) Verify

After deploy:
- Frontend pages should load from Vercel URL.
- API calls go to Vercel `/api/*`, then proxy to Render backend.
- Test:
  - `<your-vercel-url>/api/health`

