# Render Deployment (Free Plan)

This project is split into:
- Static frontend (root HTML/CSS/JS files)
- Spring Boot backend in `backend/`

## 1) Deploy backend (Web Service)

1. In Render dashboard, click `New +` -> `Web Service`.
2. Connect this GitHub repository.
3. Use these settings:
   - Name: `student-backend` (or any unique name)
   - Root Directory: `backend`
   - Runtime: `Docker`
   - Plan: `Free`
4. Deploy.
5. After deploy, copy backend URL, for example:
   - `https://student-backend.onrender.com`
6. Verify health:
   - `https://student-backend.onrender.com/api/health`

## 2) Configure frontend API URLs

Update these files and replace:
- `https://YOUR-BACKEND-SERVICE.onrender.com`

Files:
- `Script.js`
- `Signup.js`
- `homePage_resources.js`

## 3) Deploy frontend (Static Site)

1. In Render dashboard, click `New +` -> `Static Site`.
2. Connect this same repository.
3. Use these settings:
   - Root Directory: `.`
   - Build Command: leave empty
   - Publish Directory: `.`
   - Plan: `Free`
4. Deploy.

## 4) Commit and push after URL replacement

```bash
git add .
git commit -m "Configure Render deployment for frontend and backend"
git push
```

Render will auto-deploy on each push to `master`.
