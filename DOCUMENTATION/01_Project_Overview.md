# Project Overview

## Purpose

The CM Kerala Grievance Redressal Portal is a recruitment prototype for a fictional Chief Minister's public grievance workflow. It gives citizens a way to submit and track grievances while allowing the CMO and department officers to review, assign, investigate and resolve them.

This application is not an official Government of Kerala service and uses fictional demonstration data only.

## Objectives

- Provide a clear public-facing portal for grievance submission and tracking.
- Maintain a traceable workflow from submission through resolution.
- Give CMO administrators visibility into all grievances and statistics.
- Give department officers a scoped work queue and action-report workflow.
- Use an AI assistant to provide advisory summaries and classification suggestions.
- Persist users, grievances, history, assignments, attachments, reports, feedback and enquiries in PostgreSQL.

## Main Features

### Public website

- Home page with portal introduction and statistics.
- About, How It Works, Departments, Contact and FAQ pages.
- Public grievance tracking by reference number.

### Citizen portal

- Registration, login and logout.
- Grievance submission with district, category, subject, description and optional attachment.
- Unique reference number generation.
- Citizen dashboard with submitted grievances and feedback after resolution.

### CMO dashboard

- View and filter all grievances.
- Status totals and overdue count.
- Open grievance details and attachments.
- Assign departments and officers.
- Review action-taken reports.
- Analyze an individual grievance with the AI assistant.

### Department officer dashboard

- View grievances assigned to the officer's department.
- Update status and remarks.
- Submit an action-taken report for CMO review.

## Scope and Limitations

This is a prototype. It uses local disk storage for uploads, fictional accounts and a configurable Gemini API. AI output is advisory only; official priority, assignment and status decisions remain with authorized users.
