/* Seed data: categories, tools, KPIs for the Tubod Stake Portal */
(function () {
  const SECTIONS = [
    { id: "membership", label: "Membership", icon: "users",     desc: "Records, ministering, and reporting for every ward & branch." },
    { id: "finance",    label: "Finance",    icon: "wallet",    desc: "Donations, budgets, reimbursements, and audit readiness." },
    { id: "ai",         label: "AI & Forms", icon: "sparkles",  desc: "Drafting assistants, templates, and the stake form library." },
    { id: "resources",  label: "Resources",  icon: "book",      desc: "Handbooks, calendars, facilities, and training." },
    { id: "admin",      label: "Admin",      icon: "shield",    desc: "Accounts, callings, permissions, and portal settings." },
  ];

  const C = (section, icon, title, desc, meta, tag, pinned) =>
    ({ id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), section, icon, title, desc, meta: meta || "", tag: tag || "", pinned: !!pinned });

  const SEED_CARDS = [
    // Membership
    C("membership", "users",     "Member Directory",        "Search and manage all ward & branch records.",       "12,480 records", "", true),
    C("membership", "move",      "Move Records",            "Transfer records in and out of units.",              "23 pending"),
    C("membership", "userPlus",  "New & Returning",         "Track recent baptisms, moves, and reactivations.",   "+14 this month"),
    C("membership", "handshake", "Ministering",             "Companionships and assignments by quorum.",          "92% covered"),
    C("membership", "gift",      "Birthdays & Milestones",  "Upcoming birthdays and ordination anniversaries.",   "31 this week"),
    C("membership", "barChart",  "Membership Reports",      "Build custom roster and statistical reports.",       "—"),
    C("membership", "image",     "Photo Directory",         "Household photos and printable contact cards.",      "78% complete"),

    // Finance
    C("finance", "wallet",         "Tithing & Donations",  "Record, batch, and review weekly donations.",       "₱ this period", "", true),
    C("finance", "pie",            "Budget Allocation",    "Annual budget by organization and unit.",           "FY2026"),
    C("finance", "receipt",        "Expenses",             "Submit and approve reimbursement requests.",        "8 to approve"),
    C("finance", "coins",          "Fast Offerings",       "Assistance requests and disbursements.",            "5 active"),
    C("finance", "file",           "Tax Statements",       "Generate year-end donor statements.",               "2025"),
    C("finance", "clipboardCheck", "Audit Checklist",      "Prepare for the semiannual unit audit.",            "Due Jun 30", "Due"),

    // AI & Forms
    C("ai", "sparkles",   "Talk & Lesson Helper",  "Draft talks and lessons grounded in scripture.",     "", "AI", true),
    C("ai", "listChecks", "Agenda Builder",        "Generate council and presidency meeting agendas.",   "", "AI"),
    C("ai", "file",       "Form Library",          "Recommends, callings, and baptism records.",         "48 forms"),
    C("ai", "mail",       "Letter Templates",      "Callings, releases, and announcement notices.",      "—"),
    C("ai", "music",      "Sacrament Program",     "Build and print the weekly meeting program.",        "Weekly"),
    C("ai", "languages",  "Translation Assistant", "Tagalog · Cebuano · English drafting help.",         "", "AI"),

    // Resources
    C("resources", "book",       "General Handbook",      "Current policies and procedures, searchable.",      "Updated", "", true),
    C("resources", "bookOpen",   "Gospel Library",        "Scriptures, manuals, and approved media.",          "—"),
    C("resources", "calendar",   "Meetinghouse Calendar", "Rooms, events, and unit scheduling.",               "9 this week"),
    C("resources", "building",   "Building Reservations", "Reserve rooms and facilities across the stake.",    "3 pending"),
    C("resources", "graduation", "Training Library",      "Leadership and clerk training videos.",             "26 videos"),
    C("resources", "mapPin",     "Maps & Boundaries",     "Unit boundaries and meetinghouse directions.",      "8 units"),

    // Admin
    C("admin", "users",     "User Management",   "Portal accounts and access by individual.",   "37 users"),
    C("admin", "shield",    "Roles & Permissions","Configure access by calling and unit.",      "—"),
    C("admin", "clipboard", "Calling Management", "Assignments, sustainings, and releases.",     "1,204 active"),
    C("admin", "sitemap",   "Organization Chart", "Stake and unit leadership at a glance.",       "8 units"),
    C("admin", "history",   "Audit Log",          "Review portal activity and changes.",         "—"),
    C("admin", "download",   "Data Export",       "Export reports and scheduled backups.",        "—"),
    C("admin", "settings",  "Portal Settings",    "Branding, units, and configuration.",          "—"),
  ];

  const KPIS = [
    { label: "Total Members",   value: "12,480", icon: "users",    delta: "+0.6% MoM", state: "up" },
    { label: "Avg Attendance",  value: "57%",    icon: "barChart", delta: "Last 4 weeks", state: "" },
    { label: "Active Callings", value: "1,204",  icon: "clipboard",delta: "38 vacant", state: "warn" },
    { label: "Events This Week",value: "9",       icon: "calendar", delta: "3 stake-wide", state: "" },
  ];

  // icon choices offered in the add/edit modal
  const PICKER_ICONS = ["users","wallet","sparkles","book","shield","calendar","file","mail","barChart","pie","mapPin","building","music","graduation","clipboard","settings","handshake","download"];

  window.SECTIONS = SECTIONS;
  window.SEED_CARDS = SEED_CARDS;
  window.KPIS = KPIS;
  window.PICKER_ICONS = PICKER_ICONS;
})();
