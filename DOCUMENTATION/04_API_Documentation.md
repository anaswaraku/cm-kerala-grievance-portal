# API Documentation

## Conventions

- Base URL during local development: `http://localhost:5000`
- JSON requests use `Content-Type: application/json`.
- Protected endpoints use `Authorization: Bearer <JWT>`.
- Successful responses generally include `status: "success"`.
- Errors include a `message` field.

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a citizen |
| POST | `/api/auth/login` | Public | Login and receive a session |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/logout` | Bearer | End the session |

## Departments and public data

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/departments` | Public | List active departments |
| GET | `/api/grievances/districts` | Public | List districts |
| GET | `/api/stats` | Public | Public summary statistics |
| GET | `/api/grievances/track/:ref` | Public | Track by reference number |

## Citizen grievance operations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/grievances` | Citizen | Create a grievance |
| GET | `/api/grievances/my` | Citizen | List the citizen's grievances |
| POST | `/api/grievances/:id/attachments` | Citizen | Upload a file |
| POST | `/api/grievances/:id/feedback` | Citizen | Submit post-resolution feedback |

Example:

```json
POST /api/grievances
{
  "district": "Ernakulam",
  "category": "Water Supply",
  "subject": "Interrupted water supply",
  "description": "Water has not reached our street for three days."
}
```

## CMO and officer operations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/grievances` | CMO/Officer | List grievances; officers receive scoped results |
| GET | `/api/grievances/counts` | CMO | Status and overdue counts |
| GET | `/api/grievances/:id` | CMO/Officer | View full details |
| PATCH | `/api/grievances/:id/status` | CMO/Officer | Change status and add remarks |
| POST | `/api/grievances/:id/assign` | CMO | Assign department/officer |
| POST | `/api/reports` | Officer | Submit action-taken report |
| PATCH | `/api/reports/:id/review` | CMO | Review a report |

Supported list filters are `district`, `status`, `category` and `priority`.

## AI analysis

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/grievances/analyze` | CMO | Analyze one grievance before making an official decision |

Request:

```json
{
  "subject": "Damaged road near school",
  "description": "A large pothole is creating a safety risk for children."
}
```

Response:

```json
{
  "status": "success",
  "analysis": {
    "summary": "The complaint concerns...",
    "suggested_department": "Public Works Department",
    "suggested_category": "Roads & Public Infrastructure",
    "suggested_priority": "High"
  }
}
```

If Gemini is unavailable, the endpoint returns `503` and the grievance can still be managed manually.
