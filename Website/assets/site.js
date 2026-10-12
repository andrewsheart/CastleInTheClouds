/* ---------------------------------------------------------------
   Site settings: paste real links here and the matching
   "coming soon" labels across the site turn into working links.
---------------------------------------------------------------- */
const LINKS = {
  youtube: "",   // Berend's channel, e.g. "https://www.youtube.com/@channelname"
  book: "",      // This Was Made For You
  practice: ""   // first practices page
};

/* ---------------------------------------------------------------
   Membership. This preview adapter validates input and resolves,
   but stores and sends nothing. To launch real accounts, replace
   signUp/signIn with an auth provider's calls, for example Supabase:
     supabase.auth.signUp({ email, password, options: { data: { username } } })
     supabase.auth.signInWithPassword({ email, password })
---------------------------------------------------------------- */
const Membership = {
  live: false,
  async signUp({ username }) { await pause(650); return { ok: true, preview: true, username }; },
  async signIn() { await pause(450); return { ok: false, preview: true }; }
};
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ---------- outbound links ---------- */
document.querySelectorAll("[data-link]").forEach(el => {
  const url = (LINKS[el.dataset.link] || "").trim();
  if (!/^https?:\/\//.test(url)) return;
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener";
  a.className = "card-link"; a.textContent = el.dataset.label + " ↗";
  el.replaceWith(a);
});

/* ---------- manifesto: Part I / Part II ---------- */
(function () {
  const tabs = [...document.querySelectorAll(".part-switch [role=tab]")];
  if (!tabs.length) return;
  const wrap = document.querySelector(".part-switch-wrap");
  function show(id, opts = {}) {
    tabs.forEach(t => {
      const on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (opts.updateHash) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
    if (opts.scroll && wrap) wrap.scrollIntoView({ block: "start" });
    if (opts.focus) tabs.find(t => t.getAttribute("aria-controls") === id).focus();
  }
  const initial = location.hash === "#creating" ? "creating" : "why";
  show(initial, { scroll: initial === "creating" });
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t.getAttribute("aria-controls"), { updateHash: true }));
    t.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      show(next.getAttribute("aria-controls"), { updateHash: true, focus: true });
    });
  });
  document.querySelectorAll("[data-show-part]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      show(a.dataset.showPart, { updateHash: true, scroll: true });
    });
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#creating" || location.hash === "#why") show(location.hash.slice(1));
  });
})();

/* ---------- join: create account / sign in ---------- */
(function () {
  const joinForm = document.getElementById("form-join");
  if (!joinForm) return;

  const tabs = [...document.querySelectorAll('.join-card [role="tab"]')];
  const welcome = document.getElementById("welcome");
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    welcome.hidden = true;
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });

  document.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.toggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
      btn.setAttribute("aria-pressed", show);
    });
  });

  const pw = document.getElementById("password");
  const meter = document.getElementById("meter");
  function strength(v) {
    if (v.length < 10) return v.length ? 1 : 0;
    let s = 1;
    if (/[a-z]/i.test(v) && /\d/.test(v)) s++;
    if (/[^a-z0-9]/i.test(v) || v.length >= 14) s++;
    return Math.min(s, 3);
  }
  pw.addEventListener("input", () => { meter.dataset.level = strength(pw.value); });

  const rules = {
    username: v => /^[a-z0-9_.]{3,24}$/i.test(v) ? "" : "Use 3 to 24 letters, numbers, dots, or underscores.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter an email address like you@example.com.",
    password: v => v.length >= 10 ? "" : "Use at least 10 characters.",
    agree: (v, el) => el.checked ? "" : "Please confirm you’ll help hold the space with care."
  };
  function check(id) {
    const el = document.getElementById(id);
    const msg = rules[id](el.value.trim(), el);
    const err = document.getElementById(id + "-err");
    err.textContent = msg; err.hidden = !msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener(id === "agree" ? "change" : "blur", () => { if (el.value || id === "agree") check(id); });
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(id); });
  });

  const joinBtn = document.getElementById("join-submit");
  const joinStatus = document.getElementById("join-status");
  joinForm.addEventListener("submit", async e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      joinStatus.textContent = "A few details need another look.";
      const first = Object.keys(rules).find(id => document.getElementById(id).getAttribute("aria-invalid") === "true");
      if (first) document.getElementById(first).focus();
      return;
    }
    joinBtn.disabled = true; joinBtn.textContent = "Creating account…"; joinStatus.textContent = "";
    const username = document.getElementById("username").value.trim();
    const res = await Membership.signUp({
      username,
      email: document.getElementById("email").value.trim(),
      password: pw.value
    });
    joinBtn.disabled = false; joinBtn.textContent = "Create account";
    if (res.ok) {
      joinForm.reset(); meter.dataset.level = 0;
      joinForm.hidden = true;
      document.getElementById("welcome-title").textContent = "Welcome to the table, @" + res.username + ".";
      welcome.hidden = false; welcome.focus();
    }
  });
  document.getElementById("welcome-back").addEventListener("click", () => selectTab(tabs[0], true));

  const signinForm = document.getElementById("form-signin");
  const signinBtn = document.getElementById("signin-submit");
  signinForm.addEventListener("submit", async e => {
    e.preventDefault();
    signinBtn.disabled = true; signinBtn.textContent = "Signing in…";
    await Membership.signIn();
    signinBtn.disabled = false; signinBtn.textContent = "Sign in";
    signinForm.reset();
    document.getElementById("signin-status").textContent = "Accounts aren’t live yet. Sign-in opens when the community launches.";
  });
})();
