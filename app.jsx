/* App — orchestration, Firebase Auth session, Firestore data */
(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const Icon = window.Icon;
  const { SECTIONS, SEED_CARDS } = window;
  const auth = window.fbAuth;
  const db = window.fbDb;

  // only UI preferences stay in localStorage — all shared data lives in Firestore
  const LS = { theme: "tsp_theme", active: "tsp_active" };
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };

  const docData = (snap) => ({ id: snap.id, ...snap.data() });
  const stripId = (obj) => { const { id, ...rest } = obj; return rest; };

  const authErrorMsg = (e) => {
    const code = (e && e.code) || "";
    if (code.includes("email-already-in-use"))  return "An account with this email already exists.";
    if (code.includes("invalid-email"))         return "Enter a valid email address.";
    if (code.includes("weak-password"))         return "Password must be at least 6 characters.";
    if (code.includes("user-not-found") || code.includes("wrong-password") ||
        code.includes("invalid-credential") || code.includes("invalid-login-credentials"))
      return "Invalid email or password.";
    if (code.includes("too-many-requests"))     return "Too many attempts. Please try again later.";
    if (code.includes("network-request-failed"))return "Network error. Check your connection and try again.";
    return (e && e.message) || "Something went wrong. Please try again.";
  };

  function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem(LS.theme) === "dark" ? "dark" : "light");
    const [active, setActive] = useState(() => {
      const a = localStorage.getItem(LS.active);
      return (a === "manage-systems" || a === "roles-permissions" || a === "categories" || a === "portal-settings" || SECTIONS.some((s) => s.id === a)) ? a : SECTIONS[0].id;
    });

    // auth + session
    const [authUser, setAuthUser] = useState(undefined);   // undefined = still resolving
    const [session, setSession] = useState(null);          // current user's account doc
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [bootstrapped, setBootstrapped] = useState(null); // null = loading
    const bootstrappingRef = useRef(false);

    // shared data (Firestore snapshots)
    const [cards, setCards] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [callings, setCallings] = useState([]);
    const [hiddenSections, setHiddenSections] = useState([]);
    const [settings, setSettings] = useState(window.DEFAULT_SETTINGS);

    // ui state
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(null);
    const [drawer, setDrawer] = useState(null);
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState("");
    const [lcrPrompt, setLcrPrompt] = useState(false);
    const searchRef = useRef(null);
    const toastTimer = useRef(null);

    /* ---- auth state ---- */
    useEffect(() => auth.onAuthStateChanged((u) => setAuthUser(u || null)), []);

    /* ---- bootstrap marker (drives first-run screen, public read) ---- */
    useEffect(() => db.doc("config/bootstrap").onSnapshot(
      (snap) => setBootstrapped(snap.exists),
      () => setBootstrapped(true)
    ), []);

    /* ---- own account doc → session ---- */
    useEffect(() => {
      if (authUser === undefined) return;
      if (!authUser) { setSession(null); setSessionLoaded(true); return; }
      setSessionLoaded(false);
      let hadDoc = false;
      const unsub = db.doc("accounts/" + authUser.uid).onSnapshot((snap) => {
        const acc = snap.exists ? { id: snap.id, ...snap.data() } : null;
        if (acc && (acc.status || "active") === "active") {
          hadDoc = true;
          setSession(acc);
        } else {
          setSession(null);
          // signed out only if the account was active earlier in this session
          // (deleted/demoted while using the portal)
          if (hadDoc) auth.signOut();
        }
        setSessionLoaded(true);
      }, () => { setSession(null); setSessionLoaded(true); });
      return unsub;
    }, [authUser]);

    /* ---- shared collections (only while signed in & active) ---- */
    useEffect(() => {
      if (!session) {
        setAccounts([]); setRoles([]); setCallings([]); setCards([]);
        setHiddenSections([]); setSettings(window.DEFAULT_SETTINGS);
        return;
      }
      const subs = [
        db.collection("accounts").onSnapshot((qs) => setAccounts(qs.docs.map(docData)), () => {}),
        db.collection("roles").onSnapshot((qs) => setRoles(qs.docs.map(docData)), () => {}),
        db.collection("callings").onSnapshot((qs) => setCallings(qs.docs.map(docData)), () => {}),
        db.collection("cards").onSnapshot((qs) => setCards(qs.docs.map(docData)), () => {}),
        db.doc("config/portal").onSnapshot((snap) => {
          const d = snap.exists ? snap.data() : {};
          setHiddenSections(d.hiddenSections || []);
          setSettings({ ...window.DEFAULT_SETTINGS, ...(d.settings || {}) });
        }, () => {}),
      ];
      return () => subs.forEach((u) => u());
    }, [session && session.id]);

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
      if (canSeeAdmin && !base.some((s) => s.id === "admin")) {
        const adminSection = SECTIONS.find((s) => s.id === "admin");
        return adminSection ? [...base, adminSection] : base;
      }
      return base;
    }, [session, roles, isAdmin, hiddenSections, roleEntry, canSeeAdmin]);

    useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem(LS.theme, theme); }, [theme]);
    useEffect(() => { localStorage.setItem(LS.active, active); }, [active]);

    // LCR reminder: pop up once after signing in (resets on sign-out)
    useEffect(() => {
      if (!session) { sessionStorage.removeItem("tsp_lcr_seen"); setLcrPrompt(false); return; }
      if (settings.showLcrGate === false) return;
      if (sessionStorage.getItem("tsp_lcr_seen")) return;
      setLcrPrompt(true);
    }, [session && session.id, settings.showLcrGate]);
    const dismissLcr = () => { sessionStorage.setItem("tsp_lcr_seen", "1"); setLcrPrompt(false); };

    // redirect non-admins away from views they lack permission for
    useEffect(() => {
      if (!session) return;
      const fallback = visibleSections[0]?.id || SECTIONS[0].id;
      if (!isAdmin && (active === "manage-systems" || active === "roles-permissions" || active === "categories" || active === "portal-settings")) {
        setActive(fallback); return;
      }
      if (!isAdmin && active === "admin" && !canSeeAdmin) {
        setActive(fallback); return;
      }
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

    /* ---------------- auth flows ---------------- */

    const login = async (email, password) => {
      try {
        const cred = await auth.signInWithEmailAndPassword(email.trim(), password);
        const snap = await db.doc("accounts/" + cred.user.uid).get();
        if (!snap.exists) {
          await auth.signOut();
          return "This account has been removed from the portal.";
        }
        if ((snap.data().status || "active") !== "active") {
          await auth.signOut();
          return "Your account is pending approval. Please wait for an administrator to confirm it.";
        }
        return null;
      } catch (e) { return authErrorMsg(e); }
    };

    const forgotPassword = async (email) => {
      try { await auth.sendPasswordResetEmail(email.trim()); return null; }
      catch (e) { return authErrorMsg(e); }
    };

    // self-registration through the secondary app so nothing disturbs the
    // primary auth state; account doc is created as the new (pending) user
    const registerAccount = async (data, password) => {
      const sec = window.fbSecondaryApp;
      try {
        const cred = await sec.auth().createUserWithEmailAndPassword(data.email.trim(), password);
        await sec.firestore().doc("accounts/" + cred.user.uid).set({
          ...data, role: "", status: "pending", createdAt: new Date().toISOString(),
        });
        await sec.auth().signOut();
        return null;
      } catch (e) {
        try { await sec.auth().signOut(); } catch {}
        return authErrorMsg(e);
      }
    };

    // admin-created account: auth user via secondary app, profile written as admin
    const createAccount = async (data, password) => {
      const sec = window.fbSecondaryApp;
      try {
        const cred = await sec.auth().createUserWithEmailAndPassword(data.email.trim(), password);
        await db.doc("accounts/" + cred.user.uid).set({
          ...stripId(data), status: "active", createdAt: new Date().toISOString(),
        });
        await sec.auth().signOut();
        flash("Account created");
        return null;
      } catch (e) {
        try { await sec.auth().signOut(); } catch {}
        return authErrorMsg(e);
      }
    };

    // first-run: create the admin account, mark bootstrap, seed portal data
    // (uses any data carried over from the old localStorage version if present)
    const createFirstAdmin = async (data, password) => {
      bootstrappingRef.current = true;
      try {
        const cred = await auth.createUserWithEmailAndPassword(data.email.trim(), password);
        const batch = db.batch();
        batch.set(db.doc("accounts/" + cred.user.uid), {
          ...data, role: "Admin", status: "active", createdAt: new Date().toISOString(),
        });
        batch.set(db.doc("config/bootstrap"), { createdAt: new Date().toISOString() });
        const seedRoles    = load("tsp_roles_v3", window.SEED_ROLES);
        const seedCallings = load("tsp_callings_v2", window.SEED_CALLINGS);
        const seedCards    = load("tsp_cards_v8", SEED_CARDS);
        const localHidden  = load("tsp_hidden_v1", []);
        const localSettings = load("tsp_settings_v1", {});
        seedRoles.forEach((r) => batch.set(db.doc("roles/" + r.id), stripId(r), {}));
        seedCallings.forEach((c) => batch.set(db.doc("callings/" + c.id), stripId(c)));
        seedCards.forEach((c) => batch.set(db.doc("cards/" + c.id), stripId(c)));
        batch.set(db.doc("config/portal"), {
          hiddenSections: localHidden,
          settings: { ...window.DEFAULT_SETTINGS, ...localSettings },
        });
        await batch.commit();
        return null;
      } catch (e) { return authErrorMsg(e); }
      finally { bootstrappingRef.current = false; }
    };

    const signOut = () => auth.signOut();

    /* ---------------- card actions ---------------- */
    const saveCard = (card) => {
      db.doc("cards/" + card.id).set(stripId(card));
      setModal(null);
      setDrawer((d) => (d && d.id === card.id) ? card : d);
      flash(modal && modal.mode === "edit" ? "Changes saved" : "Tool added");
    };
    const deleteCard = (id) => {
      db.doc("cards/" + id).delete();
      setDrawer((d) => (d && d.id === id) ? null : d);
      setModal(null);
      flash("Tool removed");
    };
    const togglePin = (id) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      db.doc("cards/" + id).update({ pinned: !card.pinned });
      setDrawer((d) => (d && d.id === id) ? { ...d, pinned: !card.pinned } : d);
      flash(!card.pinned ? "Pinned" : "Unpinned");
    };
    const launch = (card) => {
      if (card.url) { window.open(card.url, "_blank", "noopener,noreferrer"); }
      else { flash("No link set for this tool."); }
    };

    const pendingCount = accounts.filter((a) => (a.status || "active") === "pending").length;

    /* ---------------- account actions ---------------- */
    const saveAccount = (account) => {
      db.doc("accounts/" + account.id).set(stripId(account), { merge: true });
      flash("Account updated");
    };
    const deleteAccount = (id) => {
      db.doc("accounts/" + id).delete();
      flash("Account removed");
    };
    const approveAccount = (id, data) => {
      db.doc("accounts/" + id).update({ ...data, status: "active" });
      flash("Account approved");
    };

    /* ---------------- role actions ---------------- */
    const saveRole = (role, isEdit) => {
      db.doc("roles/" + role.id).set(stripId(role));
      flash(isEdit ? "Role updated" : "Role added");
    };
    const deleteRole = (id) => {
      db.doc("roles/" + id).delete();
      flash("Role removed");
    };

    /* ---------------- calling actions ---------------- */
    const saveCalling = (calling, isEdit) => {
      db.doc("callings/" + calling.id).set(stripId(calling));
      flash(isEdit ? "Calling updated" : "Calling added");
    };
    const deleteCalling = (id) => {
      db.doc("callings/" + id).delete();
      flash("Calling removed");
    };
    const releaseCalling = (id) => {
      db.doc("callings/" + id).update({
        memberName: "", userId: "", mrn: "", dateCalled: "",
        dateReleased: new Date().toISOString().slice(0, 10),
        status: "Vacant", notes: "", assignments: [],
      });
      flash("Member released from calling");
    };

    /* ---------------- category visibility / settings ---------------- */
    const toggleSection = (id) => {
      const next = hiddenSections.includes(id)
        ? hiddenSections.filter((x) => x !== id)
        : [...hiddenSections, id];
      db.doc("config/portal").set({ hiddenSections: next }, { merge: true });
      flash(hiddenSections.includes(id) ? "Category shown" : "Category hidden");
    };
    const savePortalSettings = (s) => {
      db.doc("config/portal").set({ settings: s }, { merge: true });
      flash("Settings saved");
    };

    const labelOf = (sid) => (SECTIONS.find((s) => s.id === sid) || {}).label || "";

    const activeAccounts = useMemo(
      () => accounts.filter((a) => (a.status || "active") === "active"),
      [accounts]
    );

    const cardProps = {
      onOpen: (c) => {
        if (c.id === "user-management")    { setActive("manage-systems"); return; }
        if (c.id === "roles-permissions")  { setActive("roles-permissions"); return; }
        if (c.id === "categories")         { setActive("categories"); return; }
        if (c.id === "portal-settings")    { setActive("portal-settings"); return; }
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
        <window.ManageSystems accounts={accounts} roles={roles}
          onSave={saveAccount} onCreate={createAccount} onDelete={deleteAccount}
          onApprove={approveAccount} onResetPw={forgotPassword}
          onBack={() => setActive("admin")} isAdmin={isAdmin} />
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
    } else if (active === "portal-settings" && isAdmin) {
      main = (
        <window.PortalSettings settings={settings}
          onSave={savePortalSettings}
          onBack={() => setActive("admin")} />
      );
    } else if (active === "org-chart") {
      main = (
        <window.OrgChart callings={callings} accounts={activeAccounts}
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

    /* ---------------- top-level render ---------------- */

    if (authUser === undefined || bootstrapped === null || (authUser && !sessionLoaded)) {
      return (
        <div className="app">
          <div className="splash">
            <div className="brand-mark" style={{ width: 46, height: 46, borderRadius: 12 }}>
              <Icon name="church" size={24} sw={1.5} />
            </div>
            <span>Loading the portal…</span>
          </div>
        </div>
      );
    }

    if (!session) {
      return (
        <div className="app" data-theme={theme}>
          <window.LoginModal bootstrapped={bootstrapped}
            onLogin={login} onRegister={registerAccount}
            onCreateFirst={createFirstAdmin} onForgot={forgotPassword} />
        </div>
      );
    }

    return (
      <div className="app">
        <window.TopBar theme={theme} onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")}
          query={query} setQuery={setQuery} searchRef={searchRef}
          session={session} pendingCount={isAdmin ? pendingCount : 0} onViewPending={() => setActive("manage-systems")}
          onSignOut={signOut} />
        <div className="body-row">
          <window.Sidebar sections={visibleSections} active={active} setActive={setActive} counts={counts}
            onSignOut={signOut} isAdmin={isAdmin} />
          <main className="main">
            <div className="main-inner">{main}</div>
          </main>
        </div>

        <window.BottomNav sections={visibleSections}
          active={["manage-systems", "roles-permissions", "categories", "portal-settings"].includes(active) ? "admin" : active}
          setActive={setActive} />

        {lcrPrompt && <window.LcrPrompt lcrUrl={settings.lcrUrl} onClose={dismissLcr} />}

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
