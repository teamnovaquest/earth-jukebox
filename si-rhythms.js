/* Earth Jukebox: SI Rhythms, "how the SI learns a place".
   For the place being compared, a small statistical model is trained in the visitor's browser on NASA POWER's monthly record (1981 to the
   last complete year) of air temperature and rain. It finds the place's own repeating cycles, tests each one against shuffled copies of the
   same data, fits trend + cycles + one month of memory by least squares, checks itself on the last five years it never saw, flags the months
   NASA measured far from what the model expected, compares the seasons of the first and second half of the record, and turns the cycles into
   harmony (continued fractions) and sound. Nothing here replaces or fills in NASA's numbers: every output is labelled as the model's view.
   Everything is deterministic (a fixed random seed per place), so the same place always gives the same result. */
(function () {
  if (window.EJSI) return;
  var POWER = "https://power.larc.nasa.gov/api/temporal/monthly/point", Y0 = 1981, TEST = 60, SHUF = 99, MAXC = 4, ALPHA = 0.05;
  var VARS = [{ k: "T2M", id: "t2m", name: "Air temperature", unit: "°C", dp: 2 }, { k: "PRECTOTCORR", id: "pr", name: "Rain", unit: "mm/day", dp: 2 }];
  var MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var CACHE = {}, LAST = null;
  function $(id) { return document.getElementById(id) }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  function fx(v, d) { return v == null || !isFinite(v) ? "–" : (+v).toFixed(d) }
  function say(t) { var s = $("cmpsist"); if (s) s.textContent = t }
  function tick() { return new Promise(function (r) { setTimeout(r, 0) }) }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

  /* ---------- data: NASA POWER monthly point record ---------- */
  async function record(lat, lon) {
    var y1 = new Date().getUTCFullYear() - 1, key = lat.toFixed(3) + "," + lon.toFixed(3) + "," + y1;
    if (CACHE[key]) return CACHE[key];
    var u = POWER + "?parameters=T2M,PRECTOTCORR&community=AG&longitude=" + lon.toFixed(4) + "&latitude=" + lat.toFixed(4) + "&start=" + Y0 + "&end=" + y1 + "&format=JSON";
    var r = await fetch(u, { signal: AbortSignal.timeout ? AbortSignal.timeout(40000) : undefined }); if (!r.ok) throw new Error("NASA POWER answered " + r.status);
    var p = (await r.json()).properties.parameter, out = { y1: y1, url: u };
    VARS.forEach(function (V) {
      var t = [], y = [], src = p[V.k] || {};
      Object.keys(src).sort().forEach(function (k) { var yy = +k.slice(0, 4), mm = +k.slice(4); if (mm < 1 || mm > 12) return; var v = src[k]; if (v == null || v <= -990 || !isFinite(v)) return; t.push((yy - Y0) * 12 + mm - 1); y.push(+v) });
      out[V.id] = { t: t, y: y };
    });
    return (CACHE[key] = out);
  }

  /* ---------- small linear algebra: least squares by the normal equations ---------- */
  function solve(A, b) {   /* Gaussian elimination with partial pivoting; A is p x p (array of rows), returns x or null */
    var n = b.length, M = A.map(function (r, i) { return r.slice().concat([b[i]]) });
    for (var c = 0; c < n; c++) {
      var piv = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) < 1e-12) return null; var tmp = M[c]; M[c] = M[piv]; M[piv] = tmp;
      for (r = 0; r < n; r++) if (r !== c) { var f = M[r][c] / M[c][c]; for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k] }
    }
    return M.map(function (r, i) { return r[n] / r[i] });
  }
  function design(t, P, tm) { var row = [1, (t - tm) / 120]; P.forEach(function (p) { var w = 2 * Math.PI * t / p; row.push(Math.cos(w), Math.sin(w)) }); return row }
  function fit(t, y, P) {   /* trend + one cosine/sine pair per cycle; returns coefficients, prediction function, residual variance and covariance */
    var tm = t.reduce(function (a, b) { return a + b }, 0) / t.length, p = 2 + 2 * P.length, XtX = [], Xty = [], i, j, k;
    for (i = 0; i < p; i++) { XtX.push(new Array(p).fill(0)); Xty.push(0) }
    for (k = 0; k < t.length; k++) { var x = design(t[k], P, tm); for (i = 0; i < p; i++) { Xty[i] += x[i] * y[k]; for (j = 0; j < p; j++) XtX[i][j] += x[i] * x[j] } }
    var b = solve(XtX, Xty); if (!b) return null;
    var pred = function (tt) { var x = design(tt, P, tm), s = 0; for (var q = 0; q < p; q++) s += x[q] * b[q]; return s };
    var sse = 0; for (k = 0; k < t.length; k++) { var e = y[k] - pred(t[k]); sse += e * e }
    var s2 = sse / Math.max(1, t.length - p), cov = [];
    for (i = 0; i < p; i++) { var e_ = new Array(p).fill(0); e_[i] = 1; cov.push(solve(XtX, e_) || e_) }   /* (X'X)^-1, column by column */
    return { b: b, pred: pred, sse: sse, s2: s2, cov: function (a, c) { return s2 * cov[c][a] }, tm: tm };
  }

  /* ---------- periodogram (least-squares spectrum) with precomputed trig tables ---------- */
  function grid(t, n) {
    var fmin = 3 / (t[t.length - 1] - t[0] + 1), fmax = 1 / 2.5, df = 1 / (4 * (t[t.length - 1] - t[0] + 1)), F = [];
    for (var f = fmin; f <= fmax; f += df) F.push(f);
    var nf = F.length, C = new Float32Array(nf * n), S = new Float32Array(nf * n), CC = new Float64Array(nf), SS = new Float64Array(nf), CS = new Float64Array(nf);
    for (var i = 0; i < nf; i++) { var w = 2 * Math.PI * F[i], cc = 0, ss = 0, cs = 0; for (var k = 0; k < n; k++) { var c = Math.cos(w * t[k]), s = Math.sin(w * t[k]); C[i * n + k] = c; S[i * n + k] = s; cc += c * c; ss += s * s; cs += c * s } CC[i] = cc; SS[i] = ss; CS[i] = cs }
    return { F: F, nf: nf, n: n, C: C, S: S, CC: CC, SS: SS, CS: CS };
  }
  function spectrum(G, y, out) {   /* fraction of the variance of y explained by the best sine wave at each frequency */
    var n = G.n, yy = 0, k; for (k = 0; k < n; k++) yy += y[k] * y[k]; if (!(yy > 0)) yy = 1;
    for (var i = 0; i < G.nf; i++) { var c = 0, s = 0, o = i * n; for (k = 0; k < n; k++) { c += y[k] * G.C[o + k]; s += y[k] * G.S[o + k] }
      var det = G.CC[i] * G.SS[i] - G.CS[i] * G.CS[i]; out[i] = det > 1e-9 ? ((G.SS[i] * c - G.CS[i] * s) * c + (G.CC[i] * s - G.CS[i] * c) * s) / det / yy : 0 }
    return out;
  }

  /* ---------- learn one variable ---------- */
  async function learnVar(V, D, seed) {
    var t = D.t, y = D.y, N = t.length; if (N < 180) return { name: V.name, unit: V.unit, err: "too few months in NASA POWER's record here (" + N + ")" };
    var nT = N - TEST, tT = t.slice(0, nT), yT = y.slice(0, nT), G = grid(tT, nT), pow = new Float64Array(G.nf), shuf = new Float64Array(G.nf), rand = rng(seed), P = [], steps = [], first = null;
    var resid = function () { var m = fit(tT, yT, P); return yT.map(function (v, k) { return v - m.pred(tT[k]) }) };
    for (var step = 0; step < MAXC; step++) {
      var r = resid(); spectrum(G, r, pow); if (!first) first = Array.prototype.slice.call(pow);
      var bi = 0; for (var i = 1; i < G.nf; i++) if (pow[i] > pow[bi]) bi = i;
      var per = 1 / G.F[bi], peak = pow[bi], ge = 0, maxes = [], rr = r.slice();
      for (var s = 0; s < SHUF; s++) {   /* permutation test: the same values in a random order have no rhythm left */
        for (var k = rr.length - 1; k > 0; k--) { var j = Math.floor(rand() * (k + 1)), tmp = rr[k]; rr[k] = rr[j]; rr[j] = tmp }
        spectrum(G, rr, shuf); var mx = 0; for (i = 0; i < G.nf; i++) if (shuf[i] > mx) mx = shuf[i]; maxes.push(mx); if (mx >= peak) ge++;
        if (s % 10 === 9) await tick();
      }
      maxes.sort(function (a, b) { return a - b }); var pval = (1 + ge) / (1 + SHUF), thr = maxes[Math.floor(0.95 * SHUF)];
      steps.push({ P: per, power: peak, p: pval, thr: thr });
      if (pval > ALPHA || P.some(function (q) { return Math.abs(q - per) / q < 0.03 })) break;
      P.push(per);
    }
    var M = fit(tT, yT, P); if (!M) return { name: V.name, unit: V.unit, err: "the model could not be fitted" };
    /* honest test on the last five years the model never saw, against the usual baseline: the average of each calendar month in training */
    var clim = new Array(12).fill(0), cn = new Array(12).fill(0); tT.forEach(function (tt, k) { clim[tt % 12] += yT[k]; cn[tt % 12]++ }); clim = clim.map(function (v, m) { return cn[m] ? v / cn[m] : 0 });
    var tH = t.slice(nT), yH = y.slice(nT), seM = 0, seC = 0, mH = yH.reduce(function (a, b) { return a + b }, 0) / yH.length, sst = 0;
    tH.forEach(function (tt, k) { var e = yH[k] - M.pred(tt), c = yH[k] - clim[tt % 12]; seM += e * e; seC += c * c; sst += (yH[k] - mH) * (yH[k] - mH) });
    var mT = yT.reduce(function (a, b) { return a + b }, 0) / nT, sstT = yT.reduce(function (a, v) { return a + (v - mT) * (v - mT) }, 0), varT = sstT / nT;
    /* the final model uses every month (the same cycles), for anomalies, memory and the cycles' sizes */
    var F = fit(t, y, P), res = y.map(function (v, k) { return v - F.pred(t[k]) }), sd = Math.sqrt(res.reduce(function (a, e) { return a + e * e }, 0) / Math.max(1, N - 2 - 2 * P.length));
    var num = 0, den = 0; for (var k2 = 1; k2 < N; k2++) if (t[k2] - t[k2 - 1] === 1) { num += res[k2] * res[k2 - 1]; den += res[k2 - 1] * res[k2 - 1] }
    var phi = den > 0 ? num / den : 0, vAll = (function () { var m = y.reduce(function (a, b) { return a + b }, 0) / N; return y.reduce(function (a, v) { return a + (v - m) * (v - m) }, 0) / N })();
    var cycles = P.map(function (per, q) { var a = F.b[2 + 2 * q], b = F.b[3 + 2 * q], A = Math.hypot(a, b), ph = Math.atan2(b, a), tp = ((ph / (2 * Math.PI) * per) % per + per) % per;
      return Object.assign({ P: per, A: A, share: A * A / 2 / vAll, p: steps[q].p, peakIn: per > 10 && per < 14 ? MON[Math.round(tp) % 12] : null }, harmony(per)) });
    var an = []; res.forEach(function (e, k) { var z = e / sd; if (Math.abs(z) >= 2) an.push({ t: t[k], y: Y0 + Math.floor(t[k] / 12), m: t[k] % 12, v: y[k], exp: F.pred(t[k]), z: z }) });
    var anomTop = an.slice().sort(function (a, b) { return Math.abs(b.z) - Math.abs(a.z) }).slice(0, 8);
    return { id: V.id, name: V.name, unit: V.unit, dp: V.dp, N: N, nTrain: nT, nTest: TEST, from: Y0, to: Y0 + Math.floor(t[N - 1] / 12), trainTo: Y0 + Math.floor(tT[nT - 1] / 12),
      cycles: cycles, steps: steps, trend: F.b[1], trendSE: Math.sqrt(F.cov(1, 1)), phi: phi, sd: sd, r2train: 1 - M.sse / sstT, r2test: sst > 0 ? 1 - seM / sst : null, skill: seC > 0 ? 1 - seM / seC : null,
      rmseTest: Math.sqrt(seM / tH.length), rmseClim: Math.sqrt(seC / tH.length), knobs: 2 + 2 * P.length + 1, anomalies: anomTop, anomRate: an.length / N, nAnom: an.length,
      season: seasons(t, y, P), pg: { P: G.F.map(function (f) { return 1 / f }), pow: first, thr: steps.length ? steps[0].thr : null }, series: { t: t, y: y, fit: t.map(function (tt) { return F.pred(tt) }), split: tT[nT - 1] } };
  }

  /* ---------- have the seasons changed? first half against second half of the record ---------- */
  function seasons(t, y, P) {
    var hasYear = P.some(function (p) { return p > 10 && p < 14 }); if (!hasYear) return null;
    var Q = P.filter(function (p) { return p < 14 }), h = Math.floor(t.length / 2), out = [];
    [[0, h], [h, t.length]].forEach(function (rg) {
      var tt = t.slice(rg[0], rg[1]), yy = y.slice(rg[0], rg[1]), m = fit(tt, yy, Q); if (!m) return;
      var q = Q.findIndex(function (p) { return p > 10 && p < 14 }), a = m.b[2 + 2 * q], b = m.b[3 + 2 * q], A = Math.hypot(a, b), va = m.cov(2 + 2 * q, 2 + 2 * q), vb = m.cov(3 + 2 * q, 3 + 2 * q);
      var ph = Math.atan2(b, a), tp = ((ph / (2 * Math.PI) * Q[q]) % Q[q] + Q[q]) % Q[q];
      out.push({ from: Y0 + Math.floor(tt[0] / 12), to: Y0 + Math.floor(tt[tt.length - 1] / 12), A: A, se: Math.sqrt((a * a * va + b * b * vb) / Math.max(1e-12, A * A)), peak: MON[Math.round(tp) % 12] });
    });
    if (out.length < 2) return null;
    var d = out[1].A - out[0].A, se = Math.hypot(out[0].se, out[1].se);
    return { a: out[0], b: out[1], d: d, se: se, sig: Math.abs(d) > 2 * se };
  }

  /* ---------- rhythm to harmony: the cycle's frequency relative to the year, as the simplest nearby fraction (continued fractions) ---------- */
  var NAMES = { "1/1": "unison", "2/1": "octave", "3/2": "perfect fifth", "4/3": "perfect fourth", "5/4": "major third", "6/5": "minor third", "5/3": "major sixth", "8/5": "minor sixth", "9/8": "major second", "16/15": "minor second", "15/8": "major seventh", "7/4": "harmonic seventh", "7/6": "septimal minor third", "9/5": "minor seventh", "7/5": "septimal tritone" };
  function frac(x, qmax) {   /* the closest fraction p/q to x with q <= qmax. By a classical theorem it is always a convergent or semiconvergent of x's
                               continued fraction; with q <= 8 there are so few candidates that checking them all is simplest. Ties go to the smaller q. */
    var best = [Math.round(x), 1], be = Math.abs(x - best[0]);
    for (var q = 1; q <= qmax; q++) { var pp = Math.round(x * q), e = Math.abs(x - pp / q); if (e < be - 1e-12) { best = [pp, q]; be = e } }
    var g = function (a, b) { return b ? g(b, a % b) : a }, d = g(best[0], best[1]); return [best[0] / d, best[1] / d];
  }
  function cf(x, k) { var a = []; for (var i = 0; i < k; i++) { var f = Math.floor(x); a.push(f); if (Math.abs(x - f) < 1e-9) break; x = 1 / (x - f) } return a }   /* continued-fraction terms, shown in the report */
  function harmony(per) {
    var rel = 12 / per, oct = Math.floor(Math.log2(rel)), red = rel / Math.pow(2, oct), pq = frac(red, 8);
    if (pq[0] === 2 * pq[1]) { pq = [1, 1]; oct += 1 }
    var key = pq[0] + "/" + pq[1], f = 196 * Math.pow(2, oct) * pq[0] / pq[1];
    while (f < 55) f *= 2; while (f > 1760) f /= 2;   /* whole octaves keep the interval exact while staying audible */
    var nm = NAMES[key] || (pq[0] + ":" + pq[1] + " ratio"), where = oct ? Math.abs(oct) + " octave" + (Math.abs(oct) > 1 ? "s" : "") + (oct > 0 ? " above" : " below") + " the yearly note" : "";
    nm = key === "1/1" ? (oct ? where.charAt(0).toUpperCase() + where.slice(1) : "The yearly note itself (the tonic)") : nm + (where ? ", " + where : " above the yearly note");
    return { ratio: key, cf: cf(red, 5), interval: nm, octave: oct, freq: f, tenney: Math.log2(pq[0] * pq[1]) };
  }

  /* ---------- train on one point (shared by Compare and SI listening; the same point gives the same result) ---------- */
  var TRAINED = {};
  function train(lat, lon, P, talk, muted) {   /* muted: learn the "Mute humans" simulation of the record (mutehumans.js), for SI listening while humans are muted */
    var key = lat.toFixed(3) + "," + lon.toFixed(3) + (muted ? "|m" : "");
    if (TRAINED[key]) return TRAINED[key].then(function (o) { return Object.assign({}, o, { place: P }) });
    var job = (async function () {
      if (talk) talk("Reading NASA POWER's monthly record for " + P.name + "…");
      var rec = await record(lat, lon);
      if (muted && window.EJMH) { var T = rec.t2m; rec = Object.assign({}, rec, { t2m: { t: T.t, y: T.y.map(function (v, i) { var tm = T.t[i]; return v - EJMH.W(lat, lon, Date.UTC(Y0 + Math.floor(tm / 12), tm % 12, 15)) }) } }) }
      var seed = Math.round((lat + 90) * 1000) * 7919 + Math.round((lon + 180) * 1000), out = { key: key, place: P, lat: lat, lon: lon, at: new Date().toISOString(), url: rec.url, vars: [] };
      for (var i = 0; i < VARS.length; i++) { if (talk) talk("The SI is learning " + P.name + "'s " + VARS[i].name.toLowerCase() + " (" + (i + 1) + " of " + VARS.length + ")…"); out.vars.push(await learnVar(VARS[i], rec[VARS[i].id], seed + i)) }
      return out;
    })();
    TRAINED[key] = job; job.catch(function () { delete TRAINED[key] });
    return job;
  }

  /* ---------- run for the compared place ---------- */
  async function learn(opt) {
    opt = opt || {};
    var X = window.CMPX, D = X && X.C && (X.C.data || X.C), P = D && (D.place || (X.C && X.C.place)); if (!P) { say("Set up a comparison first, so the SI knows the place."); return null }
    var lat = +P.lat, lon = +P.lon, key = lat.toFixed(3) + "," + lon.toFixed(3);
    if (LAST && LAST.key === key) { if (!opt.quiet) render(LAST); return LAST }
    try {
      var out = await train(lat, lon, P, opt.quiet ? null : say);
      LAST = out; var D2 = X.C && (X.C.data || X.C), P2 = D2 && (D2.place || X.C.place); if (!opt.quiet && P2 && (+P2.lat).toFixed(3) + "," + (+P2.lon).toFixed(3) !== key) return out;   /* the place changed while the SI was learning: the newer place's run shows its own results */
      if (!opt.quiet) { render(out); say("The SI has learned " + P.name + "'s rhythms from " + out.vars[0].N + " months of NASA data.") }
      return out;
    } catch (e) { if (!opt.quiet) say("NASA POWER could not be reached (" + (e.message || e) + "), so the SI could not learn this place now. It tries again each time the comparison is set up."); return null }
  }

  /* ---------- words ---------- */
  function per(p) { return p >= 18 ? (p / 12).toFixed(1) + " years" : p.toFixed(1) + " months" }
  function pct(v) { return v == null ? "–" : (v * 100).toFixed(0) + "%" }
  function varText(V) {
    if (V.err) return V.name + ": " + V.err + ".";
    var c = V.cycles, s = V.name + ": ";
    s += c.length ? "the SI found " + c.length + " real cycle" + (c.length > 1 ? "s" : "") + " (" + c.map(function (x) { return per(x.P) + ", " + pct(x.share) + " of the variation" }).join("; ") + ")" : "the SI found no cycle that stands out from chance";
    s += ". Tested on " + (V.trainTo + 1) + "–" + V.to + ", which it never saw, it explains " + pct(Math.max(0, V.r2test)) + " of the month-to-month pattern";
    s += V.skill != null ? (V.skill >= 0 ? " and is " + pct(V.skill) + " closer to NASA's values than the usual average-of-each-month forecast." : ", but it is not better than the usual average-of-each-month forecast here, so its cycles should be read with care.") : ".";
    if (V.season) s += " Seasonal swing: " + fx(V.season.a.A * 2, V.dp) + " " + V.unit + " in " + V.season.a.from + "–" + V.season.a.to + " and " + fx(V.season.b.A * 2, V.dp) + " " + V.unit + " in " + V.season.b.from + "–" + V.season.b.to + (V.season.sig ? " (a clear change in NASA POWER's record; part of it can come from changes in the satellite and weather data fed into NASA's model rather than the climate, so it is worth checking against the in-depth research)." : " (no clear change).");
    if (V.anomalies.length) { var a = V.anomalies[0]; s += " Most unexpected month: " + MON[a.m] + " " + a.y + ", when NASA measured " + fx(a.v, V.dp) + " " + V.unit + " against " + fx(a.exp, V.dp) + " expected." }
    return s;
  }
  function summary(R) { return R.vars.map(varText).join(" ") }

  /* ---------- charts ---------- */
  function chartPG(V, W, H, dark) {
    var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"), s = W / 900, FG = dark ? "#e6edf3" : "#1f2328", MU = dark ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.2)";
    x.fillStyle = dark ? "#0d1117" : "#fff"; x.fillRect(0, 0, W, H); if (V.err || !V.pg.pow) return c;
    var L = 56 * s, R = 14 * s, T = 26 * s, B = 40 * s, w = W - L - R, h = H - T - B, P = V.pg.P, pw = V.pg.pow, pmin = Math.log(2.5), pmax = Math.log(P[0]), ymax = Math.max.apply(null, pw) * 1.08 || 1;
    var X = function (p) { return L + (pmax - Math.log(p)) / (pmax - pmin) * w }, Y = function (v) { return T + h - v / ymax * h };
    x.font = (12 * s) + "px sans-serif"; x.fillStyle = FG; x.fillText(V.name + ": strength of each cycle length (share of variation explained)", L, 16 * s);
    x.strokeStyle = MU; x.lineWidth = 1; x.beginPath(); x.moveTo(L, T + h); x.lineTo(L + w, T + h); x.stroke();
    [3, 6, 12, 24, 48, 96, 180].forEach(function (p) { if (Math.log(p) > pmax) return; var xx = X(p); x.fillStyle = FG; x.textAlign = "center"; x.fillText(p >= 24 ? (p / 12) + " yr" : p + " mo", xx, T + h + 16 * s); x.strokeStyle = MU; x.beginPath(); x.moveTo(xx, T + h); x.lineTo(xx, T + h + 4 * s); x.stroke() });
    x.textAlign = "right"; x.fillText((ymax * 100).toFixed(0) + "%", L - 6 * s, T + 8 * s); x.fillText("0%", L - 6 * s, T + h);
    if (V.pg.thr != null) { x.setLineDash([6 * s, 5 * s]); x.strokeStyle = "#d7263d"; x.beginPath(); x.moveTo(L, Y(V.pg.thr)); x.lineTo(L + w, Y(V.pg.thr)); x.stroke(); x.setLineDash([]); x.textAlign = "left"; x.fillStyle = "#d7263d"; x.fillText("chance level (95%)", L + 6 * s, Y(V.pg.thr) - 5 * s) }
    x.strokeStyle = "#2c7fb8"; x.lineWidth = 1.6 * s; x.beginPath(); P.forEach(function (p, i) { i ? x.lineTo(X(p), Y(pw[i])) : x.moveTo(X(p), Y(pw[i])) }); x.stroke();
    V.cycles.forEach(function (cy, i) { var xx = X(cy.P); x.fillStyle = "#e0a43a"; x.beginPath(); x.arc(xx, T + 10 * s + i * 14 * s, 4 * s, 0, 7); x.fill(); x.fillStyle = FG; x.textAlign = "left"; x.fillText(per(cy.P), xx + 7 * s, T + 14 * s + i * 14 * s) });
    x.textAlign = "center"; x.fillStyle = FG; x.fillText("cycle length (longer to the left)", L + w / 2, H - 6 * s);
    return c;
  }
  function chartFit(V, W, H, dark) {
    var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"), s = W / 900, FG = dark ? "#e6edf3" : "#1f2328", MU = dark ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.2)";
    x.fillStyle = dark ? "#0d1117" : "#fff"; x.fillRect(0, 0, W, H); if (V.err) return c;
    var S = V.series, n = S.t.length, L = 56 * s, R = 14 * s, T = 26 * s, B = 34 * s, w = W - L - R, h = H - T - B, t0 = S.t[0], t1 = S.t[n - 1];
    var all = S.y.concat(S.fit), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * .06 || 1; lo -= pad; hi += pad;
    var X = function (t) { return L + (t - t0) / (t1 - t0) * w }, Y = function (v) { return T + h - (v - lo) / (hi - lo) * h };
    x.fillStyle = dark ? "rgba(224,164,58,.12)" : "rgba(224,164,58,.15)"; x.fillRect(X(S.split + .5), T, L + w - X(S.split + .5), h);
    x.font = (12 * s) + "px sans-serif"; x.fillStyle = FG; x.textAlign = "left"; x.fillText(V.name + " (" + V.unit + "): NASA POWER (grey) and the SI's model (blue); shaded: years it never saw", L, 16 * s);
    x.textAlign = "right"; x.fillText(fx(hi, 1), L - 6 * s, T + 8 * s); x.fillText(fx(lo, 1), L - 6 * s, T + h);
    x.textAlign = "center"; for (var yy = Y0; yy <= V.to; yy += 5) x.fillText(String(yy), X((yy - Y0) * 12), T + h + 16 * s);
    x.strokeStyle = MU; x.beginPath(); x.moveTo(L, T + h); x.lineTo(L + w, T + h); x.stroke();
    x.strokeStyle = dark ? "rgba(230,237,243,.55)" : "rgba(60,60,60,.55)"; x.lineWidth = 1 * s; x.beginPath(); S.t.forEach(function (t, i) { i ? x.lineTo(X(t), Y(S.y[i])) : x.moveTo(X(t), Y(S.y[i])) }); x.stroke();
    x.strokeStyle = "#2c7fb8"; x.lineWidth = 1.4 * s; x.beginPath(); S.t.forEach(function (t, i) { i ? x.lineTo(X(t), Y(S.fit[i])) : x.moveTo(X(t), Y(S.fit[i])) }); x.stroke();
    V.anomalies.forEach(function (a) { x.fillStyle = a.z > 0 ? "#d7263d" : "#4fb3d9"; x.beginPath(); x.arc(X(a.t), Y(a.v), 3.6 * s, 0, 7); x.fill() });
    return c;
  }

  /* ---------- on screen ---------- */
  function table(V) {
    if (V.err || !V.cycles.length) return "";
    return '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>Cycle</th><th>Share of variation</th><th>Chance it is luck</th><th>Heard as</th></tr></thead><tbody>' +
      V.cycles.map(function (c) { return "<tr><td>" + esc(per(c.P)) + (c.peakIn ? " (peaks in " + c.peakIn + ")" : "") + '</td><td class="n">' + pct(c.share) + '</td><td class="n">' + (c.p <= 0.01 ? "1% or less" : pct(c.p)) + "</td><td>" + esc(c.interval) + " (" + esc(c.ratio) + ")</td></tr>" }).join("") + "</tbody></table></div>";
  }
  function anomTable(V) {
    if (V.err || !V.anomalies.length) return "";
    return '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>Month</th><th>NASA measured</th><th>The SI expected</th><th>How unusual</th></tr></thead><tbody>' +
      V.anomalies.slice(0, 5).map(function (a) { return "<tr><td>" + MON[a.m] + " " + a.y + '</td><td class="n">' + fx(a.v, V.dp) + " " + esc(V.unit) + '</td><td class="n">' + fx(a.exp, V.dp) + " " + esc(V.unit) + '</td><td class="n">' + (a.z > 0 ? "+" : "") + fx(a.z, 1) + " σ</td></tr>" }).join("") + "</tbody></table></div>";
  }
  function how(V) {
    if (V.err) return "";
    return "<li>" + esc(V.name) + ": trained on " + V.nTrain + " months (" + V.from + "–" + V.trainTo + "), tested on the " + V.nTest + " months after that; " + V.knobs + " numbers learned (trend, " + V.cycles.length + " cycle" + (V.cycles.length === 1 ? "" : "s") + " and one month of memory, " + fx(V.phi, 2) + "); explains " + pct(V.r2train) + " of the training months and " + pct(Math.max(0, V.r2test)) + " of the test months; " + V.nAnom + " unusual months (" + pct(V.anomRate) + ", about 5% would be expected by chance).</li>";
  }
  function render(R) {
    var box = $("cmpsibox"); if (!box) return;
    box.innerHTML = '<p>' + esc(summary(R)) + '</p>' + R.vars.map(function (V, i) { return '<h4 style="margin:14px 0 6px">' + esc(V.name) + '</h4><div id="cmpsipg' + i + '" style="max-width:720px"></div><div id="cmpsifit' + i + '" style="max-width:720px;margin-top:8px"></div>' + table(V) + anomTable(V) }).join("") +
      '<details style="margin-top:10px"><summary>How the SI learned this place</summary><ul class="cmpnote">' + R.vars.map(how).join("") + '<li>Cycles are kept only if they beat 99 shuffled copies of the same data (a 5% chance level). Nothing the model produces replaces NASA\'s numbers; it only describes them.</li></ul></details>' +
      '<button type="button" id="cmpsiplay">Hear the rhythms</button>';
    R.vars.forEach(function (V, i) { if (V.err) return; [[chartPG(V, 900, 300, true), "cmpsipg" + i, "Strength of each cycle length in " + V.name], [chartFit(V, 900, 280, true), "cmpsifit" + i, V.name + ": NASA's record and the SI's model"]].forEach(function (z) { z[0].style.width = "100%"; z[0].style.borderRadius = "6px"; z[0].setAttribute("role", "img"); z[0].setAttribute("aria-label", z[2]); var el = $(z[1]); if (el) el.appendChild(z[0]) }) });
  }

  /* ---------- sound: "Hear the rhythms" ----------
     The SI's learned model is played as a short piece in G major, every note from one scale, so it always sounds in tune:
     - melody: the model's temperature curve (trend + learned cycles), sampled four times a year and placed on the G major pentatonic scale;
       the yearly cycle becomes a rising and falling phrase each year, slower cycles lift or lower the whole phrase;
     - loudness and brightness of each note: the model's rain at that moment (wetter seasons ring fuller);
     - chords: the slow cycles (longer than 14 months) and the trend choose among four chords of G major (G, Em, C, D) every two years;
     - bells: the months NASA measured far from what the SI expected (2 sigma or more) ring a bell on a high scale note (warmer or wetter: higher).
     It opens with the SI's cycles as intervals: the yearly note (G), then each other cycle's interval above it (from the continued-fraction
     ratios in the table), one after another. The whole record then plays in about 30 seconds. */
  var AC = null, NOW = null;
  var PENT = [0, 2, 4, 7, 9], ROOT = 55;   /* G3 */
  function mhz(m) { return 440 * Math.pow(2, (m - 69) / 12) }
  function onScale(i) { var o = Math.floor(i / 5), k = ((i % 5) + 5) % 5; return ROOT + 12 * o + PENT[k] }
  function stopPlay() { if (NOW) { try { NOW.out.gain.cancelScheduledValues(AC.currentTime); NOW.out.gain.setTargetAtTime(0, AC.currentTime, .08); var o = NOW.out; setTimeout(function () { try { o.disconnect() } catch (e) { } }, 600) } catch (e) { } NOW = null } }
  function play(R, opt) {   /* opt.ctx: an OfflineAudioContext to render into (the audio report); then it returns the length in seconds */
    var OFF = opt && opt.ctx; R = R || LAST || LIS.R; if (!R || (!OFF && window.MUTE)) return false;
    if (!OFF) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return false } if (AC.state === "suspended") AC.resume() }
    var V = R.vars[0].err ? R.vars[1] : R.vars[0], W = R.vars[1] && !R.vars[1].err && V !== R.vars[1] ? R.vars[1] : null; if (!V || V.err) return false;
    var AC0 = AC; if (OFF) AC = OFF; else stopPlay();
    try {
    var S = V.series, n = S.t.length, t0m = S.t[0], span = S.t[n - 1] - t0m + 1, QS = 3, nq = Math.floor(span / QS), DQ = Math.min(.2, 30 / nq), tI = AC.currentTime + .2, t0 = tI + .5 * (1 + V.cycles.length) + .5;
    /* output: gentle compressor and a soft echo */
    var out = AC.createGain(); out.gain.value = .8; var comp = AC.createDynamicsCompressor(); out.connect(comp); comp.connect((opt && opt.dest) || AC.destination);
    var dl = AC.createDelay(1), fb = AC.createGain(), wet = AC.createGain(), lp = AC.createBiquadFilter(); dl.delayTime.value = DQ * 3; fb.gain.value = .28; wet.gain.value = .22; lp.type = "lowpass"; lp.frequency.value = 2400;
    out.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(comp);
    if (!OFF) NOW = { out: out };
    var fitAt = function (X, tm) { var k = Math.max(0, Math.min(X.series.t.length - 1, tm - X.series.t[0])); return X.series.t[k] === tm ? X.series.fit[k] : X.series.fit[Math.max(0, Math.min(X.series.fit.length - 1, k))] };
    var lo = Math.min.apply(null, S.fit), hi = Math.max.apply(null, S.fit), rng_ = hi - lo || 1;
    var rlo = W ? Math.min.apply(null, W.series.fit) : 0, rhi = W ? Math.max.apply(null, W.series.fit) : 1;
    /* slow part of the model for the chords: the model's mean over each two-year block (24 months average out the 12-, 6- and 4-month cycles exactly),
       ranked from coolest to warmest block: Em, C, D, G */
    var blocks = []; for (var bq = 0; bq < nq; bq += 8) { var sm = 0, cnt = 0; for (var mm = 0; mm < 24; mm++) { var tt_ = t0m + bq * QS + mm; if (tt_ <= S.t[n - 1]) { sm += fitAt(V, tt_); cnt++ } } blocks.push(cnt ? sm / cnt : 0) }
    var sorted = blocks.slice().sort(function (a, b) { return a - b }), rankOf = function (v) { var r = sorted.indexOf(v) / Math.max(1, sorted.length - 1); return r < .25 ? 1 : r < .5 ? 2 : r < .75 ? 3 : 0 };
    var pluck = function (m, t, vol, bright) { var o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), g2 = AC.createGain(), f = AC.createBiquadFilter(); o.type = "triangle"; o2.type = "sine"; o.frequency.value = mhz(m); o2.frequency.value = mhz(m) * 2; g2.gain.value = .25 * bright; f.type = "lowpass"; f.frequency.value = 1200 + 2600 * bright;
      o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + DQ * 3.2); o.start(t); o2.start(t); o.stop(t + DQ * 3.4); o2.stop(t + DQ * 3.4) };
    var pluckHz = function (f, t) { while (f < 196) f *= 2; while (f >= 392) f /= 2; var o = AC.createOscillator(), g = AC.createGain(), lpf = AC.createBiquadFilter(); o.type = "triangle"; o.frequency.value = f; lpf.type = "lowpass"; lpf.frequency.value = 2200; o.connect(lpf); lpf.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + 1.1); o.start(t); o.stop(t + 1.2) };
    /* introduction: the yearly note, then each learned cycle as its interval above it */
    pluckHz(196, tI); V.cycles.forEach(function (c, i) { pluckHz(c.freq, tI + .5 * (i + 1)) });
    var pad = function (notes, t, d) { notes.forEach(function (m) { var o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = mhz(m); o.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + d * .3); g.gain.linearRampToValueAtTime(.035, t + d * .8); g.gain.linearRampToValueAtTime(0, t + d * 1.05); o.start(t); o.stop(t + d * 1.1) }) };
    var bell = function (m, t, vol) { [[1, 1], [2.76, .35], [5.4, .12]].forEach(function (pr) { var o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = mhz(m) * pr[0]; o.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * pr[1], t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + 1.6 / pr[0] + .3); o.start(t); o.stop(t + 2.2) }) };
    var CH = [[43, 55, 59, 62], [40, 52, 55, 59], [36, 52, 55, 60], [38, 50, 54, 57]];   /* G, Em, C, D (with a low root) */
    var last = null;
    for (var q = 0; q < nq; q++) {
      var tm = t0m + q * QS + 1, t = t0 + q * DQ, v = fitAt(V, tm), lvl = (v - lo) / rng_;               /* 0..1 within the model's range */
      var idx = Math.round(lvl * 9) + 3;                                                                   /* about two octaves of the scale */
      if (last != null && Math.abs(idx - last) > 4) idx = last + Math.sign(idx - last) * 4;             /* no big leaps: a singable line */
      last = idx; var wet01 = W ? Math.max(0, Math.min(1, (fitAt(W, tm) - rlo) / ((rhi - rlo) || 1))) : .5;
      pluck(onScale(idx), t, .09 + .07 * wet01, wet01);
      if (q % 8 === 0) {   /* every two years: a chord from the slow cycles and the trend */
        pad(CH[rankOf(blocks[q / 8])], t, DQ * 8);
      }
    }
    /* bells for the months that surprised the SI */
    [V, W].forEach(function (X, xi) { if (!X || X.err) return; X.anomalies.forEach(function (a) { var q = Math.round((a.t - t0m - 1) / QS); if (q < 0 || q >= nq) return; var k = Math.max(-2, Math.min(2, Math.round(a.z))); bell(onScale(10 + (xi ? 2 : 0) + k), t0 + q * DQ, xi ? .05 : .07) }) });
    var secs = Math.round(t0 - tI + nq * DQ);
    if (OFF) return t0 - tI + nq * DQ + 2.5;
    say("Playing " + R.place.name + "'s rhythms as the SI learned them, " + V.from + " to " + V.to + " in " + secs + " seconds, in G major. First you hear the yearly note and then each cycle the SI found as a musical interval above it. Then the melody follows the SI's temperature model (each year rises and falls with the seasons), fuller notes mean a wetter season in its rain model, the chords follow the slow cycles, and bells ring for the months NASA measured far from what the SI expected.");
    setTimeout(function () { if (NOW && NOW.out === out) NOW = null }, (secs + 4) * 1000);
    return true;
    } finally { if (OFF) AC = AC0 }
  }

  /* ---------- SI listening: the SI joins the main music ----------
     With the "SI listening" button on, the SI trains on the pin's NASA POWER monthly record (the same training as above, at the pin itself,
     whatever the Range) and, for every month the timeline plays, compares NASA's measured temperature and rain with what its model expected.
     The Data panel shows both numbers and how surprising the month was (in standard deviations of the model's usual miss), and the music
     (musiclayers.js) rings bells in its own key for the surprising months. Nothing replaces NASA's numbers: the SI only says how expected they were. */
  var LIS = { on: false, key: null, R: null, job: null, err: null };
  function muted() { return !!(window.EJMH && EJMH.on()) }
  function pinKey() { var P = window.pinLL; return P ? (+P[0]).toFixed(3) + "," + (+P[1]).toFixed(3) + (muted() ? "|m" : "") : null }
  function lisBtn() { var b = $("silb"); if (!b) return; b.setAttribute("aria-pressed", LIS.on ? "true" : "false"); b.textContent = "SI listening: " + (LIS.on ? (LIS.job ? "learning…" : LIS.err ? "no data" : "on") : "off") }
  function lisTrain() {
    var k = pinKey(); if (!LIS.on || !k) return null; if (LIS.key === k && (LIS.R || LIS.job)) return LIS.job || Promise.resolve(LIS.R);
    var P = window.pinLL, name = (window.last && window.last[2]) || "the pin"; LIS.key = k; LIS.R = null; LIS.err = null;
    LIS.job = train(+P[0], +P[1], { lat: +P[0], lon: +P[1], name: name }, null, muted()).then(function (R) { if (LIS.key === k) { LIS.R = R; LIS.job = null; lisBtn(); refresh() } return R }, function (e) { if (LIS.key === k) { LIS.err = e.message || String(e); LIS.job = null; lisBtn() } return null });
    lisBtn(); return LIS.job;
  }
  /* how expected the month of a timeline moment was, per variable */
  function at(ms) {
    if (!LIS.on || !LIS.R || LIS.key !== pinKey() || !isFinite(ms)) return null; var d = new Date(ms), tm = (d.getUTCFullYear() - Y0) * 12 + d.getUTCMonth(), out = { tm: tm, label: MON[d.getUTCMonth()] + " " + d.getUTCFullYear(), vars: {} };
    LIS.R.vars.forEach(function (V) { if (V.err) { out.vars[V.id] = { err: V.err, V: V }; return } var S = V.series, k = tm - S.t[0];
      if (tm > S.t[S.t.length - 1] || tm < S.t[0]) { out.vars[V.id] = { outside: true, V: V }; return }
      if (S.t[k] !== tm) { k = S.t.indexOf(tm); if (k < 0) { out.vars[V.id] = { gap: true, V: V }; return } }
      var z = (S.y[k] - S.fit[k]) / (V.sd || 1); out.vars[V.id] = { v: S.y[k], exp: S.fit[k], z: z, V: V } });
    return out;
  }
  function word(z) { var a = Math.abs(z); return a >= 3 ? "very rare surprise" : a >= 2 ? "anomaly" : a >= 1 ? "a little unusual" : "as expected" }
  function refresh() { if (window.EJP && EJP.update) try { EJP.update(true) } catch (e) { } }
  /* rows for the Data panel (datapanel.js reads EJP.sources) */
  function lisSrc(id, nm, sound) {
    return { qty: "si_" + id, name: "SI: was this month's " + nm + " expected?", type: "NASA POWER's measured monthly value against the SI's model of this place (trend + the cycles it learned)", src: "Earth Jukebox SI, trained in your browser on NASA POWER monthly data (1981 to last year)", url: "https://power.larc.nasa.gov/", sound: sound,
      get: async function (I) {
        if (!LIS.on) return { na: "SI listening is off" };
        var j = lisTrain(); if (j) await Promise.race([j, new Promise(function (r) { setTimeout(r, 15000) })]);
        if (LIS.err) return { na: "the SI could not read NASA POWER here (" + LIS.err + ")" };
        if (!LIS.R) return { na: "the SI is still learning this place" };
        var A = at(I.t), x = A && A.vars[id]; if (!x) return { na: "the SI has not learned this pin yet" };
        if (x.err) return { na: "the SI could not learn this: " + x.err };
        if (x.outside) return { na: "outside the record the SI learned (" + x.V.from + " to " + x.V.to + ")" };
        if (x.gap) return { na: "NASA POWER has no value for " + A.label };
        var u = x.V.unit, dp = id === "pr" ? 2 : 1;
        return { v: x.z, txt: (x.z >= 0 ? "+" : "") + x.z.toFixed(1) + " σ, " + word(x.z), at: A.label + (I.res !== "month" ? " (the month of this moment)" : ""), how: "NASA measured " + x.v.toFixed(dp) + " " + u + "; the SI expected " + x.exp.toFixed(dp) + " " + u + " (its usual miss is ±" + x.V.sd.toFixed(dp) + " " + u + "). At the pin itself, whatever the Range." };
      } };
  }
  var LSRC = [lisSrc("t2m", "temperature", "2 σ or more: bells in the music's key ring every bar (warmer than expected: high bells; cooler: low bells)"), lisSrc("pr", "rain", "2 σ or more: wetter than expected, a falling run of high notes; drier, a soft low note")];
  function setListening(on) {
    LIS.on = !!on; var src = window.EJP && EJP.sources;
    if (src) { LSRC.forEach(function (x) { var i = src.indexOf(x); if (i >= 0) src.splice(i, 1) }); if (LIS.on) src.unshift(LSRC[0], LSRC[1]) }
    if (LIS.on) lisTrain(); lisBtn(); refresh(); return LIS.on;
  }
  /* for the music: the surprise (z) of temperature and rain for the moment being played, or null */
  function now() { var I = window.EJP && EJP.instant ? EJP.instant() : null; if (!I) return null; if (LIS.on && LIS.key !== pinKey()) lisTrain(); var A = at(I.t); if (!A) return null; var t = A.vars.t2m, r = A.vars.pr; return { zt: t && isFinite(t.z) ? t.z : null, zp: r && isFinite(r.z) ? r.z : null, label: A.label } }
  function lisUI() {
    if ($("silb")) return; var dp = $("dpb"); if (!dp) return;
    var st = document.createElement("style"); st.textContent = "#silb{display:inline-block;margin:8px 0 0 0;pointer-events:auto;width:auto;background:rgba(10,14,20,.85);border:1px solid #7fb3d5;color:#9fd0f0;font-size:12px;font-weight:600;padding:5px 10px;cursor:pointer}#silb:hover,#silb[aria-pressed=true]{background:#7fb3d5;color:#0b1520}"; document.head.appendChild(st);
    var b = document.createElement("button"); b.id = "silb"; b.type = "button"; b.title = "The SI learns this pin's NASA record, marks the months that surprised it in the Data panel, and rings bells for them in the music";
    var br = document.createElement("br"); dp.parentNode.insertBefore(br, dp.nextSibling); dp.parentNode.insertBefore(b, br.nextSibling);   /* on its own line, under Open Data Panel */ b.addEventListener("click", function () { if (!pinKey() && !LIS.on) { b.textContent = "SI listening: drop a pin first"; setTimeout(lisBtn, 2500); return } setListening(!LIS.on) }); lisBtn();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(lisUI, 0) }); else setTimeout(lisUI, 0);
  setInterval(function () { lisUI(); if (LIS.on && LIS.key !== pinKey() && pinKey()) { lisTrain(); } }, 2000);

  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (!b) return; if (b.id === "cmpsi") learn(); else if (b.id === "cmpsiplay") play() });
  window.EJSI = { listen: setListening, listening: function () { return LIS.on }, learned: function () { return LIS.R }, now: now, at: at, lisState: function () { return { on: LIS.on, key: LIS.key, ready: !!LIS.R, err: LIS.err } }, stop: stopPlay,
    learn: learn, play: play, summary: summary, last: function () { return LAST }, chartPG: chartPG, chartFit: chartFit, per: per, pct: pct, fx: fx, MON: MON, _frac: frac, _harmony: harmony };
})();
