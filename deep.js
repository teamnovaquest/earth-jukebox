/* Earth Jukebox: deeper research for Compare mode (window.EJD).
   1. Long-term trends at the place: ECMWF ERA5 daily record from 1950 (Open-Meteo), climate-extreme indices (ETCCDI definitions),
      Mann-Kendall trend test with the Hamed-Rao autocorrelation correction, Sen's slope with its 95% interval, Pettitt change-point test.
   2. What kind of place it is (NASA MODIS land cover, mangrove map, ocean mask) and research packs that fit it, built from NASA GIBS
      maps read as numbers (each GIBS colour stands for an exact value range in NASA's published colour map), NOAA, GBIF and OBIS.
   Everything is fetched by the visitor's browser from free public services; nothing is stored. Results go to Compare's screen, the PDF
   report (research.js), the SI essay facts and blind assistance. */
(function () {
  "use strict";
  var EJD = {};

  /* ---------------- statistics ---------------- */
  /* normal distribution function (Marsaglia 2004), accurate to about 1e-15 */
  function ncdf(x) { if (x < -8) return 0; if (x > 8) return 1; var s = x, t = 0, b = x, q = x * x, i = 1; while (s !== t) { t = s; i += 2; b *= q / i; s = t + b } return .5 + s * Math.exp(-.5 * q - .91893853320467274178) }
  function nppf(p) { /* Acklam's inverse normal */
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-.007784894002430293, -.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [.007784695709041462, .3224671290700398, 2.445134137142996, 3.754408661907416], q, r;
    if (p < .02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
    if (p > 1 - .02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
    q = p - .5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function ranks(x) { var o = x.map(function (v, i) { return [v, i] }).sort(function (a, b) { return a[0] - b[0] }), r = new Array(x.length), i = 0; while (i < o.length) { var j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (var k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2 + 1; i = j + 1 } return r }
  /* Mann-Kendall (with ties), Sen's slope with the 95% interval of Gilbert (1987), and the Hamed & Rao (1998) correction
     for autocorrelation (as in pyMannKendall's hamed_rao_modification_test, lag = all, 95% significance for the autocorrelations). */
  function mk(xs, ys) {
    var P = []; for (var i = 0; i < ys.length; i++) if (ys[i] !== null && ys[i] !== undefined && isFinite(ys[i])) P.push([xs[i], ys[i]]);
    var n = P.length; if (n < 8) return null;
    var x = P.map(function (p) { return p[1] }), t = P.map(function (p) { return p[0] }), S = 0, sl = [];
    for (i = 0; i < n - 1; i++) for (var j = i + 1; j < n; j++) { var d = x[j] - x[i]; S += d > 0 ? 1 : d < 0 ? -1 : 0; if (t[j] !== t[i]) sl.push(d / (t[j] - t[i])) }
    var cnt = {}; x.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1 });
    var tie = 0; Object.keys(cnt).forEach(function (k) { var g = cnt[k]; if (g > 1) tie += g * (g - 1) * (2 * g + 5) });
    var varS = (n * (n - 1) * (2 * n + 5) - tie) / 18;
    var zf = function (s, v) { return s > 0 ? (s - 1) / Math.sqrt(v) : s < 0 ? (s + 1) / Math.sqrt(v) : 0 };
    sl.sort(function (a, b) { return a - b }); var N = sl.length, med = N % 2 ? sl[(N - 1) / 2] : (sl[N / 2 - 1] + sl[N / 2]) / 2;
    var b0 = median(x.map(function (v, k) { return v - med * t[k] }));
    /* Hamed-Rao: ranks of the detrended series, their autocorrelations, significant ones inflate the variance */
    var dt = x.map(function (v, k) { return v - med * (k + 1) }), R = ranks(dt), mr = R.reduce(function (a, b) { return a + b }, 0) / n, y = R.map(function (v) { return v - mr }), c0 = 0;
    for (i = 0; i < n; i++) c0 += y[i] * y[i];
    var bound = nppf(.975) / Math.sqrt(n), sni = 0;
    for (var L = 1; L < n; L++) { var cl = 0; for (i = 0; i < n - L; i++) cl += y[i] * y[i + L]; var ac = cl / c0; if (ac > bound || ac < -bound) sni += (n - L) * (n - L - 1) * (n - L - 2) * ac }
    /* the correction is used only when it widens the uncertainty (positive autocorrelation): a cautious choice, and the
       confidence interval of the slope then uses the same variance, so the interval and the p-value always agree */
    var nns = 1 + 2 / (n * (n - 1) * (n - 2)) * sni, varH = varS * Math.max(1, nns);
    var z = zf(S, varS), zh = zf(S, varH);
    var C = nppf(.975) * Math.sqrt(varH), M1 = (N - C) / 2, M2 = (N + C) / 2;
    var lo = sl[Math.max(0, Math.min(N - 1, Math.round(M1) - 1))], hi = sl[Math.max(0, Math.min(N - 1, Math.round(M2)))];
    return { n: n, from: t[0], to: t[n - 1], S: S, varS: varS, z: z, p: 2 * (1 - ncdf(Math.abs(z))), tau: S / (n * (n - 1) / 2),
      slope: med, lo: lo, hi: hi, b0: b0, nns: nns, zh: zh, ph: 2 * (1 - ncdf(Math.abs(zh))), mean: x.reduce(function (a, b) { return a + b }, 0) / n };
  }
  function median(a) { var s = a.slice().sort(function (p, q) { return p - q }), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null }
  /* Pettitt (1979) change-point test: the year after which the record shifts most clearly, with its approximate p-value */
  function pettitt(xs, ys) {
    var P = []; for (var i = 0; i < ys.length; i++) if (ys[i] !== null && ys[i] !== undefined && isFinite(ys[i])) P.push([xs[i], ys[i]]);
    var n = P.length; if (n < 10) return null;
    var x = P.map(function (p) { return p[1] }), U = 0, best = 0, at = 0;
    for (var t = 0; t < n - 1; t++) { for (var j = 0; j < n; j++) { var d = x[t] - x[j]; if (j !== t) U += d > 0 ? 1 : d < 0 ? -1 : 0 } if (Math.abs(U) > Math.abs(best)) { best = U; at = t } }
    var K = Math.abs(best), p = Math.min(1, 2 * Math.exp(-6 * K * K / (n * n * n + n * n)));
    var m1 = x.slice(0, at + 1).reduce(function (a, b) { return a + b }, 0) / (at + 1), m2 = x.slice(at + 1).reduce(function (a, b) { return a + b }, 0) / (n - at - 1);
    return { K: K, p: p, last: P[at][0], first: P[at + 1][0], before: m1, after: m2 };
  }
  EJD.stats = { mk: mk, pettitt: pettitt, ncdf: ncdf, nppf: nppf, ranks: ranks, median: median };

  /* ---------------- helpers ---------------- */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  async function getText(u, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 30000); try { var r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.text() } finally { clearTimeout(tm) } }
  async function getJSON(u, ms) { return JSON.parse(await getText(u, ms)) }
  async function pool(n, items, fn) { var out = new Array(items.length), k = 0; async function w() { while (k < items.length) { var i = k++; try { out[i] = await fn(items[i], i) } catch (e) { out[i] = null } } } var ws = []; for (var i = 0; i < Math.min(n, items.length); i++) ws.push(w()); await Promise.all(ws); return out }
  function fx(v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (+v).toFixed(d) }
  function sgn(v, d) { var t = Math.abs(v).toFixed(d); return (+t === 0 ? "" : v > 0 ? "+" : "−") + t }
  EJD.fx = fx; EJD.sgn = sgn;

  /* ---------------- 1. long-term record (ERA5 from 1950; Open-Meteo counts every two weeks of data as one request, so 1940-49 is left out to keep a research inside a visitor's hourly allowance) ---------------- */
  /* ETCCDI-style indices per calendar year. Hot days: Tmax above the 90th percentile of the same calendar day in 1961-1990
     (5-day window, no bootstrap). Tropical nights: Tmin > 20 °C. Very wet days: >= 20 mm. Rx1day: wettest day. CDD: longest run of
     days under 1 mm (counted within the year). Windy days: daily maximum wind at 10 m >= 10.8 m/s (Beaufort 6). */
  var IDX = [
    { k: "tm", name: "Mean air temperature", unit: "°C", d: 2, per: 10, good: -1 },
    { k: "txx", name: "Hottest day of the year (TXx)", unit: "°C", d: 1, per: 10, good: -1 },
    { k: "tx90", name: "Hot days (TX90p: above the 1961–1990 90th percentile)", unit: "% of days", d: 1, per: 10, good: -1 },
    { k: "tr", name: "Tropical nights (minimum above 20 °C)", unit: "nights", d: 1, per: 10, good: -1 },
    { k: "pr", name: "Total rainfall (PRCPTOT, wet days ≥ 1 mm)", unit: "mm", d: 0, per: 10, good: 0 },
    { k: "r20", name: "Very wet days (R20mm: ≥ 20 mm)", unit: "days", d: 1, per: 10, good: 0 },
    { k: "rx1", name: "Wettest day (Rx1day)", unit: "mm", d: 1, per: 10, good: 0 },
    { k: "cdd", name: "Longest dry spell (CDD: days < 1 mm)", unit: "days", d: 1, per: 10, good: -1 },
    { k: "wnd", name: "Windy days (maximum wind ≥ 10.8 m/s)", unit: "days", d: 1, per: 10, good: 0 },
    { k: "sm", name: "Topsoil moisture (0–7 cm, yearly mean)", unit: "m³/m³", d: 3, per: 10, good: 1 }
  ];
  EJD.IDX = IDX;
  async function era5Long(lat, lon, lastY) {
    var u = "https://archive-api.open-meteo.com/v1/archive?latitude=" + lat.toFixed(4) + "&longitude=" + lon.toFixed(4) + "&start_date=1950-01-01&end_date=" + lastY + "-12-31" +
      "&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,soil_moisture_0_to_7cm_mean&models=era5&wind_speed_unit=ms&timezone=GMT";
    var j = await getJSON(u, 90000), d = j.daily || {}, out = [];
    (d.time || []).forEach(function (t, i) { out.push({ d: t, tm: d.temperature_2m_mean[i], tx: d.temperature_2m_max[i], tn: d.temperature_2m_min[i], pr: d.precipitation_sum[i], ws: d.wind_speed_10m_max[i], sm: d.soil_moisture_0_to_7cm_mean[i] }) });
    return { days: out, lat: j.latitude, lon: j.longitude, elev: j.elevation, url: u };
  }
  function doyOf(s) { var t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)), y0 = Date.UTC(+s.slice(0, 4), 0, 1), k = Math.round((t - y0) / 864e5); var leap = (+s.slice(0, 4)) % 4 === 0; if (leap && k >= 59) k = s.slice(5) === "02-29" ? 58 : k - 1; return k } /* 0-364, 29 Feb shares 28 Feb */
  function indices(days) {
    /* calendar-day 90th percentile of Tmax in 1961-1990, 5-day window */
    var base = []; for (var q = 0; q < 365; q++) base.push([]);
    days.forEach(function (x) { var y = +x.d.slice(0, 4); if (y < 1961 || y > 1990 || x.tx === null) return; var k = doyOf(x.d); for (var o = -2; o <= 2; o++) base[(k + o + 365) % 365].push(x.tx) });
    var p90 = base.map(function (a) { if (a.length < 50) return null; a.sort(function (p, q) { return p - q }); var h = .9 * (a.length - 1), l = Math.floor(h); return a[l] + (h - l) * ((a[Math.min(a.length - 1, l + 1)]) - a[l]) });
    var by = {}; days.forEach(function (x) { (by[x.d.slice(0, 4)] = by[x.d.slice(0, 4)] || []).push(x) });
    var rows = [];
    Object.keys(by).sort().forEach(function (ys) {
      var a = by[ys], y = +ys, full = a.length >= 365, r = { y: y };
      var ok = function (k) { return a.filter(function (x) { return x[k] !== null && x[k] !== undefined }).length >= 360 };
      if (!full) return;
      if (ok("tm")) r.tm = a.reduce(function (s, x) { return s + (x.tm === null ? 0 : x.tm) }, 0) / a.filter(function (x) { return x.tm !== null }).length;
      if (ok("tx")) { r.txx = Math.max.apply(null, a.filter(function (x) { return x.tx !== null }).map(function (x) { return x.tx })); var h = 0, n = 0; a.forEach(function (x) { var pp = p90[doyOf(x.d)]; if (x.tx === null || pp === null) return; n++; if (x.tx > pp) h++ }); r.tx90 = n >= 360 ? 100 * h / n : null }
      if (ok("tn")) r.tr = a.filter(function (x) { return x.tn !== null && x.tn > 20 }).length;
      if (ok("pr")) {
        var w = a.filter(function (x) { return x.pr !== null }); r.pr = w.filter(function (x) { return x.pr >= 1 }).reduce(function (s, x) { return s + x.pr }, 0);
        r.r20 = w.filter(function (x) { return x.pr >= 20 }).length; r.rx1 = Math.max.apply(null, w.map(function (x) { return x.pr }));
        var run = 0, mx = 0; a.forEach(function (x) { if (x.pr !== null && x.pr < 1) { run++; mx = Math.max(mx, run) } else run = 0 }); r.cdd = mx;
      }
      if (ok("ws")) r.wnd = a.filter(function (x) { return x.ws !== null && x.ws >= 10.8 }).length;
      if (ok("sm")) { var sv = a.filter(function (x) { return x.sm !== null }); r.sm = sv.reduce(function (s, x) { return s + x.sm }, 0) / sv.length }
      rows.push(r);
    });
    return rows;
  }
  /* rank of a year in the record: 1 = highest */
  function rankOf(rows, k, y) { var v = rows.filter(function (r) { return r[k] !== undefined && r[k] !== null }), me = v.filter(function (r) { return r.y === y })[0]; if (!me) return null; return { r: 1 + v.filter(function (r) { return r[k] > me[k] }).length, of: v.length, v: me[k] } }
  async function longTerm(D) {
    var lastY = new Date().getUTCFullYear() - 1, L = await era5Long(D.place.lat, D.place.lon, lastY), rows = indices(L.days);
    if (rows.length < 30) throw new Error("the ERA5 record here is too short");
    var ys = rows.map(function (r) { return r.y }), out = { src: "ERA5", from: ys[0], to: ys[ys.length - 1], cell: { lat: L.lat, lon: L.lon, elev: L.elev }, url: L.url, rows: rows, idx: {} };
    IDX.forEach(function (I) {
      var vs = rows.map(function (r) { return r[I.k] === undefined ? null : r[I.k] });
      if (vs.filter(function (v) { return v !== null }).length < 30) return;
      if (I.k === "sm" && vs.every(function (v) { return v === null || v === vs.filter(function (z) { return z !== null })[0] })) return; /* no soil (sea) */
      if (I.k === "tr" && vs.every(function (v) { return !v })) return;
      if (I.k === "wnd" && vs.every(function (v) { return !v })) return;
      var sat = rows.map(function (r, i) { return r.y >= 1979 ? vs[i] : null });
      out.idx[I.k] = { full: mk(ys, vs), sat: mk(ys, sat), pet: pettitt(ys, vs), r1: rankOf(rows, I.k, D.y1), r2: rankOf(rows, I.k, D.y2),
        m6190: mean2(rows.filter(function (r) { return r.y >= 1961 && r.y <= 1990 }).map(function (r) { return r[I.k] })),
        m10s: mean2(rows.filter(function (r) { return r.y >= lastY - 9 }).map(function (r) { return r[I.k] })) };
    });
    return out;
  }
  function mean2(a) { a = a.filter(function (v) { return v !== null && v !== undefined && isFinite(v) }); return a.length ? a.reduce(function (s, v) { return s + v }, 0) / a.length : null }
  EJD.indices = indices; EJD.longTerm = longTerm;

  /* ---------------- 2. NASA GIBS maps read as numbers ---------------- */
  /* GIBS draws each data value with one colour from a published colour map, and every colour stands for a value range (or a class).
     Reading the colour back gives that range exactly. Pixels whose colour is not in the map are counted and left out. */
  var GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", CMAPS = {};
  async function cmap(name) {
    if (CMAPS[name]) return CMAPS[name];
    CMAPS[name] = (async function () {
      var t = await getText("https://gibs.earthdata.nasa.gov/colormaps/v1.3/" + name + ".xml", 20000), M = new Map(), tips = {};
      (t.match(/<LegendEntry[^>]*>/g) || []).forEach(function (s) { var rgb = (s.match(/rgb="([^"]*)"/) || [])[1], tip = (s.match(/tooltip="([^"]*)"/) || [])[1]; if (rgb && tip) tips[rgb] = tip.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") });
      var units = (t.match(/units="([^"]*)"/) || [])[1] || "";
      (t.match(/<ColorMapEntry[^>]*>/g) || []).forEach(function (s) {
        var g = function (k) { return (s.match(new RegExp(" " + k + '="([^"]*)"')) || [])[1] }, rgb = g("rgb"); if (!rgb || M.has(rgb)) return;
        var e = { rgb: rgb, nd: g("nodata") === "true", tr: g("transparent") === "true", label: tips[rgb] || g("label") || null }, v = g("value"), sv = g("sourceValue");
        if (v) { var m = v.match(/^[\[\(]\s*([^,\]\)]+)\s*(?:,\s*([^\]\)]+))?[\]\)]$/); if (m) { var lo = /INF/.test(m[1]) ? -Infinity : parseFloat(m[1]), hi = m[2] === undefined ? lo : /INF/.test(m[2]) ? Infinity : parseFloat(m[2]); e.lo = lo; e.hi = hi; e.mid = isFinite(lo) && isFinite(hi) ? (lo + hi) / 2 : isFinite(lo) ? lo : hi; e.cens = !isFinite(lo) ? -1 : !isFinite(hi) ? 1 : 0; if (isFinite(lo) && isFinite(hi) && lo > 0 && hi >= 100 * lo) { e.mid = lo; e.cens = 1 } /* open-ended top class, e.g. 1,000 or more people per km² */ } }
        else if (sv !== undefined) { e.cls = parseInt(sv, 10); e.mid = e.cls }
        M.set(rgb, e);
      });
      /* an open-ended class much wider than the rest (for example SMAP's "0 to 30 psu") only says "below" or "above" its inner limit */
      var fin = [], w = []; M.forEach(function (e) { if (e.lo !== undefined && isFinite(e.lo) && isFinite(e.hi) && e.hi > e.lo && !e.nd) { fin.push(e); w.push(e.hi - e.lo) } });
      if (fin.length > 10) { w.sort(function (a, b) { return a - b }); var mw = w[Math.floor(w.length / 2)], minLo = Math.min.apply(null, fin.map(function (e) { return e.lo })), maxHi = Math.max.apply(null, fin.map(function (e) { return e.hi }));
        fin.forEach(function (e) { if (e.hi - e.lo > 20 * mw) { if (e.lo === minLo) { e.mid = e.hi; e.cens = -1 } else if (e.hi === maxHi) { e.mid = e.lo; e.cens = 1 } } }) }
      return { map: M, units: units };
    })();
    CMAPS[name].catch(function () { delete CMAPS[name] });
    return CMAPS[name];
  }
  function gibsUrl(layer, time, bb, w, h) { return GIBS + "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=" + layer + "&STYLES=&CRS=EPSG:4326&BBOX=" + [bb.s, bb.w, bb.n, bb.e].map(function (v) { return v.toFixed(5) }).join(",") + "&WIDTH=" + w + "&HEIGHT=" + h + "&FORMAT=image/png" + (time ? "&TIME=" + time : "") }
  async function grid(layer, cmName, time, bb, w, h) {
    var cm = await cmap(cmName), u = gibsUrl(layer, time, bb, w, h), r, k;
    for (k = 0; k < 3; k++) { try { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, 25000); r = await fetch(u + (k ? "&r=" + k : ""), { signal: ac.signal }); clearTimeout(tm); if (r.ok) break } catch (e) { r = null } await sleep(600 * (k + 1)) }
    if (!r || !r.ok) throw new Error("NASA GIBS did not answer");
    var bm = await createImageBitmap(await r.blob()), c = document.createElement("canvas"); c.width = w; c.height = h;
    var x = c.getContext("2d"); x.drawImage(bm, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data, v = new Float64Array(w * h), cens = new Int8Array(w * h), cls = new Int16Array(w * h), ent = w * h <= 400 ? new Array(w * h) : null, miss = 0, n = 0;
    for (var i = 0, p = 0; p < w * h; i += 4, p++) {
      v[p] = NaN; cls[p] = -1; if (d[i + 3] < 255) continue;
      var e = cm.map.get(d[i] + "," + d[i + 1] + "," + d[i + 2]); if (!e) { miss++; continue }
      if (e.nd) continue; n++; v[p] = e.mid; cens[p] = e.cens || 0; if (e.cls !== undefined) cls[p] = e.cls; if (ent) ent[p] = e;
    }
    return { w: w, h: h, v: v, cens: cens, cls: cls, ent: ent, miss: miss, n: n, units: cm.units, bb: bb, url: u };
  }
  EJD.grid = grid; EJD.cmap = cmap;
  function boxKm(lat, lon, km) { var dl = km / 2 / 111.32, dn = km / 2 / (111.32 * Math.max(.05, Math.cos(lat * Math.PI / 180))); return { s: Math.max(-89.9, lat - dl), n: Math.min(89.9, lat + dl), w: lon - dn, e: lon + dn, km: km } }
  function pxKm(bb, w, h) { var lat = (bb.s + bb.n) / 2, kx = (bb.e - bb.w) * 111.32 * Math.cos(lat * Math.PI / 180) / w, ky = (bb.n - bb.s) * 111.32 / h; return kx * ky }
  /* the area a research map covers: the place's own outline (countries, regions; set by deep2.js as D.area) or a square
     of km around the point. Pixels are sampled from NASA's data at about resKm each, at most maxPx across. */
  function areaOf(D, kmMin, kmMax, resKm, maxPx) {
    var p = D.place, bb, km = null, label;
    if (D.area && D.area.bb) { bb = D.area.bb; label = D.area.label } else { km = Math.max(kmMin, Math.min(kmMax, D.km || 30)); bb = boxKm(p.lat, p.lon, km); label = km + " km square" }
    var lat = (bb.s + bb.n) / 2, wkm = (bb.e - bb.w) * 111.32 * Math.cos(lat * Math.PI / 180), hkm = (bb.n - bb.s) * 111.32, w = Math.max(16, Math.min(maxPx, Math.round(wkm / resKm))), h = Math.max(16, Math.round(w * hkm / wkm));
    if (h > maxPx) { h = maxPx; w = Math.max(16, Math.round(h * wkm / hkm)) }
    var mask = D.area && D.area.mask ? D.area.mask(bb, w, h) : null, px = Math.sqrt(wkm * hkm / (w * h));
    return { bb: bb, w: w, h: h, mask: mask, km: km, label: label, px: px, pxTxt: px < 1 ? Math.round(px * 1000) + " m" : (px < 10 ? px.toFixed(1) : Math.round(px)) + " km", border: D.area && D.area.border ? D.area.border : null };
  }
  EJD.util = { pool: pool, boxKm: boxKm, pxKm: pxKm, areaOf: areaOf, mk: mk, median: median, fx: fx, sgn: sgn, sleep: sleep };
  function iso(y, m, d) { return y + "-" + String(m).padStart(2, "0") + "-" + String(d || 1).padStart(2, "0") }
  function doyDate(y, doy) { var t = new Date(Date.UTC(y, 0, 1) + (doy - 1) * 864e5); return t.toISOString().slice(0, 10) }

  /* light grey base map with place names and roads (Esri), cut to the same box, so the data can be read against real places.
     The tiles are Web Mercator; over boxes of tens of km the difference from the data's latitude-longitude grid is far below one pixel. */
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
  function merc(lat, lon, z) { var s2 = Math.sin(lat * Math.PI / 180), n = 256 * Math.pow(2, z); return [(lon + 180) / 360 * n, (.5 - Math.log((1 + s2) / (1 - s2)) / (4 * Math.PI)) * n] }
  async function tileImg(u) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, 15000); try { var r = await fetch(u, { signal: ac.signal }); if (!r.ok) throw new Error("tile " + r.status); return await createImageBitmap(await r.blob()) } finally { clearTimeout(tm) } }
  async function baseMap(bb, W) {
    var H = Math.round(W * (bb.n - bb.s) / ((bb.e - bb.w) * Math.cos(((bb.s + bb.n) / 2) * Math.PI / 180))), z, a, b, tx0, ty0, tx1, ty1;
    for (z = 18; z >= 3; z--) { a = merc(bb.n, bb.w, z); b = merc(bb.s, bb.e, z); if (b[0] - a[0] > W * 1.6) continue;
      tx0 = Math.floor(a[0] / 256); ty0 = Math.floor(a[1] / 256); tx1 = Math.floor(b[0] / 256); ty1 = Math.floor(b[1] / 256); if ((tx1 - tx0 + 1) * (ty1 - ty0 + 1) <= 80) break }
    if ((tx1 - tx0 + 1) * (ty1 - ty0 + 1) > 80) return null;
    var out = {};
    for (var layer of ["World_Light_Gray_Base", "World_Light_Gray_Reference"]) {
      var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"), jobs = [], ok = 0, all = 0; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
      var big = document.createElement("canvas"); big.width = (tx1 - tx0 + 1) * 256; big.height = (ty1 - ty0 + 1) * 256; var g = big.getContext("2d");
      for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) (function (X, Y) { all++; jobs.push(tileImg(ESRI + layer + "/MapServer/tile/" + z + "/" + Y + "/" + X).then(function (im) { g.drawImage(im, (X - tx0) * 256, (Y - ty0) * 256); ok++ }, function () {})) })(tx, ty);
      await Promise.all(jobs);
      if (ok < all * .8) return null;
      x.drawImage(big, a[0] - tx0 * 256, a[1] - ty0 * 256, b[0] - a[0], b[1] - a[1], 0, 0, W, H);
      out[layer.indexOf("Base") > 0 ? "base" : "labels"] = c;
    }
    out.credit = "Base map: Esri, HERE, Garmin, © OpenStreetMap contributors";
    return out;
  }
  EJD.baseMap = baseMap;

  /* ---------------- 3. what kind of place is it ---------------- */
  var IGBP = { 1: "Evergreen needleleaf forest", 2: "Evergreen broadleaf forest", 3: "Deciduous needleleaf forest", 4: "Deciduous broadleaf forest", 5: "Mixed forest", 6: "Closed shrubland", 7: "Open shrubland", 8: "Woody savanna", 9: "Savanna", 10: "Grassland", 11: "Permanent wetland", 12: "Cropland", 13: "Urban and built-up", 14: "Cropland and natural vegetation mosaic", 15: "Permanent snow and ice", 16: "Barren", 17: "Water" };
  var IGBP_COL = { 1: "#218a21", 2: "#31cc31", 3: "#98cc31", 4: "#96fa96", 5: "#8dba8d", 6: "#ba8d8d", 7: "#f5deb3", 8: "#daeb9d", 9: "#ffd500", 10: "#f0b967", 11: "#4783b5", 12: "#faef73", 13: "#ff0000", 14: "#999356", 15: "#ffffff", 16: "#bfbfbd", 17: "#86cae3" };
  EJD.IGBP = IGBP;
  var LC_LAST = 2024;
  function frac(g, test) { var a = 0, n = 0; for (var i = 0; i < g.v.length; i++) { if (g.cls[i] < 0) continue; n++; if (test(g.cls[i])) a++ } return n ? a / n : 0 }
  async function detect(D) {
    var p = D.place, bb = boxKm(p.lat, p.lon, 20), lc = await grid("MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual", "MODIS_IGBP_Land_Cover_Type", LC_LAST + "-01-01", bb, 41, 41), mg = null;
    try { mg = await grid("Mangrove_Forest_Distribution_2000", "Mangrove_Forest_Distribution_2000", null, bb, 81, 81) } catch (e) {}
    var c = lc.cls[20 * 41 + 20], f = function (a) { return frac(lc, function (k) { return a.indexOf(k) >= 0 }) };
    if (c === 0) c = 17;
    var H = { pinClass: c, pinName: IGBP[c] || "unknown", year: LC_LAST, share: {}, kinds: [] };
    for (var k = 1; k <= 17; k++) { var s = frac(lc, function (z) { return (z === 0 ? 17 : z) === k }); if (s > 0) H.share[k] = s }
    var mf = 0; if (mg) { var mn = 0; for (var i = 0; i < mg.v.length; i++) if (!isNaN(mg.v[i])) mn++; mf = mn / mg.v.length } H.mangrove = mf;
    var sea = null; try { if (typeof landMask === "function") await landMask(); if (window.LANDA && typeof landAt === "function") { var pinLand = landAt(p.lat, p.lon) > 128, ring = 0; for (var a = 0; a < 16; a++) { var r = a < 8 ? 15 : 35, t = a * Math.PI / 4; if (landAt(p.lat + r / 111.32 * Math.sin(t), p.lon + r / (111.32 * Math.cos(p.lat * Math.PI / 180)) * Math.cos(t)) <= 128) ring++ } sea = { pinLand: pinLand, ring: ring } } } catch (e) {}
    H.sea = sea;
    var ocean = sea ? !sea.pinLand : c === 17 && f([17, 0]) > .9;
    if (ocean) H.kinds.push("ocean");
    else {
      if (mf >= .03) H.kinds.push("mangrove");
      if (sea && sea.ring > 0) H.kinds.push("coast");
      if (f([13]) >= .1 || c === 13) H.kinds.push("city");
      if (f([12, 14]) >= .35) H.kinds.push("farmland");
      if (f([1, 2, 3, 4, 5]) >= .35 && H.kinds.indexOf("mangrove") < 0) H.kinds.push("forest");
      if (f([16]) >= .4) H.kinds.push("desert");
      if (f([15]) >= .3) H.kinds.push("ice");
      if (f([11]) >= .2 && H.kinds.indexOf("mangrove") < 0) H.kinds.push("wetland");
      if (f([6, 7, 8, 9, 10]) >= .4) H.kinds.push("grassland");
      H.kinds.push("land");
    }
    var nice = { ocean: "open sea", mangrove: "mangrove forest", coast: "coast", city: "city", farmland: "farmland", forest: "forest", desert: "desert", ice: "snow and ice", wetland: "wetland", grassland: "grassland and savanna", land: "land" };
    H.label = H.kinds.filter(function (k) { return k !== "land" }).map(function (k) { return nice[k] }).join(", ") || "land (" + H.pinName.toLowerCase() + ")";
    return H;
  }
  EJD.detect = detect;
  /* ---------------- 4. research packs ---------------- */
  /* colours */
  function lerpC(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)] }
  function ramp(stops, t) { t = Math.max(0, Math.min(1, t)); for (var i = 1; i < stops.length; i++) if (t <= stops[i][0]) return lerpC(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1] }
  var DIV_BG = [[0, [140, 81, 10]], [.25, [216, 179, 101]], [.5, [245, 245, 245]], [.75, [90, 180, 172]], [1, [1, 102, 94]]]; /* brown = less, teal = more */
  var SEQ = [[0, [255, 255, 204]], [.25, [161, 218, 180]], [.5, [65, 182, 196]], [.75, [44, 127, 184]], [1, [37, 52, 148]]];
  function hex(c) { return "#" + c.map(function (v) { return ("0" + v.toString(16)).slice(-2) }).join("") }
  EJD.ramps = { DIV_BG: DIV_BG, SEQ: SEQ, ramp: ramp, hex: hex };
  function mapFig(w, h, bb, colourOf, legend, pin, extra) { var rgba = new Uint8ClampedArray(w * h * 4); for (var i = 0; i < w * h; i++) { var c = colourOf(i); if (!c) { rgba[i * 4 + 3] = 0; continue } rgba[i * 4] = c[0]; rgba[i * 4 + 1] = c[1]; rgba[i * 4 + 2] = c[2]; rgba[i * 4 + 3] = c[3] === undefined ? 255 : c[3] } return Object.assign({ type: "map", w: w, h: h, rgba: rgba, bb: bb, legend: legend, pin: pin }, extra || {}) }
  function trendWords(t, unit, d, per) { if (!t) return "too few values for a trend test"; var s = t.slope * (per || 1); return sgn(s, d) + " " + unit + (per === 10 ? " per decade" : per === 1 ? " per year" : "") + " (95% interval " + sgn(t.lo * (per || 1), d) + " to " + sgn(t.hi * (per || 1), d) + "; Mann–Kendall " + pEq(t.ph !== undefined ? t.ph : t.p) + (t.nns && t.nns > 1.01 ? ", corrected for autocorrelation" : "") + ")" }
  function pfmt(p) { return p < .001 ? "< 0.001" : p.toFixed(3) }
  function pEq(p) { return p < .001 ? "p < 0.001" : "p = " + p.toFixed(3) }
  function sig(t) { return t && (t.ph !== undefined ? t.ph : t.p) < .05 }
  EJD.trendWords = trendWords; EJD.pfmt = pfmt; EJD.sig = sig;

  /* 4a. greenness change map: NASA MODIS Terra NDVI (MOD13Q1, 250 m, 16-day). Each year's value = the highest of four composites
     spread through the year (starting on days 1, 97, 193 and 289), which keeps clouds (they lower NDVI) from passing as browning. */
  async function greenness(D, H, prog) {
    var p = D.place, AR = areaOf(D, 20, 60, .25, D.area ? 600 : 240), bb = AR.bb, w = AR.w, h = AR.h, km = AR.km, lastY = new Date().getUTCFullYear() - 1, years = [], jobs = [], y;
    for (y = 2001; y <= lastY; y++) years.push(y);
    years.forEach(function (yy) { [1, 97, 193, 289].forEach(function (d) { jobs.push([yy, d]) }) });
    var done = 0, miss = 0, gs = await pool(6, jobs, async function (j) { var g = await grid("MODIS_Terra_L3_NDVI_16Day", "MODIS_L3_NDVI", doyDate(j[0], j[1]), bb, w, h); done++; miss += g.miss; prog && prog("NASA MODIS greenness: " + done + " of " + jobs.length + " maps"); return g });
    var Y = years.length, N = w * h, A = new Float64Array(Y * N).fill(NaN), got = 0;
    gs.forEach(function (g, k) { if (!g) return; got++; var yi = Math.floor(k / 4); for (var i = 0; i < N; i++) { var v = g.v[i]; if (!isNaN(v)) { var o = yi * N + i; if (isNaN(A[o]) || v > A[o]) A[o] = v } } });
    if (got < jobs.length * .8) throw new Error("NASA GIBS sent only " + got + " of " + jobs.length + " greenness maps");
    var mang = null; if (H.mangrove > 0) { try { mang = await grid("Mangrove_Forest_Distribution_2000", "Mangrove_Forest_Distribution_2000", null, bb, w, h) } catch (e) {} }
    var slope = new Float64Array(N).fill(NaN), pv = new Float64Array(N).fill(NaN), valid = 0, up = 0, dn = 0, mUp = 0, mDn = 0, mN = 0, sl = [];
    for (var i = 0; i < N; i++) {
      if (AR.mask && !AR.mask[i]) continue;
      var vs = []; for (var k = 0; k < Y; k++) vs.push(isNaN(A[k * N + i]) ? null : A[k * N + i]);
      if (vs.filter(function (v) { return v !== null }).length < Y - 4) continue;
      var t = mk(years, vs); if (!t) continue; valid++; slope[i] = t.slope; pv[i] = t.p; sl.push(t.slope);
      var isM = mang && !isNaN(mang.v[i]); if (isM) mN++;
      if (t.p < .05) { if (t.slope > 0) { up++; if (isM) mUp++ } else if (t.slope < 0) { dn++; if (isM) mDn++ } }
    }
    if (valid < 20) throw new Error("too few land pixels with a full greenness record");
    var mean = years.map(function (yy, k) { var s = 0, n = 0; for (var i = 0; i < N; i++) { if (isNaN(slope[i])) continue; var v = A[k * N + i]; if (!isNaN(v)) { s += v; n++ } } return n ? s / n : null });
    var mMean = mang ? years.map(function (yy, k) { var s = 0, n = 0; for (var i = 0; i < N; i++) { if (isNaN(slope[i]) || isNaN(mang.v[i])) continue; var v = A[k * N + i]; if (!isNaN(v)) { s += v; n++ } } return n ? s / n : null }) : null;
    var tA = mk(years, mean), tM = mMean && mN >= 20 ? mk(years, mMean) : null, pk = pxKm(bb, w, h);
    var fig = mapFig(w, h, bb, function (i) { if (isNaN(slope[i]) || !(pv[i] < .05)) return null; var c = ramp(DIV_BG, .5 + slope[i] * 10 / .2); return [c[0], c[1], c[2], 225] },
      { kind: "ramp", stops: DIV_BG, lo: "−0.1 browner", hi: "greener +0.1", unit: "Change in plant greenness (NDVI) per decade, 2001–" + lastY, note: "Only statistically clear changes (p < 0.05) are coloured; each square is " + (AR.px < .3 ? "250 m" : "about " + AR.pxTxt + ", sampled from NASA's 250 m data") + "." }, [p.lat, p.lon], { outline: mang ? mang.v : null, outlineLabel: "Mangroves in 2000", border: AR.border });
    try { fig.base = await baseMap(bb, 1100) } catch (e) {}
    var share = function (a) { return (100 * a / valid).toFixed(1) + "%" };
    var text = "NASA's MODIS Terra satellite measured plant greenness (NDVI) over this " + AR.label + " every 16 days from 2001 to " + lastY + ", at 250 m detail" + (AR.px >= .3 ? " (read here every " + AR.pxTxt + ", a regular sample of NASA's 250 m squares)" : "") + ". For each of the " + valid.toLocaleString("en-US") + " squares of land with a full record (" + Math.round(valid * pk).toLocaleString("en-US") + " km²), the yearly greenness was tested for a trend (Mann–Kendall) and its rate estimated (Sen's slope). " +
      share(up) + " of the area became significantly greener and " + share(dn) + " significantly browner (95% confidence). Averaged over the area, greenness changed by " + trendWords(tA, "NDVI", 3, 10) + "." +
      (tM ? " Inside the mangroves mapped in 2000 (" + Math.round(mN * pk).toLocaleString("en-US") + " km² in this square), " + (100 * mUp / mN).toFixed(1) + "% greened and " + (100 * mDn / mN).toFixed(1) + "% browned significantly; their average greenness changed by " + trendWords(tM, "NDVI", 3, 10) + "." : "");
    var series = [{ xs: years, ys: mean, label: "Whole area", color: "#2c7fb8" }]; if (mMean && tM) series.push({ xs: years, ys: mMean, label: "Mangroves (2000 map)", color: "#1a9850" });
    return { id: "green", title: "Where the land got greener or browner (NASA MODIS, 2001–" + lastY + ")", text: text, figs: [fig, { type: "line", series: series, trend: tA, ylab: "NDVI (yearly highest)", unit: "NDVI", d: 2 }],
      refs: ["modis_ndvi", "gibs", "mk", "sen"].concat(mang ? ["giri"] : []), facts: [text], num: { up: up / valid, down: dn / valid, trend: tA, mang: tM ? { up: mUp / mN, down: mDn / mN, trend: tM, km2: mN * pk } : null, km2: valid * pk, unmatched: miss } };
  }

  /* 4b. land cover change: NASA MODIS land cover (MCD12Q1, IGBP classes, 500 m), 2001 and the latest year */
  async function landCover(D, H) {
    var p = D.place, AR = areaOf(D, 20, 60, .5, D.area ? 600 : 120), bb = AR.bb, w = AR.w, h = AR.h, km = AR.km;
    var a = await grid("MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual", "MODIS_IGBP_Land_Cover_Type", "2001-01-01", bb, w, h), b = await grid("MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual", "MODIS_IGBP_Land_Cover_Type", LC_LAST + "-01-01", bb, w, h);
    var pk = pxKm(bb, w, h), cA = {}, cB = {}, tr = {}, n = 0, ch = 0;
    for (var i = 0; i < w * h; i++) { if (AR.mask && !AR.mask[i]) continue; var x = a.cls[i] === 0 ? 17 : a.cls[i], y = b.cls[i] === 0 ? 17 : b.cls[i]; if (x < 0 || y < 0) continue; n++; cA[x] = (cA[x] || 0) + 1; cB[y] = (cB[y] || 0) + 1; if (x !== y) { ch++; tr[x + ">" + y] = (tr[x + ">" + y] || 0) + 1 } }
    if (n < 50) throw new Error("no land cover here");
    var rows = Object.keys(Object.assign({}, cA, cB)).map(Number).sort(function (p1, p2) { return (cB[p2] || 0) + (cA[p2] || 0) - (cB[p1] || 0) - (cA[p1] || 0) }).map(function (k) { return [IGBP[k], fx((cA[k] || 0) * pk, 0), fx((cB[k] || 0) * pk, 0), sgn(((cB[k] || 0) - (cA[k] || 0)) * pk, 0)] });
    var top = Object.keys(tr).sort(function (p1, p2) { return tr[p2] - tr[p1] }).slice(0, 5).map(function (k) { var z = k.split(">"); return IGBP[z[0]].toLowerCase() + " → " + IGBP[z[1]].toLowerCase() + " (" + fx(tr[k] * pk, 0) + " km²)" });
    /* one map of what changed: unchanged squares show the base map; changed squares are coloured by what they became */
    var became = {}; for (var i2 = 0; i2 < w * h; i2++) { if (AR.mask && !AR.mask[i2]) continue; var x0 = a.cls[i2] === 0 ? 17 : a.cls[i2], y0 = b.cls[i2] === 0 ? 17 : b.cls[i2]; if (x0 > 0 && y0 > 0 && x0 !== y0) became[y0] = (became[y0] || 0) + 1 }
    var leg = { kind: "classes", items: Object.keys(became).map(Number).sort(function (p1, p2) { return became[p2] - became[p1] }).map(function (k) { return [IGBP_COL[k], "Became " + IGBP[k].toLowerCase()] }) };
    if (!leg.items.length) leg.items = [["#cccccc", "No square changed class"]];
    var chg = function (i) { if (AR.mask && !AR.mask[i]) return null; var x0 = a.cls[i] === 0 ? 17 : a.cls[i], y0 = b.cls[i] === 0 ? 17 : b.cls[i]; if (x0 < 1 || y0 < 1 || x0 === y0) return null; var hx = IGBP_COL[y0]; return [parseInt(hx.slice(1, 3), 16), parseInt(hx.slice(3, 5), 16), parseInt(hx.slice(5, 7), 16), 235] };
    var lcFig = mapFig(w, h, bb, chg, leg, [p.lat, p.lon], { caption: "What changed between 2001 and " + LC_LAST + " (" + (AR.px < .6 ? "500 m" : "about " + AR.pxTxt) + " squares; no colour = no change)", border: AR.border });
    try { lcFig.base = await baseMap(bb, 1100) } catch (e) {}
    var text = "NASA's MODIS land cover map (500 m squares, the IGBP classes) shows " + fx(100 * ch / n, 1) + "% of this " + AR.label + " (" + fx(ch * pk, 0) + " km²) in a different class in " + LC_LAST + " than in 2001." + (top.length ? " The largest changes: " + top.join("; ") + "." : "") + " The map colours only the squares that changed, by what they became; everywhere else is unchanged. Single squares can also be classification noise, so small changes should be checked on the pictures.";
    return { id: "lc", title: "Land cover in 2001 and " + LC_LAST + " (NASA MODIS)", text: text, figs: [lcFig],
      table: { head: ["Land cover", "2001 (km²)", LC_LAST + " (km²)", "Change (km²)"], rows: rows }, refs: ["mcd12q1", "gibs"], facts: [text], num: { changed: ch / n, km2: ch * pk } };
  }

  /* 4c. sea level: NOAA Laboratory for Satellite Altimetry regional series (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6MF), annual signals kept */
  var SL = [["ads", "Adriatic Sea", 40, 46, 12, 20], ["prs", "Persian Gulf", 23, 31, 47, 57], ["bas", "Baltic Sea", 53, 66, 9, 31], ["nrs", "North Sea", 50, 62, -5, 9], ["mds", "Mediterranean Sea", 30, 46, -6, 37], ["ans", "Andaman Sea", 5, 17, 92, 99],
    ["bob", "Bay of Bengal", 5, 24, 78, 95], ["ars", "Arabian Sea", 0, 26, 50, 78], ["crs", "Caribbean Sea", 8, 22, -88, -60], ["goa", "Gulf of America", 18, 31, -98, -80], ["yls", "Yellow Sea", 31, 41, 117, 127], ["soj", "Sea of Japan", 33, 52, 127, 142],
    ["soo", "Sea of Okhotsk", 43, 62, 135, 163], ["scs", "South China Sea", 0, 24, 99, 121], ["int", "Indonesian seas", -11, 5, 95, 141], ["brs", "Bering Sea", 51, 66, 162, 200]];
  function slRegion(lat, lon) { var l2 = lon < 0 ? lon + 360 : lon; for (var i = 0; i < SL.length; i++) { var r = SL[i]; if (lat >= r[2] && lat <= r[3] && ((lon >= r[4] && lon <= r[5]) || (l2 >= r[4] && l2 <= r[5]))) return r } if (lon >= 20 && lon <= 147 && lat < 31) return ["ind", "Indian Ocean"]; if (lon > -70 && lon < 20) return ["atl", "Atlantic Ocean"]; return ["pac", "Pacific Ocean"] }
  async function seaLevel(D) {
    var r = slRegion(D.place.lat, D.place.lon), u = "https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/slr/slr_sla_" + r[0] + "_keep_ref_90.csv", t = await getText(u, 30000), by = {}, noaa = (t.match(/#trend\s*=\s*([-0-9.]+)\s*mm\/year/) || [])[1];
    t.split("\n").forEach(function (l) { if (!l || l[0] === "#" || /^year/.test(l)) return; var c = l.split(","), yr = parseFloat(c[0]), v = null; for (var k = 1; k < c.length; k++) if (c[k] !== "" && !isNaN(parseFloat(c[k]))) { v = parseFloat(c[k]) } if (v === null || isNaN(yr)) return; var y = Math.floor(yr); (by[y] = by[y] || []).push(v) });
    var thisY = new Date().getUTCFullYear(), ys = Object.keys(by).map(Number).filter(function (y) { return y < thisY && by[y].length >= 20 }).sort(), vs = ys.map(function (y) { return by[y].reduce(function (a, b) { return a + b }, 0) / by[y].length });
    if (ys.length < 10) throw new Error("too few years of sea level");
    var tt = mk(ys, vs), n = ys.length, mx = ys.reduce(function (a, b) { return a + b }, 0) / n, my = vs.reduce(function (a, b) { return a + b }, 0) / n, sxy = 0, sxx = 0; ys.forEach(function (y, i) { sxy += (y - mx) * (vs[i] - my); sxx += (y - mx) * (y - mx) }); var ols = sxy / sxx;
    var rise = tt.slope * (ys[n - 1] - ys[0]);
    var text = "Satellites have measured the height of the sea in the " + r[1] + " since 1992 (NOAA Laboratory for Satellite Altimetry; TOPEX/Poseidon, Jason-1, -2, -3 and Sentinel-6). From the yearly averages " + ys[0] + "–" + ys[n - 1] + ", the sea rose by " + trendWords(tt, "mm", 2, 1) + "; a straight-line fit gives " + fx(ols, 2) + " mm per year" + (noaa ? ", and NOAA's own published rate for this region is " + noaa + " mm per year" : "") + ". That is about " + fx(rise / 10, 1) + " cm over the record. This is the average for the whole " + r[1] + "; at the coast, sinking or rising land can make the local rise larger or smaller.";
    return { id: "sl", title: "Sea level in the " + r[1] + " (satellite altimetry, " + ys[0] + "–" + ys[n - 1] + ")", text: text, figs: [{ type: "line", series: [{ xs: ys, ys: vs, label: r[1], color: "#2c7fb8" }], trend: tt, ylab: "Sea level (mm, against 1990s mean)", unit: "mm", d: 0 }],
      refs: ["lsa", "mk", "sen"], facts: [text], num: { region: r[1], trend: tt, ols: ols, noaa: noaa ? +noaa : null }, src: u };
  }

  /* 4d. river flow: GloFAS v4 river discharge reanalysis (5 km) through Open-Meteo, 1984-2021 */
  async function river(D) {
    /* GloFAS gives the river flow of the 5 km cell at a point; the place itself may not be on the main river, so the largest flow among
       five points (the place and 4 around it, about 13 km away diagonally) is used, and its distance is reported */
    var p = D.place, la = [], lo2 = [], dl = .09, dn = .09 / Math.max(.2, Math.cos(p.lat * Math.PI / 180));
    [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (o) { la.push((p.lat + o[0] * dl).toFixed(4)); lo2.push((p.lon + o[1] * dn).toFixed(4)) });
    /* Open-Meteo counts every two weeks of data at every point as one request: first find the point with the most water from one
       year at the five points (cheap), then fetch the full record for that point only (the same answer, about a fifth of the cost) */
    var u0 = "https://flood-api.open-meteo.com/v1/flood?latitude=" + la.join(",") + "&longitude=" + lo2.join(",") + "&daily=river_discharge&start_date=2020-01-01&end_date=2020-12-31", J0 = await getJSON(u0, 60000), bi = -1, bm = -1;
    (Array.isArray(J0) ? J0 : [J0]).forEach(function (z, i) { var v = ((z.daily || {}).river_discharge || []).filter(function (q) { return q !== null }); if (v.length < 300) return; var mm = v.reduce(function (s2, q) { return s2 + q }, 0) / v.length; if (mm > bm) { bm = mm; bi = i } });
    if (bi < 0) throw new Error("GloFAS has no river here");
    var u = "https://flood-api.open-meteo.com/v1/flood?latitude=" + la[bi] + "&longitude=" + lo2[bi] + "&daily=river_discharge&start_date=1984-01-01&end_date=2021-12-31", J = await getJSON(u, 60000), best = null, bestM = -1;
    (Array.isArray(J) ? J : [J]).forEach(function (z) { var v = ((z.daily || {}).river_discharge || []).filter(function (q) { return q !== null }); if (v.length < 7000) return; var mm = v.reduce(function (s2, q) { return s2 + q }, 0) / v.length; if (mm > bestM) { bestM = mm; best = z } });
    if (!best) throw new Error("GloFAS has no river here");
    var j = best, d = j.daily || {}, by = {}, mon = [], distKm = Math.sqrt(Math.pow((j.latitude - p.lat) * 111.32, 2) + Math.pow((j.longitude - p.lon) * 111.32 * Math.cos(p.lat * Math.PI / 180), 2));
    for (var m = 0; m < 12; m++) mon.push([]);
    (d.time || []).forEach(function (t, i) { var v = d.river_discharge[i]; if (v === null || v === undefined) return; (by[t.slice(0, 4)] = by[t.slice(0, 4)] || []).push([+t.slice(5, 7) - 1, v]); mon[+t.slice(5, 7) - 1].push(v) });
    var ys = Object.keys(by).map(Number).filter(function (y) { return by[y].length >= 360 }).sort(); if (ys.length < 20) throw new Error("no river in GloFAS at this point");
    var clim = mon.map(function (a) { return a.length ? a.reduce(function (s, v) { return s + v }, 0) / a.length : null }), tot = clim.reduce(function (s, v) { return s + (v || 0) }, 0) / 12;
    if (tot < 10) throw new Error("no large river at this point (average flow " + fx(tot, 1) + " m³/s)");
    var order = clim.map(function (v, i) { return [v, i] }).sort(function (a, b) { return a[0] - b[0] }), dry = order.slice(0, 3).map(function (z) { return z[1] }).sort(function (a, b) { return a - b }), MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var ann = ys.map(function (y) { return by[y].reduce(function (s, z) { return s + z[1] }, 0) / by[y].length }), drv = ys.map(function (y) { var a = by[y].filter(function (z) { return dry.indexOf(z[0]) >= 0 }); return a.length ? a.reduce(function (s, z) { return s + z[1] }, 0) / a.length : null }), pk = ys.map(function (y) { return Math.max.apply(null, by[y].map(function (z) { return z[1] }) ) });
    var tA = mk(ys, ann), tD = mk(ys, drv), tP = mk(ys, pk);
    var text = "The GloFAS river model (Copernicus Emergency Management Service, version 4, 5 km grid) estimates river flow every day (here from " + ys[0] + "). The largest river cell within about 13 km is " + (distKm < 3 ? "at the place" : "about " + Math.round(distKm) + " km away (" + fx(j.latitude, 3) + ", " + fx(j.longitude, 3) + ")") + ". Average flow " + ys[0] + "–" + ys[ys.length - 1] + ": " + fx(tot, 0) + " m³/s. Yearly average flow changed by " + trendWords(tA, "m³/s", 0, 10) + "; flow in the driest months (" + dry.map(function (k) { return MN[k] }).join(", ") + ") changed by " + trendWords(tD, "m³/s", 0, 10) + "; the year's highest daily flow changed by " + trendWords(tP, "m³/s", 0, 10) + ". GloFAS is a model driven by ERA5 weather, not a river gauge: it does not fully include dams, canals and water taken out for farming.";
    return { id: "river", title: "River flow nearby (GloFAS, " + ys[0] + "–" + ys[ys.length - 1] + ")", text: text, figs: [{ type: "line", series: [{ xs: ys, ys: ann, label: "Yearly average", color: "#2c7fb8" }, { xs: ys, ys: drv, label: "Driest months", color: "#d95f02" }], trend: tD, trendOf: 1, ylab: "Flow (m³/s)", unit: "m³/s", d: 0 }],
      refs: ["glofas", "openmeteo", "mk", "sen"], facts: [text], num: { mean: tot, annual: tA, dry: tD, peak: tP, dryMonths: dry }, src: u };
  }

  /* 4e. sea-surface salinity: NASA SMAP (Remote Sensing Systems, monthly, about 40 km), April 2015 - June 2022 in NASA GIBS */
  async function salinity(D, H, prog) {
    var p = D.place, bb = boxKm(p.lat, p.lon, 300), w = 60, h = 60, mons = [], y, m;
    for (y = 2015; y <= 2022; y++) for (m = 1; m <= 12; m++) { if (y === 2015 && m < 4) continue; if (y === 2022 && m > 6) break; mons.push(iso(y, m, 1)) }
    var done = 0, gs = await pool(6, mons, async function (t) { var g = await grid("SMAP_L3_Sea_Surface_Salinity_REMSS_Monthly", "SMAP_Sea_Surface_Salinity", t, bb, w, h); done++; prog && prog("NASA SMAP salinity: " + done + " of " + mons.length + " months"); return g });
    /* sea pixels nearest the place: within 150 km, else the nearest 20 */
    var cx = (w - 1) / 2, cy = (h - 1) / 2, kmPx = 300 / w, near = [];
    for (var i = 0; i < w * h; i++) { var dx = (i % w - cx) * kmPx, dy = (Math.floor(i / w) - cy) * kmPx; near.push([Math.sqrt(dx * dx + dy * dy), i]) }
    near.sort(function (a, b) { return a[0] - b[0] });
    var seaAny = new Uint8Array(w * h), sum = new Float64Array(w * h), cnt = new Uint16Array(w * h);
    gs.forEach(function (g) { if (!g) return; for (var i = 0; i < w * h; i++) if (!isNaN(g.v[i])) { seaAny[i] = 1; sum[i] += g.v[i]; cnt[i]++ } });
    var pick = near.filter(function (z) { return seaAny[z[1]] && z[0] <= 150 }).map(function (z) { return z[1] }); if (pick.length < 4) pick = near.filter(function (z) { return seaAny[z[1]] }).slice(0, 20).map(function (z) { return z[1] });
    if (!pick.length) throw new Error("no sea within 150 km");
    var dist = near.filter(function (z) { return z[1] === pick[0] })[0][0];
    /* monthly value = median over the nearby sea pixels; readings in NASA's lowest class ("below 30 psu") are ranked below all others */
    var xs = [], vs = [], mo = [], low = [], lowM = 0, allPx = 0, lowPx = 0;
    gs.forEach(function (g, k) { if (!g) return; var a = []; pick.forEach(function (i) { if (!isNaN(g.v[i])) { a.push(g.cens[i] < 0 ? -1 : g.v[i]); allPx++; if (g.cens[i] < 0) lowPx++ } }); if (a.length < Math.max(1, pick.length / 3)) return; var md = median(a), fr = a.filter(function (v) { return v < 0 }).length / a.length; xs.push(+mons[k].slice(0, 4) + (+mons[k].slice(5, 7) - .5) / 12); vs.push(md < 0 ? null : md); low.push(fr); mo.push(+mons[k].slice(5, 7)); if (md < 0) lowM++ });
    if (xs.length < 24) throw new Error("too few months of salinity");
    var clim = [], climLow = []; for (m = 1; m <= 12; m++) { var a2 = vs.filter(function (v, k) { return mo[k] === m && v !== null }), nl = low.filter(function (v, k) { return mo[k] === m }); clim[m] = a2.length ? median(a2) : null; climLow[m] = nl.length ? nl.reduce(function (s2, v) { return s2 + v }, 0) / nl.length : null }
    /* trend: Mann-Kendall on the monthly medians with the seasonal cycle removed (only when few months are "below 30") */
    var tt = null; if (lowM <= xs.length * .15) { var anom = vs.map(function (v, k) { return v === null || clim[mo[k]] === null ? null : v - clim[mo[k]] }); tt = mk(xs, anom) }
    var tLow = mk(xs, low.map(function (v) { return 100 * v })), MN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var cv = []; for (m = 1; m <= 12; m++) if (clim[m] !== null) cv.push([clim[m], m]); cv.sort(function (a, b) { return a[0] - b[0] });
    var freshM = []; for (m = 1; m <= 12; m++) if (climLow[m] !== null && climLow[m] >= .5) freshM.push(MN[m]);
    var fig = mapFig(w, h, bb, function (i) { if (!cnt[i]) return null; var c = ramp(SEQ, ((sum[i] / cnt[i]) - 28) / 8); return [c[0], c[1], c[2]] }, { kind: "ramp", stops: SEQ, lo: 28, hi: 36, unit: "practical salinity (psu), average 2015–2022 (values below 30 count as 30)" }, [p.lat, p.lon], { ring: 150 });
    try { fig.base = await baseMap(bb, 1100) } catch (e) {}
    var text = "NASA's SMAP satellite measures the saltiness of the sea surface (practical salinity units, psu) in squares about 40 km wide; NASA's map shows values from 30 psu up and puts anything fresher in one class, \"below 30\". " + (dist > 30 ? "The nearest sea it can measure is about " + Math.round(dist) + " km from the place. " : "") +
      "Over the sea within 150 km (April 2015 – June 2022): " + (cv.length ? "the saltiest month is usually " + MN[cv[cv.length - 1][1]] + " (median " + fx(cv[cv.length - 1][0], 2) + " psu)" : "") + (freshM.length ? "; in " + freshM.join(", ") + " most of this sea is fresher than 30 psu, from river water and monsoon rain" : cv.length ? " and the freshest " + MN[cv[0][1]] + " (" + fx(cv[0][0], 2) + " psu)" : "") + ". " +
      (tt ? "With the seasonal cycle removed, salinity changed by " + trendWords(tt, "psu", 3, 1) + ". " : "") + "The share of this sea fresher than 30 psu " + (tLow && !tLow.lo && !tLow.hi && !tLow.slope ? "did not change measurably (Mann–Kendall " + pEq(tLow.ph) + ")" : "changed by " + trendWords(tLow, "percentage points", 2, 1)) + ". Seven years is too short to call either a long-term trend. Satellites cannot measure salinity inside river channels or close to the shore, where it matters most for coastal forests and farms.";
    var mean = vs.filter(function (v) { return v !== null }).length ? median(vs.filter(function (v) { return v !== null })) : null;
    return { id: "sss", title: "Sea-surface salinity nearby (NASA SMAP, 2015–2022)", text: text, figs: [fig, { type: "line", series: [{ xs: xs, ys: low.map(function (v) { return 100 * v }), label: "Share of nearby sea fresher than 30 psu (%)", color: "#2c7fb8" }], ylab: "Fresher than 30 psu (%)", unit: "%", d: 0 }],
      refs: ["smap", "gibs", "mk", "sen"], facts: [text], num: { median: mean, lowShare: lowPx / Math.max(1, allPx), trend: tt, trendLow: tLow, dist: dist, freshMonths: freshM } };
  }

  /* 4f. sea surface temperature: GHRSST MUR25 (0.25 degree, daily) read on the 15th of every month since September 2002 */
  async function seaTemp(D, H, prog) {
    var p = D.place, bb = boxKm(p.lat, p.lon, 120), w = 24, h = 24, lastY = new Date().getUTCFullYear() - 1, days = [], y, m;
    for (y = 2002; y <= lastY; y++) for (m = 1; m <= 12; m++) { if (y === 2002 && m < 9) continue; days.push(iso(y, m, 15)) }
    var done = 0, gs = await pool(6, days, async function (t) { var g = await grid("GHRSST_L4_MUR25_Sea_Surface_Temperature", "GHRSST_Sea_Surface_Temperature", t, bb, w, h); done++; prog && prog("Sea temperature (GHRSST MUR): " + done + " of " + days.length + " months"); return g });
    var xs = [], vs = [], mo = [], cens = 0;
    gs.forEach(function (g, k) { if (!g) return; var s = 0, n = 0; for (var i = 0; i < w * h; i++) if (!isNaN(g.v[i])) { s += g.v[i]; n++; if (g.cens[i]) cens++ } if (n >= 3) { xs.push(+days[k].slice(0, 4) + (+days[k].slice(5, 7) - .5) / 12); vs.push(s / n); mo.push(+days[k].slice(5, 7)) } });
    if (vs.length < 60) throw new Error("too few sea temperature readings near the place");
    var by = {}; xs.forEach(function (x, k) { var yy = Math.floor(x); (by[yy] = by[yy] || []).push(vs[k]) });
    var ys = Object.keys(by).map(Number).filter(function (yy) { return by[yy].length >= 10 }).sort(), ann = ys.map(function (yy) { return by[yy].reduce(function (s, v) { return s + v }, 0) / by[yy].length }), tt = mk(ys, ann);
    var text = "The GHRSST MUR sea-surface temperature analysis (NASA JPL, daily, 0.25°), read on the 15th of every month since September 2002 over the sea within about 60 km, gives a yearly average that changed by " + trendWords(tt, "°C", 2, 10) + ". Warmest yearly average: " + ys[ann.indexOf(Math.max.apply(null, ann))] + " (" + fx(Math.max.apply(null, ann), 2) + " °C)." + (cens ? " Some readings were at the top or bottom of NASA's colour scale (above 32 °C or below 0 °C) and count as those limits." : "");
    return { id: "sst", title: "Sea temperature nearby (GHRSST MUR, " + ys[0] + "–" + ys[ys.length - 1] + ")", text: text, figs: [{ type: "line", series: [{ xs: ys, ys: ann, label: "Yearly average", color: "#d95f02" }], trend: tt, ylab: "Sea temperature (°C)", unit: "°C", d: 1 }], refs: ["mur", "gibs", "mk", "sen"], facts: [text], num: { trend: tt } };
  }

  /* 4g. species records: GBIF (land) and OBIS (sea), with the global IUCN Red List category of each species */
  var RL = { CR: "critically endangered", EN: "endangered", VU: "vulnerable", NT: "near threatened", LC: "least concern", DD: "data deficient", EX: "extinct", EW: "extinct in the wild" };
  async function species(D, H) {
    var p = D.place, km = Math.max(30, Math.min(100, D.km || 50)), bb = boxKm(p.lat, p.lon, km), q = "decimalLatitude=" + bb.s.toFixed(4) + "," + bb.n.toFixed(4) + "&decimalLongitude=" + bb.w.toFixed(4) + "," + bb.e.toFixed(4), G = "https://api.gbif.org/v1/occurrence/search?" + q;
    var cat = await getJSON(G + "&limit=0&facet=iucnRedListCategory", 25000), byCat = {}; ((cat.facets || [])[0] || { counts: [] }).counts.forEach(function (c) { byCat[c.name] = c.count });
    var yr = await getJSON(G + "&limit=0&facet=year&facetLimit=400", 25000), dec = {}; ((yr.facets || [])[0] || { counts: [] }).counts.forEach(function (c) { var d = Math.floor(+c.name / 10) * 10; if (d >= 1900) dec[d] = (dec[d] || 0) + c.count });
    var list = [];
    for (var c of ["CR", "EN", "VU"]) { if (!byCat[c]) continue; var r = await getJSON(G + "&limit=0&iucnRedListCategory=" + c + "&facet=speciesKey&facetLimit=40", 25000); ((r.facets || [])[0] || { counts: [] }).counts.forEach(function (z) { list.push({ key: +z.name, cat: c, n: z.count }) }) }
    list = list.slice(0, 60);
    await pool(6, list, async function (s) { var j = await getJSON("https://api.gbif.org/v1/species/" + s.key, 20000); s.name = j.canonicalName || j.species || j.scientificName; s.common = j.vernacularName || ""; s.group = j["class"] || j.phylum || j.kingdom || "" });
    var obis = null;
    if (H.kinds.some(function (k) { return k === "ocean" || k === "coast" || k === "mangrove" })) {
      try {
        var geom = encodeURIComponent("POLYGON((" + [[bb.w, bb.s], [bb.e, bb.s], [bb.e, bb.n], [bb.w, bb.n], [bb.w, bb.s]].map(function (z) { return z[0].toFixed(4) + " " + z[1].toFixed(4) }).join(",") + "))");
        var st = await getJSON("https://api.obis.org/v3/statistics?geometry=" + geom, 25000), rl = await getJSON("https://api.obis.org/v3/checklist/redlist?geometry=" + geom + "&size=200", 25000);
        obis = { records: st.records, species: st.species, years: st.yearrange, red: (rl.results || []).map(function (z) { return { name: z.acceptedNameUsage || z.scientificName, cat: z.category, group: z["class"] || z.phylum || "" } }).filter(function (z) { return /^(CR|EN|VU)$/.test(z.cat) }) };
      } catch (e) { obis = null }
    }
    var tot = cat.count || 0, decs = Object.keys(dec).map(Number).sort();
    var nT = { CR: 0, EN: 0, VU: 0 }; list.forEach(function (s) { nT[s.cat]++ });
    var text = "GBIF, the Global Biodiversity Information Facility, holds " + tot.toLocaleString("en-US") + " records of living things observed in this " + km + " km square (museum specimens, surveys and citizen science). Among them, species that the IUCN Red List rates as threatened worldwide: " + nT.CR + " critically endangered, " + nT.EN + " endangered and " + nT.VU + " vulnerable" + (list.length >= 60 ? " (at least)" : "") + "." +
      (obis ? " OBIS, the Ocean Biodiversity Information System, holds " + (obis.records || 0).toLocaleString("en-US") + " records of " + (obis.species || 0).toLocaleString("en-US") + " marine species here" + (obis.years ? " (" + obis.years[0] + "–" + obis.years[1] + ")" : "") + ", " + obis.red.length + " of them threatened on the Red List." : "") +
      " Records show where species have been seen, not how many live there: more records in recent decades mostly reflect more people looking (for example phone apps), and a missing species is not proof that it has gone. The Red List categories are global assessments, not local ones.";
    var rows = list.slice().sort(function (a, b) { return "CRENVU".indexOf(a.cat) - "CRENVU".indexOf(b.cat) || b.n - a.n }).slice(0, 25).map(function (s) { return [s.name + (s.common ? " (" + s.common + ")" : ""), s.group, RL[s.cat], s.n.toLocaleString("en-US")] });
    if (obis) obis.red.slice(0, 15).forEach(function (z) { if (!list.some(function (s) { return s.name === z.name })) rows.push([z.name, z.group, RL[z.cat] + " (OBIS)", "–"]) });
    return { id: "species", title: "Species records and threatened species (GBIF" + (obis ? ", OBIS" : "") + ", IUCN Red List)", text: text, figs: decs.length ? [{ type: "bars", xs: decs.map(function (d) { return d + "s" }), ys: decs.map(function (d) { return dec[d] }), ylab: "GBIF records per decade", unit: "records" }] : [],
      table: rows.length ? { head: ["Species", "Group", "IUCN Red List (global, as listed by GBIF)", "GBIF records here"], rows: rows } : null, refs: ["gbif", "iucn"].concat(obis ? ["obis"] : []), facts: [text, rows.length ? "Threatened species recorded: " + rows.slice(0, 12).map(function (r) { return r[0] + " – " + r[2] }).join("; ") : ""], num: { records: tot, cats: byCat, threatened: nT, obis: obis } };
  }

  /* 4h. dust (deserts): NASA MERRA-2 dust surface concentration, monthly from 1980, in NASA GIBS */
  async function dust(D, H, prog) {
    var p = D.place, bb = boxKm(p.lat, p.lon, 60), lastY = new Date().getUTCFullYear() - 1, mons = [];
    for (var y = 1980; y <= lastY; y++) for (var m = 1; m <= 12; m++) mons.push(iso(y, m, 1));
    var done = 0, gs = await pool(10, mons, async function (t) { var g = await grid("MERRA2_Dust_Surface_Mass_Concentration_Monthly", "MERRA2_Dust_Surface_Mass_Concentration_Monthly", t, bb, 3, 3); done++; if (done % 24 === 0) prog && prog("NASA MERRA-2 dust: " + done + " of " + mons.length + " months"); return g });
    var by = {}, top = 0, n = 0; gs.forEach(function (g, k) { if (!g) return; var v = g.v[4]; if (isNaN(v)) return; n++; var c = g.cens[4] > 0; if (c) top++; (by[mons[k].slice(0, 4)] = by[mons[k].slice(0, 4)] || []).push([v * 1e9, c]) });
    var ys = Object.keys(by).map(Number).filter(function (yy) { return by[yy].length === 12 }).sort(); if (ys.length < 20) throw new Error("too few months of dust data");
    var ann = ys.map(function (yy) { return by[yy].reduce(function (s2, z) { return s2 + z[0] }, 0) / 12 }), cap = ys.map(function (yy) { return by[yy].filter(function (z) { return z[1] }).length }), capShare = top / n;
    var tt = capShare < .2 ? mk(ys, ann) : null, tc = capShare > 0 ? mk(ys, cap) : null, text;
    if (capShare >= .98) text = "NASA's MERRA-2 reanalysis estimates how much dust is in the air near the ground every month since 1980. Here every month (" + top + " of " + n + ") reached 90 µg/m³ or more, the top of the scale NASA's map can show, so the map cannot show how the dust has changed. MERRA-2's full numbers need a NASA Earthdata account. Windy days from ERA5 are in the long-term section.";
    else text = "NASA's MERRA-2 reanalysis estimates how much dust is in the air near the ground every month since 1980 (" + ys[0] + "–" + ys[ys.length - 1] + "). " + (tt ? "The yearly average changed by " + trendWords(tt, "µg/m³", 1, 10) + "; the dustiest year was " + ys[ann.indexOf(Math.max.apply(null, ann))] + " (" + fx(Math.max.apply(null, ann), 0) + " µg/m³)." : "") + (top ? " In " + top + " of " + n + " months the dust reached 90 µg/m³ or more, the top of NASA's colour scale" + (tc ? "; the number of such months per year changed by " + trendWords(tc, "months", 1, 10) : "") + "." : "") + " Windy days from ERA5 are in the long-term section.";
    var series = tt ? [{ xs: ys, ys: ann, label: "Yearly average dust near the ground (µg/m³)", color: "#b8860b" }] : [{ xs: ys, ys: cap, label: "Months at 90 µg/m³ or more", color: "#b8860b" }];
    return { id: "dust", title: "Dust in the air (NASA MERRA-2, " + ys[0] + "–" + ys[ys.length - 1] + ")", text: text, figs: capShare >= .98 ? [] : [{ type: "line", series: series, trend: tt || tc, ylab: tt ? "Dust (µg/m³)" : "Months per year", unit: tt ? "µg/m³" : "months", d: 0 }], refs: ["merra2", "gibs", "mk", "sen"], facts: [text], num: { trend: tt, capTrend: tc, capped: top, months: n } };
  }

  /* 4i. cities: people (NASA SEDAC GPWv4) and the urban heat island (NASA SEDAC, 2013) */
  async function city(D) {
    var p = D.place, bb = boxKm(p.lat, p.lon, 10), out = [], pop = [];
    for (var y of [2000, 2005, 2010, 2015, 2020]) { var g = await grid("GPW_Population_Density_" + y, "GPW_Population_Density_" + y, null, bb, 11, 11), s = 0, n = 0, c = 0; for (var i = 0; i < 121; i++) if (!isNaN(g.v[i])) { s += g.v[i]; n++; if (g.cens[i] > 0) c++ } pop.push([y, n ? s / n : null, c]) }
    var uhi = {}; for (var k of ["Day_Max", "Night_Min"]) { try { var L = "UHI_Urban-Rural_Summer_" + k + "_Land_Surface_Temp_Difference_2013", g2 = await grid(L, L, null, boxKm(p.lat, p.lon, 6), 7, 7), v = g2.v[24]; uhi[k] = isNaN(v) ? null : { v: v, cens: g2.cens[24], e: g2.ent && g2.ent[24] ? { lo: g2.ent[24].lo, hi: g2.ent[24].hi } : null } } catch (e) { uhi[k] = null } }
    var f = pop.filter(function (z) { return z[1] !== null }), heavy = f.length && f.every(function (z) { return z[2] > 60 });
    var cr = function (u) { var e = u.e; if (!e) return (u.v >= 0 ? "about " + fx(u.v, 1) + " °C warmer" : "about " + fx(-u.v, 1) + " °C cooler"); if (!isFinite(e.lo)) return "more than " + fx(-e.hi, 0) + " °C cooler"; if (!isFinite(e.hi)) return "more than " + fx(e.lo, 0) + " °C warmer"; return e.lo >= 0 ? "between " + fx(e.lo, 2).replace(/\.?0+$/, "") + " and " + fx(e.hi, 2).replace(/\.?0+$/, "") + " °C warmer" : e.hi <= 0 ? "between " + fx(-e.hi, 2).replace(/\.?0+$/, "") + " and " + fx(-e.lo, 2).replace(/\.?0+$/, "") + " °C cooler" : "within " + fx(Math.max(-e.lo, e.hi), 2).replace(/\.?0+$/, "") + " °C" };
    var text = "NASA SEDAC's Gridded Population of the World (GPWv4) maps people per km² in 1 km squares. " + (heavy ? "Within 5 km of the place, most squares (" + f.map(function (z) { return z[2] }).join(", ") + " of 121 in " + f.map(function (z) { return z[0] }).join(", ") + ") are in the map's top class, 1,000 or more people per km², so the map cannot show how much denser it became." : "Average density within 5 km of the place: " + f.map(function (z) { return fx(z[1], 0) + " people per km² in " + z[0] }).join(", ") + (f.some(function (z) { return z[2] }) ? " (squares with 1,000 or more people per km² count as 1,000, so the real averages are higher)" : "") + ".") +
      ((uhi.Day_Max || uhi.Night_Min) ? " NASA SEDAC's urban heat island map (2013, from MODIS land surface temperature) shows this built-up area " + [["Day_Max", "on summer days"], ["Night_Min", "on summer nights"]].filter(function (z) { return uhi[z[0]] }).map(function (z) { return cr(uhi[z[0]]) + " than the countryside around it " + z[1] }).join(", and ") + "." : "");
    return { id: "city", title: "People and heat (NASA SEDAC)", text: text, figs: heavy ? [] : [{ type: "bars", xs: f.map(function (z) { return String(z[0]) }), ys: f.map(function (z) { return z[1] }), ylab: "People per km² within 5 km", unit: "people/km²" }], refs: ["gpw", "uhi", "gibs"], facts: [text], num: { pop: pop, uhi: uhi } };
  }

  var REFS = {
    era5: ["Hersbach, H. et al. (2020). The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society, 146, 1999–2049.", "https://doi.org/10.1002/qj.3803"],
    openmeteo: ["Zippenfenig, P. (2023). Open-Meteo.com Weather API.", "https://open-meteo.com/"],
    etccdi: ["Zhang, X. et al. (2011). Indices for monitoring changes in extremes based on daily temperature and precipitation data. WIREs Climate Change, 2, 851–870.", "https://doi.org/10.1002/wcc.147"],
    mk: ["Mann, H. B. (1945). Nonparametric tests against trend. Econometrica, 13, 245–259; Kendall, M. G. (1975). Rank Correlation Methods. Griffin.", "https://doi.org/10.2307/1907187"],
    sen: ["Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall's tau. Journal of the American Statistical Association, 63, 1379–1389.", "https://doi.org/10.1080/01621459.1968.10480934"],
    hr: ["Hamed, K. H. & Rao, A. R. (1998). A modified Mann-Kendall trend test for autocorrelated data. Journal of Hydrology, 204, 182–196.", "https://doi.org/10.1016/S0022-1694(97)00125-X"],
    pettitt: ["Pettitt, A. N. (1979). A non-parametric approach to the change-point problem. Applied Statistics, 28, 126–135.", "https://doi.org/10.2307/2346729"],
    gilbert: ["Gilbert, R. O. (1987). Statistical Methods for Environmental Pollution Monitoring. Van Nostrand Reinhold.", ""],
    gibs: ["NASA Global Imagery Browse Services (GIBS), NASA Earth Science Data and Information System.", "https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api"],
    modis_ndvi: ["Didan, K. (2021). MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid V061 (MOD13Q1). NASA LP DAAC.", "https://doi.org/10.5067/MODIS/MOD13Q1.061"],
    mcd12q1: ["Friedl, M. & Sulla-Menashe, D. (2022). MODIS/Terra+Aqua Land Cover Type Yearly L3 Global 500m SIN Grid V061 (MCD12Q1). NASA LP DAAC.", "https://doi.org/10.5067/MODIS/MCD12Q1.061"],
    giri: ["Giri, C. et al. (2011). Status and distribution of mangrove forests of the world using earth observation satellite data. Global Ecology and Biogeography, 20, 154–159.", "https://doi.org/10.1111/j.1466-8238.2010.00584.x"],
    lsa: ["NOAA Laboratory for Satellite Altimetry. Sea Level Rise: regional time series. Altimetry data are provided by NOAA Laboratory for Satellite Altimetry.", "https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/"],
    glofas: ["Harrigan, S. et al. (2020). GloFAS-ERA5 operational global river discharge reanalysis 1979–present. Earth System Science Data, 12, 2043–2060.", "https://doi.org/10.5194/essd-12-2043-2020"],
    smap: ["Remote Sensing Systems (2022). SMAP Sea Surface Salinity Products, Ver. 5.0 (Level 3, monthly). PO.DAAC, CA, USA.", "https://doi.org/10.5067/SMP50-3SMCS"],
    mur: ["JPL MUR MEaSUREs Project (2019). GHRSST Level 4 MUR 0.25deg Global Foundation Sea Surface Temperature Analysis (v4.2). NASA PO.DAAC.", "https://doi.org/10.5067/GHM25-4FJ42"],
    gbif: ["GBIF.org (" + new Date().getUTCFullYear() + "). GBIF Occurrence Search, Global Biodiversity Information Facility.", "https://www.gbif.org/"],
    obis: ["OBIS (" + new Date().getUTCFullYear() + "). Ocean Biodiversity Information System. Intergovernmental Oceanographic Commission of UNESCO.", "https://obis.org/"],
    iucn: ["IUCN (" + new Date().getUTCFullYear() + "). The IUCN Red List of Threatened Species, via GBIF and OBIS.", "https://www.iucnredlist.org/"],
    merra2: ["Gelaro, R. et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). Journal of Climate, 30, 5419–5454.", "https://doi.org/10.1175/JCLI-D-16-0758.1"],
    gpw: ["CIESIN, Columbia University (2018). Gridded Population of the World, Version 4 (GPWv4): Population Density, Revision 11. NASA SEDAC.", "https://doi.org/10.7927/H49C6VHW"],
    uhi: ["CIESIN, Columbia University (2016). Global Urban Heat Island (UHI) Data Set, 2013. NASA SEDAC.", "https://doi.org/10.7927/H4H70CRF"]
  };
  EJD.REFS = REFS;
  /* ---------------- 5. long-term items ---------------- */
  function ltItems(D, LT) {
    var I = function (k) { return IDX.filter(function (z) { return z.k === k })[0] }, X = LT.idx, items = [], ys = LT.rows.map(function (r) { return r.y });
    var ord = function (n) { var s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) };
    var rk = function (o, hiWord, loWord) { if (!o) return "not in the record"; return o.r <= o.of / 2 ? ord(o.r) + " " + hiWord + " of " + o.of : ord(o.of - o.r + 1) + " " + loWord + " of " + o.of };
    var t = X.tm;
    if (t) {
      var pet = t.pet, text = "ECMWF's ERA5 reanalysis gives the daily weather at this place (grid point " + fx(LT.cell.lat, 2) + ", " + fx(LT.cell.lon, 2) + ") from " + LT.from + " to " + LT.to + ". The yearly mean air temperature changed by " + trendWords(t.full, "°C", 2, 10) + " over the whole record, and by " + trendWords(t.sat, "°C", 2, 10) + " since 1979, when satellite observations made ERA5 much more reliable." +
        (pet && pet.p < .05 ? " A change-point test (Pettitt) finds the clearest shift after " + pet.last + ": the average was " + fx(pet.before, 2) + " °C up to " + pet.last + " and " + fx(pet.after, 2) + " °C from " + pet.first + " (" + pEq(pet.p) + ")." + (pet.first >= 1976 && pet.first <= 1982 ? " Caution: this is when satellite observations entered ERA5 (1979), so part of this shift may come from the change in the data rather than the climate." : "") : " The change-point test (Pettitt) finds no clear shift (" + (pet ? pEq(pet.p) : "p n/a") + ").") +
        " Your two years: " + D.y1 + " was the " + rk(t.r1, "warmest", "coolest") + " years and " + D.y2 + " the " + rk(t.r2, "warmest", "coolest") + ".";
      items.push({ id: "lt_t", title: "Air temperature since " + LT.from + " (ERA5)", text: text, figs: [{ type: "line", series: [{ xs: ys, ys: LT.rows.map(function (r) { return r.tm === undefined ? null : r.tm }), label: "Yearly mean", color: "#d95f02" }], trend: t.full, mark: [D.y1, D.y2], change: pet && pet.p < .05 ? pet.first - .5 : null, ylab: "Air temperature (°C)", unit: "°C", d: 1 }],
        refs: ["era5", "openmeteo", "mk", "hr", "sen", "pettitt"], facts: [text], num: t });
    }
    var p = X.pr;
    if (p) {
      var text2 = "Yearly rainfall (wet days of at least 1 mm) changed by " + trendWords(p.full, "mm", 0, 10) + " since " + LT.from + " and by " + trendWords(p.sat, "mm", 0, 10) + " since 1979. Average " + fx(p.m6190, 0) + " mm a year in 1961–1990 and " + fx(p.m10s, 0) + " mm in the last ten years. " + D.y1 + " was the " + rk(p.r1, "wettest", "driest") + " years and " + D.y2 + " the " + rk(p.r2, "wettest", "driest") + ". ERA5 rainfall comes from a weather model guided by observations; it is less certain than its temperatures, especially for single heavy downpours.";
      items.push({ id: "lt_p", title: "Rainfall since " + LT.from + " (ERA5)", text: text2, figs: [{ type: "line", series: [{ xs: ys, ys: LT.rows.map(function (r) { return r.pr === undefined ? null : r.pr }), label: "Yearly rainfall", color: "#2c7fb8" }], trend: p.full, mark: [D.y1, D.y2], ylab: "Rainfall (mm)", unit: "mm", d: 0 }], refs: ["era5", "mk", "hr", "sen"], facts: [text2], num: p });
    }
    var rows = IDX.filter(function (z) { return X[z.k] }).map(function (z) { var o = X[z.k]; return [z.name, z.unit, fx(o.m6190, z.d), fx(o.m10s, z.d), o.full ? sgn(o.full.slope * 10, z.d) + " [" + sgn(o.full.lo * 10, z.d) + ", " + sgn(o.full.hi * 10, z.d) + "]" : "n/a", o.full ? pfmt(o.full.ph) : "n/a", o.sat ? sgn(o.sat.slope * 10, z.d) + " (p " + pfmt(o.sat.ph) + ")" : "n/a", o.pet && o.pet.p < .05 ? "after " + o.pet.last : "none"] });
    var clear = IDX.filter(function (z) { return X[z.k] && sig(X[z.k].full) && z.k !== "tm" && z.k !== "pr" }).map(function (z) { var o = X[z.k].full; return z.name.replace(/ \(.*\)$/, "").toLowerCase() + " " + (o.slope > 0 ? "increased" : "decreased") + " by " + fx(Math.abs(o.slope * 10), z.d) + " " + z.unit + " per decade" });
    var text3 = "Climate extremes, counted each year with the international ETCCDI definitions and tested the same way (Mann–Kendall corrected for autocorrelation, Sen's slope per decade with its 95% interval). " + (clear.length ? "Clear changes since " + LT.from + ": " + clear.join("; ") + "." : "None of the extreme indices changed clearly since " + LT.from + ".");
    var hot = X.tx90 ? { xs: ys, ys: LT.rows.map(function (r) { return r.tx90 === undefined ? null : r.tx90 }), label: "Hot days (% of days)", color: "#d73027" } : null;
    items.push({ id: "lt_x", title: "Climate extremes since " + LT.from + " (ERA5, ETCCDI indices)", text: text3, figs: hot ? [{ type: "line", series: [hot], trend: X.tx90.full, mark: [D.y1, D.y2], ylab: "Hot days (% of days)", unit: "%", d: 0 }] : [],
      table: { head: ["Index", "Unit", "1961–1990 mean", "Last 10 years", "Trend per decade " + LT.from + "–" + LT.to + " [95% interval]", "p (corrected)", "Trend per decade since 1979", "Change point"], rows: rows }, refs: ["etccdi", "era5", "mk", "hr", "sen", "gilbert", "pettitt"], facts: [text3, "Extreme indices (1961–1990 mean → last 10 years; trend per decade [95% interval], corrected p): " + rows.map(function (r) { return r[0] + " " + r[2] + " → " + r[3] + " " + r[1] + ", " + r[4] + ", p " + r[5] }).join("; ")] });
    return items;
  }

  /* ---------------- 6. run everything for one comparison ---------------- */
  var KIND_PACKS = { land: ["green", "lc", "river", "species"], mangrove: ["sl", "sss", "sst"], coast: ["sl", "sss", "sst"], ocean: ["sl", "sss", "sst", "species"], desert: ["dust"], city: ["city"] };
  var PACK_FN = { green: greenness, lc: landCover, river: river, species: species, sl: seaLevel, sss: salinity, sst: seaTemp, dust: dust, city: city };
  var PACK_NAME = { green: "Greenness change map", lc: "Land cover change", river: "River flow", species: "Species and the Red List", sl: "Sea level", sss: "Sea-surface salinity", sst: "Sea temperature", dust: "Dust", city: "People and urban heat" };
  EJD.run = async function (D, onStatus) {
    var R = { items: [], errors: [], packs: [], LT: null, H: null, done: false, at: new Date().toISOString() }, say = function (m) { R.status = m; try { onStatus && onStatus(m) } catch (e) {} };
    D.deep = R;
    if (EJD.early) { try { EJD.early(D) } catch (e) { } }   /* slow downloads that can run in the background from the start (deep2.js) */
    try { say("Reading ERA5's daily record since 1950 at " + D.place.name + "…"); R.LT = await longTerm(D); ltItems(D, R.LT).forEach(function (it) { it.section = "lt"; R.items.push(it) }) } catch (e) { R.errors.push(["Long-term record (ERA5)", e.message || String(e)]) }
    if (EJD.prepare) { try { await EJD.prepare(D, say) } catch (e) { R.errors.push(["Area of the place", e.message || String(e)]) } }
    try { say("Working out what kind of place this is (NASA MODIS land cover)…"); R.H = await detect(D) } catch (e) { R.errors.push(["Kind of place", e.message || String(e)]) }
    if (R.H) {
      var want = []; if (R.H.kinds.indexOf("ice") >= 0) want.push("__noGreen"); R.H.kinds.forEach(function (k) { (KIND_PACKS[k] || []).forEach(function (pk) { if (want.indexOf(pk) < 0 && !(pk === "green" && want.indexOf("__noGreen") >= 0)) want.push(pk) }) }); want = want.filter(function (z) { return z !== "__noGreen" });
      var orderP = ["green", "lc", "sl", "sss", "sst", "river", "dust", "city", "species"]; want.sort(function (a, b) { return orderP.indexOf(a) - orderP.indexOf(b) }); R.packs = want;
      for (var i = 0; i < want.length; i++) {
        var pk = want[i]; say("Research pack " + (i + 1) + " of " + want.length + ": " + PACK_NAME[pk] + "…");
        try { var it = await PACK_FN[pk](D, R.H, say); it.section = "hab"; R.items.push(it) } catch (e) { R.errors.push([PACK_NAME[pk], e.message || String(e)]) }
      }
      /* more research for every place (deep2.js): air, heat, terrain, hazards, the country, the future */
      var ex = (EJD.extra || []).filter(function (x) { return !x.kinds || x.kinds.some(function (k) { return R.H.kinds.indexOf(k) >= 0 }) });
      for (var j = 0; j < ex.length; j++) {
        say("Research pack " + (want.length + j + 1) + " of " + (want.length + ex.length) + ": " + ex[j].name + "…");
        try { var it2 = await ex[j].fn(D, R.H, say); if (it2) { (Array.isArray(it2) ? it2 : [it2]).forEach(function (q) { q.section = q.section || "hab"; R.items.push(q) }) } } catch (e) { R.errors.push([ex[j].name, e.message || String(e)]) }
      }
    }
    R.done = true; say("Research ready: " + R.items.length + " sections" + (R.errors.length ? ", " + R.errors.length + " could not be made" : "") + ".");
    return R;
  };
  EJD.PACK_NAME = PACK_NAME; EJD.packs = PACK_FN; EJD.ltItems = ltItems;
  /* every reference used, in order of first use */
  EJD.refsOf = function (R) { var k = []; (R.items || []).forEach(function (it) { (it.refs || []).forEach(function (r) { if (k.indexOf(r) < 0 && REFS[r]) k.push(r) }) }); return k.map(function (r) { return { key: r, text: REFS[r][0], url: REFS[r][1] } }) };
  EJD.facts = function (R) { var out = []; if (R && R.H) out.push("Kind of place (NASA MODIS land cover " + R.H.year + " within 10 km, mangrove map 2000): " + R.H.label + "; land cover at the point: " + R.H.pinName + "."); (R && R.items || []).forEach(function (it) { (it.facts || []).forEach(function (f) { if (f) out.push(it.title + ": " + f) }) });
    if (R && R.items && R.items.length) out.push("Already done in this report (do not suggest these as further research; suggest deeper or different work instead): " + R.items.map(function (it) { return it.title }).join("; ") + ".");
    return out };

  /* ---------------- 7. drawing (screen and PDF) ---------------- */
  EJD.draw = function (cv, fig, th) {
    th = th || {}; var dark = th.dark !== false, BG = dark ? "#0d1117" : "#ffffff", FG = dark ? "#e6edf3" : "#1f2328", GR = dark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)";
    var x = cv.getContext("2d"), W = cv.width, H = cv.height, s = th.scale || 1; x.save(); x.fillStyle = BG; x.fillRect(0, 0, W, H); x.font = (11 * s) + "px sans-serif"; x.fillStyle = FG; x.strokeStyle = FG;
    if (fig.type === "map") {
      var lh = (fig.legend && fig.legend.kind === "classes" ? Math.ceil(fig.legend.items.length / 2) * 14 + 8 : 68) * s, ah = H - lh - (fig.caption ? 16 * s : 0), ar = fig.w / fig.h * Math.cos(((fig.bb.s + fig.bb.n) / 2) * Math.PI / 180) * (fig.bb.e - fig.bb.w) / (fig.bb.n - fig.bb.s) / (fig.w / fig.h), mw = Math.min(W, ah * ar), mh = mw / ar, ox = (W - mw) / 2, oy = fig.caption ? 16 * s : 0;
      if (fig.caption) { x.textAlign = "center"; x.fillText(fig.caption, W / 2, 12 * s); x.textAlign = "left" }
      var c = document.createElement("canvas"); c.width = fig.w; c.height = fig.h; c.getContext("2d").putImageData(new ImageData(fig.rgba, fig.w, fig.h), 0, 0);
      x.fillStyle = dark ? "#1b2330" : "#e9edf1"; x.fillRect(ox, oy, mw, mh);
      if (fig.base && fig.base.base) { x.imageSmoothingEnabled = true; x.drawImage(fig.base.base, ox, oy, mw, mh) }
      /* each measured square is drawn as its own crisp tile with a hairline gap, slightly see-through so the streets show; squares are never
         smoothed or blended, because each one is one satellite measurement */
      var tpx = mw / fig.w, tpy = mh / fig.h;
      if (tpx >= 4 && tpy >= 4) {
        var gp = Math.max(.6, Math.min(tpx, tpy) * .07), al = fig.base && fig.base.base ? .82 : 1, rg = fig.rgba;
        for (var tj = 0; tj < fig.h; tj++) for (var ti = 0; ti < fig.w; ti++) { var tk = (tj * fig.w + ti) * 4; if (rg[tk + 3] < 8) continue;
          x.fillStyle = "rgba(" + rg[tk] + "," + rg[tk + 1] + "," + rg[tk + 2] + "," + (al * rg[tk + 3] / 255).toFixed(3) + ")";
          var X0 = Math.round(ox + ti * tpx + gp / 2), Y0 = Math.round(oy + tj * tpy + gp / 2), X1 = Math.round(ox + (ti + 1) * tpx - gp / 2), Y1 = Math.round(oy + (tj + 1) * tpy - gp / 2);
          x.fillRect(X0, Y0, Math.max(1, X1 - X0), Math.max(1, Y1 - Y0)) }
      } else { x.imageSmoothingEnabled = false; x.drawImage(c, ox, oy, mw, mh) }
      if (fig.base && fig.base.labels) { x.imageSmoothingEnabled = true; x.drawImage(fig.base.labels, ox, oy, mw, mh) }
      if (fig.outline) { x.fillStyle = dark ? "rgba(255,255,255,.45)" : "rgba(0,70,0,.55)"; var px = mw / fig.w, py = mh / fig.h; for (var j = 0; j < fig.h; j++) for (var i = 0; i < fig.w; i++) { var k = j * fig.w + i; if (isNaN(fig.outline[k])) continue; var edge = i === 0 || j === 0 || i === fig.w - 1 || j === fig.h - 1 || isNaN(fig.outline[k - 1]) || isNaN(fig.outline[k + 1]) || isNaN(fig.outline[k - fig.w]) || isNaN(fig.outline[k + fig.w]); if (edge) x.fillRect(ox + i * px, oy + j * py, Math.max(1, px), Math.max(1, py)) } }
      if (fig.ring) { var rx = fig.ring / ((fig.bb.e - fig.bb.w) * 111.32 * Math.cos(((fig.bb.s + fig.bb.n) / 2) * Math.PI / 180)) * mw, ry = fig.ring / ((fig.bb.n - fig.bb.s) * 111.32) * mh; x.strokeStyle = FG; x.setLineDash([4 * s, 3 * s]); x.beginPath(); x.ellipse(ox + mw / 2, oy + mh / 2, rx, ry, 0, 0, 7); x.stroke(); x.setLineDash([]) }
      if (fig.border && fig.border.length) { x.strokeStyle = fig.base && fig.base.base ? "rgba(30,30,30,.8)" : dark ? "rgba(255,255,255,.85)" : "rgba(20,20,20,.85)"; x.lineWidth = 1.3 * s; fig.border.forEach(function (ring) { x.beginPath(); ring.forEach(function (q, n) { var X = ox + (q[0] - fig.bb.w) / (fig.bb.e - fig.bb.w) * mw, Y = oy + (fig.bb.n - q[1]) / (fig.bb.n - fig.bb.s) * mh; n ? x.lineTo(X, Y) : x.moveTo(X, Y) }); x.stroke() }) }
      if (fig.pin) { var pxp = ox + (fig.pin[1] - fig.bb.w) / (fig.bb.e - fig.bb.w) * mw, pyp = oy + (fig.bb.n - fig.pin[0]) / (fig.bb.n - fig.bb.s) * mh; x.fillStyle = "#ff3b30"; x.strokeStyle = "#fff"; x.lineWidth = 1.5 * s; x.beginPath(); x.arc(pxp, pyp, 4 * s, 0, 7); x.fill(); x.stroke() }
      x.strokeStyle = GR; x.lineWidth = 1; x.strokeRect(ox, oy, mw, mh);
      if (fig.base && fig.base.credit) { x.font = (9 * s) + "px sans-serif"; var cw2 = x.measureText(fig.base.credit).width; x.fillStyle = "rgba(255,255,255,.8)"; x.fillRect(ox + mw - cw2 - 8 * s, oy, cw2 + 8 * s, 14 * s); x.fillStyle = "#333"; x.fillText(fig.base.credit, ox + mw - cw2 - 4 * s, oy + 10 * s); x.font = (11 * s) + "px sans-serif" }
      var kmW = (fig.bb.e - fig.bb.w) * 111.32 * Math.cos(((fig.bb.s + fig.bb.n) / 2) * Math.PI / 180), bar = Math.pow(10, Math.floor(Math.log10(kmW / 3))) * (kmW / 3 >= 5 * Math.pow(10, Math.floor(Math.log10(kmW / 3))) ? 5 : kmW / 3 >= 2 * Math.pow(10, Math.floor(Math.log10(kmW / 3))) ? 2 : 1), bpx = bar / kmW * mw;
      x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(ox + 6 * s, oy + mh - 20 * s, bpx + 8 * s, 16 * s); x.fillStyle = "#fff"; x.fillRect(ox + 10 * s, oy + mh - 10 * s, bpx, 3 * s); x.fillText(bar + " km", ox + 10 * s, oy + mh - 12 * s);
      var L = fig.legend, ly = oy + mh + 8 * s; x.fillStyle = FG;
      if (L && L.kind === "ramp") { var lw = Math.min(W - 20 * s, 300 * s), lx = (W - lw) / 2; for (var q = 0; q < lw; q++) { var cc = ramp(L.stops, q / lw); x.fillStyle = hex(cc); x.fillRect(lx + q, ly, 1.2, 10 * s) } x.fillStyle = FG; x.textAlign = "left"; x.fillText(String(L.lo), lx, ly + 22 * s); x.textAlign = "right"; x.fillText(String(L.hi), lx + lw, ly + 22 * s); x.textAlign = "center"; var fit = function (t, yy) { var fs = 11; x.font = (fs * s) + "px sans-serif"; while (fs > 7 && x.measureText(t).width > W - 16 * s) { fs -= .5; x.font = (fs * s) + "px sans-serif" } x.fillText(t, W / 2, yy); x.font = (11 * s) + "px sans-serif" }; fit(L.unit, ly + 36 * s); if (L.note) fit(L.note, ly + 50 * s); x.textAlign = "left" }
      else if (L && L.kind === "classes") { L.items.forEach(function (it, n) { var cx = n % 2 ? W / 2 : 10 * s, cy = ly + Math.floor(n / 2) * 14 * s; x.fillStyle = it[0]; x.fillRect(cx, cy, 10 * s, 10 * s); x.strokeStyle = GR; x.strokeRect(cx, cy, 10 * s, 10 * s); x.fillStyle = FG; var fs = 11, room = W / 2 - 28 * s; while (fs > 8 && x.measureText(it[1]).width > room) { fs -= 0.5; x.font = (fs * s) + "px sans-serif" } x.fillText(it[1], cx + 14 * s, cy + 9 * s); x.font = (11 * s) + "px sans-serif" }) }
      x.restore(); return;
    }
    var Lm = 46 * s, Rm = 18 * s, Tm = 10 * s, Bm = 34 * s, w = W - Lm - Rm, h = H - Tm - Bm;
    if (fig.type === "bars") {
      var mx = Math.max.apply(null, fig.ys.filter(function (v) { return v !== null })) || 1, bw = w / fig.xs.length;
      x.fillStyle = GR; x.fillRect(Lm, Tm + h, w, 1);
      fig.ys.forEach(function (v, n) { if (v === null) return; var bh = v / mx * h; x.fillStyle = "#2c7fb8"; x.fillRect(Lm + n * bw + bw * .15, Tm + h - bh, bw * .7, bh); x.fillStyle = FG; x.textAlign = "center"; if (fig.xs.length <= 14 || n % 2 === 0) x.fillText(fig.xs[n], Lm + n * bw + bw / 2, Tm + h + 13 * s) });
      x.textAlign = "right"; x.fillText(fmtAx(mx), Lm - 4 * s, Tm + 9 * s); x.fillText("0", Lm - 4 * s, Tm + h); x.save(); x.translate(10 * s, Tm + h / 2); x.rotate(-Math.PI / 2); x.textAlign = "center"; x.fillText(fig.ylab || "", 0, 0); x.restore(); x.restore(); return;
    }
    /* line chart */
    var all = []; fig.series.forEach(function (S) { S.ys.forEach(function (v) { if (v !== null && v !== undefined && isFinite(v)) all.push(v) }) });
    var X0 = Infinity, X1 = -Infinity; fig.series.forEach(function (S) { S.xs.forEach(function (v) { X0 = Math.min(X0, v); X1 = Math.max(X1, v) }) });
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * .08 || 1, pos = lo >= 0; lo -= pad; hi += pad; if (pos && lo < 0) lo = 0;
    var PX = function (v) { return Lm + (v - X0) / (X1 - X0 || 1) * w }, PY = function (v) { return Tm + h - (v - lo) / (hi - lo) * h };
    x.strokeStyle = GR; x.lineWidth = 1; for (var g = 0; g <= 4; g++) { var gv = lo + (hi - lo) * g / 4; x.beginPath(); x.moveTo(Lm, PY(gv)); x.lineTo(Lm + w, PY(gv)); x.stroke(); x.fillStyle = FG; x.textAlign = "right"; x.fillText(fmtAx(gv), Lm - 4 * s, PY(gv) + 3 * s) }
    var step = Math.max(1, Math.ceil((X1 - X0) / 8 / 5) * 5); x.textAlign = "center"; for (var tx = Math.ceil(X0 / step) * step; tx <= X1; tx += step) x.fillText(String(Math.round(tx)), PX(tx), Tm + h + 13 * s);
    if (fig.change) { x.strokeStyle = "#9467bd"; x.setLineDash([5 * s, 4 * s]); x.beginPath(); x.moveTo(PX(fig.change), Tm); x.lineTo(PX(fig.change), Tm + h); x.stroke(); x.setLineDash([]) }
    fig.series.forEach(function (S) { x.strokeStyle = S.color || "#2c7fb8"; x.lineWidth = 1.4 * s; x.beginPath(); var on = false; S.xs.forEach(function (xv, n) { var v = S.ys[n]; if (v === null || v === undefined || !isFinite(v)) { on = false; return } if (on) x.lineTo(PX(xv), PY(v)); else { x.moveTo(PX(xv), PY(v)); on = true } }); x.stroke() });
    var T = fig.trend; if (T) { var S0 = fig.series[fig.trendOf || 0], a = T.from, b = T.to, md = median(S0.ys.filter(function (v, n) { return v !== null && v !== undefined && isFinite(v) && S0.xs[n] >= a && S0.xs[n] <= b }).map(function (v, n2) { return v })); var b0 = T.b0; x.strokeStyle = dark ? "#fff" : "#000"; x.lineWidth = 1.2 * s; x.setLineDash([6 * s, 4 * s]); x.beginPath(); x.moveTo(PX(a), PY(b0 + T.slope * a)); x.lineTo(PX(b), PY(b0 + T.slope * b)); x.stroke(); x.setLineDash([]) }
    if (fig.mark) { var S1 = fig.series[0]; fig.mark.forEach(function (m, n) { var i = S1.xs.indexOf(m); if (i < 0 || S1.ys[i] === null || S1.ys[i] === undefined) return; x.fillStyle = n ? "#ff9f1c" : "#5ac8fa"; x.beginPath(); x.arc(PX(m), PY(S1.ys[i]), 4 * s, 0, 7); x.fill(); x.fillStyle = FG; x.textAlign = "center"; x.fillText(String(m), PX(m), PY(S1.ys[i]) - 7 * s) }) }
    var lx2 = Lm + 6 * s; fig.series.forEach(function (S) { x.fillStyle = S.color || "#2c7fb8"; x.fillRect(lx2, Tm + h + 20 * s, 12 * s, 3 * s); x.fillStyle = FG; x.textAlign = "left"; x.fillText(S.label || "", lx2 + 16 * s, Tm + h + 24 * s); lx2 += x.measureText(S.label || "").width + 32 * s });
    if (T) { x.setLineDash([6 * s, 4 * s]); x.strokeStyle = dark ? "#fff" : "#000"; x.beginPath(); x.moveTo(lx2, Tm + h + 21 * s); x.lineTo(lx2 + 12 * s, Tm + h + 21 * s); x.stroke(); x.setLineDash([]); x.fillStyle = FG; x.fillText("Sen's slope trend", lx2 + 16 * s, Tm + h + 24 * s) }
    x.save(); x.translate(10 * s, Tm + h / 2); x.rotate(-Math.PI / 2); x.textAlign = "center"; x.fillText(fig.ylab || "", 0, 0); x.restore();
    x.restore();
  };
  function fmtAx(v) { var a = Math.abs(v); if (a < 1e-9) return "0"; return a >= 1e4 ? Math.round(v / 1e3) + "k" : a >= 100 ? Math.round(v) + "" : a >= 10 ? v.toFixed(1) : a >= 1 ? v.toFixed(2) : v.toFixed(3) }

  window.EJD = EJD;
})();
