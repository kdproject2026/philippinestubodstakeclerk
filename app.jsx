/* App — orchestration, state, persistence */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const Icon = window.Icon;
  const { SECTIONS, SEED_CARDS } = window;

  const LS = { theme: "tsp_theme", active: "tsp_active", cards: "tsp_cards_v7", accounts: "tsp_accounts_v3", roles: "tsp_roles_v3", callings: "tsp_callings_v2", hidden: "tsp_hidden_v1", session: "tsp_session_v2" };
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem(LS.theme) === "dark" ? "dark" : "light");
    const [active, setActive] = useState(() => {
      const a = localStorage.getItem(LS.active);
      return (a === "manage-systems" || a === "roles-permissions" || a === "categories" || SECTIONS.some((s) => s.id === a)) ? a : SECTIONS[0].id;
    });
    const [cards, setCards] = useState(() => load(LS.cards, SEED_CARDS));
    const [accounts, setAccounts] = useState(() => load(LS.accounts, []));
    const [roles, setRoles] = useState(() => load(LS.roles, window.SEED_ROLES));
    const [callings, setCallings] = useState(() => load(LS.callings, window.SEED_CALLINGS));
    const [hiddenSections, setHiddenSections] = useState(() => load(LS.hidden, []));
    const [session, setSession] = useState(() => load(LS.session, null));
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(null);
    const [drawer, setDrawer] = useState(null);
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState("");
    const searchRef = useRef(null);
    const toastTimer = useRef(null);

    const isAdmin = session?.role === "Admin";

    const roleEntry = useMemo(() =>
      session ? (roles.find((r) => r.name === session.calling) || roles.find((r) => r.name === session.role)) : null
    , [session, roles]);

    const canEditOrgChart = isAdmin || !!(roleEntry?.canEditOrgChart);
    const canSeeAdmin     = isAdmin || !!(roleEntry?.canSeeAdmin);

    // sections visible to the current user
    const visibleSections = useMemo(() => {
      if (!session) return [];
      if (isAdmin) return SECTIONS;
      const allowed = roleEntry ? roleEntry.tabs : SECTIONS.filter((s) => s.id !== "admin").map((s) => s.id);
      const base = SECTIONS.filter((s) => allowed.includes(s.id) && !hiddenSections.includes(s.id));
      // inject admin tab if canSeeAdmin but not already present
      if (canSeeAdmin && !base.some((s) => s.id === "admin")) {
        const adminSection = SECTIONS.find((s) => s.id === "admin");
        return adminSection ? [...base, adminSection] : base;
      }
      return base;
    }, [session, roles, isAdmin, hiddenSections, roleEntry, canSeeAdmin]);

    useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem(LS.theme, theme); }, [theme]);
    useEffect(() => { localStorage.setItem(LS.active, active); }, [active]);
    useEffect(() => { save(LS.cards, cards); }, [cards]);
    useEffect(() => { save(LS.accounts, accounts); }, [accounts]);
    useEffect(() => { save(LS.roles, roles); }, [roles]);
    useEffect(() => { save(LS.callings, callings); }, [callings]);
    useEffect(() => { save(LS.hidden, hiddenSections); }, [hiddenSections]);
    useEffect(() => { save(LS.session, session); }, [session]);

    // keep the session in sync with its account record:
    // sign out if the account was deleted or deactivated, refresh it if edited
    useEffect(() => {
      if (!session) return;
      const acc = accounts.find((a) => a.id === session.id);
      if (!acc || (acc.status || "active") !== "active") { setSession(null); return; }
      if (JSON.stringify(acc) !== JSON.stringify(session)) setSession(acc);
    }, [accounts]);

    // redirect non-admins away from views they lack permission for
    useEffect(() => {
      if (!session) return;
      const fallback = visibleSections[0]?.id || SECTIONS[0].id;
      // sub-admin views: strictly portal-Admin only
      if (!isAdmin && (active === "manage-systems" || active === "roles-permissions" || active === "categories")) {
        setActive(fallback); return;
      }
      // admin tab: admin OR canSeeAdmin
      if (!isAdmin && active === "admin" && !canSeeAdmin) {
        setActive(fallback); return;
      }
      // redirect away from tabs not in visibleSections
      const isSectionView = SECTIONS.some((s) => s.id === active);
      if (!isAdmin && isSectionView && visibleSections.length > 0 && !visibleSections.some((s) => s.id === active)) {
        setActive(visibleSections[0].id);
      }
    }, [session, roles, hiddenSections, active]);

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

    // card actions
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
      flash(nowPinned ? "Pinned" : "Unpinned");
    };
    const launch = (card) => {
      if (card.url) { window.open(card.url, "_blank", "noopener,noreferrer"); }
      else { flash("No link set for this tool."); }
    };

    const pendingCount = accounts.filter((a) => (a.status || "active") === "pending").length;

    // account actions
    const saveAccount = (account, isEdit) => {
      setAccounts((prev) => {
        const exists = prev.some((a) => a.id === account.id);
        return exists ? prev.map((a) => a.id === account.id ? account : a) : [...prev, account];
      });
      flash(isEdit ? "Account updated" : "Account created");
    };
    const deleteAccount = (id) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      flash("Account removed");
    };
    const registerAccount = (account) => {
      setAccounts((prev) => [...prev, account]);
    };
    const approveAccount = (id, data) => {
      setAccounts((prev) => prev.map((a) =>
        a.id === id ? { ...a, ...data, status: "active" } : a
      ));
      flash("Account approved");
    };

    // role actions
    const saveRole = (role, isEdit) => {
      setRoles((prev) => {
        const exists = prev.some((r) => r.id === role.id);
        return exists ? prev.map((r) => r.id === role.id ? role : r) : [...prev, role];
      });
      flash(isEdit ? "Role updated" : "Role added");
    };
    const deleteRole = (id) => {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      flash("Role removed");
    };

    // calling actions
    const saveCalling = (calling, isEdit) => {
      setCallings((prev) => {
        const exists = prev.some((c) => c.id === calling.id);
        return exists ? prev.map((c) => c.id === calling.id ? calling : c) : [...prev, calling];
      });
      flash(isEdit ? "Calling updated" : "Calling added");
    };
    const deleteCalling = (id) => {
      setCallings((prev) => prev.filter((c) => c.id !== id));
      flash("Calling removed");
    };
    const releaseCalling = (id) => {
      setCallings((prev) => prev.map((c) =>
        c.id === id ? { ...c, memberName: "", userId: "", mrn: "", dateCalled: "", dateReleased: new Date().toISOString().slice(0, 10), status: "Vacant", notes: "", assignments: [] } : c
      ));
      flash("Member released from calling");
    };

    // category visibility
    const toggleSection = (id) => {
      setHiddenSections((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        flash(prev.includes(id) ? "Category shown" : "Category hidden");
        return next;
      });
    };

    const labelOf = (sid) => (SECTIONS.find((s) => s.id === sid) || {}).label || "";

    const cardProps = {
      onOpen: (c) => {
        if (c.id === "user-management")    { setActive("manage-systems"); return; }
        if (c.id === "roles-permissions")  { setActive("roles-permissions"); return; }
        if (c.id === "categories")         { setActive("categories"); return; }
        if (c.url) { window.open(c.url, "_blank", "noopener,noreferrer"); return; }
        if (isAdmin) setDrawer(c);
      },
      onPin: togglePin,
      onEdit: (c) => { setDrawer(null); setModal({ mode: "edit", card: c }); },
      onDelete: deleteCard,
      menuOpen, setMenuOpen,
      isAdmin,
    };

    const renderGrid = (list) => (
      <div className="grid">
        {[...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
          .map((c) => <window.ToolCard key={c.id} card={c} {...cardProps} />)}
        {isAdmin && <window.AddTile onClick={() => setModal({ mode: "add", card: null })} />}
        {list.length === 0 && (
          <div className="empty">
            <Icon name="search" size={26} className="e-ic" />
            <p>No tools match "{query}".</p>
          </div>
        )}
      </div>
    );

    let main;
    if (active === "manage-systems" && isAdmin) {
      main = (
        <window.ManageSystems accounts={accounts} roles={roles} onSave={saveAccount} onDelete={deleteAccount}
          onApprove={approveAccount} onBack={() => setActive("admin")} isAdmin={isAdmin} />
      );
    } else if (active === "roles-permissions" && isAdmin) {
      main = (
        <window.RolesPermissions roles={roles} sections={SECTIONS} onSave={saveRole}
          onDelete={deleteRole} onBack={() => setActive("admin")} isAdmin={isAdmin} />
      );
    } else if (active === "categories" && isAdmin) {
      main = (
        <window.Categories sections={SECTIONS} hiddenSections={hiddenSections}
          onToggle={toggleSection} onBack={() => setActive("admin")} />
      );
    } else if (active === "org-chart") {
      main = (
        <window.OrgChart callings={callings} accounts={accounts}
          canEdit={isAdmin || canEditOrgChart}
          onSave={saveCalling} onDelete={deleteCalling} onRelease={releaseCalling} />
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
            {isAdmin && (
              <button className="btn primary" onClick={() => setModal({ mode: "add", card: null })}>
                <Icon name="plus" size={16} sw={2} /> Add tool
              </button>
            )}
          </div>
          {renderGrid(list)}
        </>
      );
    }

    const createFirstAdmin = (data) => {
      const account = { id: "u-" + Date.now(), ...data };
      setAccounts([account]);
      setSession(account);
    };

    if (!session) {
      return (
        <div className="app" data-theme={theme}>
          <window.LoginModal accounts={accounts} onLogin={setSession} onCreateFirst={createFirstAdmin} onRegister={registerAccount} />
        </div>
      );
    }

    return (
      <div className="app">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")}
          query={query} setQuery={setQuery} searchRef={searchRef}
          session={session} pendingCount={isAdmin ? pendingCount : 0} onViewPending={() => setActive("manage-systems")}
          onSignOut={() => setSession(null)} />
        <div className="body-row">
          <window.Sidebar sections={visibleSections} active={active} setActive={setActive} counts={counts}
            onSignOut={() => setSession(null)} isAdmin={isAdmin} />
          <main className="main">
            <div className="main-inner">{main}</div>
          </main>
        </div>

        <window.BottomNav sections={visibleSections}
          active={["manage-systems", "roles-permissions", "categories"].includes(active) ? "admin" : active}
          setActive={setActive} />

        {drawer && (
          <window.Drawer card={drawer} sectionLabel={labelOf(drawer.section)}
            onClose={() => setDrawer(null)}
            onEdit={cardProps.onEdit} onDelete={deleteCard} onPin={togglePin} onLaunch={launch}
            isAdmin={isAdmin} />
        )}
        {modal && isAdmin && (
          <window.CardModal mode={modal.mode} card={modal.card}
            sections={SECTIONS.filter((s) => s.id !== "org-chart")}
            defaultSection={active === "org-chart" ? SECTIONS[0].id : active}
            onSave={saveCard} onClose={() => setModal(null)} />
        )}
        <window.Toast msg={toast} />
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
