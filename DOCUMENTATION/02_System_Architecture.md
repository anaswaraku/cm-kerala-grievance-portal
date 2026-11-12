# System Architecture

## Components

```text
Browser (React/Vite)
        |
        | JSON REST requests + Bearer JWT
        v
Node.js / Express API
        |
        +--> PostgreSQL database
        |
        +--> Local uploads directory
        |
        +--> Google Gemini API (optional AI analysis)
```

## Frontend

The React application is located in `frontend/`.

- React 19 renders public pages and role dashboards.
- React Router handles public, authentication and protected routes.
- `AuthContext` stores the authenticated session.
- `ProtectedRoute` restricts dashboards by role.
- `src/services/api.js` centralizes JSON and file-upload requests.
- Vite builds the production bundle.

Important routes:

| Route | Purpose |
|---|---|
| `/` | Public home page |
| `/access` | Entry page for authentication and submission |
| `/login` | Login |
| `/register` | Citizen registration |
| `/track` | Public tracking |
| `/citizen/dashboard` | Citizen portal |
| `/cmo/dashboard` | CMO administrator dashboard |
| `/officer/dashboard` | Department officer dashboard |

## Backend

The Express application is located in `backend/src/`.

- `server.js` configures middleware and mounts API routes.
- Controllers validate requests and implement business logic.
- Middleware verifies JWTs and checks roles.
- `pg` uses parameterized SQL queries through a shared connection pool.
- Multer stores uploaded files in `backend/uploads`.
- `aiService.js` calls Gemini when `GEMINI_API_KEY` is configured.

## Authentication and authorization

Authentication uses JWT bearer tokens. The supported roles are:

- `citizen`
- `cmo_admin`
- `department_officer`

Protected routes use `authenticate` followed by `authorize(...)`. Department officers are restricted to grievances assigned to their department. CMO-only operations include assignment, counts, statistics and AI analysis.

## Data flow

1. A citizen submits a grievance.
2. The API validates the request and stores the grievance.
3. A public history entry is created with status `Submitted`.
4. The CMO reviews the grievance, optionally uses AI analysis, and assigns a department/officer.
5. The officer updates progress and submits an action-taken report.
6. The CMO reviews the report and resolves or reopens the grievance.
7. The citizen tracks public history and can submit feedback after resolution.

See [08_System_Architecture.mmd](./08_System_Architecture.mmd) for the diagram.
