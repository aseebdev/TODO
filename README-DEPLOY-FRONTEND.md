# TaskFlow frontend deployment (Vercel)

Deploy this folder as its own Vercel project.

1. Import the GitHub repository as a separate project (or configure `todo-dmgo`).
2. Set **Root Directory** to the repository root (the folder containing this `package.json`).
3. Framework preset: Vite.
4. Add Production environment variable:
   - `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`
5. Deploy or redeploy after saving the variable.

The code falls back to `http://localhost:5001/api` for local development. Never put MongoDB credentials or session secrets in frontend variables.
