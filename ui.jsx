/* UI building blocks */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  /* ---------------- TopBar ---------------- */
  function TopBar({ theme, onToggleTheme, query, setQuery, searchRef, onMenu }) {
    return (
      <header className="topbar">
        <button className="icon-btn only-mobile" onClick={onMenu} aria-label="Menu" style={{ display: "none" }}>
          <Icon name="menu" />
        </button>
        <div className="brand">
          <div className="brand-mark"><Icon name="church" size={20} sw={1.5} /></div>
          <div className="brand-text">
            <span className="nm">Tubod Stake</span>
            <span className="sub">ADMINISTRATION PORTAL</span>
          </div>
        </div>

        <div className="search">
          <Icon name="search" size={16} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools and records…"
            aria-label="Search"
          />
          <kbd>/</kbd>
        </div>

        <div className="topbar-spacer" />

        <div className="icon-wrap">
          <button className="icon-btn" aria-label="Notifications"><Icon name="bell" /></button>
          <span className="badge-dot" />
        </div>
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <button className="user-chip">
          <span className="avatar">DR</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span className="u-nm">D. Reyes</span>
            <span className="u-role">Stake Clerk</span>
          </span>
        </button>
      </header>
    );
  }

  /* ---------------- Sidebar ---------------- */
  function Sidebar({ sections, active, setActive, counts, open }) {
    return (
      <nav className={"sidebar" + (open ? " open" : "")}>
        <div className="nav-label">Workspace</div>
        <button className={"nav-item" + (active === "dashboard" ? " active" : "")} onClick={() => setActive("dashboard")}>
          <Icon name="dashboard" size={18} className="ic" />
          <span className="lbl">Dashboard</span>
        </button>

        <div className="nav-label" style={{ marginTop: 14 }}>Categories</div>
        {sections.map((s) => (
          <button key={s.id} className={"nav-item" + (active === s.id ? " active" : "")} onClick={() => setActive(s.id)}>
            <Icon name={s.icon} size={18} className="ic" />
            <span className="lbl">{s.label}</span>
            <span className="cnt">{counts[s.id] || 0}</span>
          </button>
        ))}

        <div className="sidebar-foot">
          <button className="nav-item"><Icon name="help" size={18} className="ic" /><span className="lbl">Help & Support</span></button>
          <button className="nav-item"><Icon name="logout" size={18} className="ic" /><span className="lbl">Sign out</span></button>
        </div>
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
  function ToolCard({ card, onOpen, onPin, onEdit, onDelete, menuOpen, setMenuOpen }) {
    const ref = useRef(null);
    useEffect(() => {
      if (!menuOpen) return;
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
          <div className="tool-actions" onClick={(e) => e.stopPropagation()}>
            <button className={"mini-btn" + (card.pinned ? " pinned" : "")} title={card.pinned ? "Unpin" : "Pin"}
              onClick={() => onPin(card.id)} style={card.pinned ? { opacity: 1 } : null}>
              <Icon name="star" size={15} fill={card.pinned ? "currentColor" : "none"} />
            </button>
            <button className="mini-btn" title="More" onClick={() => setMenuOpen(menuOpen === card.id ? null : card.id)}>
              <Icon name="more" size={16} />
            </button>
          </div>
          {menuOpen === card.id && (
            <div className="menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onOpen(card); setMenuOpen(null); }}><Icon name="external" size={15} /> Open</button>
              <button onClick={() => { onEdit(card); setMenuOpen(null); }}><Icon name="edit" size={15} /> Edit</button>
              <button onClick={() => { onPin(card.id); setMenuOpen(null); }}><Icon name="star" size={15} /> {card.pinned ? "Unpin" : "Pin to dashboard"}</button>
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
          <Icon name="arrowRight" size={16} className="tool-go" />
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
  function Drawer({ card, sectionLabel, onClose, onEdit, onDelete, onPin, onLaunch }) {
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
            <div>
              <div className="m-k" style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="nav-item" style={{ border: "1px solid var(--border)" }} onClick={() => onPin(card.id)}>
                  <Icon name="star" size={17} className="ic" /><span className="lbl">{card.pinned ? "Remove from dashboard" : "Pin to dashboard"}</span>
                </button>
                <button className="nav-item" style={{ border: "1px solid var(--border)" }} onClick={() => onEdit(card)}>
                  <Icon name="edit" size={17} className="ic" /><span className="lbl">Edit details</span>
                </button>
              </div>
            </div>
          </div>
          <div className="drawer-foot">
            <button className="btn danger" onClick={() => onDelete(card.id)}><Icon name="trash" size={16} /></button>
            <button className="btn primary" onClick={() => onLaunch(card)}><Icon name="external" size={16} /> Open tool</button>
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

  Object.assign(window, { TopBar, Sidebar, KpiRow, ToolCard, AddTile, CardModal, Drawer, Toast });
})();
