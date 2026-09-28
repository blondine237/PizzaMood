/* PizzaMood — site statique HTML/CSS/JS */
(function () {
  "use strict";

  const LS_KEY = "pizzamood_avis_v1";
  const EMAIL_LOG_KEY = "pizzamood_email_logs_v1";
  const MOD_PASS = "pizzamood-admin";
  const MOD_SESSION_KEY = "pizzamood_mod_session";

  /* ---------- Utils ---------- */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  /* ---------- Avis localStorage ---------- */
  function getAvis() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveAvis(list) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }
  function seedDemoAvis() {
    if (getAvis().length > 0) return;
    const demo = [
      { id: uuid(), nom: "Aline K.", note: 5, commentaire: "La meilleure pizza de Douala, la pâte est incroyablement légère !", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), approuve: true },
      { id: uuid(), nom: "Marc T.", note: 4, commentaire: "Très bon, livraison rapide et chaude. Je recommande le Poulet BBQ.", created_at: new Date(Date.now() - 86400000 * 5).toISOString(), approuve: true },
      { id: uuid(), nom: "Sandrine E.", note: 5, commentaire: "Accueil chaleureux et pizzas généreuses. On reviendra en famille.", created_at: new Date(Date.now() - 86400000 * 12).toISOString(), approuve: true },
    ];
    saveAvis(demo);
  }

  /* ---------- Email logs localStorage ---------- */
  function getEmailLogs() {
    try {
      const raw = localStorage.getItem(EMAIL_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveEmailLogs(list) {
    localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(list));
  }
  function addEmailLog(type, recipient, subject, detail, status) {
    const logs = getEmailLogs();
    logs.unshift({
      id: uuid(),
      type,
      recipient,
      subject,
      detail,
      status,
      created_at: new Date().toISOString(),
    });
    saveEmailLogs(logs.slice(0, 200));
  }
  function seedDemoEmailLogs() {
    if (getEmailLogs().length > 0) return;
    const demo = [
      { id: uuid(), type: "avis", recipient: "admin@pizzamood.com", subject: "Nouvel avis en attente", detail: "Aline K. a laissé un avis 5 étoiles.", status: "envoye", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: uuid(), type: "avis", recipient: "admin@pizzamood.com", subject: "Nouvel avis en attente", detail: "Marc T. a laissé un avis 4 étoiles.", status: "envoye", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: uuid(), type: "moderation", recipient: "admin@pizzamood.com", subject: "Avis approuvé", detail: "Avis de Sandrine E. approuvé et publié.", status: "envoye", created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
    ];
    saveEmailLogs(demo);
  }

  /* ---------- Navigation active ---------- */
  function setActiveNav() {
    const page = document.querySelector(".index[data-page]")?.dataset.page;
    if (!page) return;
    $$("#main-nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.page === page);
    });
  }

  /* ---------- Menu filters ---------- */
  function initMenuFilters() {
    const container = $("#menu-filters");
    const grid = $("#menu-grid");
    if (!container || !grid) return;
    const buttons = $$("button", container);
    const cards = $$(".pizza-card", grid);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const filtre = btn.dataset.filter;
        cards.forEach((card) => {
          const show = filtre === "Tout" || card.dataset.cat === filtre;
          card.style.display = show ? "" : "none";
        });
      });
    });
    buttons[0]?.classList.add("on");
  }

  /* ---------- Gallery filters ---------- */
  function initGalleryFilters() {
    const container = $("#gallery-filters");
    const grid = $("#gallery-grid");
    if (!container || !grid) return;
    const buttons = $$("button", container);
    const items = $$(".item", grid);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const filtre = btn.dataset.filter;
        items.forEach((item) => {
          const show = filtre === "Tout" || item.dataset.cat === filtre;
          item.style.display = show ? "" : "none";
        });
      });
    });
    buttons[0]?.classList.add("on");
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    const form = $("#contact-form");
    const merci = $("#contact-merci");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.reset();
      if (merci) merci.style.display = "block";
    });
  }

  /* ---------- Avis rendering ---------- */
  function renderStars(note, size) {
    let html = '<span class="etoiles"' + (size ? ' style="font-size:' + size + 'px"' : "") + ">";
    for (let i = 1; i <= 5; i++) {
      html += '<i class="' + (i <= Math.round(note) ? "fa-solid fa-star" : "fa-regular fa-star") + '"></i>';
    }
    html += "</span>";
    return html;
  }

  function renderAvisItem(a, withActions) {
    const actions = withActions
      ? `<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
          ${a.approuve
            ? `<button class="btn-reset btn-depublier" data-id="${a.id}" type="button">Dépublier</button>`
            : `<button class="btn-submit btn-approuver" data-id="${a.id}" type="button" style="padding:10px 18px">Approuver</button>`}
          <button class="btn-reset btn-supprimer" data-id="${a.id}" type="button" style="color:#ff6b5a;border-color:rgba(255,107,90,.35)">Supprimer</button>
        </div>`
      : "";
    return `<article class="avis-item" data-id="${a.id}">
      <div class="avis-item-head">
        <span class="avatar">${a.nom.trim().charAt(0).toUpperCase()}</span>
        <div><h4>${a.nom}</h4><time datetime="${a.created_at}">${formatDate(a.created_at)}</time></div>
        ${renderStars(a.note)}
      </div>
      <p>${a.commentaire}</p>
      ${actions}
    </article>`;
  }

  function updatePublicAvis() {
    const liste = $("#avis-liste");
    const vide = $("#avis-vide");
    const resume = $("#avis-resume");
    if (!liste || !resume) return;

    const avis = getAvis().filter((a) => a.approuve);
    const total = avis.length;
    const moyenne = total ? avis.reduce((s, a) => s + a.note, 0) / total : 0;

    $("#moyenne").textContent = total ? moyenne.toFixed(1) : "—";
    $("#etoiles-moy").innerHTML = total ? renderStars(moyenne) : "";
    $("#total-avis").textContent = total + " avis " + (total > 1 ? "clients" : "client");

    const barres = $("#barres");
    barres.innerHTML = [5, 4, 3, 2, 1]
      .map((n) => {
        const nb = avis.filter((a) => a.note === n).length;
        const pct = total ? (nb / total) * 100 : 0;
        return `<div class="avis-barre"><span>${n} ★</span><div class="jauge"><div style="width:${pct}%"></div></div><em>${nb}</em></div>`;
      })
      .join("");

    if (total === 0) {
      vide.style.display = "block";
      liste.innerHTML = "";
    } else {
      vide.style.display = "none";
      liste.innerHTML = avis
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((a) => renderAvisItem(a, false))
        .join("");
    }
  }

  /* ---------- Avis form ---------- */
  function initAvisForm() {
    const form = $("#avis-form");
    if (!form) return;

    let note = 5;
    const noteBtns = $$("#note-choix button");
    const noteVal = $("#note-val");

    function updateNote(n) {
      note = n;
      noteBtns.forEach((b) => b.classList.toggle("on", parseInt(b.dataset.n, 10) <= n));
      noteVal.textContent = n + "/5";
    }
    noteBtns.forEach((b) =>
      b.addEventListener("click", () => updateNote(parseInt(b.dataset.n, 10)))
    );

    const erreur = $("#avis-erreur");
    const merci = $("#avis-merci");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (erreur) erreur.style.display = "none";
      if (merci) merci.style.display = "none";

      const nom = $("#avis-nom").value.trim();
      const commentaire = $("#avis-commentaire").value.trim();

      if (nom.length < 2 || nom.length > 60) {
        erreur.textContent = "Votre nom doit contenir entre 2 et 60 caractères.";
        erreur.style.display = "block";
        return;
      }
      if (commentaire.length < 5 || commentaire.length > 600) {
        erreur.textContent = "Votre commentaire doit contenir entre 5 et 600 caractères.";
        erreur.style.display = "block";
        return;
      }

      const list = getAvis();
      list.push({
        id: uuid(),
        nom,
        note,
        commentaire,
        created_at: new Date().toISOString(),
        approuve: false,
      });
      saveAvis(list);
      addEmailLog(
        "avis",
        "admin@pizzamood.com",
        "Nouvel avis en attente de validation",
        `${nom} a laissé un avis ${note} étoile${note > 1 ? "s" : ""}.`,
        "envoye"
      );
      form.reset();
      updateNote(5);
      if (merci) merci.style.display = "block";
    });
  }

  /* ---------- Moderation ---------- */
  function isModLoggedIn() {
    try {
      return localStorage.getItem(MOD_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  }
  function setModLoggedIn(v) {
    if (v) localStorage.setItem(MOD_SESSION_KEY, "1");
    else localStorage.removeItem(MOD_SESSION_KEY);
  }

  function renderModeration() {
    const attente = $("#mod-attente");
    const publies = $("#mod-publies");
    if (!attente || !publies) return;

    const all = getAvis().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const pending = all.filter((a) => !a.approuve);
    const approved = all.filter((a) => a.approuve);

    attente.innerHTML = pending.length
      ? pending.map((a) => renderAvisItem(a, true)).join("")
      : '<p style="color:#cfcfcf">Aucun avis en attente.</p>';
    publies.innerHTML = approved.length
      ? approved.map((a) => renderAvisItem(a, true)).join("")
      : '<p style="color:#cfcfcf">Aucun avis publié.</p>';
  }

  function bindModerationActions() {
    const panel = $("#mod-panel");
    if (!panel) return;

    panel.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-id]");
      if (!btn) return;
      const id = btn.dataset.id;
      let list = getAvis();
      const idx = list.findIndex((a) => a.id === id);
      if (idx === -1) return;

      if (btn.classList.contains("btn-approuver")) {
        list[idx].approuve = true;
      } else if (btn.classList.contains("btn-depublier")) {
        list[idx].approuve = false;
      } else if (btn.classList.contains("btn-supprimer")) {
        if (confirm("Supprimer définitivement cet avis ?")) {
          list.splice(idx, 1);
        }
      }
      saveAvis(list);
      renderModeration();
      updatePublicAvis();
    });
  }

  function initModeration() {
    const login = $("#mod-login");
    const panel = $("#mod-panel");
    const form = $("#mod-form");
    const logout = $("#mod-logout");
    if (!login || !panel || !form) return;

    function showPanel() {
      login.style.display = "none";
      panel.style.display = "block";
      renderModeration();
    }
    function showLogin() {
      login.style.display = "block";
      panel.style.display = "none";
    }

    if (isModLoggedIn()) showPanel();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = $("#mod-pass").value;
      const err = $("#mod-erreur");
      if (pass === MOD_PASS) {
        setModLoggedIn(true);
        $("#mod-pass").value = "";
        err.style.display = "none";
        showPanel();
      } else {
        err.style.display = "block";
      }
    });

    logout?.addEventListener("click", () => {
      setModLoggedIn(false);
      showLogin();
    });

    bindModerationActions();
  }

  /* ---------- Notifications e-mail ---------- */
  function statusLabel(status) {
    switch (status) {
      case "envoye": return "Envoyé";
      case "en-attente": return "En attente d'envoi";
      case "echoue": return "Échoué";
      default: return status;
    }
  }
  function statusClass(status) {
    switch (status) {
      case "envoye": return "status-envoye";
      case "en-attente": return "status-attente";
      case "echoue": return "status-echoue";
      default: return "";
    }
  }
  function renderNotifRow(log) {
    return `<article class="notif-row">
      <div class="notif-meta">
        <time datetime="${log.created_at}">${formatDate(log.created_at)}</time>
        <span class="notif-type">${log.type === "avis" ? "Avis client" : "Modération"}</span>
      </div>
      <div class="notif-body">
        <strong>${log.subject}</strong>
        <p>${log.detail}</p>
      </div>
      <div class="notif-recipient">
        <i class="fa-regular fa-envelope"></i>
        <span>${log.recipient}</span>
      </div>
      <span class="notif-status ${statusClass(log.status)}">${statusLabel(log.status)}</span>
    </article>`;
  }
  function filterNotifications() {
    const q = ($("#notif-q")?.value || "").toLowerCase();
    const statut = $("#notif-statut")?.value || "";
    const type = $("#notif-type")?.value || "";
    const du = $("#notif-du")?.value || "";
    const au = $("#notif-au")?.value || "";

    let logs = getEmailLogs();

    if (statut) logs = logs.filter((l) => l.status === statut);
    if (type) logs = logs.filter((l) => l.type === type);
    if (du) {
      const d = new Date(du);
      d.setHours(0, 0, 0, 0);
      logs = logs.filter((l) => new Date(l.created_at) >= d);
    }
    if (au) {
      const d = new Date(au);
      d.setHours(23, 59, 59, 999);
      logs = logs.filter((l) => new Date(l.created_at) <= d);
    }
    if (q) {
      logs = logs.filter(
        (l) =>
          l.recipient.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          l.detail.toLowerCase().includes(q) ||
          statusLabel(l.status).toLowerCase().includes(q)
      );
    }

    const liste = $("#notif-liste");
    const vide = $("#notif-vide");
    const compteur = $("#notif-compteur");
    if (!liste) return;

    if (compteur) {
      compteur.textContent = logs.length
        ? `${logs.length} résultat${logs.length > 1 ? "s" : ""} trouvé${logs.length > 1 ? "s" : ""}`
        : "Aucun résultat";
    }

    if (logs.length === 0) {
      liste.innerHTML = "";
      if (vide) vide.style.display = "block";
    } else {
      if (vide) vide.style.display = "none";
      liste.innerHTML = logs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(renderNotifRow)
        .join("");
    }
  }
  function initNotifications() {
    if (!$("#notif-liste")) return;
    seedDemoEmailLogs();

    ["#notif-q", "#notif-statut", "#notif-type", "#notif-du", "#notif-au"].forEach((sel) => {
      $(sel)?.addEventListener("input", filterNotifications);
    });

    $("#notif-reset")?.addEventListener("click", () => {
      $("#notif-q").value = "";
      $("#notif-statut").value = "";
      $("#notif-type").value = "";
      $("#notif-du").value = "";
      $("#notif-au").value = "";
      filterNotifications();
    });

    filterNotifications();
  }

  /* ---------- Mobile nav toggle ---------- */
  function initMobileNav() {
    const header = $("header");
    const nav = $("#main-nav");
    if (!header || !nav) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-toggle";
    toggle.setAttribute("aria-label", "Menu");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    header.appendChild(toggle);

    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.innerHTML = nav.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    $$("#main-nav a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      })
    );
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    seedDemoAvis();
    setActiveNav();
    initMobileNav();
    initMenuFilters();
    initGalleryFilters();
    initContactForm();
    initAvisForm();
    updatePublicAvis();
    initModeration();
    initNotifications();
  });
})();
