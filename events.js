/* Earth Jukebox: natural events near a place, from NASA's Earth Observatory Natural Event Tracker (EONET, eonet.gsfc.nasa.gov).
   EONET is a curated catalogue of notable events (storms, floods, wildfires, volcanoes, earthquakes, sea and lake ice, dust, drought...),
   mostly from 2000 onwards. This finds every event whose track or location comes within RADIUS km of the pin, then shows a map, a
   year-by-year chart, a table, a short piece of music (one note per event), and makes a PDF report that is shared to the Archives.
   Nothing is estimated: every number shown comes from EONET's own records (dates, positions, and wind speeds where EONET gives them). */
(function () {
  if (window.EJEV) return;
  var RADIUS = 500, START = 2000, EONET = "https://eonet.gsfc.nasa.gov/api/v3/events";
  var DEMO_ID = "r45i84e-1980-2020";   /* the finished Dhaka 1980-2020 in-depth research in the Archives */
  var CAT = {
    severeStorms: ["Storms", "#e4572e"], floods: ["Floods", "#2c7fb8"], wildfires: ["Wildfires", "#f18f01"], volcanoes: ["Volcanoes", "#8b1e3f"],
    earthquakes: ["Earthquakes", "#6a4c93"], landslides: ["Landslides", "#8d6e63"], seaLakeIce: ["Sea and lake ice", "#4fb3d9"], drought: ["Drought", "#c9a227"],
    dustHaze: ["Dust and haze", "#b8a07e"], snow: ["Snow", "#90a4ae"], tempExtremes: ["Temperature extremes", "#d7263d"], waterColor: ["Water colour", "#2a9d8f"], manmade: ["Human-made", "#555555"]
  };
  function $(id) { return document.getElementById(id) }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function cat(e) { var c = e.categories && e.categories[0] ? e.categories[0] : { id: "other", title: "Other" }; return { id: c.id, name: (CAT[c.id] || [c.title])[0], col: (CAT[c.id] || [0, "#777777"])[1] } }
  function km(a, b, c, d) { var R = 6371, r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2), h = x * x + Math.cos(a * r) * Math.cos(c * r) * y * y; return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))) }
  function pts(g) { if (g.type === "Point") return [g.coordinates]; if (g.type === "Polygon") return g.coordinates[0] || []; return [] }
  function say(t) { var s = $("cmpevst"); if (s) s.textContent = t }
  var LAST = null;

  /* ---------- the analysis ---------- */
  async function analyse(opt) {
    opt = opt || {};
    var X = window.CMPX, D = X && X.C && X.C.data; if (!D || !D.place) { say("Set up a comparison first, so the site knows the place."); return null }
    var P = D.place, lat = +P.lat, lon = +P.lon, dlat = 5.5, dlon = Math.min(20, 5.5 / Math.max(.3, Math.cos(lat * Math.PI / 180)));
    var bb = { w: Math.max(-180, lon - dlon), e: Math.min(180, lon + dlon), s: Math.max(-90, lat - dlat), n: Math.min(90, lat + dlat) };
    var y2 = new Date().getUTCFullYear(), btn = opt.quiet ? null : $("cmpev"); if (btn) btn.disabled = true; var say0 = say; if (opt.quiet) say = function () { };
    try {
      say("Asking NASA's natural event tracker (EONET) about events near " + P.name + "…");
      var u = EONET + "?bbox=" + [bb.w, bb.n, bb.e, bb.s].map(function (v) { return v.toFixed(3) }).join(",") + "&start=" + START + "-01-01&end=" + new Date().toISOString().slice(0, 10) + "&status=all&limit=1000";
      var r = await fetch(u); if (!r.ok) throw new Error("EONET answered " + r.status); var j = await r.json();
      var ev = (j.events || []).map(function (e) {
        var best = 1e9, bi = null, pk = null, unit = "";
        e.geometry.forEach(function (g, i) { pts(g).forEach(function (p) { var d = km(lat, lon, p[1], p[0]); if (d < best) { best = d; bi = i } }); if (g.magnitudeValue != null && (pk === null || g.magnitudeValue > pk)) { pk = g.magnitudeValue; unit = g.magnitudeUnit || "" } });
        var dates = e.geometry.map(function (g) { return g.date }).filter(Boolean).sort();
        return { id: e.id, title: e.title, c: cat(e), d0: dates[0] || "", d1: dates[dates.length - 1] || "", near: best, peak: pk, unit: unit, geo: e.geometry.map(function (g) { return { t: g.type, c: g.coordinates, d: g.date, m: g.magnitudeValue } }), src: (e.sources || []).map(function (s) { return s.id }).join(", ") };
      }).filter(function (e) { return e.near <= RADIUS && e.d0 }).sort(function (a, b) { return a.d0 < b.d0 ? -1 : 1 });
      LAST = { place: P, lat: lat, lon: lon, bb: bb, y1: START, y2: y2, ev: ev, at: new Date().toISOString(), url: u };
      if (opt.quiet) return LAST;
      render(LAST); say(ev.length ? "Found " + ev.length + " natural event" + (ev.length > 1 ? "s" : "") + " within " + RADIUS + " km of " + P.name + " since " + START + "." : "EONET lists no natural events within " + RADIUS + " km of " + P.name + " since " + START + ".");
      share(LAST).catch(function () { });
      return LAST;
    } catch (e) { say("The natural event tracker could not be reached (" + (e.message || e) + "). Try again in a minute."); return null }
    finally { if (btn) btn.disabled = false; say = say0 }
  }

  /* ---------- words, map, chart, table ---------- */
  function counts(R) { var o = {}; R.ev.forEach(function (e) { o[e.c.name] = o[e.c.name] || { n: 0, col: e.c.col }; o[e.c.name].n++ }); return o }
  function summary(R) {
    var P = R.place, c = counts(R), names = Object.keys(c).sort(function (a, b) { return c[b].n - c[a].n });
    if (!R.ev.length) return "NASA's Earth Observatory Natural Event Tracker (EONET) lists no natural events within " + RADIUS + " km of " + P.name + " between " + R.y1 + " and " + R.y2 + ". EONET records notable events only, so this does not mean nothing happened.";
    var near = R.ev.reduce(function (a, b) { return b.near < a.near ? b : a }), st = R.ev.filter(function (e) { return e.peak != null && /kts/i.test(e.unit) }), big = st.length ? st.reduce(function (a, b) { return b.peak > a.peak ? b : a }) : null;
    return "NASA's Earth Observatory Natural Event Tracker (EONET) lists " + R.ev.length + " natural event" + (R.ev.length > 1 ? "s" : "") + " whose track or location came within " + RADIUS + " km of " + P.name + " between " + R.y1 + " and " + R.y2 + ": " +
      names.map(function (k) { return c[k].n + " " + k.toLowerCase() }).join(", ") + ". The closest was " + near.title + " (" + near.d0.slice(0, 10) + "), about " + Math.round(near.near) + " km away." +
      (big ? " The strongest storm by EONET's recorded wind speed was " + big.title + ", with winds of up to " + big.peak + " knots (about " + Math.round(big.peak * 1.852) + " km/h)." : "");
  }
  function drawMap(R, W, H, cb) {
    var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"), bb = R.bb;
    var X = function (lo) { return (lo - bb.w) / (bb.e - bb.w) * W }, Y = function (la) { return (bb.n - la) / (bb.n - bb.s) * H };
    var finish = function () {
      var s = W / 900; x.lineCap = "round"; x.lineJoin = "round";
      R.ev.forEach(function (e) {
        x.strokeStyle = e.c.col; x.fillStyle = e.c.col; x.lineWidth = 2.4 * s; x.globalAlpha = .9;
        var line = e.geo.filter(function (g) { return g.t === "Point" }).map(function (g) { return g.c });
        if (line.length > 1) { x.beginPath(); line.forEach(function (p, i) { i ? x.lineTo(X(p[0]), Y(p[1])) : x.moveTo(X(p[0]), Y(p[1])) }); x.stroke() }
        e.geo.forEach(function (g) { pts(g).slice(0, 200).forEach(function (p) { x.beginPath(); x.arc(X(p[0]), Y(p[1]), (line.length > 1 ? 2.2 : 5) * s, 0, 7); x.fill() }) });
      });
      x.globalAlpha = 1;
      var ry = RADIUS / 111.2 / (bb.n - bb.s) * H, rx = RADIUS / (111.2 * Math.cos(R.lat * Math.PI / 180)) / (bb.e - bb.w) * W;
      x.setLineDash([8 * s, 6 * s]); x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 2 * s; x.beginPath(); x.ellipse(X(R.lon), Y(R.lat), rx, ry, 0, 0, 7); x.stroke(); x.setLineDash([]);
      x.fillStyle = "#ff3b30"; x.strokeStyle = "#fff"; x.lineWidth = 2 * s; x.beginPath(); x.arc(X(R.lon), Y(R.lat), 6 * s, 0, 7); x.fill(); x.stroke();
      x.font = (13 * s) + "px sans-serif"; var cr = "Background: NASA Blue Marble (GIBS). Events: NASA EONET. Dashed circle: " + RADIUS + " km.", tw = x.measureText(cr).width;
      x.fillStyle = "rgba(0,0,0,.6)"; x.fillRect(0, H - 22 * s, tw + 16 * s, 22 * s); x.fillStyle = "#fff"; x.fillText(cr, 8 * s, H - 7 * s);
      cb(c);
    };
    var im = new Image(); im.crossOrigin = "anonymous";
    im.onload = function () { x.drawImage(im, 0, 0, W, H); finish() }; im.onerror = function () { x.fillStyle = "#1b2a3a"; x.fillRect(0, 0, W, H); finish() };
    im.src = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=BlueMarble_ShadedRelief_Bathymetry&STYLES=&CRS=EPSG:4326&BBOX=" + [bb.s, bb.w, bb.n, bb.e].map(function (v) { return v.toFixed(3) }).join(",") + "&WIDTH=" + W + "&HEIGHT=" + H + "&FORMAT=image/jpeg";
  }
  function drawChart(R, W, H, dark) {
    var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"), s = W / 900, FG = dark ? "#e6edf3" : "#1f2328";
    x.fillStyle = dark ? "#0d1117" : "#ffffff"; x.fillRect(0, 0, W, H);
    var yrs = [], by = {}; for (var y = R.y1; y <= R.y2; y++) { yrs.push(y); by[y] = [] } R.ev.forEach(function (e) { var y = +e.d0.slice(0, 4); if (by[y]) by[y].push(e) });
    var mx = Math.max(1, Math.max.apply(null, yrs.map(function (y) { return by[y].length }))), L = 40 * s, B = 30 * s, T = 12 * s, w = W - L - 10 * s, h = H - B - T, bw = w / yrs.length;
    x.fillStyle = FG; x.font = (12 * s) + "px sans-serif"; x.textAlign = "right"; x.fillText(String(mx), L - 6 * s, T + 10 * s); x.fillText("0", L - 6 * s, T + h);
    x.fillStyle = dark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)"; x.fillRect(L, T + h, w, 1);
    yrs.forEach(function (y, i) { var y0 = T + h; by[y].forEach(function (e) { var bh = h / mx; x.fillStyle = e.c.col; x.fillRect(L + i * bw + bw * .12, y0 - bh, bw * .76, bh - 1); y0 -= bh });
      if (y % 5 === 0) { x.fillStyle = FG; x.textAlign = "center"; x.fillText(String(y), L + i * bw + bw / 2, T + h + 18 * s) } });
    x.save(); x.translate(12 * s, T + h / 2); x.rotate(-Math.PI / 2); x.textAlign = "center"; x.fillStyle = FG; x.fillText("Events per year", 0, 0); x.restore();
    return c;
  }
  function legend(R) { var c = counts(R); return Object.keys(c).map(function (k) { return '<span style="margin-right:14px;white-space:nowrap"><i style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;background:' + c[k].col + '"></i>' + esc(k) + " (" + c[k].n + ")</span>" }).join("") }
  function rows(R) { return R.ev.map(function (e) { return [e.title, e.c.name, e.d0.slice(0, 10) + (e.d1 && e.d1.slice(0, 10) !== e.d0.slice(0, 10) ? " to " + e.d1.slice(0, 10) : ""), Math.round(e.near) + " km", e.peak != null ? e.peak + " " + (e.unit || "") : "–"] }) }
  function render(R) {
    var box = $("cmpevbox"); if (!box) return;
    box.innerHTML = '<p>' + esc(summary(R)) + '</p><div id="cmpevmap" style="max-width:640px"></div><p class="cmpnote" style="margin:6px 0 12px">' + legend(R) + '</p>' +
      (R.ev.length ? '<div id="cmpevch" style="max-width:640px"></div><div style="overflow-x:auto;margin-top:10px"><table class="acctab"><thead><tr><th>Event</th><th>Type</th><th>Dates</th><th>Closest to the pin</th><th>Peak (as EONET records it)</th></tr></thead><tbody>' +
        rows(R).map(function (r) { return "<tr>" + r.map(function (v, i) { return "<td" + (i > 2 ? ' class="n"' : "") + ">" + esc(v) + "</td>" }).join("") + "</tr>" }).join("") + "</tbody></table></div>" : "") +
      '<p class="cmpnote">Source: NASA Earth Observatory Natural Event Tracker (EONET), which gathers events reported by GDACS, JTWC, NOAA, USGS, InciWeb and others. EONET lists notable events, mostly from 2000 onwards, so it is not a complete record. Ocean-climate patterns such as El Niño are not events in EONET and are not included.</p>' +
      '<button type="button" id="cmpevplay">Hear the events</button> <button type="button" id="cmpevpdf">Download the natural events report (PDF)</button>';
    drawMap(R, 900, 900, function (c) { c.style.width = "100%"; c.style.borderRadius = "8px"; c.setAttribute("role", "img"); c.setAttribute("aria-label", "Map of natural events near " + R.place.name); var m = $("cmpevmap"); if (m) m.appendChild(c) });
    if (R.ev.length) { var ch = drawChart(R, 900, 260, true); ch.style.width = "100%"; ch.setAttribute("role", "img"); ch.setAttribute("aria-label", "Natural events per year"); $("cmpevch").appendChild(ch) }
    $("cmpevplay").onclick = function () { play(R) }; $("cmpevpdf").onclick = function () { makePdf(R).then(function (d) { if (d) d.save(fname(R) + ".pdf") }) };
  }

  /* ---------- one note per event, in time order: storms low, floods middle, fires high; closer events louder ---------- */
  var AC = null;
  function play(R, opt) {   /* opt.ctx: an OfflineAudioContext to render into (the audio report); returns the length in seconds */
    var X = opt && opt.ctx; if (!R.ev.length || (!X && window.MUTE)) return 0; if (!X) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return 0 } }
    var A = X || AC, dest = (opt && opt.dest) || A.destination, t0 = A.currentTime + .2, span = 20, a = Date.UTC(R.y1, 0, 1), b = Date.now(), base = { severeStorms: 196, floods: 262, wildfires: 392, volcanoes: 147, earthquakes: 131 };
    R.ev.forEach(function (e, i) {
      var t = t0 + (Date.parse(e.d0) - a) / (b - a) * span, f = (base[e.c.id] || 330) * (e.peak ? 1 + Math.min(1, e.peak / 160) * .5 : 1), g = .05 + .2 * (1 - e.near / RADIUS);
      var o = A.createOscillator(), v = A.createGain(); o.type = "triangle"; o.frequency.value = f; v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + .02); v.gain.exponentialRampToValueAtTime(.0005, t + 1.4);
      o.connect(v); v.connect(dest); o.start(t); o.stop(t + 1.5);
    });
    if (X) return span + 1.8;
    say("Playing " + R.ev.length + " events from " + R.y1 + " to today in 20 seconds: low notes are storms, middle notes floods, high notes fires; louder means closer.");
  }

  /* ---------- the PDF report ---------- */
  function fname(R) { return ("EarthJukebox_natural_events_" + R.place.name + "_" + R.y1 + "-" + R.y2).replace(/[^A-Za-z0-9_\-]+/g, "_").replace(/_+/g, "_") }
  function jspdf() { if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF); return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload = function () { res(window.jspdf.jsPDF) }; s.onerror = rej; document.head.appendChild(s) }) }
  async function makePdf(R) {
    var J = await jspdf(), doc = new J({ unit: "pt", format: "a4", compress: true }), M = 50, W = 595.28, H = 841.89, cw = W - 2 * M, y = 60;
    var need = function (h) { if (y + h > H - 50) { doc.addPage(); y = 60 } };
    var para = function (t, size, style) { doc.setFont("times", style || "normal"); doc.setFontSize(size || 10.5); var L = doc.splitTextToSize(t, cw); L.forEach(function (l) { need(size * 1.35 || 14); doc.text(l, M, y); y += (size || 10.5) * 1.35 }); y += 4 };
    doc.setTextColor(20, 20, 20); para("Natural Events near " + R.place.name + ", " + R.y1 + " to " + R.y2, 20, "bold");
    doc.setTextColor(90, 90, 90); para("Earth Jukebox natural events report. Point of analysis " + R.lat.toFixed(4) + ", " + R.lon.toFixed(4) + (R.place.country ? " (" + R.place.country + ")" : "") + ". Made " + R.at.slice(0, 10) + ".", 9.5); doc.setTextColor(20, 20, 20);
    para(summary(R), 11);
    var map = await new Promise(function (res) { drawMap(R, 1000, 1000, res) }), mh = Math.min(cw, 420); need(mh + 30); doc.addImage(map.toDataURL("image/jpeg", .85), "JPEG", M + (cw - mh) / 2, y, mh, mh, undefined, "FAST"); y += mh + 6;
    doc.setFontSize(8.5); doc.setFont("times", "italic"); var cap = doc.splitTextToSize("Figure 1. Natural events from NASA EONET whose track or location came within " + RADIUS + " km (dashed circle) of the point of analysis (red dot). Lines are storm tracks; dots are recorded positions. Colours: " + Object.keys(counts(R)).join(", ") + " (see the table).", cw); doc.text(cap, M, y + 8); y += cap.length * 11 + 14;
    if (R.ev.length) { var ch = drawChart(R, 1000, 290, false), chh = cw * 290 / 1000; need(chh + 30); doc.addImage(ch.toDataURL("image/png"), "PNG", M, y, cw, chh, undefined, "FAST"); y += chh + 6; doc.text("Figure 2. Natural events per year, coloured by type.", M, y + 8); y += 22;
      need(40); doc.setFont("times", "bold"); doc.setFontSize(12); doc.text("All events", M, y); y += 16;
      var cols = [190, 70, 120, 50, 65], hdr = ["Event", "Type", "Dates", "Closest", "Peak"], row = function (r, bold) { doc.setFont("times", bold ? "bold" : "normal"); doc.setFontSize(8.5); var lines = r.map(function (v, i) { return doc.splitTextToSize(String(v), cols[i] - 6) }), hh = Math.max.apply(null, lines.map(function (l) { return l.length })) * 10.5 + 4; need(hh); var x = M; lines.forEach(function (l, i) { doc.text(l, x, y + 9); x += cols[i] }); y += hh; doc.setDrawColor(220, 220, 220); doc.line(M, y - 2, M + cw, y - 2) };
      row(hdr, true); rows(R).forEach(function (r) { row(r) }); y += 10 }
    para("Method and limits", 12, "bold");
    para("Events come from NASA's Earth Observatory Natural Event Tracker (EONET, eonet.gsfc.nasa.gov), which gathers events reported by GDACS, the Joint Typhoon Warning Center, NOAA, USGS, InciWeb and other agencies. The site asked EONET for every event (open and closed) from " + R.y1 + " to the day of the report in a box of about " + Math.round(R.bb.n - R.bb.s) + " degrees around the point, then kept those whose recorded track or location came within " + RADIUS + " km (great-circle distance). Wind speeds are shown only where EONET records them, in its own units (knots). EONET lists notable events, mostly from 2000 onwards; it is not a complete record, so a missing event does not mean nothing happened. Ocean-climate patterns such as El Niño and La Niña are not events in EONET and are not included.", 10);
    para("Source: NASA EONET, query " + R.url, 8);
    var n = doc.getNumberOfPages(); for (var p = 1; p <= n; p++) { doc.setPage(p); doc.setFont("times", "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 110); doc.text("Earth Jukebox natural events report | " + R.place.name + " | page " + p + " of " + n, M, H - 26); doc.text("Data: NASA EONET, NASA GIBS (Blue Marble).", W - M, H - 26, { align: "right" }) }
    return doc;
  }

  /* ---------- share to the Archives: the events, a preview picture and the PDF ---------- */
  function base() { return window.ASSISTANT_URL ? String(window.ASSISTANT_URL).replace(/\/$/, "") + "/library" : "" }
  async function gz(s) { var cs = new CompressionStream("gzip"), w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)); w.close(); return new Uint8Array(await new Response(cs.readable).arrayBuffer()) }
  async function share(R) {
    return;   /* natural events are part of the in-depth research report, so they are not saved to the Archives on their own */
    var B = base(); if (!B || R.ev.length < 3 || window.EJ_NOSHARE) return;
    var vv = await fetch(B.replace(/\/library$/, "") + "/version").then(function (r) { return r.json() }).catch(function () { return {} }); if (!(String(vv.v || "") >= "2026-11-10d")) return;   /* older Workers would file it as a research */
    var meta = { type: "events", place: String(R.place.name).slice(0, 160), country: String(R.place.country || "").slice(0, 80), lat: +R.lat.toFixed(4), lon: +R.lon.toFixed(4), y1: R.y1, y2: R.y2, sections: Math.min(80, R.ev.length), made: R.at, kinds: "Natural events", area: "within " + RADIUS + " km", v: "ev1" };
    var body = await gz(JSON.stringify({ type: "events", R: { place: R.place, lat: R.lat, lon: R.lon, bb: R.bb, y1: R.y1, y2: R.y2, at: R.at, url: R.url, ev: R.ev } })); if (body.length < 1100) return;
    var r = await fetch(B + "/save?meta=" + encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(meta))))), { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: body }), j = await r.json().catch(function () { return {} });
    if (!r.ok || !j.id) return; var id = j.id;
    var map = await new Promise(function (res) { drawMap(R, 640, 400, res) }), tb = await new Promise(function (res) { map.toBlob(res, "image/jpeg", .82) });
    if (tb && window.EJAR && EJAR.postRetry) await EJAR.postRetry(B + "/thumb?id=" + encodeURIComponent(id), "image/jpeg", tb).catch(function () { });
    var doc = await makePdf(R); if (window.EJAR && EJAR.postRetry) await EJAR.postRetry(B + "/pdf?id=" + encodeURIComponent(id), "application/pdf", doc.output("arraybuffer"));
    say("Found " + R.ev.length + " natural events within " + RADIUS + " km.");
  }

  /* ---------- buttons in the compare panel ---------- */
  function demo() {
    var st = $("cmpdeepst"); if (st) st.textContent = "Loading a finished example (Dhaka, 1980 and 2020)…";
    if (window.EJL && EJL.load) EJL.load(DEMO_ID).then(function () { if (st) st.textContent = "Loaded a finished example: Dhaka, 1980 and 2020. Its maps, graphs and tables are below; the PDF report is ready from the button further down." }, function () { if (window.EJAR) EJAR.openArchives() });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (!b) return; if (b.id === "cmpev") analyse(); else if (b.id === "cmpdemo") demo() });
  window.EJEV = { drawMap: drawMap, drawChart: drawChart, rows: rows, counts: counts, analyse: analyse, makePdf: makePdf, summary: summary, play: play, fname: fname, last: function () { return LAST }, RADIUS: RADIUS };
})();
