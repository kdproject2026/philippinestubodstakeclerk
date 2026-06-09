/* App — orchestration, state, persistence */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const Icon = window.Icon;
  const { SECTIONS, SEED_CARDS, KPIS } = window;

  const LS = { theme: "tsp_theme", active: "tsp_active", cards: "tsp_cards" };
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem(LS.theme) === "dark" ? "dark" : "light");
    const [active, setActive] = useState(() => {
      const a = localStorage.getItem(LS.active);
      return (a === "dashboard" || SECTIONS.some((s) => s.id === a)) ? a : "dashboard";
    });
    const [cards, setCards] = useState(() => load(LS.cards, SEED_CARDS));
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(null);
    const [drawer, setDrawer] = useState(null);     // card
    const [modal, setModal] = useState(null);       // { mode, card }
    const [toast, setToast] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const searchRef = useRef(null);
    const toastTimer = useRef(null);

    useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem(LS.theme, theme); }, [theme]);
    useEffect(() => { localStorage.setItem(LS.active, active); setNavOpen(false); }, [active]);
    useEffect(() => { save(LS.cards, cards); }, [cards]);

    // "/" focuses search
    useEffect(() => {
      const h = (e) => {
        if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          e.preventDefault(); searchRef.current && searchRef.current.focus();
        }
      };
      document.addEventListener("keydown", h);
      return () => document.removeEventListener("keydown", h);
    }, []);

    const flash = (msg) => {
      setToast(msg);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(""), 2200);
    };

    const counts = useMemo(() => {
      const o = {};
      SECTIONS.forEach((s) => o[s.id] = cards.filter((c) => c.section === s.id).length);
      return o;
    }, [cards]);

    const q = query.trim().toLowerCase();
    const matches = (c) => !q || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);

    // actions
    const saveCard = (card) => {
      setCards((prev) => {
        const exists = prev.some((c) => c.id === card.id);
        return exists ? prev.map((c) => c.id === card.id ? card : c) : [...prev, card];
      });
      setModal(null);
      setDrawer((d) => (d && d.id === card.id) ? card : d);
      flash(modal && modal.mode === "edit" ? "Changes saved" : "Tool added");
    };
    const deleteCard = (id) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
      setDrawer((d) => (d && d.id === id) ? null : d);
      setModal(null);
      flash("Tool removed");
    };
    const togglePin = (id) => {
      let nowPinned = false;
      setCards((prev) => prev.map((c) => {
        if (c.id === id) { nowPinned = !c.pinned; return { ...c, pinned: !c.pinned }; }
        return c;
      }));
      setDrawer((d) => (d && d.id === id) ? { ...d, pinned: !d.pinned } : d);
      flash(nowPinned ? "Pinned to dashboard" : "Removed from dashboard");
    };
    const launch = (card) => flash("Opening " + card.title + "…");
    const labelOf = (sid) => (SECTIONS.find((s) => s.id === sid) || {}).label || "";

    const cardProps = {
      onOpen: (c) => setDrawer(c),
      onPin: togglePin,
      onEdit: (c) => { setDrawer(null); setModal({ mode: "edit", card: c }); },
      onDelete: deleteCard,
      menuOpen, setMenuOpen,
    };

    // ---- views ----
    const renderGrid = (list) => (
      <div className="grid">
        {list.map((c) => <window.ToolCard key={c.id} card={c} {...cardProps} />)}
        <window.AddTile onClick={() => setModal({ mode: "add", card: null })} />
        {list.length === 0 && (
          <div className="empty">
            <Icon name="search" size={26} className="e-ic" />
            <p>No tools match "{query}".</p>
          </div>
        )}
      </div>
    );

    let main;
    if (active === "dashboard") {
      const pinned = cards.filter((c) => c.pinned && matches(c));
      const recent = cards.filter(matches).slice(0, 4);
      main = (
        <>
          <div className="page-head">
            <div className="h-left">
              <div className="eyebrow">Philippines Tubod Stake</div>
              <h1 className="page-title">Good morning, Brother Reyes</h1>
              <p className="page-sub">Your toolkit for ward & branch administration — eight units, one workspace.</p>
            </div>
            <button className="btn primary" onClick={() => setModal({ mode: "add", card: null })}>
              <Icon name="plus" size={16} sw={2} /> Add tool
            </button>
          </div>

          <window.KpiRow items={KPIS} />

          <div className="section-label">
            <h2>Pinned</h2><span className="line" /><span className="count">{pinned.length} tools</span>
          </div>
          {pinned.length ? (
            <div className="grid">
              {pinned.map((c) => <window.ToolCard key={c.id} card={c} {...cardProps} />)}
            </div>
          ) : (
            <div className="empty" style={{ border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)" }}>
              <Icon name="star" size={24} className="e-ic" />
              <p>Pin your most-used tools here for one-tap access.</p>
            </div>
          )}

          <div className="section-label">
            <h2>Browse by category</h2><span className="line" />
          </div>
          <div className="grid">
            {SECTIONS.map((s) => (
              <button key={s.id} className="tool" onClick={() => setActive(s.id)}>
                <div className="tool-top">
                  <div className="tool-ic"><Icon name={s.icon} size={20} /></div>
                </div>
                <div className="tool-title">{s.label}</div>
                <div className="tool-desc">{s.desc}</div>
                <div className="tool-foot">
                  <span className="tool-meta">{counts[s.id]} tools</span>
                  <Icon name="arrowRight" size={16} className="tool-go" />
                </div>
              </button>
            ))}
          </div>
        </>
      );
    } else {
      const s = SECTIONS.find((x) => x.id === active) || SECTIONS[0];
      const list = cards.filter((c) => c.section === s.id && matches(c));
      main = (
        <>
          <div className="page-head">
            <div className="h-left">
              <div className="eyebrow">{s.label}</div>
              <h1 className="page-title">{s.label}</h1>
              <p className="page-sub">{s.desc}</p>
            </div>
            <button className="btn primary" onClick={() => setModal({ mode: "add", card: null })}>
              <Icon name="plus" size={16} sw={2} /> Add tool
            </button>
          </div>
          {renderGrid(list)}
        </>
      );
    }

    return (
      <div className="app">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")}
          query={query} setQuery={setQuery} searchRef={searchRef} onMenu={() => setNavOpen((o) => !o)} />
        <div className="body-row">
          <window.Sidebar sections={SECTIONS} active={active} setActive={setActive} counts={counts} open={navOpen} />
          <main className="main">
            <div className="main-inner">{main}</div>
          </main>
        </div>

        {drawer && (
          <window.Drawer card={drawer} sectionLabel={labelOf(drawer.section)}
            onClose={() => setDrawer(null)}
            onEdit={cardProps.onEdit} onDelete={deleteCard} onPin={togglePin} onLaunch={launch} />
        )}
        {modal && (
          <window.CardModal mode={modal.mode} card={modal.card} sections={SECTIONS}
            defaultSection={active !== "dashboard" ? active : null}
            onSave={saveCard} onClose={() => setModal(null)} />
        )}
        <window.Toast msg={toast} />
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
