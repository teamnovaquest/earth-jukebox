/* Earth Jukebox Archives and Monographs (2026-11-10).
   Archives: every in-depth research shared to the public library (Cloudflare Worker + KV, see library.js), shown as cards with a
   preview of the report and a clear title ("Comparative Assessment of Dhaka from 1980 to 2020"), with a search bar.
   Monographs: the project's three papers (research paper, user guide, accuracy paper), PDFs published with the site in monographs/.
   Previews: when a research is shared, a small picture of its first page (title, first map, first chart) is drawn and sent once to
   the Worker ("t/<id>"); a research without one shows NASA's Blue Marble picture of its area instead. Nothing is saved locally. */
(function () {
  if (window.EJAR) return;
  var $ = function (id) { return document.getElementById(id) };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function base() { return window.ASSISTANT_URL ? String(window.ASSISTANT_URL).replace(/\/$/, "") + "/library" : "" }
  function title(it) { return (it.type === "events" ? "Natural Events near " : "Comparative Assessment of ") + it.place + " from " + it.y1 + " to " + it.y2 }
  function mb(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB" }
  function day(s) { try { return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) } catch (e) { return String(s).slice(0, 10) } }

  var MONO = [
    { file: "monographs/earth-jukebox-research-paper.pdf?v=2026-11-12a", img: "monographs/research-paper.jpg?v=m", title: "Earth Jukebox: Turning NASA Earth Data into Music", kind: "Research paper", desc: "The mathematics, software and NASA data behind the site: sonification, statistics, comparisons, area averages and the Cloudflare back end." },
    { file: "monographs/earth-jukebox-user-guide.pdf?v=2026-11-12a", img: "monographs/user-guide.jpg?v=m", title: "Earth Jukebox User Guide", kind: "Guide", desc: "Every part of the site, step by step: the globe, the music, compare mode, in-depth research, the data panel, range, SI listening, Mute humans, reports and blind assistance." },
    { file: "monographs/earth-jukebox-how-the-si-learns.pdf?v=2026-11-11k", img: "monographs/how-the-si-learns.jpg?v=m", title: "How the SI Learns", kind: "SI paper", desc: "How Earth Jukebox's SI learns each place's climate rhythms from NASA data: the mathematics, the shuffle test, honest testing, harmony from continued fractions, implementation and speed." },
    { file: "monographs/earth-jukebox-accuracy-paper.pdf?v=2026-11-11k", img: "monographs/accuracy-paper.jpg?v=m", title: "How Accurate Is Earth Jukebox?", kind: "Accuracy paper", desc: "Where every number comes from, how the site checks itself against NASA's own servers and independent records, and the measured results." }
  ];

  var PRES = [
    { file: "monographs/earth-jukebox-si-presentation.pdf?v=2026-11-11k", dl: "monographs/earth-jukebox-si-presentation.pptx?v=2026-11-11k", img: "monographs/si-presentation.jpg?v=m", title: "Getting the Most from the SI", kind: "Presentation", fmt: "PowerPoint", desc: "19 slides on using Earth Jukebox's Super Intelligence well: what each SI feature does and costs, ten ways to save your daily limits, how to ask better questions, and why training the SI on each place is worth it, with real results from Dhaka, the Amazon and the Sahara." },
    { file: "monographs/earth-jukebox-presentation.pdf?v=2026-11-12a", dl: "monographs/earth-jukebox-presentation.pptx?v=2026-11-12a", img: "monographs/presentation.jpg?v=m", title: "Earth Jukebox: Listen to the Planet", kind: "Presentation", fmt: "PowerPoint", desc: "15 slides on why Earth Jukebox matters: how slow change goes unnoticed, why sound reaches people when numbers do not, who has been left out, hearing a place with humans muted, and how understanding leads to action. Read opens it in the browser; Download gives the PowerPoint file." }
  ];
  var css = document.createElement("style");
  css.textContent =
    "#ejar{position:fixed;inset:0;z-index:70;background:#0a1019;color:#e9edf2;font:16px/1.5 Figtree,'Segoe UI',system-ui,sans-serif;overflow-y:auto;opacity:0;transform:translateY(12px);transition:opacity .35s,transform .35s}#ejar.on{opacity:1;transform:none}#ejar[hidden]{display:none}" +
    "#ejar *{box-sizing:border-box}#ejar .top{position:sticky;top:0;z-index:2;background:linear-gradient(#0a1019 75%,rgba(10,16,25,0));padding:22px clamp(16px,4vw,48px) 18px}" +
    "#ejar .row{max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap}#ejar h2{margin:0;margin-right:auto;font:500 clamp(24px,3vw,34px)/1.15 Unbounded,Figtree,sans-serif;letter-spacing:-.01em}" +
    "#ejar .x{width:auto;padding:10px 16px;border-radius:999px;border:1px solid rgba(233,237,242,.2);background:transparent;color:#e9edf2;font:600 14px/1 Figtree,sans-serif;cursor:pointer}#ejar .x:hover{border-color:rgba(233,237,242,.5)}" +
    "#ejar .sr{max-width:1240px;margin:16px auto 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap}#ejar .sr[hidden]{display:none}#ejar input{flex:1 1 320px;min-width:0;padding:13px 18px;border-radius:12px;border:1px solid #2b3647;background:#121a26;color:#e9edf2;font:16px Figtree,sans-serif}#ejar input:focus{outline:2px solid #6fd3ff;outline-offset:1px}" +
    "#ejar .n{color:#93a0b0;font-size:14px}#ejar .lead{max-width:1240px;margin:8px auto 0;color:#a9b4c2;font-size:15px}" +
    "#ejar .grid{max-width:1240px;margin:8px auto 60px;padding:0 clamp(16px,4vw,48px);display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:26px}" +
    "#ejar .card{display:flex;flex-direction:column;background:#1b2432;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25)}" +
    "#ejar .pv{position:relative;aspect-ratio:16/10;background:#e9ecef;overflow:hidden}#ejar .pv img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}" +
    "#ejar .pv .tag{position:absolute;left:12px;bottom:12px;padding:4px 10px;border-radius:999px;background:rgba(10,16,25,.78);color:#e9edf2;font-size:12px}" +
    "#ejar .bd{padding:20px 22px 22px;display:flex;flex-direction:column;flex:1}#ejar h3{margin:0 0 8px;font-size:21px;line-height:1.25;font-weight:700}#ejar .mt{color:#93a0b0;font-size:14px;margin:0 0 6px}#ejar .ds{color:#b9c3cf;font-size:14px;margin:0 0 16px}" +
    "#ejar .bt{margin-top:auto;display:flex;gap:10px}#ejar .bt button,#ejar .bt a{flex:1;display:inline-flex;align-items:center;justify-content:center;padding:13px 12px;border-radius:9px;border:0;cursor:pointer;font:700 15px/1 Figtree,sans-serif;text-decoration:none}" +
    "#ejar .p1{background:#e7b25a;color:#1b1206}#ejar .p1:hover{background:#f2c372}#ejar .p2{background:#2a3546;color:#e9edf2}#ejar .p2:hover{background:#334157}" +
    "#ejar .bt button:focus-visible,#ejar .bt a:focus-visible{outline:2px solid #6fd3ff;outline-offset:2px}" +
    "#ejar .og{margin-top:10px;background:none;border:0;padding:4px 0;color:#9fb3c8;font:600 13px/1.3 Figtree,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer;align-self:flex-start}#ejar .og:hover{color:#e9edf2}#ejar .og:focus-visible{outline:2px solid #6fd3ff;outline-offset:2px}" +
    "#ejar .empty{max-width:1240px;margin:40px auto;padding:0 clamp(16px,4vw,48px);color:#a9b4c2}" +
    "@media (prefers-reduced-motion:reduce){#ejar{transition:none}}";
  document.head.appendChild(css);

  var el = document.createElement("div"); el.id = "ejar"; el.hidden = true; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ejart");
  el.innerHTML = '<div class="top"><div class="row"><h2 id="ejart"></h2><button type="button" class="x" id="ejarx">Close</button></div>' +
    '<p class="lead" id="ejarl"></p><div class="sr" id="ejarsr"><input id="ejarq" type="search" placeholder="Search a place, country, kind of place or year" aria-label="Search the archives"><span class="n" id="ejarn" aria-live="polite"></span></div></div>' +
    '<div class="grid" id="ejarg"></div><p class="empty" id="ejare" hidden></p>';
  document.body.appendChild(el);
  var MODE = "", LIST = null, back = null;

  function show(mode) {
    MODE = mode; back = document.activeElement; el.hidden = false; requestAnimationFrame(function () { el.classList.add("on") });
    $("ejart").textContent = mode === "arch" ? "Earth Jukebox Archives" : mode === "pres" ? "Presentations" : "Monographs";
    $("ejarl").textContent = mode === "arch" ? "Every in-depth research shared by visitors around the world. Open one to load it instantly, with all its maps, graphs and tables." : mode === "pres" ? "Slides about Earth Jukebox, for talks and for judges." : "Papers about Earth Jukebox: how it works, how to use it, and how accurate it is.";
    $("ejarsr").hidden = mode !== "arch"; $("ejarq").value = "";
    if (mode === "arch") { $("ejarg").innerHTML = ""; $("ejarn").textContent = "Loading the archives…"; loadList().then(function () { render("") }, function (e) { $("ejarn").textContent = ""; empty("The archives could not be reached (" + e.message + "). Check the connection and try again.") }); setTimeout(function () { $("ejarq").focus() }, 60) }
    else { monos(); setTimeout(function () { $("ejarx").focus() }, 60) }
  }
  function hide() { el.classList.remove("on"); setTimeout(function () { el.hidden = true }, 250); if (back && back.focus) try { back.focus() } catch (e) { } }
  function empty(t) { var e = $("ejare"); e.hidden = !t; e.textContent = t || "" }
  $("ejarx").addEventListener("click", hide);
  el.addEventListener("keydown", function (e) { if (e.key === "Escape") hide() });

  async function loadList() {
    if (!base()) throw new Error("the library is not connected");
    /* read the server list directly: the research loader (EJL.list) leaves out natural-event reports, which belong here too */
    var r = await fetch(base() + "/list?x=" + Date.now()); if (!r.ok) throw new Error("HTTP " + r.status); LIST = ((await r.json()).items || []).filter(function (it) { return it.type !== "events" });   /* natural events live inside the research reports */
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") }
  function render(q) {
    var words = norm(q).split(/\s+/).filter(Boolean), list = (LIST || []).map(function (it) {
      var hay = norm([title(it), it.place, it.country, it.kinds, it.area, it.y1, it.y2].join(" ")), sc = 0;
      words.forEach(function (w) { if (hay.indexOf(w) >= 0) sc += norm(it.place).indexOf(w) === 0 ? 3 : 1 });
      return { it: it, sc: sc, ok: !words.length || words.every(function (w) { return hay.indexOf(w) >= 0 }) };
    }).filter(function (o) { return o.ok }).sort(function (a, b) { return b.sc - a.sc || String(b.it.made).localeCompare(String(a.it.made)) });
    $("ejarn").textContent = list.length + (list.length === 1 ? " research" : " researches") + (words.length ? " match" + (list.length === 1 ? "es" : "") : " in the archives");
    empty(!LIST.length ? "No research has been shared yet. Run an in-depth research in compare mode and it will appear here for everyone." : !list.length ? "Nothing matches that search. Try a place name, a country or a year." : "");
    $("ejarg").innerHTML = list.slice(0, 120).map(function (o) {
      var it = o.it, t = title(it), meta = [it.country, (it.sections || "?") + " sections", it.size ? mb(it.size) : "", "made " + day(it.made)].filter(Boolean).join(" • ");
      return '<article class="card"><div class="pv"><img alt="" loading="lazy" data-id="' + esc(it.id) + '" data-lat="' + it.lat + '" data-lon="' + it.lon + '" src="' + esc(base() + "/thumb?id=" + encodeURIComponent(it.id) + "&v=" + encodeURIComponent(it.saved || it.made || "")) + '"><span class="tag">' + esc(it.kinds ? String(it.kinds).split(/[,;]/)[0] : "In-depth research") + "</span></div>" +
        '<div class="bd"><h3>' + esc(t) + '</h3><p class="mt">' + esc(meta) + "</p>" + (it.area ? '<p class="ds">' + esc(it.area) + "</p>" : "") +
        '<div class="bt"><button type="button" class="p1" data-read="' + esc(it.id) + '" data-v="' + esc(it.saved || it.made || "") + '" data-name="' + esc(fname(it)) + '" aria-label="Read ' + esc(t) + ' (PDF, opens in a new tab)">Read</button><button type="button" class="p2" data-dl="' + esc(it.id) + '" data-v="' + esc(it.saved || it.made || "") + '" data-name="' + esc(fname(it)) + '" aria-label="Download ' + esc(t) + ' as a PDF">Download</button></div>' +
        (it.type === "events" ? "" : '<button type="button" class="og" data-open="' + esc(it.id) + '">Open on the globe, with its maps and graphs</button>') + '</div></article>';
    }).join("");
    /* a research without its own preview shows NASA's Blue Marble picture of its area */
    [].forEach.call($("ejarg").querySelectorAll("img[data-id]"), function (im) { im.addEventListener("error", function () { if (im.dataset.fb) return; im.dataset.fb = 1; im.src = areaPic(+im.dataset.lat, +im.dataset.lon) }, { once: true }) });
  }
  function areaPic(lat, lon) { var dy = 2.2, dx = 3.5; return "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_NextGeneration&STYLES=&CRS=EPSG:4326&BBOX=" + [Math.max(-90, lat - dy), Math.max(-180, lon - dx), Math.min(90, lat + dy), Math.min(180, lon + dx)].map(function (v) { return v.toFixed(3) }).join(",") + "&WIDTH=640&HEIGHT=400&FORMAT=image/jpeg" }
  $("ejarq").addEventListener("input", function () { if (LIST) render(this.value) });

  function monos() {
    $("ejarn").textContent = ""; empty("");
    var L = MODE === "pres" ? PRES : MONO;
    $("ejarg").innerHTML = L.map(function (m, i) {
      return '<article class="card"><div class="pv"><img alt="" src="' + esc(m.img) + '"><span class="tag">' + esc(m.kind) + '</span></div><div class="bd"><h3>' + esc(m.title) + '</h3><p class="mt" id="ejms' + i + '">' + (m.fmt || "PDF") + '</p><p class="ds">' + esc(m.desc) + "</p>" +
        '<div class="bt"><a class="p1" href="' + esc(m.file) + '" target="_blank" rel="noopener">Read</a><a class="p2" href="' + esc(m.dl || m.file) + '" download>Download</a></div></div></article>';
    }).join("");
    L.forEach(function (m, i) { fetch(m.dl || m.file, { method: "HEAD" }).then(function (r) { var n = +r.headers.get("content-length"), f = m.fmt || "PDF"; if (r.ok && n) $("ejms" + i).textContent = f + " • " + mb(n); else if (!r.ok) $("ejms" + i).textContent = f + " • being prepared" }).catch(function () { }) });
  }

  /* open a research in the site (lifting the welcome screen first), and optionally make its PDF report */
  /* the finished PDF of a research, saved on the server when it was shared */
  function fname(it) { return ((it.type === "events" ? "EarthJukebox_natural_events_" : "EarthJukebox_report_") + it.place + "_" + it.y1 + "-" + it.y2).replace(/[^A-Za-z0-9_\-]+/g, "_").replace(/_+/g, "_") }
  function pdfUrl(id, name, dl, ver) { return base() + "/pdf?id=" + encodeURIComponent(id) + (name ? "&name=" + encodeURIComponent(name) : "") + (dl ? "&dl=1" : "") + (ver ? "&v=" + encodeURIComponent(ver) : "") }
  async function hasPdf(id, ver) { try { var r = await fetch(pdfUrl(id, "", false, ver || Date.now()), { method: "HEAD", cache: "no-store" }); return r.ok } catch (e) { return false } }
  /* a just-saved research can take up to a minute to appear in the server's list (Cloudflare KV), so a 404 is retried a few times */
  async function postRetry(url, type, body) {
    for (var k = 0; k < 5; k++) { var r = await fetch(url, { method: "POST", headers: { "Content-Type": type }, body: body }); if (r.status !== 404) return r; await new Promise(function (res) { setTimeout(res, 30000) }) }
    return r;
  }
  async function pdfUpload(id, doc) {
    if (!base() || !id || !doc) return false;
    var body = doc.output("arraybuffer"); if (!body || body.byteLength > 20000000) return false;
    var r = await postRetry(pdfUrl(id), "application/pdf", body);
    return r.ok || r.status === 409;
  }
  async function readPdf(b) {
    var id = b.dataset.read, w = window.open("", "_blank"), old = b.textContent; b.textContent = "Opening…"; b.disabled = true;
    try {
      if (await hasPdf(id, b.dataset.v)) { if (w) w.location.href = pdfUrl(id, b.dataset.name, false, b.dataset.v); else location.href = pdfUrl(id, b.dataset.name, false, b.dataset.v); return }
      if (w) w.close(); if (/^e/.test(id)) { b.textContent = "Report not ready yet"; return } openRes(id, true);   /* an older research shared before reports were saved: build its PDF once from the saved research */
    } finally { b.textContent = old; b.disabled = false }
  }
  async function dlPdf(b) {
    var id = b.dataset.dl, old = b.textContent; b.textContent = "Downloading…"; b.disabled = true;
    try {
      if (await hasPdf(id, b.dataset.v)) { var a = document.createElement("a"); a.href = pdfUrl(id, b.dataset.name, true, b.dataset.v); a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); return }
      if (/^e/.test(id)) { b.textContent = "Report not ready yet"; return } openRes(id, true);
    } finally { setTimeout(function () { b.textContent = old; b.disabled = false }, 1200) }
  }
  async function openRes(id, pdf) {
    hide();
    var go = function () {
      try { if (window.CMPX && CMPX.open && !CMPX.isOpen()) CMPX.open() } catch (e) { }
      setTimeout(async function () {
        try { await EJL.load(id) } catch (e) { }
        if (pdf) { var t = 0, iv = setInterval(function () { var box = $("cmpdeepbox"); if ((box && box.children.length && window.CMPX && CMPX.C.data && CMPX.C.data.deep) || ++t > 120) { clearInterval(iv); if (t <= 120 && window.EJR && EJR.pdf) EJR.pdf().then(function (r) { if (r && r.ok) pdfUpload(id, r.doc).catch(function () { }) }) } }, 500) }
      }, 350);
    };
    if (window.EJLand && EJLand.isOpen()) EJLand.launch(go); else go();
  }
  $("ejarg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; if (b.dataset.open) openRes(b.dataset.open, false); else if (b.dataset.read) readPdf(b); else if (b.dataset.dl) dlPdf(b) });

  /* ---------- the preview picture of a research (a small picture of its first page) ---------- */
  function wrap(x, text, maxW) { var w = text.split(" "), lines = [], cur = ""; w.forEach(function (s) { var t = cur ? cur + " " + s : s; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = s } else cur = t }); if (cur) lines.push(cur); return lines }
  function thumbCanvas(D) {
    var W = 640, H = 400, c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#6b7280"; x.font = "500 13px Figtree, Arial, sans-serif"; x.fillText("Earth Jukebox in-depth research report", 34, 36);
    x.fillStyle = "#111827"; x.font = "700 25px Georgia, 'Times New Roman', serif";
    var t = title({ place: D.place.name, y1: D.y1, y2: D.y2 }), L = wrap(x, t, W - 68).slice(0, 2); L.forEach(function (s, i) { x.fillText(s, 34, 72 + i * 31) });
    var y0 = 72 + L.length * 31 + 2; x.fillStyle = "#e7b25a"; x.fillRect(34, y0, 64, 3);
    var cvs = [].slice.call(($("cmpdeepbox") || document).querySelectorAll("canvas")).filter(function (cv) { return cv.width > 80 && cv.height > 60 }).slice(0, 2), fy = y0 + 18, fh = H - fy - 58, fw = (W - 68 - 18) / 2;
    cvs.forEach(function (cv, i) { var r = Math.min(fw / cv.width, fh / cv.height), w = cv.width * r, h = cv.height * r; try { x.drawImage(cv, 34 + i * (fw + 18) + (fw - w) / 2, fy + (fh - h) / 2, w, h) } catch (e) { } x.strokeStyle = "#e5e7eb"; x.strokeRect(34 + i * (fw + 18), fy, fw, fh) });
    x.fillStyle = "#e5e7eb"; [0, 1, 2].forEach(function (k) { x.fillRect(34, H - 46 + k * 13, (W - 68) * (k === 2 ? .6 : 1), 6) });
    return c;
  }
  async function thumbUpload(id, D) {
    D = D || (window.CMPX && CMPX.C.data); if (!base() || !id || !D || !D.place) return false;
    var blob = await new Promise(function (res) { thumbCanvas(D).toBlob(res, "image/jpeg", .82) }); if (!blob) return false;
    var r = await postRetry(base() + "/thumb?id=" + encodeURIComponent(id), "image/jpeg", blob);
    return r.ok;
  }

  window.EJAR = { openArchives: function () { show("arch") }, openMonographs: function () { show("mono") }, openPresentations: function () { show("pres") }, close: hide, thumbUpload: thumbUpload, pdfUpload: pdfUpload, postRetry: postRetry, hasPdf: hasPdf, thumbCanvas: thumbCanvas, title: title, MONO: MONO };
})();
