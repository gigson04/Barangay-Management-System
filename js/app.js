/* =========================================================
   BARANGAY MANAGEMENT SYSTEM
   Main Application
   Plain JavaScript + Supabase
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. CONFIGURATION
     ========================================================= */

  const TABLES = [
    "residents",
    "households",
    "businesses",
    "certificates",
    "complaints"
  ];

  const hasSupabase =
    window.SUPABASE_URL &&
    !window.SUPABASE_URL.includes("YOUR-") &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_ANON_KEY.includes("YOUR-");

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
    data: createEmptyData()
  };

  function createEmptyData() {
    return {
      residents: [],
      households: [],
      businesses: [],
      certificates: [],
      complaints: []
    };
  }

  /* =========================================================
     3. DEMO DATA
     ========================================================= */

  const demoData = {
    residents: [
      {
        resident_number: "RES-2026-0001",
        first_name: "Juan",
        middle_name: "D.",
        last_name: "Dela Cruz",
        sex: "Male",
        civil_status: "Single",
        birth_date: "1998-04-12",
        contact_number: "09171234567",
        address: "Purok 1",
        occupation: "Teacher",
        voter_status: "Registered",
        status: "Active"
      },
      {
        resident_number: "RES-2026-0002",
        first_name: "Maria",
        middle_name: "S.",
        last_name: "Santos",
        sex: "Female",
        civil_status: "Married",
        birth_date: "1992-08-21",
        contact_number: "09181234567",
        address: "Purok 2",
        occupation: "Vendor",
        voter_status: "Registered",
        status: "Active"
      },
      {
        resident_number: "RES-2026-0003",
        first_name: "Pedro",
        middle_name: "L.",
        last_name: "Reyes",
        sex: "Male",
        civil_status: "Married",
        birth_date: "1987-01-05",
        contact_number: "09191234567",
        address: "Purok 3",
        occupation: "Driver",
        voter_status: "Not Registered",
        status: "Active"
      }
    ],

    households: [
      {
        household_number: "HH-001",
        house_number: "12",
        address: "Purok 1",
        purok: "Purok 1",
        household_head: "Juan Dela Cruz",
        housing_type: "Concrete",
        ownership_status: "Owned",
        water_source: "Level II",
        electricity: "Available",
        sanitation: "Water-sealed"
      },
      {
        household_number: "HH-002",
        house_number: "8",
        address: "Purok 2",
        purok: "Purok 2",
        household_head: "Maria Santos",
        housing_type: "Mixed",
        ownership_status: "Rented",
        water_source: "Level III",
        electricity: "Available",
        sanitation: "Water-sealed"
      }
    ],

    businesses: [
      {
        business_name: "Maria's Sari-Sari Store",
        owner: "Maria Santos",
        business_type: "Retail",
        address: "Purok 2",
        permit_number: "BP-2026-001",
        permit_expiry: "2026-10-20",
        status: "Active"
      },
      {
        business_name: "Dela Cruz Repair Shop",
        owner: "Juan Dela Cruz",
        business_type: "Services",
        address: "Purok 1",
        permit_number: "BP-2026-002",
        permit_expiry: "2026-12-15",
        status: "Active"
      }
    ],

    certificates: [
      {
        certificate_number: "CERT-2026-001",
        resident: "Juan Dela Cruz",
        certificate_type: "Barangay Clearance",
        purpose: "Employment",
        date_issued: "2026-09-01",
        status: "Issued"
      },
      {
        certificate_number: "CERT-2026-002",
        resident: "Maria Santos",
        certificate_type: "Certificate of Residency",
        purpose: "School requirement",
        date_issued: "2026-09-02",
        status: "Issued"
      }
    ],

    complaints: [
      {
        complaint_number: "COMP-2026-001",
        complainant: "Maria Santos",
        respondent: "Unknown",
        complaint_type: "Noise Disturbance",
        description: "Late-night noise",
        date_filed: "2026-09-12",
        assigned_to: "Barangay Officer",
        status: "Under Review",
        resolution: ""
      }
    ]
  };

  /* =========================================================
     4. MODULE CONFIGURATION
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
          "text",
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
        [
          "owner",
          "Owner",
          "text",
          true
        ],
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
        [
          "resident",
          "Resident",
          "text",
          true
        ],
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
          ]
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
        ["status", "Status"]
      ],

      fields: [
        [
          "complaint_number",
          "Complaint Number",
          "text",
          true
        ],
        [
          "complainant",
          "Complainant",
          "text",
          true
        ],
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
        state.data = structuredClone(demoData);
        return;
      }

      for (const table of TABLES) {
        const {
          data,
          error
        } = await db
          .from(table)
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

        if (!error) {
          state.data[table] = data || [];
        } else {
          console.error(
            `Failed to load ${table}:`,
            error
          );
        }
      }
    },

    async save(
      table,
      record,
      id = null
    ) {
      if (!db) {
        this.saveDemoRecord(
          table,
          record,
          id
        );

        return;
      }

      const request = id
        ? db
            .from(table)
            .update(record)
            .eq("id", id)
        : db
            .from(table)
            .insert(record);

      const {
        error
      } = await request;

      if (error) {
        throw error;
      }

      await this.load();
    },

    saveDemoRecord(
      table,
      record,
      index
    ) {
      if (index !== null) {
        state.data[table][index] = {
          ...state.data[table][index],
          ...record
        };
      } else {
        state.data[table].unshift(
          record
        );
      }
    }
  };

  /* =========================================================
     7. NAVIGATION
     ========================================================= */

  function navigate(view) {
    if (
      view !== "dashboard" &&
      view !== "reports" &&
      !moduleConfig[view]
    ) {
      return;
    }

    state.view = view;

    render();

    $("sidebar")?.classList.remove(
      "open"
    );
  }

  /* =========================================================
     8. DASHBOARD
     ========================================================= */

  function renderDashboard() {
    const data = state.data;

    const statistics = [
      {
        title: "Total Residents",
        value: data.residents.length,
        description: "Registered residents",
        icon: "♙"
      },
      {
        title: "Households",
        value: data.households.length,
        description: "Household profiles",
        icon: "⌂"
      },
      {
        title: "Businesses",
        value: data.businesses.length,
        description: "Registered businesses",
        icon: "▣"
      },
      {
        title: "Certificates Issued",
        value: data.certificates.filter(
          (item) =>
            item.status === "Issued"
        ).length,
        description: "Issued records",
        icon: "▤"
      },
      {
        title: "Pending Complaints",
        value: data.complaints.filter(
          (item) =>
            [
              "Pending",
              "Under Review",
              "For Action",
              "Ongoing"
            ].includes(item.status)
        ).length,
        description: "Needs attention",
        icon: "◉"
      }
    ];

    return `
      <div class="section-head">
        <div>
          <h3>Good day, Administrator</h3>
          <p>
            Here is the current overview
            of your barangay records.
          </p>
        </div>

        <button
          class="btn btn-primary"
          onclick="openModal('residents')"
        >
          + Add Resident
        </button>
      </div>

      <div class="stats">
        ${statistics
          .map(renderStatisticCard)
          .join("")}
      </div>

      <div class="grid-2">
        ${renderPurokPanel()}
        ${renderQuickActions()}
      </div>
    `;
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

    return `
      <div class="panel">
        <div class="panel-head">
          <strong>Quick Actions</strong>
        </div>

        <div class="panel-body">
          <div class="quick-grid">
            ${actions
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

  function renderToolbar(
    type,
    records
  ) {
    const statuses = [
      ...new Set(
        records
          .map(
            (record) =>
              record.status
          )
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
                  let value =
                    record[key] ??
                    "—";

                  if (
                    key === "name"
                  ) {
                    value =
                      getFullName(
                        record
                      );
                  }

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
              <button
                class="btn btn-sm"
                onclick="openModal(
                  '${type}',
                  ${originalIndex}
                )"
              >
                View / Edit
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
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
        .map(
          (record, index) => ({
            ...record,
            __originalIndex:
              index
          })
        )
        .filter((record) => {
          const matchesStatus =
            !status ||
            record.status ===
              status;

          const matchesSearch =
            !search ||
            Object.values(record)
              .join(" ")
              .toLowerCase()
              .includes(search);

          return (
            matchesStatus &&
            matchesSearch
          );
        });

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
    ];

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
                    ▥
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

                <button
                  class="btn btn-sm"
                  style="margin-top:14px"
                  onclick="printReport(
                    '${type}'
                  )"
                >
                  Print / Preview
                </button>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function printReport(type) {
    const records =
      state.data[type];

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
                    const value =
                      key === "name"
                        ? getFullName(
                            record
                          )
                        : record[
                            key
                          ] ?? "";

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

    const record =
      index === null
        ? {}
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

  function renderField(
    field,
    record
  ) {
    const [
      key,
      label,
      inputType,
      options
    ] = field;

    const value =
      record[key] ?? "";

    const required =
      options === true
        ? "required"
        : "";

    if (
      inputType === "select"
    ) {
      return `
        <label>
          ${label}

          <select
            name="${key}"
            ${required}
          >
            <option value="">
              Select...
            </option>

            ${options
              .map(
                (option) => `
                  <option
                    value="${escapeHtml(
                      option
                    )}"
                    ${
                      option === value
                        ? "selected"
                        : ""
                    }
                  >
                    ${escapeHtml(
                      option
                    )}
                  </option>
                `
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
          ${label}

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
        ${label}

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
        ([
          ,
          ,
          ,
          required
        ]) =>
          required === true
      );

    for (
      const [
        key,
        label
      ] of requiredFields
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

    if (db) {
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
    }

    sessionStorage.setItem(
      "bms_logged_in",
      "1"
    );

    await startApplication();
  }

  function logout() {
    sessionStorage.removeItem(
      "bms_logged_in"
    );

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
        ? "Dashboard"
        : moduleMeta[
            currentView
          ]?.title ||
          "Dashboard";

    $("pageEyebrow").textContent =
      currentView ===
      "dashboard"
        ? "OVERVIEW"
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
        button.classList.toggle(
          "active",
          button.dataset.view ===
            state.view
        );
      });
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

    await DataService.load();

    render();
  }

  function start() {
    bindEvents();

    const isLoggedIn =
      sessionStorage.getItem(
        "bms_logged_in"
      );

    if (
      isLoggedIn ||
      !db
    ) {
      startApplication();
    }
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

  /* =========================================================
     START
     ========================================================= */

  start();
})();