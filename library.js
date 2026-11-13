/* Earth Jukebox: the shared in-depth research library.
   When a visitor's in-depth research finishes, it is shared (unless they untick "Share") to the site's Cloudflare Worker,
   which keeps it in the owner's Cloudflare R2 storage. Anyone can then load it instantly instead of waiting for a new run.
   Nothing is kept on the owner's computer or on GitHub. Without the Worker (ASSISTANT_URL empty, e.g. on the owner's
   computer) the library is simply not available and nothing is saved anywhere.
   Stored: place, years, area, the research text, numbers, tables and figures (maps as PNG; base maps are re-made from Esri
   when loaded), sources and date. No personal data. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i) };
  var V = "lib1", LIST = null, SHARE = true;
  try { SHARE = localStorage.getItem("ejShare") !== "0" } catch (e) { }
  function base() { var a = window.ASSISTANT_URL; return a ? a.replace(/\/$/, "") + "/library" : null }
  function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  async function gz(str) { var s = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip")); return new Uint8Array(await new Response(s).arrayBuffer()) }
  async function gunz(buf) { var s = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip")); return new Response(s).text() }
  function b64(u8) { var s = "", k = 0x8000; for (var i = 0; i < u8.length; i += k) s += String.fromCharCode.apply(null, u8.subarray(i, i + k)); return btoa(s) }
  function unb64(t) { var s = atob(t), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u }

  /* ---------- pack and unpack one research (deep.js result R and the comparison's area) ---------- */
  function pngOf(rgba, w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0); return c.toDataURL("image/png") }
  function pack(D, R) {
    var items = R.items.map(function (it) {
      var o = Object.assign({}, it);
      o.figs = (it.figs || []).map(function (f) {
        var g = Object.assign({}, f);
        if (f.type === "map") { g.rgba = { __png: pngOf(f.rgba, f.w, f.h) }; g.base = f.base ? { remake: true, credit: f.base.credit } : null; if (f.outline) { var m = new Uint8Array(f.outline.length); for (var i = 0; i < m.length; i++) m[i] = isNaN(f.outline[i]) ? 0 : 1; g.outline = { __mask: b64(m) } } }
        return g;
      });
      return o;
    });
    var LT = R.LT ? { src: R.LT.src, from: R.LT.from, to: R.LT.to, cell: R.LT.cell, url: R.LT.url, rows: R.LT.rows, idx: R.LT.idx } : null;
    return JSON.stringify({ v: V, made: R.at || new Date().toISOString(), place: { name: D.place.name, lat: D.place.lat, lon: D.place.lon, bb: D.place.bb || null, kind: D.place.kind || "" }, y1: D.y1, y2: D.y2, km: D.km, area: D.area ? { bb: D.area.bb, label: D.area.label, border: D.area.border, partial: D.area.partial, wide: D.area.wide } : null,
      R: { items: items, errors: R.errors, packs: R.packs, H: R.H, LT: LT, at: R.at } });
  }
  function img(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i) }; i.onerror = function () { rej(new Error("a saved picture could not be read")) }; i.src = src }) }
  async function unpack(text) {
    var J = JSON.parse(text); if (!J || J.v !== V || !J.R || !J.R.items) throw new Error("this research was saved in an unknown format");
    for (var i = 0; i < J.R.items.length; i++) {
      var it = J.R.items[i];
      for (var k = 0; k < (it.figs || []).length; k++) {
        var f = it.figs[k]; if (f.type !== "map") continue;
        var im = await img(f.rgba.__png), c = document.createElement("canvas"); c.width = f.w; c.height = f.h; var x = c.getContext("2d"); x.drawImage(im, 0, 0); f.rgba = x.getImageData(0, 0, f.w, f.h).data;
        if (f.outline && f.outline.__mask) { var m = unb64(f.outline.__mask), o = new Float64Array(m.length); for (var q = 0; q < m.length; q++) o[q] = m[q] ? 1 : NaN; f.outline = o }
        if (f.base && f.base.remake) { try { f.base = await EJD.baseMap(f.bb, 1100) } catch (e) { f.base = null } }
      }
    }
    if (J.area && J.area.border && EJD.areaMask) J.area.mask = EJD.areaMask(J.area.border);
    J.R.done = true; J.R.loaded = J.made; return J;
  }

  /* ---------- share a finished research ---------- */
  async function share(D) {
    var B = base(), st = $("cmplibst"); if (!B || !D || !D.deep || !D.deep.done || D.deep.loaded || D.deep.shared) return;
    if (!SHARE) { if (st) st.textContent = "Not shared (sharing is switched off)."; return }
    var R = D.deep; if (R.items.length < 3) return;
    try {
      if (st) st.textContent = "Sharing this research to the public library…";
      var checks = R.items.map(function (it) { return it.num && it.num.check }).filter(Boolean).slice(0, 4);
      var meta = { level: window.EJEV ? 3 : 2, place: D.place.name.slice(0, 160), country: (D.place.country || "").slice(0, 80), lat: +D.place.lat.toFixed(4), lon: +D.place.lon.toFixed(4), y1: D.y1, y2: D.y2, sections: R.items.length, made: R.at || new Date().toISOString(), kinds: R.H ? String(R.H.label || "").slice(0, 200) : "", area: D.area ? D.area.label.slice(0, 200) : "", v: V, checks: checks };
      var body = await gz(pack(D, R)), mq = btoa(unescape(encodeURIComponent(JSON.stringify(meta))));
      var r = await fetch(B + "/save?meta=" + encodeURIComponent(mq), { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: body }), j = await r.json().catch(function () { return {} });
      if (!r.ok) throw new Error(j.error || "HTTP " + r.status);
      R.shared = j.id; LIST = null;
      if (window.EJAR && EJAR.thumbUpload) EJAR.thumbUpload(j.id, D).catch(function () { });   /* its preview picture for the Archives */
      var sid = j.id; if (window.EJAR && EJAR.pdfUpload && window.EJR && EJR.pdf) setTimeout(function () { EJR.pdf({ nosave: true, quiet: true }).then(function (r) { if (r && r.ok) return EJAR.pdfUpload(sid, r.doc) }).catch(function () { }) }, 1500);   /* its finished PDF, so the Archives can open it instantly */
      if (st) st.textContent = "Shared to the public library (" + (body.length / 1e6).toFixed(1) + " MB" + (j.checked ? "; " + j.checked + " numbers spot-checked against their sources" : "") + "). Anyone can now load it instantly.";
    } catch (e) { if (st) st.textContent = "Could not share this research: " + e.message + "."; }
  }

  /* ---------- the library window ---------- */
  async function list() {
    if (LIST) return LIST; var B = base(), out = [], cur = null, n = 0;
    do { var r = await fetch(B + "/list" + (cur ? "?cursor=" + encodeURIComponent(cur) : "")); if (!r.ok) throw new Error("the library did not answer (" + r.status + ")"); var j = await r.json(); out = out.concat(j.items || []); cur = j.cursor } while (cur && ++n < 30);
    LIST = out.filter(function (it) { return it.type !== "events" }); return LIST;   /* natural-event reports live only in the Archives (they are PDFs, not researches to load) */
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") }
  function dist(a, b, c, d) { var R = Math.PI / 180, x = Math.sin((c - a) * R / 2), y = Math.sin((d - b) * R / 2), h = x * x + Math.cos(a * R) * Math.cos(c * R) * y * y; return 12742 * Math.asin(Math.min(1, Math.sqrt(h))) }
  function render(q) {
    var box = $("libl"); if (!LIST) return; var P = window.pinLL, words = norm(q).split(/\s+/).filter(Boolean);
    var rows = LIST.filter(function (m) { var t = norm(m.place + " " + m.country + " " + m.y1 + " " + m.y2 + " " + m.kinds); return words.every(function (w) { return t.indexOf(w) >= 0 }) });
    rows.sort(function (a, b) { if (!words.length && P) return dist(P[0], P[1], a.lat, a.lon) - dist(P[0], P[1], b.lat, b.lon); var sa = norm(a.place).indexOf(words[0] || "") === 0 ? 0 : 1, sb = norm(b.place).indexOf(words[0] || "") === 0 ? 0 : 1; return sa - sb || String(b.saved).localeCompare(String(a.saved)) });
    $("libn").textContent = rows.length + " of " + LIST.length + " researches" + (!words.length && P ? ", nearest to your pin first" : "");
    box.innerHTML = rows.slice(0, 200).map(function (m) { return '<li><button type="button" data-id="' + esc(m.id) + '"><b>' + esc(m.place) + "</b>" + (m.country ? " · " + esc(m.country) : "") + "<span>" + esc(m.y1) + " and " + esc(m.y2) + " · " + esc(m.sections) + " sections · made " + esc(String(m.made).slice(0, 10)) + (m.checked ? " · " + esc(m.checked) + " numbers spot-checked" : "") + (m.area ? " · " + esc(m.area) : "") + "</span></button></li>" }).join("") || "<li class=\"none\">Nothing matches. Try another spelling, a country, or a year.</li>";
  }
  async function open() {
    var m = $("libm"); m.hidden = false; $("libq").focus();
    if (!base()) { $("libn").textContent = "The research library works once the site's Cloudflare Worker is connected (it is not connected on this copy of the site)."; return }
    $("libn").textContent = "Loading the list…";
    try { await list(); render($("libq").value) } catch (e) { $("libn").textContent = "The library could not be reached: " + e.message + "." }
  }
  async function load(id) {
    var st = $("libn"); st.textContent = "Loading the research…";
    try {
      var r = await fetch(base() + "/get?id=" + encodeURIComponent(id)); if (!r.ok) throw new Error("not found (" + r.status + ")");
      var J = await unpack(await gunz(await r.arrayBuffer())), X = window.CMPX;
      st.textContent = "Setting up the comparison for " + J.place.name + " (" + J.y1 + " and " + J.y2 + ")…";
      X.C.place = J.place; $("cmpqi").value = J.place.name; if ($("cmpsel")) $("cmpsel").textContent = J.place.name; $("cmpy1").value = J.y1; $("cmpy2").value = J.y2;
      await X.setup();
      var D = X.C.data; if (!D) throw new Error("the comparison could not be set up");
      D.area = J.area; D.deep = J.R; D.deep.libId = id; X.renderDeep();
      $("cmpdeepst").textContent = "Loaded from the public library: made " + String(J.made).slice(0, 10) + " by another visitor (its numbers were spot-checked against their sources when it was shared). Press the research button to make a fresh one instead.";
      $("libm").hidden = true;
      var box = $("cmpdeepbox"); if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { st.textContent = "This research could not be loaded: " + e.message + "."; }
  }
  function ui() {
    var dbtn = $("cmpdeep"); if (!dbtn || $("cmplib")) return !!dbtn;
    var css = document.createElement("style");
    css.textContent = "#libm{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}#libm[hidden]{display:none}#libm .lb{background:#0d1117;border:1px solid var(--rule,#2a2f38);color:var(--bone,#ece6d8);width:min(720px,94vw);max-height:86vh;display:flex;flex-direction:column}#libm header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--rule,#2a2f38)}#libm header b{font-size:16px}#libx{background:none;border:0;color:inherit;font-size:22px;cursor:pointer;width:auto}#libq{margin:10px 14px 4px;padding:8px 10px;width:auto}#libn{margin:2px 14px 8px;font-size:12px;color:var(--mute,#9b978b)}#libl{list-style:none;margin:0;padding:0 8px 10px;overflow-y:auto}#libl button{display:block;width:100%;text-align:left;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;padding:8px 10px;margin:4px 0;cursor:pointer}#libl button:hover,#libl button:focus{border-color:var(--amber,#e0a43a)}#libl span{display:block;font-size:12px;color:var(--mute,#9b978b);margin-top:2px}#libl .none{padding:10px;color:var(--mute,#9b978b)}";
    document.head.appendChild(css);
    var b = document.createElement("button"); b.id = "cmplib"; b.type = "button"; b.className = dbtn.className + " alt"; b.style.marginLeft = "8px"; b.textContent = "Instantly load an in-depth research that has already been made"; b.title = "Researches made by visitors anywhere in the world, kept in the site's public library";
    dbtn.parentNode.insertBefore(b, dbtn.nextSibling);
    var sh = document.createElement("label"); sh.style.cssText = "display:flex;gap:6px;align-items:center;font-size:12px;margin-top:6px"; sh.innerHTML = '<input type="checkbox" id="cmpshare" style="width:auto"' + (SHARE ? " checked" : "") + '> Share my finished research to the public library (place, years and results only; no personal data)';
    var st = document.createElement("p"); st.className = "cmpnote"; st.id = "cmplibst"; st.setAttribute("aria-live", "polite");
    var host = $("cmpdeepst") || b; host.parentNode.insertBefore(sh, host.nextSibling); sh.parentNode.insertBefore(st, sh.nextSibling);
    $("cmpshare").addEventListener("change", function () { SHARE = this.checked; try { localStorage.setItem("ejShare", SHARE ? "1" : "0") } catch (e) { } });
    var m = document.createElement("div"); m.id = "libm"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "libt");
    m.innerHTML = '<div class="lb"><header><b id="libt">In-depth research library</b><button id="libx" type="button" aria-label="Close">&times;</button></header><input id="libq" type="search" placeholder="Search a place, country or year" aria-label="Search the library"><p id="libn" aria-live="polite"></p><ul id="libl"></ul></div>';
    document.body.appendChild(m);
    b.addEventListener("click", open); $("libx").addEventListener("click", function () { m.hidden = true; b.focus() });
    m.addEventListener("click", function (e) { if (e.target === m) m.hidden = true }); m.addEventListener("keydown", function (e) { if (e.key === "Escape") { m.hidden = true; b.focus() } });
    $("libq").addEventListener("input", function () { render(this.value) });
    $("libl").addEventListener("click", function (e) { var t = e.target.closest("button[data-id]"); if (t) load(t.dataset.id) });
    /* share when a research finishes */
    setInterval(function () { var D = window.CMPX && CMPX.C && CMPX.C.data; if (D && D.deep && D.deep.done && !D.deep.loaded && !D.deep.shared && !D.deep.shareTried) { D.deep.shareTried = true; share(D) } }, 3000);
    return true;
  }
  window.EJL = { open: open, load: load, list: list, share: share, pack: pack, unpack: unpack, search: function (q) { return list().then(function () { render(q); return LIST }) } };
  var tries = 0; (function wait() { if (ui() || ++tries > 60) return; setTimeout(wait, 500) })();
})();
