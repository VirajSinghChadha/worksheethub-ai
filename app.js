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
  if (!load("wh_init", false)) {
    const seed = CFG.showSampleData ? window.WH_SEED : { worksheets: [], requests: [] };
    save("wh_ws", seed.worksheets); save("wh_rq", seed.requests); save("wh_init", true);
  }
  const db = {
    ws: () => load("wh_ws", []), rq: () => load("wh_rq", []), fb: () => load("wh_fb", []), st: () => load("wh_st", {}),
    setWs: (v) => save("wh_ws", v), setRq: (v) => save("wh_rq", v), setFb: (v) => save("wh_fb", v), setSt: (v) => save("wh_st", v)
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => new Date().toISOString().slice(0, 10);
  const bump = (id, key) => { const s = db.st(); s[id] = s[id] || { views: 0, downloads: 0 }; s[id][key]++; db.setSt(s); };
  const pop = (w) => { const s = db.st()[w.id] || {}; return (s.views || 0) + (s.downloads || 0) * 2; };

  // ---------- helpers ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|#)/i.test(u || "") ? u : "");
  const opts = (arr, sel) => arr.map((o) => `<option ${o === sel ? "selected" : ""}>${esc(o)}</option>`).join("");
  const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  const norm = (t) => t.trim().toLowerCase().replace(/\s+/g, " ");
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
  const statusClass = (s) => s.split(" ")[0];

  // ---------- state ----------
  const filt = { q: "", subject: "", grade: "", topic: "", diff: "", sort: "newest" };

  function wsCard(w) {
    return `<article class="card">
      <div class="tags"><span class="tag">${ICONS[w.subject] || "📝"} ${esc(w.subject)}</span><span class="tag grey">${esc(w.grade)}</span><span class="tag ${esc(w.difficulty)}">${esc(w.difficulty)}</span></div>
      <h3>${esc(w.title)}</h3>
      <div class="meta">Topic: <b>${esc(w.topic)}</b> · Uploaded ${fmtDate(w.date)}</div>
      <p class="desc">${esc(w.description)}</p>
      <div class="actions">
        <a class="btn sm" href="#/worksheet/${esc(w.id)}">View Worksheet</a>
        <a class="btn sm ghost" href="${esc(safeUrl(w.file))}" target="_blank" rel="noopener" data-dl="${esc(w.id)}">⬇ Download PDF</a>
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
    return `<div class="pop">${t.map((x, i) => `<div class="pop-item"><span class="n">${i + 1}</span><div><b>${esc(x.topic)}</b> <span class="meta">${esc(x.subject)}</span></div><div class="bar"><i style="width:${(x.n / max) * 100}%"></i></div><b>${x.n} request${x.n > 1 ? "s" : ""}</b></div>`).join("")}</div>`;
  }

  // ---------- views ----------
  const views = {
    home() {
      const latest = db.ws().slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      return `
      <div class="hero"><div class="wrap">
        <h1>WorksheetHub AI</h1>
        <p class="tag" style="font-size:1.5rem">Request it. We create it. You practise it.</p>
        <p class="desc">WorksheetHub AI is a student-created platform providing free practice worksheets for younger students. Can't find the worksheet you need? Request one and we may create it for you.</p>
        <div class="btns"><a class="btn lg" href="#/worksheets">Browse Worksheets</a><a class="btn lg ghost" href="#/request">Request a Worksheet</a></div>
        <div class="bigsearch"><input id="heroSearch" type="search" placeholder="🔍 Search e.g. Pythagoras, Cells, Fractions…"></div>
      </div></div>
      <section class="block"><div class="wrap"><h2>New Worksheets</h2>
        ${latest.length ? `<div class="grid">${latest.map(wsCard).join("")}</div>` : `<div class="empty">No worksheets yet – check back soon!</div>`}
        <p style="margin-top:18px"><a href="#/worksheets">See all worksheets →</a></p></div></section>
      <section class="block"><div class="wrap"><h2>Most Requested Topics</h2>${popularHtml(5)}</div></section>
      <section class="block"><div class="wrap"><h2>How It Works</h2><div class="steps">
        <div class="step"><div class="num">1</div><div class="ico">✍️</div><h3>Request</h3><p>Tell us what worksheet you need.</p></div>
        <div class="step"><div class="num">2</div><div class="ico">🤖</div><h3>Create</h3><p>AI helps us create the worksheet.</p></div>
        <div class="step"><div class="num">3</div><div class="ico">✅</div><h3>Review</h3><p>The worksheet is checked before publication.</p></div>
        <div class="step"><div class="num">4</div><div class="ico">📝</div><h3>Practise</h3><p>The worksheet is uploaded for students to use.</p></div>
      </div></div></section>`;
    },

    worksheets() {
      const topics = [...new Set(db.ws().map((w) => w.topic))].sort();
      return `<div class="wrap"><div class="page-head"><h1>Worksheets</h1><p class="muted">Free practice for Grade 6 and Grade 7. Every worksheet is checked before it is published.</p></div>
      <input class="bar-search" id="libSearch" type="search" placeholder="🔍 Search worksheets… (Pythagoras, Cells, Fractions, Population)" value="${esc(filt.q)}">
      <div class="filters">
        <label class="f">Subject<select data-f="subject"><option value="">All</option>${opts(SUBJECTS, filt.subject)}</select></label>
        <label class="f">Grade<select data-f="grade"><option value="">All</option>${opts(GRADES, filt.grade)}</select></label>
        <label class="f">Topic<select data-f="topic"><option value="">All</option>${opts(topics, filt.topic)}</select></label>
        <label class="f">Difficulty<select data-f="diff"><option value="">All</option>${opts(DIFFS, filt.diff)}</select></label>
        <label class="f">Sort by<select data-f="sort"><option value="newest" ${filt.sort === "newest" ? "selected" : ""}>Newest</option><option value="popular" ${filt.sort === "popular" ? "selected" : ""}>Most popular</option></select></label>
      </div>
      <div id="results"></div>
      <div class="notice" style="margin-top:28px">Can't find what you need? <a href="#/request"><b>Request a worksheet</b></a> and we may create it.</div></div>`;
    },

    request() {
      return `<div class="wrap section"><div class="page-head" style="text-align:center"><h1>Request a Worksheet</h1><p class="muted">Tell us what you need help with. Please don't include your name or personal details.</p></div>
      <form class="form" id="reqForm">
        <div class="row">
          <label class="f">Subject<select name="subject" required><option value="">Choose…</option>${opts([...SUBJECTS, "Other"])}</select></label>
          <label class="f">Grade<select name="grade" required><option value="">Choose…</option>${opts(GRADES)}</select></label>
        </div>
        <label class="f">Topic<input type="text" name="topic" required maxlength="80" placeholder="e.g. Fractions, Photosynthesis, Creative writing"></label>
        <div class="row">
          <label class="f">Difficulty<select name="difficulty" required>${opts(DIFFS, "Medium")}</select></label>
          <label class="f">What type of worksheet would you like?<select name="type" required>${opts(TYPES)}</select></label>
        </div>
        <label class="f">Additional information (optional)<textarea name="info" maxlength="600" placeholder="e.g. I understand basic fractions but I need more practice adding fractions with different denominators."></textarea></label>
        <button class="btn lg" type="submit">Submit Request</button>
      </form></div>`;
    },

    confirmed() {
      return `<div class="wrap section" style="padding:40px 20px"><div class="confirm"><div class="big">🎉</div><h1>Request Received!</h1>
      <p>Thank you for requesting a worksheet. Your request will be reviewed and may be added to WorksheetHub.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" href="#/requests">See Requests</a><a class="btn ghost" href="#/worksheets">Browse Worksheets</a></div></div></div>`;
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
      const fb = db.fb(); const rated = fb.filter((f) => f.rating);
      const avg = rated.length ? (rated.reduce((a, f) => a + f.rating, 0) / rated.length).toFixed(1) : "–";
      return `<div class="wrap"><div class="page-head" style="text-align:center"><h1>Feedback</h1><p class="muted">Tell us how to make WorksheetHub better. Average worksheet rating so far: <b>${avg} ⭐</b></p></div>
      <form class="form" id="genFb">
        <label class="f">Your feedback<textarea name="text" required maxlength="800" placeholder="What do you like? What could be better? Found a mistake?"></textarea></label>
        <button class="btn" type="submit">Send Feedback</button>
      </form></div>`;
    },

    worksheet(id) {
      const w = db.ws().find((x) => x.id === id);
      if (!w) return `<div class="wrap"><div class="empty" style="margin-top:40px">Worksheet not found. <a href="#/worksheets">Back to worksheets</a></div></div>`;
      bump(w.id, "views");
      const fbs = db.fb().filter((f) => f.wsId === w.id && f.rating);
      const avg = fbs.length ? (fbs.reduce((a, f) => a + f.rating, 0) / fbs.length).toFixed(1) : null;
      return `<div class="wrap" style="max-width:800px"><div class="page-head"><a class="crumb" href="#/worksheets">← All worksheets</a>
      <div class="tags"><span class="tag">${ICONS[w.subject] || "📝"} ${esc(w.subject)}</span><span class="tag grey">${esc(w.grade)}</span><span class="tag ${esc(w.difficulty)}">${esc(w.difficulty)}</span></div>
      <h1 style="margin-top:10px">${esc(w.title)}</h1>
      <div class="meta">Topic: <b>${esc(w.topic)}</b> · Uploaded ${fmtDate(w.date)}${avg ? ` · ⭐ ${avg} (${fbs.length})` : ""}</div></div>
      <div class="card" style="gap:16px"><p>${esc(w.description)}</p>
        <div class="actions"><a class="btn" href="${esc(safeUrl(w.file))}" target="_blank" rel="noopener" data-dl="${esc(w.id)}">⬇ Download PDF</a>
        ${safeUrl(w.answers) ? `<a class="btn ghost" href="${esc(safeUrl(w.answers))}" target="_blank" rel="noopener">Answer Sheet</a>` : ""}</div>
        <div class="notice">✅ This worksheet was created with AI assistance and checked by the website creator before publication.</div></div>
      <div class="card" style="margin-top:20px;gap:16px" id="fbBox"><h3>Was this worksheet helpful?</h3>
        <div class="thumbs"><button class="btn ghost" data-help="1">👍 Yes</button><button class="btn ghost" data-help="0">👎 No</button></div>
        <div><b>Rate it</b><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((n) => `<button data-star="${n}" aria-label="${n} stars">★</button>`).join("")}</div></div>
        <label class="f">What could make this worksheet better? (optional)<textarea id="fbText" maxlength="600"></textarea></label>
        <button class="btn" id="fbSend">Send Feedback</button></div></div>`;
    },

    admin() {
      if (sessionStorage.getItem("wh_admin") !== "1") {
        return `<div class="wrap"><form class="form" id="loginForm" style="margin-top:40px;max-width:420px"><h2>🔒 Admin login</h2>
        <label class="f">Password<input type="password" name="pw" required autofocus></label><button class="btn">Log in</button>
        <p class="meta">This is a simple gate stored in config.js – not real security. See README.</p></form></div>`;
      }
      const tab = adminTab;
      const tabs = ["Impact", "Requests", "Add Worksheet", "Manage Worksheets", "Data"];
      return `<div class="wrap"><div class="page-head"><h1>Admin Dashboard</h1></div>
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
      return `<div class="tablewrap"><table><tr><th>Date</th><th>Subject</th><th>Grade</th><th>Topic</th><th>Difficulty</th><th>Type</th><th>Additional info</th><th>Status</th><th>GitHub worksheet link</th><th></th></tr>
      ${rq.map((r) => `<tr data-rid="${esc(r.id)}"><td>${fmtDate(r.date)}</td><td>${esc(r.subject)}</td><td>${esc(r.grade)}</td><td><b>${esc(r.topic)}</b></td><td>${esc(r.difficulty)}</td><td>${esc(r.type)}</td><td style="max-width:240px">${esc(r.info) || "<span class='muted'>–</span>"}</td>
      <td><select data-status>${opts(STATUSES, r.status)}</select></td><td><input type="url" data-link placeholder="https://github.com/…" value="${esc(r.link)}"></td>
      <td style="white-space:nowrap"><button class="btn sm" data-save>Save</button> <button class="btn sm danger" data-delreq>✕</button></td></tr>`).join("")}</table></div>
      <p class="meta">Tip: after adding a worksheet in "Add Worksheet", paste its link here (or use #/worksheet/ID) and set the status to Completed.</p>`;
    },
    "Add Worksheet"() {
      return `<form class="form" id="addForm" style="margin:0"><h2>Add a worksheet</h2>
      <label class="f">Worksheet title<input type="text" name="title" required></label>
      <div class="row"><label class="f">Subject<select name="subject">${opts(SUBJECTS)}</select></label><label class="f">Grade<select name="grade">${opts(GRADES)}</select></label></div>
      <div class="row"><label class="f">Topic<input type="text" name="topic" required></label><label class="f">Difficulty<select name="difficulty">${opts(DIFFS, "Medium")}</select></label></div>
      <label class="f">Description<textarea name="description" required></textarea></label>
      <label class="f">GitHub PDF/file link<input type="url" name="file" required placeholder="https://github.com/you/repo/blob/main/worksheets/math/grade6/fractions.pdf"></label>
      <label class="f">Answer sheet link (optional)<input type="url" name="answers"></label>
      <label class="f" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" name="reviewed" required style="width:auto"> I have reviewed this worksheet and checked the answers</label>
      <button class="btn">Publish worksheet</button></form>`;
    },
    "Manage Worksheets"() {
      const ws = db.ws().slice().sort((a, b) => b.date.localeCompare(a.date)); const st = db.st();
      if (!ws.length) return `<div class="empty">No worksheets yet.</div>`;
      return `<div class="tablewrap"><table><tr><th>ID</th><th>Title</th><th>Subject</th><th>Grade</th><th>Views</th><th>Downloads</th><th></th></tr>
      ${ws.map((w) => `<tr><td><code>${esc(w.id)}</code></td><td>${esc(w.title)}</td><td>${esc(w.subject)}</td><td>${esc(w.grade)}</td><td>${(st[w.id] || {}).views || 0}</td><td>${(st[w.id] || {}).downloads || 0}</td>
      <td><button class="btn sm danger" data-delws="${esc(w.id)}">Delete</button></td></tr>`).join("")}</table></div>`;
    },
    Data() {
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
    list.sort((a, b) => filt.sort === "popular" ? pop(b) - pop(a) : b.date.localeCompare(a.date));
    box.innerHTML = list.length ? `<p class="meta">${list.length} worksheet${list.length > 1 ? "s" : ""} found</p><div class="grid">${list.map(wsCard).join("")}</div>`
      : `<div class="empty"><div style="font-size:2.5rem">🔎</div><p>No worksheets match your search.</p><a class="btn" href="#/request">Request this worksheet</a></div>`;
  }

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
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.r === (route === "worksheet" ? "worksheets" : route === "confirmed" ? "request" : route)));
    $("#menu").classList.remove("open");
    bind(route, arg);
  }

  function bind(route, arg) {
    if (route === "home") $("#heroSearch").addEventListener("keydown", (e) => { if (e.key === "Enter") goSearch(e.target.value); });
    if (route === "worksheets") {
      renderResults();
      $("#libSearch").addEventListener("input", (e) => { filt.q = e.target.value; $("#navSearch").value = filt.q; renderResults(); });
      document.querySelectorAll("[data-f]").forEach((s) => s.addEventListener("change", () => { filt[s.dataset.f] = s.value; renderResults(); }));
    }
    if (route === "request") $("#reqForm").addEventListener("submit", (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      const rq = db.rq(); rq.push({ id: uid(), subject: d.subject, grade: d.grade, topic: d.topic.trim(), difficulty: d.difficulty, type: d.type, info: (d.info || "").trim(), date: today(), status: "Requested", link: "" });
      db.setRq(rq); location.hash = "#/confirmed";
    });
    if (route === "feedback") $("#genFb").addEventListener("submit", (e) => {
      e.preventDefault(); const fb = db.fb(); fb.push({ id: uid(), wsId: null, text: new FormData(e.target).get("text").trim(), date: today() }); db.setFb(fb);
      e.target.reset(); toast("Thank you for your feedback!");
    });
    if (route === "worksheet") bindFeedback(arg);
    if (route === "admin") bindAdmin();
  }

  function bindFeedback(id) {
    let helpful = null, rating = 0;
    const box = $("#fbBox");
    box.querySelectorAll("[data-help]").forEach((b) => b.addEventListener("click", () => { helpful = b.dataset.help === "1"; box.querySelectorAll("[data-help]").forEach((x) => x.classList.toggle("sel", x === b)); }));
    box.querySelectorAll("[data-star]").forEach((b) => b.addEventListener("click", () => { rating = +b.dataset.star; box.querySelectorAll("[data-star]").forEach((x) => x.classList.toggle("on", +x.dataset.star <= rating)); }));
    $("#fbSend").addEventListener("click", () => {
      const text = $("#fbText").value.trim();
      if (helpful === null && !rating && !text) return toast("Pick a rating, 👍/👎 or write something first");
      const fb = db.fb(); fb.push({ id: uid(), wsId: id, helpful, rating, text, date: today() }); db.setFb(fb);
      box.innerHTML = `<h3>Thank you! 🎉</h3><p>Your feedback helps us improve future worksheets.</p>`;
    });
  }

  function bindAdmin() {
    const lf = $("#loginForm");
    if (lf) return lf.addEventListener("submit", (e) => {
      e.preventDefault();
      if (new FormData(lf).get("pw") === CFG.adminPassword) { sessionStorage.setItem("wh_admin", "1"); render(); } else toast("Wrong password");
    });
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.tab === "__logout") { sessionStorage.removeItem("wh_admin"); return render(); }
      adminTab = b.dataset.tab; render();
    }));
    document.querySelectorAll("[data-rid]").forEach((tr) => {
      $("[data-save]", tr).addEventListener("click", () => {
        const rq = db.rq(); const r = rq.find((x) => x.id === tr.dataset.rid);
        r.status = $("[data-status]", tr).value; r.link = $("[data-link]", tr).value.trim();
        if (r.status === "Completed" && !safeUrl(r.link)) return toast("Add the worksheet link before marking Completed");
        db.setRq(rq); toast("Saved");
      });
      $("[data-delreq]", tr).addEventListener("click", () => { if (confirm("Delete this request?")) { db.setRq(db.rq().filter((x) => x.id !== tr.dataset.rid)); render(); } });
    });
    const af = $("#addForm");
    if (af) af.addEventListener("submit", (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(af)); const ws = db.ws();
      const id = uid(); ws.push({ id, title: d.title.trim(), subject: d.subject, grade: d.grade, topic: d.topic.trim(), difficulty: d.difficulty, description: d.description.trim(), file: d.file.trim(), answers: (d.answers || "").trim(), date: today() });
      db.setWs(ws); toast("Published! ID: " + id); adminTab = "Manage Worksheets"; render();
    });
    document.querySelectorAll("[data-delws]").forEach((b) => b.addEventListener("click", () => { if (confirm("Delete this worksheet from the site?")) { db.setWs(db.ws().filter((w) => w.id !== b.dataset.delws)); render(); } }));
    document.querySelectorAll("[data-export]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.export, data = db[k](); const name = { ws: "worksheets", rq: "requests", fb: "feedback" }[k] + ".json";
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); a.download = name; a.click();
    }));
    const wipe = $("#wipe"); if (wipe) wipe.addEventListener("click", () => { if (confirm("This deletes all worksheets, requests and feedback stored in this browser. Continue?")) { ["wh_ws", "wh_rq", "wh_fb", "wh_st", "wh_init"].forEach((k) => localStorage.removeItem(k)); location.reload(); } });
  }

  function goSearch(q) { filt.q = q; $("#navSearch").value = q; if (location.hash === "#/worksheets") render(); else location.hash = "#/worksheets"; }

  // ---------- global ----------
  document.addEventListener("click", (e) => { const a = e.target.closest("[data-dl]"); if (a) bump(a.dataset.dl, "downloads"); });
  $("#navSearch").addEventListener("input", (e) => {
    filt.q = e.target.value;
    if (location.hash === "#/worksheets") { const l = $("#libSearch"); if (l) l.value = filt.q; renderResults(); } else if (filt.q.trim()) location.hash = "#/worksheets";
  });
  $("#burger").addEventListener("click", () => $("#menu").classList.toggle("open"));
  window.addEventListener("hashchange", render);
  render();
})();
