/* Earth Jukebox Physical Solutions (2026-11-12).
   Machines and programmes that act on climate change, in three groups: Domestic (homemade builds), Industrial (company scale)
   and Municipal (city and government scale). Each finished model has four parts, published with the site in solutions/<id>/:
   a build document (PDF), a financial statement (PDF), an interactive 3D model (solutions/<id>/model.json, drawn here with
   three.js, which the site already loads) and a presentation (PDF to read, PowerPoint to download).
   The 3D model is built from simple shapes (boxes, cylinders, tubes, rods); the PDFs' pictures are drawn from the same file.
   Keyboard: every part is also a button in the part list, so the model can be explored without a mouse. Nothing is saved. */
(function () {
  if (window.EJSOL) return;
  var $ = function (id) { return document.getElementById(id) };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }
  var V = "?v=2026-11-12zb";

  var GROUPS = [
    { id: "domestic", title: "Domestic", sub: "Homemade builds for homes, farms and schools, made by a team with intermediate to advanced robotics skills." },
    { id: "industrial", title: "Industrial", sub: "Machines and services a medium or large company can make and run at scale." },
    { id: "municipal", title: "Municipal", sub: "Public infrastructure that needs a city or a national government." }
  ];
  /* ready: true when all four parts are published */
  var MODELS = [
    { id: "paddy-jukebox", g: "domestic", name: "Paddy Jukebox", tag: "Rice methane", line: "A solar stake that tells rice farmers, by sound, when to re-flood a field, cutting methane with Alternate Wetting and Drying.", ready: true,
      summary: "A solar-powered stake for one rice field. It measures the water in a standard field tube every 10 minutes and plays short tunes: get ready, irrigate now, rain is coming so wait, and well done. That makes Alternate Wetting and Drying easy to follow, which cuts paddy methane by up to 48 percent and water use by up to 30 percent. It needs no phone, no screen and no reading, runs for about 46 days without sun, and reports to Earth Jukebox when Wi-Fi is in range. Parts cost about 79 dollars for one unit.",
      pages: { build: 14, finance: 6, slides: 11 } },
    { id: "jukebox-siren", g: "domestic", name: "Jukebox Siren", tag: "Warnings", line: "A box that plays a distinct tune and a spoken message before floods, dangerous heat and storms.", ready: true,
      summary: "A small box for a home, classroom, clinic or prayer hall. Every 15 minutes it checks free forecast feeds, NASA's natural-event tracker and official alerts, and plays a distinct tune and a spoken message before dangerous heat, heavy rain, river floods or storms, so people who cannot read a screen are warned too. A battery keeps it working through power cuts, and a line-out socket lets a community loudspeaker carry its warnings across a village. It keeps warning for about 12 hours in a power cut. Parts cost about 53 dollars for one unit.",
      pages: { build: 13, finance: 6, slides: 8 } },
    { id: "watt-song", g: "domestic", name: "Watt Song", tag: "Electricity", line: "Reads the home's electricity meter by its light and plays yesterday's use as a short song each morning.", ready: true,
      summary: "A light sensor taped over the blinking LED on the home's electricity meter counts every watt-hour. Each morning a small box plays yesterday as a 24-note song, higher notes for busier hours, in a major key for a lighter day and a minor key for a heavier one, and it plays a short alert when something big is left on. It never touches mains wiring, and its log appears in Earth Jukebox next to the place's NASA climate record, so a hot week is heard as weather, not waste. Studies of real-time energy feedback found household savings of 5 to 15 percent. Parts cost about 35 dollars for one unit.",
      pages: { build: 11, finance: 5, slides: 7 } },
    { id: "cool-conductor", g: "domestic", name: "Cool Conductor", tag: "Cooling", line: "Runs air conditioners and fans by infrared remote: off in empty rooms, and open the windows when outside is cooler.", ready: true,
      summary: "A small box that controls an air conditioner through its own infrared remote codes. It turns the AC off when the room has been empty for 20 minutes, keeps it at a sensible 26 °C with a fan, and plays a tune when opening the windows would cool the room for free because the outdoor air is cooler and no more humid. Nothing is wired into a socket, and its log appears in Earth Jukebox beside NASA's temperature record, so savings are judged against the weather. Air conditioners and fans use about a tenth of the world's electricity.",
      pages: { build: 11, finance: 5, slides: 7 } },
    { id: "biogas-guardian", g: "domestic", name: "Biogas Guardian", tag: "Methane leaks", line: "Watches a home biogas digester and sounds a spoken alarm when methane leaks.", ready: true,
      summary: "A watcher for a household biogas digester. Two methane sensors hang above the main gas valve and beside the stove and sound a spoken alarm if gas leaks; a probe in the slurry outlet tracks the digester's temperature so the family knows why gas runs low in cold months. Leaks matter: methane traps 27 to 30 times more heat than CO2 over 100 years, and a review found that leakage from small digesters may be as high as 40%, enough to undo their climate benefit. Parts cost about 58 dollars for one unit.",
      pages: { build: 10, finance: 5, slides: 7 } },
    { id: "sun-dryer", g: "domestic", name: "Sun Dryer", tag: "Food loss", line: "A solar crop dryer whose fan runs only when it removes moisture, and sings when the crop is dry.", ready: true,
      summary: "A wooden cabinet dryer heated by a glazed solar collector, for fruit, vegetables and fish. Two humidity sensors compare the air going in with the air going out, so a small solar-powered fan runs only while the air is carrying water away, and a vent flap closes at night so damp air cannot re-wet the crop. A load cell weighs the slowest tray and works out when the batch has reached its target moisture, then the box plays a song. Food lost between harvest and the shop was 13.3 percent of the world's food in 2023. Parts and materials cost about 160 dollars for one dryer.",
      pages: { build: 14, finance: 6, slides: 8 } },
    { id: "ground-truth-node", g: "domestic", name: "Ground Truth Node", tag: "Air and heat", line: "A street station that measures fine particles and heat, and checks NASA's numbers where people live.", ready: true,
      summary: "A small solar station for a school gate, clinic or market pole. Every 10 minutes it measures fine particles (PM2.5), air temperature and humidity, corrects the particle reading for humidity with a published US EPA method, and shows the air's state on a coloured light. Its readings sit in Earth Jukebox beside NASA's numbers for the same place, POWER temperature and the GEOS-CF air quality forecast, so a neighbourhood can hear where it is hotter or dirtier than the satellite-scale picture says. Parts cost about 100 dollars for one node.",
      pages: { build: 13, finance: 5, slides: 8 } },
    { id: "leak-hunter-rig", g: "industrial", name: "Leak Hunter Rig", tag: "Gas leaks", line: "A survey kit for crews that find and fix methane leaks in gas networks, guided by NASA EMIT plume data.", ready: true,
      summary: "A survey kit for gas-network crews: a wand that draws in air near pipes, joints and meters past a methane sensor, a hip box with GPS and a card logger, and a sound that rises in pitch as the gas reading rises, so the crew can walk towards a leak with eyes on the ground. Surveys are planned from NASA EMIT's public methane plume maps and from the network's own records; every reading is logged with its position, and fixed leaks are re-checked. It is a leak indicator, not a calibrated analyser. The IEA estimates natural gas operations emit 36 million tonnes of methane a year. Parts cost about 110 dollars per kit.",
      pages: { build: 11, finance: 5, slides: 8 } },
    { id: "solar-cold-room", g: "industrial", name: "Solar Cold Room", tag: "Food loss", line: "A solar walk-in cold room for markets, rented by the crate per day.", ready: true,
      summary: "A 3 m walk-in cold room for a fruit and vegetable market, cooled by an ordinary air conditioner with a CoolBot controller, powered by a 4 kW solar canopy and a battery for the night. Farmers and traders rent space by the crate per day. A monitor logs the temperature, counts crates in and out, warns when the door is left open, and posts the room's record to Earth Jukebox. The design follows proven pay-per-crate cold rooms, which keep produce fresh for about 21 days instead of 2. 13.3 percent of the world's food was lost between harvest and the shop in 2023. Parts and materials cost about 11,000 dollars (mostly estimates).",
      pages: { build: 11, finance: 6, slides: 8 } },
    { id: "market-digester", g: "industrial", name: "Market Digester", tag: "Food waste", line: "Turns market food waste into cooking gas and fertiliser instead of landfill methane.", ready: true,
      summary: "A prefabricated anaerobic digester for a fruit and vegetable market. Stallholders' food waste is weighed, shredded and fed in each day; bacteria turn it into biogas for the market's food stalls and into liquid fertiliser for nearby farms, instead of rotting in a dump. Methane sensors, a gas meter and a temperature probe watch the plant, sound an alarm for leaks, and log every kilogram and cubic metre, so the market can show what it saved. The world wasted 1.05 billion tonnes of food in 2022. At 500 kg of waste a day it would give about 64 m3 of biogas a day (an estimate).",
      pages: { build: 11, finance: 6, slides: 8 } },
    { id: "swap-station", g: "industrial", name: "Swap Station", tag: "Transport", line: "Solar-assisted battery swapping for electric rickshaws and scooters.", ready: true,
      summary: "A street cabinet with eight lockable slots of swappable lithium iron phosphate (LFP) battery packs for electric three-wheelers and scooters. A rider swaps a flat pack for a charged one in under a minute instead of waiting hours to charge. Under a 3 kW solar canopy, the station charges as many packs as it can while the sun shines and the rest from the grid at night, keeps a health record for every pack, and shows how much of each day's charging came from the sun. Electric two- and three-wheelers are the most electrified road transport segment: about 10 percent of the global fleet in 2025 (IEA).",
      pages: { build: 11, finance: 6, slides: 8 } },
    { id: "paddy-gateway", g: "industrial", name: "Paddy Gateway", tag: "Carbon credits", line: "Links hundreds of Paddy Jukebox stakes to one verified rice methane programme.", ready: true,
      summary: "A long-range radio gateway on a village rooftop. Each Paddy Jukebox stake gets a small LoRa radio that sends its field-water readings every 30 minutes, signed so they cannot be altered; the gateway collects them from fields up to about 2 km away, stores them, and forwards them over the host building's internet. A company running an Alternate Wetting and Drying programme gets one dated, per-field record of every wetting and drying cycle, and farmers keep hearing their tunes at the stake. Verra approved the first credits under its rice methodology VM0051 on 12 October 2026. Gateway parts cost about 120 dollars.",
      pages: { build: 11, finance: 6, slides: 8 } },
    { id: "siren-mast", g: "municipal", name: "Siren Mast", tag: "Warnings", line: "A solar warning tower that plays the national hazard tunes across a neighbourhood.", ready: true,
      summary: "A 6 m solar-powered pole with four horn loudspeakers. It receives official warnings over the mobile network, in the international Common Alerting Protocol or by SMS from authorised numbers, and plays the same short hazard tunes and spoken messages as the Jukebox Siren box, loud enough to cover open streets for a few hundred metres. A 50 Ah battery keeps it ready for about a week without sun or mains, and it reports its own health every hour so a city knows every mast will work. The UN says 24 hours' notice of a hazard can cut the damage by up to 30 percent. Parts, pole included, cost about 1,400 dollars per mast.",
      pages: { build: 14, finance: 6, slides: 8 } },
    { id: "heat-refuge-shelter", g: "municipal", name: "Heat Refuge Shelter", tag: "Heat", line: "A shaded, cool-roofed bus stop with drinking water, heat alerts and a sensor.", ready: true,
      summary: "A bus stop rebuilt as a small public refuge from heat. An insulated roof with a white cool coating and a planted west wall give deep shade; a shaded tank and tap give free drinking water; and a solar control box measures the heat index under the roof, shows it in large digits, plays official heat alerts and, at the press of a button, speaks heat advice in local languages. Its readings sit in Earth Jukebox beside NASA's temperature record, so a city can see which stops are hottest and where to build next. About 489,000 people died from heat each year from 2000 to 2019, 45 percent of them in Asia. Parts and materials cost about 2,400 dollars per shelter.",
      pages: { build: 12, finance: 6, slides: 8 } },
    { id: "organics-station", g: "municipal", name: "Neighbourhood Organics Station", tag: "Food waste", line: "A two-bin drop-off point with a small digester that keeps food waste out of landfill.", ready: true,
      summary: "A small public station run by the city. Households bring food scraps to a weighing bin and garden waste to a compost bay; a household number typed on a keypad records each drop so the neighbourhood can see its total and households can earn rewards. The food goes into a small digester whose gas runs a community kitchen; the garden waste becomes compost for parks. A methane sensor watches for leaks, and the station's daily kilograms play in Earth Jukebox. Households produce 60 percent of the world's food waste (UNEP, 2022). For about 100 kg of food a day it would give about 13 m3 of biogas (an estimate).",
      pages: { build: 11, finance: 6, slides: 8 } }
  ];

  var css = document.createElement("style");
  css.textContent =
    "#ejsol{position:fixed;inset:0;z-index:72;background:#0a1019;color:#e9edf2;font:16px/1.5 Figtree,'Segoe UI',system-ui,sans-serif;overflow-y:auto;opacity:0;transform:translateY(12px);transition:opacity .35s,transform .35s}#ejsol.on{opacity:1;transform:none}#ejsol[hidden]{display:none}" +
    "#ejsol *{box-sizing:border-box}#ejsol .top{position:sticky;top:0;z-index:2;background:linear-gradient(#0a1019 78%,rgba(10,16,25,0));padding:22px clamp(16px,4vw,48px) 14px}" +
    "#ejsol .row{max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}#ejsol h2{margin:0;margin-right:auto;font:500 clamp(24px,3vw,34px)/1.15 Unbounded,Figtree,sans-serif;letter-spacing:-.01em}" +
    "#ejsol .x{width:auto;padding:10px 16px;border-radius:999px;border:1px solid rgba(233,237,242,.2);background:transparent;color:#e9edf2;font:600 14px/1 Figtree,sans-serif;cursor:pointer}#ejsol .x:hover{border-color:rgba(233,237,242,.5)}#ejsol .x[hidden]{display:none}" +
    "#ejsol .lead{max-width:1240px;margin:8px auto 0;color:#a9b4c2;font-size:15px}" +
    "#ejsol .grp{max-width:1240px;margin:26px auto 0;padding:0 clamp(16px,4vw,48px)}#ejsol .grp h3{margin:0;font:500 22px/1.2 Unbounded,Figtree,sans-serif;color:#e7b25a}#ejsol .grp>p{margin:6px 0 16px;color:#93a0b0;font-size:14px;max-width:60em}" +
    "#ejsol .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));gap:22px}" +
    "#ejsol .card{display:flex;flex-direction:column;background:#1b2432;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25)}" +
    "#ejsol .pv{position:relative;aspect-ratio:16/10;background:#eef2f5;overflow:hidden}#ejsol .pv img{width:100%;height:100%;object-fit:cover;display:block}" +
    "#ejsol .pv.soon{background:radial-gradient(circle at 30% 30%,#22324a,#121a26);display:flex;align-items:center;justify-content:center;color:#6f7f93;font:500 14px Figtree,sans-serif}" +
    "#ejsol .pv .tag{position:absolute;left:12px;bottom:12px;padding:4px 10px;border-radius:999px;background:rgba(10,16,25,.8);color:#e9edf2;font-size:12px}" +
    "#ejsol .bd{padding:18px 20px 20px;display:flex;flex-direction:column;flex:1}#ejsol .bd h4{margin:0 0 6px;font-size:20px;line-height:1.25;font-weight:700}#ejsol .ds{color:#b9c3cf;font-size:14px;margin:0 0 16px}" +
    "#ejsol .bt{margin-top:auto;display:flex;gap:10px}#ejsol .bt button,#ejsol .bt a{flex:1;display:inline-flex;align-items:center;justify-content:center;padding:12px;border-radius:9px;border:0;cursor:pointer;font:700 15px/1 Figtree,sans-serif;text-decoration:none}" +
    "#ejsol .p1{background:#e7b25a;color:#1b1206}#ejsol .p1:hover{background:#f2c372}#ejsol .p2{background:#2a3546;color:#e9edf2}#ejsol .p2:hover{background:#334157}#ejsol button:disabled{background:#232c3a;color:#6f7f93;cursor:default}" +
    "#ejsol .bt button:focus-visible,#ejsol .bt a:focus-visible,#ejsol .x:focus-visible{outline:2px solid #6fd3ff;outline-offset:2px}" +
    "#ejsol .mh{max-width:1240px;margin:22px auto 0;padding:0 clamp(16px,4vw,48px);display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px;align-items:center}" +
    "#ejsol .mh img{width:100%;border-radius:14px;display:block;background:#eef2f5}#ejsol .mh .k{color:#e7b25a;font-size:13px;font-weight:700;letter-spacing:.04em}#ejsol .mh h3{margin:6px 0 10px;font:500 clamp(26px,3vw,36px)/1.15 Unbounded,Figtree,sans-serif}#ejsol .mh p{color:#c3ccd6;margin:0}" +
    "#ejsol .four{max-width:1240px;margin:28px auto 60px;padding:0 clamp(16px,4vw,48px);display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}@media (max-width:1100px){#ejsol .four{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:620px){#ejsol .four{grid-template-columns:1fr}}" +
    "#ejsol .four .pv{aspect-ratio:4/3;background:#dfe5ea}#ejsol .four .pv img{object-fit:cover;object-position:top}" +
    "#ejsol .four .n{color:#93a0b0;font-size:13px;margin:0 0 8px}" +
    "@media (max-width:820px){#ejsol .mh{grid-template-columns:1fr}}" +
    /* 3D viewer */
    "#ejs3d{position:fixed;inset:0;z-index:74;background:#0b1220;color:#e9edf2;font:15px/1.5 Figtree,'Segoe UI',system-ui,sans-serif;display:grid;grid-template-columns:minmax(0,1fr) 340px}#ejs3d[hidden]{display:none}#ejs3d *{box-sizing:border-box}" +
    "#ejs3d .cv{position:relative;min-height:0}#ejs3d canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none}#ejs3d canvas:active{cursor:grabbing}" +
    "#ejs3d .tb{position:absolute;left:14px;top:14px;right:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;pointer-events:none}#ejs3d .tb>*{pointer-events:auto}" +
    "#ejs3d .tb h2{margin:0 auto 0 4px;font:500 20px/1.2 Unbounded,Figtree,sans-serif;text-shadow:0 1px 6px #000}" +
    "#ejs3d button{width:auto;padding:9px 14px;border-radius:999px;border:1px solid rgba(233,237,242,.22);background:rgba(10,16,25,.75);color:#e9edf2;font:600 13px/1 Figtree,sans-serif;cursor:pointer}#ejs3d button:hover{border-color:rgba(233,237,242,.55)}#ejs3d button[aria-pressed=true]{background:#e7b25a;color:#1b1206;border-color:#e7b25a}" +
    "#ejs3d button:focus-visible{outline:2px solid #6fd3ff;outline-offset:2px}" +
    "#ejs3d .ex{position:absolute;left:14px;bottom:14px;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(10,16,25,.75);border:1px solid rgba(233,237,242,.18);font-size:13px}#ejs3d .ex input{width:160px;accent-color:#e7b25a}" +
    "#ejs3d .hint{position:absolute;right:14px;bottom:16px;color:#8d97a3;font-size:12px;text-align:right;text-shadow:0 1px 4px #000}" +
    "#ejs3d aside{background:#121a26;border-left:1px solid #1f2a3a;overflow-y:auto;padding:18px}#ejs3d aside h3{margin:0 0 4px;font-size:19px}#ejs3d aside .muted{color:#93a0b0;font-size:13px}" +
    "#ejs3d .info{background:#1b2432;border-radius:12px;padding:14px 16px;margin:10px 0 16px}#ejs3d .info p{margin:6px 0 0;color:#c3ccd6;font-size:14px}#ejs3d .info dl{margin:10px 0 0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:13px}#ejs3d .info dt{color:#93a0b0}#ejs3d .info dd{margin:0}#ejs3d .info a{color:#6fd3ff}" +
    "#ejs3d .pl{display:flex;flex-direction:column;gap:6px}#ejs3d .pl button{text-align:left;border-radius:9px;padding:9px 12px;background:#1b2432;border-color:#263244;font-weight:500}#ejs3d .pl button[aria-current=true]{border-color:#e7b25a;background:#2a2516}" +
    "#ejs3d .pl .cx{opacity:.7}" +
    "@media (max-width:820px){#ejs3d{grid-template-columns:1fr;grid-template-rows:60vh auto}#ejs3d aside{border-left:0;border-top:1px solid #1f2a3a}}";
  document.head.appendChild(css);

  var el = document.createElement("div"); el.id = "ejsol"; el.hidden = true; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ejsolt");
  el.innerHTML = '<div class="top"><div class="row"><button type="button" class="x" id="ejsolb" hidden>&larr; All models</button><h2 id="ejsolt">Physical Solutions</h2><button type="button" class="x" id="ejsolx">Close</button></div><p class="lead" id="ejsoll"></p></div><div id="ejsolm"></div>';
  document.body.appendChild(el);
  var back = null, CUR = null;

  function open(id) {
    back = document.activeElement; el.hidden = false; requestAnimationFrame(function () { el.classList.add("on") });
    if (id) showModel(id); else list();
  }
  function hide() { el.classList.remove("on"); setTimeout(function () { el.hidden = true }, 250); if (back && back.focus) try { back.focus() } catch (e) { } }
  $("ejsolx").addEventListener("click", hide);
  $("ejsolb").addEventListener("click", function () { list(CUR) });
  el.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("ejs3d").hidden) { e.stopPropagation(); if (CUR && !$("ejsolb").hidden) list(CUR); else hide() } });

  function card(m) {
    var pic = m.ready ? '<div class="pv"><img alt="" loading="lazy" src="solutions/' + m.id + "/thumb.jpg" + V + '"><span class="tag">' + esc(m.tag) + "</span></div>"
      : '<div class="pv soon"><span>In preparation</span><span class="tag">' + esc(m.tag) + "</span></div>";
    return '<article class="card">' + pic + '<div class="bd"><h4>' + esc(m.name) + '</h4><p class="ds">' + esc(m.line) + '</p><div class="bt">' +
      (m.ready ? '<button type="button" class="p1" data-open="' + m.id + '" aria-label="Open ' + esc(m.name) + '">Open</button>' : '<button type="button" disabled aria-label="' + esc(m.name) + ', in preparation">In preparation</button>') + "</div></div></article>";
  }
  function list(focusId) {
    CUR = null; $("ejsolb").hidden = true; $("ejsolt").textContent = "Physical Solutions";
    $("ejsoll").textContent = "Earth Jukebox lets people hear climate change. These are machines and programmes that act on it, each linked to NASA data and each with a build document, a financial statement, an interactive 3D model and a presentation.";
    $("ejsolm").innerHTML = GROUPS.map(function (g) {
      var L = MODELS.filter(function (m) { return m.g === g.id });
      return '<section class="grp" aria-labelledby="ejsg' + g.id + '"><h3 id="ejsg' + g.id + '">' + g.title + ' <span style="color:#93a0b0;font:500 14px Figtree,sans-serif">' + L.length + " models</span></h3><p>" + esc(g.sub) + '</p><div class="grid">' + L.map(card).join("") + "</div></section>";
    }).join("") + '<div style="height:60px"></div>';
    setTimeout(function () { var b = focusId && el.querySelector('[data-open="' + focusId + '"]'); (b || $("ejsolx")).focus() }, 60);
  }
  function fsize(url, node, pre) { fetch(url, { method: "HEAD" }).then(function (r) { var n = +r.headers.get("content-length"); if (r.ok && n) node.textContent = pre + " • " + (n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.round(n / 1e3) + " KB") }).catch(function () { }) }
  function showModel(id) {
    var m = MODELS.filter(function (x) { return x.id === id })[0]; if (!m || !m.ready) { list(); return }
    CUR = id; $("ejsolb").hidden = false; $("ejsolt").textContent = m.name; $("ejsoll").textContent = "";
    var b = "solutions/" + id + "/", G = GROUPS.filter(function (g) { return g.id === m.g })[0];
    var items = [
      { k: "build", img: "build.jpg", t: "Build document", d: "How it works, every part with prices, wiring, firmware, power use from NASA POWER sunshine, building, testing and safety.", n: "PDF • " + m.pages.build + " pages", read: b + "build.pdf", dl: b + "build.pdf" },
      { k: "finance", img: "finance.jpg", t: "Financial statement", d: "The lowest cost of making it well at 1, 10 and 100 units, break-even, and a three-year income statement, balance sheet and cash flow.", n: "PDF • " + m.pages.finance + " pages", read: b + "finance.pdf", dl: b + "finance.pdf" },
      { k: "model", img: "thumb.jpg", t: "Interactive 3D model", d: "Turn it, take it apart, and click any part to see what it does, its specification and its price.", n: "Runs in your browser", model: true },
      { k: "slides", img: "slides.jpg", t: "Presentation", d: "The idea in " + m.pages.slides + " slides, for talks and judges. Read opens it in the browser; Download gives the PowerPoint file.", n: "PowerPoint • " + m.pages.slides + " slides", read: b + "slides.pdf", dl: b + "slides.pptx" }
    ];
    $("ejsolm").innerHTML = '<div class="mh"><img alt="' + esc(m.name) + ' (3D model)" src="' + b + "thumb.jpg" + V + '"><div><div class="k">' + G.title.toUpperCase() + " • " + esc(m.tag.toUpperCase()) + "</div><h3>" + esc(m.name) + "</h3><p>" + esc(m.summary) + "</p></div></div>" +
      '<div class="four">' + items.map(function (it) {
        return '<article class="card"><div class="pv"><img alt="" src="' + b + it.img + V + '"></div><div class="bd"><h4>' + it.t + '</h4><p class="n" id="ejsn' + it.k + '">' + it.n + '</p><p class="ds">' + it.d + '</p><div class="bt">' +
          (it.model ? '<button type="button" class="p1" data-3d="' + id + '">Open 3D model</button>'
            : '<a class="p1" href="' + it.read + V + '" target="_blank" rel="noopener" aria-label="Read the ' + it.t.toLowerCase() + ' (opens in a new tab)">Read</a><a class="p2" href="' + it.dl + V + '" download aria-label="Download the ' + it.t.toLowerCase() + '">Download</a>') + "</div></div></article>";
      }).join("") + "</div>";
    fsize(b + "build.pdf", $("ejsnbuild"), "PDF • " + m.pages.build + " pages"); fsize(b + "finance.pdf", $("ejsnfinance"), "PDF • " + m.pages.finance + " pages"); fsize(b + "slides.pptx", $("ejsnslides"), "PowerPoint • " + m.pages.slides + " slides");
    setTimeout(function () { $("ejsolb").focus() }, 60);
  }
  $("ejsolm").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; if (b.dataset.open) showModel(b.dataset.open); else if (b.dataset["3d"]) viewer(b.dataset["3d"]) });

  /* ---------------- 3D viewer ---------------- */
  var vw = document.createElement("div"); vw.id = "ejs3d"; vw.hidden = true; vw.setAttribute("role", "dialog"); vw.setAttribute("aria-modal", "true"); vw.setAttribute("aria-labelledby", "ejs3dt");
  vw.innerHTML = '<div class="cv"><canvas id="ejs3dc" aria-label="3D model. Use the part list on the right to explore it with the keyboard."></canvas>' +
    '<div class="tb"><h2 id="ejs3dt">3D model</h2><button type="button" id="ejs3dr">Reset view</button><button type="button" id="ejs3ds" aria-pressed="true">Surroundings</button><button type="button" id="ejs3dx">Close</button></div>' +
    '<label class="ex">Take apart <input type="range" id="ejs3de" min="0" max="100" value="0"></label><div class="hint">Drag to turn • scroll to zoom • click a part • Reset view shows everything again</div></div>' +
    '<aside><h3 id="ejs3dn">Choose a part</h3><div class="muted" id="ejs3dk"></div><div class="info" id="ejs3di" aria-live="polite"><p>Click a part in the model or in the list below.</p></div><div class="muted" style="margin-bottom:8px">Parts</div><div class="pl" id="ejs3dl"></div></aside>';
  document.body.appendChild(vw);
  var W3 = null;
  function mat(T, c, o) { var m = new T.MeshStandardMaterial({ color: c, roughness: .62, metalness: .08, transparent: o < 1, opacity: o, side: o < 1 ? T.DoubleSide : T.FrontSide, depthWrite: o >= 1 }); return m }
  function shapeMesh(T, s) {
    var o = s.o == null ? 1 : s.o, g, mesh, grp = new T.Group();
    if (s.t === "box") { g = new T.BoxGeometry(s.s[0], s.s[1], s.s[2]); mesh = new T.Mesh(g, mat(T, s.c, o)) }
    else if (s.t === "cyl") { g = new T.CylinderGeometry(s.r, s.r, s.h, 28); mesh = new T.Mesh(g, mat(T, s.c, o)) }
    else if (s.t === "tube") { var pts = [new T.Vector2(s.ri, -s.h / 2), new T.Vector2(s.r, -s.h / 2), new T.Vector2(s.r, s.h / 2), new T.Vector2(s.ri, s.h / 2), new T.Vector2(s.ri, -s.h / 2)]; g = new T.LatheGeometry(pts, 40); mesh = new T.Mesh(g, mat(T, s.c, o)); mesh.material.side = T.DoubleSide }
    else if (s.t === "rod") {
      var a = new T.Vector3().fromArray(s.a), b = new T.Vector3().fromArray(s.b), d = b.clone().sub(a), L = d.length();
      g = new T.CylinderGeometry(s.r, s.r, L, 14); mesh = new T.Mesh(g, mat(T, s.c, o)); mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); mesh.position.copy(a.add(b).multiplyScalar(.5)); return mesh;
    }
    if (s.p) mesh.position.fromArray(s.p);
    if (s.rot) mesh.rotation.set(s.rot[0] * Math.PI / 180, s.rot[1] * Math.PI / 180, s.rot[2] * Math.PI / 180, "XYZ");
    return mesh;
  }
  function viewer(id) {
    var T = window.THREE; if (!T) { alert("The 3D engine could not load. Check the connection and try again."); return }
    vw.hidden = false; vw._back = document.activeElement;
    fetch("solutions/" + id + "/model.json" + V).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json() }).then(function (D) { build3d(T, D) }).catch(function (e) { $("ejs3di").innerHTML = "<p>The model could not be loaded (" + esc(e.message) + ").</p>" });
  }
  function build3d(T, D) {
    stop3d();
    var cv = $("ejs3dc"), r; try { r = new T.WebGLRenderer({ canvas: cv, antialias: true }) } catch (e) { $("ejs3di").innerHTML = "<p>3D graphics are not available in this browser. The part list still works.</p>" }
    var sc = new T.Scene(); sc.background = new T.Color("#0b1220");
    sc.add(new T.HemisphereLight(0xdfe9f5, 0x2a2016, .85)); var dl = new T.DirectionalLight(0xffffff, .85); dl.position.set(2, 4, 3); sc.add(dl); var dl2 = new T.DirectionalLight(0x9fc3ff, .3); dl2.position.set(-3, 2, -2); sc.add(dl2);
    var cam = new T.PerspectiveCamera(30, 1, .01, 50), C0 = D.camera, st = { az: C0.az, el: C0.el, dist: C0.dist, tgt: new T.Vector3().fromArray(C0.target) };
    var parts = D.parts.map(function (p) { var g = new T.Group(); p.shapes.forEach(function (s) { var m = shapeMesh(T, s); m.userData.pid = p.id; g.add(m) }); g.userData = p; sc.add(g); return g });
    W3 = { T: T, r: r, sc: sc, cam: cam, st: st, parts: parts, D: D, sel: null, ex: 0, run: true, ctx: true };
    $("ejs3dt").textContent = D.name + " • 3D model"; $("ejs3de").value = 0; $("ejs3ds").setAttribute("aria-pressed", "true");
    $("ejs3dl").innerHTML = D.parts.filter(function (p) { return !p.ctx }).concat(D.parts.filter(function (p) { return p.ctx })).map(function (p) { return '<button type="button" data-pid="' + p.id + '"' + (p.ctx ? ' class="cx"' : "") + ">" + esc(p.name) + "</button>" }).join("");
    $("ejs3dn").textContent = "Choose a part"; $("ejs3dk").textContent = D.parts.filter(function (p) { return !p.ctx }).length + " parts, plus the field around them";
    $("ejs3di").innerHTML = "<p>Click a part in the model or in the list below. Drag the model to turn it, scroll to zoom, and slide <b>Take apart</b> to open it up.</p>";
    size3d(); loop(); setTimeout(function () { $("ejs3dx").focus() }, 60);
  }
  function size3d() { if (!W3 || !W3.r) return; var cv = $("ejs3dc"), w = cv.parentNode.clientWidth, h = cv.parentNode.clientHeight; W3.r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); W3.r.setSize(w, h, false); W3.cam.aspect = w / Math.max(1, h); W3.cam.updateProjectionMatrix() }
  window.addEventListener("resize", function () { if (W3 && !vw.hidden) size3d() });
  function place() {
    var s = W3.st, a = s.az * Math.PI / 180, e = s.el * Math.PI / 180;
    W3.cam.position.set(s.tgt.x + s.dist * Math.sin(a) * Math.cos(e), s.tgt.y + s.dist * Math.sin(e), s.tgt.z + s.dist * Math.cos(a) * Math.cos(e)); W3.cam.lookAt(s.tgt);
  }
  function loop() {
    if (!W3 || !W3.run) return; requestAnimationFrame(loop);
    applyEx(); place(); if (W3.r) W3.r.render(W3.sc, W3.cam);
  }
  function applyEx() { W3.parts.forEach(function (g) { var x = g.userData.ex || [0, 0, 0]; g.position.set(x[0] * W3.ex, x[1] * W3.ex, x[2] * W3.ex); g.visible = W3.ctx || !g.userData.ctx; g.updateMatrixWorld(true) }) }
  function stop3d() { if (!W3) return; W3.run = false; try { W3.sc.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose() }); W3.r && W3.r.dispose() } catch (e) { } W3 = null }
  function close3d() { stop3d(); vw.hidden = true; if (vw._back && vw._back.focus) try { vw._back.focus() } catch (e) { } }
  function select(pid, fly) {
    if (!W3) return; var g = W3.parts.filter(function (x) { return x.userData.id === pid })[0]; if (!g) return; var p = g.userData;
    ghost(g);
    W3.sel = pid;
    [].forEach.call($("ejs3dl").querySelectorAll("button"), function (b) { b.setAttribute("aria-current", b.dataset.pid === pid ? "true" : "false") });
    $("ejs3dn").textContent = p.name; $("ejs3dk").textContent = p.ctx ? "Surroundings (not part of the build)" : "Part of the build";
    var h = "<p>" + esc(p.info) + "</p>";
    if (p.part) h += "<dl><dt>Bought as</dt><dd>" + esc(p.part.name) + "</dd><dt>Example</dt><dd>" + (p.part.url ? '<a href="' + esc(p.part.url) + '" target="_blank" rel="noopener">' + esc(p.part.ex) + "</a>" : esc(p.part.ex)) + "</dd><dt>Quantity</dt><dd>" + p.part.qty + "</dd><dt>Price each</dt><dd>$" + p.part.price.toFixed(2) + (p.part.est ? " (local estimate)" : " (maker's list price)") + "</dd></dl>";
    $("ejs3di").innerHTML = h;
    if (fly) { applyEx(); var bx = new W3.T.Box3().setFromObject(g), c = bx.getCenter(new W3.T.Vector3()), sz = bx.getSize(new W3.T.Vector3()).length(); W3.st.tgt.copy(c); W3.st.dist = Math.max(.45, Math.min(4, sz * 3.2)) }
  }
  /* the chosen part glows; the other parts of the build turn to glass so it can be seen from any side (the field stays as it is) */
  function ghost(g) {
    W3.parts.forEach(function (x) { x.children.forEach(function (m) { var M = m.material; if (!M) return; if (M.userData.o0 == null) { M.userData.o0 = M.opacity; M.userData.t0 = M.transparent; M.userData.d0 = M.depthWrite }
      var dim = g && x !== g && !x.userData.ctx; M.transparent = dim ? true : M.userData.t0; M.opacity = dim ? Math.min(M.userData.o0, .16) : M.userData.o0; M.depthWrite = dim ? false : M.userData.d0; M.needsUpdate = true;
      if (M.emissive) M.emissive.setHex(g && x === g ? 0x6a4a10 : 0x000000) }) });
  }
  $("ejs3dl").addEventListener("click", function (e) { var b = e.target.closest("button[data-pid]"); if (b) select(b.dataset.pid, true) });
  $("ejs3dx").addEventListener("click", close3d);
  $("ejs3dr").addEventListener("click", function () { if (!W3) return; ghost(null); W3.sel = null; [].forEach.call($("ejs3dl").querySelectorAll("button"), function (b) { b.setAttribute("aria-current", "false") }); $("ejs3dn").textContent = "Choose a part"; var C0 = W3.D.camera; W3.st.az = C0.az; W3.st.el = C0.el; W3.st.dist = C0.dist; W3.st.tgt.fromArray(C0.target) });
  $("ejs3ds").addEventListener("click", function () { if (!W3) return; W3.ctx = !W3.ctx; this.setAttribute("aria-pressed", W3.ctx ? "true" : "false") });
  $("ejs3de").addEventListener("input", function () { if (W3) W3.ex = this.value / 100 });
  vw.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); close3d() } });
  (function () {   /* drag to turn, wheel or pinch to zoom, click to pick */
    var cv = $("ejs3dc"), down = null, moved = 0, pts = {};
    cv.addEventListener("pointerdown", function (e) { pts[e.pointerId] = [e.clientX, e.clientY]; down = [e.clientX, e.clientY]; moved = 0; cv.setPointerCapture(e.pointerId) });
    cv.addEventListener("pointermove", function (e) {
      if (!W3 || !pts[e.pointerId]) return; var ids = Object.keys(pts);
      if (ids.length === 2) { var o = pts[ids[0]], q = pts[ids[1]], d0 = Math.hypot(o[0] - q[0], o[1] - q[1]); pts[e.pointerId] = [e.clientX, e.clientY]; o = pts[ids[0]]; q = pts[ids[1]]; var d1 = Math.hypot(o[0] - q[0], o[1] - q[1]); if (d0 > 0) W3.st.dist = Math.max(.15, Math.min(8, W3.st.dist * d0 / d1)); moved += 10; return }
      var p = pts[e.pointerId], dx = e.clientX - p[0], dy = e.clientY - p[1]; pts[e.pointerId] = [e.clientX, e.clientY]; moved += Math.abs(dx) + Math.abs(dy);
      W3.st.az -= dx * .35; W3.st.el = Math.max(-10, Math.min(85, W3.st.el + dy * .3));
    });
    function up(e) {
      var wasClick = down && moved < 5 && Object.keys(pts).length === 1; delete pts[e.pointerId];
      if (wasClick && W3) {
        var rc = cv.getBoundingClientRect(), T = W3.T, ray = new T.Raycaster(), v = new T.Vector2((e.clientX - rc.left) / rc.width * 2 - 1, -(e.clientY - rc.top) / rc.height * 2 + 1); ray.setFromCamera(v, W3.cam);
        var hits = ray.intersectObjects(W3.parts.filter(function (g) { return g.visible }), true);
        var real = hits.filter(function (h) { var g = W3.parts.filter(function (x) { return x.userData.id === h.object.userData.pid })[0]; return g && !g.userData.ctx });
        var h = real[0] || hits[0]; if (h) select(h.object.userData.pid, false);
      }
      down = null;
    }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", function (e) { delete pts[e.pointerId]; down = null });
    cv.addEventListener("wheel", function (e) { if (!W3) return; e.preventDefault(); W3.st.dist = Math.max(.15, Math.min(8, W3.st.dist * Math.exp(e.deltaY * .0012))) }, { passive: false });
  })();

  window.EJSOL = { open: open, close: hide, model: function (id) { open(id) }, viewer: viewer, MODELS: MODELS, GROUPS: GROUPS,
    /* blind assistance reads models from here: a model's parts as plain text (the 3D model's information, without the picture) */
    parts: function (id) { return fetch("solutions/" + id + "/model.json" + V).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json() }).then(function (D) { return D.parts.filter(function (p) { return !p.ctx }).map(function (p) { return p.name + ". " + p.info + (p.part ? " Price: " + p.part.price.toFixed(2) + " dollars" + (p.part.qty > 1 ? " each, " + p.part.qty + " needed" : "") + "." : "") }) }) } };
})();
