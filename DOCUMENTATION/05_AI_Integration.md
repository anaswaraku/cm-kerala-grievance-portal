# AI Integration

## Purpose

The AI Grievance Assistant helps a CMO administrator review a grievance. It produces a short summary and advisory classification suggestions:

- Relevant department
- Grievance category
- Priority: Low, Medium or High

The CMO sees the result by selecting **Analyze** beside a grievance in the CMO dashboard.

## Provider and configuration

- Provider: Google Gemini
- Node package: `@google/generative-ai`
- Default model: `gemini-2.5-flash`
- API key: `GEMINI_API_KEY`
- Optional model override: `GEMINI_MODEL`

The API key is loaded only by the backend and must never be placed in frontend code.

## Workflow

1. The CMO clicks **Analyze** for a grievance.
2. The frontend sends the subject and description to `POST /api/grievances/analyze`.
3. The backend verifies the CMO JWT.
4. Active department names are loaded from PostgreSQL.
5. The backend sends the complaint and allowed values to Gemini.
6. The result is displayed beside the selected grievance.
7. The CMO makes the official category, priority and assignment decision.

The existing post-submission background analysis may also store AI recommendation fields on a grievance. Those fields remain separate from official values.

## Prompt constraints

The prompt asks for JSON containing:

```json
{
  "summary": "...",
  "suggested_department": "...",
  "suggested_category": "...",
  "suggested_priority": "Low | Medium | High"
}
```

Available departments and categories are included in the prompt to reduce unsupported classifications.

## Safeguards and limitations

- AI output is advisory and cannot assign or resolve a grievance.
- Only authenticated CMO administrators can invoke the review endpoint.
- If the key is missing or Gemini fails, the API returns an unavailable response and manual processing remains available.
- The application is a fictional recruitment prototype; users should not submit real sensitive information.
- AI output should be reviewed by a human before any action.
