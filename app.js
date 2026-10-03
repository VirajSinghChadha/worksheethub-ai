(function () {
  const CFG = window.WH_CONFIG;
  const SUBJECTS = ["Mathematics", "Science", "English", "Individuals & Societies", "Spanish", "Digital Design"];
  const GRADES = ["Grade 6", "Grade 7"];
  const DIFFS = ["Easy", "Medium", "Hard", "Mixed"];
  const TYPES = ["Practice questions", "Revision worksheet", "Challenge questions", "Multiple choice", "Mixed questions", "Exam-style practice"];
  const STATUSES = ["Requested", "Being Created", "Completed"];
  const ICONS = { "Mathematics": "➗", "Science": "🔬", "English": "📖", "Individuals & Societies": "🌍", "Spanish": "🗣️", "Digital Design": "🎨", "Other": "📝" };

  // ---------- storage ----------
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast("Could not save (browser storage blocked)"); } };
  // REMOTE mode: data lives in the Google Sheet behind CFG.apiUrl. Otherwise it is demo data in localStorage.
  const REMOTE = !!CFG.apiUrl;
  const mem = { ws: [], rq: [], fb: [], st: {}, ratings: {}, loaded: false, failed: false };
  const session = { get token() { try { return sessionStorage.getItem("wh_token") || ""; } catch (e) { return ""; } }, role: "", name: "" };
  async function api(body) {
    const r = await fetch(CFG.apiUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ token: session.token }, body)) });
    return r.json();
  }
  async function loadPublic() {
    try {
      const d = await (await fetch(CFG.apiUrl + "?action=public")).json();
      mem.ws = d.worksheets; mem.st = d.stats; mem.ratings = d.ratings; mem.loaded = true; mem.failed = false;
      if (!(session.role && adminReqs)) mem.rq = d.requests;
    } catch (e) { mem.failed = true; }
  }
  let adminReqs = false;
  async function loadAdmin() {
    const d = await api({ action: "adminList" });
    if (!d.ok) { try { sessionStorage.removeItem("wh_token"); } catch (e) {} session.role = ""; adminReqs = false; return false; }
    mem.rq = d.requests; mem.fb = d.feedback; session.role = d.role; session.name = d.name; adminReqs = true; return true;
  }
  if (!REMOTE && !load("wh_init", false)) {
    const seed = CFG.showSampleData ? window.WH_SEED : { worksheets: [], requests: [] };
    save("wh_ws", seed.worksheets); save("wh_rq", seed.requests); save("wh_init", true);
  }
  const db = REMOTE ? {
    ws: () => mem.ws, rq: () => mem.rq, fb: () => mem.fb, st: () => mem.st
  } : {
    ws: () => load("wh_ws", []), rq: () => load("wh_rq", []), fb: () => load("wh_fb", []), st: () => load("wh_st", {}),
    setWs: (v) => save("wh_ws", v), setRq: (v) => save("wh_rq", v), setFb: (v) => save("wh_fb", v), setSt: (v) => save("wh_st", v)
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => new Date().toISOString().slice(0, 10);
  const bump = (id, key) => {
    const s = db.st(); s[id] = s[id] || { views: 0, downloads: 0 }; s[id][key]++;
    if (REMOTE) api({ action: "track", id, kind: key }).catch(() => {}); else db.setSt(s);
  };
  const ratingInfo = (id) => {
    if (REMOTE) { const r = mem.ratings[id || "_all"]; return r && r.n ? { avg: (r.sum / r.n).toFixed(1), n: r.n } : null; }
    const l = db.fb().filter((f) => f.rating && (!id || f.wsId === id)); return l.length ? { avg: (l.reduce((a, f) => a + f.rating, 0) / l.length).toFixed(1), n: l.length } : null;
  };
  const sendFeedback = (o) => {
    if (REMOTE) return api(Object.assign({ action: "feedback" }, o));
    const fb = db.fb(); fb.push({ id: uid(), date: today(), ...o }); db.setFb(fb); return Promise.resolve({ ok: true });
  };
  async function uploadFile(file) {
    if (!file) return null;
    if (file.size > 20 * 1024 * 1024) { toast("File too large (max 20 MB)"); return null; }
    if (!REMOTE) { toast("Uploads need the backend (set apiUrl in config.js)"); return null; }
    toast("Uploading…");
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(file); });
    const d = await api({ action: "upload", filename: file.name, mime: file.type || "application/pdf", data });
    if (!d.ok) { toast(d.error || "Upload failed"); return null; }
    toast("Uploaded ✔"); return d.url;
  }
  const pop = (w) => { const s = db.st()[w.id] || {}; return (s.views || 0) + (s.downloads || 0) * 2; };

  // ---------- helpers ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|#)/i.test(u || "") ? u : "");
  const opts = (arr, sel) => arr.map((o) => `<option ${o === sel ? "selected" : ""}>${esc(o)}</option>`).join("");
  const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  const norm = (t) => t.trim().toLowerCase().replace(/\s+/g, " ");
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  function toast(msg) {
    document.querySelectorAll(".toast").forEach((x) => x.remove());
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2400); setTimeout(() => t.remove(), 2800);
  }
  // Escape text and highlight current search terms
  const hl = (raw) => { const terms = norm(filt.q).split(" ").filter((t) => t.length > 1); if (!terms.length) return esc(raw); const re = new RegExp("(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi"); return String(raw).split(re).map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join(""); };
  const busy = (btn, label) => { btn.dataset.label = btn.dataset.label || btn.innerHTML; btn.disabled = !!label; btn.innerHTML = label ? `<span class="spin" aria-hidden="true"></span>${label}` : btn.dataset.label; };
  const statusClass = (s) => s.split(" ")[0];

  // ---------- state ----------
  const filt = { q: "", subject: "", grade: "", topic: "", diff: "", sort: "newest" };

  function wsCard(w, mark) {
    const h = mark ? hl : esc;
    const ri = ratingInfo(w.id);
    return `<article class="card">
      <div class="ws-ico" aria-hidden="true">${ICONS[w.subject] || "📝"}</div>
      <div class="tags"><span class="tag">${esc(w.subject)}</span><span class="tag grey">${esc(w.grade)}</span><span class="tag ${esc(w.difficulty)}">${esc(w.difficulty)}</span></div>
      <h3><a href="#/worksheet/${esc(w.id)}">${h(w.title)}</a></h3>
      <div class="meta">${h(w.topic)} · ${fmtDate(w.date)}${ri ? ` · ★ ${ri.avg}` : ""}${safeUrl(w.answers) ? " · Answers included" : ""}</div>
      <p class="desc">${h(w.description)}</p>
      <div class="actions">
        <a class="btn sm" href="#/worksheet/${esc(w.id)}">View</a>
        <a class="btn sm ghost" href="${esc(safeUrl(w.file))}" target="_blank" rel="noopener" data-dl="${esc(w.id)}" aria-label="Download PDF: ${esc(w.title)}">Download PDF</a>
      </div></article>`;
  }

  function topicCounts() {
    const m = {};
    db.rq().forEach((r) => {
      const k = norm(r.topic) + "|" + r.subject;
      m[k] = m[k] || { topic: r.topic.trim(), subject: r.subject, n: 0 };
      m[k].n++;
    });
    return Object.values(m).sort((a, b) => b.n - a.n);
  }
  function popularHtml(limit) {
    const t = topicCounts().slice(0, limit);
    if (!t.length) return `<div class="empty">No requests yet. Be the first to request a worksheet!</div>`;
    const max = t[0].n;
    return `<div class="pop">${t.map((x, i) => `<div class="pop-item"><span class="n">${i + 1}</span><div class="lbl"><b>${esc(x.topic)}</b><div class="meta">${esc(x.subject)}</div></div><div class="bar" aria-hidden="true"><i style="width:${(x.n / max) * 100}%"></i></div><span class="cnt">${x.n} request${x.n > 1 ? "s" : ""}</span></div>`).join("")}</div>`;
  }

  // ---------- views ----------
  const views = {
    home() {
      const latest = db.ws().slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      const nWs = db.ws().length, nRq = db.rq().length, nDone = db.rq().filter((r) => r.status === "Completed").length;
      return `
      <div class="hero"><div class="wrap">
        <span class="eyebrow">Free · Grade 6 & 7 · Checked by humans</span>
        <h1>WorksheetHub <span class="grad">AI</span></h1>
        <p class="tagline">Request it. We create it. You practise it.</p>
        <p class="desc">Free practice worksheets made by students, for students. Can't find what you need? Request it and we may create it for you.</p>
        <div class="btns"><a class="btn lg" href="#/worksheets">Browse worksheets</a><a class="btn lg ghost" href="#/request">Request a worksheet</a></div>
        <form class="bigsearch" id="heroForm" role="search"><input id="heroSearch" type="search" aria-label="Search worksheets" placeholder="Try Pythagoras, Percentages, Probability…"></form>
        ${nWs ? `<div class="hero-stats"><div><b>${nWs}</b>worksheets</div><div><b>${nRq}</b>requests</div><div><b>${nDone}</b>fulfilled</div></div>` : ""}
      </div></div>
      <section class="block"><div class="wrap"><div class="sec-head"><h2>New worksheets</h2><a href="#/worksheets">See all →</a></div>
        ${latest.length ? `<div class="grid">${latest.map((w) => wsCard(w)).join("")}</div>` : `<div class="empty"><div class="em-ico">📭</div>No worksheets yet – check back soon!</div>`}</div></section>
      <div class="wrap">${adHtml()}</div>
      <section class="block"><div class="wrap"><div class="sec-head"><h2>Most requested topics</h2><a href="#/requests">All requests →</a></div>${popularHtml(5)}</div></section>
      <section class="block"><div class="wrap"><h2 style="margin-bottom:18px">How it works</h2><div class="steps">
        <div class="step"><div class="ico">✍️</div><div class="num">Step 1</div><h3>Request</h3><p>Tell us what worksheet you need.</p></div>
        <div class="step"><div class="ico">🤖</div><div class="num">Step 2</div><h3>Create</h3><p>AI helps us draft the worksheet.</p></div>
        <div class="step"><div class="ico">✅</div><div class="num">Step 3</div><h3>Review</h3><p>A person checks every question and answer.</p></div>
        <div class="step"><div class="ico">📝</div><div class="num">Step 4</div><h3>Practise</h3><p>Download it free and get practising.</p></div>
      </div></div></section>`;
    },

    worksheets() {
      const topics = [...new Set(db.ws().map((w) => w.topic))].sort();
      return `<div class="wrap"><div class="page-head"><h1>Worksheets</h1><p class="muted">Free practice for Grade 6 and Grade 7. Every worksheet is checked before it is published.</p></div>
      <input class="bar-search" id="libSearch" type="search" aria-label="Search worksheets" placeholder="Search title, topic or description" value="${esc(filt.q)}">
      <div class="chips" role="group" aria-label="Subject">${["", ...SUBJECTS].filter((s) => !s || db.ws().some((w) => w.subject === s)).map((s) => `<button class="chip ${filt.subject === s ? "on" : ""}" data-chip="${esc(s)}" aria-pressed="${filt.subject === s}">${s ? (ICONS[s] || "") + " " + esc(s) : "All subjects"}</button>`).join("")}</div>
      <div class="filters">
        <label class="f">Grade<select data-f="grade"><option value="">All</option>${opts(GRADES, filt.grade)}</select></label>
        <label class="f">Topic<select data-f="topic"><option value="">All</option>${opts(topics, filt.topic)}</select></label>
        <label class="f">Difficulty<select data-f="diff"><option value="">All</option>${opts(DIFFS, filt.diff)}</select></label>
        <label class="f">Sort by<select data-f="sort"><option value="newest" ${filt.sort === "newest" ? "selected" : ""}>Newest</option><option value="popular" ${filt.sort === "popular" ? "selected" : ""}>Most popular</option><option value="az" ${filt.sort === "az" ? "selected" : ""}>A–Z</option><option value="rating" ${filt.sort === "rating" ? "selected" : ""}>Top rated</option></select></label>
      </div>
      <div id="results"></div>
      <div class="notice" style="margin-top:28px">Can't find what you need? <a href="#/request" data-prefill><b>Request a worksheet</b></a> and we may create it.</div></div>`;
    },

    request() {
      const prefillTopic = pendingTopic; pendingTopic = "";
      return `<div class="wrap section"><div class="page-head" style="text-align:center"><h1>Request a Worksheet</h1><p class="muted">Tell us what you need help with. Your name is only seen by the admins, never shown publicly.</p></div>
      <form class="form" id="reqForm">
        <div class="row">
          <label class="f">Subject<select name="subject" required><option value="">Choose…</option>${opts([...SUBJECTS, "Other"])}</select></label>
          <label class="f">Grade<select name="grade" required><option value="">Choose…</option>${opts(GRADES)}</select></label>
        </div>
        <label class="f">Your full name<input type="text" name="fullName" required maxlength="80" autocomplete="name" placeholder="e.g. Alex Smith">
          <span class="meta" style="font-weight:400">🔒 Your name is private. It is only seen by the website admins and is never shown publicly.</span></label>
        <label class="f">Topic<input type="text" name="topic" required maxlength="80" list="topicList" value="${esc(prefillTopic)}" placeholder="e.g. Fractions, Photosynthesis, Creative writing"><datalist id="topicList">${[...new Set(db.ws().map((w) => w.topic).concat(db.rq().map((r) => r.topic)))].map((t) => `<option value="${esc(t)}">`).join("")}</datalist><span class="hint" id="dupHint"></span></label>
        <div class="row">
          <label class="f">Difficulty<select name="difficulty" required>${opts(DIFFS, "Medium")}</select></label>
          <label class="f">What type of worksheet would you like?<select name="type" required>${opts(TYPES)}</select></label>
        </div>
        <label class="f">Additional information (optional)<textarea name="info" maxlength="600" data-count placeholder="e.g. I understand basic fractions but I need more practice adding fractions with different denominators."></textarea></label>
        <button class="btn lg" type="submit">Submit request</button>
      </form></div>`;
    },

    confirmed() {
      return `<div class="wrap section" style="padding:40px 20px"><div class="confirm"><div class="big" aria-hidden="true">✓</div><h1>Request received</h1>
      <p>Thank you for requesting a worksheet. Your request will be reviewed and may be added to WorksheetHub.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" href="#/requests">See requests</a><a class="btn ghost" href="#/worksheets">Browse worksheets</a></div></div></div>`;
    },

    requests() {
      const rq = db.rq().slice().sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="wrap"><div class="page-head"><h1>Requested Worksheets</h1><p class="muted">See what other students asked for. Names and personal details are never shown.</p></div>
      <h2>Most Requested Topics</h2>${popularHtml(8)}
      <h2 style="margin-top:32px">All Requests</h2>
      ${rq.length ? `<div class="tablewrap"><table><tr><th>Topic</th><th>Subject</th><th>Grade</th><th>Status</th><th></th></tr>
      ${rq.map((r) => `<tr><td><b>${esc(r.topic)}</b></td><td>${esc(r.subject)}</td><td>${esc(r.grade)}</td><td><span class="tag ${statusClass(r.status)}">${esc(r.status)}</span></td>
      <td>${r.status === "Completed" && safeUrl(r.link) ? `<a class="btn sm" href="${esc(safeUrl(r.link))}" ${r.link.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>View Worksheet</a>` : ""}</td></tr>`).join("")}</table></div>` : `<div class="empty">No requests yet.</div>`}</div>`;
    },

    about() {
      return `<div class="wrap" style="max-width:800px"><div class="page-head"><h1>About WorksheetHub AI</h1></div>
      <div class="card" style="gap:14px">
        <p>WorksheetHub AI is a student-created <b>Service as Action</b> project. Our goal is to provide younger students with free, targeted learning resources by letting them request worksheets on the topics they need extra support with.</p>
        <h3>How AI is used – responsibly</h3>
        <p>This website has no chatbot. AI is only used <b>behind the scenes</b> by the website creator to help draft questions, answer keys, different difficulty levels, challenge questions and practice activities.</p>
        <p><b>Every worksheet is reviewed, corrected and improved by the creator before it is published.</b> If you spot a mistake, please tell us on the <a href="#/feedback">Feedback</a> page.</p>
        <h3>How requests work</h3>
        <p>Requests are reviewed by the creator. We can't promise every request will be made, but popular topics are created first, so requesting a topic that others also need helps.</p>
        <h3>Continuous improvement</h3>
        <p>Ratings and feedback are used to improve existing worksheets and decide what to create next.</p>
      </div></div>`;
    },

    feedback() {
      const ri = ratingInfo(); const avg = ri ? ri.avg : "–";
      return `<div class="wrap"><div class="page-head" style="text-align:center"><h1>Feedback</h1><p class="muted">Tell us how to make WorksheetHub better. Average worksheet rating so far: <b>${avg} ⭐</b></p></div>
      <form class="form" id="genFb">
        <label class="f">Your feedback<textarea name="text" required maxlength="800" data-count placeholder="What do you like? What could be better? Found a mistake?"></textarea></label>
        <button class="btn" type="submit">Send Feedback</button>
      </form></div>`;
    },

    worksheet(id) {
      const w = db.ws().find((x) => x.id === id);
      if (!w) return `<div class="wrap"><div class="empty" style="margin-top:40px">Worksheet not found. <a href="#/worksheets">Back to worksheets</a></div></div>`;
      bump(w.id, "views");
      const ri = ratingInfo(w.id); const avg = ri && ri.avg; const fbs = { length: ri ? ri.n : 0 };
      return `<div class="wrap" style="max-width:800px"><div class="page-head"><a class="crumb" href="#/worksheets">← All worksheets</a>
      <div class="tags"><span class="tag">${ICONS[w.subject] || "📝"} ${esc(w.subject)}</span><span class="tag grey">${esc(w.grade)}</span><span class="tag ${esc(w.difficulty)}">${esc(w.difficulty)}</span></div>
      <h1 style="margin-top:10px">${esc(w.title)}</h1>
      <div class="meta">Topic: <b>${esc(w.topic)}</b> · Uploaded ${fmtDate(w.date)}${avg ? ` · ⭐ ${avg} (${fbs.length})` : ""}</div></div>
      <div class="card" style="gap:16px"><p>${esc(w.description)}</p>
        <div class="actions"><a class="btn" href="${esc(safeUrl(w.file))}" target="_blank" rel="noopener" data-dl="${esc(w.id)}">Download PDF</a>
        ${safeUrl(w.answers) ? `<a class="btn ghost" href="${esc(safeUrl(w.answers))}" target="_blank" rel="noopener">Answer sheet</a>` : ""}
        <button class="btn plain" id="shareBtn">Share</button></div>
        <div class="notice ok">✅ This worksheet was created with AI assistance and checked by the website creator before publication.</div></div>
      ${adHtml()}
      <div class="card" style="margin-top:20px;gap:16px" id="fbBox"><h3>Was this worksheet helpful?</h3>
        <div class="thumbs"><button class="btn ghost" data-help="1">👍 Yes</button><button class="btn ghost" data-help="0">👎 No</button></div>
        <div><b>Rate it</b><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((n) => `<button data-star="${n}" aria-label="${n} stars">★</button>`).join("")}</div></div>
        <label class="f">What could make this worksheet better? (optional)<textarea id="fbText" maxlength="600" data-count></textarea></label>
        <button class="btn" id="fbSend">Send feedback</button></div>
      ${related(w)}</div>`;
    },

    admin() {
      if (REMOTE ? !session.role : sessionStorage.getItem("wh_admin") !== "1") {
        return `<div class="wrap"><form class="form" id="loginForm" style="margin-top:40px;max-width:420px"><h2>🔒 Admin / contributor login</h2>
        <label class="f">${REMOTE ? "Access token (from the Users sheet)" : "Password"}<input type="password" name="pw" required autofocus autocomplete="off"></label><button class="btn">Log in</button>
        <p class="meta">${REMOTE ? "Only people listed in the Users sheet can log in." : "Demo mode: no backend connected, so this is only a simple gate. See README."}</p></form></div>`;
      }
      const tab = adminTab;
      const tabs = ["Impact", "Requests", "Add Worksheet", "Manage Worksheets", "Data"];
      return `<div class="wrap"><div class="page-head"><h1>Admin Dashboard</h1>${REMOTE ? `<p class="muted">Signed in as <b>${esc(session.name)}</b> (${esc(session.role)}). <a href="${esc(CFG.sheetUrl || "https://docs.google.com/spreadsheets")}" target="_blank" rel="noopener">Open the Google Sheet ↗</a></p>` : ""}</div>
      <div class="tabs">${tabs.map((t) => `<button class="${t === tab ? "on" : ""}" data-tab="${t}">${t}</button>`).join("")}<button data-tab="__logout" style="margin-left:auto">Log out</button></div>
      <div id="adminBody">${adminViews[tab]()}</div></div>`;
    }
  };
  let adminTab = "Impact";

  const adminViews = {
    Impact() {
      const ws = db.ws(), rq = db.rq(), st = db.st(), fb = db.fb();
      const views_ = Object.values(st).reduce((a, s) => a + (s.views || 0), 0);
      const dls = Object.values(st).reduce((a, s) => a + (s.downloads || 0), 0);
      const rated = fb.filter((f) => f.rating && f.wsId);
      const avg = rated.length ? (rated.reduce((a, f) => a + f.rating, 0) / rated.length).toFixed(1) : "–";
      const helpful = fb.filter((f) => f.helpful === true).length, unhelpful = fb.filter((f) => f.helpful === false).length;
      const subj = {}; rq.forEach((r) => (subj[r.subject] = (subj[r.subject] || 0) + 1));
      const subjList = Object.entries(subj).sort((a, b) => b[1] - a[1]);
      const done = rq.filter((r) => r.status === "Completed").length;
      const texts = fb.filter((f) => f.text).slice().reverse().slice(0, 15);
      return `<div class="stats">
        <div class="stat"><b>${ws.length}</b>Worksheets created</div><div class="stat"><b>${rq.length}</b>Requests received</div>
        <div class="stat"><b>${done}</b>Requests completed</div><div class="stat"><b>${views_}</b>Worksheet views</div>
        <div class="stat"><b>${dls}</b>Downloads</div><div class="stat"><b>${avg}</b>Average rating (${rated.length})</div>
        <div class="stat"><b>${helpful} / ${unhelpful}</b>👍 / 👎 votes</div></div>
      <h2>Most requested subjects</h2>${subjList.length ? `<div class="pop">${subjList.map(([s, n]) => `<div class="pop-item"><b style="min-width:190px">${ICONS[s] || ""} ${esc(s)}</b><div class="bar"><i style="width:${(n / subjList[0][1]) * 100}%"></i></div><b>${n}</b></div>`).join("")}</div>` : '<div class="empty">No data yet</div>'}
      <h2 style="margin-top:28px">Create these first (most requested topics)</h2>${popularHtml(10)}
      <h2 style="margin-top:28px">Student feedback</h2>${texts.length ? `<div class="pop">${texts.map((f) => { const w = db.ws().find((x) => x.id === f.wsId); return `<div class="pop-item" style="display:block"><div class="meta">${w ? esc(w.title) : "General"} · ${fmtDate(f.date)}${f.rating ? " · " + "★".repeat(f.rating) : ""}</div>${esc(f.text)}</div>`; }).join("")}</div>` : '<div class="empty">No written feedback yet</div>'}`;
    },
    Requests() {
      const rq = db.rq().slice().sort((a, b) => b.date.localeCompare(a.date));
      if (!rq.length) return `<div class="empty">No requests yet.</div>`;
      return `<div class="tablewrap"><table><tr><th>Date</th><th>Student</th><th>Subject</th><th>Grade</th><th>Topic</th><th>Difficulty</th><th>Type</th><th>Additional info</th><th>Status</th><th>GitHub worksheet link</th><th></th></tr>
      ${rq.map((r) => `<tr data-rid="${esc(r.id)}"><td>${fmtDate(r.date)}</td><td>${esc(r.fullName) || "<span class='muted'>–</span>"}</td><td>${esc(r.subject)}</td><td>${esc(r.grade)}</td><td><b>${esc(r.topic)}</b></td><td>${esc(r.difficulty)}</td><td>${esc(r.type)}</td><td style="max-width:240px">${esc(r.info) || "<span class='muted'>–</span>"}</td>
      <td><select data-status>${opts(STATUSES, r.status)}</select></td><td><input type="url" data-link placeholder="https://github.com/… or upload →" value="${esc(r.link)}">${REMOTE ? `<input type="file" data-up accept=".pdf,.doc,.docx,.png,.jpg" style="margin-top:6px">` : ""}</td>
      <td style="white-space:nowrap"><button class="btn sm" data-save>Save</button> ${!REMOTE || session.role === "admin" ? `<button class="btn sm danger" data-delreq>✕</button>` : ""}</td></tr>`).join("")}</table></div>
      <p class="meta">Tip: choose a finished PDF in the row's upload box (it fills the link), set the status to Completed, then Save. To show it in the library, also add it under "Add Worksheet".</p>`;
    },
    "Add Worksheet"() {
      return `<form class="form" id="addForm" style="margin:0"><h2>Add a worksheet</h2>
      <label class="f">Worksheet title<input type="text" name="title" required></label>
      <div class="row"><label class="f">Subject<select name="subject">${opts(SUBJECTS)}</select></label><label class="f">Grade<select name="grade">${opts(GRADES)}</select></label></div>
      <div class="row"><label class="f">Topic<input type="text" name="topic" required></label><label class="f">Difficulty<select name="difficulty">${opts(DIFFS, "Medium")}</select></label></div>
      <label class="f">Description<textarea name="description" required></textarea></label>
      <label class="f">GitHub PDF/file link${REMOTE ? " (or upload a file below to fill this in)" : ""}<input type="url" name="file" required placeholder="https://github.com/you/repo/blob/main/worksheets/math/grade6/fractions.pdf"></label>
      ${REMOTE ? `<label class="f">Upload worksheet file<input type="file" data-upf accept=".pdf,.doc,.docx"></label>` : ""}
      <label class="f">Answer sheet link (optional)<input type="url" name="answers"></label>
      ${REMOTE ? `<label class="f">Upload answer sheet<input type="file" data-upa accept=".pdf,.doc,.docx"></label>` : ""}
      <label class="f" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" name="reviewed" required style="width:auto"> I have reviewed this worksheet and checked the answers</label>
      <button class="btn">Publish worksheet</button></form>`;
    },
    "Manage Worksheets"() {
      const ws = db.ws().slice().sort((a, b) => b.date.localeCompare(a.date)); const st = db.st();
      if (!ws.length) return `<div class="empty">No worksheets yet.</div>`;
      return `<div class="tablewrap"><table><tr><th>ID</th><th>Title</th><th>Subject</th><th>Grade</th><th>Views</th><th>Downloads</th><th></th></tr>
      ${ws.map((w) => `<tr><td><code>${esc(w.id)}</code></td><td>${esc(w.title)}</td><td>${esc(w.subject)}</td><td>${esc(w.grade)}</td><td>${(st[w.id] || {}).views || 0}</td><td>${(st[w.id] || {}).downloads || 0}</td>
      <td>${!REMOTE || session.role === "admin" ? `<button class="btn sm danger" data-delws="${esc(w.id)}">Delete</button>` : ""}</td></tr>`).join("")}</table></div>`;
    },
    Data() {
      if (REMOTE) return `<div class="card" style="gap:14px"><h2>Your data</h2><p>Everything lives in your Google Sheet (tabs: Requests, Worksheets, Feedback, Users). Edit it directly there. To get an Excel copy: File → Download → Microsoft Excel (.xlsx). To add a contributor, add a row in the <b>Users</b> sheet with a name, a long random token and the role <code>contributor</code>.</p>
      <div class="actions"><a class="btn" href="${esc(CFG.sheetUrl || "https://docs.google.com/spreadsheets")}" target="_blank" rel="noopener">Open Google Sheet ↗</a></div></div>`;
      return `<div class="card" style="gap:14px"><h2>Backup & GitHub export</h2>
      <p>Data on this site is stored in this browser. Use these buttons to keep a copy (and commit <code>worksheets.json</code> to GitHub for your records).</p>
      <div class="actions"><button class="btn" data-export="ws">Export worksheets.json</button><button class="btn" data-export="rq">Export requests.json</button><button class="btn ghost" data-export="fb">Export feedback.json</button></div>
      <hr style="width:100%;border:0;border-top:1px solid var(--grey-d)"><button class="btn danger" id="wipe">Delete ALL data in this browser</button></div>`;
    }
  };

  // ---------- results renderer ----------
  function renderResults() {
    const box = $("#results"); if (!box) return;
    const q = norm(filt.q);
    let list = db.ws().filter((w) =>
      (!filt.subject || w.subject === filt.subject) && (!filt.grade || w.grade === filt.grade) &&
      (!filt.topic || w.topic === filt.topic) && (!filt.diff || w.difficulty === filt.diff) &&
      (!q || q.split(" ").every((t) => (w.title + " " + w.topic + " " + w.subject + " " + w.description + " " + w.grade).toLowerCase().includes(t))));
    const rat = (w) => { const r = ratingInfo(w.id); return r ? +r.avg : 0; };
    const sorters = { popular: (a, b) => pop(b) - pop(a), az: (a, b) => a.title.localeCompare(b.title), rating: (a, b) => rat(b) - rat(a), newest: (a, b) => b.date.localeCompare(a.date) };
    list.sort(sorters[filt.sort] || sorters.newest);
    const active = filt.q || filt.subject || filt.grade || filt.topic || filt.diff;
    const bar = `<div class="results-bar"><span class="meta">${list.length} worksheet${list.length === 1 ? "" : "s"}</span>${active ? `<button class="btn sm plain" id="clearF">Clear filters</button>` : ""}</div>`;
    box.innerHTML = list.length ? `${bar}<div class="grid">${list.map((w) => wsCard(w, true)).join("")}</div>`
      : `${bar}<div class="empty"><div class="em-ico">🔎</div><p>No worksheets match${filt.q ? ` “${esc(filt.q)}”` : ""}.</p><a class="btn" href="#/request" data-prefill>Request this worksheet</a></div>`;
    const c = $("#clearF", box); if (c) c.addEventListener("click", () => { Object.assign(filt, { q: "", subject: "", grade: "", topic: "", diff: "" }); $("#navSearch").value = ""; render(); });
    announce(`${list.length} worksheet${list.length === 1 ? "" : "s"} found`);
  }

  function related(w) {
    const r = db.ws().filter((x) => x.id !== w.id && (x.topic === w.topic || (x.subject === w.subject && x.grade === w.grade))).slice(0, 3);
    return r.length ? `<h2 style="margin-top:40px">More like this</h2><div class="grid">${r.map((x) => wsCard(x)).join("")}</div>` : "";
  }
  // In-content A-ADS slot (same unit #2457354 as the footer banner)
  const adHtml = () => `<aside class="ad-slot" style="padding:0;margin:28px auto" aria-label="Advertisement"><span class="ad-label">Advertisement</span><div class="ad-box"><iframe data-aa="2457354" src="//acceptable.a-ads.com/2457354/?size=Adaptive" title="Advertisement" loading="lazy"></iframe></div></aside>`;
  const announce = (m) => { const l = $("#live"); if (l) l.textContent = m; };
  let pendingTopic = "";
  const TITLES = { home: "", worksheets: "Worksheets", request: "Request a worksheet", requests: "Requests", about: "About", feedback: "Feedback", admin: "Admin", confirmed: "Request received" };

  // ---------- router ----------
  function render() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [name, arg] = hash.split("/");
    const route = name || "home";
    let html;
    if (route === "worksheet") html = views.worksheet(arg);
    else if (views[route] && route !== "confirmed") html = views[route]();
    else if (route === "confirmed") html = views.confirmed();
    else html = views.home();
    app.innerHTML = html; window.scrollTo(0, 0);
    const wsT = route === "worksheet" && (db.ws().find((x) => x.id === arg) || {}).title;
    document.title = (wsT || TITLES[route] ? (wsT || TITLES[route]) + " – " : "") + "WorksheetHub AI – Free student worksheets";
    $("body > .ad-slot").hidden = route === "admin";
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.r === (route === "worksheet" ? "worksheets" : route === "confirmed" ? "request" : route)));
    $("#menu").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false");
    bind(route, arg);
    document.querySelectorAll("textarea[data-count]").forEach((t) => {
      const c = document.createElement("span"); c.className = "counter"; t.after(c);
      const u = () => (c.textContent = `${t.value.length} / ${t.maxLength}`); t.addEventListener("input", u); u();
    });
  }

  function bind(route, arg) {
    if (route === "home") $("#heroForm").addEventListener("submit", (e) => { e.preventDefault(); goSearch($("#heroSearch").value); });
    if (route === "worksheets") {
      renderResults();
      $("#libSearch").addEventListener("input", (e) => { filt.q = e.target.value; $("#navSearch").value = filt.q; renderResults(); });
      document.querySelectorAll("[data-f]").forEach((s) => s.addEventListener("change", () => { filt[s.dataset.f] = s.value; s.dataset.f === "subject" ? render() : renderResults(); }));
      document.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => { filt.subject = b.dataset.chip; render(); }));
    }
    if (route === "request") {
      const ti = $("#reqForm [name=topic]"), hint = $("#dupHint");
      const check = () => {
        const t = norm(ti.value); if (t.length < 3) return (hint.innerHTML = "");
        const ws = db.ws().find((w) => norm(w.topic).includes(t) || norm(w.title).includes(t));
        const n = db.rq().filter((r) => norm(r.topic) === t).length;
        hint.innerHTML = ws ? `💡 We already have <a href="#/worksheet/${esc(ws.id)}">${esc(ws.title)}</a>` : n ? `${n} other student${n > 1 ? "s have" : " has"} asked for this – your request helps it get made sooner.` : "";
      };
      ti.addEventListener("input", check); check();
    }
    if (route === "request") $("#reqForm").addEventListener("submit", (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      const row = { fullName: d.fullName.trim(), subject: d.subject, grade: d.grade, topic: d.topic.trim(), difficulty: d.difficulty, type: d.type, info: (d.info || "").trim() };
      if (REMOTE) {
        const btn = $("button[type=submit]", e.target); busy(btn, "Sending…");
        api(Object.assign({ action: "request" }, row)).then((r) => { if (!r.ok) throw new Error(r.error); return loadPublic(); }).then(() => (location.hash = "#/confirmed"))
          .catch(() => { busy(btn); toast("Could not send. Please try again."); });
        return;
      }
      const rq = db.rq(); rq.push(Object.assign({ id: uid(), date: today(), status: "Requested", link: "" }, row));
      db.setRq(rq); location.hash = "#/confirmed";
    });
    if (route === "feedback") $("#genFb").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target, btn = $("button", f); busy(btn, "Sending…");
      sendFeedback({ wsId: null, text: new FormData(f).get("text").trim() }).then((r) => { if (r && r.ok === false) throw 0; f.reset(); f.querySelector("textarea").dispatchEvent(new Event("input")); toast("Thank you for your feedback!"); }).catch(() => toast("Could not send. Please try again.")).finally(() => busy(btn));
    });
    if (route === "worksheet") bindFeedback(arg);
    if (route === "admin") bindAdmin();
  }

  function bindFeedback(id) {
    let helpful = null, rating = 0;
    const box = $("#fbBox");
    box.querySelectorAll("[data-help]").forEach((b) => b.addEventListener("click", () => { helpful = b.dataset.help === "1"; box.querySelectorAll("[data-help]").forEach((x) => x.classList.toggle("sel", x === b)); }));
    box.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => { rating = +b.dataset.star; box.querySelectorAll("[data-star]").forEach((x) => x.classList.toggle("on", +x.dataset.star <= rating)); }));
    box.querySelectorAll("[data-star]").forEach((b) => b.setAttribute("aria-label", `${b.dataset.star} star${b.dataset.star > 1 ? "s" : ""}`));
    const sh = $("#shareBtn");
    if (sh) sh.addEventListener("click", async () => {
      const url = location.href;
      try { if (navigator.share) await navigator.share({ title: document.title, url }); else { await navigator.clipboard.writeText(url); toast("Link copied"); } } catch (e) {}
    });
    $("#fbSend").addEventListener("click", () => {
      const text = $("#fbText").value.trim(), btn = $("#fbSend");
      if (helpful === null && !rating && !text) return toast("Pick a rating, 👍/👎 or write something first");
      busy(btn, "Sending…");
      sendFeedback({ wsId: id, helpful, rating, text }).then((r) => { if (r && r.ok === false) throw 0; box.innerHTML = `<h3>Thank you! 🎉</h3><p>Your feedback helps us improve future worksheets.</p>`; }).catch(() => { busy(btn); toast("Could not send. Please try again."); });
    });
  }

  async function refresh() { await loadPublic(); if (REMOTE && session.role) await loadAdmin(); render(); }
  const guard = (fn) => async (...a) => { try { await fn(...a); } catch (e) { toast("Something went wrong. Check your connection and try again."); } };

  function bindAdmin() {
    const lf = $("#loginForm");
    if (lf) return lf.addEventListener("submit", guard(async (e) => {
      e.preventDefault(); const pw = new FormData(lf).get("pw");
      if (REMOTE) {
        try { sessionStorage.setItem("wh_token", pw); } catch (x) {}
        if (await loadAdmin()) render(); else toast("Invalid token");
      } else if (pw === CFG.adminPassword) { sessionStorage.setItem("wh_admin", "1"); render(); } else toast("Wrong password");
    }));
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.tab === "__logout") { sessionStorage.removeItem("wh_admin"); sessionStorage.removeItem("wh_token"); session.role = ""; adminReqs = false; return REMOTE ? refresh() : render(); }
      adminTab = b.dataset.tab; render();
    }));
    document.querySelectorAll("[data-rid]").forEach((tr) => {
      const id = tr.dataset.rid;
      const up = $("[data-up]", tr);
      if (up) up.addEventListener("change", guard(async () => { const u = await uploadFile(up.files[0]); if (u) { $("[data-link]", tr).value = u; $("[data-status]", tr).value = "Completed"; toast("Uploaded – press Save to finish"); } }));
      $("[data-save]", tr).addEventListener("click", guard(async () => {
        const status = $("[data-status]", tr).value, link = $("[data-link]", tr).value.trim();
        if (status === "Completed" && !safeUrl(link)) return toast("Add the worksheet link before marking Completed");
        if (REMOTE) { const r = await api({ action: "updateRequest", id, status, link }); if (!r.ok) return toast(r.error); toast("Saved"); return refresh(); }
        const rq = db.rq(); const r = rq.find((x) => x.id === id); r.status = status; r.link = link; db.setRq(rq); toast("Saved");
      }));
      const del = $("[data-delreq]", tr);
      if (del) del.addEventListener("click", guard(async () => {
        if (!confirm("Delete this request?")) return;
        if (REMOTE) { const r = await api({ action: "deleteRequest", id }); if (!r.ok) return toast(r.error); return refresh(); }
        db.setRq(db.rq().filter((x) => x.id !== id)); render();
      }));
    });
    const af = $("#addForm");
    if (af) {
      const fill = (sel, name) => { const i = $(sel, af); if (i) i.addEventListener("change", guard(async () => { const u = await uploadFile(i.files[0]); if (u) af.elements[name].value = u; })); };
      fill("[data-upf]", "file"); fill("[data-upa]", "answers");
      af.addEventListener("submit", guard(async (e) => {
        e.preventDefault(); const d = Object.fromEntries(new FormData(af));
        const w = { title: d.title.trim(), subject: d.subject, grade: d.grade, topic: d.topic.trim(), difficulty: d.difficulty, description: d.description.trim(), file: d.file.trim(), answers: (d.answers || "").trim() };
        if (REMOTE) { const r = await api(Object.assign({ action: "addWorksheet" }, w)); if (!r.ok) return toast(r.error); toast("Published! ID: " + r.id); adminTab = "Manage Worksheets"; return refresh(); }
        const ws = db.ws(); const id = uid(); ws.push(Object.assign({ id, date: today() }, w));
        db.setWs(ws); toast("Published! ID: " + id); adminTab = "Manage Worksheets"; render();
      }));
    }
    document.querySelectorAll("[data-delws]").forEach((b) => b.addEventListener("click", guard(async () => {
      if (!confirm("Delete this worksheet from the site?")) return;
      if (REMOTE) { const r = await api({ action: "deleteWorksheet", id: b.dataset.delws }); if (!r.ok) return toast(r.error); return refresh(); }
      db.setWs(db.ws().filter((w) => w.id !== b.dataset.delws)); render();
    })));
    document.querySelectorAll("[data-export]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.export, data = db[k](); const name = { ws: "worksheets", rq: "requests", fb: "feedback" }[k] + ".json";
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); a.download = name; a.click();
    }));
    const wipe = $("#wipe"); if (wipe) wipe.addEventListener("click", () => { if (confirm("This deletes all worksheets, requests and feedback stored in this browser. Continue?")) { ["wh_ws", "wh_rq", "wh_fb", "wh_st", "wh_init"].forEach((k) => localStorage.removeItem(k)); location.reload(); } });
  }

  function goSearch(q) { filt.q = q; $("#navSearch").value = q; if (location.hash === "#/worksheets") render(); else location.hash = "#/worksheets"; }

  // ---------- global ----------
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-dl]"); if (a) bump(a.dataset.dl, "downloads");
    if (e.target.closest("[data-prefill]")) pendingTopic = filt.q.trim();
  });
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) { e.preventDefault(); ($("#libSearch") || $("#navSearch")).focus(); }
    if (e.key === "Escape") { $("#menu").classList.remove("open"); $("#burger").setAttribute("aria-expanded", "false"); if (typing) document.activeElement.blur(); }
  });
  const tt = $("#toTop");
  window.addEventListener("scroll", () => tt.classList.toggle("show", scrollY > 700), { passive: true });
  tt.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  $("#navSearch").addEventListener("input", (e) => {
    filt.q = e.target.value;
    if (location.hash === "#/worksheets") { const l = $("#libSearch"); if (l) l.value = filt.q; renderResults(); } else if (filt.q.trim()) location.hash = "#/worksheets";
  });
  $("#burger").addEventListener("click", () => { const o = $("#menu").classList.toggle("open"); $("#burger").setAttribute("aria-expanded", String(o)); });
  window.addEventListener("hashchange", render);
  if (REMOTE) {
    app.innerHTML = `<div class="wrap" aria-busy="true"><div class="page-head"><div class="skel" style="height:44px;width:50%"></div></div><div class="grid">${'<div class="skel skel-card"></div>'.repeat(6)}</div></div>`;
    (async () => {
      await loadPublic();
      if (session.token) await loadAdmin();
      if (mem.failed) toast("Could not reach the server. Please refresh to try again.");
      render();
    })();
  } else render();
})();
