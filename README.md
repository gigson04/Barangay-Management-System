# Barangay Management System

Frontend: HTML + CSS + JavaScript  
Database/Auth: Supabase

## 1. Run locally
Use VS Code Live Server or another static web server. Do not open `index.html` directly with `file://`.

## 2. Configure Supabase
Open `js/config.js` and replace:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Never place a Supabase service-role key in browser JavaScript.

## 3. Create the database
In Supabase:
1. Open SQL Editor.
2. Paste `supabase/schema.sql`.
3. Run it.
4. Create an Authentication user under Authentication > Users.

## 4. What is included
- Dashboard
- Resident management
- Household management
- Business management
- Certificate management
- Complaint tracking
- Reports with print/preview
- Responsive mobile sidebar
- Supabase CRUD-ready data layer
- Demo data when Supabase is not configured

The system follows the required BMS workflow: resident registration, household management, business management, certificate issuance, complaints, reports, authentication/security, integration, testing, backup/recovery and deployment. See the supplied project specification. 
