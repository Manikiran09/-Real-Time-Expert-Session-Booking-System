Deployment guide — Vercel (frontend) and Render (backend)

Overview
- Frontend: Vite React app in the `frontend` folder — build output: `dist`.
- Backend: Node/Express app in the `backend` folder — start command: `npm start`.

Environment variables (examples)
- `MONGODB_URI` — MongoDB connection string for the backend
- `JWT_SECRET` — JWT secret used by backend
- `FRONTEND_URL` — your Vercel frontend URL, used for backend CORS and Socket.IO
- `CORS_ORIGIN` — optional comma-separated list of allowed origins; use `*` for local dev only
- `VITE_API_BASE_URL` — URL to the backend API (set in Vercel for frontend), e.g. `https://your-backend.onrender.com/api`

Vercel (frontend)
1. Create a new project in Vercel and connect your GitHub repository.
2. When prompted for the Root Directory, set it to `frontend`.
3. Set the Build Command to `npm run build` and the Output Directory to `dist`.
4. Add an Environment Variable in Vercel:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://<your-render-backend>/api` (replace with your Render service URL)
5. (Optional) Add `VITE_SOCKET_SERVER_URL` to point to `https://<your-render-backend>` if you use socket.io.
6. Deploy. Vercel will run the build and host the `dist` folder as a static site.

Render (backend)
1. Create a new Web Service in Render and connect your GitHub repository.
2. Set the Root Directory to `backend`.
3. Build command: `npm install` (Render will automatically install and build).
4. Start command: `npm start` (this runs `node server.js`).
5. Add environment variables in Render's dashboard:
   - `MONGODB_URI` (your MongoDB connection string)
   - `JWT_SECRET` (a secure random string)
   - `PORT` (optional, default 5000)
   - `FRONTEND_URL` (your Vercel app URL, e.g. `https://your-app.vercel.app`)
   - `CORS_ORIGIN` (optional; set to the same Vercel URL or a comma-separated list)
6. Deploy the service. Render will provide a stable HTTPS URL like `https://your-backend.onrender.com`.

Notes and tips
- The frontend expects `VITE_API_BASE_URL` to include the `/api` prefix (e.g. `https://.../api`).
- If you deploy backend first, copy the Render service URL into Vercel's env var before deploying the frontend.
- The backend currently sets `cors()` to allow all origins; for production you may want to restrict CORS to your Vercel domain.
- The backend uses `FRONTEND_URL` / `CORS_ORIGIN` so you can restrict CORS to your Vercel domain in production.
- To enable realtime sockets, set `VITE_SOCKET_SERVER_URL` in Vercel to the backend root URL (no `/api`).

Files added
- `frontend/vercel.json` — Vercel build configuration (points to `frontend` package.json and `dist`).
- `render.yaml` — Optional Render service template (example) to create the backend service.
- `.github/workflows/deploy.yml` — GitHub Actions workflow to deploy frontend to Vercel and trigger backend deploy on Render.

Docker / Local container deployment
1. Build and run with Docker Compose (example):

```bash
docker compose build
docker compose up -d
```

2. Backend will be available at `http://localhost:5000` and frontend at `http://localhost:8080`.

3. The `docker-compose.yml` uses an internal MongoDB (`mongo`) and sets `MONGODB_URI` to `mongodb://mongo:27017/expertdb` for convenience. Adjust as needed for production.

GitHub Actions (auto-deploy)
This repository includes `.github/workflows/deploy.yml`.

Trigger
- Runs automatically on push to `main`
- Can also be run manually from GitHub Actions (`workflow_dispatch`)

Required GitHub repository secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_BASE_URL` (example: `https://your-backend.onrender.com/api`)
- `VITE_SOCKET_SERVER_URL` (example: `https://your-backend.onrender.com`)
- `RENDER_DEPLOY_HOOK_URL` (Render service deploy hook URL)

Notes
- The workflow first deploys frontend to Vercel, then triggers backend deploy on Render.
- In Render, create a Deploy Hook from your backend service settings and store it in `RENDER_DEPLOY_HOOK_URL`.
