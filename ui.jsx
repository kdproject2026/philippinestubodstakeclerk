/* UI building blocks */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  /* ---------------- TopBar ---------------- */
  function TopBar({ theme, onToggleTheme, query, setQuery, searchRef, session, pendingCount, onViewPending, onSignOut }) {
    const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      if (!menuOpen) return;
      const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
      const k = (e) => { if (e.key === "Escape") setMenuOpen(false); };
      document.addEventListener("mousedown", h);
      document.addEventListener("keydown", k);
      return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
    }, [menuOpen]);

    return (
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Icon name="church" size={20} sw={1.5} /></div>
          <div className="brand-text">
            <span className="nm">Tubod Stake</span>
            <span className="sub">ADMINISTRATION PORTAL</span>
          </div>
        </div>

        <div className="search">
          <Icon name="search" size={16} />
          <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools and records…" aria-label="Search" />
          <kbd>/</kbd>
        </div>

        <div className="topbar-spacer" />

        <div className="icon-wrap">
          <button className="icon-btn" aria-label="Pending accounts"
            onClick={pendingCount > 0 ? onViewPending : undefined}
            style={pendingCount > 0 ? { color: "var(--warn)" } : {}}>
            <Icon name="bell" />
          </button>
          {pendingCount > 0
            ? <span className="badge-count">{pendingCount}</span>
            : <span className="badge-dot" />}
        </div>
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <div className="user-wrap" ref={menuRef}>
          <button className="user-chip" onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu" aria-expanded={menuOpen}>
            <span className="avatar">{initials(session?.fullName)}</span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span className="u-nm">{session?.fullName || "—"}</span>
              <span className="u-role">{session?.calling || session?.role || ""}</span>
            </span>
          </button>
          {menuOpen && (
            <div className="menu user-menu" role="menu">
              <button role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="help" size={15} /> Help &amp; Support
              </button>
              <div className="sep" />
              <button role="menuitem" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                <Icon name="logout" size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  /* ---------------- Sidebar ---------------- */
  function Sidebar({ sections, active, setActive, counts, open, onSignOut, isAdmin }) {
    const visible = sections;
    return (
      <nav className={"sidebar" + (open ? " open" : "")}>
        <div className="nav-label">Categories</div>
        {visible.map((s) => (
          <button key={s.id} className={"nav-item" + (active === s.id ? " active" : "")} onClick={() => setActive(s.id)}>
            <Icon name={s.icon} size={18} className="ic" />
            <span className="lbl">{s.label}</span>
            {s.id !== "org-chart" && <span className="cnt">{counts[s.id] || 0}</span>}
          </button>
        ))}

        <div className="sidebar-foot">
          <button className="nav-item"><Icon name="help" size={18} className="ic" /><span className="lbl">Help & Support</span></button>
          <button className="nav-item" onClick={onSignOut}><Icon name="logout" size={18} className="ic" /><span className="lbl">Sign out</span></button>
        </div>
      </nav>
    );
  }

  /* ---------------- Bottom nav (mobile) ---------------- */
  function BottomNav({ sections, active, setActive }) {
    return (
      <nav className="bottom-nav">
        {sections.map((s) => (
          <button key={s.id} className={"bn-item" + (active === s.id ? " active" : "")} onClick={() => setActive(s.id)}>
            <Icon name={s.icon} size={20} sw={1.7} />
            <span className="bn-lbl">{s.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  /* ---------------- KPI row ---------------- */
  function KpiRow({ items }) {
    return (
      <div className="kpi-row">
        {items.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="k-top">
              <span className="k-label">{k.label}</span>
              <Icon name={k.icon} size={16} className="k-ic" />
            </div>
            <span className="k-val">{k.value}</span>
            <span className={"k-delta " + (k.state || "")}>
              {k.state === "up" && <Icon name="arrowRight" size={12} sw={2} />}
              {k.delta}
            </span>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- Tool card ---------------- */
  function ToolCard({ card, onOpen, onPin, onEdit, onDelete, menuOpen, setMenuOpen, isAdmin }) {
    const ref = useRef(null);
    useEffect(() => {
      if (menuOpen !== card.id) return;
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(null); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [menuOpen]);

    return (
      <div className="tool" ref={ref} tabIndex={0} role="button"
        onClick={() => onOpen(card)}
        onKeyDown={(e) => { if (e.key === "Enter") onOpen(card); }}>
        <div className="tool-top">
          <div className="tool-ic"><Icon name={card.icon} size={20} /></div>
          {isAdmin && (
            <div className="tool-actions" onClick={(e) => e.stopPropagation()}>
              <button className={"mini-btn" + (card.pinned ? " pinned" : "")} title={card.pinned ? "Unpin" : "Pin"}
                onClick={() => onPin(card.id)} style={card.pinned ? { opacity: 1 } : null}>
                <Icon name="star" size={15} fill={card.pinned ? "currentColor" : "none"} />
              </button>
              <button className="mini-btn" title="More" onClick={() => setMenuOpen(menuOpen === card.id ? null : card.id)}>
                <Icon name="more" size={16} />
              </button>
            </div>
          )}
          {isAdmin && menuOpen === card.id && (
            <div className="menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onOpen(card); setMenuOpen(null); }}><Icon name="external" size={15} /> Open</button>
              <button onClick={() => { onEdit(card); setMenuOpen(null); }}><Icon name="edit" size={15} /> Edit</button>
              <button onClick={() => { onPin(card.id); setMenuOpen(null); }}><Icon name="star" size={15} /> {card.pinned ? "Unpin" : "Pin"}</button>
              <div className="sep" />
              <button className="del" onClick={() => { onDelete(card.id); setMenuOpen(null); }}><Icon name="trash" size={15} /> Remove</button>
            </div>
          )}
        </div>

        <div className="tool-title">{card.title}</div>
        <div className="tool-desc">{card.desc}</div>

        <div className="tool-foot">
          <span className="tool-meta">
            {card.tag && <span className="tag">{card.tag}</span>}
            {card.meta && card.meta !== "—" && <span>{card.meta}</span>}
          </span>
          {card.url
            ? <Icon name="external" size={15} className="tool-go" />
            : <Icon name="arrowRight" size={16} className="tool-go" />}
        </div>
      </div>
    );
  }

  function AddTile({ onClick }) {
    return (
      <button className="add-tile" onClick={onClick}>
        <span className="plus"><Icon name="plus" size={18} sw={1.8} /></span>
        <span>Add tool</span>
      </button>
    );
  }

  /* ---------------- Add / Edit modal ---------------- */
  function CardModal({ mode, card, sections, defaultSection, onSave, onClose }) {
    const [title, setTitle] = useState(card ? card.title : "");
    const [desc, setDesc] = useState(card ? card.desc : "");
    const [section, setSection] = useState(card ? card.section : (defaultSection || sections[0].id));
    const [icon, setIcon] = useState(card ? card.icon : window.PICKER_ICONS[0]);
    const [meta, setMeta] = useState(card ? card.meta : "");
    const [tag, setTag] = useState(card ? card.tag : "");
    const [url, setUrl] = useState(card ? (card.url || "") : "");
    const [err, setErr] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const submit = () => {
      if (!title.trim()) { setErr(true); return; }
      onSave({
        id: card ? card.id : "c-" + Date.now(),
        section, icon,
        title: title.trim(),
        desc: desc.trim() || "Custom tool.",
        meta: meta.trim(), tag: tag.trim(),
        url: url.trim(),
        pinned: card ? card.pinned : false,
      });
    };

    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>{mode === "edit" ? "Edit tool" : "Add a tool"}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Name <span className="req">*</span></label>
              <input ref={inputRef} className={"input" + (err ? " err" : "")} value={title}
                onChange={(e) => { setTitle(e.target.value); if (err) setErr(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="e.g. Welfare Requests" />
              {err && <span className="errmsg">A name is required.</span>}
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)}
                placeholder="One short line describing what this tool does." />
            </div>
            <div className="row2">
              <div className="field">
                <label>Category</label>
                <select className="select" value={section} onChange={(e) => setSection(e.target.value)}>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Meta / count <span style={{ color: "var(--text-3)", fontWeight: 500 }}>(optional)</span></label>
                <input className="input" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="e.g. 24 active" />
              </div>
            </div>
            <div className="field">
              <label>Link URL <span style={{ color: "var(--text-3)", fontWeight: 500 }}>(optional)</span></label>
              <input className="input" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…" />
              <span className="hint">Clicking the card will open this link in a new tab.</span>
            </div>
            <div className="field">
              <label>Icon</label>
              <div className="icon-picker">
                {window.PICKER_ICONS.map((ic) => (
                  <button key={ic} className={"icon-opt" + (icon === ic ? " sel" : "")} onClick={() => setIcon(ic)} aria-label={ic}>
                    <Icon name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit}>
              <Icon name="check" size={16} sw={2} /> {mode === "edit" ? "Save changes" : "Add tool"}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Detail drawer ---------------- */
  function Drawer({ card, sectionLabel, onClose, onEdit, onDelete, onPin, onLaunch, isAdmin }) {
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);
    if (!card) return null;
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <aside className="drawer" role="dialog" aria-modal="true">
          <div className="drawer-head">
            <div className="drawer-ic"><Icon name={card.icon} size={24} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="d-cat">{sectionLabel}</div>
              <h3>{card.title}</h3>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="drawer-body">
            <p className="d-desc">{card.desc}</p>
            <div className="meta-grid">
              <div className="meta-cell">
                <div className="m-k">Status</div>
                <div className="m-v">{card.meta && card.meta !== "—" ? card.meta : "Ready"}</div>
              </div>
              <div className="meta-cell">
                <div className="m-k">Type</div>
                <div className="m-v">{card.tag === "AI" ? "Assistant" : "Tool"}</div>
              </div>
            </div>
            {isAdmin && (
              <div>
                <div className="m-k" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Quick actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="nav-item" style={{ border: "1px solid var(--border)" }} onClick={() => onPin(card.id)}>
                    <Icon name="star" size={17} className="ic" /><span className="lbl">{card.pinned ? "Unpin" : "Pin"}</span>
                  </button>
                  <button className="nav-item" style={{ border: "1px solid var(--border)" }} onClick={() => onEdit(card)}>
                    <Icon name="edit" size={17} className="ic" /><span className="lbl">Edit details</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="drawer-foot">
            {isAdmin && <button className="btn danger" onClick={() => onDelete(card.id)}><Icon name="trash" size={16} /></button>}
            <button className="btn primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => onLaunch(card)}>
              <Icon name="external" size={16} /> Open tool
            </button>
          </div>
        </aside>
      </>
    );
  }

  /* ---------------- Toast ---------------- */
  function Toast({ msg }) {
    if (!msg) return null;
    return (
      <div className="toast-wrap">
        <div className="toast"><Icon name="check" size={16} sw={2.2} className="t-ic" />{msg}</div>
      </div>
    );
  }

  /* ---- Password field ---- */
  function PwField({ label, value, onChange, placeholder, err, autoFocus }) {
    const [show, setShow] = useState(false);
    return (
      <div className="field">
        <label>{label}</label>
        <div className="pw-wrap">
          <input className={"input" + (err ? " err" : "")} type={show ? "text" : "password"}
            value={value} onChange={onChange} placeholder={placeholder || ""} autoFocus={autoFocus} autoComplete="off" />
          <button type="button" className="pw-eye" onClick={() => setShow((s) => !s)} tabIndex={-1}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {err && <span className="errmsg">{err}</span>}
      </div>
    );
  }

  /* ---------------- Login modal ---------------- */
  function LoginModal({ bootstrapped, onLogin, onRegister, onCreateFirst, onForgot }) {
    // view: "login" | "register" | "registered" | "first-run"
    const [view, setView]         = useState(bootstrapped === false ? "first-run" : "login");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loginErr, setLoginErr] = useState("");
    const [loginMsg, setLoginMsg] = useState("");
    const [loading, setLoading]   = useState(false);
    const blank = { fullName: "", email: "", phone: "", mrn: "", calling: "", unit: "", password: "", confirm: "" };
    const [form, setForm] = useState(blank);
    const [err, setErr]   = useState({});
    const [topErr, setTopErr] = useState("");

    const setF = (k) => (e) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (err[k]) setErr((er) => { const n = { ...er }; delete n[k]; return n; });
      if (topErr) setTopErr("");
    };

    const Brand = () => (
      <div className="login-brand">
        <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>
          <Icon name="church" size={22} sw={1.5} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em" }}>Tubod Stake</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Administration Portal</div>
        </div>
      </div>
    );

    const profileOf = () => ({
      fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(),
      mrn: form.mrn.trim(), calling: form.calling.trim(), unit: form.unit.trim(),
    });

    const validate = () => {
      const e = {};
      if (!form.fullName.trim()) e.fullName = "Full name is required.";
      if (!form.email.trim())    e.email    = "Email is required.";
      if (!form.password)        e.password = "Password is required.";
      else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
      if (form.password && form.password !== form.confirm) e.confirm = "Passwords do not match.";
      return e;
    };

    /* --- Sign in --- */
    const handleLogin = async () => {
      setLoginErr(""); setLoginMsg("");
      if (!email.trim() || !password) { setLoginErr("Email and password are required."); return; }
      setLoading(true);
      try {
        const error = await onLogin(email, password);
        if (error) setLoginErr(error);
      } finally { setLoading(false); }
    };

    /* --- Forgot password --- */
    const handleForgot = async () => {
      setLoginErr(""); setLoginMsg("");
      if (!email.trim()) { setLoginErr("Enter your email above, then click Forgot password."); return; }
      setLoading(true);
      try {
        const error = await onForgot(email);
        if (error) setLoginErr(error);
        else setLoginMsg("Password reset email sent to " + email.trim() + ".");
      } finally { setLoading(false); }
    };

    /* --- Self-registration (pending approval) --- */
    const submitRegister = async () => {
      const e = validate();
      if (Object.keys(e).length) { setErr(e); return; }
      setLoading(true);
      try {
        const error = await onRegister(profileOf(), form.password);
        if (error) { setTopErr(error); return; }
        setView("registered");
      } finally { setLoading(false); }
    };

    /* --- First-run setup (first account is always Admin) --- */
    const submitFirst = async () => {
      const e = validate();
      if (Object.keys(e).length) { setErr(e); return; }
      setLoading(true);
      try {
        const error = await onCreateFirst(profileOf(), form.password);
        if (error) { setTopErr(error); setLoading(false); }
        // on success the auth listener signs the new admin in
      } catch { setLoading(false); }
    };

    /* ---- Registered success screen ---- */
    if (view === "registered") {
      return (
        <div className="login-screen">
          <div className="login-card">
            <Brand />
            <div className="reg-success">
              <div className="reg-success-icon"><Icon name="check" size={28} sw={2.2} /></div>
              <h2 className="login-title" style={{ marginTop: 12 }}>Request submitted!</h2>
              <p className="login-sub">Your account is awaiting approval from an administrator. You will be able to sign in once it is confirmed.</p>
            </div>
            <button className="btn ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={() => { setView("login"); setForm(blank); setErr({}); setTopErr(""); }}>
              Back to Sign In
            </button>
          </div>
        </div>
      );
    }

    /* ---- Register form ---- */
    if (view === "register") {
      return (
        <div className="login-screen">
          <div className="login-card" style={{ width: "min(520px, 100%)" }}>
            <Brand />
            <h2 className="login-title">Create account</h2>
            <p className="login-sub">Submit your details. An admin will review and approve your account.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
              <div className="row2">
                <div className="field">
                  <label>Full Name <span className="req">*</span></label>
                  <input className={"input" + (err.fullName ? " err" : "")} value={form.fullName} onChange={setF("fullName")}
                    placeholder="e.g. Juan dela Cruz" autoFocus />
                  {err.fullName && <span className="errmsg">{err.fullName}</span>}
                </div>
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input className={"input" + (err.email ? " err" : "")} type="email" value={form.email} onChange={setF("email")}
                    placeholder="email@example.com" />
                  {err.email && <span className="errmsg">{err.email}</span>}
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Phone</label>
                  <input className="input" value={form.phone} onChange={setF("phone")} placeholder="+63 912 000 0000" />
                </div>
                <div className="field">
                  <label>MRN</label>
                  <input className="input" value={form.mrn} onChange={setF("mrn")} placeholder="Member Record No." />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Calling</label>
                  <input className="input" value={form.calling} onChange={setF("calling")} placeholder="e.g. Ward Clerk" />
                </div>
                <div className="field">
                  <label>Unit</label>
                  <input className="input" value={form.unit} onChange={setF("unit")} placeholder="e.g. Tubod Ward" />
                </div>
              </div>
              <div className="row2">
                <PwField label={<>Password <span className="req">*</span></>}
                  value={form.password} onChange={setF("password")} err={err.password} />
                <PwField label={<>Confirm Password <span className="req">*</span></>}
                  value={form.confirm} onChange={setF("confirm")} placeholder="Re-enter password" err={err.confirm} />
              </div>
              {topErr && <span className="errmsg">{topErr}</span>}
              <button className="btn primary" style={{ height: 40, justifyContent: "center", marginTop: 2 }}
                onClick={submitRegister} disabled={loading}>
                <Icon name="check" size={16} sw={2} /> {loading ? "Submitting…" : "Submit Request"}
              </button>
              <button className="btn ghost" style={{ justifyContent: "center" }}
                onClick={() => { setView("login"); setForm(blank); setErr({}); setTopErr(""); }}>
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    /* ---- First-run setup ---- */
    if (view === "first-run") {
      return (
        <div className="login-screen">
          <div className="login-card" style={{ width: "min(500px, 100%)" }}>
            <Brand />
            <h2 className="login-title">Create your account</h2>
            <p className="login-sub">No accounts exist yet. This first account will be the portal <strong>Administrator</strong>.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
              <div className="row2">
                <div className="field">
                  <label>Full Name <span className="req">*</span></label>
                  <input className={"input" + (err.fullName ? " err" : "")} value={form.fullName} onChange={setF("fullName")}
                    placeholder="e.g. Juan dela Cruz" autoFocus />
                  {err.fullName && <span className="errmsg">{err.fullName}</span>}
                </div>
                <div className="field">
                  <label>Role</label>
                  <input className="input" value="Admin" disabled style={{ opacity: .7 }} />
                  <span className="hint">The first account is always the administrator.</span>
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input className={"input" + (err.email ? " err" : "")} type="email" value={form.email} onChange={setF("email")}
                    placeholder="email@example.com" />
                  {err.email && <span className="errmsg">{err.email}</span>}
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="input" value={form.phone} onChange={setF("phone")} placeholder="+63 912 000 0000" />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Calling</label>
                  <input className="input" value={form.calling} onChange={setF("calling")} placeholder="e.g. Stake Clerk" />
                </div>
                <div className="field">
                  <label>Unit</label>
                  <input className="input" value={form.unit} onChange={setF("unit")} placeholder="e.g. Tubod Stake" />
                </div>
              </div>
              <div className="field">
                <label>MRN</label>
                <input className="input" value={form.mrn} onChange={setF("mrn")} placeholder="Member Record No." />
              </div>
              <div className="row2">
                <PwField label={<>Password <span className="req">*</span></>}
                  value={form.password} onChange={setF("password")} err={err.password} />
                <PwField label={<>Confirm Password <span className="req">*</span></>}
                  value={form.confirm} onChange={setF("confirm")} placeholder="Re-enter password" err={err.confirm} />
              </div>
              {topErr && <span className="errmsg">{topErr}</span>}
              <button className="btn primary" style={{ height: 40, justifyContent: "center", marginTop: 4 }}
                onClick={submitFirst} disabled={loading}>
                <Icon name="check" size={16} sw={2} /> {loading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    /* ---- Sign in ---- */
    return (
      <div className="login-screen">
        <div className="login-card">
          <Brand />
          <h2 className="login-title">Sign in</h2>
          <p className="login-sub">Enter your email and password to continue.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginErr(""); setLoginMsg(""); }}
                placeholder="email@example.com" autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <PwField label="Password" value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginErr(""); setLoginMsg(""); }} />
            {loginErr && <span className="errmsg" style={{ marginTop: -6 }}>{loginErr}</span>}
            {loginMsg && <span className="hint" style={{ marginTop: -6, color: "var(--good)", fontWeight: 600 }}>{loginMsg}</span>}
            <button className="btn primary" style={{ height: 40, justifyContent: "center", marginTop: 2 }}
              onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button className="btn ghost" style={{ justifyContent: "center", height: 30, fontSize: 12.5 }}
              onClick={handleForgot} disabled={loading}>
              Forgot password?
            </button>
            <div className="login-divider" />
            <button className="btn ghost" style={{ justifyContent: "center" }}
              onClick={() => { setView("register"); setForm(blank); setErr({}); setTopErr(""); }}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- LCR prompt (popup after sign-in) ---------------- */
  function LcrPrompt({ lcrUrl, onClose }) {
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);
    const openLcr = () => {
      window.open(lcrUrl || "https://lcr.churchofjesuschrist.org", "_blank", "noopener,noreferrer");
      onClose();
    };
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" style={{ width: "min(430px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <button className="icon-btn lcr-modal-x" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          <div className="modal-body" style={{ paddingTop: 28, paddingBottom: 24 }}>
            <div className="lcr-gate">
              <div className="lcr-lock"><Icon name="lock" size={26} sw={1.7} /></div>
              <h2 className="login-title" style={{ fontSize: 19 }}>Leaders &amp; Clerks Resources login required</h2>
              <p className="login-sub" style={{ marginBottom: 0 }}>
                To fully access the portal resources, please log in to the Church's
                Leaders and Clerks Resources (LCR) system first.
              </p>
            </div>
            <button className="btn primary" style={{ width: "100%", height: 42, justifyContent: "center", marginTop: 20 }}
              onClick={openLcr}>
              <Icon name="external" size={16} /> Log in to LCR / Church Resources
            </button>
            <button className="btn ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={onClose}>
              Continue to portal
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Role badge ---------------- */
  function RoleBadge({ role }) {
    if (!role) return <span className="ms-role-badge">—</span>;
    return <span className={"ms-role-badge " + role.toLowerCase()}>{role}</span>;
  }

  /* ---------------- Delete confirm ---------------- */
  function DeleteConfirm({ name, onConfirm, onCancel }) {
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onCancel(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);
    return (
      <>
        <div className="scrim" onClick={onCancel} />
        <div className="modal" style={{ width: "min(400px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>Remove account?</h3>
            <button className="icon-btn" onClick={onCancel} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              This will permanently remove <strong style={{ color: "var(--text)" }}>{name || "this account"}</strong> from the portal. This cannot be undone.
            </p>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
            <button className="btn" style={{ background: "#c0392b", borderColor: "#c0392b", color: "#fff" }} onClick={onConfirm}>
              Remove account
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Account modal ---------------- */
  function AccountModal({ mode, account, roles, accounts, onSave, onCreate, onResetPw, onClose }) {
    const roleOptions = ["Admin", ...((roles || []).map((r) => r.name))];
    const [form, setForm] = useState({
      role:     account?.role     || "",
      fullName: account?.fullName || "",
      email:    account?.email    || "",
      phone:    account?.phone    || "",
      mrn:      account?.mrn      || "",
      calling:  account?.calling  || "",
      unit:     account?.unit     || "",
      password: "",
      confirm:  "",
    });
    const [err, setErr]       = useState({});
    const [saving, setSaving] = useState(false);
    const [pwSent, setPwSent] = useState(false);

    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const set = (k) => (e) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (err[k]) setErr((er) => { const n = { ...er }; delete n[k]; return n; });
    };

    const submit = async () => {
      const e = {};
      if (!form.fullName.trim()) e.fullName = "Full name is required.";
      if (!form.email.trim())    e.email    = "Email is required.";
      if (!form.role)            e.role     = "Role is required.";
      if (mode === "add") {
        if (!form.password)                  e.password = "Password is required.";
        else if (form.password.length < 6)   e.password = "Password must be at least 6 characters.";
        if (form.password && form.password !== form.confirm) e.confirm = "Passwords do not match.";
        if ((accounts || []).some((a) =>
          (a.email || "").toLowerCase() === form.email.trim().toLowerCase()))
          e.email = "An account with this email already exists.";
      }
      if (Object.keys(e).length) { setErr(e); return; }
      setSaving(true);
      try {
        const data = {
          role:     form.role,
          fullName: form.fullName.trim(),
          email:    form.email.trim(),
          phone:    form.phone.trim(),
          mrn:      form.mrn.trim(),
          calling:  form.calling.trim(),
          unit:     form.unit.trim(),
        };
        if (mode === "add") {
          const error = await onCreate(data, form.password);
          if (error) { setErr({ email: error }); return; }
          onClose();
        } else {
          onSave({ id: account.id, ...data, status: account?.status || "active" });
        }
      } finally { setSaving(false); }
    };

    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" style={{ width: "min(600px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>{mode === "edit" ? "Edit Account" : "Create Account"}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="row2">
              <div className="field">
                <label>Full Name <span className="req">*</span></label>
                <input className={"input" + (err.fullName ? " err" : "")} value={form.fullName}
                  onChange={set("fullName")} placeholder="e.g. Juan dela Cruz" autoFocus />
                {err.fullName && <span className="errmsg">{err.fullName}</span>}
              </div>
              <div className="field">
                <label>Role <span className="req">*</span></label>
                <select className={"select" + (err.role ? " err" : "")} value={form.role} onChange={set("role")}>
                  <option value="">Select a role…</option>
                  {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {err.role && <span className="errmsg">{err.role}</span>}
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>Email <span className="req">*</span></label>
                <input className={"input" + (err.email ? " err" : "")} type="email" value={form.email}
                  onChange={set("email")} placeholder="email@example.com"
                  disabled={mode === "edit"} style={mode === "edit" ? { opacity: .65 } : null} />
                {mode === "edit" && <span className="hint">The sign-in email can't be changed here.</span>}
                {err.email && <span className="errmsg">{err.email}</span>}
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" value={form.phone} onChange={set("phone")} placeholder="+63 912 000 0000" />
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>MRN <span style={{ color: "var(--text-3)", fontWeight: 500 }}>(Member Record No.)</span></label>
                <input className="input" value={form.mrn} onChange={set("mrn")} placeholder="e.g. 0001234" />
              </div>
              <div className="field">
                <label>Calling</label>
                <input className="input" value={form.calling} onChange={set("calling")} placeholder="e.g. Ward Clerk" />
              </div>
            </div>
            <div className="field">
              <label>Unit</label>
              <input className="input" value={form.unit} onChange={set("unit")} placeholder="e.g. Tubod Ward" />
            </div>
            {mode === "add" ? (
              <>
                <div className="pw-section-divider">
                  <span>Set password <span className="req">*</span></span>
                </div>
                <div className="row2">
                  <PwField label={<>Password <span className="req">*</span></>}
                    value={form.password} onChange={set("password")} err={err.password} />
                  <PwField label={<>Confirm Password <span className="req">*</span></>}
                    value={form.confirm} onChange={set("confirm")}
                    placeholder="Re-enter password" err={err.confirm} />
                </div>
              </>
            ) : (
              <>
                <div className="pw-section-divider"><span>Password</span></div>
                <div className="field">
                  <span className="hint">Passwords are managed by each user. Send them an email link to set a new one.</span>
                  <button className="btn" style={{ alignSelf: "flex-start", marginTop: 4 }} disabled={pwSent}
                    onClick={async () => { const e2 = await onResetPw(form.email); if (!e2) setPwSent(true); }}>
                    <Icon name="mail" size={15} /> {pwSent ? "Reset email sent ✓" : "Send password reset email"}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit} disabled={saving}>
              <Icon name="check" size={16} sw={2} /> {saving ? "Saving…" : (mode === "edit" ? "Save changes" : "Create account")}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Approve modal ---------------- */
  function ApproveModal({ account, roles, onApprove, onClose }) {
    const roleOptions = ["Admin", ...((roles || []).map((r) => r.name))];
    const [role, setRole]       = useState("");
    const [calling, setCalling] = useState(account.calling || "");
    const [unit, setUnit]       = useState(account.unit || "");
    const [roleErr, setRoleErr] = useState("");

    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const submit = () => {
      if (!role) { setRoleErr("Role is required."); return; }
      onApprove(account.id, { role, calling: calling.trim(), unit: unit.trim() });
    };

    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" style={{ width: "min(460px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>Approve account</h3>
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="approve-who">
              <span className="avatar" style={{ width: 38, height: 38, fontSize: 13, flex: "none" }}>
                {(account.fullName || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{account.fullName}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{account.email}</div>
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Assign Role <span className="req">*</span></label>
              <select className={"select" + (roleErr ? " err" : "")} value={role}
                onChange={(e) => { setRole(e.target.value); setRoleErr(""); }}>
                <option value="">Select a role…</option>
                {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {roleErr && <span className="errmsg">{roleErr}</span>}
            </div>
            <div className="row2" style={{ marginTop: 0 }}>
              <div className="field">
                <label>Calling</label>
                <input className="input" value={calling} onChange={(e) => setCalling(e.target.value)}
                  placeholder="e.g. Ward Clerk" />
              </div>
              <div className="field">
                <label>Unit</label>
                <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Tubod Ward" />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit}>
              <Icon name="check" size={16} sw={2} /> Approve &amp; activate
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Manage Systems page ---------------- */
  function ManageSystems({ accounts, roles, onSave, onCreate, onDelete, onApprove, onResetPw, onBack }) {
    const [modal, setModal]         = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [approving, setApproving] = useState(null);
    const [query, setQuery]         = useState("");
    const [filter, setFilter]       = useState("all"); // "all"|"active"|"pending"

    const pending = accounts.filter((a) => (a.status || "active") === "pending");
    const active  = accounts.filter((a) => (a.status || "active") === "active");

    const q = query.trim().toLowerCase();
    const pool = filter === "pending" ? pending : filter === "active" ? active : accounts;
    const filtered = !q ? pool : pool.filter((a) =>
      (a.fullName || "").toLowerCase().includes(q) ||
      (a.email    || "").toLowerCase().includes(q) ||
      (a.role     || "").toLowerCase().includes(q) ||
      (a.unit     || "").toLowerCase().includes(q) ||
      (a.calling  || "").toLowerCase().includes(q)
    );

    return (
      <>
        <div className="ms-breadcrumb">
          <button className="btn ghost btn sm" onClick={onBack} style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}>
            <span style={{ display: "inline-block", transform: "rotate(180deg)", lineHeight: 0 }}><Icon name="arrowRight" size={13} sw={2} /></span>
            Admin
          </button>
          <span className="ms-breadcrumb-sep">/</span>
          <span className="ms-breadcrumb-cur">User Management</span>
        </div>

        <div className="page-head">
          <div className="h-left">
            <div className="eyebrow">Admin · User Management</div>
            <h1 className="page-title">User Management</h1>
            <p className="page-sub">Create and manage portal accounts, roles, and access levels.</p>
          </div>
          <button className="btn primary" onClick={() => setModal({ mode: "add", account: null })}>
            <Icon name="plus" size={16} sw={2} /> Create Account
          </button>
        </div>

        {pending.length > 0 && (
          <div className="pending-banner">
            <Icon name="bell" size={16} sw={2} />
            <span><strong>{pending.length}</strong> account{pending.length !== 1 ? "s" : ""} awaiting approval</span>
            <button className="btn ghost" style={{ height: 28, padding: "0 10px", fontSize: "12px", marginLeft: "auto" }}
              onClick={() => setFilter("pending")}>
              Review
            </button>
          </div>
        )}

        <div className="ms-toolbar">
          <div className="ms-search-wrap">
            <Icon name="search" size={15} className="ms-search-ic" />
            <input className="ms-search-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, unit, calling…" />
          </div>
          <div className="filter-tabs">
            {[["all","All",accounts.length],["active","Active",active.length],["pending","Pending",pending.length]].map(([f,lbl,ct]) => (
              <button key={f} className={"filter-tab" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>
                {lbl} <span className="filter-tab-ct">{ct}</span>
              </button>
            ))}
          </div>
          <span className="ms-count">{filtered.length} account{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty" style={{ border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)" }}>
            <Icon name="users" size={26} className="e-ic" />
            <p>{accounts.length === 0 ? "No accounts yet." : "No accounts match."}</p>
          </div>
        ) : (
          <div className="ms-table-wrap">
            <table className="ms-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Status / Role</th>
                  <th>Email</th>
                  <th>Calling</th>
                  <th>Unit</th>
                  <th style={{ width: 88 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const isPending = (a.status || "active") === "pending";
                  return (
                    <tr key={a.id} className={isPending ? "ms-row-pending" : ""}>
                      <td className="ms-name" data-label="Full Name">{a.fullName || "—"}</td>
                      <td data-label="Status / Role">{isPending
                        ? <span className="ms-role-badge pending-badge">Pending</span>
                        : <RoleBadge role={a.role} />}
                      </td>
                      <td className="ms-mono" data-label="Email">{a.email || "—"}</td>
                      <td data-label="Calling">{a.calling || "—"}</td>
                      <td data-label="Unit">{a.unit || "—"}</td>
                      <td className="ms-actions-cell">
                        <div className="ms-row-actions">
                          {isPending ? (
                            <>
                              <button className="mini-btn approve-btn" title="Approve" onClick={() => setApproving(a)}>
                                <Icon name="check" size={14} sw={2.2} />
                              </button>
                              <button className="mini-btn" title="Reject" onClick={() => setConfirmId(a.id)}>
                                <Icon name="trash" size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="mini-btn" title="Edit" onClick={() => setModal({ mode: "edit", account: a })}>
                                <Icon name="edit" size={14} />
                              </button>
                              <button className="mini-btn" title="Remove" onClick={() => setConfirmId(a.id)}>
                                <Icon name="trash" size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <AccountModal mode={modal.mode} account={modal.account} roles={roles} accounts={accounts}
            onSave={(acc) => { onSave(acc); setModal(null); }}
            onCreate={onCreate} onResetPw={onResetPw}
            onClose={() => setModal(null)} />
        )}
        {approving && (
          <ApproveModal account={approving} roles={roles}
            onApprove={(id, data) => { onApprove(id, data); setApproving(null); }}
            onClose={() => setApproving(null)} />
        )}
        {confirmId && (
          <DeleteConfirm
            name={(accounts.find((a) => a.id === confirmId) || {}).fullName}
            onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
            onCancel={() => setConfirmId(null)} />
        )}
      </>
    );
  }

  /* ---------------- Role modal ---------------- */
  function RoleModal({ mode, role, sections, onSave, onClose }) {
    const [name, setName] = useState(role ? role.name : "");
    const [tabs, setTabs] = useState(role ? role.tabs : sections.filter((s) => s.id !== "admin").map((s) => s.id));
    const [canEditOrgChart, setCanEditOrgChart] = useState(!!(role?.canEditOrgChart));
    const [canSeeAdmin,     setCanSeeAdmin]     = useState(!!(role?.canSeeAdmin));
    const [nameErr, setNameErr] = useState("");

    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const toggleTab = (id) =>
      setTabs((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

    const submit = () => {
      if (!name.trim()) { setNameErr("Role name is required."); return; }
      onSave({
        id: role ? role.id : "role-" + Date.now(),
        name: name.trim(),
        tabs,
        canEditOrgChart,
        canSeeAdmin,
      }, mode === "edit");
    };

    const tabSections = sections.filter((s) => s.id !== "admin");

    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>{mode === "edit" ? "Edit Role" : "Add Role"}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Role Name <span className="req">*</span></label>
              <input className={"input" + (nameErr ? " err" : "")} value={name} autoFocus
                onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                placeholder="e.g. Ward Clerk" />
              {nameErr && <span className="errmsg">{nameErr}</span>}
            </div>
            <div className="field">
              <label>Tab Access</label>
              <span className="hint">Choose which tabs this role can see in the portal.</span>
              <div className="rp-tab-checks">
                {tabSections.map((s) => (
                  <label key={s.id} className="rp-check-item">
                    <input type="checkbox" checked={tabs.includes(s.id)} onChange={() => toggleTab(s.id)} />
                    <Icon name={s.icon} size={15} />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Special Permissions</label>
              <span className="hint">Additional capabilities beyond tab visibility.</span>
              <div className="rp-tab-checks">
                <label className="rp-check-item">
                  <input type="checkbox" checked={canSeeAdmin} onChange={(e) => setCanSeeAdmin(e.target.checked)} />
                  <Icon name="shield" size={15} />
                  <span>See Admin tab</span>
                </label>
                <label className="rp-check-item">
                  <input type="checkbox" checked={canEditOrgChart} onChange={(e) => setCanEditOrgChart(e.target.checked)} />
                  <Icon name="sitemap" size={15} />
                  <span>Edit Org Chart (Calling Management)</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit}>
              <Icon name="check" size={16} sw={2} /> {mode === "edit" ? "Save changes" : "Add role"}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Roles & Permissions page ---------------- */
  function RolesPermissions({ roles, sections, onSave, onDelete, onBack, isAdmin }) {
    const [modal, setModal] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const tabSections = sections.filter((s) => s.id !== "admin");

    return (
      <>
        <div className="ms-breadcrumb">
          <button className="btn ghost btn sm" onClick={onBack} style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}>
            <span style={{ display: "inline-block", transform: "rotate(180deg)", lineHeight: 0 }}><Icon name="arrowRight" size={13} sw={2} /></span>
            Admin
          </button>
          <span className="ms-breadcrumb-sep">/</span>
          <span className="ms-breadcrumb-cur">Roles & Permissions</span>
        </div>

        <div className="page-head">
          <div className="h-left">
            <div className="eyebrow">Admin · Roles & Permissions</div>
            <h1 className="page-title">Roles & Permissions</h1>
            <p className="page-sub">Define roles and control which tabs and actions each role can access.</p>
          </div>
          {isAdmin && (
            <button className="btn primary" onClick={() => setModal({ mode: "add", role: null })}>
              <Icon name="plus" size={16} sw={2} /> Add Role
            </button>
          )}
        </div>

        {roles.length === 0 ? (
          <div className="empty" style={{ border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)" }}>
            <Icon name="shield" size={26} className="e-ic" />
            <p>No roles yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="rp-list">
            {roles.map((role) => (
              <div className="rp-row" key={role.id}>
                <div className="rp-name">{role.name}</div>
                <div className="rp-tabs">
                  {tabSections.map((s) => (
                    <span key={s.id} className={"rp-tab-badge " + (role.tabs.includes(s.id) ? "on" : "off")}>
                      {s.label}
                    </span>
                  ))}
                  {role.canSeeAdmin && (
                    <span className="rp-tab-badge on rp-perm-badge">
                      <Icon name="shield" size={10} sw={2} /> Admin tab
                    </span>
                  )}
                  {role.canEditOrgChart && (
                    <span className="rp-tab-badge on rp-perm-badge">
                      <Icon name="sitemap" size={10} sw={2} /> Edit Org Chart
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="rp-actions">
                    <button className="mini-btn" title="Edit" onClick={() => setModal({ mode: "edit", role })}>
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="mini-btn" title="Remove" onClick={() => setConfirmId(role.id)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {modal && (
          <RoleModal mode={modal.mode} role={modal.role} sections={sections}
            onSave={(r, isEdit) => { onSave(r, isEdit); setModal(null); }}
            onClose={() => setModal(null)} />
        )}
        {confirmId && (
          <DeleteConfirm
            name={(roles.find((r) => r.id === confirmId) || {}).name}
            onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
            onCancel={() => setConfirmId(null)} />
        )}
      </>
    );
  }

  /* ---------------- Calling status badge ---------------- */
  function CallingStatusBadge({ status }) {
    const cls = status === "Active" ? "active" : status === "Vacant" ? "vacant" : "pending";
    return <span className={"cal-status " + cls}>{status}</span>;
  }

  /* ---------------- Member picker (users + free-type) ---------------- */
  function MemberPicker({ value, userId, accounts, onChangeName, onChangeUser }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const suggestions = (accounts || []).filter((a) =>
      value.trim().length === 0 || a.fullName.toLowerCase().includes(value.toLowerCase())
    );

    useEffect(() => {
      const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    return (
      <div ref={wrapRef} style={{ position: "relative" }}>
        <input
          className="input"
          value={value}
          onChange={(e) => { onChangeName(e.target.value); onChangeUser(""); }}
          onFocus={() => setOpen(true)}
          placeholder="Search portal users or type a name…"
          autoComplete="off"
        />
        {userId && (
          <span className="mp-indicator">
            <Icon name="check" size={11} sw={2.5} /> Portal user
          </span>
        )}
        {open && suggestions.length > 0 && (
          <div className="mp-dropdown">
            {suggestions.slice(0, 8).map((a) => (
              <div key={a.id} className="mp-option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChangeName(a.fullName);
                  onChangeUser(a.id);
                  setOpen(false);
                }}>
                <span className="mp-avatar">{initials(a.fullName)}</span>
                <span className="mp-details">
                  <span className="mp-name">{a.fullName}</span>
                  <span className="mp-meta">{a.calling || a.role || ""}</span>
                </span>
                <span className="mp-badge">Portal</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------------- Calling modal ---------------- */
  function CallingModal({ mode, calling, accounts, onSave, onClose }) {
    const STATUSES = ["Active", "Pending Sustaining", "Vacant"];
    const [form, setForm] = useState({
      position:   calling?.position   || "",
      unit:       calling?.unit       || "",
      memberName: calling?.memberName || "",
      userId:     calling?.userId     || "",
      mrn:        calling?.mrn        || "",
      status:     calling?.status     || "Active",
      dateCalled: calling?.dateCalled || "",
      notes:      calling?.notes      || "",
    });
    const [err, setErr] = useState({});

    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const set = (k) => (e) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (err[k]) setErr((er) => { const n = { ...er }; delete n[k]; return n; });
    };

    const submit = () => {
      const e = {};
      if (!form.position.trim()) e.position = "Position is required.";
      if (!form.unit.trim())     e.unit     = "Unit is required.";
      if (Object.keys(e).length) { setErr(e); return; }
      onSave({
        id:           calling ? calling.id : "cal-" + Date.now(),
        position:     form.position.trim(),
        unit:         form.unit.trim(),
        memberName:   form.memberName.trim(),
        userId:       form.userId,
        mrn:          form.mrn.trim(),
        status:       form.status,
        dateCalled:   form.dateCalled,
        dateReleased: calling?.dateReleased || "",
        notes:        form.notes.trim(),
        assignments:  calling?.assignments || [],
      }, mode === "edit");
    };

    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" style={{ width: "min(580px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>{mode === "edit" ? "Edit Calling" : "Add Calling"}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="row2">
              <div className="field">
                <label>Position <span className="req">*</span></label>
                <input className={"input" + (err.position ? " err" : "")} value={form.position}
                  onChange={set("position")} placeholder="e.g. Relief Society President" autoFocus />
                {err.position && <span className="errmsg">{err.position}</span>}
              </div>
              <div className="field">
                <label>Unit <span className="req">*</span></label>
                <input className={"input" + (err.unit ? " err" : "")} value={form.unit}
                  onChange={set("unit")} placeholder="e.g. Tubod Ward" />
                {err.unit && <span className="errmsg">{err.unit}</span>}
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>Member Name</label>
                <MemberPicker
                  value={form.memberName}
                  userId={form.userId}
                  accounts={accounts}
                  onChangeName={(v) => setForm((f) => ({ ...f, memberName: v }))}
                  onChangeUser={(id) => setForm((f) => ({ ...f, userId: id }))}
                />
              </div>
              <div className="field">
                <label>MRN</label>
                <input className="input" value={form.mrn} onChange={set("mrn")} placeholder="Member Record No." />
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>Status</label>
                <select className="select" value={form.status} onChange={set("status")}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Date Called</label>
                <input className="input" type="date" value={form.dateCalled} onChange={set("dateCalled")} />
              </div>
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea className="input" value={form.notes} onChange={set("notes")}
                placeholder="Anything worth noting about this calling or member…" />
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={submit}>
              <Icon name="check" size={16} sw={2} /> {mode === "edit" ? "Save changes" : "Add calling"}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Release confirm ---------------- */
  function ReleaseConfirm({ name, onConfirm, onCancel }) {
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onCancel(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);
    return (
      <>
        <div className="scrim" onClick={onCancel} />
        <div className="modal" style={{ width: "min(400px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>Release calling?</h3>
            <button className="icon-btn" onClick={onCancel}><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              This will release <strong style={{ color: "var(--text)" }}>{name || "this member"}</strong> from their calling and mark the position as <strong style={{ color: "var(--text)" }}>Vacant</strong>.
            </p>
          </div>
          <div className="modal-foot">
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
            <button className="btn" style={{ background: "var(--warn)", borderColor: "var(--warn)", color: "#fff" }} onClick={onConfirm}>
              Release
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Categories ---------------- */
  function Categories({ sections, hiddenSections, onToggle, onBack }) {
    const toggleable = sections.filter((s) => s.id !== "admin");
    return (
      <>
        <div className="ms-breadcrumb">
          <button className="btn ghost" onClick={onBack}
            style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}>
            <span style={{ display: "inline-block", transform: "rotate(180deg)", lineHeight: 0 }}><Icon name="arrowRight" size={13} sw={2} /></span>
            Admin
          </button>
          <span className="ms-breadcrumb-sep">/</span>
          <span className="ms-breadcrumb-cur">Categories</span>
        </div>

        <div className="page-head">
          <div className="h-left">
            <div className="eyebrow">Admin · Categories</div>
            <h1 className="page-title">Categories</h1>
            <p className="page-sub">Control which categories are visible to portal users.</p>
          </div>
        </div>

        <div className="cat-list">
          {toggleable.map((s) => {
            const visible = !hiddenSections.includes(s.id);
            return (
              <div key={s.id} className="cat-row">
                <div className="cat-icon-wrap">
                  <Icon name={s.icon} size={20} sw={1.6} />
                </div>
                <div className="cat-info">
                  <div className="cat-name">{s.label}</div>
                  <div className="cat-desc">{s.desc}</div>
                </div>
                <button
                  className={"cat-toggle" + (visible ? " on" : "")}
                  onClick={() => onToggle(s.id)}
                  aria-label={(visible ? "Hide " : "Show ") + s.label}
                  title={visible ? "Click to hide" : "Click to show"}
                >
                  <span className="cat-knob" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="cat-note">Admin accounts always see all categories regardless of this setting.</p>
      </>
    );
  }

  /* ---------------- Portal Settings page ---------------- */
  function PortalSettings({ settings, onSave, onBack }) {
    const [lcrUrl, setLcrUrl]     = useState(settings.lcrUrl || "");
    const [showGate, setShowGate] = useState(settings.showLcrGate !== false);
    const [err, setErr]           = useState("");

    const submit = () => {
      const url = lcrUrl.trim();
      if (!url) { setErr("A link is required."); return; }
      onSave({ ...settings, lcrUrl: url, showLcrGate: showGate });
    };

    return (
      <>
        <div className="ms-breadcrumb">
          <button className="btn ghost" onClick={onBack} style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}>
            <span style={{ display: "inline-block", transform: "rotate(180deg)", lineHeight: 0 }}><Icon name="arrowRight" size={13} sw={2} /></span>
            Admin
          </button>
          <span className="ms-breadcrumb-sep">/</span>
          <span className="ms-breadcrumb-cur">Portal Settings</span>
        </div>

        <div className="page-head">
          <div className="h-left">
            <div className="eyebrow">Admin · Portal Settings</div>
            <h1 className="page-title">Portal Settings</h1>
            <p className="page-sub">Configure the LCR reminder shown to users after they sign in.</p>
          </div>
        </div>

        <div className="ps-card">
          <div className="field">
            <label>LCR / Church Resources link</label>
            <input className={"input" + (err ? " err" : "")} type="url" value={lcrUrl}
              onChange={(e) => { setLcrUrl(e.target.value); if (err) setErr(""); }}
              placeholder="https://lcr.churchofjesuschrist.org" />
            {err && <span className="errmsg">{err}</span>}
            <span className="hint">The "Log in to LCR / Church Resources" button in the popup opens this link.</span>
          </div>

          <div className="cat-row" style={{ marginTop: 4 }}>
            <div className="cat-icon-wrap"><Icon name="lock" size={18} sw={1.7} /></div>
            <div className="cat-info">
              <div className="cat-name">Show LCR reminder after sign-in</div>
              <div className="cat-desc">Pop up a reminder to log in to LCR each time a user signs in to the portal.</div>
            </div>
            <button className={"cat-toggle" + (showGate ? " on" : "")} onClick={() => setShowGate((s) => !s)}
              aria-label={showGate ? "Disable LCR reminder" : "Enable LCR reminder"}>
              <span className="cat-knob" />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn primary" onClick={submit}>
              <Icon name="check" size={16} sw={2} /> Save settings
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Org Chart ---------------- */
  const POSITION_ORDER = [
    "stake president",
    "first counselor",
    "second counselor",
    "bishop",
    "branch president",
    "executive secretary",
    "stake clerk",
    "ward clerk",
    "branch clerk",
    "assistant stake clerk",
    "clerk",
    "high councilor",
  ];
  function positionRank(pos) {
    const p = pos.toLowerCase();
    const idx = POSITION_ORDER.findIndex((k) => p.includes(k));
    return idx === -1 ? 999 : idx;
  }

  function OrgRow({ calling, onOpen }) {
    const vacant = !calling.memberName || calling.status === "Vacant";
    return (
      <button className={"org-row" + (vacant ? " vacant" : "")} onClick={() => onOpen(calling)}>
        <span className="org-pos">{calling.position}</span>
        <span className="org-member">
          {vacant ? "Vacant" : (
            <>
              {calling.memberName}
              {calling.userId && <span className="org-portal-dot" title="Portal user" />}
            </>
          )}
        </span>
      </button>
    );
  }

  /* ---------------- Calling detail popup ---------------- */
  function CallingDetail({ calling, canEdit, onEdit, onRelease, onDelete, onUpdate, onClose }) {
    const [newAssign, setNewAssign] = useState("");
    useEffect(() => {
      const h = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);
    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—";
    const vacant = !calling.memberName || calling.status === "Vacant";
    const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    const isHighCouncilor = /high counc/i.test(calling.position);
    const assignments = calling.assignments || [];
    const addAssignment = () => {
      const text = newAssign.trim();
      if (!text) return;
      onUpdate({ ...calling, assignments: [...assignments, text] });
      setNewAssign("");
    };
    const removeAssignment = (idx) => {
      onUpdate({ ...calling, assignments: assignments.filter((_, i) => i !== idx) });
    };
    return (
      <>
        <div className="scrim" onClick={onClose} />
        <div className="modal" style={{ width: "min(460px, calc(100vw - 32px))" }} role="dialog" aria-modal="true">
          <div className="modal-head">
            <h3>{calling.position}</h3>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">
            <div className="cd-member">
              <span className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {vacant ? "—" : initials(calling.memberName)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="cd-name">
                  {vacant
                    ? <span style={{ color: "var(--text-3)", fontStyle: "italic", fontWeight: 400 }}>Vacant</span>
                    : calling.memberName}
                  {!vacant && calling.userId && <span className="portal-tag" title="Portal user" style={{ marginLeft: 6 }}>P</span>}
                </div>
                <div className="cd-unit">{calling.unit}</div>
              </div>
              <span style={{ marginLeft: "auto", flex: "none" }}><CallingStatusBadge status={calling.status} /></span>
            </div>
            <div className="meta-grid">
              <div className="meta-cell">
                <div className="m-k">MRN</div>
                <div className="m-v" style={{ fontSize: 14 }}>{calling.mrn || "—"}</div>
              </div>
              <div className="meta-cell">
                <div className="m-k">Date Called</div>
                <div className="m-v" style={{ fontSize: 14 }}>{fmt(calling.dateCalled)}</div>
              </div>
              {calling.dateReleased && (
                <div className="meta-cell">
                  <div className="m-k">Date Released</div>
                  <div className="m-v" style={{ fontSize: 14 }}>{fmt(calling.dateReleased)}</div>
                </div>
              )}
            </div>

            {(calling.notes || canEdit) && (
              <div className="cd-section">
                <div className="cd-section-label">Notes</div>
                {calling.notes
                  ? <p className="cd-notes">{calling.notes}</p>
                  : <p className="cd-notes empty">No notes yet. Use Edit to add notes.</p>}
              </div>
            )}

            {isHighCouncilor && (
              <div className="cd-section">
                <div className="cd-section-label">Assignments</div>
                {assignments.length === 0 && !canEdit && (
                  <p className="cd-notes empty">No assignments.</p>
                )}
                {assignments.length > 0 && (
                  <div className="cd-assignments">
                    {assignments.map((a, i) => (
                      <span key={i} className="cd-assignment">
                        {a}
                        {canEdit && (
                          <button className="cd-assignment-x" onClick={() => removeAssignment(i)}
                            aria-label={"Remove assignment: " + a} title="Remove">
                            <Icon name="x" size={11} sw={2.4} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {canEdit && (
                  <div className="cd-assign-add">
                    <input className="input" value={newAssign}
                      onChange={(e) => setNewAssign(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addAssignment(); }}
                      placeholder="e.g. Assist in missionary work" />
                    <button className="btn sm" onClick={addAssignment}>
                      <Icon name="plus" size={14} sw={2} /> Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {canEdit && (
            <div className="modal-foot" style={{ justifyContent: "space-between" }}>
              <button className="btn danger" onClick={onDelete}>
                <Icon name="trash" size={15} /> Remove
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                {!vacant && (
                  <button className="btn" style={{ color: "var(--warn)" }} onClick={onRelease}>
                    <Icon name="logout" size={15} /> Release
                  </button>
                )}
                <button className="btn primary" onClick={onEdit}>
                  <Icon name="edit" size={15} /> Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  function OrgChart({ callings, accounts, canEdit, onSave, onDelete, onRelease }) {
    const [query, setQuery]   = useState("");
    const [detailId, setDetailId] = useState(null);
    const [modal, setModal]   = useState(null);
    const [confirmRelease, setConfirmRelease] = useState(null);
    const [confirmDelete, setConfirmDelete]   = useState(null);

    const q = query.trim().toLowerCase();
    const match = (c) => !q || c.position.toLowerCase().includes(q) || c.memberName.toLowerCase().includes(q) || c.unit.toLowerCase().includes(q);
    const visible = callings.filter(match);

    const stakeCallings = visible
      .filter((c) => /stake/i.test(c.unit))
      .sort((a, b) => (positionRank(a.position) - positionRank(b.position)) || a.position.localeCompare(b.position, undefined, { numeric: true }));

    const unitMap = {};
    visible
      .filter((c) => !/stake/i.test(c.unit))
      .forEach((c) => {
        if (!unitMap[c.unit]) unitMap[c.unit] = [];
        unitMap[c.unit].push(c);
      });
    const units = Object.keys(unitMap).sort();
    units.forEach((u) => unitMap[u].sort((a, b) => (positionRank(a.position) - positionRank(b.position)) || a.position.localeCompare(b.position, undefined, { numeric: true })));

    const counts = {
      active:  callings.filter((c) => c.status === "Active").length,
      vacant:  callings.filter((c) => c.status === "Vacant").length,
      pending: callings.filter((c) => c.status === "Pending Sustaining").length,
    };

    // resolve from live data so the popup reflects edits immediately
    const detail = detailId ? callings.find((c) => c.id === detailId) : null;
    const openRow = (c) => setDetailId(c.id);

    const isEmpty = callings.length === 0;
    const noMatches = !isEmpty && visible.length === 0;

    return (
      <>
        <div className="page-head">
          <div className="h-left">
            <div className="eyebrow">Org Chart</div>
            <h1 className="page-title">Organization Chart</h1>
            <p className="page-sub">Stake and unit leadership at a glance. Click any position for details.</p>
          </div>
          {canEdit && (
            <button className="btn primary" onClick={() => setModal({ mode: "add", calling: null })}>
              <Icon name="plus" size={16} sw={2} /> Add Calling
            </button>
          )}
        </div>

        <div className="cal-stats">
          <div className="cal-stat"><span className="cal-stat-val">{counts.active}</span><span className="cal-stat-lbl">Active</span></div>
          <div className="cal-stat vacant"><span className="cal-stat-val">{counts.vacant}</span><span className="cal-stat-lbl">Vacant</span></div>
          <div className="cal-stat pending"><span className="cal-stat-val">{counts.pending}</span><span className="cal-stat-lbl">Pending Sustaining</span></div>
          <div className="cal-stat"><span className="cal-stat-val">{callings.length}</span><span className="cal-stat-lbl">Total</span></div>
        </div>

        <div className="ms-toolbar">
          <div className="ms-search-wrap">
            <Icon name="search" size={15} className="ms-search-ic" />
            <input className="ms-search-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search position, member, or unit…" />
          </div>
        </div>

        {isEmpty ? (
          <div className="empty" style={{ border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)" }}>
            <Icon name="sitemap" size={26} className="e-ic" />
            <p>No callings have been added yet.</p>
            {canEdit && (
              <button className="btn primary" onClick={() => setModal({ mode: "add", calling: null })} style={{ marginTop: 12 }}>
                <Icon name="plus" size={15} sw={2} /> Add Calling
              </button>
            )}
          </div>
        ) : noMatches ? (
          <div className="empty" style={{ border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)" }}>
            <Icon name="search" size={26} className="e-ic" />
            <p>No positions match "{query}".</p>
          </div>
        ) : (
          <>
            {stakeCallings.length > 0 && (
              <section className="org-stake">
                <div className="org-section-label">Stake Leadership</div>
                <div className="org-stake-grid">
                  {stakeCallings.map((c) => <OrgRow key={c.id} calling={c} onOpen={openRow} />)}
                </div>
              </section>
            )}

            {units.length > 0 && (
              <>
                {stakeCallings.length > 0 && <div className="org-divider" />}
                <div className="org-section-label" style={{ marginBottom: 14 }}>Wards &amp; Branches</div>
                <div className="org-units">
                  {units.map((unit) => (
                    <div key={unit} className="org-card">
                      <div className="org-card-head">{unit}</div>
                      <div className="org-card-body">
                        {unitMap[unit].map((c) => <OrgRow key={c.id} calling={c} onOpen={openRow} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {detail && !modal && !confirmRelease && !confirmDelete && (
          <CallingDetail calling={detail} canEdit={canEdit}
            onClose={() => setDetailId(null)}
            onEdit={() => setModal({ mode: "edit", calling: detail })}
            onRelease={() => setConfirmRelease(detail.id)}
            onDelete={() => setConfirmDelete(detail.id)}
            onUpdate={(cal) => onSave(cal, true)} />
        )}
        {modal && (
          <CallingModal mode={modal.mode} calling={modal.calling} accounts={accounts}
            onSave={(cal, isEdit) => { onSave(cal, isEdit); setModal(null); }}
            onClose={() => setModal(null)} />
        )}
        {confirmRelease && (
          <ReleaseConfirm
            name={(callings.find((c) => c.id === confirmRelease) || {}).memberName}
            onConfirm={() => { onRelease(confirmRelease); setConfirmRelease(null); }}
            onCancel={() => setConfirmRelease(null)} />
        )}
        {confirmDelete && (
          <DeleteConfirm
            name={(callings.find((c) => c.id === confirmDelete) || {}).position}
            onConfirm={() => { onDelete(confirmDelete); setConfirmDelete(null); setDetailId(null); }}
            onCancel={() => setConfirmDelete(null)} />
        )}
      </>
    );
  }

  Object.assign(window, { TopBar, Sidebar, BottomNav, KpiRow, ToolCard, AddTile, CardModal, Drawer, Toast, LoginModal, LcrPrompt, ManageSystems, RolesPermissions, Categories, PortalSettings, OrgChart });
})();
