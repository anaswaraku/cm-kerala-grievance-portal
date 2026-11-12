# Setup and Testing

## Prerequisites

- Node.js 18 or later
- PostgreSQL
- A Gemini API key for AI testing

## Database setup

```bash
CREATE DATABASE cm_grievance;
psql -U postgres -d cm_grievance -f backend/src/scripts/schema.sql
```

The schema is designed to be safely re-applied. It creates tables, indexes, districts and demonstration departments.

## Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `backend/.env` and set database credentials, JWT secret and optionally `GEMINI_API_KEY`.

```bash
npm run seed:staff
npm run dev
```

The API runs on `http://localhost:5000`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in the frontend environment to the backend URL. Vite normally serves the app at `http://localhost:5173`.

## Manual test checklist

1. Register a citizen and log in.
2. Submit a grievance with all required fields.
3. Confirm a reference number is returned.
4. Confirm the grievance appears in the citizen dashboard.
5. Log in as the CMO administrator.
6. Confirm dashboard counts and grievance filters load.
7. Click **Analyze** on a grievance and verify the advisory result.
8. Assign a department and officer.
9. Log in as the department officer and update the grievance.
10. Submit an action-taken report.
11. Review the report as CMO.
12. Track the grievance publicly and submit citizen feedback after resolution.

## Build and static validation

```bash
cd frontend
npm run build
npx eslint src/pages/RoleDashboard.jsx

cd ../backend
node --check src/server.js
node --check src/controllers/grievanceController.js
node --check src/routes/grievanceRoutes.js
```

The repository currently has some pre-existing ESLint findings outside the feature being tested. Build and syntax checks are the primary validation for this prototype.
