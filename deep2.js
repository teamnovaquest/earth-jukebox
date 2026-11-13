/* Earth Jukebox: more in-depth research (adds to deep.js).
   1. The area: for countries and large regions, the research maps cover the place's own outline (OpenStreetMap), and the
      numbers are taken only inside it. Smaller places keep the square around the point.
   2. More research packs for every place: air quality since 1980, nitrogen dioxide, carbon monoxide, land surface heat,
      night lights, terrain, earthquakes, sunlight and wind energy, the country's development record, recent hourly air
      quality, and climate projections to 2050. Each pack says exactly what it measured, where and how.
   3. Sharp figures: charts go into the PDF as vector drawings; maps as high-resolution images.
   Nothing here invents or fills in numbers: a pack that cannot get its data says why and is left out. */
(function () {
  "use strict";
  var EJD = window.EJD; if (!EJD || !EJD.util) return;
  var U = EJD.util, mk = U.mk, pool = U.pool, fx = U.fx, sgn = U.sgn, RAD = Math.PI / 180, MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  async function getJSON(u, opt, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 40000); try { var r = await fetch(u, Object.assign({ signal: ac.signal }, opt || {})); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json() } finally { clearTimeout(tm) } }
  async function retry(f, n) { for (var k = 0; k < (n || 3); k++) { try { return await f() } catch (e) { if (k === (n || 3) - 1) throw e; await sleep(800 * (k + 1)) } } }
  function mean(a) { a = a.filter(function (v) { return v !== null && v !== undefined && isFinite(v) }); return a.length ? a.reduce(function (s, v) { return s + v }, 0) / a.length : null }
  function dist(a1, o1, a2, o2) { var a = Math.sin((a2 - a1) * RAD / 2), b = Math.sin((o2 - o1) * RAD / 2), h = a * a + Math.cos(a1 * RAD) * Math.cos(a2 * RAD) * b * b; return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h))) }
  function tw(t, unit, d, per) { return EJD.trendWords(t, unit, d, per) }
  function trendIs(t, unit, d, per) { return t ? "the trend is " + tw(t, unit, d, per) : "there are too few years for a reliable trend test" }
  function sigT(t) { return EJD.sig(t) }
  var R = EJD.REFS;
  R.aod = ["Gelaro, R. et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). Journal of Climate, 30, 5419–5454.", "https://doi.org/10.1175/JCLI-D-16-0758.1"];
  R.omi_no2 = ["Lamsal, L. N. et al. (2021). Ozone Monitoring Instrument (OMI) Aura nitrogen dioxide standard product version 4.0 with improved surface and cloud treatments. Atmospheric Measurement Techniques, 14, 455–479.", "https://doi.org/10.5194/amt-14-455-2021"];
  R.veda = ["NASA VEDA (Visualization, Exploration and Data Analysis) data services, openveda.cloud.", "https://www.earthdata.nasa.gov/dashboard/"];
  R.mopitt = ["Deeter, M. N. et al. (2019). Radiance-based retrieval bias mitigation for the MOPITT instrument: the version 8 product. Atmospheric Measurement Techniques, 12, 4561–4580.", "https://doi.org/10.5194/amt-12-4561-2019"];
  R.lst = ["Wan, Z., Hook, S. & Hulley, G. (2021). MODIS/Terra Land Surface Temperature/Emissivity Monthly L3 Global 0.05Deg CMG V061. NASA EOSDIS LP DAAC.", "https://doi.org/10.5067/MODIS/MOD11C3.061"];
  R.blackmarble = ["Román, M. O. et al. (2018). NASA's Black Marble nighttime lights product suite. Remote Sensing of Environment, 210, 113–143.", "https://doi.org/10.1016/j.rse.2018.03.017"];
  R.usgs = ["U.S. Geological Survey (2026). ANSS Comprehensive Earthquake Catalog (ComCat), Earthquake Hazards Program.", "https://earthquake.usgs.gov/data/comcat/"];
  R.cop_dem = ["European Space Agency (2021). Copernicus Global Digital Elevation Model (GLO-90), via the Open-Meteo elevation service.", "https://doi.org/10.5270/ESA-c5d3d65"];
  R.power_clim = ["NASA Langley Research Center (2026). POWER Project monthly and annual climatologies (solar from CERES, wind from MERRA-2).", "https://power.larc.nasa.gov/"];
  R.worldbank = ["World Bank (2026). World Development Indicators.", "https://datatopics.worldbank.org/world-development-indicators/"];
  R.nexgddp = ["Thrasher, B., Wang, W., Michaelis, A., Melton, F., Lee, T. and Nemani, R. (2022). NASA Global Daily Downscaled Projections, CMIP6. Scientific Data, 9, 262; data from the NASA Center for Climate Simulation THREDDS server.", "https://doi.org/10.1038/s41597-022-01393-4"];
  R.who_aqg = ["World Health Organization (2021). WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide.", "https://www.who.int/publications/i/item/9789240034228"];
  R.geos = ["NASA Global Modeling and Assimilation Office. GEOS-FP and GEOS-CF (Composition Forecasting) model output, NASA NCCS OPeNDAP.", "https://gmao.gsfc.nasa.gov/"];
  R.osm = ["OpenStreetMap contributors (2026). Place outlines via the Nominatim service.", "https://www.openstreetmap.org/copyright"];

  /* ------------------------------------------------------------ 1. the area of a large place */
  function bboxOf(rings) { var b = { s: 90, n: -90, w: 180, e: -180 }; rings.forEach(function (r) { r.forEach(function (q) { if (q[1] < b.s) b.s = q[1]; if (q[1] > b.n) b.n = q[1]; if (q[0] < b.w) b.w = q[0]; if (q[0] > b.e) b.e = q[0] }) }); return b }
  function inRing(r, x, y) { var ins = false; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins } return ins }
  function maskFn(rings) {
    return function (bb, w, h) {
      var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.fillStyle = "#fff"; x.beginPath();
      rings.forEach(function (r) { r.forEach(function (q, n) { var X = (q[0] - bb.w) / (bb.e - bb.w) * w, Y = (bb.n - q[1]) / (bb.n - bb.s) * h; n ? x.lineTo(X, Y) : x.moveTo(X, Y) }); x.closePath() });
      x.fill("evenodd"); var d = x.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h); for (var i = 0; i < w * h; i++) m[i] = d[i * 4 + 3] >= 128 ? 1 : 0; return m;
    };
  }
  EJD.areaMask = maskFn;
  EJD.prepare = async function (D, say) {
    D.area = null; var p = D.place; if (!p || !p.bb) return;
    var spanLat = Math.abs(p.bb[1] - p.bb[0]), spanLon = Math.abs(p.bb[3] - p.bb[2]);
    if (spanLat < 1.2 && spanLon < 1.2) return;   /* smaller places keep the square around the point */
    say && say("Finding the outline of " + p.name + " (OpenStreetMap)…");
    var j = await retry(function () { return getJSON("https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&polygon_threshold=0.02&limit=5&q=" + encodeURIComponent(p.name), null, 30000) });
    var best = null;
    (j || []).forEach(function (r) { var g = r.geojson; if (!g || !/Polygon/.test(g.type)) return; var bb = r.boundingbox.map(Number); if (p.lat < bb[0] - .5 || p.lat > bb[1] + .5 || p.lon < bb[2] - .5 || p.lon > bb[3] + .5) return; if (!best) best = r });
    if (!best) return;
    var g = best.geojson, polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates, parts = polys.map(function (pl) { return pl[0] });
    var area = function (r) { var b = bboxOf([r]); return (b.e - b.w) * (b.n - b.s) }, main = parts.filter(function (r) { return inRing(r, p.lon, p.lat) })[0];
    if (!main) main = parts.slice().sort(function (a, b) { return area(b) - area(a) })[0];
    var mb = bboxOf([main]), padx = (mb.e - mb.w) * .2, pady = (mb.n - mb.s) * .2;
    var keep = parts.filter(function (r) { var b = bboxOf([r]); return b.w >= mb.w - padx && b.e <= mb.e + padx && b.s >= mb.s - pady && b.n <= mb.n + pady });
    var bb = bboxOf(keep), partial = keep.length < parts.length;
    if (bb.e - bb.w > 180) return;   /* outlines across the 180th meridian are left as a square */
    var wide = bb.e - bb.w > 80 || bb.n - bb.s > 50;
    if (wide) { var cx = p.lon, cy = p.lat; bb = { w: Math.max(bb.w, cx - 40), e: Math.min(bb.e, cx + 40), s: Math.max(bb.s, cy - 25), n: Math.min(bb.n, cy + 25) } }
    var px = (bb.e - bb.w) * .03, py = (bb.n - bb.s) * .03;
    bb = { w: Math.max(-180, bb.w - px), e: Math.min(180, bb.e + px), s: Math.max(-85, bb.s - py), n: Math.min(85, bb.n + py) };
    D.area = { bb: bb, label: "area of " + p.name + (partial ? " (its main part" + (wide ? ", within 40° of the point" : "") + ")" : wide ? " (within 40° of the point)" : ""), border: keep, mask: maskFn(keep), partial: partial, wide: wide, osm: best.display_name };
  };
  /* where the research looks: the outline, or a circle/square around the point */
  function areaBox(D, km) { if (D.area) return D.area.bb; var p = D.place; return U.boxKm(p.lat, p.lon, km || Math.max(30, Math.min(200, D.km || 60))) }
  function areaLabel(D, km) { return D.area ? D.area.label : "the " + (km || Math.max(30, Math.min(200, D.km || 60))) + " km square around the point" }
  function areaPoly(D, km) { var b = areaBox(D, km); if (D.area && D.area.border) return D.area.border; return [[[b.w, b.s], [b.e, b.s], [b.e, b.n], [b.w, b.n], [b.w, b.s]]] }

  /* mean of a NASA GIBS monthly map over the area: every pixel inside the outline (or the square), weighted by its area */
  async function gibsMean(layer, cm, day, D, km, n) {
    var bb = areaBox(D, km), lat = (bb.s + bb.n) / 2, wkm = (bb.e - bb.w) * Math.cos(lat * RAD), hkm = bb.n - bb.s, w = n, h = Math.max(4, Math.round(n * hkm / wkm)); if (h > n) { h = n; w = Math.max(4, Math.round(n * wkm / hkm)) }
    var g = await EJD.grid(layer, cm, day, bb, w, h), m = D.area ? D.area.mask(bb, w, h) : null, sw = 0, swv = 0, c = 0;
    for (var y = 0; y < h; y++) { var wt = Math.cos((bb.n - (y + .5) * (bb.n - bb.s) / h) * RAD); for (var x = 0; x < w; x++) { var i = y * w + x, v = g.v[i]; if (m && !m[i]) continue; if (v === v) { sw += wt; swv += wt * v; c++ } } }
    return c ? { v: swv / sw, n: c, units: g.units } : null;
  }
  async function monthlyRecord(layer, cm, D, km, from, to, say, name) {
    var jobs = []; for (var y = from[0]; y <= to[0]; y++) for (var m = 1; m <= 12; m++) { if (y === from[0] && m < from[1]) continue; if (y === to[0] && m > to[1]) break; jobs.push([y, m]) }
    var done = 0, res = await pool(8, jobs, async function (j) { var r = await retry(function () { return gibsMean(layer, cm, j[0] + "-" + (j[1] < 10 ? "0" : "") + j[1] + "-01", D, km, 40) }, 2); done++; if (say && done % 24 === 0) say(name + ": " + done + " of " + jobs.length + " NASA monthly maps"); return r });
    var out = jobs.map(function (j, i) { return { y: j[0], m: j[1], v: res[i] ? res[i].v : null } }), got = out.filter(function (r) { return r.v !== null }).length;
    if (got < jobs.length * .6) throw new Error("NASA GIBS sent usable maps for only " + got + " of " + jobs.length + " months");
    var un = (res.filter(function (r) { return r && r.units !== undefined })[0] || {}).units || "";
    if (/^K$/.test(un)) out.forEach(function (r) { if (r.v !== null) r.v -= 273.15 });   /* NASA's land temperature scale is in kelvin */
    out.units = un;
    return out;
  }
  function yearly(rows, minMonths) { var ys = {}; rows.forEach(function (r) { if (r.v === null) return; (ys[r.y] = ys[r.y] || []).push(r.v) }); return Object.keys(ys).map(Number).sort().filter(function (y) { return ys[y].length >= (minMonths || 10) }).map(function (y) { return { y: y, v: mean(ys[y]), n: ys[y].length } }) }
  function lastFull(layer) { try { var info = window.MAP && MAP[layer]; if (info) { var e = new Date(Math.max.apply(null, info.ranges.map(function (r) { return r.e }))); return [e.getUTCFullYear(), e.getUTCMonth() + 1] } } catch (e) { } var d = new Date(); return [d.getUTCFullYear(), Math.max(1, d.getUTCMonth() - 2)] }
  function decadeTable(rows, unit, d) { var dec = {}; rows.forEach(function (r) { var k = Math.floor(r.y / 10) * 10; (dec[k] = dec[k] || []).push(r.v) }); return Object.keys(dec).map(Number).sort().map(function (k) { return [k + "s", fx(mean(dec[k]), d), String(dec[k].length)] }) }

  /* ------------------------------------------------------------ 2. research packs */
  async function air(D, H, say) {
    try { await buildMap() } catch (e) { }
    var L = "MERRA2_Aerosol_Optical_Depth_Analysis_Monthly", end = lastFull(L), rows = await monthlyRecord(L, L, D, null, [1980, 1], end, say, "Haze (aerosol optical depth)");
    var yr = yearly(rows, 12), xs = yr.map(function (r) { return r.y }), ys = yr.map(function (r) { return r.v }), t = mk(xs, ys), clim = [];
    for (var m = 1; m <= 12; m++) clim.push(mean(rows.filter(function (r) { return r.m === m && r.y >= 1991 && r.y <= 2020 }).map(function (r) { return r.v })));
    var hi = clim.indexOf(Math.max.apply(null, clim)), lo = clim.indexOf(Math.min.apply(null, clim)), last5 = mean(ys.slice(-5)), first10 = mean(ys.slice(0, 10));
    var text = "Aerosol optical depth (AOD) measures how much sunlight is blocked by particles in the air: dust, smoke, sea salt and pollution. It has no unit: values below about 0.1 mean very clear air, and values around 1 or more mean very hazy, polluted or dusty air. NASA's MERRA-2 reanalysis gives it every month since January 1980. Averaged over " + areaLabel(D) + ", the yearly AOD was " + fx(first10, 3) + " in " + xs[0] + "–" + xs[Math.min(9, xs.length - 1)] + " and " + fx(last5, 3) + " in the last five full years (" + xs[Math.max(0, xs.length - 5)] + "–" + xs[xs.length - 1] + "). Over " + xs[0] + "–" + xs[xs.length - 1] + " " + trendIs(t, "AOD units", 3, 10) + ". The haziest month on average (1991–2020) is " + MONF[hi] + " (" + fx(clim[hi], 2) + ") and the clearest is " + MONF[lo] + " (" + fx(clim[lo], 2) + ").";
    return { id: "aod", title: "Haze and air particles since 1980 (NASA MERRA-2 aerosol optical depth)", text: text,
      figs: [{ type: "line", series: [{ xs: xs, ys: ys, label: "Yearly average AOD", color: "#8c6d31" }], trend: t, ylab: "Aerosol optical depth", d: 2 }, { type: "bars", xs: MON, ys: clim, ylab: "AOD, 1991–2020 average" }],
      table: { head: ["Decade", "Average AOD", "Years"], rows: decadeTable(yr, "", 3) }, refs: ["aod", "gibs", "mk", "sen"], facts: [text] };
  }
  async function no2(D, H, say) {
    var it = await getJSON("https://openveda.cloud/api/stac/collections/no2-monthly/items?limit=300"), items = (it.features || []).map(function (f) { var dt = f.properties.datetime || f.properties.start_datetime; return { id: f.id, y: +dt.slice(0, 4), m: +dt.slice(5, 7) } }).sort(function (a, b) { return a.y - b.y || a.m - b.m });
    if (!items.length) throw new Error("NASA VEDA lists no monthly NO₂ maps");
    var bb = areaBox(D), poly = D.area ? { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: D.area.border.map(function (r) { return [r] }) } } : { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: areaPoly(D) } };
    var done = 0, res = await pool(6, items, async function (x) { var j = await retry(function () { return getJSON("https://openveda.cloud/api/raster/collections/no2-monthly/items/" + encodeURIComponent(x.id) + "/statistics?assets=cog_default", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(poly) }) }, 2); done++; if (say && done % 12 === 0) say("Nitrogen dioxide: " + done + " of " + items.length + " NASA monthly maps"); var st = (j.properties || (j.features && j.features[0] && j.features[0].properties) || {}).statistics; if (!st) return null; var s = st[Object.keys(st)[0]]; return s && s.count > 0 && isFinite(s.mean) ? s.mean : null });
    var rows = items.map(function (x, i) { return { y: x.y, m: x.m, v: res[i] } }), yr = yearly(rows, 10);
    if (yr.length < 3) throw new Error("too few complete years of NO₂ maps here");
    var xs = yr.map(function (r) { return r.y }), ys = yr.map(function (r) { return r.v / 1e15 }), t = mk(xs, ys), clim = [];
    for (var m = 1; m <= 12; m++) clim.push(mean(rows.filter(function (r) { return r.m === m && r.v !== null }).map(function (r) { return r.v / 1e15 })));
    var hi = clim.indexOf(Math.max.apply(null, clim.filter(isFinite))), lo = clim.indexOf(Math.min.apply(null, clim.filter(isFinite)));
    var text = "Nitrogen dioxide (NO₂) comes mostly from burning fuel in vehicles, power plants and industry. NASA's OMI instrument on the Aura satellite measures the NO₂ in the lower atmosphere above each 0.1° square every day; NASA VEDA serves monthly maps (" + items[0].y + "–" + items[items.length - 1].y + "). Over " + areaLabel(D) + " the yearly average was " + fx(ys[0], 2) + " × 10¹⁵ molecules/cm² in " + xs[0] + " and " + fx(ys[ys.length - 1], 2) + " × 10¹⁵ in " + xs[xs.length - 1] + "; " + trendIs(t, "× 10¹⁵ molecules/cm²", 3, 1) + ". NO₂ is highest in " + MONF[hi] + " and lowest in " + MONF[lo] + " on average. These are whole-column amounts seen from space, not the concentration at street level; each map cell counts equally in the average.";
    return { id: "no2", title: "Nitrogen dioxide pollution (NASA OMI, " + xs[0] + "–" + xs[xs.length - 1] + ")", text: text,
      figs: [{ type: "line", series: [{ xs: xs, ys: ys, label: "Yearly average NO₂ column", color: "#7b3294" }], trend: t, ylab: "NO₂ (10¹⁵ molecules/cm²)", d: 2 }, { type: "bars", xs: MON, ys: clim, ylab: "NO₂, average by month" }],
      refs: ["omi_no2", "veda", "mk", "sen"], facts: [text] };
  }
  async function co(D, H, say) {
    try { await buildMap() } catch (e) { }
    var L = "MOPITT_CO_Monthly_Surface_Mixing_Ratio_Day", end = lastFull(L), rows = await monthlyRecord(L, "MOPITT_CO_Surface_Mixing_Ratio", D, null, [2000, 3], end, say, "Carbon monoxide");
    var yr = yearly(rows, 8); if (yr.length < 8) throw new Error("too few complete years of carbon monoxide maps here");
    var xs = yr.map(function (r) { return r.y }), ys = yr.map(function (r) { return r.v }), t = mk(xs, ys);
    var text = "Carbon monoxide (CO) comes from fires and incomplete burning of fuel. NASA's MOPITT instrument on the Terra satellite has measured it since March 2000; this is its daytime monthly estimate near the surface, averaged over " + areaLabel(D) + ". Years with at least eight months of data count. The yearly average went from " + fx(ys[0], 0) + " ppbv (" + xs[0] + ") to " + fx(ys[ys.length - 1], 0) + " ppbv (" + xs[xs.length - 1] + "); " + trendIs(t, "ppbv", 1, 10) + ". Values are read from NASA's published colour classes, so each is exact to its class (a few ppbv).";
    return { id: "co", title: "Carbon monoxide near the ground (NASA MOPITT, " + xs[0] + "–" + xs[xs.length - 1] + ")", text: text,
      figs: [{ type: "line", series: [{ xs: xs, ys: ys, label: "Yearly average CO", color: "#d95f0e" }], trend: t, ylab: "CO (ppbv)", d: 0 }], refs: ["mopitt", "gibs", "mk", "sen"], facts: [text] };
  }
  async function lst(D, H, say) {
    try { await buildMap() } catch (e) { }
    var LD = "MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day", LN = "MODIS_Terra_L3_Land_Surface_Temp_Monthly_Night", end = lastFull(LD);
    var rd = await monthlyRecord(LD, "MODIS_Land_Surface_Temp", D, null, [2000, 3], end, say, "Ground heat by day"), rn = await monthlyRecord(LN, "MODIS_Land_Surface_Temp", D, null, [2000, 3], end, say, "Ground heat by night");
    var yd = yearly(rd, 10), yn = yearly(rn, 10); if (yd.length < 8) throw new Error("too few complete years of land temperature here");
    var td = mk(yd.map(function (r) { return r.y }), yd.map(function (r) { return r.v })), tn = mk(yn.map(function (r) { return r.y }), yn.map(function (r) { return r.v }));
    var text = "Land surface temperature is how hot the ground itself is, as NASA's MODIS satellite sees it from space (about 10:30 in the morning and 10:30 at night, local time, clear skies only). It runs hotter than the air by day, especially on bare or built-up ground. Averaged over the land of " + areaLabel(D) + ", the yearly daytime surface temperature changed by " + (td ? tw(td, "°C", 2, 10) : "an amount too uncertain to test") + " and the night-time one by " + (tn ? tw(tn, "°C", 2, 10) : "an amount too uncertain to test") + " (" + yd[0].y + "–" + yd[yd.length - 1].y + "). Recent averages: " + fx(mean(yd.slice(-5).map(function (r) { return r.v })), 1) + " °C by day and " + fx(mean(yn.slice(-5).map(function (r) { return r.v })), 1) + " °C at night (last five full years).";
    return { id: "lst", title: "How hot the ground gets (NASA MODIS land surface temperature, " + yd[0].y + "–" + yd[yd.length - 1].y + ")", text: text,
      figs: [{ type: "line", series: [{ xs: yd.map(function (r) { return r.y }), ys: yd.map(function (r) { return r.v }), label: "Daytime", color: "#e6550d" }, { xs: yn.map(function (r) { return r.y }), ys: yn.map(function (r) { return r.v }), label: "Night-time", color: "#3182bd" }], trend: td, ylab: "Surface temperature (°C)", d: 1 }],
      refs: ["lst", "gibs", "mk", "sen"], facts: [text] };
  }
  async function night(D, H) {
    var bb = areaBox(D, 80), lat = (bb.s + bb.n) / 2, wkm = (bb.e - bb.w) * Math.cos(lat * RAD), hkm = bb.n - bb.s, w = 700, h = Math.max(60, Math.min(700, Math.round(w * hkm / wkm)));
    async function img(t) { var u = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=VIIRS_Black_Marble&STYLES=&CRS=EPSG:4326&BBOX=" + [bb.s, bb.w, bb.n, bb.e].map(function (v) { return v.toFixed(4) }).join(",") + "&WIDTH=" + w + "&HEIGHT=" + h + "&FORMAT=image/png&TIME=" + t; var r = await fetch(u); if (!r.ok) throw new Error("NASA GIBS did not answer"); var bm = await createImageBitmap(await r.blob()), c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(bm, 0, 0); return x.getImageData(0, 0, w, h).data }
    var a = await retry(function () { return img("2012-01-01") }), b = await retry(function () { return img("2016-01-01") });
    var m = D.area ? D.area.mask(bb, w, h) : null, la = 0, lb = 0, n = 0;
    for (var i = 0; i < w * h; i++) { if (m && !m[i]) continue; n++; la += (a[i * 4] + a[i * 4 + 1] + a[i * 4 + 2]) / 3; lb += (b[i * 4] + b[i * 4 + 1] + b[i * 4 + 2]) / 3 }
    if (!n) throw new Error("no night-light pixels in the area");
    var mf = function (d, cap) { return { type: "map", w: w, h: h, rgba: new Uint8ClampedArray(d), bb: bb, legend: null, pin: [D.place.lat, D.place.lon], caption: cap, border: D.area ? D.area.border : null } };
    var ch = la ? (lb - la) / la * 100 : null;
    var text = "NASA's Black Marble shows Earth's lights at night, made from the VIIRS satellite's night-time images with moonlight, clouds and stray light removed. It shows where people live and work, and roads, ports, gas flares and fires. NASA's published global composites exist for 2012 and 2016, shown here for " + areaLabel(D, 80) + ". The overall brightness of the picture changed by " + (ch === null ? "n/a" : sgn(ch, 0) + "%") + " between the two years. This compares picture brightness, not physical radiance, so it shows where lights spread or faded rather than an exact energy figure.";
    return { id: "night", title: "Lights at night, 2012 and 2016 (NASA Black Marble)", text: text, figs: [mf(a, "Night lights 2012"), mf(b, "Night lights 2016")], refs: ["blackmarble", "gibs"], facts: [text] };
  }
  async function terrain(D, H, say) {
    var bb = areaBox(D, 60), lat = (bb.s + bb.n) / 2, wkm = (bb.e - bb.w) * Math.cos(lat * RAD), hkm = bb.n - bb.s, w = 20, h = Math.max(6, Math.min(20, Math.round(w * hkm / wkm))), pts = [];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) pts.push([bb.n - (y + .5) * (bb.n - bb.s) / h, bb.w + (x + .5) * (bb.e - bb.w) / w]);
    pts.push([D.place.lat, D.place.lon]);
    var chunks = []; for (var i = 0; i < pts.length; i += 100) chunks.push(pts.slice(i, i + 100));
    /* Open-Meteo counts each point as one request (600 a minute), so the grid is kept to 400 points and asked for one piece at a time */
    var res = await pool(1, chunks, function (c) { return retry(function () { return getJSON("https://api.open-meteo.com/v1/elevation?latitude=" + c.map(function (q) { return q[0].toFixed(4) }).join(",") + "&longitude=" + c.map(function (q) { return q[1].toFixed(4) }).join(",")) }) });
    var el = []; res.forEach(function (r) { if (!r || !r.elevation) throw new Error("elevation service did not answer"); el = el.concat(r.elevation) });
    var pin = el.pop(), m = D.area ? D.area.mask(bb, w, h) : null, vals = [];
    el.forEach(function (v, i) { if (m && !m[i]) return; if (v !== null && isFinite(v)) vals.push(v) });
    if (vals.length < 10) throw new Error("too few elevation points");
    var mn = Math.min.apply(null, vals), mxv = Math.max.apply(null, vals), lowShare = vals.filter(function (v) { return v <= 10 }).length / vals.length;
    var stops = [[0, [0, 104, 55]], [.15, [120, 180, 90]], [.35, [230, 220, 140]], [.6, [190, 140, 90]], [.85, [140, 100, 80]], [1, [240, 240, 240]]], lo = Math.max(0, mn), span = Math.max(1, mxv - lo);
    var fig = { type: "map", w: w, h: h, rgba: new Uint8ClampedArray(w * h * 4), bb: bb, pin: [D.place.lat, D.place.lon], border: D.area ? D.area.border : null, legend: { kind: "ramp", stops: stops, lo: Math.round(lo) + " m", hi: Math.round(mxv) + " m", unit: "Height above sea level", note: "Each square is one sample point of the Copernicus 90 m elevation model, coloured from the lowest to the highest point sampled." } };
    el.forEach(function (v, i) { if ((m && !m[i]) || v === null || !isFinite(v)) return; var c = EJD.ramps.ramp(stops, Math.max(0, Math.min(1, (Math.max(0, v) - lo) / span))); fig.rgba[i * 4] = c[0]; fig.rgba[i * 4 + 1] = c[1]; fig.rgba[i * 4 + 2] = c[2]; fig.rgba[i * 4 + 3] = 210 });
    try { fig.base = await EJD.baseMap(bb, 1100) } catch (e) { }
    var text = "Height above sea level from the Copernicus 90 m digital elevation model, sampled at " + vals.length + " evenly spaced points over " + areaLabel(D, 60) + ". The point of analysis is at " + Math.round(pin) + " m. The sampled points range from " + Math.round(mn) + " m to " + Math.round(mxv) + " m (median " + Math.round(U.median(vals)) + " m). " + (lowShare > 0 ? fx(lowShare * 100, 0) + "% of them are 10 m or less above sea level, which matters for flooding and sea-level rise. " : "") + "Sample points can miss the very highest peaks and narrowest valleys.";
    return { id: "terrain", title: "Terrain and height above sea level (Copernicus DEM)", text: text, figs: [fig], refs: ["cop_dem", "openmeteo"], facts: [text] };
  }
  async function quakes(D, H) {
    var bb = areaBox(D, 600), q = D.area ? "minlatitude=" + bb.s.toFixed(3) + "&maxlatitude=" + bb.n.toFixed(3) + "&minlongitude=" + bb.w.toFixed(3) + "&maxlongitude=" + bb.e.toFixed(3) : "latitude=" + D.place.lat + "&longitude=" + D.place.lon + "&maxradiuskm=300";
    var j = await retry(function () { return getJSON("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1900-01-01&minmagnitude=4.5&orderby=time-asc&limit=20000&" + q, null, 60000) });
    var allN = (j.features || []).length, m = D.area ? D.area.mask : null, ev = (j.features || []).filter(function (f) { if (!D.area) return true; var c = f.geometry.coordinates; return D.area.border.some(function (r) { return inRing(r, c[0], c[1]) }) }).map(function (f) { var c = f.geometry.coordinates; return { t: f.properties.time, mag: f.properties.mag, place: f.properties.place || "", lon: c[0], lat: c[1], dep: c[2] } });
    var where = D.area ? "inside " + areaLabel(D) : "within 300 km of the point";
    if (!ev.length) return { id: "quakes", title: "Earthquakes since 1900 (USGS)", text: "The USGS catalogue lists no earthquakes of magnitude 4.5 or more " + where + " since 1900. Smaller earthquakes can still happen; the catalogue is complete for this size only in recent decades.", refs: ["usgs"], facts: ["No M4.5+ earthquakes " + where + " since 1900 in the USGS catalogue."] };
    var dec = {}; ev.forEach(function (e) { var y = new Date(e.t).getUTCFullYear(), k = Math.floor(y / 10) * 10; dec[k] = (dec[k] || 0) + 1 });
    var ks = []; for (var k = 1900; k <= new Date().getUTCFullYear(); k += 10) ks.push(k);
    var top = ev.slice().sort(function (a, b) { return b.mag - a.mag }).slice(0, 10), bbm = D.area ? bb : U.boxKm(D.place.lat, D.place.lon, 600), w = 600, h = Math.max(100, Math.min(600, Math.round(w * (bbm.n - bbm.s) / ((bbm.e - bbm.w) * Math.cos((bbm.s + bbm.n) / 2 * RAD)))));
    var fig = { type: "map", w: w, h: h, rgba: new Uint8ClampedArray(w * h * 4), bb: bbm, pin: [D.place.lat, D.place.lon], border: D.area ? D.area.border : null, ring: D.area ? null : 300, legend: { kind: "classes", items: [["#fdae61", "M4.5–5.9"], ["#f46d43", "M6.0–6.9"], ["#a50026", "M7.0 or more"]] } };
    ev.forEach(function (e) { var X = Math.round((e.lon - bbm.w) / (bbm.e - bbm.w) * w), Y = Math.round((bbm.n - e.lat) / (bbm.n - bbm.s) * h), r = e.mag >= 7 ? 5 : e.mag >= 6 ? 3 : 2, col = e.mag >= 7 ? [165, 0, 38] : e.mag >= 6 ? [244, 109, 67] : [253, 174, 97]; for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r) continue; var xx = X + dx, yy = Y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var o = (yy * w + xx) * 4; fig.rgba[o] = col[0]; fig.rgba[o + 1] = col[1]; fig.rgba[o + 2] = col[2]; fig.rgba[o + 3] = 230 } });
    try { fig.base = await EJD.baseMap(bbm, 1100) } catch (e) { }
    var big = ev.filter(function (e) { return e.mag >= 6 }).length, recent = ev.filter(function (e) { return new Date(e.t).getUTCFullYear() >= 1990 }).length;
    var text = "The U.S. Geological Survey's comprehensive catalogue lists " + ev.length + " earthquakes of magnitude 4.5 or more " + where + " since 1900, " + big + " of them magnitude 6 or more, and " + recent + " since 1990. The largest was magnitude " + fx(top[0].mag, 1) + " on " + new Date(top[0].t).toISOString().slice(0, 10) + " (" + top[0].place + "). Counts before the 1960s are lower partly because fewer earthquakes were recorded then, not only because fewer happened.";
    return { id: "quakes", title: "Earthquakes since 1900 (USGS)", text: text, figs: [fig, { type: "bars", xs: ks.map(function (k) { return k + "s" }), ys: ks.map(function (k) { return dec[k] || 0 }), ylab: "M4.5+ earthquakes per decade" }],
      table: { head: ["Date (UTC)", "Magnitude", "Depth (km)", "Where (USGS)"], rows: top.map(function (e) { return [new Date(e.t).toISOString().slice(0, 10), fx(e.mag, 1), fx(e.dep, 0), e.place] }) }, refs: ["usgs"], facts: [text], num: { check: { k: "usgs", q: ("starttime=1900-01-01&minmagnitude=4.5&" + q).toLowerCase(), v: allN } } };
  }
  async function energy(D) {
    var p = D.place, j = await retry(function () { return getJSON("https://power.larc.nasa.gov/api/temporal/climatology/point?community=RE&parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,WS50M&latitude=" + p.lat + "&longitude=" + p.lon + "&format=JSON") }), P = j.properties.parameter, K = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var sol = K.map(function (k) { return P.ALLSKY_SFC_SW_DWN[k] }), clr = K.map(function (k) { return P.CLRSKY_SFC_SW_DWN[k] }), ws = K.map(function (k) { return P.WS50M[k] }), sa = P.ALLSKY_SFC_SW_DWN.ANN, wa = P.WS50M.ANN, hd = j.header || {};
    if (!(sa > 0)) throw new Error("NASA POWER has no sunlight climatology here");
    var lo = sol.indexOf(Math.min.apply(null, sol)), hi = sol.indexOf(Math.max.apply(null, sol)), pm = /(\w+ \d{4})\s*-\s*(\w+ \d{4})/.exec(String(hd.range || "") + " " + (j.messages || []).join(" ")), period = pm ? pm[1] + " to " + pm[2] : "the POWER climatology period";
    var text = "NASA POWER's long-term averages (" + period + ") at the point: the sun delivers " + fx(sa, 2) + " kWh per square metre per day on a flat surface over the year, from " + fx(sol[lo], 2) + " in " + MONF[lo] + " to " + fx(sol[hi], 2) + " in " + MONF[hi] + "; under clear skies it would be " + fx(P.CLRSKY_SFC_SW_DWN.ANN, 2) + ", so clouds and haze take " + fx(100 * (1 - sa / P.CLRSKY_SFC_SW_DWN.ANN), 0) + "% away. The wind 50 m above the ground averages " + fx(wa, 2) + " m/s. As a rough guide, 1 kW of solar panels makes about as many kWh a day as the sunlight figure times the system's efficiency factor (often 0.75 to 0.85).";
    return { id: "energy", title: "Sunlight and wind for clean energy (NASA POWER climatology)", text: text,
      figs: [{ type: "bars", xs: MON, ys: sol, ylab: "Sunlight (kWh/m²/day)" }, { type: "line", series: [{ xs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], ys: ws, label: "Wind at 50 m (m/s)", color: "#3182bd" }], ylab: "Wind speed (m/s)", d: 1, xlab: "Month (1 = January)" }],
      table: { head: ["Month", "Sunlight, all skies (kWh/m²/day)", "Clear skies", "Wind at 50 m (m/s)"], rows: MON.map(function (m, i) { return [m, fx(sol[i], 2), fx(clr[i], 2), fx(ws[i], 2)] }) }, refs: ["power_clim"], facts: [text], num: { check: { k: "power", lat: p.lat, lon: p.lon, v: sa } } };
  }
  /* the country's development record (World Bank): the country that contains the point */
  var WB = [["SP.POP.TOTL", "Population", 0, ""], ["SP.URB.TOTL.IN.ZS", "People living in towns and cities", 1, "%"], ["NY.GDP.PCAP.KD", "Income per person (GDP, constant 2015 US$)", 0, "US$"], ["EN.GHG.CO2.PC.CE.AR5", "CO₂ emissions per person (excluding land use)", 2, "t CO₂e"], ["AG.LND.FRST.ZS", "Forest area", 1, "% of land"], ["AG.LND.AGRI.ZS", "Farmland", 1, "% of land"], ["EG.ELC.ACCS.ZS", "Access to electricity", 1, "% of people"], ["EG.ELC.RNEW.ZS", "Renewable electricity", 1, "% of output"]];
  async function country(D) {
    var p = D.place, g = await retry(function () { return getJSON("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + p.lat + "&longitude=" + p.lon + "&localityLanguage=en") }), cc = g.countryCode, cn = g.countryName;
    if (!cc) throw new Error("the point is not inside a country (open sea)");
    var j = await retry(function () { return getJSON("https://api.worldbank.org/v2/country/" + cc + "/indicator/" + WB.map(function (w) { return w[0] }).join(";") + "?source=2&format=json&per_page=2000&date=1960:" + new Date().getUTCFullYear()) }), rows = (j && j[1]) || [];
    if (!rows.length) throw new Error("the World Bank has no indicators for " + cn);
    var by = {}; rows.forEach(function (r) { if (r.value === null) return; (by[r.indicator.id] = by[r.indicator.id] || []).push([+r.date, r.value]) }); Object.keys(by).forEach(function (k) { by[k].sort(function (a, b) { return a[0] - b[0] }) });
    var fmt = function (v, d, u) { if (u === "") return v >= 1e6 ? fx(v / 1e6, 1) + " million" : Math.round(v).toLocaleString("en-US"); return (u === "US$" ? Math.round(v).toLocaleString("en-US") : fx(v, d)) + " " + u };
    var tab = [], figs = [], txt = [];
    WB.forEach(function (w) { var s = by[w[0]]; if (!s || s.length < 2) return; var a = s[0], b = s[s.length - 1], i90 = s.filter(function (q) { return q[0] >= 1990 })[0] || a; tab.push([w[1], a[0] + ": " + fmt(a[1], w[2], w[3]), i90[0] + ": " + fmt(i90[1], w[2], w[3]), b[0] + ": " + fmt(b[1], w[2], w[3])]) });
    ["SP.POP.TOTL", "AG.LND.FRST.ZS", "EN.GHG.CO2.PC.CE.AR5", "EG.ELC.ACCS.ZS"].forEach(function (k) { var s = by[k], w = WB.filter(function (q) { return q[0] === k })[0]; if (!s || s.length < 5) return; figs.push({ type: "line", series: [{ xs: s.map(function (q) { return q[0] }), ys: s.map(function (q) { return k === "SP.POP.TOTL" ? q[1] / 1e6 : q[1] }), label: w[1], color: "#2c7fb8" }], ylab: k === "SP.POP.TOTL" ? "Population (millions)" : w[1] + " (" + w[3] + ")", d: 1 }); var a = s[0], b = s[s.length - 1]; txt.push((/^[A-Z][a-z]/.test(w[1]) ? w[1][0].toLowerCase() + w[1].slice(1) : w[1]) + " went from " + fmt(a[1], w[2], w[3]) + " (" + a[0] + ") to " + fmt(b[1], w[2], w[3]) + " (" + b[0] + ")") });
    var text = "The point lies in " + cn + ". The World Bank's World Development Indicators give the country's record: " + txt.join("; ") + ". These are national figures, so they describe the whole country, not only " + p.name + "; they show the human pressures and capacities behind the environmental changes in this report.";
    var pop = by["SP.POP.TOTL"] && by["SP.POP.TOTL"][by["SP.POP.TOTL"].length - 1];
    return { id: "country", title: cn + " in numbers (World Bank World Development Indicators)", text: text, figs: figs.slice(0, 4), table: { head: ["Indicator", "First year", "Around 1990", "Latest"], rows: tab }, refs: ["worldbank"], facts: [text], num: pop ? { check: { k: "wb", cc: cc, ind: "SP.POP.TOTL", y: pop[0], v: pop[1] } } : null };
  }
  /* hourly air and weather of the last fortnight: NASA's own GEOS numbers saved with the EIC frames */
  async function recent(D) {
    var m = window.GAL && GAL.man, ds = ((m && m.datasets) || []).filter(function (d) { return window.EJN && EJN.ok(d) }); if (!ds.length) throw new Error("NASA's hourly numbers are not saved yet");
    var rows = [], who = { pm25: 15, o3: null, nox: null, co: null }, ex = [];
    for (var i = 0; i < ds.length; i++) { var d = ds[i], r = await EJN.series(d, D.place.lat, D.place.lon, 0), v = r.vals.filter(function (x) { return x !== null && isFinite(x) }); if (!v.length) continue; var u = d.num.unit; rows.push([d.title, d.num.times[0].slice(0, 10) + " to " + d.num.times[d.num.times.length - 1].slice(0, 10), EJN.fmt(d.num, Math.min.apply(null, v)), EJN.fmt(d.num, mean(v)), EJN.fmt(d.num, Math.max.apply(null, v)), String(v.length)]); if (d.key === "pm25") { var o = v.filter(function (x) { return x > 15 }).length; ex.push(o + " of " + v.length + " sampled hours had PM2.5 above 15 µg/m³ (the WHO 24-hour guideline level; one hour above it is not a guideline breach by itself)") } }
    if (!rows.length) throw new Error("no hourly values at this point");
    var text = "NASA's GEOS-FP weather model and GEOS-CF air-quality model give hourly values; the site saved them for the frames of NASA's Earth Information Center gallery. At the point of analysis (nearest NASA grid cell) these were the lowest, average and highest values over the sampled hours. " + ex.join(". ") + (ex.length ? ". " : "") + "These hours cover only the latest fortnight NASA published, so they describe recent conditions, not the climate.";
    return { id: "recent", title: "Recent hourly air quality and weather (NASA GEOS-FP / GEOS-CF)", text: text, table: { head: ["Dataset", "Period", "Lowest", "Average", "Highest", "Hours"], rows: rows }, refs: ["geos", "who_aqg"], facts: [text] };
  }
  /* climate projections to 2050: NASA NEX-GDDP-CMIP6 (NASA Earth Exchange), daily, bias-corrected and downscaled to 0.25 degrees.
     Read straight from NASA's THREDDS server (it allows web pages), one file per model, scenario, variable and year, with the
     NetCDF Subset Service returning the grid cell at the place as text. No Open-Meteo requests are used. */
  var NEX = "https://ds.nccs.nasa.gov/thredds/", NEXM = [["GISS-E2-1-G", "r1i1p1f2"], ["MRI-ESM2-0", "r1i1p1f1"], ["MPI-ESM1-2-HR", "r1i1p1f1"], ["EC-Earth3", "r1i1p1f1"]];   /* 4 models x 2 scenarios x 10 + 10 years x 2 variables = 240 yearly files: NASA's server gives about 12 a minute */
  var NEXY = { historical: [2005, 2014], ssp245: [2041, 2050], ssp585: [2041, 2050] };
  async function nexText(u) { for (var k = 0; k < 3; k++) { try { var r = await fetch(u, { signal: AbortSignal.timeout ? AbortSignal.timeout(90000) : undefined }); if (r.ok) return await r.text(); if (r.status === 404) throw new Error("404") } catch (e) { if (/404/.test(e.message) || k === 2) throw e } await sleep(1500 * (k + 1)) } }
  async function future(D, H, say) {
    var p = D.place, lat = p.lat.toFixed(3), lon = (p.lon < 0 ? p.lon + 360 : p.lon).toFixed(3), jobs = [], files = {}, got = {};
    say && say("Climate projections: finding NASA NEX-GDDP-CMIP6 files for " + NEXM.length + " models…");
    /* the file names (grid label and version) come from NASA's catalog for each model, scenario and variable */
    await pool(8, [].concat.apply([], NEXM.map(function (M) { return [].concat.apply([], Object.keys(NEXY).map(function (sc) { return ["tas", "pr"].map(function (v) { return [M, sc, v] }) })) })), async function (j) {
      var M = j[0], sc = j[1], v = j[2], dir = "AMES/NEX/GDDP-CMIP6/" + M[0] + "/" + sc + "/" + M[1] + "/" + v + "/";
      try { var t = await nexText(NEX + "catalog/" + dir + "catalog.xml"), names = (t.match(/name="([^"]+\.nc)"/g) || []).map(function (q) { return q.slice(6, -1) });
        for (var y = NEXY[sc][0]; y <= NEXY[sc][1]; y++) { var c = names.filter(function (n) { return n.indexOf("_" + y) > 0 && /\.nc$/.test(n) }), f = c.filter(function (n) { return /_v2\.0\.nc$/.test(n) })[0] || c.filter(function (n) { return !/_v1\.1\.nc$/.test(n) })[0] || c[0]; if (f) jobs.push({ M: M[0], sc: sc, v: v, y: y, u: NEX + "ncss/grid/" + dir + f + "?var=" + v + "&latitude=" + lat + "&longitude=" + lon + "&time_start=" + y + "-01-01T00:00:00Z&time_end=" + y + "-12-31T23:59:59Z&accept=csv" }) }
      } catch (e) { }
    });
    if (!jobs.length) throw new Error("NASA's NEX-GDDP-CMIP6 server did not answer");
    var done = 0, cell = null;
    await pool(10, jobs, async function (j) {
      try {
        var t = await nexText(j.u), rows = t.trim().split("\n").slice(1), vals = [];
        rows.forEach(function (r) { var c = r.split(","), v = +c[c.length - 1]; if (isFinite(v) && Math.abs(v) < 1e10) vals.push(v); if (!cell && c.length >= 4) cell = [+c[c.length - 3], +c[c.length - 2]] });
        if (vals.length >= 360) { var m = vals.reduce(function (a, b) { return a + b }, 0) / vals.length; ((got[j.M] = got[j.M] || {})[j.sc + j.v] = got[j.M][j.sc + j.v] || {})[j.y] = j.v === "tas" ? m - 273.15 : m * 86400 * 365.25 }
      } catch (e) { }
      done++; if (done % 10 === 0 && say) say("Climate projections: " + done + " of " + jobs.length + " yearly files read from NASA NEX-GDDP-CMIP6…");
    });
    function per(o, sc, v) { var d = o && o[sc + v]; if (!d) return null; var ks = Object.keys(d); if (ks.length < 8) return null; return ks.reduce(function (s2, k) { return s2 + d[k] }, 0) / ks.length }
    var out = [], tab = [], COL = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d"];
    NEXM.forEach(function (M) {
      var o = got[M[0]], tb = per(o, "historical", "tas"), pb = per(o, "historical", "pr"); if (tb === null) return;
      var r = { name: M[0] }; ["ssp245", "ssp585"].forEach(function (sc) { var tf = per(o, sc, "tas"), pf = per(o, sc, "pr"); r["dT" + sc] = tf === null ? null : tf - tb; r["dP" + sc] = pf === null || pb === null || !pb ? null : (pf - pb) / pb * 100 });
      if (r.dTssp245 === null && r.dTssp585 === null) return;
      r.o = o; out.push(r);
      tab.push([M[0] + (M[0] === "GISS-E2-1-G" ? " (NASA GISS)" : ""), r.dTssp245 === null ? "n/a" : sgn(r.dTssp245, 2) + " °C", r.dTssp585 === null ? "n/a" : sgn(r.dTssp585, 2) + " °C", r.dPssp245 === null ? "n/a" : sgn(r.dPssp245, 1) + "%", r.dPssp585 === null ? "n/a" : sgn(r.dPssp585, 1) + "%"]);
    });
    if (out.length < 3) throw new Error("too few climate models answered from NASA NEX-GDDP-CMIP6 (" + out.length + " of " + NEXM.length + ")");
    function st(k) { var a = out.map(function (o) { return o[k] }).filter(function (v) { return v !== null && isFinite(v) }).sort(function (x, y) { return x - y }); return a.length ? { med: U.median(a), lo: a[0], hi: a[a.length - 1], n: a.length } : null }
    var T2 = st("dTssp245"), T5 = st("dTssp585"), P2 = st("dPssp245"), P5 = st("dPssp585");
    /* yearly series: the median of the models in each scenario, with the years between the two periods left empty */
    var xs = [], m0 = [], m2 = [], m5 = [];
    for (var y = 2005; y <= 2050; y++) {
      xs.push(y);
      var col = function (sc) { var v = out.map(function (o) { var d = o.o[sc + "tas"]; return d && d[y] !== undefined ? d[y] : null }).filter(function (q) { return q !== null }).sort(function (a, b) { return a - b }); return v.length >= 3 ? U.median(v) : null };
      m0.push(y <= 2014 ? col("historical") : null); m2.push(y >= 2041 ? col("ssp245") : null); m5.push(y >= 2041 ? col("ssp585") : null);
    }
    var rng = function (S, u, d) { return S ? sgn(S.med, d) + u + " (models range " + sgn(S.lo, d) + " to " + sgn(S.hi, d) + u + ")" : "not available" };
    var cellTxt = cell ? " The models' grid cell is centred at " + fx(cell[0], 3) + "°, " + fx(cell[1] > 180 ? cell[1] - 360 : cell[1], 3) + "° (0.25° cells, about 25 km)." : "";
    var text = out.length + " climate models from NASA's NEX-GDDP-CMIP6 dataset (NASA Earth Exchange: CMIP6 models bias-corrected against observations and downscaled to 0.25°), including NASA GISS's own model GISS-E2-1-G, were read at the place straight from NASA's data server." + cellTxt +
      " Comparing 2041–2050 with 2005–2014, the median model warms by " + rng(T2, " °C", 1) + " under SSP2-4.5, a middle path for emissions, and by " + rng(T5, " °C", 1) + " under SSP5-8.5, a very high-emissions path." +
      (P2 ? " Yearly rainfall changes by " + rng(P2, "%", 0) + " under SSP2-4.5 and " + rng(P5, "%", 0) + " under SSP5-8.5." : "") +
      " The models agree more on warming than on rain. These are projections under assumed emission pathways, not forecasts.";
    return { id: "future", title: "The next 25 years: NASA climate projections to 2050 (NEX-GDDP-CMIP6)", text: text,
      figs: [{ type: "line", series: [{ xs: xs, ys: m0, label: "2005–2014, simulated (median of " + out.length + " models)", color: "#555" }, { xs: xs, ys: m2, label: "2041–2050 under SSP2-4.5 (median)", color: "#2c7fb8" }, { xs: xs, ys: m5, label: "2041–2050 under SSP5-8.5 (median)", color: "#e6550d" }], ylab: "Yearly mean temperature (°C)", d: 1 }],
      table: { head: ["Model", "Warming SSP2-4.5", "Warming SSP5-8.5", "Rain change SSP2-4.5", "Rain change SSP5-8.5"], rows: tab },
      refs: ["nexgddp"], facts: [text], section: "lt" };
  }
  var land = ["land"];
  EJD.extra = [
    { id: "air", name: "Haze and air particles since 1980", fn: air },
    { id: "no2", name: "Nitrogen dioxide pollution", fn: no2 },
    { id: "co", name: "Carbon monoxide", fn: co },
    { id: "lst", name: "How hot the ground gets", kinds: land, fn: lst },
    { id: "night", name: "Lights at night", kinds: land, fn: night },
    { id: "terrain", name: "Terrain", kinds: land, fn: terrain },
    { id: "quakes", name: "Earthquakes", fn: quakes },
    { id: "energy", name: "Sunlight and wind energy", fn: energy },
    { id: "country", name: "The country in numbers", kinds: land, fn: country },
    { id: "recent", name: "Recent hourly air quality and weather", fn: recent }
  ];
  /* the NASA projections (about 420 yearly files) start downloading in the background as soon as a research starts, and are
     collected at the end, so their few minutes overlap with the other sections */
  EJD.early = function (D) { D.__fut = future(D, null, function (m) { D.__futMsg = m }); D.__fut.catch(function () { }) };
  EJD.extra.push({ id: "future", name: "Climate projections to 2050 (NASA NEX-GDDP-CMIP6)", fn: async function (D, H, say) {
    var P = D.__fut || (D.__fut = future(D, H, function (m) { D.__futMsg = m })), iv = setInterval(function () { if (D.__futMsg && say) say(D.__futMsg) }, 2000);
    try { return await P } finally { clearInterval(iv); D.__fut = null }
  } });

  /* ------------------------------------------------------------ 3. figures in the PDF as vector drawings */
  /* EJD.draw is written for a canvas; this stand-in canvas turns its drawing calls into jsPDF vector calls */
  function pdfCanvas(doc, X0, Y0, w, h, W, H) {
    var k = w / W, st = { fill: "#000", stroke: "#000", lw: 1, font: 11, align: "left", dash: null, tx: 0, ty: 0, rot: 0, alpha: 1 }, stack = [], path = [], cur = null;
    function col(c) { c = String(c).trim(); var m; if (c[0] === "#") { if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 1] } if ((m = /rgba?\(([^)]+)\)/.exec(c))) { var p = m[1].split(",").map(Number); return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]] } return [0, 0, 0, 1] }
    function mix(c) { var a = c[3] * st.alpha; return [Math.round(255 - (255 - c[0]) * a), Math.round(255 - (255 - c[1]) * a), Math.round(255 - (255 - c[2]) * a)] }   /* on white paper */
    function P(x, y) { var c = Math.cos(st.rot), s = Math.sin(st.rot); return [X0 + (st.tx + x * c - y * s) * k, Y0 + (st.ty + x * s + y * c) * k] }
    var ctx = {
      save: function () { stack.push(JSON.parse(JSON.stringify(st))) }, restore: function () { if (stack.length) st = stack.pop() },
      translate: function (x, y) { var p = [st.tx + x * Math.cos(st.rot) - y * Math.sin(st.rot), st.ty + x * Math.sin(st.rot) + y * Math.cos(st.rot)]; st.tx = p[0]; st.ty = p[1] }, rotate: function (a) { st.rot += a }, scale: function () { },
      setLineDash: function (d) { st.dash = d && d.length ? d : null }, beginPath: function () { path = []; cur = null }, closePath: function () { if (cur && cur.length) cur.closed = true },
      moveTo: function (x, y) { cur = [P(x, y)]; path.push(cur) }, lineTo: function (x, y) { if (!cur) { cur = []; path.push(cur) } cur.push(P(x, y)) },
      arc: function (x, y, r) { path.push({ circle: P(x, y), r: r * k }) }, ellipse: function (x, y, rx, ry) { path.push({ ell: P(x, y), rx: rx * k, ry: ry * k }) },
      stroke: function () { var c = mix(col(st.stroke)); doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(Math.max(.2, st.lw * k)); doc.setLineDashPattern(st.dash ? st.dash.map(function (v) { return v * k }) : [], 0); path.forEach(function (s) { if (s.circle) { doc.circle(s.circle[0], s.circle[1], s.r, "S"); return } if (s.ell) { doc.ellipse(s.ell[0], s.ell[1], s.rx, s.ry, "S"); return } for (var i = 1; i < s.length; i++) doc.line(s[i - 1][0], s[i - 1][1], s[i][0], s[i][1]); if (s.closed && s.length > 2) doc.line(s[s.length - 1][0], s[s.length - 1][1], s[0][0], s[0][1]) }); doc.setLineDashPattern([], 0) },
      fill: function () { var c = mix(col(st.fill)); doc.setFillColor(c[0], c[1], c[2]); path.forEach(function (s) { if (s.circle) { doc.circle(s.circle[0], s.circle[1], s.r, "F"); return } if (s.length > 2) { var rel = []; for (var i = 1; i < s.length; i++) rel.push([s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]]); doc.lines(rel, s[0][0], s[0][1], [1, 1], "F", true) } }) },
      fillRect: function (x, y, w2, h2) { var c = mix(col(st.fill)), p = P(x, y); doc.setFillColor(c[0], c[1], c[2]); doc.rect(p[0], p[1], w2 * k, h2 * k, "F") },
      strokeRect: function (x, y, w2, h2) { var c = mix(col(st.stroke)), p = P(x, y); doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(Math.max(.2, st.lw * k)); doc.rect(p[0], p[1], w2 * k, h2 * k, "S") },
      clearRect: function () { }, fillText: function (t, x, y) { t = typeof L1 === "function" ? L1(t) : t; var c = mix(col(st.fill)), p = P(x, y); doc.setTextColor(c[0], c[1], c[2]); doc.setFont("helvetica", "normal"); doc.setFontSize(st.font * k); var al = st.align === "center" ? "center" : st.align === "right" || st.align === "end" ? "right" : "left";
        if (st.rot) { var ang = -st.rot / RAD, tw = doc.getTextWidth(String(t)), off = al === "center" ? -tw / 2 : al === "right" ? -tw : 0, ca = Math.cos(ang * RAD), sa = Math.sin(ang * RAD); doc.text(String(t), p[0] + off * ca, p[1] - off * sa, { angle: ang }) }
        else doc.text(String(t), p[0], p[1], { align: al }) },
      measureText: function (t) { t = typeof L1 === "function" ? L1(t) : t; doc.setFont("helvetica", "normal"); doc.setFontSize(st.font * k); return { width: doc.getTextWidth(String(t)) / k } },
      drawImage: function () { }, createLinearGradient: function () { return { addColorStop: function () { } } }
    };
    Object.defineProperty(ctx, "fillStyle", { get: function () { return st.fill }, set: function (v) { st.fill = v } });
    Object.defineProperty(ctx, "strokeStyle", { get: function () { return st.stroke }, set: function (v) { st.stroke = v } });
    Object.defineProperty(ctx, "lineWidth", { get: function () { return st.lw }, set: function (v) { st.lw = v } });
    Object.defineProperty(ctx, "globalAlpha", { get: function () { return st.alpha }, set: function (v) { st.alpha = v } });
    Object.defineProperty(ctx, "textAlign", { get: function () { return st.align }, set: function (v) { st.align = v } });
    Object.defineProperty(ctx, "font", { get: function () { return st.font + "px sans-serif" }, set: function (v) { var m = /([\d.]+)px/.exec(v); if (m) st.font = +m[1] } });
    ["imageSmoothingEnabled", "textBaseline", "lineCap", "lineJoin"].forEach(function (n) { ctx[n] = null });
    return { width: W, height: H, getContext: function () { return ctx } };
  }
  /* charts: vector; maps: an image 3 times the drawing size (crisp squares, smooth base map) */
  EJD.pdfFig = function (doc, fig, x, y, w, h) {
    if (fig.type !== "map") { var W = 1120, H = Math.round(W * h / w); EJD.draw(pdfCanvas(doc, x, y, w, h, W, H), fig, { dark: false, scale: 2 }); return true }
    /* maps go in as JPEG at about 210 dpi on a white background (the same layout as before, at 1200 instead of 1410 pixels): about a seventh of the PNG size */
    var c = document.createElement("canvas"); c.width = 1200; c.height = Math.round(1200 * h / w); EJD.draw(c, fig, { dark: false, scale: 1200 / 470 });
    var o = document.createElement("canvas"); o.width = c.width; o.height = c.height; var ox = o.getContext("2d"); ox.fillStyle = "#ffffff"; ox.fillRect(0, 0, o.width, o.height); ox.drawImage(c, 0, 0);
    doc.addImage(o.toDataURL("image/jpeg", .9), "JPEG", x, y, w, h, undefined, "FAST"); return true;
  };
})();
