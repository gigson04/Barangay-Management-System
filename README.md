# Barangay Management System

Ang **Barangay Management System (BMS)** ay isang web-based system na ginawa para mas mapadali ang pag-manage ng mga barangay records. Dito pwedeng i-manage ang residents, households, businesses, certificates, complaints, at reports.

**Frontend:** HTML, CSS, JavaScript
**Database & Authentication:** Supabase

---

## 1. Paano I-run ang System

Para ma-run ang system, kailangan gumamit ng **VS Code** at **Live Server**.

### Steps:

1. Open the project folder sa VS Code.
2. Kung wala pang Live Server, install muna ang extension.
3. Hanapin ang `index.html`.
4. Right-click sa `index.html`.
5. Piliin ang **Open with Live Server**.
6. Mag-o-open na ang system sa browser.

**Important:** Huwag i-open directly ang `index.html` gamit ang `file://` dahil may mga functions na hindi gagana nang maayos.

---

## 2. Supabase Setup

Gumagamit ang system ng **Supabase** para sa database at authentication.

Punta sa:

```text
js/config.js
```

Hanapin ang:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

Palitan ang values gamit ang sariling **Supabase Project URL** at **Anon/Publishable Key**.

### Security Note

Huwag ilagay ang **Supabase Service Role Key** sa `config.js` o kahit sa ibang frontend JavaScript file.

Ang Service Role Key ay may mataas na access sa database kaya dapat itong manatiling private.

---

## 3. Pag-create ng Database

Para ma-setup ang database:

1. Login sa Supabase.
2. Open ang **SQL Editor**.
3. Buksan ang file na:

```text
supabase/schema.sql
```

4. Copy lahat ng laman ng file.
5. Paste sa Supabase SQL Editor.
6. Click **Run**.
7. Check kung successful na na-create ang tables.

Ang main tables ng system ay:

* `residents`
* `households`
* `household_members`
* `businesses`
* `certificates`
* `complaints`
* `users`

---

## 4. Pag-create ng Login Account

Para magkaroon ng account na gagamitin sa pag-login:

1. Open ang Supabase dashboard.
2. Punta sa **Authentication**.
3. Open **Users**.
4. Click **Add User**.
5. Create ng email at password.
6. Gamitin ang account na iyon para mag-login sa system.

---

## 5. Project Structure

Ganito ang basic structure ng project:

```text
barangay-management-system/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── config.js
│
├── supabase/
│   └── schema.sql
│
└── README.md
```

---

## 6. Mga Main Features

### Dashboard

Sa Dashboard makikita ang summary ng barangay records, tulad ng:

* Total Residents
* Total Households
* Total Businesses
* Certificates
* Pending Complaints
* Resolved Complaints
* Barangay statistics
* Quick actions

---

### Resident Management

Dito mina-manage ang mga resident records.

Pwedeng:

* Mag-add ng resident
* Mag-edit ng resident
* Mag-search ng resident
* Mag-filter ng records
* Tingnan ang resident information
* I-update ang resident status

---

### Household Management

Para naman sa household records, may functions para sa:

* Pag-add ng household
* Household information
* Household head
* Household members
* Household statistics

---

### Business Management

Dito naman mina-manage ang mga registered businesses.

Kasama dito ang:

* Business name
* Business owner
* Business type
* Business address
* Contact information
* Permit number
* Permit expiration
* Business status
* Search and filter

---

### Certificate Management

Pwedeng mag-manage ng iba't ibang barangay certificates tulad ng:

* Barangay Clearance
* Certificate of Residency
* Certificate of Indigency
* Good Moral Certificate
* No Business Certificate
* Low Income Certificate

May kasama ring:

* Certificate history
* Search
* Print/Preview

---

### Complaint Management

Dito nire-record at mina-monitor ang mga complaints.

Kasama sa information ang:

* Complainant
* Respondent
* Complaint type
* Description
* Location
* Assigned personnel
* Status
* Resolution
* Date resolved

Ang complaint status ay dumadaan sa:

```text
FILED
  ↓
UNDER REVIEW
  ↓
FOR ACTION
  ↓
RESOLVED
  ↓
CLOSED
```

---

### Reports

May iba't ibang reports na pwedeng tingnan at i-print:

* Resident Master List
* Household Report
* Business Report
* Certificate Report
* Complaint Report

May search at filter functions din para mas madaling hanapin ang kailangan na records.

---

## 7. Basic System Flow

Ganito ang main flow ng system:

```text
Login
  ↓
Dashboard
  ↓
Resident Registration
  ↓
Resident Management
  ↓
Household Management
  ↓
Business Management
  ↓
Certificate Management
  ↓
Complaint Management
  ↓
Reports
```

---

## 8. Security

Gumagamit ang system ng **Supabase Authentication** para sa login.

Para mas secure ang system:

* Huwag i-share ang Supabase Service Role Key.
* Gamitin lang ang public/anon key sa frontend.
* Gumamit ng secure password.
* I-set nang maayos ang database permissions.
* Gumamit ng **Row Level Security (RLS)** kapag ise-set up na ang system for production.

---

## 9. Responsive Design

Ginawa rin ang UI para mag-adjust sa iba't ibang screen sizes.

Supported ang:

* Desktop
* Laptop
* Tablet
* Mobile

May responsive sidebar din para mas madaling gamitin kapag maliit ang screen.

---

## 10. Project Status

Sa current version ng project, included na ang main pages at basic structure ng Barangay Management System.

Included na ang:

* Dashboard
* Resident Management
* Household Management
* Business Management
* Certificate Management
* Complaint Management
* Reports
* Search and Filter
* Responsive Design
* Supabase Integration Structure
* Authentication Structure
* Demo Data

May ilang parts na kailangan pa ng additional setup at testing bago gamitin sa actual deployment, tulad ng:

* Complete Supabase CRUD testing
* Role-based access control
* Complete validation and error handling
* Certificate generation
* CSV/Excel export
* Backup and recovery
* Unit testing
* Integration testing
* System testing
* Final deployment

---

## 11. Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Database / Authentication

* Supabase
* PostgreSQL
* Supabase Authentication

### Development Tools

* Visual Studio Code
* Live Server
* Supabase SQL Editor

---

## 12. Important Note

Ang project na ito ay ginawa bilang isang **Barangay Management System project** para mas maging organized at convenient ang pag-manage ng barangay records.

Before gamitin sa actual barangay, kailangan muna i-test nang maayos ang system, especially ang database, authentication, user permissions, at bawat module.

Para sa school project, recommended din na ma-demo ang complete flow mula **Login → Dashboard → Resident → Household → Business → Certificate → Complaint → Reports** para makita kung paano connected ang bawat part ng system.
