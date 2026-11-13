/* Earth Jukebox launch screen, v2 (2026-11-09; Physical Solutions section 2026-11-12).
   Drawn over the site the moment the page opens (this script sits right after <body>), so the site never flashes first.
   Hero: the view from orbit. NASA Blue Marble by day and NASA Black Marble city lights by night (both from NASA GIBS),
   with the atmosphere's rim moving to the welcome music. "Launch Earth Jukebox" lifts the screen like a stage curtain.
   Music: a soft ambient piece made in the browser (Web Audio). Browsers only allow sound after the visitor clicks or presses
   a key, so it starts on the first click or key here, can be switched off in the bar, and fades out as the curtain lifts.
   Blind assistance: its start dialog stays above this screen; when blind assistance is on, the curtain lifts at once and no
   music plays (it would talk over the speech). Nothing is saved. Add #app to the address to skip this screen,
   ?nomusic to keep it silent (used for tests). */
(function () {
  if (window.EJLand) return;
  var SKIP = /(^|[#&])app\b/.test(location.hash), NOMUSIC = /[?&]nomusic\b/.test(location.search);
  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  var fl = document.createElement("link"); fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Unbounded:wght@400;500;600&display=swap";
  document.head.appendChild(fl);

  var css = document.createElement("style");
  css.textContent =
    "#ejl{--sp:#03060d;--sky:#6fd3ff;--br:#e7b25a;--bn:#efe9dc;--mu:#8d97a3;--ln:rgba(239,233,220,.1);position:fixed;inset:0;z-index:55;overflow-y:auto;overflow-x:hidden;background:var(--sp);color:var(--bn);font:17px/1.6 Figtree,'Segoe UI',system-ui,sans-serif;transition:transform 1.25s cubic-bezier(.75,0,.22,1);scroll-behavior:smooth}" +
    "#ejl.lifting{transform:translateY(0)}#ejl.up{transform:translateY(-104%);box-shadow:0 60px 120px rgba(0,0,0,.9)}#ejl.gone{display:none}body.ejlon{overflow:hidden}" +
    "body.ejlrise>.app{animation:ejlIn 1.4s cubic-bezier(.2,.7,.2,1)}@keyframes ejlIn{from{transform:scale(.975);filter:brightness(.5)}to{transform:none;filter:none}}" +
    "#ejl *{box-sizing:border-box}#ejl a{color:inherit}" +
    "#ejl .bar{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:5;width:min(1120px,calc(100% - 24px));display:flex;align-items:center;gap:6px;padding:8px 8px 8px 16px;border-radius:999px;background:rgba(6,12,22,.86);border:1px solid rgba(111,211,255,.14)}" +
    "#ejl .lg{display:flex;align-items:center;gap:10px;margin-right:auto;text-decoration:none;font:500 15px/1 Unbounded,Figtree,sans-serif;letter-spacing:.2px}#ejl .lg svg{width:26px;height:26px}" +
    "#ejl .bar a.nl{padding:8px 12px;border-radius:999px;color:#c9cfd6;text-decoration:none;font-size:14px}#ejl .bar a.nl:hover,#ejl .bar a.nl:focus-visible{color:var(--bn);background:rgba(239,233,220,.07)}" +
    "#ejl .bar button{width:auto;font:600 14px/1 Figtree,sans-serif;border-radius:999px;cursor:pointer}" +
    "#ejlsnd{display:inline-flex;align-items:center;gap:8px;padding:9px 13px;background:transparent;border:1px solid rgba(239,233,220,.16);color:#c9cfd6}#ejlsnd:hover{border-color:rgba(239,233,220,.4);color:var(--bn)}" +
    "#ejlsnd i{display:inline-flex;align-items:flex-end;gap:2px;height:12px}#ejlsnd i b{width:2px;height:4px;background:currentColor;border-radius:1px}#ejl.playing #ejlsnd i b{animation:ejlEq 1.1s ease-in-out infinite}#ejl.playing #ejlsnd i b:nth-child(2){animation-delay:-.35s}#ejl.playing #ejlsnd i b:nth-child(3){animation-delay:-.7s}#ejl.playing #ejlsnd i b:nth-child(4){animation-delay:-.2s}@keyframes ejlEq{50%{height:12px}}" +
    "#ejl .bar .go{padding:10px 18px;border:0;background:var(--br);color:#1b1206}#ejl .bar .go:hover{background:#f2c372}" +
    "#ejlmenu{display:none;padding:9px 13px;background:transparent;border:1px solid rgba(239,233,220,.16);color:#c9cfd6}" +
    "#ejl .hero{position:relative;height:100vh;min-height:620px;overflow:hidden}#ejl .hero::after{content:'';position:absolute;left:0;right:0;bottom:0;height:22%;z-index:1;pointer-events:none;background:linear-gradient(rgba(3,6,13,0),var(--sp))}#ejlgl,#ejlwave{position:absolute;inset:0;width:100%;height:100%;display:block}#ejlwave{pointer-events:none}" +
    "#ejl .hc{position:absolute;left:0;right:0;top:max(86px,10.5vh);z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 20px;opacity:0;transform:translateY(14px);transition:opacity 1.6s .6s,transform 1.6s .6s cubic-bezier(.2,.7,.2,1)}#ejl.in .hc{opacity:1;transform:none}" +
    "#ejl h1{margin:0;font:500 clamp(40px,7.4vw,96px)/1.02 Unbounded,Figtree,sans-serif;letter-spacing:-.02em;background:linear-gradient(180deg,#fff 30%,#cfe8f5 100%);-webkit-background-clip:text;background-clip:text;color:transparent}" +
    "#ejl .tag{max-width:30em;margin:22px 0 34px;color:#c9d2da;font-size:clamp(17px,1.9vw,20px);line-height:1.55}" +
    "#ejlgo{position:relative;width:auto;display:inline-flex;align-items:center;gap:14px;padding:19px 34px 19px 26px;border:0;border-radius:999px;cursor:pointer;font:600 clamp(17px,1.9vw,19px)/1 Figtree,sans-serif;letter-spacing:.2px;color:#1b1206;background:linear-gradient(180deg,#f6cf86,#e7b25a 60%,#d39a3e);box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 12px 40px rgba(231,178,90,.28),0 0 0 6px rgba(231,178,90,.08);transition:transform .25s,box-shadow .25s}" +
    "#ejlgo:hover{transform:translateY(-2px);box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 18px 50px rgba(231,178,90,.4),0 0 0 9px rgba(231,178,90,.1)}#ejlgo:focus-visible,#ejl button:focus-visible,#ejl a:focus-visible{outline:2px solid var(--sky);outline-offset:4px}" +
    "#ejlgo svg{width:26px;height:26px}" +
    "#ejl .hb{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}.hb .go{order:0}.hb .hbr{order:1;flex-basis:100%;height:0}.hb .side{order:2}" +
    "#ejl .hb .side{width:auto;display:inline-flex;align-items:center;gap:10px;padding:16px 22px;border-radius:999px;cursor:pointer;font:600 16px/1 Figtree,sans-serif;color:#e9eef3;background:rgba(10,18,30,.72);border:1px solid rgba(111,211,255,.28);transition:border-color .2s,background .2s,transform .2s}" +
    "#ejl .hb .side:hover{border-color:rgba(111,211,255,.7);background:rgba(16,30,48,.85);transform:translateY(-1px)}#ejl .hb .side svg{width:20px;height:20px;color:#6fd3ff}" +
    "@media (max-width:860px){#ejl .hb{flex-direction:column;gap:12px}#ejl .hb .side{order:2}#ejl .hb #ejlgo{order:1}}" +
    "#ejl .hint{margin-top:22px;color:var(--mu);font-size:14px}#ejl .hint span{white-space:nowrap}" +
    "#ejl .made{position:absolute;left:0;right:0;bottom:22px;z-index:2;text-align:center;color:rgba(239,233,220,.55);font-size:13px;padding:0 16px}" +
    "#ejl main{position:relative;z-index:1;background:linear-gradient(var(--sp),#050a14 40%,var(--sp))}" +
    "#ejl .sec{max-width:1080px;margin:0 auto;padding:110px 28px 0}" +
    "#ejl h2{margin:0 0 14px;font:500 clamp(28px,3.6vw,42px)/1.12 Unbounded,Figtree,sans-serif;letter-spacing:-.015em}#ejl .lead{max-width:36em;margin:0 0 44px;color:#b7c0c9;font-size:18px}" +
    "#ejl .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;position:relative;margin:0;padding:0;list-style:none;counter-reset:s}" +
    "#ejl .steps::before{content:'';position:absolute;left:21px;right:21px;top:21px;height:1px;background:linear-gradient(90deg,var(--br),rgba(111,211,255,.5),transparent)}" +
    "#ejl .steps li{position:relative;counter-increment:s}#ejl .steps li::before{content:counter(s);display:flex;align-items:center;justify-content:center;width:43px;height:43px;border-radius:50%;background:var(--sp);border:1px solid var(--br);color:var(--br);font:500 16px/1 Unbounded,sans-serif;margin-bottom:22px;position:relative}" +
    "#ejl .steps h3,#ejl .feat h3{margin:0 0 8px;font-size:19px;font-weight:600}#ejl .steps p,#ejl .feat p{margin:0;color:#aab3bc;font-size:16px}" +
    "#ejl .feat{display:grid;grid-template-columns:1fr 1fr;column-gap:64px}#ejl .feat div{align-content:start;display:grid;grid-template-columns:44px 1fr;gap:4px 16px;padding:26px 0;border-top:1px solid var(--ln)}#ejl .feat svg{grid-row:span 2;width:30px;height:30px;color:var(--sky);margin-top:2px}" +
    "#ejl .dg{display:grid;grid-template-columns:1fr 1fr;gap:56px}#ejl .dg h3{margin:0 0 14px;font-size:15px;font-weight:600;color:var(--br)}#ejl .dg ul{margin:0;padding:0;list-style:none}#ejl .dg li{padding:11px 0;border-top:1px solid var(--ln);color:#d6dce1}#ejl .dg li small{display:block;color:var(--mu);font-size:14px}" +
    "#ejl .acc{width:100%;border-collapse:collapse;font-size:16px}#ejl .acc td,#ejl .acc th{padding:13px 8px;border-top:1px solid var(--ln);text-align:left}#ejl .acc th{color:var(--mu);font-weight:500;font-size:14px;border-top:0}#ejl .acc .r{text-align:right;font-variant-numeric:tabular-nums}" +
    "#ejl .ok{display:inline-block;margin-left:10px;padding:2px 10px;border-radius:999px;background:rgba(127,214,150,.12);color:#9fe0ab;font-size:13px}" +
    "#ejl .lnk{width:auto;margin-top:26px;padding:12px 20px;border:1px solid rgba(231,178,90,.6);background:transparent;color:var(--br);border-radius:999px;font:600 15px/1 Figtree,sans-serif;cursor:pointer}#ejl .lnk:hover{background:rgba(231,178,90,.1)}" +
    "#ejl .sol3{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin:0 0 40px}#ejl .sol3 div{border-top:1px solid var(--br);padding-top:18px}#ejl .sol3 h3{margin:0 0 6px;font:500 20px/1.2 Unbounded,Figtree,sans-serif;color:var(--br)}#ejl .sol3 b{display:block;margin-bottom:8px;color:var(--bn);font-size:15px;font-weight:600}#ejl .sol3 p{margin:0;color:#aab3bc;font-size:16px}" +
    "#ejlsolgo{width:auto;display:inline-flex;align-items:center;gap:12px;padding:18px 32px;border:0;border-radius:999px;cursor:pointer;font:600 18px/1 Figtree,sans-serif;color:#1b1206;background:linear-gradient(180deg,#f6cf86,#e7b25a 60%,#d39a3e);box-shadow:0 10px 34px rgba(231,178,90,.25)}#ejlsolgo:hover{transform:translateY(-1px)}#ejlsolgo svg{width:22px;height:22px}" +
    "@media (max-width:860px){#ejl .sol3{grid-template-columns:1fr;gap:22px}}" +
    "#ejl .end{text-align:center;padding:150px 24px 120px}#ejl .end h2{margin-bottom:30px}" +
    "#ejl footer{max-width:1080px;margin:0 auto;padding:26px 28px 48px;border-top:1px solid var(--ln);color:var(--mu);font-size:14px}#ejl footer p{margin:0 0 6px;max-width:72em}" +
    "#ejlfr{position:sticky;bottom:0;z-index:6;height:18px;margin-top:-18px;pointer-events:none;opacity:0;transition:opacity .3s;background:linear-gradient(#0000 0 4px,#a8782a 4px,#e7b25a 7px,#7a5418 9px,#0000 9px),repeating-linear-gradient(90deg,#d79d38 0 2px,#0000 2px 6px);background-size:100% 100%,100% 9px;background-repeat:no-repeat;background-position:top,bottom}" +
    "#ejl.lifting #ejlfr{opacity:1}#ejl .pleat{position:fixed;inset:0;z-index:6;pointer-events:none;opacity:0;transition:opacity .35s;background:repeating-linear-gradient(90deg,rgba(0,0,0,.3) 0,rgba(255,255,255,.04) 3.5%,rgba(0,0,0,.3) 7%)}#ejl.lifting .pleat{opacity:1}" +
    "@media (max-width:860px){#ejl .bar a.nl{display:none}#ejlmenu{display:inline-flex}#ejl .bar.open{flex-wrap:wrap;border-radius:22px}#ejl .bar.open a.nl{display:block;width:100%}#ejl .steps,#ejl .feat,#ejl .dg{grid-template-columns:1fr}#ejl .steps::before{display:none}#ejl .sec{padding-top:80px}#ejl .hc{top:17vh}#ejl .lg span{display:none}#ejl .hint span{white-space:normal;display:block}}" +
    "@media (prefers-reduced-motion:reduce){#ejl{transition:opacity .4s}#ejl.up{transform:none;opacity:0}#ejl .hc{transition:none}#ejl.playing #ejlsnd i b{animation:none;height:8px}body.ejlrise>.app{animation:none}}";
  document.head.appendChild(css);

  var I = {
    globe: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5c3.5 3.2 3.5 18.8 0 22M16 5c-3.5 3.2-3.5 18.8 0 22"/></svg>',
    panel: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="6" width="22" height="20" rx="2"/><path d="M10 21v-4M15 21v-9M20 21v-6"/></svg>',
    ring: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="16" cy="16" r="11" stroke-dasharray="3 3"/><circle cx="16" cy="16" r="2.2" fill="currentColor"/></svg>',
    doc: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 4h10l5 5v19H9z"/><path d="M19 4v5h5M12 15h9M12 19h9M12 23h6"/></svg>',
    lib: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6h5v21H6zM13 6h5v21h-5zM20.5 7.5l4.6-1.3 5 19.5-4.6 1.3z"/></svg>',
    ear: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M11 13a6 6 0 1 1 12 0c0 4-4 5-4 9a4 4 0 0 1-7 2"/><path d="M15 13a2 2 0 1 1 4 0c0 1.5-2 2-2 3.5"/><path d="M5 9c1.5-2 3-3 5-4M4 15h3"/></svg>'
  };
  var logo = '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="ejlg1" cx="40%" cy="35%"><stop offset="0" stop-color="#7cc6ee"/><stop offset=".7" stop-color="#1d5c8a"/><stop offset="1" stop-color="#0b2440"/></radialGradient></defs><circle cx="20" cy="20" r="19" fill="none" stroke="#e7b25a" stroke-width="1.2"/><circle cx="20" cy="20" r="15.5" fill="none" stroke="rgba(239,233,220,.25)" stroke-width=".6"/><circle cx="20" cy="20" r="12.5" fill="url(#ejlg1)"/><path d="M14 15c2-2 4.5-1 5.5.3s.8 3 2.8 3.2 2.6 2 1.6 3.8-3 1.8-4 .6-3-1-3.8-3-3.4-3-2.1-4.9z" fill="#6aa35b" opacity=".9"/></svg>';
  var el = document.createElement("div");
  el.id = "ejl";   /* no landmark role here: its own header and main are the top-level landmarks while it is shown */
  function feat(ic, t, p) { return "<div>" + I[ic] + "<h3>" + t + "</h3><p>" + p + "</p></div>" }
  el.innerHTML =
    '<div class="pleat" aria-hidden="true"></div>' +
    '<nav class="bar" aria-label="Welcome screen"><a class="lg" href="#ejltop" aria-label="Earth Jukebox, back to the top">' + logo + '<span>Earth Jukebox</span></a>' +
    '<a class="nl" href="#ejlsol">Physical Solutions</a><a class="nl" href="#ejlhow">How it works</a><a class="nl" href="#ejlfeat">Features</a><a class="nl" href="#ejldata">Data</a><a class="nl" href="#ejlacc">Accuracy</a><a class="nl" href="#ejlabout">About</a>' +
    '<button type="button" id="ejlmenu" aria-expanded="false">Menu</button>' +
    '<button type="button" id="ejlsnd" aria-pressed="false"><i aria-hidden="true"><b></b><b></b><b></b><b></b></i><span>Music off</span></button>' +
    '<button type="button" class="go">Launch</button></nav>' +
    '<header class="hero" id="ejltop"><canvas id="ejlgl" aria-hidden="true"></canvas><canvas id="ejlwave" aria-hidden="true"></canvas>' +
    '<div class="hc"><h1>Earth Jukebox</h1><p class="tag">Pick any place on Earth and hear how its climate has changed, decade by decade. The music is made from real measurements, most of them from NASA.</p>' +
    '<div class="hb"><button type="button" class="side" id="ejlarc"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18v13H3zM5 4h14v3H5z"/><path d="M9 11h6"/></svg>Open Earth Jukebox Archives</button>' +
    '<button type="button" id="ejlgo" class="go"><svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="12.5" fill="#1b1206"/><path d="M10.5 8.2v9.6l7.6-4.8z" fill="#f2c372"/></svg>Launch Earth Jukebox</button>' +
    '<button type="button" class="side" id="ejlmono"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5.5C6.5 4 9.5 4 12 5.5v14C9.5 18 6.5 18 4 19.5zM20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/></svg>Read Monographs</button><button type="button" class="side" id="ejlpres"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M9 9l3 2-3 2z"/></svg>View Presentations</button><span class="hbr" aria-hidden="true"></span></div>' +
    '<p class="hint"><span id="ejlmh">Click anywhere to start the music.</span> <span>Blind visitors: press F for spoken help.</span></p></div>' +
    '<p class="made">Made for the NASA International Space Apps Challenge 2026. Earth images: NASA Blue Marble and Black Marble.</p></header>' +
    '<main>' +
    '<section class="sec" id="ejlhow"><h2>How it works</h2><p class="lead">A place\'s climate record, month by month, becomes a piece of music you can listen to, compare and study.</p><ol class="steps">' +
    "<li><h3>Pick a place</h3><p>Click anywhere on the 3D globe or the map, search for a city, or choose the whole Earth.</p></li>" +
    "<li><h3>Listen to its climate</h3><p>Temperature sets the pitch, while rain, wind, cloud, greenness and air quality shape the sound. A warming place slowly changes key and mood.</p></li>" +
    "<li><h3>Compare and research</h3><p>Set two years side by side, run an in-depth research report with maps and graphs, and take it away as a PDF or a spoken audio report.</p></li></ol></section>" +
    '<section class="sec" id="ejlfeat"><h2>What you can do</h2><p class="lead">It all runs in your browser, with the same features for sighted and blind visitors.</p><div class="feat">' +
    feat("globe", "Watch NASA's Earth Information Center", "Step through NASA's Earth Information Center pictures and hear the exact values NASA drew them from at your pin.") +
    feat("panel", "Open the data panel", "See every dataset's real number at the current moment, updating as the music plays, with its source and units.") +
    feat("ring", "Choose a range", "Average the data over a circle from a few kilometres to the whole planet, drawn as a golden circle on the globe.") +
    feat("doc", "Run in-depth research", "Trends, change-point tests, satellite maps, air quality, earthquakes and climate projections in one long report.") +
    feat("lib", "Load shared research", "Open an in-depth research someone else already made, instantly, from anywhere in the world.") +
    feat("ear", "Use blind assistance", "Spoken menus and full keyboard control in 21 languages, including the audio report and the data panel.") +
    "</div></section>" +
    '<section class="sec" id="ejldata"><h2>Where the numbers come from</h2><p class="lead">Free, public scientific data, credited on the site and in every report.</p><div class="dg">' +
    "<div><h3>From NASA</h3><ul><li>Earth Information Center<small>Hourly GEOS-FP and GEOS-CF pictures and the numbers behind them</small></li><li>POWER<small>Monthly climate at any point since 1981</small></li><li>GISTEMP<small>Global temperature since 1880</small></li><li>GIBS<small>MODIS greenness and land temperature, MERRA-2, MOPITT, VIIRS night lights</small></li><li>VEDA<small>OMI nitrogen dioxide</small></li></ul></div>" +
    "<div><h3>From other science agencies</h3><ul><li>ERA5 reanalysis<small>Copernicus and ECMWF, daily weather since 1940</small></li><li>Mauna Loa CO₂<small>NOAA</small></li><li>Earthquake catalogue<small>USGS</small></li><li>Development indicators<small>World Bank</small></li><li>Places and borders<small>OpenStreetMap contributors</small></li></ul></div></div></section>" +
    '<section class="sec" id="ejlacc"><h2>Checked, not guessed</h2><p class="lead" id="ejlaccl">What the site shows was compared with the same values fetched fresh from NASA\'s own data server.</p><div style="overflow-x:auto"><table class="acc" id="ejlacct"></table></div>' +
    '<button type="button" class="lnk" id="ejlaccb">Launch and open the full accuracy report</button></section>' +
    '<section class="sec" id="ejlsol"><h2>Physical Solutions</h2><p class="lead">Earth Jukebox lets people hear climate change. These machines act on it: fifteen designs that cut emissions or protect people, each linked to NASA data, and each with a build document, a financial statement, an interactive 3D model and a presentation.</p><div class="sol3">' +
    '<div><h3>Domestic</h3><b>7 models</b><p>Homemade builds for homes, farms and schools, for a team with robotics skills, from a rice-field water stake to a solar crop dryer.</p></div>' +
    '<div><h3>Industrial</h3><b>5 models</b><p>Machines and services a company can make and run at scale, from methane leak surveys to solar cold rooms.</p></div>' +
    '<div><h3>Municipal</h3><b>3 models</b><p>Public infrastructure a city or government can install, from warning towers to heat refuges.</p></div></div>' +
    '<button type="button" id="ejlsolgo"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>Open Models</button></section>' +
    '<section class="sec" id="ejlabout"><h2>About</h2><p class="lead">Earth Jukebox turns climate data into something you can hear as well as read. It is a prototype made for the NASA International Space Apps Challenge 2026, not an official NASA product, and anything estimated is labelled as an estimate.</p></section>' +
    '<section class="end"><h2>Ready to listen?</h2><button type="button" class="go lnk" style="font-size:17px;padding:16px 30px">Launch Earth Jukebox</button></section>' +
    "<footer><p>Not an official NASA website. NASA does not endorse this project.</p><p>Data from NASA (EIC, GMAO, POWER, GISS, GIBS, VEDA), Copernicus and ECMWF, NOAA, USGS, the World Bank and OpenStreetMap contributors. Full credits are at the bottom of the site.</p></footer>" +
    '</main><div id="ejlfr" aria-hidden="true"></div>';

  function behind(hide) { var ap = document.querySelector(".app"), ft = document.querySelector(".pagefoot"); [ap, ft].forEach(function (x) { if (!x) return; if (hide) { x.setAttribute("aria-hidden", "true"); x.inert = true } else { x.removeAttribute("aria-hidden"); x.inert = false } }) }
  if (SKIP) el.className = "gone"; else { document.body.classList.add("ejlon"); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { if (document.body.classList.contains("ejlon")) behind(true) }); else behind(true) }
  document.body.insertBefore(el, document.body.firstChild);
  var $ = function (id) { return document.getElementById(id) };
  setTimeout(function () { el.classList.add("in") }, 60);

  /* ---------- accuracy table from the site's own measured results ---------- */
  function fill() {
    var R = window.EJR && EJR.ACC_NASA, K = R ? Object.keys(R.res) : [];
    if (!K.length) { $("ejlacc").hidden = true; return }
    var tot = K.reduce(function (s, k) { return s + R.res[k].n }, 0);
    $("ejlaccl").textContent = "On " + R.run + " we fetched " + tot.toLocaleString("en-US") + " values fresh from NASA's own data server and compared each with what Earth Jukebox shows for the same place and hour, at 234 places around the world. The only differences come from rounding when the numbers are stored.";
    $("ejlacct").innerHTML = '<thead><tr><th>Dataset</th><th class="r">Checks</th><th class="r">Largest difference</th></tr></thead><tbody>' + K.map(function (k) {
      var a = R.res[k];
      return "<tr><td>" + a.title + (a.r >= .999 ? '<span class="ok">strong agreement</span>' : "") + '</td><td class="r">' + a.n.toLocaleString("en-US") + '</td><td class="r">' + (a.enc === "log" ? (a.maxRel * 100).toFixed(2) + "%" : a.max.toFixed(3) + " " + a.unit) + "</td></tr>" }).join("") + "</tbody>";
  }

  /* ---------- welcome music: a slow, warm chord loop with an electric-piano arpeggio and ocean waves (Web Audio) ---------- */
  var M = { ctx: null, on: false, want: !NOMUSIC, an: null, data: null, timers: [] };
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12) }
  function musicStart() {
    if (M.on || NOMUSIC || launched || (window.BA && BA.on)) return;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      var c = M.ctx = new AC(), out = c.createGain(), dry = c.createGain(), wet = c.createGain(), rv = c.createConvolver(), comp = c.createDynamicsCompressor();
      out.gain.value = 0; dry.gain.value = .75; wet.gain.value = .55;
      var len = c.sampleRate * 5, ir = c.createBuffer(2, len, c.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) }
      rv.buffer = ir; comp.threshold.value = -16; comp.ratio.value = 2.5; comp.knee.value = 12;
      M.bus = c.createGain(); M.bus.connect(dry); M.bus.connect(rv); rv.connect(wet); dry.connect(comp); wet.connect(comp); comp.connect(out);
      M.an = c.createAnalyser(); M.an.fftSize = 512; M.an.smoothingTimeConstant = .85; M.data = new Uint8Array(M.an.frequencyBinCount);
      out.connect(M.an); M.an.connect(c.destination); M.out = out;
      if (c.state === "suspended") c.resume();
      out.gain.setValueAtTime(0, c.currentTime); out.gain.linearRampToValueAtTime(1.2, c.currentTime + 3);
      M.on = true; el.classList.add("playing"); sndLabel();
      /* a slow I-V-vi-IV loop in D major (8 seconds per chord): warm pads, a soft bass, an electric-piano arpeggio rolling
         gently up and down the chord (one note a second), and quiet ocean waves underneath */
      var CH = [
        { b: 38, pad: [50, 54, 57, 61], arp: [62, 66, 69, 73, 74] },   /* Dmaj7 */
        { b: 37, pad: [49, 52, 57, 61], arp: [61, 64, 69, 71, 73] },   /* A/C# */
        { b: 35, pad: [47, 54, 57, 62], arp: [59, 62, 66, 69, 71] },   /* Bm7 */
        { b: 43, pad: [43, 50, 54, 59], arp: [59, 62, 66, 67, 71] }    /* Gmaj7 */
      ], PAT = [0, 1, 2, 3, 4, 3, 2, 1], ci = 0, STEP = 1;
      var pad = function (m, t, dur, g) {
        [-7, 7].forEach(function (det, j) {
          var o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null;
          o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = det;
          f.type = "lowpass"; f.Q.value = .3; f.frequency.setValueAtTime(420, t); f.frequency.linearRampToValueAtTime(900, t + dur * .55); f.frequency.linearRampToValueAtTime(480, t + dur + 2);
          v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 2.5); v.gain.setValueAtTime(g, t + dur - 1); v.gain.linearRampToValueAtTime(0, t + dur + 2.5);
          o.connect(f); f.connect(v); if (p) { p.pan.value = j ? .4 : -.4; v.connect(p); p.connect(M.bus) } else v.connect(M.bus);
          o.start(t); o.stop(t + dur + 2.7);
        });
      };
      var bass = function (m, t, dur) { var o = c.createOscillator(), v = c.createGain(); o.type = "sine"; o.frequency.value = mtof(m); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(.16, t + 1.2); v.gain.setValueAtTime(.16, t + dur - 1); v.gain.linearRampToValueAtTime(0, t + dur + 1.5); o.connect(v); v.connect(M.bus); o.start(t); o.stop(t + dur + 1.7) };
      var keyN = function (m, t, vel) {   /* a soft electric-piano note: round tone, gentle bell-like overtone, slow fade */
        var v = c.createGain(), f = c.createBiquadFilter(), p = c.createStereoPanner ? c.createStereoPanner() : null;
        f.type = "lowpass"; f.frequency.value = 2600; v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(.14 * vel, t + .012); v.gain.exponentialRampToValueAtTime(.0005, t + 3.6);
        [[1, 1], [2, .22], [3.01, .06]].forEach(function (h) { var o = c.createOscillator(), og = c.createGain(); o.type = "sine"; o.frequency.value = mtof(m) * h[0]; og.gain.setValueAtTime(h[1], t); og.gain.exponentialRampToValueAtTime(.001, t + (h[0] === 1 ? 3.6 : 1.2)); o.connect(og); og.connect(f); o.start(t); o.stop(t + 3.7) });
        f.connect(v); if (p) { p.pan.value = (m - 66) / 30; v.connect(p); p.connect(M.bus) } else v.connect(M.bus);
      };
      var chord = function () {
        if (!M.on || M.ctx !== c) return; var t = c.currentTime + .08, C = CH[ci++ % CH.length], dur = 8 * STEP;
        C.pad.forEach(function (m) { pad(m, t, dur, .022) });
        bass(C.b, t, dur);
        PAT.forEach(function (k, i) { var j = (Math.random() - .5) * .04; keyN(C.arp[k], t + i * STEP + j, i === 0 ? 1 : .62 + Math.random() * .22) });
        M.timers.push(setTimeout(chord, dur * 1000));
      };
      /* ocean waves: filtered noise that swells and falls about every 9 seconds */
      var wn = c.createBuffer(2, c.sampleRate * 4, c.sampleRate);
      for (var wc = 0; wc < 2; wc++) { var wd = wn.getChannelData(wc), last = 0; for (var wi = 0; wi < wd.length; wi++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; wd[wi] = last * 3.5 } }
      var ws = c.createBufferSource(), wf = c.createBiquadFilter(), wg = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      ws.buffer = wn; ws.loop = true; wf.type = "lowpass"; wf.frequency.value = 900; wg.gain.value = .05; lfo.frequency.value = 1 / 9; lg.gain.value = .045;
      lfo.connect(lg); lg.connect(wg.gain); ws.connect(wf); wf.connect(wg); wg.connect(dry); ws.start(); lfo.start();
      chord();
    } catch (e) { M.on = false }
  }
  function musicStop(fast) {
    M.timers.forEach(clearTimeout); M.timers = [];
    if (!M.ctx) { M.on = false; sndLabel(); return }
    var c = M.ctx, o = M.out; M.on = false; M.ctx = null; el.classList.remove("playing"); sndLabel();
    try { o.gain.cancelScheduledValues(c.currentTime); o.gain.setValueAtTime(o.gain.value, c.currentTime); o.gain.linearRampToValueAtTime(0, c.currentTime + (fast ? .25 : 1.3)) } catch (e) { }
    setTimeout(function () { try { c.close() } catch (e) { } }, fast ? 400 : 1500);
  }
  function sndLabel() { var b = $("ejlsnd"); if (!b) return; b.querySelector("span").textContent = M.on ? "Music on" : "Music off"; b.setAttribute("aria-pressed", M.on ? "true" : "false"); var h = $("ejlmh"); if (h) h.textContent = M.on ? "Music is playing." : M.want ? "Click anywhere to start the music." : "Music is off." }
  /* the first click or key on this screen starts the music (browsers allow sound only after one) */
  function firstGesture(e) {
    if (launched || M.on || !M.want) return;
    var t = e.target; if (t && t.closest && (t.closest(".go") || t.closest("#ejlsnd") || t.closest("#ejlaccb") || t.closest("#bas"))) return;
    if (e.type === "keydown") { var bas = $("bas"); if (bas && !bas.hidden) return }
    setTimeout(function () { if (!(window.BA && BA.on)) musicStart() }, 180);
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { window.addEventListener(ev, firstGesture, true) });

  /* ---------- the view from orbit (three.js, already loaded by the site) ---------- */
  var G = { ok: false }, run = !SKIP, t0 = performance.now(), stars = [], FOV = 16, CAMZ = 34;
  function gibs(layer, extra) { return "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=" + layer + "&STYLES=&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=4096&HEIGHT=2048&FORMAT=image/jpeg" + (extra || "") }
  function mkTex(col) { var c = document.createElement("canvas"); c.width = c.height = 4; var x = c.getContext("2d"); x.fillStyle = col; x.fillRect(0, 0, 4, 4); return new THREE.CanvasTexture(c) }
  function globeInit() {
    if (G.ok || G.tried || !window.THREE) return; G.tried = true; var T = window.THREE, cv = $("ejlgl");
    try { G.r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }) } catch (e) { return }
    G.ok = true; G.r.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    G.s = new T.Scene(); G.cam = new T.PerspectiveCamera(FOV, 1, .1, 200);
    G.sun = new T.Vector3(1.0, .45, -.12).normalize();
    G.mat = new T.ShaderMaterial({
      uniforms: { day: { value: mkTex("#0f3a5f") }, night: { value: mkTex("#000000") }, sun: { value: G.sun }, has: { value: 0 } },
      vertexShader: "varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
      fragmentShader: "uniform sampler2D day;uniform sampler2D night;uniform vec3 sun;uniform float has;varying vec2 vUv;varying vec3 vN;varying vec3 vW;" +
        "void main(){vec3 n=normalize(vN);float d=dot(n,sun);float m=smoothstep(-.12,.28,d);vec3 dc=texture2D(day,vUv).rgb;dc=mix(vec3(.05,.2,.33),dc,has);" +
        "vec3 dl=dc*(.06+1.15*max(d,0.));vec3 nc=texture2D(night,vUv).rgb;vec3 nl=pow(nc,vec3(1.4))*vec3(1.6,1.2,.75)*(1.-m);" +
        "vec3 v=normalize(cameraPosition-vW);float fr=pow(1.-max(dot(n,v),0.),2.6);vec3 col=mix(nl,dl,m)+vec3(.3,.62,1.)*fr*(.25+.9*smoothstep(-.3,.5,d));" +
        "gl_FragColor=vec4(col,1.);}"
    });
    var L = new T.TextureLoader(); L.setCrossOrigin("anonymous");
    /* fast start: the copy shipped with the site if it is there; otherwise a small picture from NASA at once, then the sharp one */
    var put = function (u, big) { return function (t) { if (!big && G.mat.uniforms[u].value.__big) return; t.__big = big; var o = G.mat.uniforms[u].value; G.mat.uniforms[u].value = t; if (u === "day") G.mat.uniforms.has.value = 1; if (o && o.dispose) o.dispose() } };
    var tex = function (u, file, layer, extra) {
      L.load(file, put(u, true), undefined, function () {
        L.load(gibs(layer, extra).replace("WIDTH=4096&HEIGHT=2048", "WIDTH=1024&HEIGHT=512"), put(u, false));
        setTimeout(function () { if (run) L.load(gibs(layer, extra), put(u, true)) }, 1500);
      });
    };
    tex("day", "eic/land_day.jpg", "BlueMarble_NextGeneration", ""); tex("night", "eic/land_night.jpg", "VIIRS_Black_Marble", "&TIME=2016-01-01");
    G.earth = new T.Mesh(new T.SphereGeometry(1, 96, 64), G.mat); G.earth.rotation.y = -3.0;   /* South Asia faces the viewer at the start, at dusk */
    G.atm = new T.Mesh(new T.SphereGeometry(1.045, 64, 48), new T.ShaderMaterial({
      uniforms: { sun: { value: G.sun } }, side: T.BackSide, blending: T.AdditiveBlending, transparent: true, depthWrite: false,
      vertexShader: "varying vec3 vN;varying vec3 vW;void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
      fragmentShader: "uniform vec3 sun;varying vec3 vN;varying vec3 vW;void main(){vec3 v=normalize(cameraPosition-vW);float k=pow(max(.0,.72+dot(normalize(vN),v)),5.);float l=.35+.9*smoothstep(-.4,.6,dot(normalize(vN),sun));gl_FragColor=vec4(vec3(.32,.66,1.)*k*l*1.7,k*l);}"
    }));
    G.grp = new T.Group(); G.grp.add(G.earth); G.grp.add(G.atm); G.s.add(G.grp);
    G.v = new T.Vector3();
    size();
  }
  function size() {
    var hero = el.querySelector(".hero"), W = hero.clientWidth, H = hero.clientHeight, d = 1, wv = $("ejlwave");
    wv.width = W * d; wv.height = H * d;
    if (!stars.length) for (var i = 0; i < 320; i++) stars.push([Math.random(), Math.random() * .8, Math.random() * 1.2 + .2, Math.random() * 6.28]);
    if (!G.ok) return;
    G.r.setSize(W, H, false); G.cam.aspect = W / H; G.cam.updateProjectionMatrix();
    /* a far camera with a narrow lens, and an Earth a little wider than the screen whose top edge (the horizon)
       sits 66% of the way down: solve for the height of Earth's centre that puts the tangent there exactly */
    var vh = Math.tan(FOV / 2 * Math.PI / 180), Z = CAMZ, hw = Z * vh * (W / H), R = Math.max(1, hw * (W > H ? 1.12 : 1.25)), want = (2 * .66 - 1) * vh;
    G.R = R; G.grp.scale.setScalar(R); G.cam.position.set(0, 0, Z); G.cam.lookAt(0, 0, 0);
    var lo = -Z, hi = 0; for (var k = 0; k < 60; k++) { var cy = (lo + hi) / 2, Lc = Math.hypot(cy, Z), top = Math.tan(Math.atan2(-cy, Z) - Math.asin(Math.min(.9999, R / Lc))); if (top > want) lo = cy; else hi = cy }
    G.cy = (lo + hi) / 2; G.grp.position.set(0, G.cy, 0);
  }
  /* the exact outline of the Earth as the camera sees it, in screen pixels */
  function rim(W, H, scale) {
    var T = THREE, C = G.grp.position.clone(), cam = G.cam.position, w = cam.clone().sub(C), L = w.length(); w.normalize();
    var Rr = G.R * scale, off = Rr * Rr / L, rad = Rr * Math.sqrt(Math.max(0, 1 - (Rr * Rr) / (L * L)));
    var e1 = new T.Vector3().crossVectors(w, new T.Vector3(1, 0, 0)).normalize(), e2 = new T.Vector3().crossVectors(w, e1).normalize(), base = C.clone().add(w.clone().multiplyScalar(off));
    var pts = [], P = new T.Vector3();
    for (var i = 0; i <= 360; i++) { var a = i / 360 * Math.PI * 2; P.copy(base).addScaledVector(e1, Math.cos(a) * rad).addScaledVector(e2, Math.sin(a) * rad).project(G.cam); pts.push([(P.x * .5 + .5) * W, (-P.y * .5 + .5) * H]) }
    return pts;
  }
  function frame(now, force) {
    if (!run) return; requestAnimationFrame(frame);
    if (!force && (document.hidden || el.scrollTop > el.clientHeight * .95)) return;   /* nothing to draw when the Earth is out of view */
    var t = (now - t0) / 1000, wv = $("ejlwave"), x = wv.getContext("2d"), W = wv.width, H = wv.height, dp = W / Math.max(1, el.querySelector(".hero").clientWidth);
    x.clearRect(0, 0, W, H);
    x.fillStyle = "rgb(239,233,220)"; stars.forEach(function (s) { var a = .2 + .45 * (RM ? .6 : .5 + .5 * Math.sin(t * .7 + s[3])); x.globalAlpha = a; var z = s[2] * 1.5; x.fillRect(s[0] * W, s[1] * H, z, z) }); x.globalAlpha = 1;
    if (!G.ok) { globeInit(); return }
    /* the one orchestrated moment: Earth rises into view over the first 3 seconds */
    var rise = RM ? 1 : Math.min(1, t / 3), e = 1 - Math.pow(1 - rise, 3);
    G.grp.position.y = G.cy - (1 - e) * G.R * .3;
    if (!RM) G.earth.rotation.y += .0006;
    G.r.render(G.s, G.cam);
    /* the horizon plays the music: the atmosphere's rim moves with it */
    var pts = rim(W, H, 1.004), top = pts.filter(function (p) { return p[1] < H + 40 && p[0] > -40 && p[0] < W + 40 });
    if (top.length < 2) return;
    G.v.set(0, G.grp.position.y, 0).project(G.cam);
    var cx = (G.v.x * .5 + .5) * W, cy = (-G.v.y * .5 + .5) * H, half = W / 2;
    var bins = null, lvl = 0; if (M.on && M.an) { M.an.getByteFrequencyData(M.data); bins = M.data; for (var k = 2; k < 40; k++) lvl += bins[k]; lvl /= 38 * 255 }
    /* keep only the visible upper part of the outline, ordered left to right */
    var arc = pts.filter(function (p) { return p[1] < cy }).sort(function (p, q) { return p[0] - q[0] });
    x.save(); x.globalCompositeOperation = "lighter";
    var path = new Path2D(), amps = bins;
    {
      arc.forEach(function (p, i) {
        var sym = Math.min(1, Math.abs(p[0] - W / 2) / half), f = p[0] / W, amp = bins ? bins[3 + Math.floor(sym * 70)] / 255 : 0;
        var calm = RM ? 0 : Math.sin(f * 22 + t * 1.4) * .5 + Math.sin(f * 9 - t * .9) * .5;
        var dr = (amp * amp * 26 + calm * (1.5 + lvl * 5)) * dp * (1 - sym * .55), dx = p[0] - cx, dy = p[1] - cy, dl = Math.hypot(dx, dy) || 1;
        var px = p[0] + dx / dl * dr, py = p[1] + dy / dl * dr; if (i) path.lineTo(px, py); else path.moveTo(px, py);
      });
    }
    /* glow drawn as a few wide, faint strokes (much cheaper than a blur) */
    if (!G.gr || G.grW !== W) { G.grW = W; G.gr = [0, 1].map(function (pass) { var g = x.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "rgba(111,211,255,0)"); g.addColorStop(.25, pass ? "rgba(231,178,90,.8)" : "rgba(111,211,255,.5)"); g.addColorStop(.5, pass ? "rgba(255,226,170,.95)" : "rgba(150,225,255,.7)"); g.addColorStop(.75, pass ? "rgba(231,178,90,.8)" : "rgba(111,211,255,.5)"); g.addColorStop(1, "rgba(111,211,255,0)"); return g }) }
    var fade = .3 + .7 * e;
    [[0, 22, .07 + lvl * .12], [0, 10, .16 + lvl * .25], [0, 4, .4 + lvl * .6], [1, 1.5, .55 + lvl * 1.5]].forEach(function (L) { x.strokeStyle = G.gr[L[0]]; x.lineWidth = L[1] * dp; x.globalAlpha = Math.min(1, fade * L[2]); x.stroke(path) });
    /* soft rings leave the planet when the music swells */
    if (bins && !RM) {
      if (!G.rings) G.rings = [];
      if (lvl > (G.avg || 0) + .03 && (!G.lastRing || t - G.lastRing > 1.2)) { G.rings.push(t); G.lastRing = t }
      G.avg = (G.avg || 0) * .97 + lvl * .03;
      G.rings = G.rings.filter(function (r0) { return t - r0 < 6 });
      x.globalAlpha = 1;
      G.rings.forEach(function (r0) {
        var k = (t - r0) / 6, grow = k * H * .6; x.beginPath();
        arc.forEach(function (p, i) { var dx = p[0] - cx, dy = p[1] - cy, dl = Math.hypot(dx, dy) || 1, px = p[0] + dx / dl * grow, py = p[1] + dy / dl * grow; if (i) x.lineTo(px, py); else x.moveTo(px, py) });
        x.strokeStyle = "rgba(111,211,255," + (.2 * (1 - k)).toFixed(3) + ")"; x.lineWidth = 1.2 * dp; x.stroke();
      });
    }
    x.restore();
  }

  /* ---------- launch / show ---------- */
  var launched = SKIP;
  function launch(after) {
    if (launched) { if (after) after(); return } launched = true;
    var instant = !!(window.BA && BA.on);
    musicStop(instant);
    document.body.classList.remove("ejlon"); document.body.classList.add("ejlrise"); behind(false);
    el.classList.add("lifting"); el.scrollTop = 0; void el.offsetHeight;
    setTimeout(function () { el.classList.add("up") }, 20);
    setTimeout(function () {
      run = false; el.classList.add("gone"); el.setAttribute("aria-hidden", "true"); document.body.classList.remove("ejlrise");
      try { window.dispatchEvent(new Event("resize")) } catch (e) { }
      if (!(window.BA && BA.on)) { var h = document.querySelector(".brand h1"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }) } }
      if (after) after();
    }, instant ? 0 : 1300);
  }
  function show() {
    if (!launched) return; launched = false; run = true; el.classList.remove("gone", "up", "lifting"); el.removeAttribute("aria-hidden"); behind(true); document.body.classList.add("ejlon");
    t0 = performance.now(); size(); requestAnimationFrame(frame); setTimeout(function () { $("ejlgo").focus() }, 50);
  }
  el.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.id === "ejlarc") { if (window.EJAR) EJAR.openArchives(); return }
    if (b.id === "ejlmono") { if (window.EJAR) EJAR.openMonographs(); return }
    if (b.id === "ejlpres") { if (window.EJAR) EJAR.openPresentations(); return }
    if (b.id === "ejlsolgo") { if (window.EJSOL) EJSOL.open(); return }
    if (b.id === "ejlaccb") launch(function () { try { EJR.panel("accp", true) } catch (x) { } });
    else if (b.id === "ejlsnd") { if (M.on) { M.want = false; musicStop() } else { M.want = true; NOMUSIC = false; musicStart() } sndLabel() }
    else if (b.id === "ejlmenu") { var n = el.querySelector(".bar"), o = n.classList.toggle("open"); b.setAttribute("aria-expanded", o ? "true" : "false") }
    else if (b.classList.contains("go")) launch();
  });
  el.querySelector(".bar").addEventListener("click", function (e) { if (e.target.closest("a.nl")) { el.querySelector(".bar").classList.remove("open"); $("ejlmenu").setAttribute("aria-expanded", "false") } });
  /* blind assistance is spoken: the visual welcome steps aside (and stays silent) as soon as it is on */
  var baT = setInterval(function () { if (launched) { clearInterval(baT); return } if (window.BA && BA.on) { clearInterval(baT); launch() } }, 300);
  window.addEventListener("resize", function () { if (!launched) size() });
  if (!SKIP) { size(); requestAnimationFrame(frame) }
  if (document.readyState === "complete") fill(); else window.addEventListener("load", fill);
  sndLabel();
  window.EJLand = { _draw: function (sec) { t0 = performance.now() - (sec || 4) * 1000; frame(performance.now(), true) }, launch: launch, show: show, isOpen: function () { return !launched }, music: function () { return M.on } };
})();
