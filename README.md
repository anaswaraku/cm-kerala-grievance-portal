# CM Kerala Grievance Redressal Portal

Recruitment prototype for the Chief Minister's public grievance redressal portal (WhiteMatrix Recruitment Assessment).  
*Notice: This is a prototype created for evaluation purposes and is not an official Government of Kerala service.*

---

## 🏛️ Architecture Overview

- **Frontend**: React 19, React Router v7, Vite
- **Backend**: Node.js, Express.js (REST API)
- **Database**: PostgreSQL (UUID primary keys, parameterized queries via `pg` pool)
- **Authentication**: JWT authentication with Role-Based Access Control (RBAC)
- **AI Integration**: Optional Google Gemini API (`@google/generative-ai`) for automated summary, priority, and category suggestions

---

## 👥 Demo Accounts

Fictional accounts for evaluation. Initialize them with `npm run seed:staff` from the `backend/` directory.

| Role | Email | Password | Access / Dashboard |
|---|---|---|---|
| **Citizen** | Self-registered via `/register` | User choice | `/citizen/dashboard` |
| **CMO Administrator** | `cmo.admin@grievance.test` | `DemoCmo#2026` | `/cmo/dashboard` |
| **Department Officer** | `pwd.officer@grievance.test` | `DemoOfficer#2026` | `/officer/dashboard` |

---

## 🚀 Quick Start

### 1. Database Setup (PostgreSQL)

Create database and apply schema:

```bash
# In PostgreSQL CLI / psql:
CREATE DATABASE cm_grievance;

# Run the idempotent schema:
psql -U postgres -d cm_grievance -f backend/src/scripts/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Create .env based on .env.example
cp ../.env.example .env

# Install dependencies
npm install

# Seed fictional CMO and Officer accounts
npm run seed:staff

# Start backend server (runs on port 5000)
npm run dev
# or: npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Public Pages & Workflows

1. **Home (`/`)**: Overview, live portal statistics, 4-step grievance lifecycle, navigation.
2. **About Us (`/about`)**: Vision, scope, and prototype disclaimer.
3. **How It Works (`/how-it-works`)**: End-to-end walkthrough from citizen filing to resolution.
4. **Departments (`/departments`)**: Government departments list fetched from database.
5. **Contact Us (`/contact`)**: Public enquiry form saved to `contact_enquiries` table.
6. **FAQ (`/faq`)**: Frequently asked questions with interactive accordion answers.
7. **Track Grievance (`/track` or `/track/:ref`)**: Public status search with timeline history.

---

## 🔄 End-to-End Redressal Lifecycle

```
[Citizen Submits Grievance] ──► System generates Reference ID (e.g. KL-123456-789)
                                   │
                                   ▼
                       [CMO Admin Reviews Grievance]
                                   │
                                   ▼
                       [CMO Assigns Department / Officer]
                                   │
                                   ▼
                   [Officer Investigates & Submits Action Report]
                                   │
                                   ▼
                       [CMO Reviews & Accepts Report]
                                   │
                                   ▼
                          [Status: Resolved]
                                   │
                                   ▼
                   [Citizen Submits Feedback & Rating]
```

---

## 📋 API Route Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Citizen registration |
| `POST` | `/api/auth/login` | Public | Shared authentication |
| `GET` | `/api/auth/me` | Bearer | Current user profile |
| `POST` | `/api/auth/logout` | Bearer | Session invalidation |
| `GET` | `/api/departments` | Public | List active government departments |
| `GET` | `/api/grievances/districts` | Public | List 14 Kerala districts |
| `GET` | `/api/grievances/track/:ref` | Public | Public grievance tracking |
| `POST` | `/api/grievances` | Citizen | Submit new grievance |
| `POST` | `/api/grievances/analyze` | CMO Admin | Analyze a grievance with the AI assistant |
| `GET` | `/api/grievances/my` | Citizen | List authenticated citizen's grievances |
| `POST` | `/api/grievances/:id/attachments` | Citizen | Upload supporting document/image |
| `POST` | `/api/grievances/:id/feedback` | Citizen | Rate resolution (1-5 stars) and feedback |
| `GET` | `/api/grievances` | CMO / Officer | List grievances (scoped by department for officers) |
| `GET` | `/api/grievances/counts` | CMO Admin | Status breakdown & overdue counters |
| `GET` | `/api/grievances/:id` | CMO / Officer | Full grievance record with history & reports |
| `PATCH` | `/api/grievances/:id/status` | CMO / Officer | Update grievance status |
| `POST` | `/api/grievances/:id/assign` | CMO Admin | Assign department and officer |
| `POST` | `/api/reports` | Officer | Submit action-taken investigation report |
| `PATCH` | `/api/reports/:id/review` | CMO Admin | Accept/Reject action report |
| `GET` | `/api/stats` | Public | Summary stats for homepage |
| `GET` | `/api/stats/by-district` | CMO Admin | District-wise analytics |
| `GET` | `/api/stats/by-department` | CMO Admin | Department-wise analytics |
| `POST` | `/api/enquiries` | Public | Submit contact enquiry |

## Documentation

The assignment documentation is in the [`DOCUMENTATION/`](./DOCUMENTATION/) folder:

- Project overview and scope
- System architecture
- Database design and ER diagram
- API documentation
- AI integration and safeguards
- Setup and testing
- Citizen, CMO and officer user guide
