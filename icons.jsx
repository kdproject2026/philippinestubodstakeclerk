/* Clean line-icon set (Lucide-flavored), single <Icon name size> component */
(function () {
  const P = {
    /* nav / categories */
    dashboard: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></>,
    users: <><path d="M16 19v-1.6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3V19"/><circle cx="9.5" cy="7.5" r="3"/><path d="M21 19v-1.6a3 3 0 0 0-2.3-2.9"/><path d="M15.5 4.7a3 3 0 0 1 0 5.6"/></>,
    wallet: <><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1"/><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M16 13.5h2.5"/></>,
    sparkles: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M18.5 14.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9z"/></>,
    book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19v3H6.5A1.5 1.5 0 0 1 5 19.5z"/></>,
    shield: <><path d="M12 3l7 2.5v5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5v-5L12 3z"/></>,

    /* tools */
    move: <><path d="M8 7l-4 5 4 5"/><path d="M16 7l4 5-4 5"/><path d="M4 12h16"/></>,
    userPlus: <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19v-1a3.5 3.5 0 0 1 3.5-3.5h4a3.5 3.5 0 0 1 3.5 3.5v1"/><path d="M18.5 7.5v5M21 10h-5"/></>,
    handshake: <><path d="M12 7l2-1.6a2 2 0 0 1 2.4.1L21 9"/><path d="M12 7l-2-1.6a2 2 0 0 0-2.4.1L3 9v5l3 2"/><path d="M21 9v5l-5 4-4-3-2 1.5"/><path d="M9 13l2 1.8"/></>,
    gift: <><rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13v7h14v-7"/><path d="M12 9v11"/><path d="M12 9S9.5 4.5 7.5 5.6 9.5 9 12 9zM12 9s2.5-4.5 4.5-3.4S14.5 9 12 9z"/></>,
    barChart: <><path d="M4 20V10M9.3 20V4M14.6 20v-7M20 20V8"/></>,
    image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M20.5 15l-4.5-4.2L7 19.5"/></>,
    pie: <><path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M12 3v9h9A9 9 0 0 0 12 3z"/></>,
    receipt: <><path d="M5 3.5h14V21l-2.3-1.4L14.3 21 12 19.6 9.7 21 7.3 19.6 5 21z"/><path d="M8.5 8h7M8.5 12h7"/></>,
    coins: <><ellipse cx="9" cy="7" rx="5" ry="2.7"/><path d="M4 7v4c0 1.5 2.2 2.7 5 2.7s5-1.2 5-2.7V7"/><path d="M14 12.5c.7.2 1.6.3 2.5.3 2.8 0 5-1.2 5-2.7v-4"/><path d="M11 13.6c.6 1.2 2.7 2.1 5.5 2.1 2.8 0 5-1.2 5-2.7"/></>,
    file: <><path d="M6 3.5h8L19 8v12.5H6z"/><path d="M14 3.5V8h5"/><path d="M9 13h6M9 16.5h6"/></>,
    clipboardCheck: <><rect x="6" y="4.5" width="12" height="16" rx="2"/><path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v1H9z"/><path d="M9.5 13l2 2 3.5-3.7"/></>,
    listChecks: <><path d="M4 6.5l1.5 1.5L8 5.5"/><path d="M4 13l1.5 1.5L8 12"/><path d="M11 7h9M11 13h9M11 19h9"/><path d="M4.5 19h2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 5.5L20 7"/></>,
    music: <><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="2.6"/><circle cx="17.4" cy="16" r="2.6"/></>,
    languages: <><path d="M4 6h9M8.5 4v2c0 4-2 7-5 8.5"/><path d="M6 10c.8 2.2 2.8 4 5.5 5"/><path d="M13 20l3.5-8 3.5 8M14.3 17h4.4"/></>,
    bookOpen: <><path d="M12 6.5C10.5 5 8 4.5 4 4.8V18c4-.3 6.5.2 8 1.7 1.5-1.5 4-2 8-1.7V4.8c-4-.3-6.5.2-8 1.7z"/><path d="M12 6.5v13"/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/><rect x="7" y="12.5" width="3" height="3" rx="0.6"/></>,
    building: <><path d="M5 21V5a1.5 1.5 0 0 1 1.5-1.5H13A1.5 1.5 0 0 1 14.5 5v16"/><path d="M14.5 9H18a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M8 7.5h3M8 11h3M8 14.5h3M17 13h0M17 16.5h0M3.5 21h17"/></>,
    graduation: <><path d="M12 4L2.5 8.5 12 13l9.5-4.5L12 4z"/><path d="M6 10.5v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5"/><path d="M21.5 8.5v5"/></>,
    mapPin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></>,
    clipboard: <><rect x="6" y="4.5" width="12" height="16" rx="2"/><path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v1H9z"/><path d="M9 11h6M9 14.5h4"/></>,
    sitemap: <><rect x="9.5" y="3" width="5" height="4" rx="1"/><rect x="3" y="17" width="5" height="4" rx="1"/><rect x="16" y="17" width="5" height="4" rx="1"/><path d="M12 7v4M5.5 17v-2a1.5 1.5 0 0 1 1.5-1.5h10a1.5 1.5 0 0 1 1.5 1.5v2"/></>,
    history: <><path d="M3.5 12a8.5 8.5 0 1 1 2.5 6"/><path d="M3.5 18v-4h4"/><path d="M12 8v4l3 2"/></>,
    download: <><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4.5 19h15"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M4.2 7l2.1 1.3M17.7 15.7l2.1 1.3M4.2 17l2.1-1.3M17.7 8.3L19.8 7M3 12h2.5M18.5 12H21"/></>,

    /* ui */
    search: <><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/></>,
    bell: <><path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M2.5 12H5M19 12h2.5M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8"/></>,
    moon: <><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    more: <><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
    trash: <><path d="M4.5 6.5h15M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13"/></>,
    star: <><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L4.5 9.7l5.9-.8L12 3.5z"/></>,
    x: <><path d="M6 6l12 12M18 6L6 18"/></>,
    external: <><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-9A1.5 1.5 0 0 1 6 18.5v-9A1.5 1.5 0 0 1 7.5 8H12"/></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    chevronRight: <><path d="M9 6l6 6-6 6"/></>,
    logout: <><path d="M9 21H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3H9"/><path d="M16 16l4-4-4-4M9.5 12H20"/></>,
    help: <><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6v.4"/><circle cx="11.7" cy="16.6" r="0.6" fill="currentColor" stroke="none"/></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7"/></>,
    lock: <><rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/><circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none"/></>,
    eyeOff: <><path d="M4 4l16 16"/><path d="M10.6 6.1c.5-.1.9-.1 1.4-.1 6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-2.7 3.4M7 7.4C4.1 9.3 2.5 12 2.5 12S6 18 12 18c1.5 0 2.8-.4 4-1"/><path d="M10 10a2.8 2.8 0 0 0 4 4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    church: <><path d="M12 2.5l2 2v2.5l3 2V21H7V9l3-2V4.5l2-2z"/><path d="M11 2.5h2M10.5 11h3v4h-3z"/><path d="M5 21v-7l2-1.2M19 21v-7l-2-1.2"/></>,
  };

  function Icon({ name, size = 18, sw = 1.6, className = "", fill = "none" }) {
    const inner = P[name] || P.file;
    return (
      <svg className={"svg-ic " + className} width={size} height={size} viewBox="0 0 24 24"
        fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {inner}
      </svg>
    );
  }

  window.Icon = Icon;
  window.ICON_NAMES = Object.keys(P);
})();
