/* Data: sections and configuration for the Tubod Stake Portal */
(function () {
  const SECTIONS = [
    { id: "membership",  label: "Membership",  icon: "users",    desc: "Records, ministering, and reporting for every ward & branch." },
    { id: "finance",     label: "Finance",     icon: "wallet",   desc: "Donations, budgets, reimbursements, and audit readiness." },
    { id: "ai",          label: "AI & Forms",  icon: "sparkles", desc: "Drafting assistants, templates, and the stake form library." },
    { id: "resources",   label: "Resources",   icon: "book",     desc: "Handbooks, calendars, facilities, and training." },
    { id: "org-chart",   label: "Org Chart",   icon: "sitemap",  desc: "Stake and unit leadership at a glance." },
    { id: "admin",       label: "Admin",       icon: "shield",   desc: "Accounts, callings, permissions, and portal settings." },
  ];

  const C = (section, icon, title, desc, meta, tag, pinned, url) =>
    ({ id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), section, icon, title, desc, meta: meta || "", tag: tag || "", pinned: !!pinned, url: url || "" });

  const SEED_CARDS = [
    C("admin", "users",     "User Management",    "Portal accounts and access by individual.",  ""),
    C("admin", "shield",    "Roles & Permissions","Configure access by calling and unit.",       ""),
    C("admin", "dashboard", "Categories",         "Show or hide categories for portal users.",  ""),
    C("admin", "settings",  "Portal Settings",    "LCR link and sign-in configuration.",        ""),
  ];

  const DEFAULT_SETTINGS = {
    lcrUrl: "https://lcr.churchofjesuschrist.org",
    showLcrGate: true,
  };

  const PICKER_ICONS = ["users","wallet","sparkles","book","shield","calendar","file","mail","barChart","pie","mapPin","building","music","graduation","clipboard","settings","handshake","download"];

  const SEED_ROLES = [
    { id: "role-001", name: "Stake President",  tabs: ["membership", "finance", "ai", "resources", "org-chart"], canEditOrgChart: false, canSeeAdmin: false },
    { id: "role-002", name: "Stake Clerk",      tabs: ["membership", "finance", "ai", "resources", "org-chart"], canEditOrgChart: false, canSeeAdmin: false },
    { id: "role-003", name: "Stake Councilor",  tabs: ["membership", "finance", "ai", "resources", "org-chart"], canEditOrgChart: false, canSeeAdmin: false },
    { id: "role-004", name: "Branch President", tabs: ["membership", "finance", "ai", "resources", "org-chart"], canEditOrgChart: false, canSeeAdmin: false },
    { id: "role-005", name: "Ward Clerk",       tabs: ["membership", "finance", "ai", "resources", "org-chart"], canEditOrgChart: false, canSeeAdmin: false },
  ];

  const mkC = (unit, position, memberName, dateCalled) => ({
    id: "seed-" + (unit + "-" + position).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    unit, position,
    memberName: memberName || "",
    userId: "",
    mrn: "",
    status: memberName ? "Active" : "Vacant",
    dateCalled: dateCalled || "",
    dateReleased: "",
    notes: "",
    assignments: [],
  });

  const ST = "Tubod Philippines Stake";
  const WARDS    = ["Alegria", "Bad-as", "Kitcharao", "Placer", "Tubod"];
  const BRANCHES = ["Bacuag", "Claver", "Mainit", "Matin-ao"];

  const SEED_CALLINGS = [
    /* ── Stake Presidency ── */
    mkC(ST, "Stake President",      "Norman D. Dolorfino", "2024-03-10"),
    mkC(ST, "First Counselor",      "Ronald M. Kapunan",   "2024-03-10"),
    mkC(ST, "Second Counselor",     "Rodulfo K. Narciso",  "2024-03-10"),
    mkC(ST, "Executive Secretary",  ""),
    mkC(ST, "Stake Clerk",          ""),
    mkC(ST, "Assistant Stake Clerk",""),
    /* ── High Council (12) ── */
    ...Array.from({ length: 12 }, (_, i) => mkC(ST, "High Councilor " + (i + 1), "")),

    /* ── Wards (Bishop + 2 Counselors + Exec Sec + Clerk) ── */
    ...WARDS.flatMap((w) => [
      mkC(w + " Ward", "Bishop",              ""),
      mkC(w + " Ward", "First Counselor",     ""),
      mkC(w + " Ward", "Second Counselor",    ""),
      mkC(w + " Ward", "Executive Secretary", ""),
      mkC(w + " Ward", "Ward Clerk",          ""),
    ]),

    /* ── Branches (Branch President + 2 Counselors + Clerk) ── */
    ...BRANCHES.flatMap((b) => [
      mkC(b + " Branch", "Branch President",  ""),
      mkC(b + " Branch", "First Counselor",   ""),
      mkC(b + " Branch", "Second Counselor",  ""),
      mkC(b + " Branch", "Branch Clerk",      ""),
    ]),
  ];

  window.SECTIONS = SECTIONS;
  window.SEED_CARDS = SEED_CARDS;
  window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  window.SEED_ROLES = SEED_ROLES;
  window.SEED_CALLINGS = SEED_CALLINGS;
  window.PICKER_ICONS = PICKER_ICONS;
})();
