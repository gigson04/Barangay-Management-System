# Barangay Management System — User Manual

This manual is for the Administrator and authorized barangay personnel who use the Barangay Management System (BMS). It explains how to sign in, manage records, and produce reports.

## 1. Open and sign in

1. Open the project in Visual Studio Code and start it with **Live Server** by right-clicking `index.html` and choosing **Open with Live Server**. If your barangay has a hosted link, open that link instead.
2. Sign in with the email and password created for you in Supabase Authentication.
3. When sign-in succeeds, the **Overview** page opens. The navigation menu only shows modules your assigned role can access.
4. To leave the system, select the sign-out icon beside your name.

Use your own account. Do not share passwords or leave the system open on an unattended computer.

## 2. Roles and access

| Role | Available modules |
| --- | --- |
| **Administrator** | Overview, Residents, Households, Businesses, Certificates, Complaints, Reports, and User access |
| **Barangay Secretary** | Overview, Residents, Households, Certificates, and Reports |
| **Treasurer/Business Personnel** | Overview, Businesses, and Reports |
| **Barangay Officer** | Overview, Complaints, and Reports |
| **Pending access** | No records are available until an Administrator assigns a role |

Your role controls the records and actions available to your account. Ask an Administrator if you need access to another module.

## 3. Using the workspace

### Overview

Overview shows record totals and summaries that are available to your role. Select a summary card or use the navigation menu to open its module. Administrators and staff who can manage residents can use **Add resident** for a quick start.

### Search, filters, and record actions

- Use the search box in a module to find a record by its displayed details. Use the status menu to narrow the list where available.
- Select **View / Edit** (or **Edit**) to open a record, update its fields, then choose **Save Record**.
- Required fields are marked with an asterisk. Correct any validation message before saving.
- Use **Cancel** or the close button to leave a form without saving.
- Changes are saved to the shared Supabase database, so authorized users see the same records.

### Residents

1. Open **Residents**, then select **Add Resident**.
2. Enter the resident number, first and last name, and address. Complete other known details, then select **Save Record**.
3. Find a resident using search. Choose **View / Edit** to update their record.
4. Use **Deactivate** when a resident should no longer be treated as active. Use **Restore** to reactivate them later.

Deactivation preserves the resident record and its links to other barangay records. It does not erase the resident from the database.

### Households

1. Register the household members in **Residents** first.
2. Open **Households**, select **Add Household**, and enter the household number, address, and required household head. Add the available census details and save.
3. Select **View profile** on a household row to review its head, address, census details, and members.
4. In the household profile, choose an active resident and relationship, then select **Add member**. Use **Remove** to unlink a member; the resident’s own record remains.
5. Edit the household to change its head or other household details.

A resident can belong to only one household at a time. The household head must be an active resident. Set a different head before removing the current head from the household.

### Businesses and permits

1. Register the business owner as a resident first.
2. Open **Businesses**, select **Register Business**, choose the owner from the resident list, and enter the business and permit details.
3. Check the **Permit attention list** for permits that are overdue or due within 30 days.
4. The list displays a business as **Expired** when its permit expiry date has passed, unless the business is closed. Keep the permit date current.
5. Use **Close** to close a business record. Closed records remain in the system.

### Certificates

1. Register the resident first.
2. Open **Certificates**, select **Issue Certificate**, choose the resident, certificate type, and purpose, then complete the request details.
3. Set the status to **Issued** when the certificate is issued. The issue date is filled in automatically if it is blank.
4. Select **Print** on the certificate row to open its print-ready preview. Use the browser’s print dialog to print or save it as a PDF. Allow pop-ups for the site if the preview does not open.
5. Use **Cancel** to mark a certificate as cancelled. Cancelled records are retained.

Administrators can set the barangay name, address, and signatory used on the printout in `js/config.js`.

### Complaints

1. Register the complainant as a resident first.
2. Open **Complaints**, select **File Complaint**, choose the complainant, and enter the respondent, complaint type, details, and filing date.
3. Update the assigned personnel and status as the case progresses. Add the resolution when it is resolved or closed; the resolution date is filled in automatically when applicable.
4. Select **History** on a complaint row to review recorded status, assignment, and resolution changes.
5. Use **Close** for a closed case and **Reopen** if it needs further action. The complaint and its history are retained.

### Reports

1. Open **Reports** and choose the report for your role.
2. Enter text in **Search this report** and choose a status, if offered, to narrow the results.
3. Select **Print / Preview** to open the browser print dialog. From that dialog, choose a printer or **Save as PDF**.
4. Select **Export CSV** to download the filtered report as a CSV file that can be opened in spreadsheet software.

Allow pop-ups for the site if a print preview does not open. Reports may contain personal information; store and share downloaded files only with authorized personnel.

## 4. Administrator: manage staff access

Administrators can assign roles from **User access**.

1. First create the staff account in the Supabase project: **Authentication → Users → Add user**. Give the staff member their login details securely.
2. Sign in to BMS as an Administrator and open **User access**.
3. Find the staff member and select the appropriate role. New accounts appear with **Pending access** until assigned.
4. Ask the staff member to sign in again after their role is assigned.

Keep at least one Administrator account. The app prevents an Administrator from removing their own access and prevents changing the last Administrator to another role.

## 5. Troubleshooting

| What you see | What to do |
| --- | --- |
| **Pending access** | Ask an Administrator to assign your role in **User access**, then sign in again. |
| **User access is not configured** or a missing `profiles` table error | An Administrator should follow the database setup steps below. |
| A module is missing from the menu | Your current role does not include that module. Ask an Administrator to review your access. |
| A resident is missing from a business, certificate, or complaint selector | Confirm the resident exists and is active. |
| A print preview does not appear | Allow pop-ups for the BMS site and try again. |
| A save fails | Read the on-screen message, check required fields, and retry. If it persists, send the Administrator the exact message and the affected module. |

## 6. Administrator: initial Supabase setup

These steps are for initial setup or a database that has not yet received the BMS role migration. Do not rerun the schema setup on a database that already contains live data unless you understand the migration being applied.

1. In Supabase, open **SQL Editor**.
2. If the BMS tables have not yet been created, run the contents of `supabase/schema.sql` first.
3. Run the complete contents of `supabase/roles.sql` after the schema. This creates user profiles, role policies, and complaint status history, and adds profiles for existing Auth users.
4. Create or confirm the Administrator’s account in **Authentication → Users**.
5. If the Administrator role was not assigned by the setup script, run this in SQL Editor, replacing the address with the Administrator’s Supabase Auth email:

   ```sql
   UPDATE public.profiles
   SET role = 'Administrator'
   WHERE email = 'admin@barangay.gov.ph';
   ```

6. Confirm the account and role:

   ```sql
   SELECT email, role
   FROM public.profiles
   WHERE email = 'admin@barangay.gov.ph';
   ```

The update affects an existing profile only. If it updates zero rows, confirm that the email exists under Supabase **Authentication → Users** and that `roles.sql` completed successfully.

## 7. Security and data handling

- Use an individual account for each staff member and assign only the role they need.
- Do not share passwords or the Supabase **service role key**. The service role key must never be placed in browser JavaScript.
- Treat resident records, complaint details, printed documents, and exported reports as confidential. Share them only with authorized personnel and store them securely.
- Deactivate, close, or cancel records using the available actions rather than trying to delete linked records.
- Use the Supabase dashboard and the barangay’s approved backup process for database administration and recovery.

## 8. Project and configuration reference

- `index.html` — application entry point
- `css/style.css` — layout and visual styles
- `js/app.js` — application behavior
- `js/config.js` — Supabase project URL, publishable key, and certificate masthead details
- `supabase/schema.sql` — core database tables and initial policies
- `supabase/roles.sql` — staff profiles, role access policies, and complaint history

The browser uses the Supabase project URL and public publishable/anon key in `js/config.js`. Never put a service role key in this file. Set `BARANGAY_NAME`, `BARANGAY_ADDRESS`, and `BARANGAY_SIGNATORY` in the same file to customize certificate printouts.
