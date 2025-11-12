# Deployment guide — Frontend on Vercel, Backend on Render/Railway

This guide explains how to host the frontend (React/Vite) on Vercel and the backend (Express) on a Node host such as Render or Railway. It includes environment variables and quick PowerShell commands.

---

## 1) Backend (recommended hosts: Render / Railway / Heroku)

Why host backend separately: the existing backend is an Express app that expects a running Node process and keeps state (MongoDB). Vercel is best used for the static frontend.

A. Prepare the server

- Ensure `server/.env` has the following keys set:
  - MONGODB_URI (Mongo connection string)
  - JWT_SECRET (strong secret)
  - AWS_REGION
  - S3_BUCKET
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - FACE_SIMILARITY (optional; default 75)
  - FRONTEND_ORIGIN (set to your Vercel URL, e.g. https://your-app.vercel.app)

B. Add CORS was added in `server/app.js` and reads `FRONTEND_ORIGIN`.

C. Deploy to Render (example)

1. Create a new Web Service at https://render.com and connect your GitHub repo.
2. Build command: `npm install && npm run build` (server does not have build step; you can use `npm install` only)
3. Start command: `npm run start` or `node app.js` (or `npm run dev` for dev)
4. Add the environment variables from above in Render's dashboard.
5. Deploy and note the public URL (e.g. `https://evoting-server.onrender.com`).

D. Alternatively use Railway or Heroku. The same environment variables must be configured.

---

## 2) Frontend (Vercel)

A. Setup

1. In the Vercel dashboard, create a new project from your Git repository and select the `client/` folder.
2. Vercel will detect the Vite app. If not, set build command: `npm run build` and output directory: `dist`.
3. Add an environment variable in Vercel: `VITE_API_BASE_URL` pointing to your backend base URL (e.g. `https://evoting-server.onrender.com`).
4. (Optional) Set `NODE_ENV=production` in Vercel Environment Variables.

B. Local build test (Windows PowerShell)

```powershell
cd client
npm install
npm run build
# open the dist folder locally to sanity check
explorer .\dist
```

C. Vercel configuration

- `client/vercel.json` is included with static-build config to ensure Vercel runs `npm run build` and serves `dist`.

---

## 3) CORS and security

- The backend reads `FRONTEND_ORIGIN`. Set it to your Vercel URL (including https) to limit allowed origins; otherwise `*` allows all origins (less secure).
- Make sure `JWT_SECRET` is strong. Tokens expire by default in 2 hours.

---

## 4) AWS / S3 notes

- The backend uses `server/config/aws.js` and expects valid AWS credentials with S3 and Rekognition permissions.
- Ensure `S3_BUCKET` is created and the bucket name is configured in env vars on your hosting provider.

---

## 5) After deployment checks

1. Visit `https://<vercel-app>.vercel.app` (frontend). In Vercel env set `VITE_API_BASE_URL` to your server URL.
2. Use admin login (`alpha@evote.local` / `AlphaSecure#2025`) to sign in and register a voter. The admin receives the voter hash in the response; relay it to the voter.
3. Voter can sign in using the assigned hash or Aadhaar and cast a vote using the camera.
4. Confirm votes appear in `/api/results`.

---

## 6) Helpful commands (PowerShell)

Start backend locally:

```powershell
cd server
npm install
# start in dev with nodemon
npm run dev
# or start production
npm start
```

Start frontend locally:

```powershell
cd client
npm install
npm run dev
# open http://localhost:5173
```

---

If you want, I can:

- Add an endpoint that returns the generated frontend URL for convenient `FRONTEND_ORIGIN` setting.
- Create a deploy script or GitHub Action for Render/Vercel automations.

Tell me which host you prefer for the backend (Render, Railway, Heroku, DigitalOcean App) and I can generate exact instructions or a GitHub Actions workflow to auto-deploy.
