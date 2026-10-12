/* =========================================================
   BARANGAY MANAGEMENT SYSTEM
   Main Application
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. CONFIGURATION
     ========================================================= */

  const TABLES = [
    "residents",
    "households",
    "household_members",
    "businesses",
    "certificates",
    "complaints",
    "complaint_status_history"
  ];

  const ROLE_VIEWS = {
    Administrator: ["dashboard", "residents", "households", "businesses", "certificates", "complaints", "reports", "users"],
    "Barangay Secretary": ["dashboard", "residents", "households", "certificates", "reports"],
    "Treasurer/Business Personnel": ["dashboard", "businesses", "reports"],
    "Barangay Officer": ["dashboard", "complaints", "reports"]
  };

  const ROLE_TABLES = {
    Administrator: TABLES,
    "Barangay Secretary": ["residents", "households", "household_members", "certificates"],
    "Treasurer/Business Personnel": ["businesses"],
    "Barangay Officer": ["complaints", "complaint_status_history"]
  };

  const APP_ROLES = ["Pending", "Administrator", "Barangay Secretary", "Treasurer/Business Personnel", "Barangay Officer"];

  const hasSupabase =
    window.SUPABASE_URL &&
    !window.SUPABASE_URL.includes("YOUR_") &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_ANON_KEY.includes("YOUR_");

  const db = hasSupabase
    ? supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
      )
    : null;

  /* =========================================================
     2. APPLICATION STATE
     ========================================================= */

  const state = {
    view: "dashboard",
    editing: null,
    householdProfile: null,
    role: null,
    currentUserId: null,
    data: createEmptyData()
  };

  const searchTextCache = new WeakMap();

  function getSearchText(record) {
    let value = searchTextCache.get(record);
    if (value === undefined) {
      value = Object.values(record).join(" ").toLowerCase();
      searchTextCache.set(record, value);
    }
    return value;
  }

  function getHouseholdMemberCount(householdId) {
    if (!state.householdMemberCounts) {
      state.householdMemberCounts = new Map();
      state.data.household_members.forEach((member) => {
        state.householdMemberCounts.set(member.household_id, (state.householdMemberCounts.get(member.household_id) || 0) + 1);
      });
    }
    return state.householdMemberCounts.get(householdId) || 0;
  }

  function createEmptyData() {
    return {
      residents: [],
      households: [],
      household_members: [],
      businesses: [],
      certificates: [],
      complaints: [],
      complaint_status_history: [],
      profiles: []
    };
  }

  /* =========================================================
     3. MODULE CONFIGURATION
     ========================================================= */

  const moduleMeta = {
    residents: {
      title: "Residents",
      eyebrow: "RESIDENT MANAGEMENT",
      description:
        "Register, search, update, and manage resident records.",
      action: "Add Resident"
    },

    households: {
      title: "Households",
      eyebrow: "HOUSEHOLD MANAGEMENT",
      description:
        "Manage household profiles and resident membership.",
      action: "Add Household"
    },

    businesses: {
      title: "Businesses",
      eyebrow: "BUSINESS MANAGEMENT",
      description:
        "Track registered businesses and permit expiry.",
      action: "Register Business"
    },

    certificates: {
      title: "Certificates",
      eyebrow: "CERTIFICATE MANAGEMENT",
      description:
        "Issue and track barangay certificates and clearances.",
      action: "Issue Certificate"
    },

    complaints: {
      title: "Complaints",
      eyebrow: "COMPLAINT TRACKING",
      description:
        "Record complaints, assignments, progress, and resolutions.",
      action: "File Complaint"
    },

    reports: {
      title: "Reports",
      eyebrow: "BARANGAY REPORTS",
      description:
        "Search, filter, print, and export operational records.",
      action: null
    }
  };

  const moduleConfig = {
    residents: {
      columns: [
        ["resident_number", "Resident No."],
        ["name", "Name"],
        ["age", "Age"],
        ["sex", "Sex"],
        ["civil_status", "Civil Status"],
        ["address", "Address"],
        ["occupation", "Occupation"],
        ["status", "Status"]
      ],

      fields: [
        ["resident_number", "Resident Number", "text", true],
        ["first_name", "First Name", "text", true],
        ["middle_name", "Middle Name", "text"],
        ["last_name", "Last Name", "text", true],
        ["suffix", "Suffix", "text"],
        [
          "sex",
          "Sex",
          "select",
          ["Male", "Female"]
        ],
        ["birth_date", "Birth Date", "date"],
        [
          "civil_status",
          "Civil Status",
          "select",
          [
            "Single",
            "Married",
            "Widowed",
            "Separated"
          ]
        ],
        ["contact_number", "Contact Number", "tel"],
        ["email", "Email", "email"],
        ["occupation", "Occupation", "text"],
        [
          "education",
          "Educational Attainment",
          "text"
        ],
        ["address", "Address", "text", true],
        [
          "voter_status",
          "Voter Status",
          "select",
          [
            "Registered",
            "Not Registered"
          ]
        ],
        [
          "status",
          "Status",
          "select",
          [
            "Active",
            "Inactive"
          ]
        ]
      ]
    },

    households: {
      columns: [
        ["household_number", "Household No."],
        ["household_head", "Household Head"],
        ["members", "Members"],
        ["address", "Address"],
        ["purok", "Purok"],
        ["housing_type", "Housing"],
        ["ownership_status", "Ownership"],
        ["electricity", "Electricity"]
      ],

      fields: [
        [
          "household_number",
          "Household Number",
          "text",
          true
        ],
        [
          "house_number",
          "House Number",
          "text"
        ],
        [
          "address",
          "Address",
          "text",
          true
        ],
        [
          "purok",
          "Purok",
          "select",
          [
            "Purok 1",
            "Purok 2",
            "Purok 3",
            "Purok 4",
            "Purok 5"
          ]
        ],
        [
          "household_head",
          "Household Head",
          "select",
          [],
          true
        ],
        [
          "housing_type",
          "Housing Type",
          "select",
          [
            "Concrete",
            "Wood",
            "Mixed",
            "Other"
          ]
        ],
        [
          "ownership_status",
          "Ownership Status",
          "select",
          [
            "Owned",
            "Rented",
            "Shared",
            "Other"
          ]
        ],
        [
          "water_source",
          "Water Source",
          "select",
          [
            "Level I",
            "Level II",
            "Level III",
            "Other"
          ]
        ],
        [
          "electricity",
          "Electricity",
          "select",
          [
            "Available",
            "Unavailable"
          ]
        ],
        [
          "sanitation",
          "Sanitation",
          "text"
        ]
      ]
    },

    businesses: {
      columns: [
        ["business_name", "Business"],
        ["owner", "Owner"],
        ["business_type", "Type"],
        ["address", "Address"],
        ["permit_number", "Permit No."],
        ["permit_expiry", "Permit Expiry"],
        ["status", "Status"]
      ],

      fields: [
        [
          "business_name",
          "Business Name",
          "text",
          true
        ],
        ["owner_id", "Business Owner", "select", [], true],
        [
          "business_type",
          "Business Type",
          "text",
          true
        ],
        [
          "address",
          "Business Address",
          "text",
          true
        ],
        [
          "contact_number",
          "Contact Number",
          "tel"
        ],
        [
          "registration_date",
          "Registration Date",
          "date"
        ],
        [
          "permit_number",
          "Permit Number",
          "text",
          true
        ],
        [
          "permit_expiry",
          "Permit Expiry",
          "date",
          true
        ],
        [
          "status",
          "Status",
          "select",
          [
            "Active",
            "Expired",
            "Closed"
          ]
        ]
      ]
    },

    certificates: {
      columns: [
        [
          "certificate_number",
          "Certificate No."
        ],
        ["resident", "Resident"],
        ["certificate_type", "Type"],
        ["purpose", "Purpose"],
        ["date_issued", "Date Issued"],
        ["status", "Status"]
      ],

      fields: [
        [
          "certificate_number",
          "Certificate Number",
          "text",
          true
        ],
        ["resident_id", "Resident", "select", [], true],
        [
          "certificate_type",
          "Certificate Type",
          "select",
          [
            "Barangay Clearance",
            "Certificate of Residency",
            "Certificate of Indigency",
            "Certificate of Good Moral Character",
            "Certificate of No Business",
            "Certificate of Low Income",
            "Other"
          ],
          true
        ],
        [
          "purpose",
          "Purpose",
          "text",
          true
        ],
        [
          "date_requested",
          "Date Requested",
          "date"
        ],
        [
          "date_issued",
          "Date Issued",
          "date"
        ],
        [
          "issued_by",
          "Issued By",
          "text"
        ],
        [
          "status",
          "Status",
          "select",
          [
            "Requested",
            "Issued",
            "Cancelled"
          ]
        ]
      ]
    },

    complaints: {
      columns: [
        [
          "complaint_number",
          "Complaint No."
        ],
        ["complainant", "Complainant"],
        ["complaint_type", "Type"],
        ["date_filed", "Date Filed"],
        ["assigned_to", "Assigned To"],
        ["status", "Status"],
        ["resolution", "Resolution"]
      ],

      fields: [
        [
          "complaint_number",
          "Complaint Number",
          "text",
          true
        ],
        ["complainant_id", "Complainant", "select", [], true],
        [
          "respondent",
          "Respondent",
          "text",
          true
        ],
        [
          "complaint_type",
          "Complaint Type",
          "text",
          true
        ],
        [
          "description",
          "Complaint Details",
          "textarea",
          true
        ],
        [
          "date_filed",
          "Date Filed",
          "date",
          true
        ],
        [
          "location",
          "Incident Location",
          "text"
        ],
        [
          "assigned_to",
          "Assigned To",
          "text"
        ],
        [
          "status",
          "Status",
          "select",
          [
            "Pending",
            "Under Review",
            "For Action",
            "Resolved",
            "Closed"
          ]
        ],
        [
          "resolution",
          "Resolution",
          "textarea"
        ],
        [
          "date_resolved",
          "Date Resolved",
          "date"
        ]
      ]
    }
  };

  /* =========================================================
     5. DOM HELPERS
     ========================================================= */

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value = "") {
    return String(value).replace(
      /[&<>"']/g,
      (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return entities[character];
      }
    );
  }

  function showToast(message) {
    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  function getFullName(resident) {
    return [
      resident.first_name,
      resident.middle_name,
      resident.last_name,
      resident.suffix
    ]
      .filter(Boolean)
      .join(" ");
  }

  function getRecordValue(type, record, key) {
    if (key === "name") return getFullName(record);
    if (key === "age") return getAge(record.birth_date) ?? "—";
    if (key === "status" && type === "businesses") return getBusinessStatus(record);
    if (key === "members" && type === "households") {
      return getHouseholdMemberCount(record.id);
    }
    return record[key] ?? "";
  }

  function getBusinessStatus(business) {
    if (business.status === "Closed") return "Closed";
    if (business.permit_expiry && new Date(business.permit_expiry + "T00:00:00") < new Date(new Date().toDateString())) return "Expired";
    return business.status || "Active";
  }

  function getAge(birthDate) {
    if (!birthDate) return null;
    const birth = new Date(birthDate + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  }

  function getToday() {
    return new Date().toLocaleDateString(
      "en-PH",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  }

  function createStatusBadge(status) {
    const green = [
      "Active",
      "Issued",
      "Resolved",
      "Closed"
    ];

    const blue = [
      "Registered",
      "Filed",
      "Under Review",
      "Ongoing",
      "Pending"
    ];

    const amber = [
      "Expired",
      "For Action"
    ];

    let className = "red";

    if (green.includes(status)) {
      className = "green";
    } else if (blue.includes(status)) {
      className = "blue";
    } else if (amber.includes(status)) {
      className = "amber";
    }

    return `
      <span class="badge ${className}">
        ${escapeHtml(status || "—")}
      </span>
    `;
  }

  /* =========================================================
     6. DATA SERVICE
     ========================================================= */

  const DataService = {
    async load() {
      if (!db) {
        throw new Error("Supabase is not configured. Add your project URL and publishable key in js/config.js.");
      }

      const permittedTables = ROLE_TABLES[state.role] || [];
      const tasks = permittedTables.map(async (table) => {
        const { data, error } = await db
          .from(table)
          .select("*")
          .order(table === "complaint_status_history" ? "changed_at" : "created_at", { ascending: false });
        if (error) throw new Error(`Could not load ${table}: ${error.message}`);
        state.data[table] = data || [];
      });

      for (const table of TABLES) {
        if (!permittedTables.includes(table)) state.data[table] = [];
      }

      if (["Treasurer/Business Personnel", "Barangay Officer"].includes(state.role)) {
        tasks.push((async () => {
          const { data, error } = await db.rpc("resident_reference_options");
          if (error) throw new Error(`Could not load resident references: ${error.message}`);
          state.data.residents = data || [];
        })());
      }

      if (state.role === "Administrator") {
        tasks.push((async () => {
          const { data, error } = await db.from("profiles")
            .select("id,email,full_name,role,created_at")
            .order("created_at", { ascending: true });
          if (error) throw new Error(`Could not load user access: ${error.message}`);
          state.data.profiles = data || [];
        })());
      } else {
        state.data.profiles = [];
      }

      await Promise.all(tasks);
    },

    async refresh(table) {
      if (!ROLE_TABLES[state.role]?.includes(table)) return;
      const { data, error } = await db
        .from(table)
        .select("*")
        .order(table === "complaint_status_history" ? "changed_at" : "created_at", { ascending: false });
      if (error) throw new Error(`Could not refresh ${table}: ${error.message}`);
      state.data[table] = data || [];
      if (table === "household_members") state.householdMemberCounts = null;
    },

    async save(
      table,
      record,
      id = null
    ) {
      if (!db) {
        throw new Error("Supabase is not configured. Records cannot be saved.");
      }

      const request = id
        ? db
            .from(table)
            .update(record)
            .eq("id", id)
            .select("*")
            .single()
        : db
            .from(table)
            .insert(record)
            .select("*")
            .single();

      const {
        data: savedRecord,
        error
      } = await request;

      if (error) {
        throw error;
      }

      const records = state.data[table];
      const savedIndex = records.findIndex((item) => item.id === savedRecord.id);
      if (savedIndex >= 0) records[savedIndex] = savedRecord;
      else records.unshift(savedRecord);

      if (table === "households" && record.household_head) {
        const household = savedRecord;
        const resident = state.data.residents.find((item) => getFullName(item) === record.household_head);
        if (household && resident) {
          const priorHead = state.data.household_members.find((member) => member.household_id === household.id && member.relationship === "Head" && member.resident_id !== resident.id);
          if (priorHead) {
            const { error: priorError } = await db.from("household_members").update({ relationship: "Member" }).eq("id", priorHead.id);
            if (priorError) throw priorError;
            priorHead.relationship = "Member";
            searchTextCache.delete(priorHead);
          }
          const { data: headRecord, error: headError } = await db.from("household_members").upsert(
            { household_id: household.id, resident_id: resident.id, relationship: "Head" },
            { onConflict: "household_id,resident_id" }
          ).select("*").single();
          if (headError) throw headError;
          const headIndex = state.data.household_members.findIndex((item) => item.id === headRecord.id);
          if (headIndex >= 0) state.data.household_members[headIndex] = headRecord;
          else state.data.household_members.push(headRecord);
          state.householdMemberCounts = null;
        }
      }
    },

    async setStatus(table, id, index, status) {
      if (!db) throw new Error("Supabase is not configured.");
      const updates = { status };
      if (table === "complaints" && status === "Pending") updates.date_resolved = null;
      if (id) {
        const { error } = await db.from(table).update(updates).eq("id", id);
        if (error) throw error;
        Object.assign(state.data[table][index], updates);
        searchTextCache.delete(state.data[table][index]);
        if (table === "complaints") await this.refresh("complaint_status_history");
      } else {
        Object.assign(state.data[table][index], updates);
      }
    },

    async addHouseholdMember(householdId, residentId, relationship) {
      const { error } = await db.from("household_members").upsert(
        { household_id: householdId, resident_id: residentId, relationship },
        { onConflict: "household_id,resident_id" }
      );
      if (error) throw error;
      await this.refresh("household_members");
    },

    async removeHouseholdMember(id) {
      const { error } = await db.from("household_members").delete().eq("id", id);
      if (error) throw error;
      await this.refresh("household_members");
    },

  };

  /* =========================================================
     7. NAVIGATION
     ========================================================= */

  function navigate(view) {
    if (!canView(view)) return;

    state.view = view;

    render();

    $("sidebar")?.classList.remove(
      "open"
    );
  }

  function canView(view) {
    return (ROLE_VIEWS[state.role] || []).includes(view);
  }

  /* =========================================================
     8. DASHBOARD
     ========================================================= */

  function renderDashboard() {
    const data = state.data;
    state.householdMemberCounts = new Map();
    data.household_members.forEach((member) => {
      state.householdMemberCounts.set(member.household_id, (state.householdMemberCounts.get(member.household_id) || 0) + 1);
    });
    const activeComplaints = data.complaints.filter((item) =>
      ["Pending", "Filed", "Under Review", "For Action", "Ongoing"].includes(item.status)
    ).length;
    const statistics = [
      { module: "residents", title: "Residents", value: data.residents.length, description: "Registered people", icon: "R" },
      { module: "households", title: "Households", value: data.households.length, description: "Household profiles", icon: "H" },
      { module: "businesses", title: "Businesses", value: data.businesses.length, description: "Registered locally", icon: "B" },
      { module: "certificates", title: "Certificates issued", value: data.certificates.filter((item) => item.status === "Issued").length, description: "Issued to residents", icon: "C" },
      { module: "complaints", title: "Open complaints", value: activeComplaints, description: "Need attention", icon: "!" },
      { module: "complaints", title: "Resolved complaints", value: data.complaints.filter((item) => ["Resolved", "Closed"].includes(item.status)).length, description: "Resolved or closed", icon: "✓" }
    ].filter((item) => canView(item.module));

    return `
      <div class="section-head">
        <div><h3>Good day, ${escapeHtml($("userName").textContent || "there")}</h3><p>Here is the latest picture of your barangay records.</p></div>
        <button class="btn btn-primary" onclick="openModal('residents')"><span aria-hidden="true">+</span> Add resident</button>
      </div>
      <div class="stats">${statistics.map(renderStatisticCard).join("")}</div>
      <div class="dashboard-chart-grid">
        ${canView("residents") ? renderPurokPanel() : ""}
        ${canView("residents") ? renderBreakdownPanel("Residents by age group", data.residents, (record) => getAgeGroup(record.birth_date)) : ""}
        ${canView("residents") ? renderBreakdownPanel("Residents by civil status", data.residents, (record) => record.civil_status || "Not recorded") : ""}
        ${canView("households") ? renderBreakdownPanel("Households by purok", data.households, (record) => record.purok || "Not specified") : ""}
        ${canView("households") ? renderBreakdownPanel("Household size", data.households, (record) => getHouseholdSizeGroup(record)) : ""}
        ${canView("households") ? renderHouseholdCensus() : ""}
        ${canView("businesses") ? renderBreakdownPanel("Businesses by type", data.businesses, (record) => record.business_type || "Not specified") : ""}
        ${canView("certificates") ? renderBreakdownPanel("Certificates by month", data.certificates.filter((record) => record.status === "Issued"), (record) => getMonthLabel(record.date_issued)) : ""}
        ${canView("complaints") ? renderBreakdownPanel("Complaints by type", data.complaints, (record) => record.complaint_type || "Not specified") : ""}
        ${canView("complaints") ? renderBreakdownPanel("Complaints by status", data.complaints, (record) => record.status || "Unspecified") : ""}
        ${renderQuickActions()}
      </div>
      ${canView("businesses") ? renderPermitSummary() : ""}
    `;
  }

  function renderBreakdownPanel(title, records, getLabel) {
    const counts = new Map();
    records.forEach((record) => {
      const label = getLabel(record);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const items = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = Math.max(1, ...items.map(([, count]) => count));
    return `
      <div class="panel"><div class="panel-head"><strong>${escapeHtml(title)}</strong><span>${records.length.toLocaleString()} records</span></div>
        <div class="panel-body">${items.length ? `<div class="bars">${items.map(([label, count]) => `
          <div class="bar-row"><span>${escapeHtml(label)}</span><div class="bar"><i style="width:${Math.max(7, Math.round(count / max * 100))}%"></i></div><b>${count}</b></div>
        `).join("")}</div>` : `<div class="empty compact-empty">No records to summarize yet.</div>`}</div>
      </div>
    `;
  }

  function getAgeGroup(birthDate) {
    const age = getAge(birthDate);
    if (age === null) return "Not recorded";
    if (age < 18) return "Under 18";
    if (age < 35) return "18–34";
    if (age < 60) return "35–59";
    return "60+";
  }

  function getHouseholdSizeGroup(household) {
    const size = getHouseholdMemberCount(household.id);
    if (size <= 1) return "1 member";
    if (size <= 3) return "2–3 members";
    if (size <= 5) return "4–5 members";
    return "6+ members";
  }

  function getMonthLabel(dateValue) {
    if (!dateValue) return "Not recorded";
    const date = new Date(dateValue + "T00:00:00");
    return date.toLocaleDateString("en-PH", { month: "short", year: "numeric" });
  }

  function renderHouseholdCensus() {
    const groups = [
      ["Housing type", "housing_type"],
      ["Ownership", "ownership_status"],
      ["Water source", "water_source"],
      ["Electricity", "electricity"],
      ["Sanitation", "sanitation"]
    ];
    return `
      <div class="panel"><div class="panel-head"><strong>Household census</strong><span>Living conditions</span></div><div class="panel-body census-grid">
        ${groups.map(([label, key]) => {
          const counts = new Map();
          state.data.households.forEach((household) => {
            const value = household[key] || "Not recorded";
            counts.set(value, (counts.get(value) || 0) + 1);
          });
          return `<div class="census-row"><strong>${escapeHtml(label)}</strong><div>${[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([value, count]) => `<span>${escapeHtml(value)} <b>${count}</b></span>`).join("") || `<span>Not recorded <b>0</b></span>`}</div></div>`;
        }).join("")}
      </div></div>
    `;
  }

  function renderPermitSummary() {
    const permits = getPermitAlerts();
    if (!permits.length) return "";
    const overdue = permits.filter((business) => new Date(business.permit_expiry + "T00:00:00") < new Date(new Date().toDateString())).length;
    return `
      <div class="permit-summary"><div><span class="eyebrow">PERMIT REMINDERS</span><strong>${overdue ? `${overdue} overdue · ` : ""}${permits.length - overdue} due within 30 days</strong><p>Review business renewals that need attention.</p></div><button class="btn" onclick="navigate('businesses')">Review businesses <span aria-hidden="true">→</span></button></div>
    `;
  }

  function getPermitAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 30);
    return state.data.businesses.filter((business) => {
      if (!business.permit_expiry || business.status === "Closed") return false;
      const expiry = new Date(business.permit_expiry + "T00:00:00");
      return expiry <= cutoff;
    });
  }
  function renderStatisticCard(
    statistic
  ) {
    return `
      <div class="stat">
        <div class="stat-top">
          <span>
            ${statistic.title}
          </span>

          <span class="stat-icon">
            ${statistic.icon}
          </span>
        </div>

        <strong>
          ${statistic.value.toLocaleString()}
        </strong>

        <small>
          ${statistic.description}
        </small>
      </div>
    `;
  }

  function renderPurokPanel() {
    const puroks = [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5"
    ];

    return `
      <div class="panel">
        <div class="panel-head">
          <strong>
            Residents by Purok
          </strong>

          <span class="muted">
            Current records
          </span>
        </div>

        <div class="panel-body">
          <div class="bars">
            ${puroks
              .map(renderPurokBar)
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderPurokBar(
    purok
  ) {
    const count =
      state.data.residents.filter(
        (resident) =>
          (resident.address || "")
            .includes(purok)
      ).length;

    const width = Math.min(
      100,
      Math.max(5, count * 18)
    );

    return `
      <div class="bar-row">
        <span>${purok}</span>

        <div class="bar">
          <i
            style="width:${width}%"
          ></i>
        </div>

        <b>${count}</b>
      </div>
    `;
  }

  function renderQuickActions() {
    const actions = [
      [
        "residents",
        "Add Resident",
        "Create a resident record"
      ],
      [
        "households",
        "Add Household",
        "Create household profile"
      ],
      [
        "businesses",
        "Register Business",
        "Add business permit"
      ],
      [
        "certificates",
        "Issue Certificate",
        "Create certificate"
      ],
      [
        "complaints",
        "File Complaint",
        "Record a complaint"
      ],
      [
        "reports",
        "View Reports",
        "Generate reports"
      ]
    ];

    const allowedActions = actions.filter(([view]) => canView(view));
    return `
      <div class="panel">
        <div class="panel-head">
          <strong>Quick Actions</strong>
        </div>

        <div class="panel-body">
          <div class="quick-grid">
            ${allowedActions
              .map(
                ([
                  view,
                  title,
                  description
                ]) => `
                  <button
                    class="quick"
                    onclick="navigate('${view}')"
                  >
                    <b>${title}</b>
                    <span>
                      ${description}
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================
     9. MODULE PAGES
     ========================================================= */

  function renderModule(type) {
    const config =
      moduleConfig[type];

    const meta =
      moduleMeta[type];

    const records =
      state.data[type];

    return `
      <div class="section-head">
        <div>
          <h3>${meta.title}</h3>
          <p>${meta.description}</p>
        </div>

        ${
          meta.action
            ? `
              <button
                class="btn btn-primary"
                onclick="openModal('${type}')"
              >
                + ${meta.action}
              </button>
            `
            : ""
        }
      </div>

      <div class="panel">
        <div class="panel-body">
          ${type === "businesses" ? renderBusinessPermitPanel() : ""}
          ${renderToolbar(
            type,
            records
          )}

          ${renderTable(
            type,
            records
          )}
        </div>
      </div>
    `;
  }

  function renderBusinessPermitPanel() {
    const permits = getPermitAlerts();
    return `
      <div class="permit-panel">
        <div class="permit-panel-head"><div><strong>Permit attention list</strong><span>Overdue and next 30 days</span></div><b>${permits.length}</b></div>
        ${permits.length ? `<div class="permit-list">${permits.map((business) => {
          const days = Math.ceil((new Date(business.permit_expiry + "T00:00:00") - new Date(new Date().toDateString())) / 86400000);
          return `<div class="permit-row"><div><strong>${escapeHtml(business.business_name)}</strong><span>${escapeHtml(business.owner || "Owner not linked")} · ${escapeHtml(business.permit_number || "No permit number")}</span></div><b>${days < 0 ? `Overdue ${Math.abs(days)}d` : days === 0 ? "Today" : `${days} days`}</b></div>`;
        }).join("")}</div>` : `<p class="permit-empty">No permits expiring in the next 30 days.</p>`}
      </div>
    `;
  }

  function openHouseholdProfile(index) {
    const household = state.data.households[index];
    if (!household) return;
    state.householdProfile = index;
    state.editing = null;
    const members = state.data.household_members.filter((member) => member.household_id === household.id);
    const assignedIds = new Set(members.map((member) => member.resident_id));
    const availableResidents = state.data.residents.filter((resident) => resident.status !== "Inactive" && !assignedIds.has(resident.id) && !state.data.household_members.some((member) => member.resident_id === resident.id && member.household_id !== household.id));

    $("modalEyebrow").textContent = "HOUSEHOLD PROFILE";
    $("modalTitle").textContent = household.household_number || "Household";
    $("recordForm").innerHTML = `
      <div class="profile-summary"><div><span>HOUSEHOLD HEAD</span><strong>${escapeHtml(household.household_head || "Not assigned")}</strong></div><div><span>ADDRESS</span><strong>${escapeHtml([household.house_number, household.address, household.purok].filter(Boolean).join(", ") || "No address")}</strong></div><div><span>HOUSEHOLD SIZE</span><strong>${members.length} ${members.length === 1 ? "member" : "members"}</strong></div></div>
      <div class="profile-facts"><span><small>Housing</small><strong>${escapeHtml(household.housing_type || "Not recorded")}</strong></span><span><small>Ownership</small><strong>${escapeHtml(household.ownership_status || "Not recorded")}</strong></span><span><small>Water</small><strong>${escapeHtml(household.water_source || "Not recorded")}</strong></span><span><small>Electricity</small><strong>${escapeHtml(household.electricity || "Not recorded")}</strong></span><span><small>Sanitation</small><strong>${escapeHtml(household.sanitation || "Not recorded")}</strong></span></div>
      <div class="profile-section-head"><div><strong>Household members</strong><span>Residents connected to this household</span></div><button type="button" class="btn" onclick="closeModal(); openModal('households', ${index})">Edit household</button></div>
      <div class="member-list">${members.length ? members.map((member) => {
        const resident = state.data.residents.find((item) => item.id === member.resident_id);
        if (!resident) return "";
        const isHead = getFullName(resident) === household.household_head;
        return `<div class="member-row"><div class="member-avatar">${escapeHtml((resident.first_name || "?").charAt(0))}</div><div class="member-main"><strong>${escapeHtml(getFullName(resident))}${isHead ? `<span class="head-tag">HEAD</span>` : ""}</strong><span>${escapeHtml(member.relationship || (isHead ? "Head" : "Member"))} · ${formatAge(resident.birth_date)}${resident.occupation ? ` · ${escapeHtml(resident.occupation)}` : ""}</span></div><button type="button" class="btn btn-sm btn-danger" onclick="removeHouseholdMember('${member.id}')">Remove</button></div>`;
      }).join("") : `<div class="empty compact-empty">No residents are assigned yet. Add a resident below.</div>`}</div>
      <div class="add-member"><strong>Add a resident</strong><div class="add-member-controls"><label>Resident<select id="memberResident" ${availableResidents.length ? "required" : "disabled"}><option value="">${availableResidents.length ? "Choose a resident" : "All active residents are assigned"}</option>${availableResidents.map((resident) => `<option value="${escapeHtml(resident.id)}">${escapeHtml(getFullName(resident))} · ${escapeHtml(resident.resident_number || "")}</option>`).join("")}</select></label><label>Relationship<select id="memberRelationship"><option>Member</option><option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Other</option></select></label><button type="button" class="btn btn-primary" onclick="addHouseholdMember()" ${availableResidents.length ? "" : "disabled"}>Add member</button></div></div>
    `;
    $("modal").classList.remove("hidden");
  }

  function openComplaintHistory(index) {
    const complaint = state.data.complaints[index];
    if (!complaint) return;
    state.editing = null;
    state.householdProfile = null;
    const history = state.data.complaint_status_history
      .filter((item) => item.complaint_id === complaint.id)
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
    $("modalEyebrow").textContent = "CASE ACTIVITY";
    $("modalTitle").textContent = complaint.complaint_number || "Complaint history";
    $("recordForm").innerHTML = `
      <div class="history-summary"><div><span>COMPLAINT</span><strong>${escapeHtml(complaint.complaint_type || "Community concern")}</strong></div><div><span>CURRENT STATUS</span>${createStatusBadge(complaint.status)}</div><div><span>ASSIGNED TO</span><strong>${escapeHtml(complaint.assigned_to || "Unassigned")}</strong></div></div>
      <div class="timeline">${history.length ? history.map((item) => `<div class="timeline-item"><span class="timeline-dot"></span><div class="timeline-content"><div class="timeline-heading">${createStatusBadge(item.status)}<time>${escapeHtml(new Date(item.changed_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }))}</time></div>${item.assigned_to ? `<p>Assigned to ${escapeHtml(item.assigned_to)}</p>` : ""}${item.resolution ? `<blockquote>${escapeHtml(item.resolution)}</blockquote>` : ""}</div></div>`).join("") : `<div class="empty">No case activity has been recorded.</div>`}</div>
      <div class="form-actions"><button type="button" class="btn" onclick="closeModal()">Close</button><button type="button" class="btn btn-primary" onclick="closeModal(); openModal('complaints', ${index})">Update complaint</button></div>
    `;
    $("modal").classList.remove("hidden");
  }

  function formatAge(birthDate) {
    if (!birthDate) return "Age not recorded";
    const born = new Date(birthDate + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    if (today.getMonth() < born.getMonth() || (today.getMonth() === born.getMonth() && today.getDate() < born.getDate())) age--;
    return `${age} years old`;
  }

  async function addHouseholdMember() {
    const household = state.data.households[state.householdProfile];
    const residentId = $("memberResident")?.value;
    const relationship = $("memberRelationship")?.value || "Member";
    if (!household?.id || !residentId) return showToast("Choose a resident to add to this household.");
    if (state.data.household_members.some((member) => member.resident_id === residentId && member.household_id !== household.id)) return showToast("This resident already belongs to another household.");
    try {
      await DataService.addHouseholdMember(household.id, residentId, relationship);
      showToast("Resident added to household.");
      openHouseholdProfile(state.householdProfile);
      render();
    } catch (error) {
      showToast(error.message || "Could not add household member.");
    }
  }

  async function removeHouseholdMember(id) {
    const member = state.data.household_members.find((item) => item.id === id);
    const household = state.data.households[state.householdProfile];
    const resident = state.data.residents.find((item) => item.id === member?.resident_id);
    if (household && resident && getFullName(resident) === household.household_head) {
      return showToast("Edit the household head first, then remove this member.");
    }
    if (!window.confirm("Remove this resident from the household? Their resident record will stay in the system.")) return;
    try {
      await DataService.removeHouseholdMember(id);
      showToast("Resident removed from household.");
      openHouseholdProfile(state.householdProfile);
      render();
    } catch (error) {
      showToast(error.message || "Could not remove household member.");
    }
  }

  function renderToolbar(
    type,
    records
  ) {
    const statuses = [
      ...new Set(
        records
          .map((record) => getRecordValue(type, record, "status"))
          .filter(Boolean)
      )
    ];

    return `
      <div class="toolbar">
        <input
          class="search"
          id="tableSearch"
          placeholder="Search ${moduleMeta[
            type
          ].title.toLowerCase()}..."
          oninput="filterTable(
            '${type}',
            this.value
          )"
        />

        <select
          class="filter"
          id="statusFilter"
          onchange="filterTable(
            '${type}',
            document.getElementById(
              'tableSearch'
            ).value
          )"
        >
          <option value="">
            All statuses
          </option>

          ${statuses
            .map(
              (status) => `
                <option
                  value="${escapeHtml(
                    status
                  )}"
                >
                  ${escapeHtml(
                    status
                  )}
                </option>
              `
            )
            .join("")}
        </select>
      </div>
    `;
  }

  function renderTable(
    type,
    records
  ) {
    const config =
      moduleConfig[type];

    return `
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              ${config.columns
                .map(
                  ([, label]) =>
                    `<th>${label}</th>`
                )
                .join("")}

              <th>Action</th>
            </tr>
          </thead>

          <tbody id="tableBody">
            ${renderRows(
              type,
              records
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRows(
    type,
    records
  ) {
    const config =
      moduleConfig[type];

    if (!records.length) {
      return `
        <tr>
          <td
            colspan="${
              config.columns.length + 1
            }"
          >
            <div class="empty">
              <strong>
                No records found
              </strong>

              <span>
                Records will appear
                here once added.
              </span>
            </div>
          </td>
        </tr>
      `;
    }

    return records
      .map((record) => {
        const originalIndex =
          record.__originalIndex ??
          state.data[type].indexOf(
            record
          );

        return `
          <tr>
            ${config.columns
              .map(
                ([key]) => {
                  const value = getRecordValue(type, record, key) ?? "—";

                  if (
                    key === "status"
                  ) {
                    return `
                      <td>
                        ${createStatusBadge(
                          value
                        )}
                      </td>
                    `;
                  }

                  return `
                    <td>
                      ${escapeHtml(
                        value
                      )}
                    </td>
                  `;
                }
              )
              .join("")}

            <td>
              <div class="row-actions">${type === "households" ? `<button class="btn btn-sm" onclick="openHouseholdProfile(${originalIndex})">View profile</button><button class="btn btn-sm" onclick="openModal('${type}', ${originalIndex})">Edit</button>` : `<button class="btn btn-sm" onclick="openModal('${type}', ${originalIndex})">View / Edit</button>${type === "certificates" ? `<button class="btn btn-sm" onclick="printCertificate(${originalIndex})">Print</button>` : ""}${type === "complaints" ? `<button class="btn btn-sm" onclick="openComplaintHistory(${originalIndex})">History</button>` : ""}<button class="btn btn-sm btn-danger" onclick="deleteRecord('${type}', ${originalIndex})" aria-label="Update record status" ${isArchiveDisabled(type, record.status) ? "disabled" : ""}>${getArchiveAction(type, record.status)}</button>`}</div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function getArchiveAction(type, status) {
    if (type === "residents") return status === "Inactive" ? "Restore" : "Deactivate";
    if (type === "businesses") return status === "Closed" ? "Closed" : "Close";
    if (type === "certificates") return status === "Cancelled" ? "Cancelled" : "Cancel";
    if (type === "complaints") return status === "Closed" ? "Reopen" : "Close";
    return "Update";
  }

  function isArchiveDisabled(type, status) {
    return (type === "businesses" && status === "Closed") || (type === "certificates" && status === "Cancelled");
  }

  /* =========================================================
     10. SEARCH AND FILTER
     ========================================================= */

  function filterTable(
    type,
    query = ""
  ) {
    const search =
      query.toLowerCase().trim();

    const status =
      $("statusFilter")?.value ||
      "";

    const filtered =
      state.data[type]
        .map((record, index) => ({ record, index }))
        .filter(({ record }) => {
          const matchesStatus =
            !status ||
            getRecordValue(type, record, "status") ===
              status;

          const matchesSearch =
            !search ||
            getSearchText(record).includes(search);

          return (
            matchesStatus &&
            matchesSearch
          );
        })
        .map(({ record, index }) => ({ ...record, __originalIndex: index }));

    const tableBody =
      $("tableBody");

    if (tableBody) {
      tableBody.innerHTML =
        renderRows(
          type,
          filtered
        );
    }
  }

  async function deleteRecord(type, index) {
    const record = state.data[type]?.[index];
    if (!record || isArchiveDisabled(type, record.status)) return;
    const statuses = {
      residents: record.status === "Inactive" ? "Active" : "Inactive",
      businesses: record.status === "Closed" ? "Active" : "Closed",
      certificates: "Cancelled",
      complaints: record.status === "Closed" ? "Pending" : "Closed"
    };
    const nextStatus = statuses[type];
    if (!nextStatus) return;
    if (!window.confirm(`${getArchiveAction(type, record.status)} this record?`)) return;
    try {
      await DataService.setStatus(type, record.id, index, nextStatus);
      showToast(`Record marked ${nextStatus.toLowerCase()}.`);
      render();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not delete record.");
    }
  }

  /* =========================================================
     11. REPORTS
     ========================================================= */

  function renderReports() {
    const reports = [
      [
        "residents",
        "Resident Master List",
        "Resident number, name, sex, age, civil status, address, occupation"
      ],
      [
        "households",
        "Household Report",
        "Household number, head, address, purok, household size"
      ],
      [
        "businesses",
        "Business Report",
        "Business, owner, type, address, permit, status"
      ],
      [
        "certificates",
        "Certificate Report",
        "Certificate number, resident, type, date issued, purpose"
      ],
      [
        "complaints",
        "Complaint Report",
        "Complaint number, complainant, type, date, status, resolution"
      ]
    ].filter(([type]) => canView(type));

    return `
      <div class="section-head">
        <div>
          <h3>Reports</h3>

          <p>
            Generate operational reports
            from the integrated records.
          </p>
        </div>
      </div>

      <div class="stats">
        ${reports
          .map(
            (
              [
                type,
                title,
                description
              ],
              index
            ) => `
              <div class="stat">
                <div class="stat-top">
                  <span>
                    REPORT ${index + 1}
                  </span>

                  <span class="stat-icon">
                    R
                  </span>
                </div>

                <strong
                  style="font-size:16px"
                >
                  ${title}
                </strong>

                <small>
                  ${description}
                </small>

                ${renderReportFilters(type)}

                <button
                  class="btn btn-sm"
                  style="margin-top:14px"
                  onclick="printReport(
                    '${type}'
                  )"
                >
                  Print / Preview
                </button>
                <button class="btn btn-sm" style="margin:14px 0 0 6px" onclick="exportReport('${type}')">Export CSV</button>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderReportFilters(type) {
    const records = state.data[type];
    const statuses = [...new Set(records.map((record) => getRecordValue(type, record, "status")).filter(Boolean))];
    return `
      <label class="report-control">Search this report<input class="search" id="reportSearch-${type}" type="search" placeholder="Name, address, number..."></label>
      ${statuses.length ? `<label class="report-control">Status<select class="filter" id="reportStatus-${type}"><option value="">All statuses</option>${statuses.map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}</select></label>` : ""}
    `;
  }

  function getFilteredReportRecords(type) {
    const query = $("reportSearch-" + type)?.value.trim().toLowerCase() || "";
    const status = $("reportStatus-" + type)?.value || "";
    return state.data[type].filter((record) => {
      const matchesStatus = !status || getRecordValue(type, record, "status") === status;
      const matchesSearch = !query || getSearchText(record).includes(query);
      return matchesStatus && matchesSearch;
    });
  }

  function printReport(type) {
    const records = getFilteredReportRecords(type);

    const config =
      moduleConfig[type];

    const title =
      `${moduleMeta[type].title} Report`;

    const reportWindow =
      window.open(
        "",
        "_blank"
      );

    if (!reportWindow) {
      showToast(
        "Please allow pop-ups to print reports."
      );

      return;
    }

    const tableHeader =
      config.columns
        .map(
          ([, label]) =>
            `<th>${label}</th>`
        )
        .join("");

    const tableRows =
      records
        .map(
          (record) => `
            <tr>
              ${config.columns
                .map(
                  ([key]) => {
                    const value = getRecordValue(type, record, key);

                    return `
                      <td>
                        ${escapeHtml(
                          value
                        )}
                      </td>
                    `;
                  }
                )
                .join("")}
            </tr>
          `
        )
        .join("");

    reportWindow.document.write(`
      <!doctype html>

      <html>
        <head>
          <title>
            ${escapeHtml(title)}
          </title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #17212b;
            }

            h1 {
              font-size: 22px;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }

            th {
              background: #f4f6f8;
            }
          </style>
        </head>

        <body>
          <h1>
            Barangay Management System —
            ${escapeHtml(title)}
          </h1>

          <p>
            Generated
            ${escapeHtml(
              new Date().toLocaleString()
            )}
          </p>

          <table>
            <thead>
              <tr>
                ${tableHeader}
              </tr>
            </thead>

            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <script>
            window.print();
          <\/script>
        </body>
      </html>
    `);

    reportWindow.document.close();
  }

  function printCertificate(index) {
    const certificate = state.data.certificates[index];
    if (!certificate) return;
    const resident = state.data.residents.find((item) => item.id === certificate.resident_id) ||
      state.data.residents.find((item) => getFullName(item) === certificate.resident);
    if (!resident) return showToast("The resident linked to this certificate could not be found.");
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return showToast("Allow pop-ups to preview and print certificates.");
    const barangayName = window.BARANGAY_NAME || "Barangay";
    const barangayAddress = window.BARANGAY_ADDRESS || "City / Municipality, Province";
    const signatory = window.BARANGAY_SIGNATORY || "Punong Barangay";
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(certificate.certificate_type)} · ${escapeHtml(certificate.certificate_number)}</title><style>
      *{box-sizing:border-box}body{margin:0;padding:38px;background:#f0f1ed;color:#28332b;font:16px Georgia,serif}.sheet{position:relative;width:min(790px,100%);min-height:980px;margin:auto;padding:54px 68px;background:#fff;box-shadow:0 10px 40px #1d2c201c}.seal{position:absolute;top:55px;right:62px;display:grid;width:82px;height:82px;place-items:center;border:2px solid #a8b59f;border-radius:50%;color:#6c806c;text-align:center;font:700 9px Arial;letter-spacing:.1em}.header{text-align:center}.header h1{margin:10px 0 3px;font:700 23px Arial;letter-spacing:.06em}.header p{margin:2px;color:#6f786f;font:12px Arial}.rule{height:3px;margin:22px 0 42px;background:#b6a174}.title{text-align:center;font:700 25px Arial;letter-spacing:.13em}.intro{margin-top:46px;text-align:center;font-style:italic}.name{margin:22px 0;text-align:center;font:700 28px Arial;text-transform:uppercase}.body-copy{margin:28px 0;font-size:17px;line-height:2;text-align:justify}.meta{display:flex;justify-content:space-between;margin-top:40px;font:13px Arial}.signature{width:230px;margin:82px 0 0 auto;text-align:center;font:13px Arial}.signature strong{display:block;padding-top:8px;border-top:1px solid #555}.note{margin-top:48px;color:#899187;text-align:center;font:10px Arial}@media print{body{padding:0;background:#fff}.sheet{width:100%;min-height:0;box-shadow:none}.print-button{display:none}}
    </style></head><body><main class="sheet"><div class="seal">OFFICIAL<br>SEAL</div><header class="header"><h1>${escapeHtml(barangayName)}</h1><p>Office of the Punong Barangay</p><p>${escapeHtml(barangayAddress)}</p></header><div class="rule"></div><div class="title">${escapeHtml(certificate.certificate_type || "BARANGAY CERTIFICATE")}</div><p class="intro">TO WHOM IT MAY CONCERN:</p><p class="body-copy">This is to certify that <strong>${escapeHtml(getFullName(resident))}</strong>, whose recorded address is ${escapeHtml(resident.address || "within this barangay")}, is listed in the records of this office. This ${escapeHtml(certificate.certificate_type || "certification")} is issued upon request for <strong>${escapeHtml(certificate.purpose || "the stated purpose")}</strong>.</p><p class="body-copy">Issued this ${escapeHtml(certificate.date_issued || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }))} at ${escapeHtml(barangayName)}, ${escapeHtml(barangayAddress)}.</p><div class="meta"><span>Certificate No. <strong>${escapeHtml(certificate.certificate_number || "—")}</strong></span><span>Issued by: ${escapeHtml(certificate.issued_by || signatory)}</span></div><div class="signature"><strong>${escapeHtml(signatory)}</strong><span>Punong Barangay</span></div><p class="note">This certificate is issued only for the stated purpose.</p><button class="print-button" onclick="window.print()">Print / Save as PDF</button></main></body></html>`);
    printWindow.document.close();
  }

  function exportReport(type) {
    const config = moduleConfig[type];
    if (!config) return;
    const columns = config.columns;
    const rows = [columns.map(([, label]) => label)];
    for (const record of getFilteredReportRecords(type)) {
      rows.push(columns.map(([key]) => getRecordValue(type, record, key)));
    }
    const csv = "\uFEFF" + rows.map((row) => row.map((value) => {
      let cell = String(value ?? "");
      if (/^[=+@\-]/.test(cell)) cell = "'" + cell;
      return `"${cell.replace(/"/g, '""')}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /* =========================================================
     12. MODAL / FORM GENERATION
     ========================================================= */

  function openModal(
    type,
    index = null
  ) {
    const config =
      moduleConfig[type];

    const meta =
      moduleMeta[type];

    if (!config || !meta) {
      return;
    }

    state.editing = {
      type,
      index
    };
    state.householdProfile = null;

    const record =
      index === null
        ? createNewRecord(type)
        : state.data[type][index] ||
          {};

    $("modalEyebrow").textContent =
      meta.eyebrow;

    $("modalTitle").textContent =
      index === null
        ? meta.action
        : `Edit ${meta.title.replace(
            /s$/,
            ""
          )}`;

    $("recordForm").innerHTML = `
      <div class="form-grid">
        ${config.fields
          .map(
            (field) =>
              renderField(
                field,
                record
              )
          )
          .join("")}
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancel
        </button>

        <button
          class="btn btn-primary"
          type="submit"
        >
          Save Record
        </button>
      </div>
    `;

    $("modal").classList.remove(
      "hidden"
    );
  }

  function createNewRecord(type) {
    const date = new Date();
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const numberFields = {
      residents: ["resident_number", "RES"],
      households: ["household_number", "HH"],
      businesses: ["permit_number", "BP"],
      certificates: ["certificate_number", "CERT"],
      complaints: ["complaint_number", "COMP"]
    };
    const defaults = {
      residents: { status: "Active" },
      businesses: { status: "Active", registration_date: localDate },
      certificates: { status: "Requested", date_requested: localDate },
      complaints: { status: "Pending", date_filed: localDate }
    };
    const record = { ...(defaults[type] || {}) };
    const numberInfo = numberFields[type];
    if (numberInfo) {
      const [field, prefix] = numberInfo;
      const year = date.getFullYear();
      const existing = new Set(state.data[type].map((item) => String(item[field] || "").toLowerCase()));
      let sequence = state.data[type].length + 1;
      let candidate = `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
      while (existing.has(candidate.toLowerCase())) {
        sequence++;
        candidate = `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
      }
      record[field] = candidate;
    }
    return record;
  }

  function createNewRecordDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function renderField(
    field,
    record
  ) {
    const [
      key,
      label,
      inputType,
      options,
      requiredField
    ] = field;

    let value = record[key] ?? "";
    let selectOptions = options;

    if (key === "household_head") {
      selectOptions = state.data.residents.filter((resident) => resident.status !== "Inactive").map(getFullName);
    }
    if (["owner_id", "resident_id", "complainant_id"].includes(key)) {
      selectOptions = state.data.residents
        .filter((resident) => resident.status !== "Inactive")
        .map((resident) => ({ value: resident.id, label: getFullName(resident) }));
      const legacyName = key === "owner_id" ? record.owner : key === "resident_id" ? record.resident : record.complainant;
      if (!value && legacyName) value = state.data.residents.find((resident) => getFullName(resident) === legacyName)?.id || "";
    }

    const required =
      options === true || requiredField === true
        ? "required"
        : "";

    if (
      inputType === "select"
    ) {
      return `
        <label>
          ${label}${required ? " *" : ""}

          <select
            name="${key}"
            ${required}
          >
            <option value="">
              Select...
            </option>

            ${selectOptions
              .map(
                (option) => {
                  const optionValue = typeof option === "object" ? option.value : option;
                  const optionLabel = typeof option === "object" ? option.label : option;
                  return `
                  <option
                    value="${escapeHtml(
                      optionValue
                    )}"
                    ${
                      optionValue === value
                        ? "selected"
                        : ""
                    }
                  >
                    ${escapeHtml(
                      optionLabel
                    )}
                  </option>
                `;
                }
              )
              .join("")}
          </select>
        </label>
      `;
    }

    if (
      inputType === "textarea"
    ) {
      return `
        <label class="full">
          ${label}${required ? " *" : ""}

          <textarea
            name="${key}"
            ${required}
          >${escapeHtml(
            value
          )}</textarea>
        </label>
      `;
    }

    return `
      <label>
        ${label}${required ? " *" : ""}

        <input
          type="${inputType}"
          name="${key}"
          value="${escapeHtml(
            value
          )}"
          ${required}
        >
      </label>
    `;
  }

  function closeModal() {
    $("modal")?.classList.add(
      "hidden"
    );

    state.editing = null;
    state.householdProfile = null;
  }

  async function handleFormSubmit(
    event
  ) {
    event.preventDefault();

    if (!state.editing) {
      return;
    }

    const {
      type,
      index
    } = state.editing;

    const formData =
      new FormData(
        event.target
      );

    const record =
      Object.fromEntries(
        formData.entries()
      );

    for (const [key, value] of Object.entries(record)) {
      if (value === "" && moduleConfig[type].fields.find(([field]) => field === key)?.[2] === "date") {
        record[key] = null;
      }
    }

    if (type === "businesses") {
      const owner = state.data.residents.find((resident) => resident.id === record.owner_id);
      if (owner) record.owner = getFullName(owner);
    }
    if (type === "certificates") {
      const resident = state.data.residents.find((item) => item.id === record.resident_id);
      if (resident) record.resident = getFullName(resident);
    }
    if (type === "complaints") {
      const complainant = state.data.residents.find((item) => item.id === record.complainant_id);
      if (complainant) record.complainant = getFullName(complainant);
      if (["Resolved", "Closed"].includes(record.status) && !record.date_resolved) record.date_resolved = createNewRecordDate();
      if (!["Resolved", "Closed"].includes(record.status)) record.date_resolved = null;
    }
    if (type === "certificates" && record.status === "Issued" && !record.date_issued) {
      record.date_issued = createNewRecordDate();
    }

    try {
      validateRecord(
        type,
        record,
        index
      );

      const existingRecord =
        index === null
          ? null
          : state.data[type][
              index
            ];

      const databaseId =
        existingRecord?.id ||
        null;

      await DataService.save(
        type,
        record,
        databaseId
      );

      showToast(
        "Record saved successfully."
      );

      closeModal();
      render();
    } catch (error) {
      console.error(error);

      showToast(
        error.message ||
          "Could not save record."
      );
    }
  }

  /* =========================================================
     13. VALIDATION
     ========================================================= */

  function validateRecord(
    type,
    record,
    index
  ) {
    const requiredFields =
      moduleConfig[type].fields.filter(
        (field) => field[3] === true || field[4] === true
      );

    for (
      const [key, label] of requiredFields
    ) {
      if (
        !String(
          record[key] || ""
        ).trim()
      ) {
        throw new Error(
          `${label} is required.`
        );
      }
    }

    if (
      type === "residents" &&
      record.birth_date
    ) {
      const birthDate =
        new Date(
          record.birth_date
        );

      if (
        Number.isNaN(
          birthDate.getTime()
        )
      ) {
        throw new Error(
          "Please enter a valid birth date."
        );
      }

      if (
        birthDate > new Date()
      ) {
        throw new Error(
          "Birth date cannot be in the future."
        );
      }
    }

    if (type === "households" && record.household_head) {
      const head = state.data.residents.find((resident) => getFullName(resident) === record.household_head);
      const currentHouseholdId = index === null ? null : state.data.households[index]?.id;
      if (head && state.data.household_members.some((member) => member.resident_id === head.id && member.household_id !== currentHouseholdId)) {
        throw new Error("This resident already belongs to another household.");
      }
    }

    if (
      type === "residents" &&
      record.contact_number
    ) {
      const digits =
        record.contact_number.replace(
          /\D/g,
          ""
        );

      if (digits.length < 10) {
        throw new Error(
          "Please enter a valid contact number."
        );
      }
    }

    checkDuplicate(
      type,
      record,
      index
    );
  }

  function checkDuplicate(
    type,
    record,
    index
  ) {
    const uniqueFields = {
      residents:
        "resident_number",
      households:
        "household_number",
      businesses:
        "permit_number",
      certificates:
        "certificate_number",
      complaints:
        "complaint_number"
    };

    const field =
      uniqueFields[type];

    if (
      !field ||
      !record[field]
    ) {
      return;
    }

    const duplicateIndex =
      state.data[type].findIndex(
        (
          item,
          itemIndex
        ) =>
          itemIndex !== index &&
          String(
            item[field] || ""
          ).toLowerCase() ===
            String(
              record[field]
            )
              .trim()
              .toLowerCase()
      );

    if (
      duplicateIndex !== -1
    ) {
      throw new Error(
        `${field.replaceAll(
          "_",
          " "
        )} already exists.`
      );
    }
  }

  /* =========================================================
     14. AUTHENTICATION
     ========================================================= */

  async function handleLogin(
    event
  ) {
    event.preventDefault();

    const email =
      $("loginEmail")
        .value.trim();

    const password =
      $("loginPassword")
        .value;

    if (
      !email ||
      !password
    ) {
      showToast(
        "Please enter your email and password."
      );

      return;
    }

    if (!db) {
      showToast("Supabase is not configured. Update js/config.js first.");
      return;
    }

    try {
      const {
        error
      } =
        await db.auth
          .signInWithPassword({
            email,
            password
          });

      if (error) {
        showToast(
          error.message
        );

        return;
      }
      await startApplication();
    } catch (error) {
      showToast(error.message || "Sign in failed.");
    }
  }

  function logout() {
    if (db) {
      db.auth
        .signOut()
        .catch(console.error);
    }

    window.location.reload();
  }

  /* =========================================================
     15. MAIN RENDERER
     ========================================================= */

  function render() {
    const currentView =
      state.view;

    $("pageTitle").textContent =
      currentView ===
      "dashboard"
        ? "Overview"
        : currentView === "users"
        ? "User access"
        : moduleMeta[
            currentView
          ]?.title ||
          "Dashboard";

    $("pageEyebrow").textContent =
      currentView ===
      "dashboard"
        ? "YOUR WORKSPACE"
        : currentView === "users"
        ? "ADMINISTRATION"
        : moduleMeta[
            currentView
          ]?.eyebrow ||
          "";

    if (
      currentView ===
      "dashboard"
    ) {
      $("content").innerHTML =
        renderDashboard();
    } else if (
      currentView ===
      "reports"
    ) {
      $("content").innerHTML =
        renderReports();
    } else if (currentView === "users") {
      $("content").innerHTML = renderUserManagement();
    } else {
      $("content").innerHTML =
        renderModule(
          currentView
        );
    }

    updateNavigation();

    $("today").textContent =
      getToday();
  }

  function updateNavigation() {
    document
      .querySelectorAll(
        ".nav-item"
      )
      .forEach((button) => {
        button.hidden = !canView(button.dataset.view);
        button.classList.toggle(
          "active",
          button.dataset.view ===
            state.view
        );
      });
  }

  function renderUserManagement() {
    return `
      <div class="section-head"><div><h3>User access</h3><p>Assign a role to each existing Supabase account.</p></div></div>
      <div class="access-note"><strong>Adding a staff account</strong><span>Create the account in Supabase Authentication first. It will appear here with no access until you assign a role.</span></div>
      <div class="panel"><div class="panel-body"><div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
        ${state.data.profiles.map((profile) => `<tr><td>${escapeHtml(profile.full_name || "Staff account")}${profile.id === state.currentUserId ? ` <span class="head-tag">YOU</span>` : ""}</td><td>${escapeHtml(profile.email)}</td><td><select class="role-select" aria-label="Role for ${escapeHtml(profile.email)}" onchange="updateUserRole('${profile.id}', this.value)">${APP_ROLES.map((role) => `<option value="${escapeHtml(role)}" ${role === profile.role ? "selected" : ""}>${escapeHtml(role === "Pending" ? "Pending access" : role)}</option>`).join("")}</select></td></tr>`).join("") || `<tr><td colspan="3"><div class="empty"><strong>No user profiles found</strong><span>New Supabase accounts will appear here.</span></div></td></tr>`}
      </tbody></table></div></div></div>
    `;
  }

  async function updateUserRole(id, role) {
    if (!canView("users") || !APP_ROLES.includes(role)) return;
    const target = state.data.profiles.find((profile) => profile.id === id);
    if (id === state.currentUserId && role !== "Administrator") {
      showToast("Keep your own account as Administrator to avoid losing access.");
      render();
      return;
    }
    if (target?.role === "Administrator" && role !== "Administrator" && state.data.profiles.filter((profile) => profile.role === "Administrator").length < 2) {
      showToast("Assign another Administrator before changing this role.");
      render();
      return;
    }
    try {
      const { error } = await db.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
      target.role = role;
      showToast("User role updated.");
      render();
    } catch (error) {
      showToast(error.message || "Could not update user role.");
      render();
    }
  }

  /* =========================================================
     16. EVENT BINDINGS
     ========================================================= */

  function bindEvents() {
    $("mainNav")?.addEventListener(
      "click",
      (event) => {
        const button =
          event.target.closest(
            ".nav-item"
          );

        if (button) {
          navigate(
            button.dataset.view
          );
        }
      }
    );

    $("menuBtn")?.addEventListener(
      "click",
      () => {
        $("sidebar")?.classList.toggle(
          "open"
        );
      }
    );

    $("closeModal")?.addEventListener(
      "click",
      closeModal
    );

    $("modal")
      ?.querySelector(
        ".modal-backdrop"
      )
      ?.addEventListener(
        "click",
        closeModal
      );

    $("recordForm")?.addEventListener(
      "submit",
      handleFormSubmit
    );

    $("logoutBtn")?.addEventListener(
      "click",
      logout
    );

    $("loginForm")?.addEventListener(
      "submit",
      handleLogin
    );
  }

  /* =========================================================
     17. APPLICATION STARTUP
     ========================================================= */

  async function startApplication() {
    $("loginView")?.classList.add(
      "hidden"
    );

    $("appView")?.classList.remove(
      "hidden"
    );
    $("content").setAttribute("aria-busy", "true");
    $("content").innerHTML = `<div class="workspace-loading" role="status"><span class="loading-spinner" aria-hidden="true"></span><div><strong>Preparing your workspace</strong><span>Loading your barangay records...</span></div></div>`;

    try {
      const { data: userData } = await db.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Your session has expired. Please sign in again.");
      const { data: profile, error: profileError } = await db.from("profiles").select("id,email,full_name,role").eq("id", user.id).maybeSingle();
      if (profileError || !profile) throw new Error("User access is not configured yet. Run supabase/roles.sql, then assign the first Administrator role in Supabase.");
      if (profile.role === "Pending") throw new Error("Your account is waiting for an Administrator to assign your role.");
      if (!ROLE_VIEWS[profile.role]) throw new Error("Your account does not have a valid barangay role. Contact an Administrator.");
      state.role = profile.role;
      state.currentUserId = user.id;
      const displayName = profile.full_name || user.email?.split("@")[0] || "Staff";
      $("userName").textContent = displayName;
      $("userRole").textContent = profile.role;
      $("userAvatar").textContent = displayName.charAt(0).toUpperCase();
      await DataService.load();
      render();
      $("content").setAttribute("aria-busy", "false");
    } catch (error) {
      $("content").setAttribute("aria-busy", "false");
      console.error(error);
      $("appView")?.classList.add("hidden");
      $("loginView")?.classList.remove("hidden");
      showToast(error.message || "Could not load barangay records.");
    }
  }

  function start() {
    bindEvents();

    if (!db) {
      showToast("Supabase is not configured. Update js/config.js to sign in.");
      return;
    }
    db.auth.getSession().then(({ data, error }) => {
      if (error) return showToast(error.message);
      if (data.session) startApplication();
    }).catch((error) => showToast(error.message || "Could not verify your session."));
  }

  /* =========================================================
     18. PUBLIC FUNCTIONS
     ========================================================= */

  window.navigate =
    navigate;

  window.openModal =
    openModal;

  window.closeModal =
    closeModal;

  window.filterTable =
    filterTable;

  window.printReport =
    printReport;
  window.printCertificate = printCertificate;
  window.exportReport = exportReport;
  window.deleteRecord = deleteRecord;
  window.openHouseholdProfile = openHouseholdProfile;
  window.openComplaintHistory = openComplaintHistory;
  window.addHouseholdMember = addHouseholdMember;
  window.removeHouseholdMember = removeHouseholdMember;
  window.updateUserRole = updateUserRole;

  /* =========================================================
     START
     ========================================================= */

  start();
})();
