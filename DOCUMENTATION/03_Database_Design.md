# Database Design

## Database

- Database: PostgreSQL
- Default database name: `cm_grievance`
- Primary keys: UUID
- Access library: `pg`
- Schema source: `backend/src/scripts/schema.sql`

## Entities

| Table | Purpose |
|---|---|
| `users` | Citizens, CMO administrators and department officers |
| `departments` | Active government departments |
| `districts` | Kerala districts used by the submission form |
| `grievances` | Citizen grievance records and AI recommendation fields |
| `grievance_history` | Status changes, remarks, visibility and responsible user |
| `department_assignments` | Department/officer forwarding history |
| `attachments` | Uploaded file metadata and URLs |
| `action_taken_reports` | Department investigation and resolution reports |
| `citizen_feedback` | Post-resolution rating and comments |
| `contact_enquiries` | Public contact form submissions |

## Grievance fields

The `grievances` table stores the official citizen-selected `category` and `priority` separately from:

- `ai_summary`
- `ai_suggested_department`
- `ai_suggested_category`
- `ai_suggested_priority`

AI values are recommendations and never replace official CMO decisions.

## Status lifecycle

```text
Submitted -> Under Review -> In Progress -> Resolved
                                      \-> Reopened
```

Every transition is recorded in `grievance_history` with timestamp, actor, remarks and visibility.

## Relationships

- A user may submit many grievances.
- A grievance belongs to one citizen.
- A grievance may have one current department and officer.
- A grievance has many history records, assignments, attachments and reports.
- A user may create many history records, assignments, reports or attachments.
- A resolved grievance may have one citizen feedback record.

See [09_Database_ER_Diagram.mmd](./09_Database_ER_Diagram.mmd) for the relationship diagram.
