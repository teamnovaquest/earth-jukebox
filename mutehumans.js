/* Earth Jukebox: "Mute humans", a simulation of each place without human-caused warming.
   It never changes NASA's numbers; it changes what the site plays and shows while it is on, and everything returns exactly as it was when it is off.

   THE SCIENCE (all published, nothing invented):
   1. How much of the world's warming humans caused, year by year: the "Indicators of Global Climate Change 2024" assessment
      (Forster et al., Earth System Science Data, 2025; data: github.com/ClimateIndicator/data, release v2025.06.11, CC BY 4.0).
      AW below is, for each year 1850-2024, the mean of the three attribution methods' central estimates (Gillett, Ribes, Walsh
      "anthropogenic_p50", global mean surface temperature, relative to 1850-1900). Their 2024 mean is 1.374 °C, the assessment's
      headline 1.37 °C (likely range 1.1-1.8). 2025 is the assessment's extrapolated 1.41 °C; later months continue at the
      table's own 2015-2025 pace (0.0334 °C a year) and are marked as extended.
   2. How a place's warming compares with the world's: IPCC AR6 WG1 Summary for Policymakers, A.1.2: 2011-2020 was 1.09 °C warmer
      than 1850-1900 globally, 1.59 °C over land and 0.88 °C over the ocean. So a land pin gets 1.59/1.09 = 1.46 times the world's
      human-caused warming, an ocean pin 0.88/1.09 = 0.81 times (NASA's land mask decides which). The whole Earth gets 1 times.
   3. Carbon dioxide without people: 278.3 ppm, the pre-industrial (1750) value in IPCC AR6.
   What is simulated: temperatures (air, skin, sea surface, hottest and coldest of the month, the global record) and CO2.
   What is not: rain, humidity, wind, clouds, air pollution, vegetation, snow and sea level. There is no reliable "without humans"
   value for them, so they stay NASA's real numbers and are labelled "real".
   Limits: it is an estimate for an average place on land or sea, not a local model; city heat and local land use are not included. */
(function () {
  "use strict";
  if (window.EJMH) return;
  var $ = function (id) { return document.getElementById(id) };
  var AW0 = 1850, AW = [-0.031,-0.042,-0.036,-0.026,-0.014,-0.02,-0.035,-0.023,-0.008,0.007,-0.015,-0.02,-0.023,-0.015,-0.023,-0.026,-0.021,-0.003,-0.008,-0.014,-0.008,-0.008,-0.007,-0.01,-0.005,0.003,0.004,-0.012,0.001,0.027,0.022,0,-0.001,0.01,0.024,0.014,0.01,-0.001,0.01,0.02,0.012,0.005,0.01,0.025,0.039,0.033,0.021,0.035,0.034,0.043,0.045,0.037,0.027,0.02,0.026,0.034,0.014,0.036,0.034,0.03,0.044,0.033,0.054,0.051,0.032,0.028,0.05,0.088,0.072,0.061,0.075,0.082,0.099,0.095,0.086,0.085,0.094,0.105,0.112,0.122,0.12,0.104,0.118,0.129,0.13,0.12,0.136,0.146,0.143,0.123,0.125,0.122,0.128,0.152,0.158,0.15,0.146,0.158,0.192,0.191,0.179,0.165,0.163,0.153,0.171,0.187,0.182,0.186,0.198,0.195,0.198,0.187,0.202,0.214,0.207,0.199,0.207,0.219,0.233,0.24,0.243,0.256,0.254,0.265,0.285,0.304,0.314,0.326,0.344,0.33,0.352,0.374,0.423,0.429,0.428,0.452,0.466,0.488,0.523,0.543,0.546,0.563,0.599,0.611,0.624,0.643,0.66,0.689,0.706,0.741,0.75,0.774,0.806,0.837,0.844,0.855,0.883,0.904,0.935,0.953,0.958,1.004,1.039,1.06,1.06,1.076,1.105,1.153,1.199,1.207,1.237,1.276,1.298,1.323,1.374,1.41];
  var PACE = 0.0334, LAND = 1.59 / 1.09, OCEAN = 0.88 / 1.09, CO2PI = 278.3, ON = false;

  /* human-caused global warming at a moment (°C above 1850-1900), linear between year middles */
  function aw(ms) {
    var d = new Date(ms), yf = d.getUTCFullYear() + (d.getUTCMonth() + .5) / 12, x = yf - .5 - AW0, n = AW.length;
    if (x <= 0) return AW[0]; if (x >= n - 1) return AW[n - 1] + PACE * (x - (n - 1));
    var i = Math.floor(x), f = x - i; return AW[i] + (AW[i + 1] - AW[i]) * f;
  }
  function extended(ms) { var d = new Date(ms); return d.getUTCFullYear() + (d.getUTCMonth() + .5) / 12 > AW0 + AW.length - .5 }
  function isLand(lat, lon) { return typeof landAt === "function" && window.LANDA ? landAt(lat, lon) > 128 : true }
  function beta(lat, lon) { if (lat === null || lat === undefined) return 1; return isLand(lat, lon) ? LAND : OCEAN }
  function W(lat, lon, ms) { return beta(lat, lon) * aw(ms) }
  function msOf(y, m) { return Date.UTC(y, (m || 1) - 1, 15) }
  function pin() { var P = window.pinLL; return P && window.mode !== "global" ? { lat: +P[0], lon: +P[1] } : null }

  /* ---------- 1. the timeline record (normal mode and whole Earth) ---------- */
  var KEYS = ["t", "ts", "an", "ans", "hT", "hL", "hS"];
  function backup(x) { if (!x._mh) { x._mh = {}; KEYS.forEach(function (k) { x._mh[k] = x[k] }) } }
  function restore(S) { S.forEach(function (x) { if (x._mh) { KEYS.forEach(function (k) { x[k] = x._mh[k] }); delete x._mh } }) }
  function zsReal(S, key, y1, y2) {   /* the 12-month rolling anomaly's spread over the base years, from NASA's real record */
    var rt = roll(S.map(function (x) { return x._mh ? x._mh[key] : x[key] }), 12), base = [];
    rt.forEach(function (v, i) { if (v !== null && S[i].y >= y1 && S[i].y <= y2) base.push(v) }); return base.length >= 12 ? sd(base) : 1;
  }
  function muteSeries(S) {
    if (!S.length || S._mhDone) return; var g = window.mode === "global", P = pin(), b = g ? 1 : beta(P && P.lat, P && P.lon), y1 = g ? 1951 : 1982, y2 = g ? 1980 : 2010;
    if (!S.some(function (x) { return x.an !== null && x.an !== undefined })) return;
    S.forEach(backup);
    var sT = zsReal(S, "an", y1, y2), sS = g ? sT : zsReal(S, "ans", y1, y2);
    var w = S.map(function (x) { return b * aw(msOf(x.y, x.m)) });
    var an = S.map(function (x, i) { var v = x._mh.an; return v === null || v === undefined ? null : v - w[i] }), as = S.map(function (x, i) { var v = x._mh.ans; return v === null || v === undefined ? null : v - w[i] });
    var zt = roll(an, 12).map(function (v) { return v === null ? null : Math.max(-4, Math.min(4, v / (sT || 1))) }), zs = roll(as, 12).map(function (v) { return v === null ? null : Math.max(-4, Math.min(4, v / (sS || 1))) });
    var zp = null; if (!g) { var rows = S.map(function (x) { return { y: x.y, m: x.m, p: x.pr } }); zp = zscores(anomalies(rows, "p"), rows, 1982, 2010) }
    S.forEach(function (x, i) {
      var r = x._mh; x.an = an[i]; x.ans = g ? r.ans : as[i];
      x.t = r.t === null || r.t === undefined ? r.t : r.t - w[i]; x.ts = r.ts === null || r.ts === undefined ? r.ts : r.ts - w[i];
      if (g) { var h = hFromZ(zt[i]); x.hT = x.hL = x.hS = h; return }
      x.hT = hFromZ(zt[i]); x.hS = hFromZ(zs[i]); x.hL = zt[i] === null ? null : clamp(.5 - .5 * (.65 * zt[i] - .35 * (zp[i] === null ? 0 : zp[i])) / 4);
    });
    S._mhDone = true;
  }
  function unmuteSeries(S) { if (S && S._mhDone) { restore(S); delete S._mhDone } }

  /* ---------- 2. EIC mode: the temperature datasets ---------- */
  function eicTemp() {
    var c = window.EIC && EIC.col; if (!c) return null; var d = c._gal;
    if (d) return d.key === "t2m" || d.key === "sst" ? { gal: d } : null;
    var tt = (c.title || "") + " " + (c.id || ""); return /temperature/i.test(tt) && !/anomal|difference|change/i.test(tt) ? { veda: c } : null;
  }
  function eicMs(x) { if (x.fid) { var p = x.fid.split("|"), tm = (p[1] || "").replace(/\s*UTC/i, "").trim(); var t = Date.parse(p[0] + "T" + (/^\d{1,2}:\d{2}$/.test(tm) ? (tm.length === 4 ? "0" + tm : tm) : "12:00") + ":00Z"); if (isFinite(t)) return t } return x.y ? Date.UTC(x.y, (x.m || 1) - 1, x.d || 15) : Date.now() }
  function muteEic(S) {
    var k = eicTemp(); if (!k || !S.length || S._mhE) return; var P = pin(), b = P ? beta(P.lat, P.lon) : 1;
    if (k.gal && k.gal.key === "sst") b = OCEAN;
    S.forEach(function (x) {
      if (x.v === null || x.v === undefined) return; x._me = { v: x.v, t: x.t, nv: x.nv, pv: x.pv };
      var w = b * aw(eicMs(x));
      if (k.gal) { var d = k.gal, phys = x.nv !== undefined && x.nv !== null ? x.nv : galPhys(d, x.t); if (phys === null || phys === undefined) return; var nv = phys - w, t = window.EJN ? EJN.toT(d, nv) : null; if (t === null || t === undefined) return; t = Math.max(0, Math.min(1, t));
        x.t = t; x.v = t * 100; x.nv = nv; x.pv = (d.scale && d.scale.unit ? "≈ " + nv.toFixed(1) + " " + d.scale.unit : galFmt(d, t)) + " (simulated)" }
      else x.v = x.v - w;
    });
    S._mhE = true;
  }
  function unmuteEic(S) { if (!S || !S._mhE) return; S.forEach(function (x) { if (x._me) { x.v = x._me.v; x.t = x._me.t; x.nv = x._me.nv; x.pv = x._me.pv; delete x._me } }); delete S._mhE }

  /* ---------- 3. hooks into the page (each wraps the page's own function and calls it unchanged) ---------- */
  function hookPage() {
    if (typeof window.setSeriesH === "function" && !window.setSeriesH._mh) { var sH = window.setSeriesH; window.setSeriesH = function () { var S = window.series; if (S && !window.EICON) { if (ON) muteSeries(S); else unmuteSeries(S) } return sH.apply(this, arguments) }; window.setSeriesH._mh = 1 }
    if (typeof window.eicScore === "function" && !window.eicScore._mh) { var eS = window.eicScore; window.eicScore = function () { var S = window.series; if (S && window.EICON) { if (ON) muteEic(S); else unmuteEic(S) } return eS.apply(this, arguments) }; window.eicScore._mh = 1 }
    if (typeof window.showOverlay === "function" && !window.showOverlay._mh) { var sO = window.showOverlay; window.showOverlay = function (t) { return overlay(sO, t) }; window.showOverlay._mh = 1 }
    if (typeof window.anRun === "function" && !window.anRun._mh) { var aR = window.anRun; window.anRun = async function () { AN_MUTE = ON; try { return await aR.apply(this, arguments) } finally { AN_MUTE = false } }; window.anRun._mh = 1 }
    if (typeof window.anPowerRows === "function" && !window.anPowerRows._mh) { var aP = window.anPowerRows; window.anPowerRows = async function (lat, lon) { var rows = await aP.apply(this, arguments); if (AN_MUTE) { var b = beta(lat, lon); rows.forEach(function (r) { var w = b * aw(msOf(r.y, r.m)); ["t", "tx", "ts"].forEach(function (k) { if (r[k] !== null && r[k] !== undefined) r[k] = r[k] - w }) }) } return rows }; window.anPowerRows._mh = 1 }
    if (typeof window.anGlobalFact === "function" && !window.anGlobalFact._mh) { var aG = window.anGlobalFact; window.anGlobalFact = async function (F) { if (!AN_MUTE) return aG.apply(this, arguments); return globalFactMuted(F) }; window.anGlobalFact._mh = 1 }
    ["anGalleryFacts", "anVedaFacts"].forEach(function (nm) { var f = window[nm]; if (typeof f !== "function" || f._mh) return; window[nm] = async function (lat, lon, F) { var n0 = F.length, r = await f.apply(this, arguments); if (AN_MUTE) { for (var i = F.length - 1; i >= n0; i--) if (/temperature|carbon dioxide|CO₂|\bCO2\b/i.test((F[i].name || "") + " " + (F[i].text || ""))) F.splice(i, 1) }   /* real temperature and CO2 readings would contradict the simulation: left out */ return r }; window[nm]._mh = 1 });
    if (typeof window.anPinText === "function" && !window.anPinText._mh) { var aT = window.anPinText; window.anPinText = function () { var s = aT.apply(this, arguments); return s && (ON || AN_MUTE) ? "Humans muted (simulation): " + s : s }; window.anPinText._mh = 1 }
    if (typeof window.anVerdict === "function" && !window.anVerdict._mh) { var aV = window.anVerdict; window.anVerdict = function (F) { if (AN_MUTE && F && !F.some(function (f) { return f.name === SIMNAME })) F.unshift({ id: "F0", kind: "context", name: SIMNAME, value: "simulation", text: SIMTEXT, dir: "neutral", src: "power", period: "1850–now" }); return aV.apply(this, arguments) }; window.anVerdict._mh = 1 }
  }
  var AN_MUTE = false, SIMNAME = "Simulation: humans muted",
    SIMTEXT = "THIS IS A SIMULATION, NOT A MEASUREMENT. Every temperature in these measurements had human-caused warming removed: the world's human-caused warming year by year (Indicators of Global Climate Change 2024, mean of three attribution methods; 1.37 °C in 2024) times 1.46 on land or 0.81 at sea (IPCC AR6). Rain, humidity and air-quality numbers are NASA's real values. An independent check made from real records will therefore show more warming than these numbers: that difference is the human part. Describe the result as how this place would be without human-caused warming.";
  async function globalFactMuted(F) {
    try { var g = await getGlobal(), by = {}; g.forEach(function (r) { if (r.y >= 1981 && r.an !== null) (by[r.y] = by[r.y] || []).push(r.an - aw(msOf(r.y, r.m))) }); var ys = [], vs = []; Object.keys(by).sort().forEach(function (y) { if (by[y].length === 12) { ys.push(+y); vs.push(anMean(by[y])) } }); var tr = anTrend(ys, vs);
      if (tr) F.push({ id: "F" + (F.length + 1), kind: "context", name: "Whole Earth without human-caused warming (simulated)", value: anFix(tr.slope * 10) + " °C per decade", text: "Simulated: NASA GISTEMP's whole-Earth record with the human-caused warming removed changes by " + anFix(tr.slope * 10) + " °C per decade over " + tr.from + "–" + tr.to + ".", dir: "neutral", src: "gistemp", period: tr.from + "–" + tr.to, spark: vs, num: { slope_per_decade: +(tr.slope * 10).toFixed(3) } }) } catch (e) { }
  }

  /* ---------- 4. the Data panel (datapanel.js calls adjust for every row) ---------- */
  var TEMPQ = { t: 1, tx: 1, tn: 1, ts: 1, sst: 1 };
  function adjust(s, r, I, L) {
    if (!ON || !r || r.na || !s) return r; var q = s.qty, o = Object.assign({}, r);
    if (/^si_/.test(q || "")) { o.how = "Judged in the simulated world (humans muted): the SI learned this place's record without human-caused warming. " + (o.how || ""); return o }
    if (TEMPQ[q] || q === "gtemp") {
      var g = q === "gtemp" || !L, b = g ? 1 : q === "sst" ? OCEAN : beta(L.lat, L.lon), w = b * aw(I.t);
      if (typeof o.v === "number" && isFinite(o.v)) o.v = o.v - w;
      if (o.txt && /°C/.test(o.txt)) o.txt = o.txt.replace(/([+-]?\d+(?:\.\d+)?)(?=\s*°C)/g, function (m) { var dp = (m.split(".")[1] || "").length, v = parseFloat(m) - w; return (q === "gtemp" && v > 0 ? "+" : "") + v.toFixed(dp) });
      else if (o.txt && s.gal) o.txt = o.txt + " (picture shows real colours)";
      o.txt = o.txt + " (simulated)"; o.how = "Simulated without human-caused warming: NASA's value minus " + w.toFixed(2) + " °C (" + (g ? "the world's" : b.toFixed(2) + " × the world's") + " human-caused warming for this date" + (extended(I.t) ? ", extended past 2025" : "") + "). " + (o.how || "");
      return o;
    }
    if (q === "co2") { o.v = CO2PI; o.txt = CO2PI.toFixed(1) + " ppm (simulated: the level before industry)"; o.how = "Simulated: without people, CO₂ would have stayed near its pre-industrial level (278.3 ppm in 1750, IPCC AR6). NASA's partner NOAA measured " + (typeof r.v === "number" ? r.v.toFixed(1) + " ppm" : r.txt) + " in reality."; return o }
    o.how = "Real value (not simulated: there is no reliable estimate of this without humans). " + (o.how || ""); return o;
  }

  /* ---------- 5. maps: recolour NASA's temperature pictures with the simulated values, in NASA's own colour scale ---------- */
  var OVT = 0, CM = {}, CACHE = new Map();
  function overlayKind() {
    if (window.EICON) { var k = eicTemp(); return k && k.gal ? { gal: k.gal } : null }
    var lay = $("lay") && $("lay").value; if ((lay === "air" || lay === "sst") && window.CURP && window.CURP.id) return { gibs: window.CURP.id, sea: lay === "sst" };
    return null;
  }
  function overlay(orig, t) {
    var k = ON && t && t.image ? overlayKind() : null, tk = ++OVT; setBanner();
    if (!k) return orig(t);
    var I = window.EJP && EJP.instant ? EJP.instant() : null, ms = I ? I.t : Date.now(), key = (k.gal ? "g:" + k.gal.key : "m:" + k.gibs) + "|" + new Date(ms).toISOString().slice(0, k.gal ? 13 : 7);
    var hit = CACHE.get(t.image); if (hit && hit.key === key) { window.MAPSRC = { kind: "img" }; return orig(hit.tex) }
    recolour(t.image, k, ms).then(function (cv) { if (tk !== OVT) return; var nt = new THREE.CanvasTexture(cv); nt.generateMipmaps = false; nt.minFilter = THREE.LinearFilter; CACHE.set(t.image, { key: key, tex: nt }); if (CACHE.size > 40) CACHE.delete(CACHE.keys().next().value); window.MAPSRC = { kind: "img" }; orig(nt) }, function () { if (tk === OVT) orig(t) });
  }
  async function gibsCmap(id) {
    if (CM[id]) return CM[id];
    CM[id] = (async function () {
      var r = await fetch("https://gibs.earthdata.nasa.gov/colormaps/v1.3/" + id + ".xml"); if (!r.ok) throw new Error("colour map"); var t = await r.text(), list = [];
      (t.match(/<ColorMapEntry[^>]*>/g) || []).forEach(function (s) { var g = function (k) { return (s.match(new RegExp(" " + k + '="([^"]*)"')) || [])[1] }, rgb = g("rgb"), v = g("value"); if (!rgb || !v || g("nodata") === "true" || g("transparent") === "true") return;
        var m = v.match(/^[\[\(]\s*([^,\]\)]+)\s*(?:,\s*([^\]\)]+))?[\]\)]$/); if (!m) return; var lo = /INF/.test(m[1]) ? -Infinity : parseFloat(m[1]), hi = m[2] === undefined ? lo : /INF/.test(m[2]) ? Infinity : parseFloat(m[2]), c = rgb.split(",").map(Number);
        list.push({ c: c, lo: lo, hi: hi, mid: isFinite(lo) && isFinite(hi) ? (lo + hi) / 2 : isFinite(lo) ? lo : hi }) });
      if (list.length < 8) throw new Error("colour map"); list.sort(function (a, b) { return a.mid - b.mid }); return list;
    })(); CM[id].catch(function () { delete CM[id] }); return CM[id];
  }
  async function recolour(img, k, ms) {
    try { await landMask() } catch (e) { }
    var Wd = Math.min(2048, img.naturalWidth || img.width), Hd = Math.round(Wd * (img.naturalHeight || img.height) / (img.naturalWidth || img.width)), c = document.createElement("canvas"); c.width = Wd; c.height = Hd;
    var x = c.getContext("2d"); x.drawImage(img, 0, 0, Wd, Hd); var D = x.getImageData(0, 0, Wd, Hd), d = D.data, wL = LAND * aw(ms), wO = OCEAN * aw(ms), memo = new Map();
    var decode, encode;
    if (k.gal) {
      var g = k.gal, lut = await galLut(g), thr = g.thr || 26, sorted = lut.slice().sort(function (a, b) { return a[3] - b[3] });
      decode = function (r0, g0, b0) { var t = galDecode([r0, g0, b0], lut, thr); return t === null ? null : galPhys(g, t) };
      encode = function (v) { var t = EJN.toT(g, v); if (t === null || t === undefined) return null; t = Math.max(0, Math.min(1, t)); var lo = 0, hi = sorted.length - 1; while (lo < hi) { var mid = (lo + hi) >> 1; if (sorted[mid][3] < t) lo = mid + 1; else hi = mid } return sorted[lo] };
    } else {
      var L = await gibsCmap(k.gibs);
      decode = function (r0, g0, b0) { var best = 1e9, e = null; for (var i = 0; i < L.length; i++) { var c0 = L[i].c, dd = (c0[0] - r0) * (c0[0] - r0) + (c0[1] - g0) * (c0[1] - g0) + (c0[2] - b0) * (c0[2] - b0); if (dd < best) { best = dd; e = L[i] } } return best <= 30 * 30 && isFinite(e.mid) ? e.mid : null };
      encode = function (v) { var lo = 0, hi = L.length - 1; if (v <= L[0].mid) return L[0].c; if (v >= L[hi].mid) return L[hi].c; while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (L[mid].mid <= v) lo = mid; else hi = mid } return (v - L[lo].mid < L[hi].mid - v ? L[lo] : L[hi]).c };
    }
    for (var y = 0; y < Hd; y++) {
      var lat = 90 - (y + .5) * 180 / Hd;
      for (var xx = 0; xx < Wd; xx++) {
        var o = (y * Wd + xx) * 4; if (d[o + 3] < 8) continue;
        var key = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2], v = memo.get(key); if (v === undefined) { v = decode(d[o], d[o + 1], d[o + 2]); memo.set(key, v) } if (v === null) continue;
        var lon = -180 + (xx + .5) * 360 / Wd, land = k.sea || (k.gal && k.gal.key === "sst") ? false : isLand(lat, lon), nv = v - (land ? wL : wO), col = encode(nv); if (!col) continue;
        var cc = col.length === 4 && k.gal ? col : col; d[o] = cc[0]; d[o + 1] = cc[1]; d[o + 2] = cc[2];
      }
    }
    x.putImageData(D, 0, 0); return c;
  }

  /* ---------- 6. the button, the explanation, the banner ---------- */
  function setBanner() {
    var b = $("mhban"), kb = $("key"), kn = $("mhkey"); if (!b) return;
    if (!ON) { b.hidden = true; if (kn) kn.remove(); return }
    var k = overlayKind(); b.hidden = false;
    if (kb) { if (!kn) { kn = document.createElement("p"); kn.id = "mhkey"; kn.style.cssText = "margin:6px 0 0;color:#a9dca4;font-size:12px;line-height:1.4" } kn.textContent = k ? "Humans muted: these colours show the simulated temperatures (NASA's colour scale)." : "Humans muted: this picture is NASA's real one; the music and numbers are simulated."; if (kn.parentNode !== kb) kb.appendChild(kn) }
    b.textContent = "Humans muted: a simulation without human-caused warming. " + (k ? "The temperature map is recoloured with the simulated values." : "This picture is NASA's real one (it cannot be simulated); the music and numbers are simulated.");
  }
  function css() {
    var s = document.createElement("style");
    s.textContent = "#mhb{display:inline-block;margin:8px 0 0 0;pointer-events:auto;width:auto;background:rgba(10,14,20,.85);border:1px solid #8fc98a;color:#a9dca4;font-size:12px;font-weight:600;padding:5px 10px;cursor:pointer}#mhb:hover,#mhb[aria-pressed=true]{background:#8fc98a;color:#0d1a0c}" +
      "#mhc{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(600px,calc(100% - 48px));z-index:7;background:rgba(10,14,20,.97);border:1px solid #8fc98a;padding:22px 26px 18px;box-shadow:0 12px 40px rgba(0,0,0,.55);text-align:left;max-height:calc(100% - 40px);overflow:auto}#mhc[hidden]{display:none}" +
      "#mhc h2{font:600 19px/1.35 'Iowan Old Style',Georgia,serif;color:var(--bone,#ece6d8);margin:0 0 10px;text-align:center}#mhc p,#mhc li{color:var(--mute,#9b978b);font-size:13px;line-height:1.55;margin:0 0 8px}#mhc ul{margin:0 0 10px;padding-left:18px}#mhc b{color:var(--bone,#ece6d8)}#mhc .mhbtns{display:flex;gap:10px;justify-content:center;margin-top:12px}#mhc .mhbtns button{min-width:140px;width:auto}" +
      "#mhban{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:4;background:rgba(14,30,14,.9);border:1px solid #8fc98a;color:#cfeccb;font-size:12.5px;padding:6px 12px;max-width:min(640px,80%);text-align:center;pointer-events:none}#mhban[hidden]{display:none}" +
      "#cmpb[disabled]{opacity:.45;cursor:not-allowed}";
    document.head.appendChild(s);
  }
  function ui() {
    if ($("mhb")) return; var ref = $("silb") || $("dpb"); if (!ref) return; css();
    var b = document.createElement("button"); b.id = "mhb"; b.type = "button"; b.setAttribute("aria-pressed", "false"); b.textContent = "Mute humans";
    b.title = "Hear and see this place as it would be without human-caused warming (a simulation)";
    var br = document.createElement("br"); ref.parentNode.insertBefore(br, ref.nextSibling); ref.parentNode.insertBefore(b, br.nextSibling);
    b.addEventListener("click", function () { if (ON) { set(false); return } ask() });
    var host = ($("anc") && $("anc").parentNode) || document.body, c = document.createElement("div");
    c.id = "mhc"; c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "false"); c.setAttribute("aria-labelledby", "mhct"); c.hidden = true;
    c.innerHTML = '<h2 id="mhct">Mute humans?</h2>' +
      '<p>This calculates a <b>theoretical climate</b> for your pin: how it would be <b>without the warming humans have caused</b>, and plays the music, the numbers and the temperature maps from it. It is a simulation built from published science, not a measurement.</p>' +
      '<ul><li><b>How:</b> scientists have worked out how much of the world\'s warming people caused, year by year (1.37 °C by 2024, Indicators of Global Climate Change). Land has warmed about 1.46 times the world average and the ocean 0.81 times (IPCC AR6). That amount is taken off NASA\'s temperatures for your pin\'s date.</li>' +
      '<li><b>Simulated:</b> air, ground and sea temperatures, the hottest and coldest of each month, the global temperature, and CO₂ (back to 278 ppm, the level before industry).</li>' +
      '<li><b>Not simulated:</b> rain, humidity, wind, clouds, air pollution, greenery, snow, sea level and true-colour photos. Nobody can say reliably what they would be without us, so they stay NASA\'s real numbers, marked "real".</li>' +
      '<li>Compare is paused while humans are muted. Press the button again to bring humans back: everything returns exactly as it was. Nothing is saved.</li></ul>' +
      '<div class="mhbtns"><button id="mhyes" type="button">Mute humans</button><button id="mhno" type="button" class="alt">Cancel</button></div>';
    host.appendChild(c);
    var ban = document.createElement("div"); ban.id = "mhban"; ban.hidden = true; ban.setAttribute("role", "status"); host.appendChild(ban);
    $("mhyes").addEventListener("click", function () { c.hidden = true; set(true); b.focus() });
    $("mhno").addEventListener("click", function () { c.hidden = true; b.focus() });
    c.addEventListener("keydown", function (e) { if (e.key === "Escape") { c.hidden = true; b.focus() } });
    document.addEventListener("click", function (e) { var t = e.target && e.target.closest && e.target.closest("#cmpb"); if (t && ON) { e.preventDefault(); e.stopImmediatePropagation() } }, true);
  }
  function ask() { var c = $("mhc"); if (!c) return; c.hidden = false; setTimeout(function () { var y = $("mhyes"); if (y) y.focus() }, 0) }
  function refresh() {
    try {
      if (window.EICON) { if (window.series && series.length && typeof eicScore === "function") { eicScore(); if (typeof window_ === "function") window_(); setIdx(idx) } }
      else if (window.series && series.length) { setSeriesH(); if (typeof reWin === "function") reWin(); else setIdx(idx) }
      if (typeof chart === "function") chart(); if (typeof show === "function") show();
    } catch (e) { }
    if (window.EJP && EJP.refresh) EJP.refresh();
    if (window.EICON) { var x = window.series && series[idx]; if (x && typeof eicFrame === "function") eicFrame(x) } else if (window.CURD && typeof imagery === "function") imagery(window.CURD);
    if (window.EJSI && EJSI.listening && EJSI.listening()) { EJSI.listen(false); EJSI.listen(true) }
  }
  function set(on) {
    ON = !!on; var b = $("mhb"); if (b) { b.setAttribute("aria-pressed", ON ? "true" : "false"); b.textContent = ON ? "Humans muted: on" : "Mute humans" }
    var cb = $("cmpb"); if (cb) { cb.disabled = ON; cb.title = ON ? "Compare is paused while humans are muted. Press \"Humans muted: on\" to bring humans back." : "Compare one place in two different years (pictures, data and music)" }
    document.body.classList.toggle("mhon", ON);
    var go = function () { setBanner(); refresh() };
    if (ON && typeof landMask === "function") landMask().then(go, go); else go();
    return ON;
  }
  function boot() { hookPage(); ui() }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 50) }); else setTimeout(boot, 50);
  setInterval(function () { if (!$("mhb")) ui() }, 2000);

  window.EJMH = { on: function () { return ON }, set: set, ask: ask, adjust: adjust, W: W, aw: aw, beta: beta, co2: CO2PI, land: LAND, ocean: OCEAN, extended: extended };
})();
