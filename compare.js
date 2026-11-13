/* Earth Jukebox: Compare mode (for research).
   One place, two years, side by side:
   - pictures: NASA/USGS Landsat Collection 2 surface reflectance (30 m, 1982 onwards), read through Microsoft's Planetary Computer;
   - climate numbers: NASA POWER daily (1981 onwards) at the place; years before 1981 use ERA5 (ECMWF) through Open-Meteo,
     and then BOTH years use ERA5, so the two years always come from the same source;
   - the music of each year follows its days (a red line runs across the picture as it plays); "Difference" plays After minus Before.
   No SI is used unless the visitor asks for an SI overview (one chat question). */
(function () {
var $ = function (id) { return document.getElementById(id) };
var PC = "https://planetarycomputer.microsoft.com/api";
var CF = "gamma RGB 2.7, saturation 1.5, sigmoidal RGB 15 0.55";
var CYR = new Date().getFullYear(), LASTY = CYR - 1, FIRSTY = 1940, PICY = 1982;
var C = { place: null, data: null, len: 60000, play: null, sugT: 0, sugTok: 0, ovTok: 0 };
var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
function f1(v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (+v).toFixed(d === undefined ? 1 : d) }
function sg(v, d) { if (v === null || v === undefined || !isFinite(v)) return "n/a"; var t = (+v).toFixed(d === undefined ? 1 : d); if (+t === 0) return t.replace("-", ""); return (v > 0 ? "+" : "") + t }
function mean(a) { var s = 0, n = 0; a.forEach(function (v) { if (v !== null && v !== undefined && isFinite(v)) { s += v; n++ } }); return n ? s / n : null }
function cl(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
async function getJSON(u, opt, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 25000); try { var r = await fetch(u, Object.assign({ signal: ac.signal }, opt || {})); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json() } finally { clearTimeout(tm) } }
async function getBmp(u, ms) { for (var k = 0; k < 2; k++) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 14000); try { var r = await fetch(u + (k ? "&retry=" + k : ""), { signal: ac.signal }); if (r.status === 204 || r.status === 404) return null; if (!r.ok) throw new Error("HTTP " + r.status); return await createImageBitmap(await r.blob()) } catch (e) { await wait(400) } finally { clearTimeout(tm) } } return null }

/* ---------------- page parts ---------------- */
function inject() {
 var css = document.createElement("style");
 css.textContent = "#cmpb{background:rgba(8,11,16,.85);color:var(--amber);border:1px solid var(--amber);padding:8px 14px;font-size:13px;width:auto}#cmpb:hover{background:var(--amber);color:#1a1205}body.moon #cmpb{display:none}" +
  "#cmp{position:fixed;inset:12px;z-index:20;background:linear-gradient(180deg,#121823,#0a0e14);border:1px solid #6b5426;border-radius:10px;box-shadow:0 18px 60px rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;color:var(--bone)}#cmp[hidden]{display:none}" +
  "#cmp>header{display:flex;align-items:center;gap:14px;padding:10px 16px;border-bottom:1px solid #2a3240;background:linear-gradient(180deg,#1b2230,#121822)}#cmp>header b{font:600 18px/1.2 'Iowan Old Style',Georgia,serif;color:var(--amber)}#cmp>header span{color:var(--mute);font-size:12.5px;flex:1}#cmpx{width:auto;background:transparent;border:0;color:var(--bone);font-size:24px;padding:0 6px;cursor:pointer}" +
  "#cmpbody{overflow-y:auto;padding:14px 18px 30px;flex:1}" +
  ".cmpset{display:grid;grid-template-columns:minmax(220px,2.2fr) repeat(4,minmax(110px,1fr)) auto;gap:10px;align-items:end}.cmpset label{display:block;font-size:12px;color:var(--mute);margin-bottom:4px}.cmpset input,.cmpset select{width:100%}" +
  ".cmpq{position:relative}#cmps{position:absolute;left:0;right:0;top:100%;z-index:5;list-style:none;margin:2px 0 0;padding:0;background:#0d1219;border:1px solid #3a4250;max-height:300px;overflow-y:auto}#cmps[hidden]{display:none}#cmps li{padding:7px 10px;cursor:pointer;font-size:13.5px;border-bottom:1px solid #1d2430}#cmps li small{color:var(--mute);margin-left:6px}#cmps li.on,#cmps li:hover{background:var(--amber);color:#1a1205}#cmps li.on small,#cmps li:hover small{color:#3a2a08}" +
  "#cmpgo{width:auto;padding:9px 16px}#cmpsel{font-size:12.5px;color:var(--sage);margin:6px 0 0;min-height:1em}#cmpst{font-size:13px;color:var(--amber);margin:10px 0 0;min-height:1.2em}.cmpnote{font-size:12px;color:var(--mute);margin:6px 0 0;line-height:1.5}" +
  "#cmpr[hidden]{display:none}.cmptools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0 10px}.cmptools button{width:auto;padding:6px 12px;font-size:12.5px}#cmplened{display:inline-flex;gap:6px;align-items:center}#cmplened[hidden]{display:none}#cmplened input{width:80px}#cmplened select{width:auto}" +
  ".cmpgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.cmpempty[hidden]{display:none!important}.cmpchart{min-width:0}.cmpcard{background:#0d121a;border:1px solid #232b37;border-radius:12px;padding:12px}.cmpimg{position:relative;border-radius:8px;overflow:hidden;background:#05070a;aspect-ratio:4/3}.cmpimg canvas{width:100%;height:100%;display:block}" +
  ".cmpchip{position:absolute;left:10px;top:10px;background:rgba(0,0,0,.65);color:#fff;font-size:12.5px;padding:3px 10px;border-radius:12px;z-index:2}.cmpline{position:absolute;top:0;bottom:0;width:2px;background:#ff3b3b;box-shadow:0 0 6px #ff3b3b;left:0;z-index:2;pointer-events:none}.cmpempty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:var(--mute);font-size:13px}" +
  ".cmpcap{font-size:12px;color:var(--mute);margin:6px 0 8px;line-height:1.45;min-height:2.9em}.cmpctl{display:flex;gap:12px;align-items:center}.cmpplay{width:46px;height:46px;min-width:46px;border-radius:50%;padding:0;font-size:17px;background:#7fa8f0;color:#0a1020;border:0;cursor:pointer}.cmpplay.on{background:var(--amber)}.cmpplay:disabled{opacity:.4;cursor:default}" +
  ".cmpchart{flex:1;height:64px;cursor:pointer}.cmptime{font-size:12px;color:var(--mute);min-width:76px;text-align:right}.cmptitle{font:600 16px/1.3 'Iowan Old Style',Georgia,serif;margin:10px 0 2px}" +
  ".cmpdiff{margin-top:16px}.cmpsec{font:600 17px/1.3 'Iowan Old Style',Georgia,serif;color:var(--amber);margin:22px 0 8px}" +
  "#cmptab{width:100%;border-collapse:collapse;font-size:13px}#cmptab th,#cmptab td{padding:6px 8px;border-bottom:1px solid #232b37;text-align:right}#cmptab th:first-child,#cmptab td:first-child{text-align:left;color:var(--mute)}#cmptab thead th{color:var(--amber);font-weight:600}#cmptab tr.grp td{color:var(--bone);font-weight:600;padding-top:12px;text-align:left}" +
  ".cmpcharts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.cmpcharts figure{margin:0;background:#0d121a;border:1px solid #232b37;border-radius:10px;padding:10px}.cmpcharts figcaption{font-size:12.5px;color:var(--bone);margin-bottom:6px}.cmpcharts canvas{width:100%;height:170px}" +
  "#cmpdeepbox h4{margin:14px 0 4px;font-size:14px;color:var(--amber)}#cmpdeepbox p{margin:0 0 8px;line-height:1.5}#cmpdeepbox .dfig{display:flex;flex-wrap:wrap;gap:10px;margin:6px 0}#cmpdeepbox canvas{width:100%;max-width:520px;height:auto;border-radius:6px}#cmpdeepbox table{border-collapse:collapse;font-size:12px;margin:6px 0 10px;width:100%}#cmpdeepbox td,#cmpdeepbox th{border:1px solid rgba(255,255,255,.12);padding:3px 6px;text-align:left;vertical-align:top}#cmpdeepbox .dsc{overflow-x:auto}#cmpdeepbox .dref{font-size:12px;color:var(--mute)}#cmpdeepbox .dref a{color:var(--amber)}" +
  "#cmpnotes{font-size:12.5px;color:var(--mute);line-height:1.55;padding-left:18px}#cmpov{margin-top:8px}#cmpovbox p{margin:0 0 10px}#cmpovbox ul{margin:0 0 10px 18px}.cmpsrc{font-size:12.5px;margin:4px 0 10px 18px}.cmpsrc a{color:var(--amber)}#cmpovbox{background:#0d121a;border:1px solid #232b37;border-radius:10px;padding:12px 14px;margin-top:10px;font-size:14px;line-height:1.6}#cmpovbox[hidden]{display:none}" +
  "#cmpask{position:fixed;inset:0;z-index:25;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#cmpask[hidden]{display:none}#cmpask>div{background:#121823;border:1px solid var(--amber);padding:20px 22px;max-width:440px;border-radius:10px}#cmpask p{margin:0 0 14px;font-size:14px;line-height:1.5}#cmpask button{width:auto;margin-right:8px}" +
  ".cmpleg{display:flex;gap:14px;font-size:11.5px;color:var(--mute);margin:4px 0 0}.cmpleg i{display:inline-block;width:12px;height:3px;vertical-align:middle;margin-right:4px}" +
  "@media(max-width:900px){.cmpset{grid-template-columns:1fr 1fr}.cmpset .cmpq{grid-column:1/-1}.cmpgrid,.cmpcharts{grid-template-columns:1fr}}";
 document.head.appendChild(css);
 var dj = $("djb"), b = document.createElement("button");
 b.id = "cmpb"; b.type = "button"; b.textContent = "Compare"; b.title = "Compare one place in two different years (pictures, data and music)";
 if (dj && dj.parentNode) dj.parentNode.insertBefore(b, dj); else document.body.appendChild(b);
 var d = document.createElement("div");
 d.innerHTML = '<section id="cmp" role="dialog" aria-modal="true" aria-labelledby="cmph" hidden><header><b id="cmph">Compare</b><span>One place, two years: pictures, NASA data and music, side by side. Made for research.</span><button id="cmpx" type="button" aria-label="Close Compare">&times;</button></header><div id="cmpbody">' +
  '<div class="cmpset"><div class="cmpq"><label for="cmpqi">Place (city, district, lake, river, coast, sea…)</label><input id="cmpqi" type="text" autocomplete="off" placeholder="Search any place, e.g. Aral Sea, Gulshan Lake, Sundarbans" aria-autocomplete="list" aria-controls="cmps"><ul id="cmps" role="listbox" hidden></ul></div>' +
  '<div><label for="cmpy1">Before (year)</label><input id="cmpy1" type="number" min="' + FIRSTY + '" max="' + LASTY + '" value="1990"></div>' +
  '<div><label for="cmpy2">After (year)</label><input id="cmpy2" type="number" min="' + FIRSTY + '" max="' + LASTY + '" value="' + Math.min(LASTY, 2020) + '"></div>' +
  '<div><label for="cmpa">Area shown</label><select id="cmpa"><option value="0">Fit the place</option><option value="1">1 km</option><option value="2">2 km</option><option value="5">5 km</option><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option><option value="250">250 km (MODIS, 2000 on)</option><option value="500">500 km (MODIS, 2000 on)</option><option value="1000">1,000 km (MODIS, 2000 on)</option><option value="2000">2,000 km (MODIS, 2000 on)</option></select></div>' +
  '<div><label for="cmpm">Picture season</label><select id="cmpm"><option value="1-12">Clearest of the year</option><option value="1-3">Jan–Mar</option><option value="4-6">Apr–Jun</option><option value="7-9">Jul–Sep</option><option value="10-12">Oct–Dec</option></select></div>' +
  '<div><button id="cmpgo" type="button">Set up comparison</button></div></div>' +
  '<p id="cmpsel"></p><p class="cmpnote">Pictures: NASA/USGS Landsat, 30 m, from 1982. Climate numbers: NASA POWER daily, from 1981; for years before 1981 both years use the ERA5 reanalysis (ECMWF), back to 1940, so the two years are always measured the same way. Climate numbers describe the area around the place (a grid cell of about 25 to 55 km), not the exact spot; the pictures show the place itself.</p><p id="cmpst" aria-live="polite"></p>' +
  '<div id="cmpr" hidden><div class="cmptools"><button id="cmplen" type="button">Music length: 1 min</button><span id="cmplened" hidden><input id="cmplenv" type="number" min="0.1" step="0.5" value="1" aria-label="Music length"><select id="cmplenu" aria-label="Unit"><option value="60000">minutes</option><option value="3600000">hours</option></select><button id="cmplenok" type="button">Apply</button></span><span class="cmpnote" style="margin:0">Each year is one full year of days; the music lasts this long and keeps its own pace.</span></div>' +
  '<div class="cmpgrid">' + card("b", "Before") + card("a", "After") + '</div>' +
  '<div class="cmpcard cmpdiff"><div class="cmptitle">Difference: After minus Before</div><div id="cmpverdict" style="margin:6px 0 8px;font-size:13.5px"></div><p class="cmpcap" id="cmpcapd">The music plays After against Before day by day: the weather of each day (cooler or wetter than normal is brighter, hotter or drier is darker), shifted darker or brighter by the year-wide verdict above, so lost water or plants, more heat extremes or dirtier air are heard too.</p><div class="cmpctl"><button class="cmpplay" id="cmppd" type="button" aria-label="Play the difference">&#9654;</button><canvas class="cmpchart" id="cmpgd"></canvas><span class="cmptime" id="cmptd">0s / 60s</span></div><div class="cmpleg"><span><i style="background:#ff6b5a"></i>After warmer</span><span><i style="background:#6fb3ff"></i>After cooler</span><span><i style="background:#ff3b3b;width:2px;height:10px"></i>Now playing</span></div></div>' +
  '<div class="cmpsec">The data, year by year</div><table id="cmptab"></table>' +
  '<div class="cmpsec">By month</div><div class="cmpcharts"><figure><figcaption>Average temperature (°C)</figcaption><canvas id="cmpc1"></canvas></figure><figure><figcaption>Rainfall (mm per month)</figcaption><canvas id="cmpc2"></canvas></figure><figure><figcaption>After minus Before, temperature (°C)</figcaption><canvas id="cmpc3"></canvas></figure></div>' +
  '<div class="cmpleg" style="margin-top:8px"><span><i style="background:#7fa8f0"></i><b id="cmpLegB">Before</b></span><span><i style="background:#e0a43a"></i><b id="cmpLegA">After</b></span></div>' +
  '<div class="cmpsec">Sources and limits</div><ul id="cmpnotes"></ul>' +
  '<div class="cmpsec">In-depth research</div><p class="cmpnote">Goes beyond the two years: the full daily weather record of this place since 1950 (ERA5) with trend and change-point tests and climate-extreme counts, then research chosen for the kind of place it is: greenness and land-cover change maps from NASA satellites, sea level, salinity and sea temperature for coasts, mangroves and seas, river flow, dust for deserts, people and heat for cities, and threatened species from GBIF, OBIS and the IUCN Red List. Everything comes from free public scientific data; it takes about 20 to 25 minutes and uses no SI questions. The PDF report includes it. To see a finished one straight away, load the example.</p><button id="cmpdeep" type="button">Run in-depth research</button> <button id="cmpdemo" type="button">See a finished example instantly (Dhaka)</button><span class="cmpnote" id="cmpdeepst" style="margin-left:10px" aria-live="polite"></span><div id="cmpdeepbox"></div>' +
  '<div class="cmpsec">Natural events</div><p class="cmpnote">Storms, floods, wildfires, volcanoes, earthquakes and other natural events that came within 500 km of this place since 2000, from NASA\'s Earth Observatory Natural Event Tracker (EONET): a map of their tracks, a year-by-year chart, a table, a short piece of music and a PDF report. Takes a few seconds; the same section is included in the in-depth research report.</p><button id="cmpev" type="button">Analyse natural events</button><span class="cmpnote" id="cmpevst" style="margin-left:10px" aria-live="polite"></span><div id="cmpevbox"></div>' +
  '<div class="cmpsec">SI rhythms: how the SI learns this place</div><p class="cmpnote">The Super Intelligence trains a small model on NASA POWER\'s monthly record of this place (1981 to last year): it finds the place\'s own repeating cycles, keeps only those that beat shuffled copies of the same data, tests itself on the last five years it never saw, and points out the months NASA measured far from what it expected. The cycles become harmony you can hear. It starts by itself once the comparison is ready, runs in your browser in about a second, uses no SI questions, and never replaces NASA\'s numbers.</p><span class="cmpnote" id="cmpsist" aria-live="polite"></span><div id="cmpsibox"></div>' +
  '<div class="cmpsec">Research report</div><p class="cmpnote">A formal PDF report of this comparison: study area, data and methods, every number above, statistical tests (paired differences with autocorrelation-corrected significance, effect sizes, distribution tests), monthly and seasonal tables, extremes, the pictures, the overall assessment, limitations and full references. The SI research essay is added as an appendix if you have generated it.</p><button id="cmppdf" type="button">Download research report (PDF)</button><span class="cmpnote" id="cmppdfst" style="margin-left:10px"></span>' +
  '<div class="cmpsec">SI overview</div><p class="cmpnote">Optional. The Super Intelligence (SI) reads every number above, looks up published research about this place and these years, and writes a research essay: what changed, the possible causes (climate patterns, greenhouse gases, air pollution, land use, fires, storms and other events), and what the data can and cannot show. It takes up to a minute and uses one of your chat questions.</p><button id="cmpov" type="button">Generate SI overview</button><div id="cmpovbox" hidden></div>' +
  '</div></div></section><div id="cmpask" hidden><div role="alertdialog" aria-labelledby="cmpaskt"><p id="cmpaskt">Would you like to generate an SI overview of the data here?<br><b>Warning:</b> this uses one of your chat questions with the SI Assistant.</p><button id="cmpasky" type="button">Yes, generate</button><button id="cmpaskn" type="button" class="alt">No</button></div></div>';
 while (d.firstChild) document.body.appendChild(d.firstChild);
 function card(k, t) {
  return '<div class="cmpcard"><div class="cmpimg" id="cmpi' + k + '"><span class="cmpchip" id="cmpk' + k + '">' + t + '</span><canvas id="cmpv' + k + '" width="1280" height="960"></canvas><div class="cmpline" id="cmpl' + k + '"></div><div class="cmpempty" id="cmpe' + k + '" hidden></div></div>' +
   '<p class="cmpcap" id="cmpcap' + k + '"></p><div class="cmpctl"><button class="cmpplay" id="cmpp' + k + '" type="button" aria-label="Play ' + t + '">&#9654;</button><canvas class="cmpchart" id="cmpg' + k + '"></canvas><span class="cmptime" id="cmpt' + k + '">0s / 60s</span></div>' +
   '<div class="cmpleg"><span><i style="background:' + (k === "b" ? "#7fa8f0" : "#e0a43a") + '"></i>Temperature (7-day average)</span><span><i style="background:#3d6fa8;height:8px"></i>Rain</span></div></div>';
 }
 b.addEventListener("click", open);
 $("cmpx").addEventListener("click", close);
 $("cmpqi").addEventListener("input", suggest);
 $("cmpqi").addEventListener("keydown", sugKey);
 $("cmpgo").addEventListener("click", setup);
 /* After must be later than Before */
 var yl = function () { var a = +$("cmpy1").value, b = +$("cmpy2").value; $("cmpy2").min = String(Math.min(LASTY, (a || FIRSTY) + 1)); $("cmpy1").max = String(Math.max(FIRSTY, (b || LASTY + 1) - 1)) };
 $("cmpy1").addEventListener("change", yl); $("cmpy2").addEventListener("change", yl); yl();
 ["b", "a", "d"].forEach(function (k) { $("cmpp" + k).addEventListener("click", function () { toggle(k) }); $("cmpg" + k).addEventListener("click", function (e) { seek(k, e) }) });
 $("cmplen").addEventListener("click", function () { var e = $("cmplened"); e.hidden = !e.hidden; if (!e.hidden) $("cmplenv").focus() });
 $("cmplenok").addEventListener("click", setLen);
 $("cmplenv").addEventListener("keydown", function (e) { if (e.key === "Enter") setLen() });
 $("cmpov").addEventListener("click", function () { $("cmpask").hidden = false; $("cmpasky").focus() });
 $("cmpdeep").addEventListener("click", function () { deep(false).catch(function (e) { $("cmpdeepst").textContent = "The in-depth research could not be made: " + (e.message || e) }) });
 $("cmppdf").addEventListener("click", function () { if (window.EJR && EJR.pdf) EJR.pdf(); else $("cmppdfst").textContent = "The report maker has not loaded yet; try again in a moment." });
 $("cmpaskn").addEventListener("click", function () { $("cmpask").hidden = true });
 $("cmpasky").addEventListener("click", function () { $("cmpask").hidden = true; overview() });
 document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("cmp").hidden) { if (!$("cmpask").hidden) $("cmpask").hidden = true; else if (!$("cmps").hidden) $("cmps").hidden = true; else close() } });
 window.addEventListener("resize", function () { if (C.data) drawAll() });
}
function status(t) { $("cmpst").textContent = t || "" }
function open(quiet) { if (window.tplaying && typeof stopPlay === "function") stopPlay(); if (window.playing && !C.play) $("play").click(); $("cmp").hidden = false; if (quiet === true) return; setTimeout(function () { $(C.place ? "cmpgo" : "cmpqi").focus() }, 30) }
function close(quiet) { stopPlay2(); $("cmp").hidden = true; $("cmps").hidden = true; if (quiet !== true) try { $("cmpb").focus() } catch (e) {} }

/* ---------------- 1. place search (OpenStreetMap: Photon as you type, Nominatim on Enter; seas from the site's own list) ---------------- */
var SUG = [], SUGI = -1;
/* only places and landmarks: towns, districts, natural features, water, parks and reserves, and famous structures (towers, bridges, dams, monuments).
   Shops, clubs, cafes, roads, stations, museums and other small points are left out. */
var KEEP_PLACE = /^(country|state|region|province|county|district|municipality|city|town|village|suburb|borough|quarter|neighbourhood|locality|island|islet|archipelago|hamlet|ocean|sea)$/;
function bbKm(x) { if (!x.bb) return 0; return Math.max(Math.abs(x.bb[1] - x.bb[0]) * 111.32, Math.abs(x.bb[3] - x.bb[2]) * 111.32 * Math.cos(x.lat * Math.PI / 180)) }
function keepPlace(x) {
 if (x.src === "w") return true;
 var c = String(x.cls || ""), t = String(x.type || ""), n = String(x.name || ""), big = bbKm(x);
 if (!n) return false;
 if (c === "place") return KEEP_PLACE.test(t);
 if (/^(natural|water)$/.test(c)) return !/^(tree|tree_row|shrub|stone|rock|spring)$/.test(t);
 if (c === "waterway") return /^(river|canal|riverbank|dam|weir|waterfall)$/.test(t);
 if (c === "boundary") return /^(administrative|national_park|protected_area|historic)$/.test(t);
 if (c === "landuse") return /^(forest|reservoir|basin|salt_pond|farmland|meadow|orchard|aquaculture|vineyard|plantation)$/.test(t) && big >= .5;
 if (c === "leisure") return t === "nature_reserve" || (/^(park|garden)$/.test(t) && big >= 1);
 if (c === "man_made") return /^(tower|dam|bridge|lighthouse|breakwater|dyke|pier)$/.test(t) && !!x.bb;
 if (c === "bridge") return !!x.bb;
 if (c === "historic") return /^(monument|castle|tomb|fort|archaeological_site|ruins|city_gate|palace|citywalls|pyramid)$/.test(t) && !!x.bb;
 if (c === "tourism") return /^(attraction|theme_park|zoo)$/.test(t) && big >= .15;
 if (c === "aeroway") return t === "aerodrome" && big >= 1;
 return false;
}
/* Open-Meteo geocoding (GeoNames), used while typing when Photon cannot be reached. Its feature codes are mapped to the OpenStreetMap kinds keepPlace() understands. */
var OM_ALIAS = { "usa": "United States", "us": "United States", "u.s.": "United States", "u.s.a.": "United States", "america": "United States", "uk": "United Kingdom", "u.k.": "United Kingdom", "uae": "United Arab Emirates", "drc": "Democratic Republic of the Congo" };
var OM_KIND = [[/^PCL/, "place", "country"], [/^ADM1/, "place", "state"], [/^ADM2/, "place", "district"], [/^ADM[34]/, "place", "municipality"], [/^PPL(C|A)$/, "place", "city"], [/^PPL/, "place", "town"],
 [/^ISLS?$/, "place", "island"], [/^(LK|LKS|RSV|LGN)$/, "natural", "water"], [/^STM/, "waterway", "river"], [/^(SEA|OCN|BAY|GULF|STRT)$/, "natural", "bay"], [/^(MT|MTS|PK|PKS|HLL|HLLS|VLC)$/, "natural", "peak"],
 [/^DSRT$/, "natural", "desert"], [/^FRST$/, "natural", "wood"], [/^(GLCR)$/, "natural", "glacier"], [/^(PRK|RESN|RESF)$/, "boundary", "protected_area"], [/^DLTA$/, "natural", "wetland"], [/^(MRSH|SWMP|WTLD)$/, "natural", "wetland"]];
function fold(t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() }
async function omPlaces(q) {
 var qq = OM_ALIAS[q.toLowerCase()] || q, c = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (c) c.abort() }, 8000);
 try { var r = await fetch("https://geocoding-api.open-meteo.com/v1/search?count=10&language=en&name=" + encodeURIComponent(qq), { signal: c ? c.signal : undefined }); if (!r.ok) throw new Error("HTTP " + r.status); var j = await r.json() } finally { clearTimeout(tm) }
 return ((j && j.results) || []).map(function (x) { var k = null; OM_KIND.some(function (m) { if (m[0].test(String(x.feature_code || ""))) { k = m; return true } return false }); if (!k) return null;
  return { lat: +x.latitude, lon: +x.longitude, name: x.name, full: [x.name, x.admin2, x.admin1, x.country].filter(function (v, i, a) { return v && a.indexOf(v) === i }).join(", "), cls: k[1], type: k[2], bb: null, src: "o" } }).filter(function (x) { return x && isFinite(x.lat) && isFinite(x.lon) && fold(x.name).indexOf(fold(qq).slice(0, 4)) >= 0 });   /* GeoNames also matches old official names (Brazil for "United States") */
}
/* Photon (OpenStreetMap) while typing; Nominatim (OpenStreetMap) only for a full search (Enter), as its rules ask. Results are kept for the visit. */
var PCACHE = {};
async function findPlaces(q, full) {
 q = String(q || "").trim(); var key = (full ? "f:" : "p:") + q.toLowerCase(); if (PCACHE[key]) return PCACHE[key];
 var out = [], phoOk = true;
 try { var w = window.geoWater && geoWater([q]); if (w) out.push(w.hit) } catch (e) {}
 /* Photon gets 4 s; if it is slow or down, Open-Meteo's geocoder (GeoNames places, countries, lakes, rivers, mountains) answers instead */
 try { var p = await Promise.race([geoPho(q, null, "&limit=10"), new Promise(function (_, no) { setTimeout(function () { no(new Error("slow")) }, 4000) })]); out = out.concat(p) } catch (e) { phoOk = false }
 if (!phoOk) { try { out = out.concat(await omPlaces(q)); phoOk = true } catch (e) {} }
 if (full && !out.filter(keepPlace).length) { try { var j = await geoGet("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&accept-language=en&q=" + encodeURIComponent(q), true);
  out = out.concat((j || []).map(function (x) { var b = x.boundingbox; return { lat: +x.lat, lon: +x.lon, name: x.name || String(x.display_name || "").split(",")[0], full: String(x.display_name || ""), cls: x.category || x.class || "", type: x.type || "", bb: b ? [+b[0], +b[1], +b[2], +b[3]] : null, src: "n" } }).filter(function (x) { return isFinite(x.lat) && isFinite(x.lon) })) } catch (e) {} }
 out = out.filter(keepPlace);
 /* OpenStreetMap's own order comes first (it puts the best-known place first: the Eiffel Tower in Paris before a Canadian peak of the same name);
    an exact name match, a known outline, and natural features or named places only break near-ties; the site's own sea list always leads */
 var qq = q.toLowerCase(), sc = function (x, i) { var c = String(x.cls || ""), n = String(x.name || "").toLowerCase(); return (x.src === "w" ? -100 : 0) + i + (n === qq ? 0 : 3) + (x.bb ? 0 : .5) - (/^(natural|water|waterway|place|boundary)$/.test(c) ? .4 : 0) };
 out = out.map(function (x, i) { return { x: x, s: sc(x, i) } }).sort(function (p, r) { return p.s - r.s }).map(function (o) { return o.x });
 var seen = {}, res = out.filter(function (x) { var k = String(x.name).toLowerCase() + "|" + Math.round(x.lat * 10) + "," + Math.round(x.lon * 10); if (seen[k]) return false; seen[k] = 1; return true }).slice(0, 9);
 res.searchFailed = !phoOk && !res.length; if (res.length) PCACHE[key] = res; return res;
}
function suggest() {
 clearTimeout(C.sugT); var q = $("cmpqi").value.trim(); C.place = null; $("cmpsel").textContent = "";
 if (q.length < 2) { $("cmps").hidden = true; return }
 C.sugT = setTimeout(async function () {
  var tk = ++C.sugTok, list = await findPlaces(q);
  if (tk !== C.sugTok) return;
  SUG = list; SUGI = -1; renderSug(); status(list.searchFailed ? "Suggestions are not available right now. Press Enter to search for " + q + "." : list.length ? "" : "No quick suggestions for " + q + ". Press Enter to search OpenStreetMap.");
 }, 300);
}
function placeKind(x) { var t = String(x.type || x.cls || "").replace(/_/g, " "); if (t === "yes" || t === "house" || t === "other") t = String(x.cls || "").replace(/_/g, " "); return t && t !== "yes" ? t : "" }
function renderSug() {
 var ul = $("cmps"); ul.innerHTML = "";
 if (!SUG.length) { ul.hidden = true; return }
 SUG.forEach(function (x, i) { var li = document.createElement("li"); li.setAttribute("role", "option"); if (i === SUGI) li.className = "on"; var rest = String(x.full || "").split(",").slice(1).join(",").trim(); li.innerHTML = esc(x.name) + "<small>" + esc([placeKind(x), rest].filter(Boolean).join(" · ")) + "</small>"; li.addEventListener("mousedown", function (e) { e.preventDefault(); pick(x) }); ul.appendChild(li) });
 ul.hidden = false;
}
async function sugKey(e) {
 if (e.key === "ArrowDown" && SUG.length) { e.preventDefault(); SUGI = Math.min(SUG.length - 1, SUGI + 1); renderSug(); return }
 if (e.key === "ArrowUp" && SUG.length) { e.preventDefault(); SUGI = Math.max(0, SUGI - 1); renderSug(); return }
 if (e.key === "Enter") {
  e.preventDefault();
  if (SUGI >= 0 && SUG[SUGI]) { pick(SUG[SUGI]); return }
  var q = $("cmpqi").value.trim(); if (!q) return;
  status("Searching OpenStreetMap for " + q + "…");
  try { var fl = await findPlaces(q, true); if (fl.length) { SUG = fl; SUGI = -1; if (fl.length > 1) { renderSug(); status("Pick one of the places found."); } else { pick(fl[0]); status("") } return } var r = await geoFind([q]); if (r && r.hit) { pick(r.hit); status("") } else status("No place called " + q + " was found. Try another spelling or add the city or country.") } catch (er) { status("The place search could not be reached. Check the connection and try again.") }
 }
}
function pick(x, quiet) {
 C.place = { name: x.name, full: x.full || x.name, lat: +x.lat, lon: +x.lon, bb: x.bb || null, kind: placeKind(x) };
 $("cmpqi").value = x.name; $("cmps").hidden = true; SUG = [];
 $("cmpsel").textContent = "Selected: " + (x.full || x.name) + " (" + Math.abs(x.lat).toFixed(3) + "° " + (x.lat < 0 ? "S" : "N") + ", " + Math.abs(x.lon).toFixed(3) + "° " + (x.lon < 0 ? "W" : "E") + ")";
 if (quiet !== true) $("cmpgo").focus();
}

/* ---------------- 2. climate numbers ---------------- */
function n0(v) { return v === undefined || v === null || v <= -900 ? null : v }
async function powerDaily(lat, lon, y) {
 var j = await getJSON("https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN,WS10M_MAX,CLOUD_AMT,GWETROOT,T2MDEW,AOD_55&community=AG&longitude=" + lon.toFixed(4) + "&latitude=" + lat.toFixed(4) + "&start=" + y + "0101&end=" + y + "1231&format=JSON", null, 40000);
 var p = j.properties.parameter, days = [], g = function (n, k) { return p[n] ? n0(p[n][k]) : null };   /* some POWER parameters start later than 1981 (sunshine: 1984) */
 Object.keys(p.T2M).sort().forEach(function (k) { if (k.slice(4) === "0229") return; days.push({ d: k.slice(0, 4) + "-" + k.slice(4, 6) + "-" + k.slice(6), t: g("T2M", k), tx: g("T2M_MAX", k), tn: g("T2M_MIN", k), pr: g("PRECTOTCORR", k), rh: g("RH2M", k), ws: g("WS2M", k), sw: g("ALLSKY_SFC_SW_DWN", k) === null ? null : p.ALLSKY_SFC_SW_DWN[k] / 3.6, wx: p.WS10M_MAX ? n0(p.WS10M_MAX[k]) : null, cl: p.CLOUD_AMT ? n0(p.CLOUD_AMT[k]) : null, soil: p.GWETROOT ? n0(p.GWETROOT[k]) : null, td: p.T2MDEW ? n0(p.T2MDEW[k]) : null, aod: p.AOD_55 ? n0(p.AOD_55[k]) : null }) /* AG community gives MJ/m² a day; 3.6 MJ = 1 kWh */ });
 return days;
}
async function era5Daily(lat, lon, start, end, full) {
 var v = full ? "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_mean,shortwave_radiation_sum,wind_gusts_10m_max,cloud_cover_mean,dew_point_2m_mean,soil_moisture_0_to_100cm_mean" : "temperature_2m_mean,precipitation_sum";
 var j = await getJSON("https://archive-api.open-meteo.com/v1/archive?latitude=" + lat.toFixed(4) + "&longitude=" + lon.toFixed(4) + "&start_date=" + start + "&end_date=" + end + "&daily=" + v + "&wind_speed_unit=ms&timezone=UTC", null, 45000);
 var d = j.daily || {}, days = [];
 (d.time || []).forEach(function (t, i) { if (t.slice(5) === "02-29") return; days.push({ d: t, t: d.temperature_2m_mean[i], tx: full ? d.temperature_2m_max[i] : null, tn: full ? d.temperature_2m_min[i] : null, pr: d.precipitation_sum[i], rh: full && d.relative_humidity_2m_mean ? d.relative_humidity_2m_mean[i] : null, ws: full && d.wind_speed_10m_mean ? d.wind_speed_10m_mean[i] : null, sw: full && d.shortwave_radiation_sum && d.shortwave_radiation_sum[i] !== null ? d.shortwave_radiation_sum[i] / 3.6 : null,
  wx: full && d.wind_gusts_10m_max ? d.wind_gusts_10m_max[i] : null, cl: full && d.cloud_cover_mean ? d.cloud_cover_mean[i] : null, td: full && d.dew_point_2m_mean ? d.dew_point_2m_mean[i] : null, soil: full && d.soil_moisture_0_to_100cm_mean ? d.soil_moisture_0_to_100cm_mean[i] : null, aod: null }) });
 return days;
}
/* monthly normals (1981-2010) of temperature and rain (mm/day) */
function normalsFromMonthly(rows) { var t = [], p = []; for (var m = 1; m <= 12; m++) { var r = rows.filter(function (x) { return x.m === m && x.y >= 1981 && x.y <= 2010 }); t[m] = mean(r.map(function (x) { return x.t })); p[m] = mean(r.map(function (x) { return x.pr })) } return { t: t, p: p } }
function normalsFromDaily(days) { var t = [], p = []; for (var m = 1; m <= 12; m++) { var r = days.filter(function (x) { return +x.d.slice(5, 7) === m }); t[m] = mean(r.map(function (x) { return x.t })); p[m] = mean(r.map(function (x) { return x.pr })) } return { t: t, p: p } }
function roll7(a) { return a.map(function (_, i) { return mean(a.slice(Math.max(0, i - 3), i + 4)) }) }
function sdv(a) { var m = mean(a), v = a.filter(function (x) { return x !== null && isFinite(x) }); return v.length > 2 ? Math.sqrt(mean(v.map(function (x) { return (x - m) * (x - m) }))) || 1 : 1 }
/* music: each day's state against this place's normal for that month (7-day averages): cooler and wetter = brighter, as in the site's land modes */
function scores(Y, N, sdT, sdP) { var tt = roll7(Y.days.map(function (x) { return x.t })), pp = roll7(Y.days.map(function (x) { return x.pr })); return Y.days.map(function (x, i) { var m = +x.d.slice(5, 7), at = tt[i] === null ? null : tt[i] - N.t[m], ap = pp[i] === null ? null : pp[i] - N.p[m]; if (at === null) return null; var zt = at / sdT, zp = ap === null ? 0 : ap / sdP; return cl(.5 - .5 * (.65 * zt - .35 * zp) / 2.5, .04, .96) }) }
function stats(days, N) {
 var g = function (k) { return days.map(function (x) { return x[k] }) }, t = g("t"), tx = g("tx"), tn = g("tn"), pr = g("pr");
 var hot = null, cold = null, wet = null; days.forEach(function (x) { if (x.tx !== null && (!hot || x.tx > hot.tx)) hot = x; if (x.tn !== null && (!cold || x.tn < cold.tn)) cold = x; if (x.pr !== null && (!wet || x.pr > wet.pr)) wet = x });
 var dry = 0, run = 0; pr.forEach(function (v) { if (v !== null && v < 1) { run++; dry = Math.max(dry, run) } else run = 0 });
 var tot = pr.filter(function (v) { return v !== null }).reduce(function (s, v) { return s + v }, 0), nT = mean(N.t.slice(1)), nP = N.p.slice(1).reduce(function (s, v, i) { return s + (v || 0) * MD[i] }, 0);
 var mt = [], mp = []; for (var m = 1; m <= 12; m++) { var r = days.filter(function (x) { return +x.d.slice(5, 7) === m }); mt[m] = mean(r.map(function (x) { return x.t })); mp[m] = r.map(function (x) { return x.pr }).filter(function (v) { return v !== null }).reduce(function (s, v) { return s + v }, 0) }
 /* extremes: heavy rain, the wettest three days, hot nights, the longest run of very hot days, the strongest wind and windy days */
 var heavy = pr.filter(function (v) { return v !== null && v >= 50 }).length, vheavy = pr.filter(function (v) { return v !== null && v >= 100 }).length, w3 = 0;
 for (var i3 = 2; i3 < pr.length; i3++) { if (pr[i3] !== null && pr[i3 - 1] !== null && pr[i3 - 2] !== null) w3 = Math.max(w3, pr[i3] + pr[i3 - 1] + pr[i3 - 2]) }
 var hotN = tn.filter(function (v) { return v !== null && v >= 25 }).length, spell = 0, rn = 0; tx.forEach(function (v) { if (v !== null && v >= 35) { rn++; spell = Math.max(spell, rn) } else rn = 0 });
 var wxs = g("wx").filter(function (v) { return v !== null && isFinite(v) }), wmax = wxs.length ? Math.max.apply(null, wxs) : null, wmaxDay = null; days.forEach(function (x) { if (x.wx !== null && x.wx === wmax && !wmaxDay) wmaxDay = x.d });
 var aods = g("aod").filter(function (v) { return v !== null && isFinite(v) });
 var ext = { heavy: heavy, vheavy: vheavy, w3: w3, hotN: hotN, spell: spell, wmax: wmax, wmaxDay: wmaxDay, windy10: wxs.filter(function (v) { return v >= 10 }).length, windy17: wxs.filter(function (v) { return v >= 17.2 }).length, cl: mean(g("cl")), soil: mean(g("soil")), td: mean(g("td")), aod: aods.length > 200 ? mean(aods) : null, aodMax: aods.length > 200 ? Math.max.apply(null, aods) : null };
 return { ext: ext, t: mean(t), tx: mean(tx), tn: mean(tn), hot: hot, cold: cold, hotDays: tx.filter(function (v) { return v !== null && v >= 35 }).length, frost: tn.filter(function (v) { return v !== null && v < 0 }).length,
  rain: tot, rainy: pr.filter(function (v) { return v !== null && v >= 1 }).length, wet: wet, dry: dry, rh: mean(g("rh")), ws: mean(g("ws")), sw: mean(g("sw")), tAnom: mean(t) - nT, pAnom: nP ? (tot - nP) / nP * 100 : null, nP: nP, nT: nT, mt: mt, mp: mp };
}

/* ---------------- 2b. more records for research ---------------- */
/* global greenhouse gases: NOAA Global Monitoring Laboratory annual means (CO2 at Mauna Loa from 1959; CH4 global from 1983; N2O global from 2001) */
var GAS = null;
function gasLoad() { if (GAS) return GAS; GAS = (async function () {
 var get = async function (u) { try { var r = await fetch(u); if (!r.ok) return {}; var o = {}; (await r.text()).split("\n").forEach(function (l) { if (/^\s*#/.test(l)) return; var c = l.split(","); var y = +c[0], v = +c[1]; if (y > 1900 && isFinite(v) && v > 0) o[y] = v }); return o } catch (e) { return {} } };
 var res = await Promise.all([get("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.csv"), get("https://gml.noaa.gov/webdata/ccgg/trends/ch4/ch4_annmean_gl.csv"), get("https://gml.noaa.gov/webdata/ccgg/trends/n2o/n2o_annmean_gl.csv")]);
 return { co2: res[0], ch4: res[1], n2o: res[2] } })(); GAS.then(function (g) { if (!Object.keys(g.co2).length) GAS = null }); return GAS }
/* air quality at the place: CAMS global atmospheric composition (Copernicus/ECMWF) through Open-Meteo; its archive starts in August 2022, so only whole years from 2023 */
async function airQuality(lat, lon, y) {
 if (y < 2023 || y > LASTY) return null;
 var v = "pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,aerosol_optical_depth,dust";
 var j = await getJSON("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat.toFixed(3) + "&longitude=" + lon.toFixed(3) + "&start_date=" + y + "-01-01&end_date=" + y + "-12-31&hourly=" + v + "&timezone=UTC", null, 40000);
 var h = j.hourly || {}, o = {}, n = 0; v.split(",").forEach(function (k) { var a = (h[k] || []).filter(function (x) { return x !== null && isFinite(x) }); n = Math.max(n, a.length); o[k] = a.length > 24 * 300 ? mean(a) : null; if (k === "pm2_5" && a.length > 24 * 300) { var daily = []; for (var i = 0; i + 24 <= (h[k] || []).length; i += 24) { var dd = h[k].slice(i, i + 24).filter(function (x) { return x !== null }); if (dd.length > 18) daily.push(mean(dd)) } o.pmDaysOver15 = daily.filter(function (x) { return x > 15 }).length } });
 return n ? o : null }
/* natural events near the place: NASA EONET (Earth Observatory Natural Event Tracker); its archive is thin before about 2015 */
async function eonet(lat, lon, y) {
 var dl = 5, dlon = Math.min(20, 5 / Math.max(.2, Math.cos(lat * Math.PI / 180))), bb = [Math.max(-180, lon - dlon), Math.min(90, lat + dl), Math.min(180, lon + dlon), Math.max(-90, lat - dl)].map(function (v) { return v.toFixed(2) }).join(",");
 var j = await getJSON("https://eonet.gsfc.nasa.gov/api/v3/events?status=all&start=" + y + "-01-01&end=" + y + "-12-31&bbox=" + bb + "&limit=500", null, 30000), by = {}, names = {};
 (j.events || []).forEach(function (e) { var c = (e.categories && e.categories[0] && e.categories[0].title) || "Other"; by[c] = (by[c] || 0) + 1; (names[c] = names[c] || []).push(e.title) });
 return { n: (j.events || []).length, by: by, names: names } }
/* earthquakes near the place: USGS ComCat, magnitude 4.5 and above within 300 km (complete worldwide for this size since about 1973) */
async function quakes(lat, lon, y) {
 var q = "&starttime=" + y + "-01-01&endtime=" + y + "-12-31T23:59:59&latitude=" + lat.toFixed(3) + "&longitude=" + lon.toFixed(3) + "&maxradiuskm=300&minmagnitude=4.5";
 var c = await getJSON("https://earthquake.usgs.gov/fdsnws/event/1/count?format=geojson" + q, null, 20000), big = null;
 if (c.count) { var j = await getJSON("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&limit=1" + q, null, 20000); var f = (j.features || [])[0]; if (f) big = { mag: f.properties.mag, place: f.properties.place, date: new Date(f.properties.time).toISOString().slice(0, 10) } }
 return { n: c.count || 0, big: big } }
async function extras(p, y1, y2) {
 var safe = function (pr) { return pr.catch(function () { return null }) };
 var r = await Promise.all([safe(gasLoad()), safe(airQuality(p.lat, p.lon, y1)), safe(airQuality(p.lat, p.lon, y2)), safe(eonet(p.lat, p.lon, y1)), safe(eonet(p.lat, p.lon, y2)), safe(quakes(p.lat, p.lon, y1)), safe(quakes(p.lat, p.lon, y2))]);
 var G = r[0], gy = function (y) { return G ? { co2: G.co2[y] || null, ch4: G.ch4[y] || null, n2o: G.n2o[y] || null } : null };
 return { gas: { b: gy(y1), a: gy(y2) }, aq: { b: r[1], a: r[2] }, ev: { b: r[3], a: r[4] }, eq: { b: r[5], a: r[6] } } }

/* ---------------- 2c. was After better or worse than Before, all things considered? ----------------
   Each change in the table becomes a score from -1 (much worse) to +1 (much better) with a fixed, stated rule, and the scores are averaged with fixed weights.
   Warmer than normal, drier than normal, more very hot days and hot nights, longer heat spells and dry spells, more heavy-rain days, less water or
   fewer green plants in the picture, dirtier air and more greenhouse gas count as worse. Events and earthquakes are not scored (their records are not comparable over time). */
function overall(D) {
 var B = D.B.s, A = D.A.s, Eb = B.ext || {}, Ea = A.ext || {}, P = D.pics || {}, X = D.ext || {}, parts = [];
 var ok = function (v) { return v !== null && v !== undefined && isFinite(v) }, th = function (x) { return Math.tanh(x) };
 var add = function (name, b, a, unit, d, scale, worseIfUp, w, fmt) { if (!ok(b) || !ok(a)) return; var ch = a - b, sc = th((worseIfUp ? -ch : ch) / scale); parts.push({ name: name, b: b, a: a, unit: unit, d: d, s: sc, w: w }) };
 add("Temperature compared with normal", B.tAnom, A.tAnom, " °C", 2, 1, true, .2);
 /* rain: closer to this place's normal is better; much wetter (floods) or much drier (drought) than normal count as worse */
 if (ok(B.pAnom) && ok(A.pAnom)) parts.push({ name: "Rain compared with normal (closer to normal is better)", b: B.pAnom, a: A.pAnom, unit: "%", d: 0, s: th((Math.abs(B.pAnom) - Math.abs(A.pAnom)) / 30), w: .1 });
 add("Very hot days (35 °C or more)", B.hotDays, A.hotDays, " days", 0, 15, true, .08);
 add("Hot nights (25 °C or more)", Eb.hotN, Ea.hotN, " nights", 0, 20, true, .05);
 add("Longest heat spell", Eb.spell, Ea.spell, " days", 0, 7, true, .04);
 add("Longest dry spell", B.dry, A.dry, " days", 0, 15, true, .05);
 add("Heavy-rain days (50 mm or more)", Eb.heavy, Ea.heavy, " days", 0, 4, true, .04);
 var pb = P.b, pa = P.a, wb = pb && ok(pb.water) ? pb.water * 100 : null, wa = pa && ok(pa.water) ? pa.water * 100 : null;
 /* water and plant shares are compared only when both pictures were taken at a similar time of year (within 45 days); otherwise the season, not the years, would drive the difference */
 var db = pb ? (ok(pb.sdoy) ? pb.sdoy : pb.doy) : null, da = pa ? (ok(pa.sdoy) ? pa.sdoy : pa.doy) : null, gap = ok(db) && ok(da) ? Math.min(Math.abs(db - da), 365 - Math.abs(db - da)) : null, seasOK = gap === null || gap <= 45; D.seasGap = gap; D.seasOK = seasOK;
 /* water matters most where the place is water (a lake, sea or wetland): weight grows with how much of the picture was water */
 var same = pb && pa && !!pb.modis === !!pa.modis; if (!same) { wb = null; wa = null }
 var wW = ok(wb) && ok(wa) ? (Math.max(wb, wa) >= 20 || /water|lake|sea|reservoir|wetland|river|bay|lagoon/i.test((D.place.kind || "") + " " + D.place.name) ? .35 : Math.max(wb, wa) >= 2 ? .1 : 0) : 0;
 if (wW && seasOK) add("Water in the picture", wb, wa, " %", 1, 5, false, wW);
 if (seasOK && same && pb && pa && ok(pb.veg) && ok(pa.veg) && (pb.veg > .02 || pa.veg > .02)) add("Green plants in the picture", pb.veg * 100, pa.veg * 100, " %", 1, 8, false, .15);
 var qb = X.aq && X.aq.b, qa = X.aq && X.aq.a; if (qb && qa) add("Fine particles, PM2.5", qb.pm2_5, qa.pm2_5, " µg/m³", 1, 10, true, .1);
 var gb = X.gas && X.gas.b, ga = X.gas && X.gas.a; if (gb && ga) add("Carbon dioxide (global)", gb.co2, ga.co2, " ppm", 1, 20, true, .05);
 /* a lake, sea or wetland is judged mostly by its water: without a comparable water measurement the weather alone would mislead, so no verdict is given */
 var waterPlace = /\b(water|lake|sea|reservoir|wetland|river|bay|lagoon|ocean)\b/i.test((D.place.kind || "") + " " + D.place.name) || (ok(wb) && wb >= 20) || (ok(wa) && wa >= 20);
 var hasWater = parts.some(function (p) { return p.name === "Water in the picture" });
 var sw = parts.reduce(function (s0, p) { return s0 + p.w }, 0), score = sw ? parts.reduce(function (s0, p) { return s0 + p.w * p.s }, 0) / sw : 0;
 if (D.pics === undefined || (waterPlace && !hasWater)) { parts.forEach(function (p) { p.c = sw ? p.w * p.s / sw : 0 }); parts.sort(function (x, y) { return Math.abs(y.c) - Math.abs(x.c) });
  return { score: 0, verdict: "none", why: D.pics === undefined ? "wait" : !seasOK ? "season" : !same && pb && pa ? "mixed" : "nopic", parts: parts } }
 parts.forEach(function (p) { p.c = sw ? p.w * p.s / sw : 0 });
 parts.sort(function (x, y) { return Math.abs(y.c) - Math.abs(x.c) });
 return { score: score, verdict: score <= -.08 ? "worse" : score >= .08 ? "better" : "same", parts: parts };
}
/* the Difference music: each day's weather difference, shifted by the year-wide verdict, so lost water or plants, heat extremes or dirtier air darken it */
function applyOverall(D) {
 D.over = overall(D); var off = D.over.score * .35;
 D.Dh = D.Dc.map(function (v) { return v === null || v === undefined ? null : cl(.5 + (v - .5) * .65 + off, .04, .96) });
 var el = $("cmpverdict"); if (!el) return; var O = D.over, word = { worse: "worse", better: "better", same: "about the same" }[O.verdict];
 var head = O.verdict === "none" ? (O.why === "wait" ? "<b>Waiting for the satellite pictures before giving an overall verdict</b> (they measure the water and green plants, which can matter most)." :
  "<b>No overall verdict for " + esc(D.place.name) + ".</b> This place is mostly water, and its water could not be measured from two comparable pictures (" + (O.why === "season" ? "they were taken at different times of year" : O.why === "mixed" ? "one year is pictured by Landsat and the other by MODIS, which measure differently" : "the pictures could not be loaded or were not clear") + "). The weather numbers below are real, but on their own they would give a misleading verdict.") : null;
 var rows = O.parts.slice(0, 8).map(function (p) { var dir = p.s <= -.15 ? '<span style="color:#ff8a7a">worse</span>' : p.s >= .15 ? '<span style="color:#8fd49a">better</span>' : '<span style="color:var(--mute)">little change</span>';
  return "<li>" + esc(p.name) + ": " + (+p.b).toFixed(p.d) + p.unit + " → " + (+p.a).toFixed(p.d) + p.unit + " (" + dir + ")</li>" }).join("");
 el.innerHTML = '<p style="margin:0 0 4px">' + (head || "<b>All things considered, " + D.y2 + " was " + (O.verdict === "same" ? "about the same as" : word + " than") + " " + D.y1 + "</b> (score " + (O.score > 0 ? "+" : "") + O.score.toFixed(2) + " on a scale from −1, much worse, to +1, much better).") + "</p><ul style=\"margin:0 0 6px 18px;font-size:12.5px;line-height:1.5\">" + rows + '</ul><p class="cmpnote" style="margin:0">Each change in the table is scored with a fixed rule and weighted: temperature against normal, rain against normal (closer to normal is better; much wetter or much drier counts as worse), heat and dry spells, heavy rain, water and green plants in the pictures (water weighs most where the place is water), air quality and greenhouse gas. Natural events and earthquakes are not scored, because their records are not comparable over time.' + (D.seasOK === false ? ' <b>The two pictures were taken ' + D.seasGap + ' days apart in the year, so their water and plant shares are not scored: the season, not the years, would drive that difference.</b>' : '') + '</p>';
}

/* ---------------- 3. Landsat pictures ---------------- */
function boxFor(p, km) { var h = km * .75, dlat = h / 2 / 111.32, dlon = km / 2 / (111.32 * Math.max(.05, Math.cos(p.lat * Math.PI / 180))); return [Math.max(-180, p.lon - dlon), Math.max(-85, p.lat - dlat), Math.min(180, p.lon + dlon), Math.min(85, p.lat + dlat)] }
/* "Fit the place": the place's own outline plus a margin. Up to 100 km: Landsat (30 m). Wider (seas, big lakes, deserts, countries): NASA MODIS (250 m), up to 2,000 km. */
function autoKm(p) {
 if (!p.bb) { if (/\b(ocean|sea|gulf|bight)\b/i.test(p.name)) return 800; if (/\b(bay|strait|channel|sound|desert|delta|basin)\b/i.test(p.name)) return 250; return /city|town|state|county|district|region|country|lake|reservoir|island|forest/i.test(p.kind) ? 25 : 5 }
 var hkm = Math.abs(p.bb[1] - p.bb[0]) * 111.32, wkm = Math.abs(p.bb[3] - p.bb[2]) * 111.32 * Math.cos(p.lat * Math.PI / 180), k = Math.max(wkm, hkm / .75) * 1.25;
 return k <= 100 ? cl(k, .4, 100) : cl(k, 120, 2000) }
function inPoly(f, lon, lat) {
 var g = f.geometry; if (!g) return false; var polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
 return polys.some(function (pl) { var r = pl[0], ins = false; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins } return ins });
}
function doy(s) { var d = new Date(s); return Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 864e5) }
async function scenes(bb, y, m1, m2) {
 var body = { collections: ["landsat-c2-l2"], intersects: { type: "Polygon", coordinates: [[[bb[0], bb[1]], [bb[2], bb[1]], [bb[2], bb[3]], [bb[0], bb[3]], [bb[0], bb[1]]]] },
  datetime: y + "-" + String(m1).padStart(2, "0") + "-01T00:00:00Z/" + y + "-" + String(m2).padStart(2, "0") + "-" + MD[m2 - 1] + "T23:59:59Z", query: { "eo:cloud_cover": { lt: 40 } }, limit: 100, sortby: [{ field: "eo:cloud_cover", direction: "asc" }] };
 var j = await getJSON(PC + "/stac/v1/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, 30000);
 return j.features || [];
}
/* best scenes first: covering the place, few clouds, not Landsat 7 after its scan-line fault of 31 May 2003 (striped), and (for After) the same time of year as Before */
function rank(list, lon, lat, y, target) {
 return list.map(function (f) { var pl = f.properties.platform || "", dd = doy(f.properties.datetime), sc = (inPoly(f, lon, lat) ? 0 : 500) + (+f.properties["eo:cloud_cover"] || 0) + (/7$/.test(pl) && String(f.properties.datetime) >= "2003-05-31" && y !== 2012 ? 60 : 0);
  if (target !== null && target !== undefined) { var dd2 = Math.abs(dd - target); sc += Math.min(dd2, 365 - dd2) * .35 } return { f: f, s: sc } }).sort(function (a, b) { return a.s - b.s }).map(function (x) { return x.f });
}
var GIBSW = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
function gibsUrl(bb, d, W, H, sat, lay) { return GIBSW + "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=MODIS_" + (sat || "Terra") + "_CorrectedReflectance_" + (lay || "TrueColor") + "&STYLES=&CRS=EPSG:4326&BBOX=" + [bb[1], bb[0], bb[3], bb[2]].map(function (v) { return v.toFixed(4) }).join(",") + "&WIDTH=" + W + "&HEIGHT=" + H + "&FORMAT=image/jpeg&TIME=" + d }
/* NASA GIBS WMTS tiles (fast and cached) are stitched into a picture of the box bb = [west, south, east, north].
   GIBS's WMS (one request per picture) became very slow or unanswered in November 2026, so the same MODIS layers are read as tiles.
   EPSG:4326 "250m" tile matrices: level L tiles are 512 px and 288 / 2^L degrees wide, from (-180, 90); level 8 is about 250 m. */
var GIBST = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/";
async function gibsTile(u, ms) { var ac = new AbortController(), tm = setTimeout(function () { ac.abort() }, ms || 15000); try { var r = await fetch(u, { signal: ac.signal }); if (!r.ok) return null; return await createImageBitmap(await r.blob()) } catch (e) { return null } finally { clearTimeout(tm) } }
async function gibsImg(bb, d, W, H, sat, lay, ms) {
 var w0 = Math.max(-180, bb[0]), e0 = Math.min(180, bb[2]), s0 = Math.max(-90, bb[1]), n0 = Math.min(90, bb[3]); if (!(e0 > w0 && n0 > s0)) return null;
 var need = (e0 - w0) / W, L = 0; while (L < 8 && 288 / Math.pow(2, L) / 512 > need) L++;
 var td, c0, c1, r0, r1, span = function () { td = 288 / Math.pow(2, L); c0 = Math.floor((w0 + 180) / td); c1 = Math.floor((e0 + 180 - 1e-9) / td); r0 = Math.floor((90 - n0) / td); r1 = Math.floor((90 - s0 - 1e-9) / td) };
 span(); while ((c1 - c0 + 1) * (r1 - r0 + 1) > 16 && L > 0) { L--; span() }
 var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, W, H); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
 var kx = W / (e0 - w0), ky = H / (n0 - s0), jobs = [];
 for (var r = r0; r <= r1; r++) for (var cc = c0; cc <= c1; cc++) jobs.push({ r: r, c: cc });
 var got = 0;
 await Promise.all(jobs.map(async function (j) { var im = await gibsTile(GIBST + "MODIS_" + (sat || "Terra") + "_CorrectedReflectance_" + (lay || "TrueColor") + "/default/" + d + "/250m/" + L + "/" + j.r + "/" + j.c + ".jpg", ms); if (!im) return; got++;
  var lon = -180 + j.c * td, lat = 90 - j.r * td, x0 = Math.floor((lon - w0) * kx), y0 = Math.floor((n0 - lat) * ky), x1 = Math.ceil((lon + td - w0) * kx), y1 = Math.ceil((n0 - lat + td) * ky);
  x.drawImage(im, x0, y0, x1 - x0, y1 - y0) })); /* whole-pixel edges with a 1 px overlap, so no thin dark seams appear between tiles */
 return got ? c : null;
}
function isoD(y, dy) { var t = new Date(Date.UTC(y, 0, 1) + dy * 864e5); return t.toISOString().slice(0, 10) }
/* NASA Terra MODIS true colour (250 m, from 24 Feb 2000) through NASA GIBS: for areas wider than 100 km and for open water Landsat does not photograph.
   GIBS has no cloud list, so a set of days is tried at small size and the one with the fewest cloud-white and missing (black) pixels wins. */
async function modisPic(bb, y, m1, m2, target, cv) {
 var d0 = MD.slice(0, m1 - 1).reduce(function (s, v) { return s + v }, 0), d1 = MD.slice(0, m2).reduce(function (s, v) { return s + v }, 0) - 1, cands = [];
 if (y === 2000) d0 = Math.max(d0, 55);
 if (d0 > d1) return { used: [], cover: 0 };
 if (target !== null && target !== undefined) { [0, -4, 4, -8, 8, -13, 13, -19, 19, -26, 26, -34, 34].forEach(function (o) { var t = target + o; if (t >= d0 && t <= d1) cands.push(t) }) }
 var n = Math.min(16, d1 - d0 + 1); for (var i = 0; i < n; i++) cands.push(Math.round(d0 + (d1 - d0) * (i + .5) / n));
 cands = cands.filter(function (v, i, a) { return a.indexOf(v) === i && Date.UTC(y, 0, 1) + v * 864e5 < Date.now() - 3 * 864e5 }).slice(0, 14);
 /* both MODIS satellites (Terra from 2000, Aqua from mid-2002): they pass at different times, so clouds and sun glint differ */
 var tries = []; cands.forEach(function (dy) { tries.push({ dy: dy, sat: "Terra" }); if (y > 2002 || (y === 2002 && dy >= 184)) tries.push({ dy: dy, sat: "Aqua" }) });
 var score = async function (tr) { var dy = tr.dy, b = await gibsImg(bb, isoD(y, dy), 128, 96, tr.sat, "TrueColor", 12000); if (!b) return null; var c = document.createElement("canvas"); c.width = 128; c.height = 96; var x = c.getContext("2d"); x.drawImage(b, 0, 0); var d = x.getImageData(0, 0, 128, 96).data, cloud = 0, none = 0, N = d.length / 4;
  /* white = cloud; light grey = haze, thin cloud or sun glint on water; black = no data */
  for (var k = 0; k < d.length; k += 4) { var r = d[k], g = d[k + 1], bl = d[k + 2], mn = Math.min(r, g, bl), mx = Math.max(r, g, bl); if (mx < 12) none++; else if (mn > 165 && mx - mn < 45) cloud++; else if (mn > 105 && mx - mn < 35) cloud += .6 }
  var s = cloud / N + 2 * none / N; if (target !== null && target !== undefined) { var dd = Math.abs(dy - target); s += Math.min(dd, 365 - dd) * .004 } return { dy: dy, sat: tr.sat, s: s, cloud: cloud / Math.max(1, N - none), none: none / N } };
 var res = []; for (var j = 0; j < tries.length; j += 6) { var part = await Promise.all(tries.slice(j, j + 6).map(function (tr) { return score(tr).catch(function () { return null }) })); res = res.concat(part.filter(Boolean)) }
 res.sort(function (a, b) { return a.s - b.s }); var best = res[0]; if (!best || best.none > .6) return { used: [], cover: 0 };
 var W = cv.width, H = cv.height, big = await gibsImg(bb, isoD(y, best.dy), Math.min(W, 1024), Math.round(Math.min(W, 1024) * H / W), best.sat, "TrueColor", 20000); if (!big) return { used: [], cover: 0, err: "NASA GIBS did not answer" };
 var x2 = cv.getContext("2d"); x2.clearRect(0, 0, W, H); x2.imageSmoothingEnabled = true; x2.imageSmoothingQuality = "high"; x2.drawImage(big, 0, 0, W, H);
 var st = null; try { st = await modisShares(bb, isoD(y, best.dy), best.sat, cv) } catch (e) { st = null }
 return { used: [{ id: "MODIS_" + best.sat + " " + isoD(y, best.dy), date: isoD(y, best.dy), sat: "NASA " + best.sat + " MODIS true colour (250 m)", cloud: best.cloud * 100, modis: true }], cover: 1 - best.none, water: st ? st.water : null, veg: st ? st.veg : null, snow: null, doy: best.dy, modis: true };
}
/* Water and green-plant shares for a MODIS picture, from the NASA GIBS MODIS bands 7-2-1 picture of the same day and satellite (red = shortwave infrared 2.1 µm, green = near infrared 0.86 µm, blue = red light 0.65 µm).
   Water absorbs both infrared bands: it is counted where the near-infrared is no brighter than red light and the shortwave infrared is low (and the pixel is not bright, which would be snow or ice).
   Green plants reflect near-infrared strongly but shortwave infrared weakly: counted where near-infrared is above red light and (NIR - SWIR) / (NIR + SWIR) is above 0.3.
   Pixels that are missing (black) or cloud-white in the true-colour picture are left out. Checked on the Aral Sea (21% water in Sep 2000, 5% in Sep 2020 over 58-61.9 E, 43.4-46.9 N), the central Amazon (88% plants), Bangladesh (83-86% plants) and the Sahara (0%). */
async function modisShares(bb, d, sat, cv) {
 var W = Math.min(cv.width, 512), H = Math.max(1, Math.round(W * cv.height / cv.width)), b = await gibsImg(bb, d, W, H, sat, "Bands721", 20000); if (!b) return null;
 var c1 = document.createElement("canvas"); c1.width = W; c1.height = H; var x1 = c1.getContext("2d"); x1.drawImage(b, 0, 0, W, H); var f = x1.getImageData(0, 0, W, H).data;
 var c2 = document.createElement("canvas"); c2.width = W; c2.height = H; var x2 = c2.getContext("2d"); x2.drawImage(cv, 0, 0, W, H); var t = x2.getImageData(0, 0, W, H).data;
 var n = 0, w = 0, v = 0, all = W * H;
 for (var k = 0; k < f.length; k += 4) { var mn = Math.min(t[k], t[k + 1], t[k + 2]), mx = Math.max(t[k], t[k + 1], t[k + 2]); if (mx < 12 || (mn > 165 && mx - mn < 45)) continue; n++;
  var S = f[k], N = f[k + 1], R = f[k + 2]; if (R >= N - 5 && S <= Math.max(25, .7 * R) && N < 140) w++; else if (N > R && (N - S) / (N + S + 1) > .3) v++ }
 return n > all * .2 ? { water: w / n, veg: v / n } : null;
}
async function picture(p, bb, km, y, m1, m2, target, cv, onStep) {
 var L = null;
 if (km <= 20 && y >= 2010) {
  if (onStep) onStep(-1);
  /* the shares of water and green plants still come from Landsat's near-infrared band (the sharp pictures have none), so both years are measured the same way; both are fetched at once */
  var off = document.createElement("canvas"); off.width = cv.width; off.height = cv.height;
  var LsP = y >= PICY ? landsatPic(p, bb, y, m1, m2, target, off, null).catch(function () { return null }) : Promise.resolve(null);
  var Wb = null; try { Wb = await waybackPic(p, bb, y, cv) } catch (e) { Wb = null }
  if (Wb && !Wb.off) { var Ls = await LsP; if (Ls && Ls.used.length) { Wb.water = Ls.water; Wb.veg = Ls.veg; Wb.snow = Ls.snow; Wb.statsFrom = Ls.used; Wb.sdoy = Ls.doy } return Wb }
  var Lpre = await LsP; if (Lpre && Lpre.used.length && Lpre.cover > .3) { cv.getContext("2d").clearRect(0, 0, cv.width, cv.height); cv.getContext("2d").drawImage(off, 0, 0); if (Wb && Wb.off) Lpre.wbNote = "The sharp image archive has no picture of this spot from " + y + " (nearest: " + Wb.capY + "), so Landsat is shown."; return Lpre }
  if (Wb && Wb.off) var wbNote = "The sharp image archive has no picture of this spot from " + y + " (nearest: " + Wb.capY + "), so Landsat is shown.";
 }
 if (km <= 100 && y >= PICY) { try { L = await landsatPic(p, bb, y, m1, m2, target, cv, onStep) } catch (e) { L = { used: [], cover: 0, err: e.message } } if (typeof wbNote === "string") L.wbNote = wbNote; if (L.used.length && L.cover > .3) return L }
 if (y >= 2000) { if (onStep) onStep(0); var M = null; try { M = await modisPic(bb, y, m1, m2, target, cv) } catch (e) { M = { used: [], cover: 0, err: e.message } } if (M.used.length) { M.fallback = km <= 100; return M } if (!L) L = M }
 return L || { used: [], cover: 0 };
}
async function landsatPic(p, bb, y, m1, m2, target, cv, onStep) {
 /* Landsat pixels are 30 m: ask for the picture at that scale (no larger than the canvas), then enlarge it smoothly onto the canvas, so small areas look soft instead of blocky */
 var wkm = (bb[2] - bb[0]) * 111.32 * Math.cos(p.lat * Math.PI / 180), W = Math.round(cl(wkm * 1000 / 30, 48, Math.min(640, cv.width))), H = Math.round(W * cv.height / cv.width),
  sm = document.createElement("canvas"); sm.width = W; sm.height = H; var x = sm.getContext("2d"), bd = document.createElement("canvas"); bd.width = W; bd.height = H; var bx = bd.getContext("2d");
 var cx0 = cv.getContext("2d"); cx0.clearRect(0, 0, cv.width, cv.height);
 var list = rank(await scenes(bb, y, m1, m2), p.lon, p.lat, y, target), used = [];
 if (!list.length) return { used: used, cover: 0 };
 for (var i = 0; i < list.length && used.length < 5; i++) {
  if (used.length === 1 && !list._re) { /* after the main scene, try scenes from other satellite tracks first: they cover the parts the main scene missed */
   var pr0 = used[0].id.split("_")[2], rest = list.slice(i); rest.sort(function (p1, p2) { return ((p1.id.split("_")[2] === pr0) - (p2.id.split("_")[2] === pr0)) }); list = list.slice(0, i).concat(rest); list._re = 1 }
  var f = list[i];
  /* extra scenes only fill gaps, and only from within about six weeks of the main scene, so seasons are not mixed in one picture */
  if (used.length) { var dd0 = Math.abs(doy(f.properties.datetime) - doy(used[0].date)); if (Math.min(dd0, 365 - dd0) > 45) continue }
  var u = PC + "/data/v1/item/bbox/" + bb.map(function (v) { return v.toFixed(5) }).join(",") + "/" + W + "x" + H + ".png?collection=landsat-c2-l2&item=" + encodeURIComponent(f.id) + "&nodata=0";
  if (onStep) onStep(used.length + 1);
  var tc = await getBmp(u + "&assets=red&assets=green&assets=blue&color_formula=" + encodeURIComponent(CF)); if (!tc) continue;
  var bm = await getBmp(u + "&assets=nir08&assets=red&assets=green&rescale=7273,25455&rescale=7273,25455&rescale=7273,25455");
  x.globalCompositeOperation = "destination-over"; x.drawImage(tc, 0, 0); if (bm) { bx.globalCompositeOperation = "destination-over"; bx.drawImage(bm, 0, 0) }
  used.push({ id: f.id, date: f.properties.datetime.slice(0, 10), sat: String(f.properties.platform || "").replace("landsat-", "Landsat "), cloud: +f.properties["eo:cloud_cover"] });
  var d = x.getImageData(0, 0, W, H).data, n = 0; for (var k = 3; k < d.length; k += 16) if (d[k] > 0) n++; if (n / (W * H / 4) > .985) break;
 }
 x.globalCompositeOperation = "source-over";
 cx0.imageSmoothingEnabled = true; cx0.imageSmoothingQuality = "high"; cx0.drawImage(sm, 0, 0, W, H, 0, 0, cv.width, cv.height);
 /* water-like (NDWI > 0) and green-vegetation (NDVI > 0.3) shares of the picture, from the red, green and near-infrared bands */
 /* snow, ice and cloud also have NDWI above 0, but they are bright: water is counted only where green reflectance is below 0.3 (pixel 153 of 255 on the 0 to 0.5 scale used here) */
 var dd = bx.getImageData(0, 0, W, H).data, n2 = 0, w = 0, v = 0, sn = 0, cov = 0, all = W * H;
 for (var q = 0; q < dd.length; q += 4) { if (!dd[q + 3]) continue; n2++; var nir = dd[q], red = dd[q + 1], g = dd[q + 2]; if ((g - nir) / (g + nir + 1) > 0) { if (g < 153) w++; else sn++ } else if ((nir - red) / (nir + red + 1) > .3) v++ }
 var cd = x.getImageData(0, 0, W, H).data; for (var q2 = 3; q2 < cd.length; q2 += 4) if (cd[q2] > 0) cov++;
 return { used: used, cover: cov / all, water: n2 > all * .2 ? w / n2 : null, veg: n2 > all * .2 ? v / n2 : null, snow: n2 > all * .2 ? sn / n2 : null, doy: used.length ? doy(used[0].date) : null, px: W };
}
/* Very sharp pictures (about 0.3 to 1 m per pixel) for small areas: Esri World Imagery Wayback, the archived versions of the aerial and satellite imagery used in map mode (Maxar, Airbus, aerial surveys), from about 2010.
   The capture date at the place is read from Esri's own metadata for each archived version; the version whose capture year is closest to the year asked for is used. */
var WB = { cfg: null };
async function wbReleases() { if (WB.cfg) return WB.cfg; var j = await getJSON("https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json", null, 15000);
 WB.cfg = Object.keys(j).map(function (k) { return { n: +k, d: ((j[k].itemTitle || "").match(/\d{4}-\d{2}-\d{2}/) || [""])[0], m: j[k].metadataLayerUrl } }).filter(function (r) { return r.d && r.m }).sort(function (a, b) { return a.d < b.d ? -1 : 1 }); return WB.cfg }
async function wbCapture(r, lon, lat, layers) {
 for (var L of (layers || [5, 6, 4, 7])) { try { var qu = r.m + "/" + L + "/query?geometry=" + lon.toFixed(5) + "," + lat.toFixed(5) + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=SRC_DATE,SRC_RES,NICE_DESC&returnGeometry=false&f=json", q;
  try { q = await getJSON(qu, null, 8000) } catch (e1) { q = await getJSON(qu + "&retry=1", null, 8000) }
  var a = (q.features || [])[0]; if (a && a.attributes && a.attributes.SRC_DATE) { var s = String(a.attributes.SRC_DATE); return { date: s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8), res: a.attributes.SRC_RES, who: a.attributes.NICE_DESC || "" } } } catch (e) {} }
 return null }
function merc(lon, lat, z) { var n = Math.pow(2, z) * 256, s = Math.sin(lat * Math.PI / 180); return [(lon + 180) / 360 * n, (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n] }
async function waybackPic(p, bb, y, cv) {
 /* the archive's versions start in February 2014, but its first versions hold pictures taken years earlier (Paris: August 2011), so years before 2014 search the first versions */
 var rel = await wbReleases(), y0 = Math.max(y, rel.length ? +rel[0].d.slice(0, 4) : y), win = rel.filter(function (r) { return r.d >= y0 + "-01-01" && r.d <= (y0 + 3) + "-12-31" });
 if (!win.length) win = rel.slice(-6);
 /* two rounds of 8 parallel look-ups: first spread over the versions released from that year to three years later, then between the two versions where the capture year passes the year asked for */
 var look = async function (list, layers) { var part = await Promise.all(list.map(function (r) { return wbCapture(r, p.lon, p.lat, layers).then(function (c) { return c ? { r: r, c: c, i: win.indexOf(r) } : null }) })); return part.filter(Boolean) };
 var spread = function (lo, hi) { var out = [], n = hi - lo + 1, k = Math.min(8, n); for (var j = 0; j < k; j++) out.push(win[lo + Math.round(j * (n - 1) / Math.max(1, k - 1))]); return out.filter(function (r, i, a2) { return a2.indexOf(r) === i }) };
 var got = await look(spread(0, win.length - 1), [5]); if (!got.length) got = await look(spread(0, win.length - 1), [6, 4, 7]);
 if (!got.length) return null;
 got.sort(function (a2, b2) { return a2.i - b2.i });
 if (!got.some(function (g) { return +g.c.date.slice(0, 4) === y })) {
  var hiI = got.findIndex(function (g) { return +g.c.date.slice(0, 4) >= y });
  if (hiI > 0 && got[hiI].i - got[hiI - 1].i > 1) { var more = await look(spread(got[hiI - 1].i + 1, got[hiI].i - 1), [5, 6, 4]); got = got.concat(more) } }
 got.sort(function (a, b) { var da = Math.abs(+a.c.date.slice(0, 4) - y), db = Math.abs(+b.c.date.slice(0, 4) - y); return da - db || (a.r.d < b.r.d ? 1 : -1) });
 var best = got[0], cy = +best.c.date.slice(0, 4); if (Math.abs(cy - y) > 1) return { off: true, capY: cy };
 /* stitch the archived tiles at the zoom that gives at least the canvas's width in pixels, then crop to the area */
 /* the finest zoom (19, about 0.2 m per tile pixel) that the canvas can show; if the archive has no tiles that fine at this spot, step down one or two zoom levels */
 var wkm = (bb[2] - bb[0]) * 111.32 * Math.cos(p.lat * Math.PI / 180), zW = Math.min(19, Math.max(10, Math.ceil(Math.log2(156543.03 * Math.cos(p.lat * Math.PI / 180) * cv.width / (wkm * 1000))))), z, a, b, tx0, ty0, big = null;
 for (z = zW; z >= Math.max(10, zW - 2) && !big; z--) {
  a = merc(bb[0], bb[3], z); b = merc(bb[2], bb[1], z); tx0 = Math.floor(a[0] / 256); ty0 = Math.floor(a[1] / 256); var tx1 = Math.floor(b[0] / 256), ty1 = Math.floor(b[1] / 256);
  if ((tx1 - tx0 + 1) * (ty1 - ty0 + 1) > 120) continue;
  var bg = document.createElement("canvas"); bg.width = (tx1 - tx0 + 1) * 256; bg.height = (ty1 - ty0 + 1) * 256; var gx = bg.getContext("2d"), jobs = [], cnt = { ok: 0, all: 0 };
  for (var tyy = ty0; tyy <= ty1; tyy++) for (var txx = tx0; txx <= tx1; txx++) (function (tx, ty, zz, g, X0, Y0) { cnt.all++; jobs.push(getBmp("https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/" + best.r.n + "/" + zz + "/" + ty + "/" + tx + "?blank=1", 12000).then(function (bm) { if (bm) { cnt.ok++; g.drawImage(bm, (tx - X0) * 256, (ty - Y0) * 256) } })) })(txx, tyy, z, gx, tx0, ty0);
  await Promise.all(jobs); if (cnt.ok >= cnt.all * .8) { big = bg; break }
 }
 if (!big) return null;
 var x = cv.getContext("2d"); x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
 x.drawImage(big, a[0] - tx0 * 256, a[1] - ty0 * 256, b[0] - a[0], b[1] - a[1], 0, 0, cv.width, cv.height);
 var mpp = 156543.03 * Math.cos(p.lat * Math.PI / 180) / Math.pow(2, z);
 return { used: [{ id: "wayback " + best.r.n, date: best.c.date, sat: "Esri World Imagery Wayback, version of " + best.r.d + " (" + (best.c.who ? best.c.who + ", " : "") + (best.c.res ? "about " + (+best.c.res).toFixed(1) + " m per pixel" : "aerial and satellite imagery") + ")", cloud: 0, wb: true }],
  cover: 1, water: null, veg: null, wayback: true, capY: cy, doy: doy(best.c.date), mpp: mpp };
}

/* ---------------- 4. set up ---------------- */
async function setup() {
 stopPlay2();
 var p = C.place, y1 = Math.round(+$("cmpy1").value), y2 = Math.round(+$("cmpy2").value);
 if (!p) { var q = $("cmpqi").value.trim(); if (!q) { status("Choose a place first: type its name and pick it from the list."); $("cmpqi").focus(); return } status("Searching for " + q + "…"); try { var r0 = await geoFind([q]); if (r0 && r0.hit) pick(r0.hit) } catch (e) {} p = C.place; if (!p) { $("cmpsel").textContent = ""; status("No place called " + q + " was found. Try another spelling, or add the city or country."); return } }
 if (!(y1 >= FIRSTY && y1 <= LASTY && y2 >= FIRSTY && y2 <= LASTY)) { status("Choose years between " + FIRSTY + " and " + LASTY + " (" + CYR + " is not finished yet)."); return }
 if (y1 === y2) { status("Choose two different years."); return }
 if (y1 > y2) { var t = y1; y1 = y2; y2 = t; $("cmpy1").value = y1; $("cmpy2").value = y2 }
 var kmAuto = !+$("cmpa").value, km = +$("cmpa").value || autoKm(p), capped = false;
 /* a wide place with a year before 2000: MODIS has no pictures then, so show the central 100 km with Landsat (from 1982) for both years instead */
 if (kmAuto && km > 100 && Math.min(y1, y2) < 2000 && Math.max(y1, y2) >= PICY) { km = 100; capped = true }
 /* sharp archive pictures start about 2010; before that Landsat (30 m) is the sharpest, and needs at least about 3 km to show anything */
 if (kmAuto && km < 3 && Math.min(y1, y2) < 2010) km = 3;
 var bb = boxFor(p, km), mm = $("cmpm").value.split("-").map(Number), tk = ++C.ovTok;
 $("cmpgo").disabled = true; $("cmpr").hidden = false; $("cmpovbox").hidden = true; $("cmpdeepbox").innerHTML = ""; $("cmpdeepst").textContent = "";
 $("cmpLegB").textContent = "Before (" + y1 + ")"; $("cmpLegA").textContent = "After (" + y2 + ")"; $("cmpkb").textContent = "Before · " + y1; $("cmpka").textContent = "After · " + y2;
 try {
  /* the extra records and the pictures load while the climate numbers are read */
  var extP = extras(p, y1, y2).catch(function () { return null });
  var picsP = (async function () {
  /* pictures */
   ["b", "a"].forEach(function (k) { var c = $("cmpv" + k); c.getContext("2d").clearRect(0, 0, c.width, c.height); $("cmpcap" + k).textContent = ""; $("cmpe" + k).hidden = true });
   var pics = {};
   /* both years at once when both use the sharp archive (no season matching needed); otherwise After waits for Before, so it can match Before's time of year */
   var doPic = async function (k2, target) {
    var yy = k2 === "b" ? y1 : y2, cv = $("cmpv" + k2), em = $("cmpe" + k2);
    if (yy < PICY || (km > 100 && yy < 2000)) { em.hidden = false; em.textContent = yy < PICY ? "No satellite surface picture exists for " + yy + ": Landsat pictures start in 1982. The climate numbers and music for " + yy + " still work." : "Areas wider than 100 km are pictured by NASA's MODIS satellite, which starts in 2000. Choose 100 km or less for a Landsat picture of " + yy + ". The numbers and music still work."; pics[k2] = null; return }
    status("Finding the clearest satellite picture of " + p.name + " in " + yy + "…");
    em.hidden = false; em.textContent = "Loading the satellite picture of " + yy + "…";
    try { pics[k2] = await picture(p, bb, km, yy, mm[0], mm[1], target, cv, function (n) { em.textContent = n < 0 ? "Looking for a sharp aerial or satellite picture from " + yy + "…" : n ? "Loading Landsat scene " + n + " of " + yy + "…" : "Choosing the clearest NASA MODIS day of " + yy + "…" }) } catch (e) { pics[k2] = { used: [], cover: 0, err: e.message } }
    if (tk !== C.ovTok) return;
    var P = pics[k2];
    if (!P.used.length) { em.textContent = P.err ? "The satellite picture archive could not be reached (" + P.err + "). Try again in a minute." : yy < 2000 ? "Landsat has no clear picture of this place for " + yy + " in the chosen season (Landsat does not photograph the open ocean). Try “Clearest of the year”, another year, or a year from 2000 on for a NASA MODIS picture." : "No clear satellite picture of this place was found for " + yy + " in the chosen season. Try “Clearest of the year” or another year." }
    else { em.hidden = true; $("cmpcap" + k2).textContent = P.wayback ? P.used[0].sat + ", captured " + fmtD(P.used[0].date) + "." + (P.capY !== yy ? " The archive has no capture of this spot from " + yy + "; this is the nearest (" + P.capY + ")." : "") + (P.statsFrom ? " Water and plant shares measured from Landsat (" + P.statsFrom.map(function (u) { return fmtD(u.date) }).join(", ") + ")." : "")
      : P.modis ? P.used[0].sat + ", " + fmtD(P.used[0].date) + " (the clearest of the days checked; about " + Math.round(P.used[0].cloud) + "% of the picture looks like cloud or haze)." + (P.fallback ? " Landsat had no clear picture of this spot, so NASA MODIS is used." : "") + (P.cover < .95 ? " Black areas are gaps between the satellite's passes." : "")
      : P.used.map(function (u) { return u.sat + ", " + fmtD(u.date) + " (" + Math.round(u.cloud) + "% cloud in the scene)" }).join("; ") + "." + (P.cover < .97 ? " Part of the area was not covered by these scenes (dark)." : "") + (km < 3 ? " Landsat's pixels are 30 m wide, so details this small look soft; it is the sharpest free satellite record for " + yy + "." : "") + (P.wbNote ? " " + P.wbNote : "") }
   };
   if (km <= 20 && y1 >= 2010 && y2 >= 2010) await Promise.all([doPic("b", null), doPic("a", null)]);
   else { await doPic("b", null); await doPic("a", pics.b ? pics.b.doy : null) }
   return pics;
  })();
  /* which climate record: NASA POWER for both years, unless a year is before 1981 or POWER's record at this place jumps between the two years (then ERA5 for both) */
  status("Reading NASA's climate record at " + p.name + "…");
  var src = "power", why = "", monthly = null, bk = null;
  try { monthly = await anPowerRows(p.lat, p.lon); bk = typeof anBreak === "function" ? anBreak(monthly) : null } catch (e) { monthly = null }
  if (y1 < 1981) { src = "era5"; why = y1 + " is before NASA POWER's record (1981)" }
  else if (bk && bk.y > y1 && bk.y <= y2) { src = "era5"; why = "NASA POWER's record here jumps suddenly around " + bk.y + " (a change in the model's input data), which would distort a " + y1 + "–" + y2 + " comparison" }
  else if (!monthly) { src = "era5"; why = "NASA POWER could not be reached" }
  var D = { place: p, y1: y1, y2: y2, km: km, capped: capped, bb: bb, src: src, why: why, bk: bk, monthly: monthly, months: mm };
  if (src === "power") {
   var b = await powerDaily(p.lat, p.lon, y1); if (tk !== C.ovTok) return; status("Reading " + y2 + "…");
   var a = await powerDaily(p.lat, p.lon, y2); D.N = normalsFromMonthly(monthly); D.B = { y: y1, days: b }; D.A = { y: y2, days: a };
  } else {
   status("Reading the ERA5 record for " + y1 + " and " + y2 + "…");
   var res = null;
   try { res = await Promise.all([era5Daily(p.lat, p.lon, y1 + "-01-01", y1 + "-12-31", true), era5Daily(p.lat, p.lon, y2 + "-01-01", y2 + "-12-31", true), era5Daily(p.lat, p.lon, "1981-01-01", "2010-12-31", false)]) }
   catch (e) { if (!monthly) throw e }   /* ERA5 unreachable (for example Open-Meteo's daily limit): fall back to NASA POWER below when it covers both years */
   if (res) { if (tk !== C.ovTok) return; D.B = { y: y1, days: res[0] }; D.A = { y: y2, days: res[1] }; D.N = normalsFromDaily(res[2]) }
   else {
    status("ERA5 could not be reached; reading NASA POWER instead…");
    var y0 = y1; if (y1 < 1981) { y1 = 1981; D.y1 = 1981; if ($("cmpy1")) $("cmpy1").value = 1981 }   /* NASA POWER's daily record starts in 1981 */
    D.src = "power"; D.why = "";
    D.warn = (y0 < 1981 ? "ERA5, the only daily record before 1981 that the site uses, could not be reached (the free Open-Meteo service may have reached its daily limit for this connection), so this comparison uses 1981, the first year of NASA POWER's record, instead of " + y0 + "." : "ERA5 could not be reached when this comparison was made, so it uses NASA POWER.") +
     (bk && bk.y > y1 && bk.y <= y2 ? " NASA POWER's record here jumps suddenly around " + bk.y + " (a change in the model's input data); treat the difference between " + y1 + " and " + y2 + " with care, it may partly come from that jump." : "");
    status(D.warn);
    var b2 = await powerDaily(p.lat, p.lon, y1); if (tk !== C.ovTok) return; var a2 = await powerDaily(p.lat, p.lon, y2); D.N = normalsFromMonthly(monthly); D.B = { y: y1, days: b2 }; D.A = { y: y2, days: a2 };
   }
  }
  if (D.B.days.length < 300 || D.A.days.length < 300) throw new Error("the climate record for one of the years is incomplete");
  /* music scores */
  var tB = roll7(D.B.days.map(function (x) { return x.t })), tA = roll7(D.A.days.map(function (x) { return x.t })), pB = roll7(D.B.days.map(function (x) { return x.pr })), pA = roll7(D.A.days.map(function (x) { return x.pr }));
  var aT = [], aP = []; [[tB, pB, D.B], [tA, pA, D.A]].forEach(function (z) { z[2].days.forEach(function (x, i) { var m = +x.d.slice(5, 7); if (z[0][i] !== null) aT.push(z[0][i] - D.N.t[m]); if (z[1][i] !== null) aP.push(z[1][i] - D.N.p[m]) }) });
  var sT = sdv(aT), sP = sdv(aP); D.B.h = scores(D.B, D.N, sT, sP); D.A.h = scores(D.A, D.N, sT, sP);
  D.B.t7 = tB; D.A.t7 = tA; D.Dh = D.Dc = D.A.h.map(function (v, i) { var u = D.B.h[i]; return v === null || u === null || u === undefined ? null : cl(.5 + (v - u), .04, .96) });
  D.Dt = tA.map(function (v, i) { return v === null || tB[i] === null ? null : v - tB[i] });
  D.B.s = stats(D.B.days, D.N); D.A.s = stats(D.A.days, D.N);
  if (src === "power" && monthly) { var rows = bk && bk.y <= y1 ? monthly.filter(function (r) { return r.y >= bk.y }) : monthly, an = anAnnual(rows, "t"); D.trend = anTrend(an.ys, an.vs) }
  status("Reading greenhouse gases, air quality, natural events and earthquakes…"); D.ext = await extP; if (tk !== C.ovTok) return;
  C.data = D; C.play = null; C.ov = null; C.pos = { b: 0, a: 0, d: 0 };
  applyOverall(D); drawAll(); table(); notes();
  var pics = await picsP;
  if (tk !== C.ovTok) return;
  D.pics = pics || null; applyOverall(D); table(); notes(); drawAll();
  status("Ready. Press a play button to hear a year; the red line shows where the music is." + (D.warn ? " Note: " + D.warn : ""));
  /* the SI learns the place's rhythms by itself (free: NASA POWER's monthly record, trained in the browser) */
  if (window.EJSI) { var sib = $("cmpsibox"); if (sib && !(EJSI.last() && EJSI.last().key === (+D.place.lat).toFixed(3) + "," + (+D.place.lon).toFixed(3))) sib.innerHTML = ""; setTimeout(function () { EJSI.learn().catch(function () { }) }, 200) }
  return true;
 } catch (e) { status(/429/.test(String(e.message || e)) ? "Could not set up the comparison: the free weather-data service (Open-Meteo) has reached its daily limit for your internet connection. It resets at midnight UTC (6 am in Bangladesh). Finished researches in the Earth Jukebox Archives still open instantly." : "Could not set up the comparison: " + (e.message || e) + ". Check the connection and try again."); return false }
 finally { $("cmpgo").disabled = false }
}
function fmtD(s) { var d = new Date(s + "T00:00:00Z"); return d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear() }

/* ---------------- 5. charts ---------------- */
function fit(c) { var r = c.getBoundingClientRect(), dp = window.devicePixelRatio || 1, w = Math.max(50, Math.round(r.width)), h = Math.max(30, Math.round(r.height)); if (c.width !== w * dp || c.height !== h * dp) { c.width = w * dp; c.height = h * dp } var x = c.getContext("2d"); x.setTransform(dp, 0, 0, dp, 0, 0); x.clearRect(0, 0, w, h); return { x: x, w: w, h: h } }
function yearChart(k) {
 var D = C.data; if (!D) return; var c = $("cmpg" + k), F = fit(c), x = F.x, w = F.w, h = F.h, n = 365;
 if (k === "d") {
  var v = D.Dt, mx = Math.max(1, Math.max.apply(null, v.map(function (z) { return z === null ? 0 : Math.abs(z) })));
  x.strokeStyle = "rgba(255,255,255,.18)"; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
  for (var i = 0; i < n; i++) { var z = v[i]; if (z === null) continue; var bh = z / mx * (h / 2 - 3); x.fillStyle = z > 0 ? "#ff6b5a" : "#6fb3ff"; x.fillRect(i / n * w, h / 2 - Math.max(0, bh), Math.max(1, w / n), Math.abs(bh)) }
 } else {
  var Y = k === "b" ? D.B : D.A, all = D.B.t7.concat(D.A.t7).filter(function (z) { return z !== null }), lo = Math.min.apply(null, all) - 1, hi = Math.max.apply(null, all) + 1, pm = Math.max(5, Math.max.apply(null, D.B.days.concat(D.A.days).map(function (d) { return d.pr || 0 })));
  x.fillStyle = "#3d6fa8"; Y.days.forEach(function (d, i) { if (d.pr > 0) { var bh = Math.min(1, d.pr / pm) * h * .45; x.fillRect(i / n * w, h - bh, Math.max(1, w / n), bh) } });
  x.strokeStyle = k === "b" ? "#7fa8f0" : "#e0a43a"; x.lineWidth = 2; x.beginPath(); var st = false;
  Y.t7.forEach(function (t, i) { if (t === null) { st = false; return } var px = i / (n - 1) * w, py = h - 4 - (t - lo) / (hi - lo) * (h - 8); if (!st) { x.moveTo(px, py); st = true } else x.lineTo(px, py) }); x.stroke();
 }
 x.fillStyle = "rgba(255,255,255,.35)"; x.font = "9px sans-serif"; [0, 3, 6, 9].forEach(function (m) { var dd = MD.slice(0, m).reduce(function (s, v) { return s + v }, 0); x.fillText(MON[m], dd / n * w + 2, 10) });
 var pos = (C.pos && C.pos[k]) || 0; x.strokeStyle = "#ff3b3b"; x.lineWidth = 2; x.beginPath(); x.moveTo(pos * w, 0); x.lineTo(pos * w, h); x.stroke();
}
function bars(c, A, B, lab, fmt, single) {
 var F = fit(c), x = F.x, w = F.w, h = F.h, padL = 34, padB = 16, vals = A.slice(1).concat(single ? [] : B.slice(1)).filter(function (v) { return v !== null && isFinite(v) });
 var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals)); if (hi === lo) hi = lo + 1; var pr = (hi - lo) * .08; hi += pr; if (lo < 0) lo -= pr;
 var Y = function (v) { return 4 + (hi - v) / (hi - lo) * (h - padB - 4) }, gw = (w - padL) / 12;
 x.strokeStyle = "rgba(255,255,255,.12)"; x.fillStyle = "rgba(255,255,255,.45)"; x.font = "10px sans-serif"; x.lineWidth = 1;
 [lo, (lo + hi) / 2, hi].forEach(function (v) { x.beginPath(); x.moveTo(padL, Y(v)); x.lineTo(w, Y(v)); x.stroke(); x.fillText(fmt(v), 2, Y(v) + 3) });
 for (var m = 1; m <= 12; m++) {
  var x0 = padL + (m - 1) * gw; x.fillStyle = "rgba(255,255,255,.45)"; x.fillText(MON[m - 1][0], x0 + gw / 2 - 3, h - 3);
  if (lab === "line") continue;
  if (single) { var v = A[m]; if (v === null) continue; x.fillStyle = v > 0 ? "#ff6b5a" : "#6fb3ff"; x.fillRect(x0 + gw * .2, Math.min(Y(v), Y(0)), gw * .6, Math.abs(Y(v) - Y(0))) }
  else { [[B[m], "#7fa8f0", .12], [A[m], "#e0a43a", .5]].forEach(function (s) { if (s[0] === null) return; x.fillStyle = s[1]; x.fillRect(x0 + gw * s[2], Math.min(Y(s[0]), Y(0)), gw * .38, Math.abs(Y(s[0]) - Y(0))) }) }
 }
 if (lab === "line") [[B, "#7fa8f0"], [A, "#e0a43a"]].forEach(function (s) { x.strokeStyle = s[1]; x.lineWidth = 2.2; x.beginPath(); var st = false; for (var m2 = 1; m2 <= 12; m2++) { var v2 = s[0][m2]; if (v2 === null) { st = false; continue } var px = padL + (m2 - .5) * gw; if (!st) { x.moveTo(px, Y(v2)); st = true } else x.lineTo(px, Y(v2)) } x.stroke() });
}
function drawAll() {
 var D = C.data; if (!D) return; ["b", "a", "d"].forEach(function (k) { yearChart(k); line(k) });
 bars($("cmpc1"), D.A.s.mt, D.B.s.mt, "line", function (v) { return v.toFixed(0) + "°" });
 bars($("cmpc2"), D.A.s.mp, D.B.s.mp, "bars", function (v) { return Math.round(v) });
 var dm = []; for (var m = 1; m <= 12; m++) dm[m] = D.A.s.mt[m] === null || D.B.s.mt[m] === null ? null : D.A.s.mt[m] - D.B.s.mt[m];
 bars($("cmpc3"), dm, null, "bars", function (v) { return (v > 0 ? "+" : "") + v.toFixed(1) }, true);
}
function line(k) { var pos = (C.pos && C.pos[k]) || 0, l = $("cmpl" + k); if (l) l.style.left = "calc(" + (pos * 100).toFixed(3) + "% - 1px)"; var tt = $("cmpt" + k); if (tt) tt.textContent = fmtT(pos * C.len) + " / " + fmtT(C.len) }
function fmtT(ms) { var s = Math.round(ms / 1000); if (s < 120) return s + "s"; var m = Math.floor(s / 60); if (m < 120) return m + "m " + String(s % 60).padStart(2, "0") + "s"; return Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m" }

/* ---------------- 6. the table and the notes ---------------- */
function table() {
 var D = C.data; if (!D) return; var B = D.B.s, A = D.A.s, rows = [];
 var r = function (name, b, a, d, unit) { rows.push("<tr><td>" + esc(name) + "</td><td>" + b + "</td><td>" + a + "</td><td>" + d + "</td></tr>") }, g = function (t) { rows.push('<tr class="grp"><td colspan="4">' + esc(t) + "</td></tr>") };
 var num = function (k, d, u) { r(k[0], f1(B[k[1]], d) + u, f1(A[k[1]], d) + u, sg(A[k[1]] - B[k[1]], d) + u) };
 g("Temperature");
 num(["Average temperature", "t"], 1, " °C"); num(["Average daily high", "tx"], 1, " °C"); num(["Average nightly low", "tn"], 1, " °C");
 r("Hottest day", B.hot ? f1(B.hot.tx) + " °C, " + fmtD(B.hot.d) : "n/a", A.hot ? f1(A.hot.tx) + " °C, " + fmtD(A.hot.d) : "n/a", B.hot && A.hot ? sg(A.hot.tx - B.hot.tx) + " °C" : "n/a");
 r("Coldest night", B.cold ? f1(B.cold.tn) + " °C, " + fmtD(B.cold.d) : "n/a", A.cold ? f1(A.cold.tn) + " °C, " + fmtD(A.cold.d) : "n/a", B.cold && A.cold ? sg(A.cold.tn - B.cold.tn) + " °C" : "n/a");
 r("Very hot days (high of 35 °C or more)", B.hotDays, A.hotDays, sg(A.hotDays - B.hotDays, 0));
 r("Frost nights (below 0 °C)", B.frost, A.frost, sg(A.frost - B.frost, 0));
 r("Compared with this place's 1981–2010 average", sg(B.tAnom, 2) + " °C", sg(A.tAnom, 2) + " °C", "");
 g("Rain");
 r("Total rainfall", Math.round(B.rain) + " mm", Math.round(A.rain) + " mm", sg(A.rain - B.rain, 0) + " mm" + (B.rain > 0 ? " (" + sg((A.rain - B.rain) / B.rain * 100, 0) + "%)" : ""));
 r("Rainy days (1 mm or more)", B.rainy, A.rainy, sg(A.rainy - B.rainy, 0));
 r("Wettest day", B.wet ? Math.round(B.wet.pr) + " mm, " + fmtD(B.wet.d) : "n/a", A.wet ? Math.round(A.wet.pr) + " mm, " + fmtD(A.wet.d) : "n/a", B.wet && A.wet ? sg(A.wet.pr - B.wet.pr, 0) + " mm" : "n/a");
 r("Longest dry spell (days under 1 mm)", B.dry, A.dry, sg(A.dry - B.dry, 0));
 r("Compared with the 1981–2010 average", sg(B.pAnom, 0) + "%", sg(A.pAnom, 0) + "%", "");
 g("Air and sunshine");
 num(["Relative humidity", "rh"], 0, " %"); num(["Wind speed", "ws"], 1, " m/s"); num(["Sunshine reaching the ground", "sw"], 2, " kWh/m² a day");
 var Eb = B.ext || {}, Ea = A.ext || {}, nn = function (v, d, u) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (+v).toFixed(d) + (u || "") }, df = function (a, b, d, u) { return a === null || b === null || a === undefined || b === undefined || !isFinite(a) || !isFinite(b) ? "n/a" : sg(a - b, d) + (u || "") };
 g("Extremes and storms (daily record)");
 r("Heavy-rain days (50 mm or more)", Eb.heavy, Ea.heavy, df(Ea.heavy, Eb.heavy, 0)); r("Very heavy-rain days (100 mm or more)", Eb.vheavy, Ea.vheavy, df(Ea.vheavy, Eb.vheavy, 0));
 r("Wettest three days in a row", nn(Eb.w3, 0, " mm"), nn(Ea.w3, 0, " mm"), df(Ea.w3, Eb.w3, 0, " mm"));
 r("Hot nights (low of 25 °C or more)", Eb.hotN, Ea.hotN, df(Ea.hotN, Eb.hotN, 0)); r("Longest run of very hot days (35 °C or more)", nn(Eb.spell, 0, " days"), nn(Ea.spell, 0, " days"), df(Ea.spell, Eb.spell, 0, " days"));
 var wl = D.src === "power" ? "daily maximum wind at 10 m" : "strongest gust at 10 m";
 r("Strongest wind (" + wl + ")", Eb.wmax !== null && Eb.wmax !== undefined ? nn(Eb.wmax, 1, " m/s") + ", " + fmtD(Eb.wmaxDay) : "n/a", Ea.wmax !== null && Ea.wmax !== undefined ? nn(Ea.wmax, 1, " m/s") + ", " + fmtD(Ea.wmaxDay) : "n/a", df(Ea.wmax, Eb.wmax, 1, " m/s"));
 r(D.src === "power" ? "Windy days (daily maximum wind 10 m/s or more)" : "Gale-gust days (gusts 17 m/s or more)", D.src === "power" ? Eb.windy10 : Eb.windy17, D.src === "power" ? Ea.windy10 : Ea.windy17, df(D.src === "power" ? Ea.windy10 : Ea.windy17, D.src === "power" ? Eb.windy10 : Eb.windy17, 0));
 g("Clouds, moisture and haze");
 r("Cloud cover (average)", nn(Eb.cl, 0, " %"), nn(Ea.cl, 0, " %"), df(Ea.cl, Eb.cl, 0, " points"));
 r("Dew point (average; moisture in the air)", nn(Eb.td, 1, " °C"), nn(Ea.td, 1, " °C"), df(Ea.td, Eb.td, 1, " °C"));
 r(D.src === "power" ? "Root-zone soil wetness (0 = dry, 1 = saturated)" : "Soil moisture, top 1 m (m³ of water per m³)", nn(Eb.soil, 2), nn(Ea.soil, 2), df(Ea.soil, Eb.soil, 2));
 if (D.src === "power") r("Aerosol optical depth (haze, smoke, dust; MERRA-2, from about 2001)", nn(Eb.aod, 2), nn(Ea.aod, 2), df(Ea.aod, Eb.aod, 2));
 var X = D.ext || {}, Gb = X.gas && X.gas.b, Ga = X.gas && X.gas.a;
 g("Greenhouse gases (global averages, NOAA)");
 r("Carbon dioxide, CO₂ (Mauna Loa, from 1959)", nn(Gb && Gb.co2, 1, " ppm"), nn(Ga && Ga.co2, 1, " ppm"), df(Ga && Ga.co2, Gb && Gb.co2, 1, " ppm"));
 r("Methane, CH₄ (global, from 1983)", nn(Gb && Gb.ch4, 0, " ppb"), nn(Ga && Ga.ch4, 0, " ppb"), df(Ga && Ga.ch4, Gb && Gb.ch4, 0, " ppb"));
 r("Nitrous oxide, N₂O (global, from 2001)", nn(Gb && Gb.n2o, 1, " ppb"), nn(Ga && Ga.n2o, 1, " ppb"), df(Ga && Ga.n2o, Gb && Gb.n2o, 1, " ppb"));
 var Qb = X.aq && X.aq.b, Qa = X.aq && X.aq.a;
 g("Air quality at the place (CAMS, whole years from 2023)");
 [["Fine particles, PM2.5", "pm2_5", 1, " µg/m³"], ["Particles, PM10", "pm10", 1, " µg/m³"], ["Nitrogen dioxide, NO₂", "nitrogen_dioxide", 1, " µg/m³"], ["Sulphur dioxide, SO₂", "sulphur_dioxide", 1, " µg/m³"], ["Ozone, O₃ (near the ground)", "ozone", 0, " µg/m³"], ["Carbon monoxide, CO", "carbon_monoxide", 0, " µg/m³"], ["Dust", "dust", 1, " µg/m³"], ["Aerosol optical depth", "aerosol_optical_depth", 2, ""]].forEach(function (q) { r(q[0] + " (year average)", nn(Qb && Qb[q[1]], q[2], q[3]), nn(Qa && Qa[q[1]], q[2], q[3]), df(Qa && Qa[q[1]], Qb && Qb[q[1]], q[2], q[3])) });
 r("Days with PM2.5 above 15 µg/m³ (WHO daily guideline)", Qb && Qb.pmDaysOver15 !== undefined ? Qb.pmDaysOver15 : "n/a", Qa && Qa.pmDaysOver15 !== undefined ? Qa.pmDaysOver15 : "n/a", df(Qa && Qa.pmDaysOver15, Qb && Qb.pmDaysOver15, 0));
 var Vb = X.ev && X.ev.b, Va = X.ev && X.ev.a;
 g("Natural events within about 550 km (NASA EONET; thin before about 2015)");
 var cats = {}; [Vb, Va].forEach(function (v) { if (v) Object.keys(v.by).forEach(function (c) { cats[c] = 1 }) });
 r("All recorded events", Vb ? Vb.n : "n/a", Va ? Va.n : "n/a", Vb && Va ? sg(Va.n - Vb.n, 0) : "n/a");
 Object.keys(cats).sort().forEach(function (c) { var nm = function (v) { return v ? (v.by[c] || 0) + (v.names[c] && v.names[c].length ? " (" + v.names[c].slice(0, 3).join("; ") + (v.names[c].length > 3 ? "; …" : "") + ")" : "") : "n/a" }; r(c, esc(nm(Vb)), esc(nm(Va)), Vb && Va ? sg((Va.by[c] || 0) - (Vb.by[c] || 0), 0) : "n/a") });
 var Qb2 = X.eq && X.eq.b, Qa2 = X.eq && X.eq.a, qd = function (q) { return q ? q.n + (q.big ? " (largest M" + q.big.mag.toFixed(1) + ", " + fmtD(q.big.date) + ")" : "") : "n/a" };
 g("Earthquakes within 300 km (USGS, magnitude 4.5 and above)");
 r("Earthquakes", esc(qd(Qb2)), esc(qd(Qa2)), Qb2 && Qa2 ? sg(Qa2.n - Qb2.n, 0) : "n/a");
 var P = D.pics || {};
 if (P.b !== undefined || P.a !== undefined) {
  var mo = (P.b && P.b.modis) || (P.a && P.a.modis), mix = P.b && P.a && !!P.b.modis !== !!P.a.modis;
  g("From the pictures (the area shown; " + (mix ? "Landsat for one year and MODIS for the other, measured differently, so not compared" : mo ? "MODIS bands 7-2-1" : "Landsat") + ")");
  var pv = function (o, k) { return o && o[k] !== null && o[k] !== undefined ? (o[k] * 100).toFixed(1) + " %" : "n/a" }, pd = function (k) { var b = P.b && P.b[k], a = P.a && P.a[k]; return !mix && b !== null && b !== undefined && a !== null && a !== undefined ? sg((a - b) * 100, 1) + " points" : "n/a" };
  r(mo && !mix ? "Water (dark in near- and shortwave infrared)" : "Water-like surface (NDWI above 0)", pv(P.b, "water"), pv(P.a, "water"), pd("water"));
  r(mo && !mix ? "Green plants (near-infrared well above shortwave infrared)" : "Green vegetation (NDVI above 0.3)", pv(P.b, "veg"), pv(P.a, "veg"), pd("veg"));
  if (!mo || mix) r("Snow, ice or cloud (bright, NDWI above 0; not counted as water)", pv(P.b, "snow"), pv(P.a, "snow"), pd("snow"));
  if (D.seasOK === false) rows.push('<tr><td colspan="4" class="cmpnote">The two pictures were taken ' + D.seasGap + ' days apart in the year; their shares reflect the seasons as much as the years and are not scored in the verdict.</td></tr>');
 }
 $("cmptab").innerHTML = "<thead><tr><th></th><th>Before · " + D.y1 + "</th><th>After · " + D.y2 + "</th><th>Difference</th></tr></thead><tbody>" + rows.join("") + "</tbody>";
}
function srcName(D) { return D.src === "power" ? "NASA POWER daily (MERRA-2 reanalysis and satellite data), grid cell about 0.5° × 0.625° (roughly 55 × 65 km)" : "ERA5 reanalysis (ECMWF, Copernicus) through Open-Meteo, grid cell about 0.25° (roughly 25 km)" }
function notes() {
 var D = C.data; if (!D) return; var L = [];
 L.push("Climate numbers: " + srcName(D) + ". They describe the area around " + D.place.name + ", not the exact spot." + (D.why ? " ERA5 is used for both years because " + D.why + "." : "") + (D.warn ? " " + D.warn : ""));
 if (D.y1 < 1981) L.push("Before 1981 the numbers come from a reanalysis (a weather model fed with past observations). There were far fewer observations before weather satellites (1979), and fewer still before 1950, so early years are less certain.");
 if (D.bk && D.src === "power") L.push("NASA POWER's record at this place jumps around " + D.bk.y + " (a change in the model's input data, not the weather). Both years here are on the same side of it.");
 L.push("Two single years show weather as well as climate: one year can be unusual (for example an El Niño or La Niña year). A difference between two years is not a trend by itself." + (D.trend ? " For context, NASA POWER's long-term temperature trend here is " + sg(D.trend.slope * 10, 2) + " °C per decade (" + D.trend.from + "–" + D.trend.to + ", " + (D.trend.sig ? "a clear trend" : "not statistically clear") + ")." : ""));
 L.push("Music: each day is compared with this place's 1981–2010 normal for that month (7-day averages); cooler and wetter than normal sounds brighter, warmer and drier sounds darker, the same rule as the site's land modes. Difference: brighter means After was better off than Before on that day.");
 var P = D.pics || {};
 if ((P.b && P.b.wayback) || (P.a && P.a.wayback)) L.push("Sharp pictures: Esri World Imagery Wayback (archived versions of the imagery used in map mode; Maxar, Airbus and aerial surveys), for areas up to 20 km from about 2010. The capture date shown is Esri's own record for this spot. These pictures are not NASA data and have no near-infrared band, so the water and plant shares are measured from Landsat for the same year.");
 if ((P.b && P.b.modis) || (P.a && P.a.modis)) L.push("Pictures: NASA Terra and Aqua MODIS corrected-reflectance true colour (250 m) from NASA GIBS, used for areas wider than 100 km and for open water Landsat does not photograph; the clearest of several days in the chosen season. Water and green-plant shares for MODIS pictures are read from the NASA GIBS MODIS bands 7-2-1 picture of the same day (shortwave infrared, near infrared and red light): water where both infrared bands are dark, green plants where near-infrared is well above shortwave infrared and red light, leaving out missing and cloud-white pixels. This is a colour classification of 250 m pixels, so narrow rivers, cloud shadows and haze shift the shares by a few points; Landsat and MODIS shares are not compared with each other.");
 if ((P.b && !P.b.modis) || (P.a && !P.a.modis)) L.push("Pictures: NASA/USGS Landsat Collection 2 surface reflectance (30 m), via Microsoft's Planetary Computer; the clearest scenes in the chosen season, with After matched to the time of year of Before where possible. Water and vegetation shares are computed from the picture's red, green and near-infrared bands (NDWI above 0, NDVI above 0.3); bright surfaces with NDWI above 0 (snow, ice or cloud: green reflectance 0.3 or more) are counted separately, not as water; they are compared in the verdict only when both pictures were taken within 45 days of each other in the year; seasons, clouds, haze and different Landsat sensors (TM, ETM+, OLI) all shift these numbers a little.");
 L.push("Extremes, clouds, moisture and haze come from the same daily record as the climate numbers (" + (D.src === "power" ? "NASA POWER: daily maximum 10 m wind, cloud amount, root-zone soil wetness, dew point, and MERRA-2 aerosol optical depth from about 2001" : "ERA5: daily maximum 10 m gusts, cloud cover, dew point and top-1 m soil moisture") + "). Wind and soil numbers from NASA POWER and ERA5 are measured differently and should not be compared with each other.");
 L.push("Greenhouse gases: NOAA Global Monitoring Laboratory annual means (CO₂ at Mauna Loa, CH₄ and N₂O global averages). They are well mixed, so they describe the whole atmosphere, not this place.");
 L.push("Air quality: CAMS global atmospheric composition forecasts and analyses (Copernicus/ECMWF) through Open-Meteo, about 40 km grid; the archive starts in August 2022, so only whole years from 2023 are shown.");
 L.push("Natural events: NASA EONET (Earth Observatory Natural Event Tracker) within about 550 km. EONET lists notable events (named storms, large fires, eruptions, floods) and is thin before about 2015, so a count of zero does not prove nothing happened. Fire detections from NASA FIRMS need a personal key and are not included.");
 L.push("Earthquakes: USGS ComCat, magnitude 4.5 and above within 300 km. Earthquakes are not caused by weather or climate; they are listed because they can change the land (landslides, river courses) that the pictures show.");
 if (D.capped) L.push("The pictures show the central 100 km of " + D.place.name + ": the whole place is wider, and pictures of wider areas (NASA MODIS) only start in 2000, so Landsat is used for both years.");
 if (D.km > 100 && D.y1 < 2000) L.push("This area is wider than 100 km, so its pictures come from NASA MODIS, which starts in 2000; years before that have numbers and music but no picture.");
 if (D.y1 < PICY || D.y2 < PICY) L.push("Landsat surface pictures start in 1982, so a year before that has numbers and music but no picture.");
 $("cmpnotes").innerHTML = L.map(function (t) { return "<li>" + esc(t) + "</li>" }).join("");
}

/* ---------------- 7. music ---------------- */
function series(k) { var D = C.data; return k === "b" ? D.B.h : k === "a" ? D.A.h : D.Dh }
function toggle(k) {
 if (!C.data) return;
 if (C.play && C.play.k === k) { if (C.play.on) pause2(); else resume2(); return }
 stopPlay2(); if (window.tplaying && typeof stopPlay === "function") stopPlay();
 C.play = { k: k, on: false }; resume2();
}
function resume2() {
 var P = C.play; if (!P) return; var h = series(P.k), n = h.length, ms = Math.max(30, C.len / n);
 if (C.pos[P.k] >= .999) C.pos[P.k] = 0;
 if (!P.saved) P.saved = { m: window.MUTE, w: window.EICWAIT }; window.EICWAIT = false;
 if (!window.playing) $("play").click();
 P.on = true; $("cmpp" + P.k).innerHTML = "&#10074;&#10074;"; $("cmpp" + P.k).classList.add("on");
 var t0 = performance.now() - C.pos[P.k] * C.len;
 var step = function () {
  if (!C.play || C.play !== P || !P.on) return;
  var f = Math.min(1, (performance.now() - t0) / C.len), i = Math.min(n - 1, Math.floor(f * n)), v = h[i];
  window.MUTE = v === null || v === undefined; if (!window.MUTE) window.T = v;
  C.pos[P.k] = f; line(P.k); yearChart(P.k);
  if (f >= 1) { pause2(); C.pos[P.k] = 1; line(P.k); yearChart(P.k); C.play = null; status("Finished. Press play to hear it again, or click the graph to start from another day."); if (typeof window.onCompareEnd === "function") try { window.onCompareEnd(P.k) } catch (e) {} return }
  P.tm = setTimeout(step, Math.min(ms, 250));
 };
 step();
}
/* pausing silences the music and gives the page back its own mute settings */
function pause2() { var P = C.play; if (!P) return; P.on = false; clearTimeout(P.tm); $("cmpp" + P.k).innerHTML = "&#9654;"; $("cmpp" + P.k).classList.remove("on");
 if (window.playing) $("play").click(); if (P.saved) { window.MUTE = P.saved.m; window.EICWAIT = P.saved.w; P.saved = null } }
function stopPlay2() { if (C.play) pause2(); C.play = null }
function seek(k, e) { if (!C.data) return; var r = $("cmpg" + k).getBoundingClientRect(), f = cl((e.clientX - r.left) / r.width, 0, 1); var was = C.play && C.play.k === k && C.play.on; if (was) pause2(); C.pos[k] = f; line(k); yearChart(k); if (was) resume2() }
function setLen() {
 var v = +$("cmplenv").value, u = +$("cmplenu").value, ms = v * u;
 if (!(ms >= 6000 && ms <= 12 * 3600000)) { status("Choose a music length between 0.1 minutes and 12 hours."); return }
 var was = C.play && C.play.on; if (was) pause2(); C.len = ms; $("cmplen").textContent = "Music length: " + (u === 3600000 ? v + (v === 1 ? " hour" : " hours") : v + " min"); $("cmplened").hidden = true;
 ["b", "a", "d"].forEach(line); if (was) resume2(); status("Each year now plays over " + fmtT(ms) + ".");
}

/* ---------------- 8. optional SI overview (one chat question) ---------------- */
function facts() {
 var D = C.data, B = D.B.s, A = D.A.s, P = D.pics || {}, L = [];
 L.push("Place: " + D.place.full + " (" + D.place.lat.toFixed(3) + ", " + D.place.lon.toFixed(3) + "); picture area about " + D.km.toFixed(1) + " km wide.");
 L.push("Climate source for both years: " + srcName(D) + "." + (D.why ? " Reason ERA5 is used: " + D.why + "." : "") + (D.warn ? " " + D.warn : ""));
 [["Before", D.y1, B, P.b], ["After", D.y2, A, P.a]].forEach(function (z) { var s = z[2];
  L.push(z[0] + " (" + z[1] + "): average temperature " + f1(s.t) + " °C (" + sg(s.tAnom, 2) + " °C compared with 1981-2010), average high " + f1(s.tx) + " °C, low " + f1(s.tn) + " °C, " + s.hotDays + " days at 35 °C or more, " + s.frost + " frost nights; rainfall " + Math.round(s.rain) + " mm (" + sg(s.pAnom, 0) + "% compared with 1981-2010) on " + s.rainy + " rainy days, longest dry spell " + s.dry + " days; humidity " + f1(s.rh, 0) + "%, wind " + f1(s.ws) + " m/s, sunshine " + f1(s.sw, 2) + " kWh/m2 a day.");
  if (z[3] && z[3].used && z[3].used.length) L.push(z[0] + " picture: " + z[3].used.map(function (u) { return u.sat + " " + u.date + (u.wb ? " (capture date)" : " (" + Math.round(u.cloud) + "% cloud)") }).join("; ") + "; water-like surface " + (z[3].water === null ? "n/a" : (z[3].water * 100).toFixed(1) + "%") + ", green vegetation " + (z[3].veg === null ? "n/a" : (z[3].veg * 100).toFixed(1) + "%") + ", bright snow, ice or cloud " + (z[3].snow === null || z[3].snow === undefined ? "n/a" : (z[3].snow * 100).toFixed(1) + "%") + " of the area.");
  else L.push(z[0] + " picture: none (" + (z[1] < PICY ? "Landsat surface pictures start in 1982" : D.km > 100 && z[1] < 2000 ? "MODIS pictures of areas this wide start in 2000" : z[3] && z[3].err ? "the picture archive could not be reached" : "no clear scene found") + ").");
 });
 [["Before", D.y1, B], ["After", D.y2, A]].forEach(function (z) { var e = z[2].ext || {}; L.push(z[0] + " extremes (" + z[1] + "): " + e.heavy + " days with 50 mm or more of rain (" + e.vheavy + " with 100 mm or more), wettest 3 days " + f1(e.w3, 0) + " mm, " + e.hotN + " nights with a low of 25 °C or more, longest run of 35 °C days " + e.spell + ", strongest " + (D.src === "power" ? "daily maximum wind" : "gust") + " " + f1(e.wmax) + " m/s, cloud cover " + f1(e.cl, 0) + "%, dew point " + f1(e.td) + " °C, " + (D.src === "power" ? "root-zone soil wetness " + f1(e.soil, 2) + " (0-1), aerosol optical depth " + f1(e.aod, 2) : "soil moisture " + f1(e.soil, 2) + " m3/m3") + ".") });
 var X = D.ext || {};
 if (X.gas && (X.gas.b || X.gas.a)) L.push("Global greenhouse gases (NOAA annual means): CO2 " + f1(X.gas.b && X.gas.b.co2) + " ppm in " + D.y1 + " and " + f1(X.gas.a && X.gas.a.co2) + " ppm in " + D.y2 + "; CH4 " + f1(X.gas.b && X.gas.b.ch4, 0) + " and " + f1(X.gas.a && X.gas.a.ch4, 0) + " ppb; N2O " + f1(X.gas.b && X.gas.b.n2o) + " and " + f1(X.gas.a && X.gas.a.n2o) + " ppb (n/a = before that record starts).");
 [["Before", D.y1, X.aq && X.aq.b], ["After", D.y2, X.aq && X.aq.a]].forEach(function (z) { if (z[2]) L.push(z[0] + " air quality (CAMS, " + z[1] + " average): PM2.5 " + f1(z[2].pm2_5) + ", PM10 " + f1(z[2].pm10) + ", NO2 " + f1(z[2].nitrogen_dioxide) + ", SO2 " + f1(z[2].sulphur_dioxide) + ", O3 " + f1(z[2].ozone, 0) + ", CO " + f1(z[2].carbon_monoxide, 0) + " ug/m3; aerosol optical depth " + f1(z[2].aerosol_optical_depth, 2) + "; " + z[2].pmDaysOver15 + " days with PM2.5 above 15 ug/m3.") });
 [["Before", D.y1, X.ev && X.ev.b], ["After", D.y2, X.ev && X.ev.a]].forEach(function (z) { if (z[2]) L.push(z[0] + " natural events within about 550 km (NASA EONET, " + z[1] + "): " + (z[2].n ? Object.keys(z[2].by).map(function (c) { return c + " " + z[2].by[c] + " (" + z[2].names[c].slice(0, 4).join("; ") + ")" }).join(", ") : "none recorded") + (z[1] < 2015 ? " - note EONET is thin before about 2015." : ".")) });
 [["Before", D.y1, X.eq && X.eq.b], ["After", D.y2, X.eq && X.eq.a]].forEach(function (z) { if (z[2]) L.push(z[0] + " earthquakes M4.5+ within 300 km (USGS, " + z[1] + "): " + z[2].n + (z[2].big ? ", largest M" + z[2].big.mag.toFixed(1) + " on " + z[2].big.date + " (" + z[2].big.place + ")" : "") + ".") });
 if (D.seasOK === false) L.push("Caution: the two pictures were taken " + D.seasGap + " days apart in the year, so differences in water and plant shares mainly reflect the seasons and are not scored in the verdict.");
 if (D.over && D.over.verdict === "none") L.push("Site's overall comparison: no verdict given" + (D.over.why === "wait" ? " yet (the satellite pictures are still loading)" : ", because this place is mostly water and its water could not be measured from two comparable pictures") + "; do not state that either year was better or worse overall.");
 else if (D.over) L.push("Site's overall comparison (fixed scoring rule): " + D.y2 + " was " + (D.over.verdict === "same" ? "about the same as" : D.over.verdict + " than") + " " + D.y1 + " (score " + D.over.score.toFixed(2) + " from -1 to +1); main factors: " + D.over.parts.slice(0, 6).map(function (p) { return p.name + " " + (+p.b).toFixed(p.d) + " to " + (+p.a).toFixed(p.d) + p.unit + (p.s <= -.15 ? " (worse)" : p.s >= .15 ? " (better)" : " (little change)") }).join("; ") + ".");
 L.push("Differences (After minus Before): temperature " + sg(A.t - B.t, 2) + " °C, daily high " + sg(A.tx - B.tx, 2) + " °C, very hot days " + sg(A.hotDays - B.hotDays, 0) + ", rainfall " + sg(A.rain - B.rain, 0) + " mm, rainy days " + sg(A.rainy - B.rainy, 0) + ", humidity " + sg(A.rh - B.rh, 0) + " points.");
 if (D.trend) L.push("Long-term context: NASA POWER temperature trend at this place " + sg(D.trend.slope * 10, 2) + " °C per decade over " + D.trend.from + "-" + D.trend.to + " (" + (D.trend.sig ? "statistically clear at 95%" : "not statistically clear") + ").");
 if (D.bk) L.push("Data caution: NASA POWER's record at this place jumps around " + D.bk.y + " because of a change in the model's input data." + (D.src === "era5" ? " That is why ERA5 is used for both years." : " Both years are on the same side of the jump."));
 if (D.y1 < 1981) L.push("Data caution: " + D.y1 + " is before 1981; reanalysis for early years rests on far fewer observations (before weather satellites in 1979, and fewer still before 1950).");
 if (D.deep && D.deep.done && window.EJD) EJD.facts(D.deep).forEach(function (f) { L.push(f) });
 return L;
}
/* ---------------- in-depth research (deep.js, window.EJD) ---------------- */
/* runs once per comparison; the PDF and blind assistance call it too and wait for the same run */
function deep(force) {
 var D = C.data; if (!D) return Promise.reject(new Error("set up a comparison first")); if (!window.EJD) return Promise.reject(new Error("the research tools have not loaded yet"));
 if (D.deep && D.deep.done && !force) return Promise.resolve(D.deep);
 if (D.deepP) return D.deepP;
 var b = $("cmpdeep"), st = $("cmpdeepst"); b.disabled = true;
 D.deepP = EJD.run(D, function (m) { if (C.data === D) st.textContent = m }).then(function (R) { D.deepP = null; b.disabled = false; if (C.data === D) renderDeep(); return R }, function (e) { D.deepP = null; b.disabled = false; throw e });
 return D.deepP;
}
function renderDeep() {
 var D = C.data, R = D && D.deep, box = $("cmpdeepbox"); if (!R) { box.innerHTML = ""; return }
 var h = "";
 if (R.H) h += "<p><b>Kind of place:</b> " + esc(R.H.label) + " (NASA MODIS land cover " + R.H.year + ": " + esc(R.H.pinName.toLowerCase()) + " at the point" + (R.H.mangrove > 0 ? "; mangroves cover " + (R.H.mangrove * 100).toFixed(0) + "% of the 20 km around it in the 2000 mangrove map" : "") + ").</p>";
 R.items.forEach(function (it, n) {
  h += "<h4>" + esc(it.title) + "</h4><p>" + esc(it.text) + "</p>";
  if (it.figs && it.figs.length) h += '<div class="dfig">' + it.figs.map(function (f, k) { return '<canvas id="cmpdf_' + n + "_" + k + '" data-w="520" data-h="' + (f.type === "map" ? 470 : 260) + '" style="width:100%;max-width:' + (f.type === "map" ? 620 : 640) + 'px;aspect-ratio:' + (f.type === "map" ? "520/470" : "520/260") + ';height:auto" role="img" aria-label="' + esc(it.title + (f.caption ? ", " + f.caption : "")) + '"></canvas>' }).join("") + "</div>";
  if (it.table) h += '<div class="dsc"><table><thead><tr>' + it.table.head.map(function (c) { return "<th>" + esc(c) + "</th>" }).join("") + "</tr></thead><tbody>" + it.table.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>" }).join("") + "</tr>" }).join("") + "</tbody></table></div>";
 });
 if (R.errors.length) h += "<p class=\"cmpnote\">Could not be made this time: " + R.errors.map(function (e) { return esc(e[0]) + " (" + esc(e[1]) + ")" }).join("; ") + ".</p>";
 var refs = EJD.refsOf(R); if (refs.length) h += '<p class="dref"><b>Sources:</b> ' + refs.map(function (r) { return esc(r.text) + (r.url ? ' <a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.url.replace(/^https?:\/\//, "")) + "</a>" : "") }).join("<br>") + "</p>";
 box.innerHTML = h;
 /* drawn at the screen's real pixel density (and at least twice the layout size), so text and lines stay sharp */
 R.items.forEach(function (it, n) { (it.figs || []).forEach(function (f, k) { var c = $("cmpdf_" + n + "_" + k); if (!c) return; var cw = c.clientWidth || 520, sc = Math.max(2, (window.devicePixelRatio || 1) * cw / 520); c.width = Math.round(520 * sc); c.height = Math.round(+c.dataset.h * sc); try { EJD.draw(c, f, { dark: true, scale: sc }) } catch (e) {} }) });
}
/* the essay comes as Markdown: headings become bold lines */
function cmpFormat(t) { return aiFormat(String(t || "").replace(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/gm, "**$1**")) }
/* returns { ok, text } and shows it on the page; lang = the language to write in (blind assistance passes its own) */
async function overview(lang) {
 var D = C.data; if (!D) return { ok: false, why: "nodata" }; var box = $("cmpovbox"); box.hidden = false;
 if (typeof aiUsed === "function" && aiUsed() >= AI.cap) { box.textContent = "You have used today's " + AI.cap + " SI chat questions. The limit resets at midnight US Pacific time."; return { ok: false, why: "limit" } }
 box.textContent = "The SI is reading the numbers and published research. This can take up to a minute…"; $("cmpov").disabled = true;
 try {
  /* make sure the relay running this site knows how to write the essay before a chat question is spent */
  var vu = window.ASSISTANT_URL ? String(window.ASSISTANT_URL).replace(/\/$/, "") + "/version" : "api/version", vj = null;
  try { var vr = await fetch(vu, { cache: "no-store" }); if (vr.ok) vj = await vr.json() } catch (e) {}
  if (!vj || !vj.v || vj.v < "2026-11-07b") { box.innerHTML = "<b>The SI relay on this computer is an old version</b>, so it cannot write the research essay. No chat question was used.<br>Close the black window (the one running get_eic_frames.py) and start it again. After that it updates itself whenever the site is updated."; return { ok: false, why: "old" } }
  var res = await fetch(window.ASSISTANT_URL || "api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "Write a research essay on what changed at " + D.place.name + " between " + D.y1 + " and " + D.y2 + ", the possible causes, and what can and cannot be concluded.", compare: true, research: true, facts: facts(), lang: lang || "English", vid: ejVid(), mode: ejMode(), context: "Compare mode" }) }), j = null;
  try { j = await res.json() } catch (e) {}
  if (res.ok && j && j.answer) { if (typeof aiCount === "function") aiCount();
   var src = (j.sources || []).filter(function (x) { return x && /^https?:/.test(x.uri || "") }).slice(0, 12);
   C.ov = { text: String(j.answer), sources: src, lang: lang || "English", at: new Date().toISOString(), key: D.place.name + "|" + D.y1 + "|" + D.y2 };
   box.innerHTML = cmpFormat(j.answer) + (src.length ? '<p class="cmpnote"><b>Published sources the SI read:</b></p><ol class="cmpsrc">' + src.map(function (x) { return '<li><a href="' + esc(x.uri) + '" target="_blank" rel="noopener">' + esc(x.title || x.uri) + "</a></li>" }).join("") + "</ol>" : "") +
    '<p class="cmpnote">Written by the SI from the NASA, NOAA, USGS and Copernicus numbers on this page' + (src.length ? " and the published sources listed above" : "") + '. Check the sources before quoting. ' + (j.left !== undefined ? "Chat questions left today: " + j.left + "." : "") + "</p>"; try { aiFoot() } catch (e) {} return { ok: true, text: j.answer } }
  var why = (j && j.error) || "HTTP " + res.status; box.textContent = "The SI overview could not be made (" + why + ")."; return { ok: false, why: res.status === 429 && /limit|allowance|used up/.test(why) ? "limit" : "net" };
 } catch (e) { box.textContent = "The SI could not be reached. Check that the site's relay is running."; return { ok: false, why: "net" } }
 finally { $("cmpov").disabled = false }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject); else inject();
/* for blind assistance and tests */
function setYears(a, b) { if (a) $("cmpy1").value = a; if (b) $("cmpy2").value = b }
function setLenMs(ms) { var was = C.play && C.play.on; if (was) pause2(); C.len = ms; var m = ms / 60000; $("cmplen").textContent = "Music length: " + (m >= 60 ? m / 60 + (m === 60 ? " hour" : " hours") : m + " min"); if (C.data) ["b", "a", "d"].forEach(line); if (was) resume2() }
function playState() { return C.play ? { k: C.play.k, on: C.play.on } : null }
window.CMPX = { C: C, setup: setup, pick: pick, toggle: toggle, facts: facts, scenes: scenes, picture: picture, findPlaces: findPlaces, keepPlace: keepPlace,
 open: open, close: close, isOpen: function () { return !$("cmp").hidden }, setYears: setYears, setLenMs: setLenMs, playState: playState, pause: function () { if (C.play && C.play.on) pause2() }, stop: stopPlay2, overview: overview, deep: deep, renderDeep: renderDeep,
 status: function () { return $("cmpst").textContent }, years: function () { return [+$("cmpy1").value, +$("cmpy2").value] }, LASTY: LASTY, FIRSTY: FIRSTY };
})();
