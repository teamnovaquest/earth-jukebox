/* Earth Jukebox: Data panel and Range.
   Data panel: every dataset the site can read, with its real value for the moment the timeline is on, at the pin or averaged
   over the Range. Each row says what the number is, where it comes from, which date or hour it belongs to, and what it does to
   the music. Nothing is estimated to fill a gap: a dataset without a value for that moment says so and why.
   Range: the circle around the pin that the music and the panel average over (radius in km, or the whole Earth).
   Averages use NASA's own grid cells whose centres fall inside the circle, weighted by each cell's area (cosine of latitude),
   except where a row says otherwise. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i) };
  var RAD = Math.PI / 180, ER = 6371.0088, HALF = ER * Math.PI;
  var MONS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function p2(n) { return (n < 10 ? "0" : "") + n }
  function num(v, dp) { if (v === null || v === undefined || !isFinite(v)) return "n/a"; var s = (+v).toFixed(dp); if (/^-0(\.0+)?$/.test(s)) s = s.slice(1); return s }
  function sig(v, n) { if (!isFinite(v)) return "n/a"; var a = Math.abs(v); if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(n - 1).replace("e+", " × 10^").replace("e-", " × 10^-"); return String(+v.toPrecision(n)) }
  function fmtKm(km) { return (km < 10 ? (+km.toFixed(1)).toString() : Math.round(km).toLocaleString("en-US")) + " km" }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  async function getJSON(u, opt, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 30000); try { var r = await fetch(u, Object.assign({ signal: ac.signal }, opt || {})); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json() } finally { clearTimeout(tm) } }
  async function getText(u, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 30000); try { var r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.text() } finally { clearTimeout(tm) } }
  function dist(la1, lo1, la2, lo2) { var a = Math.sin((la2 - la1) * RAD / 2), b = Math.sin((lo2 - lo1) * RAD / 2), h = a * a + Math.cos(la1 * RAD) * Math.cos(la2 * RAD) * b * b; return 2 * ER * Math.asin(Math.min(1, Math.sqrt(h))) }
  function dest(lat, lon, km, brg) { var d = km / ER, p1 = lat * RAD, l1 = lon * RAD, p2_ = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(brg)), l2 = l1 + Math.atan2(Math.sin(brg) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2_)); return [p2_ / RAD, ((l2 / RAD + 540) % 360) - 180] }

  /* =================================================================== Range */
  var RG = { mode: "pin", km: 0 };
  try { var sv = JSON.parse(localStorage.getItem("ejRange") || "null"); if (sv && /^(pin|km|earth)$/.test(sv.mode) && (sv.mode !== "km" || sv.km >= 1)) RG = sv } catch (e) { }
  var PRESETS = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, "earth"];
  /* the largest circle each kind of data can be averaged over here */
  function limitFor(kind) { return kind === "power" ? 1000 : kind === "veda" ? 2000 : Infinity }
  function curKind() { if (window.EICON) { var c = window.EIC && EIC.col; return c && c._gal ? "gal" : "veda" } return window.mode === "global" ? "global" : "power" }
  var EJRG = window.EJRG = {
    on: function () { return RG.mode !== "pin" },
    earth: function () { return RG.mode === "earth" },
    /* radius asked for (km); the whole Earth is half the circumference */
    km: function () { return RG.mode === "earth" ? HALF : RG.mode === "km" ? RG.km : 0 },
    /* radius actually used for a kind of data (smaller than asked when that data cannot be averaged so widely) */
    kmFor: function (kind) { var k = EJRG.km(); if (kind === "power") return k; if (RG.mode === "earth") return kind === "veda" ? null : HALF; return Math.min(k, limitFor(kind)) },
    /* "exact": NASA's own grid cells; "estimate": beyond NASA's area limit, estimated from evenly spread NASA points (see EST below) */
    method: function (kind) { return kind === "power" && (RG.mode === "earth" || (RG.mode === "km" && RG.km > limitFor("power"))) ? "estimate" : "exact" },
    label: function () { return RG.mode === "pin" ? "At the pin" : RG.mode === "earth" ? "Whole Earth" : "Within " + fmtKm(RG.km) + " of the pin" },
    state: function () { return { mode: RG.mode, km: RG.km } },
    set: setRange, limitFor: limitFor
  };
  function rangeNote() {
    var k = curKind(), lim = limitFor(k);
    if (RG.mode === "pin") return "The music and the Data panel use the value at the pin (NASA's grid cell that contains it).";
    if (k === "global") return "Whole Earth view: the record is already the global average, so the range does not change it.";
    if (k === "power" && EJRG.method("power") === "estimate") return "⚠ Estimated values. NASA POWER averages areas only up to 1,000 km here, so for " + (RG.mode === "earth" ? "the whole Earth" : fmtKm(RG.km)) + " Earth Jukebox estimates the average from " + estN(EJRG.km()) + " NASA points spread evenly over the area (equal-area sampling), corrected with NASA's MERRA-2 monthly maps of the same area. " + VALID.text;
    if (RG.mode === "earth" && k === "veda") return "This NASA VEDA dataset can be averaged here up to 2,000 km, not over the whole Earth, so the music uses the pin.";
    var s = "The music and the Data panel use the average of NASA's grid cells whose centres are " + (RG.mode === "earth" ? "anywhere on Earth" : "within " + fmtKm(RG.km) + " of the pin") + ", each weighted by its area.";
    if (RG.mode === "km" && RG.km > lim) s += " This dataset can be averaged here up to " + fmtKm(lim) + ", so " + fmtKm(lim) + " is used.";
    if (RG.mode === "km" && RG.km < 30) s += " NASA's grid cells are about 25 to 60 km across, so a circle this small usually holds no cell centre: the cell containing the pin is used, the same as at the pin.";
    return s;
  }
  function setRange(mode, km, quiet) {
    if (mode === "km") { km = +km; if (!(km >= 1)) km = 1; if (km >= HALF) { mode = "earth"; km = 0 } }
    RG = { mode: mode, km: mode === "km" ? Math.round(km * 10) / 10 : 0 };
    try { localStorage.setItem("ejRange", JSON.stringify(RG)) } catch (e) { }
    syncUI(); draw(); if (!quiet) reload();
  }
  function reload() {
    try {
      if (window.EICON) { var c = window.EIC && EIC.col; if (c && c._gal) { if (window.pinLL) galRecord() } else if (c && window.pinLL) eicRecord() }
      else if (window.last && window.mode !== "global") choose(last[0], last[1], last[2]);
    } catch (e) { }
    if (window.EJP) EJP.refresh();
  }
  /* ---- Range controls in the side panel ---- */
  function buildUI() {
    var host = $("earthPanel"); if (!host || $("rngBox")) return;
    var box = document.createElement("div"); box.id = "rngBox";
    box.innerHTML = '<label for="rng">Range</label><select id="rng" aria-describedby="rngex">' + PRESETS.map(function (p) { return '<option value="' + p + '">' + (p === 0 ? "At the pin" : p === "earth" ? "Whole Earth (entire surface)" : "Within " + fmtKm(p) + " of the pin") + "</option>" }).join("") + '<option value="c">Custom radius...</option></select>' +
      '<div id="rngc" style="display:none;margin-top:6px"><label for="rngv" style="font-size:12px">Radius in km (1 to 20,015; 20,015 km covers the whole Earth)</label><div style="display:flex;gap:6px"><input id="rngv" type="number" min="1" max="20015" step="any" value="150" style="flex:1"><button id="rngok" type="button" class="alt" style="width:auto;padding:6px 12px">Use</button></div></div>' +
      '<p class="ex" id="rngex"></p>';
    var where = host.firstElementChild; host.insertBefore(box, where ? where.nextSibling : host.firstChild);
    $("rng").addEventListener("change", function () { var v = this.value; if (v === "c") { $("rngc").style.display = "block"; $("rngv").focus(); return } $("rngc").style.display = "none"; setRange(v === "earth" ? "earth" : +v ? "km" : "pin", +v || 0) });
    $("rngok").addEventListener("click", function () { var v = +$("rngv").value; if (!(v >= 1) || v > 20015) { $("rngex").textContent = "Enter a radius from 1 to 20,015 km."; return } setRange("km", v) });
    $("rngv").addEventListener("keydown", function (e) { if (e.key === "Enter") $("rngok").click() });
    syncUI();
  }
  function syncUI() {
    var s = $("rng"); if (!s) return;
    var v = RG.mode === "pin" ? "0" : RG.mode === "earth" ? "earth" : String(RG.km);
    if (PRESETS.map(String).indexOf(v) >= 0) { s.value = v; $("rngc").style.display = "none" } else { s.value = "c"; $("rngc").style.display = "block"; $("rngv").value = RG.km }
    var tx = rangeNote(); $("rngex").textContent = tx; $("rngex").style.color = /^⚠/.test(tx) ? "var(--amber,#e0a43a)" : "";
  }
  EJRG.syncUI = syncUI;

  /* ---- golden circle on the globe and on the map ---- */
  var cap = null, ring = null, mapC = null;
  /* the circle drawn is the one the music actually uses (smaller than asked when this data cannot be averaged so widely) */
  function effKm() { var k = curKind(); if (RG.mode === "earth") return HALF; return EJRG.kmFor(k === "global" ? "gal" : k) || 0 }
  function draw() { drawGlobe(); drawMap() }
  EJRG.draw = draw;
  function drawGlobe() {
    if (typeof THREE === "undefined" || !window.earth) return;
    if (cap) { earth.remove(cap); cap.geometry.dispose(); cap = null } if (ring) { earth.remove(ring); ring.geometry.dispose(); ring = null }
    var P = window.pinLL; if (!P || RG.mode === "pin" || window.mode === "global") return;
    var ang = Math.min(Math.PI, effKm() / ER), mat = new THREE.MeshBasicMaterial({ color: 0xe0a43a, transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide });
    cap = new THREE.Mesh(new THREE.SphereGeometry(1.006, 96, Math.max(8, Math.min(64, Math.round(ang / Math.PI * 64))), 0, Math.PI * 2, 0, ang), mat);
    var p = (P[1] + 180) * RAD, c = Math.cos(P[0] * RAD), q = new THREE.Vector3(-Math.cos(p) * c, Math.sin(P[0] * RAD), Math.sin(p) * c).normalize();
    cap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q); earth.add(cap);
    if (ang < Math.PI - 1e-3) {
      var pts = []; for (var i = 0; i <= 128; i++) { var b = i / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.sin(ang) * Math.cos(b) * 1.007, Math.cos(ang) * 1.007, Math.sin(ang) * Math.sin(b) * 1.007)) }
      ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf0c060, transparent: true, opacity: .9 }));
      ring.quaternion.copy(cap.quaternion); earth.add(ring);
    }
  }
  function drawMap() {
    var M = window.MAPV && MAPV.map; if (!M || typeof L === "undefined") return;
    if (mapC) { M.removeLayer(mapC); mapC = null }
    var P = window.pinLL; if (!P || RG.mode === "pin" || window.mode === "global") return;
    var st = { color: "#e0a43a", weight: 2, fillColor: "#e0a43a", fillOpacity: .2, interactive: false };
    if (effKm() >= HALF - 1) { mapC = L.rectangle([[-85.05, -180], [85.05, 180]], st).addTo(M); return }
    var km = effKm(), pts = [], n = 256;
    for (var i = 0; i <= n; i++) pts.push(dest(P[0], P[1], km, i / n * Math.PI * 2));
    /* keep the outline continuous across the 180th meridian; a circle around a pole becomes a band */
    for (var j = 1; j < pts.length; j++) { var d = pts[j][1] - pts[j - 1][1]; if (d > 180) pts[j][1] -= 360; else if (d < -180) pts[j][1] += 360 }
    var poleN = dist(P[0], P[1], 90, 0) <= km, poleS = dist(P[0], P[1], -90, 0) <= km;
    if (poleN || poleS) { var sorted = pts.slice(); if (poleN) { pts.push([85.05, pts[pts.length - 1][1]], [85.05, pts[0][1]]) } else { pts.push([-85.05, pts[pts.length - 1][1]], [-85.05, pts[0][1]]) } }
    var shift = [-360, 0, 360].map(function (s) { return pts.map(function (q) { return [Math.max(-85.05, Math.min(85.05, q[0])), q[1] + s] }) });
    mapC = L.polygon(shift, st).addTo(M);
  }

  /* ---- POWER averaged over the range (regional API: one parameter per request, boxes of 2 to 10 degrees) ---- */
  var PWC = {};
  /* boxes of 2 to 10 degrees (POWER's limits) that together cover the circle; longitudes kept within -180..180 */
  function boxes(lat, lon, km) {
    var dlat = km / 111.32, s = Math.max(-90, lat - dlat), n = Math.min(90, lat + dlat), far = Math.min(89.5, Math.max(Math.abs(s), Math.abs(n))),
      dlon = Math.min(180, km / (111.32 * Math.max(.01, Math.cos(far * RAD)))), w = lon - dlon, e = lon + dlon;
    if (n - s < 2) { var m = (n + s) / 2; s = Math.max(-90, Math.min(88, m - 1)); n = s + 2 }
    if (e - w < 2) { var c = (e + w) / 2; w = c - 1; e = c + 1 }
    if (e - w >= 360) { w = -180; e = 180 }
    var lons = [];
    function addLon(a, b) { if (b - a < 2) { if (a > -180) a = Math.max(-180, b - 2); else b = a + 2 } lons.push([a, b]) }
    function norm(a, b) { while (a < -180) { a += 360; b += 360 } while (a >= 180) { a -= 360; b -= 360 } if (b > 180) { addLon(a, 180); addLon(-180, b - 360) } else addLon(a, b) }
    var nw = Math.ceil((e - w) / 10), hw = (e - w) / nw; for (var j = 0; j < nw; j++) norm(w + j * hw, w + (j + 1) * hw);
    var out = [], ns = Math.ceil((n - s) / 10), hs = (n - s) / ns;
    for (var i = 0; i < ns; i++) { var bs = s + i * hs, bn = s + (i + 1) * hs; if (bn - bs < 2) { bs = Math.max(-90, bn - 2); bn = bs + 2 } lons.forEach(function (L2) { out.push({ s: bs, n: bn, w: L2[0], e: L2[1] }) }) }
    return out;
  }
  async function powerBox(param, b, endY) {
    var u = "https://power.larc.nasa.gov/api/temporal/monthly/regional?community=AG&parameters=" + param + "&start=1981&end=" + endY + "&format=JSON&latitude-min=" + b.s.toFixed(3) + "&latitude-max=" + b.n.toFixed(3) + "&longitude-min=" + b.w.toFixed(3) + "&longitude-max=" + b.e.toFixed(3);
    for (var k = 0; k < 3; k++) { try { return await getJSON(u, null, 90000) } catch (e) { if (k === 2) throw e; await sleep(1500 * (k + 1)) } }
  }
  /* returns {p: {PARAM: {YYYYMM: value}}, units: {PARAM: unit}, cells, single, note} in the same form as the point API */
  async function powerArea(lat, lon, km, params, onProg) {
    var key = lat.toFixed(3) + "," + lon.toFixed(3) + "|" + km + "|" + params.join(",");
    if (PWC[key]) return PWC[key];
    PWC[key] = (async function () {
      var bx = boxes(lat, lon, km), jobs = [], res = {}, units = {}, done = 0, endY = new Date().getUTCFullYear();
      if (bx.length > 16) throw new Error("a circle this wide this close to a pole needs " + bx.length + " separate NASA POWER downloads per value; choose a smaller range here");
      params.forEach(function (p) { bx.forEach(function (b) { jobs.push([p, b]) }) });
      /* POWER gives the months up to the end of the last complete year: ask for this year, then last year, if refused */
      async function one(j) {
        var r = null;
        for (var y = endY; y >= endY - 2 && !r; y--) { try { r = await powerBox(j[0], j[1], y) } catch (e) { if (y === endY - 2) throw e } }
        (res[j[0]] = res[j[0]] || []).push(r); var pm = r.parameters && r.parameters[j[0]]; if (pm) units[j[0]] = pm.units; done++; if (onProg) onProg(done, jobs.length);
      }
      var nx = 0; await Promise.all([1, 2, 3, 4].map(async function () { while (nx < jobs.length) await one(jobs[nx++]) }));
      var out = {}, cells = 0, single = false;
      params.forEach(function (p) {
        var seen = {}, feats = [];
        (res[p] || []).forEach(function (r) { (r.features || []).forEach(function (f) { var c = f.geometry.coordinates, k = c[1].toFixed(4) + "," + c[0].toFixed(4); if (seen[k]) return; seen[k] = 1; feats.push(f) }) });
        var inside = feats.filter(function (f) { var c = f.geometry.coordinates; return dist(lat, lon, c[1], c[0]) <= km });
        if (!inside.length && feats.length) { single = true; var best = null, bd = 1e9; feats.forEach(function (f) { var c = f.geometry.coordinates, d = dist(lat, lon, c[1], c[0]); if (d < bd) { bd = d; best = f } }); inside = [best] }
        cells = Math.max(cells, inside.length);
        var sums = {};
        inside.forEach(function (f) { var c = f.geometry.coordinates, w = Math.cos(c[1] * RAD), v = f.properties.parameter[p] || {}; Object.keys(v).forEach(function (k) { var x = v[k]; if (x === null || x <= -998) return; var s = sums[k] || (sums[k] = [0, 0]); s[0] += w * x; s[1] += w }) });
        var o = {}; Object.keys(sums).forEach(function (k) { if (sums[k][1] > 0) o[k] = sums[k][0] / sums[k][1] }); out[p] = o;
      });
      return { p: out, units: units, cells: cells, single: single, boxes: bx.length };
    })();
    PWC[key].catch(function () { delete PWC[key] });
    return PWC[key];
  }
  EJRG.powerArea = powerArea;
  /* the music's record (index.html getPower) asks here when a range is set */
  EJRG.power = function (lat, lon, params, onProg) { var km = EJRG.kmFor("power"); return EJRG.method("power") === "estimate" ? estimate(lat, lon, km, onProg) : powerArea(lat, lon, km, params || PW, onProg) };

  /* ---- beyond NASA's area limit: a statistical estimate ----
     1. N points spread evenly over the circle (a Fibonacci pattern on the sphere: every point stands for the same area),
        and NASA POWER's monthly record at each (each point gives its 0.5° × 0.625° grid cell's value).
     2. The plain mean of the points estimates the area mean. Its error comes from where the points happen to fall
        (mountains, coasts), and is almost the same every year, so it is measured and removed with NASA's MERRA-2 monthly
        maps (NASA GIBS): for each calendar month, the map's full area mean minus the map's mean at the same N points
        (2005 and 2020 averaged). Temperatures and pressure get this difference added; rain and wind are multiplied by
        the ratio. Values with no such map are left as the plain point mean.
     3. VALID: the whole method was tested against NASA POWER's exact 1,000 km averages at seven places (numbers below). */
  var EST = {}, CORR = { T2M: ["MERRA2_2m_Air_Temperature_Monthly", "d"], T2M_MAX: ["MERRA2_2m_Air_Temperature_Monthly", "d"], T2M_MIN: ["MERRA2_2m_Air_Temperature_Monthly", "d"], TS: ["MERRA2_Surface_Skin_Temperature_Monthly", "d"], PRECTOTCORR: ["MERRA2_Precipitation_Bias_Corrected_Monthly", "r"], WS10M: ["MERRA2_Surface_Wind_Speed_Monthly", "r"], PS: ["MERRA2_Surface_Pressure_Monthly", "r"] };
  /* measured 9 Nov 2026 (see CLAUDE.md): the estimate at 1,000 km against NASA POWER's exact average, every month 1981–2025, and the
     sampling step alone against NASA's exact GEOS-FP hourly temperature averages for larger areas */
  var VALID = { text: "Accuracy tested against NASA's own exact averages: at seven places (Amazon, Sahara, Dhaka, Paris, Kansas, Sydney, Himalaya; 1,000 km circles, every month 1981–2025) the typical monthly error was 0.07 °C for temperature (worst place 0.30 °C), about 3% for rain (worst 6%; in the near-rainless Sahara 0.04 mm/day), 0.05 m/s or less for wind and under 1 point of relative humidity, and temperature trends were within 0.01 °C per decade. NASA gives no exact average beyond 1,000 km, so larger areas were checked on NASA's exact hourly GEOS-FP temperatures instead: the point sampling alone (before the map correction) was within 0.14 °C at 2,500 km, 0.31 °C at 5,000 km and 0.30 °C for the whole Earth. Other values (cloud, sunlight, soil wetness, pressure) were not tested and may be less exact.", t: 0.07, tWorst: 0.30, rain: 3 };
  function estN(km) { return km >= HALF - 1 ? 96 : km > 3000 ? 64 : 48 }
  function fib(lat, lon, km, N) { var a = Math.min(Math.PI, km / ER), GA = Math.PI * (3 - Math.sqrt(5)), out = []; for (var i = 0; i < N; i++) { var z = 1 - (1 - Math.cos(a)) * (i + .5) / N, th = Math.acos(Math.max(-1, Math.min(1, z))); out.push(dest(lat, lon, th * ER, i * GA)) } return out }
  async function powerPoint(la, lo) {
    var u = "https://power.larc.nasa.gov/api/temporal/monthly/point?community=AG&longitude=" + lo.toFixed(3) + "&latitude=" + la.toFixed(3) + "&start=1981&format=JSON&parameters=" + PW.join(","), y = new Date().getUTCFullYear();
    for (var k = 0; k < 3; k++) { try { return await getJSON(u + "&end=" + (y - k), null, 60000) } catch (e) { if (k === 2) return null; await sleep(800) } }
  }
  async function corrFor(layer, kind, lat, lon, km, pts) {
    var all = km >= HALF - 1, dl = km / 111.32, s = all ? -90 : Math.max(-90, lat - dl), n = all ? 90 : Math.min(90, lat + dl), far = Math.min(89.5, Math.max(Math.abs(s), Math.abs(n))), dn = all ? 180 : Math.min(180, km / (111.32 * Math.max(.01, Math.cos(far * RAD)))), w = Math.max(-180, lon - dn), e = Math.min(180, lon + dn);
    if (all || lon - dn < -180 || lon + dn > 180) { w = -180; e = 180 }
    var bb = { s: s, n: n, w: w, e: e }, W = all ? 256 : 160, H = Math.max(16, Math.min(all ? 128 : 160, Math.round(W * (n - s) / ((e - w) * Math.max(.05, Math.cos((s + n) / 2 * RAD)))))), out = [];
    var jobs = []; [2005, 2020].forEach(function (y) { for (var m = 1; m <= 12; m++) jobs.push([y, m]) });
    var nx = 0, res = [];
    await Promise.all([1, 2, 3, 4].map(async function () { while (nx < jobs.length) { var j = jobs[nx++]; try { res.push([j[1], await mapPair(layer, j[0] + "-" + p2(j[1]) + "-01", bb, W, H, lat, lon, km, all, pts)]) } catch (e2) { } } }));
    for (var m = 1; m <= 12; m++) { var r = res.filter(function (q) { return q[0] === m && q[1] }).map(function (q) { return q[1] }); out.push(r.length ? (kind === "d" ? r.reduce(function (a, q) { return a + (q.area - q.samp) }, 0) / r.length : r.reduce(function (a, q) { return a + q.area }, 0) / Math.max(1e-12, r.reduce(function (a, q) { return a + q.samp }, 0))) : null) }
    return out;
  }
  async function mapPair(layer, day, bb, W, H, lat, lon, km, all, pts) {
    var g = await EJD.grid(layer, layer, day, bb, W, H), sw = 0, swv = 0, ss = 0, sc = 0;
    for (var y = 0; y < H; y++) { var la = bb.n - (y + .5) * (bb.n - bb.s) / H, wt = Math.cos(la * RAD); for (var x = 0; x < W; x++) { var lo = bb.w + (x + .5) * (bb.e - bb.w) / W, v = g.v[y * W + x]; if (!(v === v)) continue; if (!all && dist(lat, lon, la, lo) > km) continue; sw += wt; swv += wt * v } }
    pts.forEach(function (q) { var x = Math.floor((q[1] - bb.w) / (bb.e - bb.w) * W), y = Math.floor((bb.n - q[0]) / (bb.n - bb.s) * H); if (x < 0 || y < 0 || x >= W || y >= H) return; var v = g.v[y * W + x]; if (v === v) { ss += v; sc++ } });
    return sw > 0 && sc >= pts.length * .8 ? { area: swv / sw, samp: ss / sc } : null;
  }
  async function estimate(lat, lon, km, onProg) {
    var key = lat.toFixed(3) + "," + lon.toFixed(3) + "|" + km;
    if (EST[key]) return EST[key];
    EST[key] = (async function () {
      var N = estN(km), pts = fib(lat, lon, km, N), res = new Array(N), nx = 0, done = 0;
      await Promise.all([1, 2, 3, 4].map(async function () { while (nx < N) { var i = nx++; res[i] = await powerPoint(pts[i][0], pts[i][1]); done++; if (onProg) onProg(done, N + 7) } }));
      var ok = res.filter(Boolean); if (ok.length < N * .8) throw new Error("NASA POWER answered for only " + ok.length + " of " + N + " points");
      var units = {}; Object.keys(ok[0].parameters || {}).forEach(function (q) { units[q] = ok[0].parameters[q].units });
      var used = pts.filter(function (q, i) { return res[i] }), out = {}, se = {};
      PW.forEach(function (q) { var sums = {}; ok.forEach(function (r) { var v = r.properties.parameter[q] || {}; Object.keys(v).forEach(function (k) { var x = v[k]; if (x === null || x <= -998) return; (sums[k] = sums[k] || []).push(x) }) }); out[q] = {}; var ses = []; Object.keys(sums).forEach(function (k) { var a = sums[k]; if (a.length < ok.length * .8) return; var m = a.reduce(function (x, y) { return x + y }, 0) / a.length; out[q][k] = m; if (+k.slice(4) <= 12) ses.push(Math.sqrt(a.reduce(function (x, y) { return x + (y - m) * (y - m) }, 0) / (a.length - 1) / a.length)) }); se[q] = ses.length ? ses.reduce(function (x, y) { return x + y }, 0) / ses.length : null });
      /* step 2: remove the sampling error with NASA's MERRA-2 maps of the same area */
      var layers = {}; Object.keys(CORR).forEach(function (q) { layers[CORR[q][0]] = CORR[q][1] });
      var C = {}, li = 0; for (var L in layers) { try { C[L] = await corrFor(L, layers[L], lat, lon, km, used) } catch (e) { C[L] = null } li++; if (onProg) onProg(N + li, N + 7) }
      var corrected = [];
      Object.keys(CORR).forEach(function (q) { var c = C[CORR[q][0]]; if (!c) return; var any = false; Object.keys(out[q]).forEach(function (k) { var m = +k.slice(4), f = m >= 1 && m <= 12 ? c[m - 1] : null; if (f === null || !isFinite(f)) return; out[q][k] = CORR[q][1] === "d" ? out[q][k] + f : out[q][k] * f; any = true }); if (any) corrected.push(q) });
      return { p: out, units: units, cells: ok.length, est: true, n: ok.length, se: se, corrected: corrected };
    })();
    EST[key].catch(function () { delete EST[key] });
    return EST[key];
  }
  EJRG.estimate = estimate; EJRG.fib = fib;

  /* ---- EIC colour frames averaged over the range (the 512 x 256 sample each frame is read from) ---- */
  EJRG.galAt = function (data, lat, lon, lut, thr, d) {
    var km = EJRG.kmFor("gal"); if (!km) return galAt(data, lat, lon, lut, thr, d);
    var sw = 0, swv = 0, mx = 0, n = 0, all = km >= HALF - 1, la0 = lat - km / 111.32, la1 = lat + km / 111.32;
    for (var Y = 0; Y < 256; Y++) {
      var plat = 90 - (Y + .5) * 180 / 256; if (!all && (plat < la0 - 1 || plat > la1 + 1)) continue;
      var w = Math.cos(plat * RAD);
      for (var X = 0; X < 512; X++) {
        var plon = -180 + (X + .5) * 360 / 512; if (!all && dist(lat, lon, plat, plon) > km) continue;
        if (d && d.key === "sst" && landAt(plat, plon) > 128) continue;
        var o = (Y * 512 + X) * 4, px = [data[o], data[o + 1], data[o + 2], data[o + 3]], t = d ? galPx(d, px, lut, thr, plat) : galDecode(px, lut, thr);
        if (t === null || t === undefined) continue; sw += w; swv += w * t; n++;
      }
    }
    if (!n) return galAt(data, lat, lon, lut, thr, d);
    return swv / sw;
  };

  /* ---- NASA VEDA datasets averaged over the range (VEDA's statistics service over a circle) ---- */
  function circlePoly(lat, lon, km) { var pts = []; for (var i = 0; i <= 96; i++) { var q = dest(lat, lon, km, i / 96 * Math.PI * 2); pts.push([q[1], q[0]]) } for (var j = 1; j < pts.length; j++) { var d = pts[j][0] - pts[j - 1][0]; if (d > 180) pts[j][0] -= 360; else if (d < -180) pts[j][0] += 360 } return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [pts] } } }
  EJRG.vedaStat = async function (cid, iid, asset, bi, lat, lon, km) {
    var u = "https://openveda.cloud/api/raster/collections/" + encodeURIComponent(cid) + "/items/" + encodeURIComponent(iid) + "/statistics?assets=" + encodeURIComponent(asset);
    var j = await getJSON(u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(circlePoly(lat, lon, km)) }, 40000);
    var st = j.properties && j.properties.statistics; if (!st) return null; var ks = Object.keys(st), s = st[ks[Math.min(bi || 0, ks.length - 1)]];
    return s && s.count > 0 && isFinite(s.mean) ? { v: s.mean, n: s.count } : null;
  };

  /* =================================================================== Data panel */
  var OPEN = false, TOK = 0, CACHE = {}, ROWS = [], INST = null, LASTKEY = "";
  try { OPEN = localStorage.getItem("ejDP") === "1" } catch (e) { }
  function cached(k, f) { if (!CACHE[k]) { CACHE[k] = f(); CACHE[k].catch(function () { delete CACHE[k] }) } return CACHE[k] }

  /* the moment the timeline is on: {t (ms, UTC), res: hour | day | month | year, label} */
  function instant() {
    var S = window.series, i = window.idx; if (!S || !S.length || !S[i]) return null; var x = S[i];
    if (window.EICON) {
      var c = window.EIC && EIC.col, d = c && c._gal;
      if (d) {
        if (window.EJN && EJN.ok(d) && d.num.times[i]) { var t = Date.parse(d.num.times[i]); return { t: t, res: "hour", label: new Date(t).toISOString().slice(0, 16).replace("T", " ") + " UTC" } }
        if (x.fid) { var pp = x.fid.split("|"), tm = (pp[1] || "").replace(/\s*UTC/i, "").trim(), hr = /^\d{1,2}:\d{2}$/.test(tm); var t2 = Date.parse(pp[0] + "T" + (hr ? (tm.length === 4 ? "0" + tm : tm) : "12:00") + ":00Z"); if (isFinite(t2)) return { t: t2, res: hr ? "hour" : "day", label: pp[0] + (hr ? " " + tm + " UTC" : "") } }
        return null;
      }
      var den = (c && c["dashboard:time_density"]) || "day", t3 = Date.UTC(x.y, (x.m || 1) - 1, x.d || 1);
      return { t: t3, res: den === "month" ? "month" : den === "year" ? "year" : "day", label: den === "month" ? MONS[(x.m || 1) - 1] + " " + x.y : den === "year" ? String(x.y) : x.date };
    }
    return { t: Date.UTC(x.y, x.m - 1, 15), res: "month", label: MONS[x.m - 1] + " " + x.y };
  }
  function ym(t) { var d = new Date(t); return d.getUTCFullYear() + p2(d.getUTCMonth() + 1) }
  function monthLabel(t) { var d = new Date(t); return MONS[d.getUTCMonth()] + " " + d.getUTCFullYear() }
  function loc() { var P = window.pinLL; if (!P) return null; return { lat: P[0], lon: P[1] } }

  /* ---------- sources ---------- */
  /* NASA POWER, monthly (MERRA-2 meteorology; CERES/GEWEX sunlight and cloud) */
  var PW = ["T2M", "T2M_MAX", "T2M_MIN", "TS", "PRECTOTCORR", "RH2M", "QV2M", "WS10M", "CLOUD_AMT", "ALLSKY_SFC_SW_DWN", "GWETTOP", "PS"];
  var PWU = { "C": "°C", "MJ/m^2/day": "MJ/m²/day", "1": "", "%": "%", "mm/day": "mm/day", "g/kg": "g/kg", "m/s": "m/s", "kPa": "kPa" };
  function powerAll(L) {
    var km = EJRG.on() ? EJRG.kmFor("power") : 0;
    return cached("pw|" + L.lat.toFixed(3) + "," + L.lon.toFixed(3) + "|" + km, async function () {
      if (km > 0 && EJRG.method("power") === "estimate") { var es = await estimate(L.lat, L.lon, km, function (d, n) { prog("Estimating the area average: " + d + " of " + n + " steps") }); prog(""); return { p: es.p, units: es.units, est: es, how: "⚠ ESTIMATE: mean of " + es.n + " evenly spread NASA POWER points over " + (km >= HALF - 1 ? "the whole Earth" : fmtKm(km)) } }
      if (km > 0) { var a = await powerArea(L.lat, L.lon, km, PW, function (d, n) { prog("NASA POWER area average: " + d + " of " + n + " downloads") }); prog(""); return { p: a.p, units: a.units, how: a.single ? "the NASA POWER grid cell containing the pin (the circle holds no cell centre)" : "average of " + a.cells + " NASA POWER grid cells (0.5° × 0.625°) within " + fmtKm(km) } }
      var base = "https://power.larc.nasa.gov/api/temporal/monthly/point?community=AG&longitude=" + L.lon + "&latitude=" + L.lat + "&start=1981&format=JSON&parameters=" + PW.join(","), j = null, y = new Date().getUTCFullYear();
      for (var k = 0; k < 3 && !j; k++) { try { j = await getJSON(base + "&end=" + (y - k), null, 60000) } catch (e) { if (k === 2) throw e } }
      var units = {}; Object.keys(j.parameters || {}).forEach(function (p) { units[p] = j.parameters[p].units });
      return { p: j.properties.parameter, units: units, how: "the NASA POWER grid cell containing the pin (0.5° × 0.625°)" };
    });
  }
  function powerSrc(id, qty, name, type, param, dp, sound) {
    return { id: id, qty: qty, name: name, type: type, res: "month", sound: sound, src: "NASA POWER (MERRA-2 reanalysis" + (/ALLSKY|CLOUD/.test(param) ? "; sunlight and cloud from NASA CERES" : "") + "), monthly", url: "https://power.larc.nasa.gov/",
      get: async function (I, L) {
        var A = await powerAll(L), s = A.p[param] || {}, k = ym(I.t), v = s[k];
        var keys = Object.keys(s).filter(function (q) { return +q.slice(4) <= 12 && s[q] > -998 }).sort(), last = keys[keys.length - 1];
        if (v === undefined || v === null || v <= -998) { if (last && k > last) return { na: "not yet published for " + monthLabel(I.t) + " (latest: " + MONS[+last.slice(4) - 1] + " " + last.slice(0, 4) + ")" }; return { na: "no value for " + monthLabel(I.t) + (keys.length ? " (record " + keys[0].slice(0, 4) + "–" + last.slice(0, 4) + ")" : "") } }
        var u = A.units[param]; u = PWU[u] !== undefined ? PWU[u] : u;
        var est = A.est, sev = est && est.se[param], unc = est ? (est.corrected.indexOf(param) >= 0 ? ", corrected with NASA MERRA-2 maps of the area" : "; no NASA map to correct this value, so it is less exact") + (sev ? "; sampling uncertainty ±" + num(sev, dp) + " " + u + " (standard error of the points)" : "") : "";
        return { v: v, txt: (est ? "≈ " : "") + (param === "GWETTOP" ? num(v, 2) + " (0 = dry, 1 = saturated)" : num(v, dp) + " " + u), at: monthLabel(I.t), how: A.how + unc };
      } };
  }
  /* NASA GIBS monthly maps read back as numbers (each colour is one published value class) */
  function gibsSrc(id, qty, name, type, layer, cm, unitTxt, dp, sound, src, url, mul) {
    mul = mul || 1;   /* NASA's colour scale units -> the units shown (MERRA-2 dust is in kg/m³ on NASA's scale: × 10⁹ = µg/m³) */
    return { id: id, qty: qty, name: name, type: type, res: "month", sound: sound, src: src, url: url,
      get: async function (I, L) {
        if (!window.EJD || !EJD.grid) return { na: "map reader not loaded" };
        try { await buildMap() } catch (e) { }
        var info = window.MAP && MAP[layer], d = new Date(I.t), day = d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-01";
        if (info && !avail(info, Date.parse(day))) { var e = Math.max.apply(null, info.ranges.map(function (r) { return r.e })), s0 = Math.min.apply(null, info.ranges.map(function (r) { return r.s })); return { na: Date.parse(day) > e ? "not yet published for " + monthLabel(I.t) + " (latest: " + monthLabel(e) + ")" : "no map for " + monthLabel(I.t) + " (maps " + new Date(s0).getUTCFullYear() + "–" + new Date(e).getUTCFullYear() + ")" } }
        var km = EJRG.kmFor("gal"), r = await cached("gb|" + layer + "|" + day + "|" + L.lat.toFixed(3) + "," + L.lon.toFixed(3) + "|" + (km || 0), function () { return gibsValue(layer, cm, day, L, km, mul) });
        if (!r) return { na: id === "snow" ? "no snow value in NASA's map for " + monthLabel(I.t) + " (NASA leaves snow-free ground and missing data uncoloured, so the two cannot be told apart)" : "no value here in NASA's map for " + monthLabel(I.t) + " (no data, cloud or water)" };
        var dp2 = r.w > 0 ? Math.max(0, Math.ceil(-Math.log10(r.w)) + 1) : dp, vt = r.cls ? (dp2 > 4 ? sig(r.v, 3) : num(r.v, dp2)) : Math.abs(r.v) > 0 && Math.abs(r.v) < 1e-3 ? sig(r.v, 3) : num(r.v, dp);
        return { v: r.v, txt: (r.cens < 0 ? "below " : r.cens > 0 ? "at least " : "") + vt + (unitTxt ? " " + unitTxt : "") + (r.cls ? " (NASA colour class " + r.cls + ")" : ""), at: monthLabel(I.t), how: r.how };
      } };
  }
  async function gibsValue(layer, cm, day, L, km, mul) {
    mul = mul || 1;
    if (!km) {
      /* GIBS answers a 1-pixel request with an empty image, so a 5 x 5 pixel patch (0.01° pixels) is asked for and its centre read */
      var bb = { s: L.lat - .025, n: L.lat + .025, w: L.lon - .025, e: L.lon + .025 }, g = await EJD.grid(layer, cm, day, bb, 5, 5), v = g.v[12];
      if (!(v === v)) return null; var e = g.ent && g.ent[12];
      var ok = e && isFinite(e.lo) && isFinite(e.hi) && e.hi > e.lo;
      return { v: v * mul, cens: g.cens[12], w: ok ? (e.hi - e.lo) * mul : 0, cls: ok ? sig(e.lo * mul, 4) + " to " + sig(e.hi * mul, 4) : null, how: "NASA's map at the pin" };
    }
    var all = km >= HALF - 1, dl = km / 111.32, s = all ? -90 : Math.max(-90, L.lat - dl), n = all ? 90 : Math.min(90, L.lat + dl), cl = Math.cos(Math.min(89, Math.max(Math.abs(s), Math.abs(n))) * RAD), dn = all ? 180 : Math.min(180, km / (111.32 * Math.max(.02, cl))), w = all ? -180 : Math.max(-180, L.lon - dn), e2 = all ? 180 : Math.min(180, L.lon + dn);
    var W = Math.max(8, Math.min(512, Math.round((e2 - w) / .05))), H = Math.max(8, Math.min(256, Math.round((n - s) / .05)));
    var g2 = await EJD.grid(layer, cm, day, { s: s, n: n, w: w, e: e2 }, W, H), sw = 0, swv = 0, cnt = 0, cens = 0;
    for (var y = 0; y < H; y++) { var la = n - (y + .5) * (n - s) / H, wt = Math.cos(la * RAD); for (var x = 0; x < W; x++) { var lo = w + (x + .5) * (e2 - w) / W, k = y * W + x, v2 = g2.v[k]; if (!(v2 === v2)) continue; if (!all && dist(L.lat, L.lon, la, lo) > km) continue; sw += wt; swv += wt * v2; cnt++; if (g2.cens[k]) cens++ } }
    if (!cnt) return null;
    return { v: swv / sw * mul, cens: 0, cls: null, how: "area-weighted average of " + cnt.toLocaleString("en-US") + " evenly spaced points of NASA's map " + (all ? "over the whole Earth" : "within " + fmtKm(km)) + (cens ? "; " + cens + " points were beyond the colour scale's end and count as that end value" : "") };
  }
  /* NASA VEDA OMI nitrogen dioxide, monthly (exact values) */
  var NO2 = null;
  function no2Items() { if (!NO2) { NO2 = getJSON("https://openveda.cloud/api/stac/collections/no2-monthly/items?limit=300", null, 30000).then(function (j) { return (j.features || []).map(function (f) { var dt = f.properties.datetime || f.properties.start_datetime; return { id: f.id, ym: dt.slice(0, 4) + dt.slice(5, 7) } }) }); NO2.catch(function () { NO2 = null }) } return NO2 }
  var no2Src = { id: "no2", qty: "no2col", name: "Nitrogen dioxide (NO₂), whole air column", type: "NO₂ molecules above each cm² of ground (troposphere)", res: "month", sound: "", src: "NASA OMI (Aura satellite) tropospheric NO₂, monthly, via NASA VEDA", url: "https://www.earthdata.nasa.gov/dashboard/data-catalog/no2",
    get: async function (I, L) {
      var it = await no2Items(), k = ym(I.t), m = it.filter(function (x) { return x.ym === k })[0];
      if (!m) { var ks = it.map(function (x) { return x.ym }).sort(); return { na: "no NASA map for " + monthLabel(I.t) + (ks.length ? " (maps " + ks[0].slice(0, 4) + "–" + ks[ks.length - 1].slice(0, 4) + ")" : "") } }
      var km = EJRG.kmFor("veda"); if (EJRG.earth()) return { na: "the whole-Earth average is not available for this dataset" };
      var r = await cached("no2|" + m.id + "|" + L.lat.toFixed(3) + "," + L.lon.toFixed(3) + "|" + km, async function () {
        if (km > 0) { var s = await EJRG.vedaStat("no2-monthly", m.id, "cog_default", 0, L.lat, L.lon, km); return s ? { v: s.v, how: "average of " + s.n + " NASA 0.1° cells within " + fmtKm(km) + " (each cell counts equally)" } : null }
        var j = await getJSON("https://openveda.cloud/api/raster/collections/no2-monthly/items/" + encodeURIComponent(m.id) + "/point/" + L.lon + "," + L.lat + "?assets=cog_default", null, 30000), v = j.values && j.values[0];
        return v !== null && v !== undefined && isFinite(v) && v > -1e29 ? { v: v, how: "NASA's 0.1° cell at the pin" } : null;
      });
      if (!r) return { na: "no value here for " + monthLabel(I.t) + " (cloud, snow or no satellite pass)" };
      return { v: r.v, txt: num(r.v / 1e15, 2) + " × 10¹⁵ molecules/cm²", at: monthLabel(I.t), how: r.how };
    } };
  /* NOAA Mauna Loa CO2 and NASA GISS global temperature: one number for the whole planet */
  var CO2 = null, GIS = null;
  function co2() { if (!CO2) { CO2 = getText("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv", 30000).then(function (t) { var o = {}; t.split("\n").forEach(function (l) { if (/^\s*#|^year/.test(l)) return; var c = l.split(","); if (c.length < 4) return; var y = +c[0], m = +c[1], v = +c[3]; if (y && m && v > 0) o[y + p2(m)] = v }); return o }); CO2.catch(function () { CO2 = null }) } return CO2 }
  /* NASA GISS does not let web pages read its table directly: try anyway, then this site's relay, then the copy saved with the frames */
  async function gisText() {
    var U = "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv", tries = [U], a = window.ASSISTANT_URL;
    if (location.protocol !== "file:") tries.push((a ? a.replace(/\/$/, "") + "/nasa?u=" : "api/nasa?u=") + encodeURIComponent(U));
    tries.push((window.EIC_MANIFEST_URL ? window.EIC_MANIFEST_URL.replace(/manifest\.json.*$/, "") : "eic/") + "gistemp_GLB.csv");
    for (var i = 0; i < tries.length; i++) { try { var t = await getText(tries[i], 20000); if (/Year,Jan,Feb/.test(t.slice(0, 400))) return t } catch (e) { } }
    throw new Error("NASA GISS's global temperature table could not be reached");
  }
  window.ejGistemp = function () { if (!window.__gisT) { window.__gisT = gisText(); window.__gisT.catch(function () { window.__gisT = null }) } return window.__gisT };
  function gis() { if (!GIS) { GIS = window.ejGistemp().then(function (t) { var o = {}; t.split("\n").forEach(function (l) { var c = l.split(","); if (!/^\d{4}$/.test(c[0])) return; for (var m = 1; m <= 12; m++) { var v = parseFloat(c[m]); if (!isNaN(v)) o[c[0] + p2(m)] = v } }); return o }); GIS.catch(function () { GIS = null }) } return GIS }
  var co2Src = { id: "co2", qty: "co2", name: "Carbon dioxide (CO₂) in the air", type: "CO₂ concentration, monthly mean (parts per million)", res: "month", global: true, sound: "", src: "NOAA Global Monitoring Laboratory, Mauna Loa Observatory, Hawaii (the planet's longest CO₂ record; the same for every pin)", url: "https://gml.noaa.gov/ccgg/trends/",
    get: async function (I) { var o = await co2(), k = ym(I.t), v = o[k]; if (v === undefined) { var ks = Object.keys(o).sort(); return { na: k > ks[ks.length - 1] ? "not yet published for " + monthLabel(I.t) : "record starts March 1958" } } return { v: v, txt: num(v, 2) + " ppm", at: monthLabel(I.t), how: "measured at Mauna Loa" } } };
  var gisSrc = { id: "gis", qty: "gtemp", name: "Global temperature (whole Earth)", type: "Difference from the 1951–1980 average, land and ocean", res: "month", global: true, sound: "", src: "NASA GISS Surface Temperature Analysis (GISTEMP v4), monthly", url: "https://data.giss.nasa.gov/gistemp/",
    get: async function (I) { var o = await gis(), k = ym(I.t), v = o[k]; if (v === undefined) { var ks = Object.keys(o).sort(); return { na: k > ks[ks.length - 1] ? "not yet published for " + monthLabel(I.t) : "record starts 1880" } } return { v: v, txt: (v > 0 ? "+" : "") + num(v, 2) + " °C", at: monthLabel(I.t), how: "global average" } } };

  /* NASA EIC gallery: NASA's own hourly numbers saved with the frames (exact), and colour-read daily frames */
  function galDs(key) { var m = window.GAL && GAL.man; return m && (m.datasets || []).filter(function (d) { return d.key === key })[0] }
  function numSrc(key, qty, name, type, sound) {
    return { id: "n_" + key, qty: qty, name: name, type: type, res: "hour", sound: sound, gal: key,
      get: async function (I, L) {
        var d = galDs(key); if (!d || !window.EJN || !EJN.ok(d)) return { na: d && d.num && d.num.failed ? "NASA's numbers were not saved for these frames" : "NASA's numbers for these frames are still being saved" };
        var times = d.num.times.map(Date.parse), j = -1, best = 1e15; times.forEach(function (t, i) { var dd = Math.abs(t - I.t); if (dd < best) { best = dd; j = i } });
        if (best > 31 * 60000) return { na: "no NASA frame for this hour (frames: " + d.num.times[0].slice(0, 10) + " to " + d.num.times[times.length - 1].slice(0, 10) + ")", outside: true };
        var km = EJRG.kmFor("gal"), r = await EJN.series(d, L.lat, L.lon, km || 0), v = r.vals[j];
        if (v === null || v === undefined || !isFinite(v)) return { na: "no value for this hour" };
        return { v: v, txt: EJN.fmt(d.num, v), at: d.num.times[j].replace("T", " ").replace("Z", " UTC"), how: (r.pin || r.single ? "NASA's grid cell at the pin" : "area-weighted average of " + r.cells.toLocaleString("en-US") + " NASA grid cells") + "; " + (d.num.short || d.num.what) };
      }, src: function () { var d = galDs(key); return d && d.num ? (d.num.short || d.num.what) + " (NASA's own numbers, hourly)" : "NASA GEOS model numbers, hourly" } };
  }
  function colSrc(key, qty, name, type, sound) {
    return { id: "c_" + key, qty: qty, name: name, type: type, res: "day", sound: sound, gal: key,
      get: async function (I, L) {
        var d = galDs(key); if (!d || !d.frames || !d.frames.length || !d.frames[0].date) return { na: "frames not available" };
        var S = window.EIC && EIC.col && EIC.col._gal && EIC.col._gal.key === key ? window.series : null, best = 1e15, j = -1;
        d.frames.forEach(function (f, i) { var t = Date.parse(f.date + "T" + (f.time ? f.time.replace(/\s*UTC/i, "") : "12:00") + (f.time && f.time.length <= 5 ? ":00Z" : "Z")); if (!isFinite(t)) t = Date.parse(f.date + "T12:00:00Z"); var dd = Math.abs(t - I.t); if (dd < best) { best = dd; j = i } });
        if (best > 36 * 3600000) return { na: "no NASA frame within a day and a half (frames: " + d.frames[0].date + " to " + d.frames[d.frames.length - 1].date + ")", outside: true };
        var f = d.frames[j], km = EJRG.kmFor("gal");
        var t = await cached("gc|" + key + "|" + f.s + "|" + L.lat.toFixed(3) + "," + L.lon.toFixed(3) + "|" + (km || 0), async function () { if (key === "sst") { try { await landMask() } catch (e) { } } var lut = GAL.luts[key] || await galLut(d), dt = await galSample(f.s); return km ? EJRG.galAt(dt, L.lat, L.lon, lut, d.thr || 26, d) : galAt(dt, L.lat, L.lon, lut, d.thr || 26, d) });
        if (t === null || t === undefined) return { na: key === "sst" ? "no reading here (land or sea ice)" : "no reading here on " + f.date };
        return { v: galPhys(d, t), t01: t, txt: galFmt(d, t) + " (read from the colour of NASA's frame)", at: f.date + (f.time ? " " + f.time : ""), how: (km ? "area-weighted average of the frame's colours" : "the frame's colour at the pin") };
      }, src: function () { var d = galDs(key); return "NASA EIC gallery: " + (d ? d.title : key) + ", read from the frame's colours" } };
  }

  var SOUND = {
    main: "Mood, speed and melody height (the main signal)",
    rain: "Raindrops: soft high notes, more of them when it rains more",
    wind: "Breeze: a soft rushing sound that grows with the wind",
    hum: "Echo: more humid air, a little more echo",
    cloud: "Tone: a little softer under more cloud",
    sun: "Sparkle: gentle chimes in sunny months",
    veg: "Harmony: fuller chords where the land is greener",
    haze: "Haze: muffled tone and a slow shimmer when the air is dirty",
    fire: "Crackle: louder where fires burn"
  };
  /* every row the panel can show, in display order; rows with the same "qty" are one quantity: the first that has a value
     for the moment's time step is shown (hourly NASA numbers before monthly records), so nothing is listed twice */
  var SRC = [
    numSrc("t2m", "t", "Air temperature (2 m)", "Air temperature 2 m above the ground", SOUND.main),
    powerSrc("pw_t", "t", "Air temperature (2 m)", "Monthly mean air temperature 2 m above the ground", "T2M", 1, SOUND.main),
    powerSrc("pw_tx", "tx", "Hottest temperature of the month", "Highest hourly air temperature in the month (2 m)", "T2M_MAX", 1, ""),
    powerSrc("pw_tn", "tn", "Coldest temperature of the month", "Lowest hourly air temperature in the month (2 m)", "T2M_MIN", 1, ""),
    powerSrc("pw_ts", "ts", "Surface (skin) temperature", "Temperature of the ground or sea surface itself, monthly mean", "TS", 1, ""),
    colSrc("sst", "sst", "Sea surface temperature", "Ocean surface temperature (MUR, daily)", ""),
    colSrc("rain", "pr", "Rain right now", "Rain rate from satellites (GPM IMERG)", SOUND.rain),
    powerSrc("pw_pr", "pr", "Rainfall", "Monthly mean rainfall per day (bias-corrected)", "PRECTOTCORR", 2, SOUND.rain),
    powerSrc("pw_rh", "rh", "Relative humidity", "How close the air is to saturation, monthly mean (2 m)", "RH2M", 1, SOUND.hum),
    numSrc("q2m", "q", "Humidity (water vapour)", "Grams of water vapour per kilogram of air (2 m)", ""),
    powerSrc("pw_q", "q", "Humidity (water vapour)", "Grams of water vapour per kilogram of air, monthly mean (2 m)", "QV2M", 2, ""),
    numSrc("wind", "ws", "Wind speed (10 m)", "Wind speed 10 m above the ground", SOUND.wind),
    powerSrc("pw_ws", "ws", "Wind speed (10 m)", "Monthly mean wind speed 10 m above the ground", "WS10M", 2, SOUND.wind),
    powerSrc("pw_cl", "cl", "Cloud cover", "Share of the sky covered by cloud, monthly mean", "CLOUD_AMT", 1, SOUND.cloud),
    powerSrc("pw_sw", "sw", "Sunlight reaching the ground", "Solar energy on a flat surface per day, monthly mean", "ALLSKY_SFC_SW_DWN", 2, SOUND.sun),
    powerSrc("pw_gw", "gw", "Soil wetness (top soil)", "Surface soil wetness, monthly mean", "GWETTOP", 2, ""),
    powerSrc("pw_ps", "ps", "Air pressure at the surface", "Surface pressure, monthly mean", "PS", 2, ""),
    gibsSrc("ndvi", "ndvi", "Vegetation greenness (NDVI)", "Normalised Difference Vegetation Index: −1 to 1, higher = greener", "MODIS_Terra_L3_NDVI_Monthly", "MODIS_L3_NDVI", "", 2, SOUND.veg, "NASA MODIS Terra monthly NDVI (1 km), read from NASA GIBS colour classes", "https://modis.gsfc.nasa.gov/data/dataprod/mod13.php"),
    gibsSrc("snow", "snow", "Snow cover", "Share of the ground covered by snow, monthly average", "MODIS_Terra_L3_Snow_Cover_Monthly_Average_Pct", "MODIS_NDSI_Snow_Cover", "%", 0, "", "NASA MODIS Terra monthly snow cover, read from NASA GIBS colour classes", "https://nsidc.org/data/mod10cm"),
    numSrc("pm25", "pm", "Fine particles (PM2.5)", "Particles smaller than 2.5 µm in the air near the ground", SOUND.haze),
    gibsSrc("aod", "aod", "Haze (aerosol optical depth)", "How much sunlight dust, smoke and pollution block (0 = clear)", "MERRA2_Aerosol_Optical_Depth_Analysis_Monthly", "MERRA2_Aerosol_Optical_Depth_Analysis_Monthly", "", 2, SOUND.haze, "NASA MERRA-2 aerosol optical depth, monthly, read from NASA GIBS colour classes", "https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/"),
    gibsSrc("dust", "dust", "Dust near the ground (PM2.5 size)", "Mass of fine dust per cubic metre of air near the ground, monthly mean", "MERRA2_Dust_Surface_Mass_Concentration_PM25_Monthly", "MERRA2_Dust_Surface_Mass_Concentration_PM25_Monthly", "µg/m³", 1, "", "NASA MERRA-2 dust, monthly, read from NASA GIBS colour classes", "https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/", 1e9),
    numSrc("co", "co", "Carbon monoxide (CO) near the ground", "Parts per billion of air near the ground", ""),
    gibsSrc("mopitt", "co", "Carbon monoxide (CO) near the ground", "Parts per billion of air near the ground, monthly (daytime)", "MOPITT_CO_Monthly_Surface_Mixing_Ratio_Day", "MOPITT_CO_Surface_Mixing_Ratio", "ppbv", 0, "", "NASA Terra MOPITT carbon monoxide, monthly, read from NASA GIBS colour classes", "https://www2.acom.ucar.edu/mopitt"),
    numSrc("nox", "nox", "Nitrogen oxides (NO + NO₂) near the ground", "Parts per billion of air near the ground", ""),
    no2Src,
    numSrc("o3", "o3", "Ozone (O₃) near the ground", "Parts per billion of air near the ground", ""),
    colSrc("fires", "fire", "Active fires", "Fire brightness from satellites (5-day window); NASA prints no numbers on this scale", SOUND.fire),
    co2Src, gisSrc
  ];

  /* ---------- panel UI ---------- */
  var css = "#dpb{display:inline-block;margin:8px 0 0 0;pointer-events:auto;width:auto;background:rgba(10,14,20,.85);border:1px solid var(--amber,#e0a43a);color:var(--amber,#e0a43a);font-size:12px;font-weight:600;padding:5px 10px;cursor:pointer}#dpb:hover,#dpb[aria-pressed=true]{background:var(--amber,#e0a43a);color:#1a1205}" +
    "#dpan{position:absolute;left:16px;top:150px;bottom:16px;width:min(430px,36%);z-index:4;background:rgba(8,11,16,.94);border:1px solid var(--rule,#2a2f38);color:var(--bone,#ece6d8);display:flex;flex-direction:column;font-size:13px}#dpan[hidden]{display:none}" +
    "#dpan header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding:10px 12px 8px;border-bottom:1px solid var(--rule,#2a2f38)}#dpan header b{font-size:15px}#dpan header small{display:block;color:var(--mute,#9b978b);font-size:12px;margin-top:2px;line-height:1.35}#dpx{background:none;border:0;color:var(--bone,#ece6d8);font-size:20px;cursor:pointer;width:auto;padding:0 4px;line-height:1}" +
    "#dplist{list-style:none;margin:0;padding:4px 0;overflow-y:auto;flex:1}#dplist li{padding:7px 12px;border-bottom:1px solid rgba(255,255,255,.06)}#dplist .r1{display:flex;justify-content:space-between;gap:10px;align-items:baseline}#dplist .nm{font-weight:600}#dplist .nm i{font-style:normal;color:var(--mute,#9b978b);font-weight:400;margin-right:4px}#dplist .v{color:var(--amber,#e0a43a);font-weight:600;text-align:right;white-space:nowrap}#dplist .v.na{color:var(--mute,#9b978b);font-weight:400;white-space:normal;font-size:12px}" +
    "#dplist small{display:block;color:var(--mute,#9b978b);font-size:11.5px;line-height:1.4;margin-top:2px}#dplist small a{color:var(--mute,#9b978b)}#dplist .snd{color:#c9b98a}#dplist li.play{background:rgba(224,164,58,.08)}#dpfoot{padding:8px 12px;border-top:1px solid var(--rule,#2a2f38);color:var(--mute,#9b978b);font-size:11.5px;line-height:1.4}#dpout summary{cursor:pointer;color:var(--bone,#ece6d8);padding:6px 12px}" +
    "body.dpon #key{left:calc(min(430px,36%) + 32px);width:min(380px,30%);bottom:46px}" +
    "@media(max-width:860px){#dpan{position:relative;left:auto;top:auto;bottom:auto;width:auto;max-height:70vh;margin:8px}body.dpon #key{left:12px;transform:none}}";
  function buildPanel() {
    if ($("dpan")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var brand = document.querySelector(".brand"), b = document.createElement("button"); b.id = "dpb"; b.type = "button"; b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-controls", "dpan"); b.textContent = "Open Data Panel"; b.title = "Every dataset's real number for the moment the timeline is on";
    if (brand) { var ba = $("babadge"); if (ba && ba.parentNode === brand) { brand.appendChild(document.createElement("br")); brand.appendChild(b) } else brand.appendChild(b) } else { b.style.position = "fixed"; b.style.left = "12px"; b.style.top = "12px"; document.body.appendChild(b) }
    var p = document.createElement("section"); p.id = "dpan"; p.hidden = true; p.setAttribute("aria-label", "Data panel");
    p.innerHTML = '<header><div><b>Data panel</b><small id="dpsub">Waiting for the timeline</small></div><button id="dpx" type="button" aria-label="Close the Data panel">&times;</button></header><ol id="dplist" aria-live="off"></ol><details id="dpout"><summary>Not available for this moment</summary><ul id="dpna" style="margin:0;padding:0 12px 8px 26px;font-size:12px;color:var(--mute,#9b978b)"></ul></details><div id="dpfoot"></div>';
    var globe = document.querySelector(".globe") || document.body; globe.appendChild(p);
    b.addEventListener("click", function () { setOpen(!OPEN) }); $("dpx").addEventListener("click", function () { setOpen(false); b.focus() });
    window.addEventListener("resize", place);
    setOpen(OPEN, true);
  }
  function place() { var p = $("dpan"), br = document.querySelector(".brand"); if (!p || !br || window.innerWidth <= 860) return; var r = br.getBoundingClientRect(), g = p.parentNode.getBoundingClientRect(); p.style.top = Math.round(r.bottom - g.top + 10) + "px" }
  function setOpen(on, quiet) {
    OPEN = !!on; try { localStorage.setItem("ejDP", OPEN ? "1" : "0") } catch (e) { }
    var p = $("dpan"), b = $("dpb"); if (!p) return; p.hidden = !OPEN; b.setAttribute("aria-pressed", OPEN); b.textContent = OPEN ? "Close Data Panel" : "Open Data Panel"; document.body.classList.toggle("dpon", OPEN);
    if (OPEN) { place(); update(true) }
  }
  function prog(t) { var f = $("dpfoot"); if (f && t) f.textContent = t; else if (f && !t) foot() }
  function foot() { var f = $("dpfoot"); if (!f) return; f.innerHTML = "Every value is NASA's (or NOAA's) own number for the time shown on its row, never filled in by guesswork. Rows marked \"colour class\" or \"read from the colour\" are read back from NASA's published colour scales, so they are exact to that class. Range: " + esc(EJRG.label()) + ". " + esc(rangeNote()) }

  /* resolve every row for the current moment; rows whose quantity already has a value are skipped (no repeats) */
  async function resolve(I, L, tk) {
    var playing = window.EICON && window.EIC && EIC.col, pg = playing && EIC.col._gal ? EIC.col._gal.key : null, out = [], na = [], seen = {};
    /* the dataset being played in NASA VEDA mode is a row of its own, from the same value the music uses */
    if (playing && !pg) { var x = window.series[window.idx], c = EIC.col; out.push({ s: { name: c.title || c.id, type: "NASA VEDA dataset you are playing", src: "NASA VEDA (earth.gov data services)", url: "https://www.earthdata.nasa.gov/dashboard/", sound: SOUND.main }, r: x && x.v !== null && x.v !== undefined ? { v: x.v, txt: (typeof eicUnit === "function" ? eicUnit(c, x.v) : String(x.v)) + (x.est ? " (estimated between frames)" : "") + (x._me ? " (simulated: humans muted)" : ""), at: x.date, how: EJRG.on() && EJRG.kmFor("veda") ? "average over the range" : "at the pin" } : { na: "no value at this spot for this frame" }, play: true }) }
    var groups = {}; SRC.forEach(function (s) { (groups[s.qty] = groups[s.qty] || []).push(s) });
    var order = []; SRC.forEach(function (s) { if (order.indexOf(s.qty) < 0) order.push(s.qty) });
    var slots = [], part = function () { if (tk !== TOK) return; var R = { rows: [], na: [] }; if (out.length) R.rows = out.slice(); slots.forEach(function (x) { if (x) { if (x.miss) R.na.push(x); else R.rows.push(x) } }); render(I, R); music(R.rows) };
    var jobs = order.map(async function (q, qi) {
      var x = await job(q); slots[qi] = x; part(); return x;
    });
    async function job(q) {
      var list = groups[q], first = null;
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (s.res === "hour" && I.res === "month") continue;              /* hourly numbers exist only for the EIC frames' fortnight */
        if (s.res === "day" && I.res === "month") continue;
        if (s.gal && !galDs(s.gal)) continue;
        var r; try { r = await Promise.race([s.get(I, L), new Promise(function (_, no) { setTimeout(function () { no(new Error("the NASA server took too long")) }, 20000) })]) } catch (e) { r = { na: "could not be read just now (" + (e.message || e) + ")" } }   /* one slow server must never blank the whole panel */
        if (tk !== TOK) return;
        if (window.EJMH && r && !r.na) r = EJMH.adjust(s, r, I, L);   /* "Mute humans" (mutehumans.js): simulated temperatures and CO2, other rows marked real */
        if (r && !r.na) return { s: s, r: r, play: s.gal && s.gal === pg };
        if (!first || (first.r.outside && !r.outside)) first = { s: s, r: r };
      }
      return first ? Object.assign(first, { miss: true }) : null;
    }
    var res = await Promise.all(jobs); if (tk !== TOK) return null;
    res.forEach(function (x) { if (!x) return; if (x.miss) na.push(x); else out.push(x) });
    return { rows: out, na: na };
  }
  function srcOf(s) { return typeof s.src === "function" ? s.src() : s.src }
  function render(I, R) {
    var list = $("dplist"), nal = $("dpna"); if (!list) return;
    ROWS = R ? R.rows : [];
    list.innerHTML = ROWS.map(function (x, i) {
      var s = x.s, r = x.r;
      return '<li' + (x.play ? ' class="play"' : '') + '><div class="r1"><span class="nm"><i>' + (i + 1) + '.</i>' + esc(s.name) + (x.play ? ' <span style="color:var(--amber,#e0a43a);font-weight:400">· playing</span>' : '') + '</span><span class="v' + (r.na ? ' na' : '') + '">' + esc(r.na ? r.na : r.txt) + '</span></div>' +
        '<small>Type: ' + esc(s.type) + '</small><small>' + (r.at ? 'For: ' + esc(r.at) + ' · ' : '') + (r.how ? esc(r.how) : '') + '</small><small>Source: ' + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(srcOf(s)) + '</a>' : esc(srcOf(s))) + '</small>' + (s.sound ? '<small class="snd">Sound: ' + esc(s.sound) + '</small>' : '') + '</li>';
    }).join("") || '<li>Drop a pin and start the timeline to see the numbers.</li>';
    nal.innerHTML = (R ? R.na : []).map(function (x) { return "<li><b>" + esc(x.s.name) + "</b>: " + esc(x.r.na) + "</li>" }).join("");
    $("dpout").style.display = R && R.na.length ? "" : "none";
    foot();
  }
  var pend = 0, busy = false;
  function update(force) {
    var I = instant(), L = loc(), sub = $("dpsub");
    INST = I;
    if (!L && !(window.mode === "global")) { if (sub) sub.textContent = "Drop a pin on the globe to see every dataset's number"; render(null, null); return Promise.resolve() }
    if (!I) { if (sub) sub.textContent = "Waiting for the timeline (pick a dataset or press Play)"; return Promise.resolve() }
    var key = I.t + "|" + I.res + "|" + (L ? L.lat.toFixed(3) + "," + L.lon.toFixed(3) : "g") + "|" + JSON.stringify(RG) + "|" + (window.EICON ? (EIC.col && EIC.col.id) : window.mode) + (window.EJMH && EJMH.on() ? "|mh" : "");
    if (!force && key === LASTKEY) return Promise.resolve(); LASTKEY = key;
    if (sub) sub.textContent = (I.res === "hour" ? "Hour: " : I.res === "day" ? "Day: " : I.res === "year" ? "Year: " : "Month: ") + I.label + " · " + EJRG.label();
    var tk = ++TOK, Lx = L || { lat: 0, lon: 0 };
    if (!L) { /* whole-Earth view: only the planet-wide rows */ return Promise.all([co2Src, gisSrc].map(function (s) { return s.get(I).then(function (r) { return { s: s, r: window.EJMH && r && !r.na ? EJMH.adjust(s, r, I, null) : r } }, function (e) { return { s: s, r: { na: e.message } } }) })).then(function (rows) { if (tk === TOK) { render(I, { rows: rows.filter(function (x) { return !x.r.na }), na: rows.filter(function (x) { return x.r.na }) }); music(rows) } }) }
    return resolve(I, Lx, tk).then(function (R) { if (!R || tk !== TOK) return; render(I, R); music(R.rows) });
  }
  /* numbers the music layers use (musiclayers.js), taken from the same rows the panel shows */
  function music(rows) {
    var m = {}; (rows || []).forEach(function (x) { if (!x.r || x.r.na) return; var q = x.s.qty, v = x.r.v; if (v === null || v === undefined || !isFinite(v)) return;
      if (q === "pr") m.rain = x.s.res === "day" ? v * 24 : v;   /* IMERG frames are mm per hour; the music uses mm per day */
      else if (q === "ws") m.wind = v; else if (q === "rh") m.rh = v; else if (q === "cl") m.cloud = v; else if (q === "sw") m.sun = v; else if (q === "ndvi") m.ndvi = v;
      else if (q === "pm") m.pm25 = v; else if (q === "aod") m.aod = v; else if (q === "fire") m.fire = x.r.t01;
    });
    window.EJMV = m; if (window.EJM && EJM.set) EJM.set(m);
  }
  var deb = 0;
  function step() { clearTimeout(deb); deb = setTimeout(function () { if (OPEN || (window.EJM && EJM.wants())) update() }, 60) }
  /* text for blind assistance: every row as one sentence */
  function text() {
    if (!ROWS.length) return "The data panel has no numbers yet. Drop a pin and start the timeline first.";
    var I = INST, s = (I ? I.label + ". " : "") + EJRG.label() + ". ";
    return s + ROWS.map(function (x, i) { var r = x.r; return (i + 1) + ". " + x.s.name + ": " + (r.na ? r.na : r.txt.replace(/×\s*10¹⁵/g, "times 10 to the 15").replace(/µg\/m³/g, "micrograms per cubic metre").replace(/°C/g, "degrees Celsius").replace(/ppbv/g, "parts per billion").replace(/ppm/g, "parts per million").replace(/m\/s/g, "metres per second").replace(/mm\/day/g, "millimetres per day").replace(/MJ\/m²\/day/g, "megajoules per square metre per day").replace(/ %/g, " percent").replace(/g\/kg/g, "grams per kilogram").replace(/kPa/g, "kilopascals").replace(/ × 10\^-?/g, function (m) { return / × 10\^-/.test(m) ? " times 10 to the minus " : " times 10 to the " }).replace(/µm/g, "micrometres")) + (x.s.sound ? ". Sound: " + x.s.sound : "") }).join(". ") + ".";
  }
  window.EJP = { read: async function () { LASTKEY = ""; await update(true); return text() }, step: step, refresh: function () { LASTKEY = ""; CACHE = {}; update(true) }, update: update, open: function (v) { setOpen(v === undefined ? true : v) }, isOpen: function () { return OPEN }, text: text, rows: function () { return ROWS }, instant: instant, sources: SRC };

  /* ---------- hooks into the page ---------- */
  function hook() {
    buildUI(); buildPanel(); foot();
    if (typeof window.place === "function" && !window.place._ej) { var _p = window.place; window.place = function (lat, lon) { _p(lat, lon); draw(); syncUI(); if (window.EJP) setTimeout(function () { update(true) }, 0) }; window.place._ej = 1 }
    if (typeof window.mapPin === "function" && !window.mapPin._ej) { var _m = window.mapPin; window.mapPin = function (lat, lon) { _m(lat, lon); drawMap() }; window.mapPin._ej = 1 }
    if (typeof window.mapInit === "function" && !window.mapInit._ej) { var _i = window.mapInit; window.mapInit = function () { var r = _i.apply(this, arguments); drawMap(); return r }; window.mapInit._ej = 1 }
    draw();
    setInterval(function () { syncUI() }, 4000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hook); else hook();
})();
