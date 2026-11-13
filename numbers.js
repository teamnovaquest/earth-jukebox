/* Earth Jukebox: NASA's own numbers behind the EIC pictures.
   get_eic_frames.py saves NASA's numbers for each set of frames (eic/<key>/<version>/num/<band>_<column>.bin, described by
   manifest "num"). This file reads the value at the pin from them. Order:
     1. the saved numbers (on this site, no limits),
     2. live from NASA's server, through this site's relay (the black window on the owner's computer, or the Cloudflare Worker online),
     3. otherwise the site keeps reading the picture's colours, and says so.
   Nothing is stored on the visitor's computer apart from the browser's normal cache. */
(function () {
  "use strict";
  var TILES = {}, LIVE = {}, LIVEOFF = 0;

  function ok(d) { var n = d && d.num; return !!(n && !n.failed && n.v === 1 && n.ver === d.version && n.times && n.times.length === (d.frames || []).length && n.grid && n.tile) }

  function cell(n, lat, lon) {
    var g = n.grid, ia = Math.round((lat - g.lat0) / g.dlat), ib = Math.round((lon - g.lon0) / g.dlon);
    ia = Math.max(0, Math.min(g.nlat - 1, ia)); ib = ((ib % g.nlon) + g.nlon) % g.nlon;
    return { ia: ia, ib: ib, lat: g.lat0 + ia * g.dlat, lon: g.lon0 + ib * g.dlon };
  }

  function timeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timed out")) }, ms) })]) }

  async function inflate(buf) {
    if (typeof DecompressionStream === "undefined") throw new Error("this browser cannot unpack the saved numbers");
    var s = new Blob([buf]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Response(s).arrayBuffer();
  }

  /* One saved piece: 10 x 10 degrees, every frame. Values are stored as the change from the previous value in the row. */
  function tile(n, r, c) {
    var k = n.dir + "/" + r + "_" + c;
    if (TILES[k]) return TILES[k];
    TILES[k] = timeout(fetch(n.dir + "/" + r + "_" + c + ".bin"), 15000).then(function (res) {
      if (!res.ok) throw new Error("saved numbers not found (" + res.status + ")");
      return res.arrayBuffer();
    }).then(inflate).then(function (ab) { return new Int16Array(ab) });
    TILES[k].catch(function () { delete TILES[k] });
    return TILES[k];
  }

  async function fromSaved(n, at) {
    var R = n.tile[0], C = n.tile[1], g = n.grid;
    var r = Math.min(n.bands - 1, Math.floor(at.ia / R)), c = Math.floor(at.ib / C);
    var a0 = r * R, a1 = r < n.bands - 1 ? a0 + R : g.nlat, rows = a1 - a0, nt = n.times.length;
    var d = await tile(n, r, c);
    if (d.length !== nt * rows * C) throw new Error("saved numbers have the wrong size");
    var out = [], row = at.ia - a0, col = at.ib - c * C;
    for (var f = 0; f < nt; f++) {
      var o = (f * rows + row) * C, v = 0;
      for (var k = 0; k <= col; k++) v = ((v + d[o + k] + 32768) % 65536 + 65536) % 65536 - 32768;
      out.push(v === -32768 ? null : n.enc === "log" ? Math.pow(10, v / n.q) : v / n.q); /* "log": stored as log10(value) x q */
    }
    return out;
  }

  function relay() {
    if (location.protocol === "file:") return null;
    var a = window.ASSISTANT_URL;
    if (a) return a.replace(/\/$/, "") + "/nasa?u=";
    return "api/nasa?u=";
  }

  /* Live: NASA's server answers one hour at a time quickly, but a run of hours at one place can take minutes,
     so each frame's hour is asked for separately (4 at a time, 20 seconds in all, so the page never waits long). Frames that do not arrive keep their colour reading. */
  async function liveOne(base, u) {
    if (!LIVE[u]) {
      LIVE[u] = timeout(fetch(base + encodeURIComponent(u)), 15000).then(function (res) {
        if (res.status === 429 || res.status === 503) LIVEOFF = Date.now() + 10 * 60000; // over the limit: stop asking for 10 minutes
        if (!res.ok) throw new Error("NASA's server could not be reached (" + res.status + ")");
        return res.text();
      }).then(function (txt) {
        var m = /^\[0\]\[0\],\s*([-+0-9.eE]+)\s*$/m.exec(txt), tm = /\ntime, \[1\]\n([0-9.]+)/.exec(txt);
        if (!m || !tm) throw new Error("NASA's server sent an unexpected answer");
        return { v: parseFloat(m[1]), t: parseFloat(tm[1]) };
      });
      LIVE[u].catch(function () { delete LIVE[u] });
    }
    return LIVE[u];
  }
  async function fromLive(n, at) {
    var L = n.live, base = relay();
    if (!L || !base || Date.now() < LIVEOFF) throw new Error("live NASA numbers are not available here");
    var t0 = Date.parse(L.t0), end = Date.now() + 20000, out = n.times.map(function () { return null }), next = 0, got = 0;
    async function worker() {
      while (next < n.times.length && Date.now() < end && Date.now() >= LIVEOFF) {
        var f = next++, want = Date.parse(n.times[f]) + L.shift * 60000, i = Math.round((want - t0) / 3600000);
        if (!(i >= 0)) continue;
        try {
          var r = await liveOne(base, n.src + ".ascii?" + n.var + "[" + i + ":" + i + "][" + at.ia + ":" + at.ia + "][" + at.ib + ":" + at.ib + "]");
          /* GrADS time in days: 2 = 1 Jan of year 1 at 00:00 (same as get_eic_frames.py _grads_time). Check it is the hour we asked for. */
          var ms = -62135596800000 + (r.t - 2) * 86400000;
          if (isFinite(r.v) && Math.abs(r.v) < 1e14 && Math.abs(ms - want) <= 120000) { out[f] = Math.round((r.v * L.mul + L.add) * n.q) / n.q; got++ }
        } catch (e) {}
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);
    if (!got) throw new Error("NASA's server did not answer in time");
    return out;
  }

  /* Colour-scale position (0-1) of a real value, the inverse of index.html galPhys. */
  function toT(d, v) {
    var s = d.scale || {}, t = null;
    if (s.type === "linear") t = (v - s.min) / (s.max - s.min);
    else if (s.type === "log10") t = v > 0 ? (Math.log(v) / Math.LN10 - s.min) / (s.max - s.min) : 0;
    else if (s.type === "pow") t = v > 0 ? Math.log(v / s.min) / Math.log(s.base) / s.steps : 0;
    else if (s.type === "ticks") {
      var k = s.ticks;
      if (v <= k[0][1]) t = 0; else if (v >= k[k.length - 1][1]) t = 1;
      else for (var i = 1; i < k.length; i++) if (v <= k[i][1]) { t = k[i - 1][0] + (v - k[i - 1][1]) / (k[i][1] - k[i - 1][1]) * (k[i][0] - k[i - 1][0]); break }
    }
    return t === null || !isFinite(t) ? null : Math.max(0, Math.min(1, t));
  }

  function fmt(n, v) {
    if (n.sig) { var t = v.toPrecision(n.sig); if (/e/.test(t)) t = v.toExponential(n.sig - 1); else if (t.indexOf(".") >= 0) t = t.replace(/\.?0+$/, ""); return t + " " + n.unit }
    var dp = n.dp === undefined ? 1 : n.dp, s = v.toFixed(dp);
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    return s + " " + n.unit;
  }

  /* Fill a series (one entry per frame, same order as d.frames) with NASA's numbers at the pin.
     Returns {src: "saved" | "live" | null, n: frames with a number, why}. Never throws. */
  async function apply(d, ser, lat, lon) {
    if (!ok(d)) return { src: null, n: 0, why: d && d.num && d.num.failed ? "not saved: " + d.num.failed : "no saved numbers" };
    var n = d.num, at = cell(n, lat, lon), vals = null, src = null, why = "";
    try { vals = await fromSaved(n, at); src = "saved" } catch (e) { why = e.message }
    if (!vals) { try { vals = await fromLive(n, at); src = "live" } catch (e) { why += "; " + e.message } }
    if (!vals || vals.length !== ser.length) return { src: null, n: 0, why: why || "no numbers" };
    var cnt = 0;
    ser.forEach(function (x, i) {
      var v = vals[i];
      if (v === null || v === undefined) return;
      var t = toT(d, v);
      if (t === null) return;
      x.nv = v; x.nsrc = src; x.t = t; x.v = t * 100; x.pv = fmt(n, v); cnt++;
    });
    return { src: src, n: cnt, total: ser.length, why: why, cell: at };
  }

  /* ---------- Range: the average over a circle around the pin ----------
     Every NASA grid cell whose centre lies within the circle counts, weighted by its area (cells on this latitude-longitude
     grid shrink with the cosine of latitude). A circle smaller than one cell uses the cell that contains the pin.
     Whole pieces of 8 x 8 cells come from the saved sums (blocks.bin) when they exist; cells at the circle's edge, or all
     cells when the sums are not saved, come from the saved pieces themselves. */
  var RAD = Math.PI / 180, ER = 6371.0088, DEC = {}, BLK = {};
  function rowSpans(g, lat, lon, km) {
    var d = km / ER, out = [], all = d >= Math.PI - 1e-9, p1 = lat * RAD, cd = Math.cos(d);
    for (var a = 0; a < g.nlat; a++) {
      var la = g.lat0 + a * g.dlat;
      if (all) { out.push([0, g.nlon]); continue }
      if (Math.abs(la - lat) * RAD > d + 1e-12) { out.push(null); continue }
      var p2 = la * RAD, den = Math.cos(p1) * Math.cos(p2), num = cd - Math.sin(p1) * Math.sin(p2);
      if (den < 1e-12) { out.push(Math.acos(Math.max(-1, Math.min(1, Math.sin(p1) * Math.sin(p2)))) <= d ? [0, g.nlon] : null); continue }
      var c = num / den;
      if (c > 1) { out.push(null); continue }
      if (c <= -1) { out.push([0, g.nlon]); continue }
      var dl = Math.acos(c) / RAD, i0 = Math.ceil((lon - dl - g.lon0) / g.dlon - 1e-9), i1 = Math.floor((lon + dl - g.lon0) / g.dlon + 1e-9), cnt = i1 - i0 + 1;
      if (cnt <= 0) { out.push(null); continue }
      if (cnt >= g.nlon) { out.push([0, g.nlon]); continue }
      out.push([((i0 % g.nlon) + g.nlon) % g.nlon, cnt]);
    }
    return out;
  }
  function inSpan(sp, ib, nlon) { if (!sp) return false; if (sp[1] >= nlon) return true; var k = ((ib - sp[0]) % nlon + nlon) % nlon; return k < sp[1] }
  async function tileVals(n, r, c) {
    var k = n.dir + "/" + r + "_" + c;
    if (DEC[k]) return DEC[k];
    DEC[k] = (async function () {
      var d = await tile(n, r, c), R = n.tile[0], C = n.tile[1], g = n.grid, a0 = r * R, a1 = r < n.bands - 1 ? a0 + R : g.nlat, rows = a1 - a0, nt = n.times.length;
      if (d.length !== nt * rows * C) throw new Error("saved numbers have the wrong size");
      var out = new Float32Array(d.length);
      for (var f = 0; f < nt; f++) for (var j = 0; j < rows; j++) {
        var o = (f * rows + j) * C, v = 0;
        for (var i = 0; i < C; i++) { v = ((v + d[o + i] + 32768) % 65536 + 65536) % 65536 - 32768; out[o + i] = v === -32768 ? NaN : n.enc === "log" ? Math.pow(10, v / n.q) : v / n.q }
      }
      return { v: out, rows: rows, a0: a0 };
    })();
    DEC[k].catch(function () { delete DEC[k] });
    return DEC[k];
  }
  async function blocks(n) {
    if (!n.blocks) return null;
    var k = n.dir + "/blocks";
    if (!BLK[k]) { BLK[k] = timeout(fetch(n.dir + "/blocks.bin"), 30000).then(function (r) { if (!r.ok) throw new Error("block sums not found"); return r.arrayBuffer() }).then(inflate).then(function (ab) { return new Float32Array(ab) }); BLK[k].catch(function () { delete BLK[k] }) }
    return BLK[k];
  }
  /* returns {vals: one value per frame, cells: number of NASA cells used, single: true when the circle is smaller than a cell} */
  async function area(n, lat, lon, km) {
    var g = n.grid, nt = n.times.length, sp = rowSpans(g, lat, lon, km), R = n.tile[0], C = n.tile[1], cells = 0;
    sp.forEach(function (s) { if (s) cells += Math.min(s[1], g.nlon) });
    if (!cells) { var at = cell(n, lat, lon); return { vals: await fromSaved(n, at), cells: 1, single: true, cell: at } }
    var sw = new Float64Array(nt), swv = new Float64Array(nt), B = n.blocks && n.blocks.B, bl = null, need = {}, full = {};
    if (B) {
      try { bl = await blocks(n) } catch (e) { bl = null }
      if (bl && bl.length !== nt * n.blocks.nbr * n.blocks.nbc * 2) bl = null;
    }
    if (bl) {
      for (var br = 0; br < n.blocks.nbr; br++) for (var bc = 0; bc < n.blocks.nbc; bc++) {
        var tot = 0, inc = 0;
        for (var a = br * B; a < Math.min(g.nlat, br * B + B); a++) for (var ib = bc * B; ib < Math.min(g.nlon, bc * B + B); ib++) { tot++; if (inSpan(sp[a], ib, g.nlon)) inc++ }
        if (!inc) continue;
        if (inc === tot) { full[br + "_" + bc] = 1; for (var f = 0; f < nt; f++) { var o = ((f * n.blocks.nbr + br) * n.blocks.nbc + bc) * 2; if (bl[o + 1] > 0) { swv[f] += bl[o]; sw[f] += bl[o + 1] } } }
      }
    }
    for (var a2 = 0; a2 < g.nlat; a2++) {
      if (!sp[a2]) continue;
      var s = sp[a2], len = Math.min(s[1], g.nlon);
      for (var q = 0; q < len; q++) { var ib2 = (s[0] + q) % g.nlon; if (bl && full[Math.floor(a2 / B) + "_" + Math.floor(ib2 / B)]) continue; var tr = Math.min(n.bands - 1, Math.floor(a2 / R)), tc = Math.floor(ib2 / C); (need[tr + "_" + tc] = need[tr + "_" + tc] || []).push(a2 * g.nlon + ib2) }
    }
    var keys = Object.keys(need);
    if (keys.length > 160) throw new Error("this range needs " + keys.length + " pieces of NASA's numbers; ranges this large become available once the saved area sums are built");
    var nx = 0;
    async function wk() {
      while (nx < keys.length) {
        var kk = keys[nx++], rc = kk.split("_"), tv = await tileVals(n, +rc[0], +rc[1]), c0 = (+rc[1]) * C;
        need[kk].forEach(function (id) {
          var a = Math.floor(id / g.nlon), ib = id % g.nlon, w = Math.cos((g.lat0 + a * g.dlat) * RAD), j = a - tv.a0, col = ib - c0;
          for (var f = 0; f < nt; f++) { var v = tv.v[(f * tv.rows + j) * C + col]; if (v === v) { sw[f] += w; swv[f] += w * v } }
        });
      }
    }
    await Promise.all([wk(), wk(), wk(), wk()]);
    var vals = [];
    for (var f2 = 0; f2 < nt; f2++) vals.push(sw[f2] > 0 ? swv[f2] / sw[f2] : null);
    return { vals: vals, cells: cells, single: false };
  }
  /* the value of every frame at the pin, or averaged over the range (km > 0); cached per place and range */
  var SER = {};
  function series(d, lat, lon, km) {
    if (!ok(d)) return Promise.reject(new Error(d && d.num && d.num.failed ? "not saved: " + d.num.failed : "no saved numbers"));
    var n = d.num, k = n.dir + "|" + lat.toFixed(3) + "," + lon.toFixed(3) + "|" + (km || 0);
    if (!SER[k]) {
      SER[k] = (km > 0 ? area(n, lat, lon, km) : fromSaved(n, cell(n, lat, lon)).then(function (v) { return { vals: v, cells: 1, single: true, cell: cell(n, lat, lon), pin: true } }));
      SER[k].catch(function () { delete SER[k] });
    }
    return SER[k];
  }
  /* same as apply(), averaged over a circle of km around the pin */
  async function applyArea(d, ser, lat, lon, km) {
    if (!ok(d)) return { src: null, n: 0, why: "no saved numbers" };
    var r; try { r = await series(d, lat, lon, km) } catch (e) { return { src: null, n: 0, why: e.message } }
    if (r.vals.length !== ser.length) return { src: null, n: 0, why: "frame count differs" };
    var n = d.num, cnt = 0;
    ser.forEach(function (x, i) { var v = r.vals[i]; if (v === null || v === undefined || !isFinite(v)) return; var t = toT(d, v); if (t === null) return; x.nv = v; x.nsrc = "saved"; x.t = t; x.v = t * 100; x.pv = fmt(n, v); cnt++ });
    return { src: "saved", n: cnt, total: ser.length, why: "", cell: r.cell || cell(n, lat, lon), area: { km: km, cells: r.cells, single: r.single } };
  }

  window.EJN = { ok: ok, apply: apply, applyArea: applyArea, series: series, toT: toT, cell: cell, fmt: fmt, rowSpans: rowSpans };
})();
