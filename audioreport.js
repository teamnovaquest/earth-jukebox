/* Earth Jukebox: the research report as a spoken audio file (MP3).
   The words come from the same report the PDF is made from (research.js makePdf with opts.collect), so the audio says
   exactly what the PDF says: every heading, paragraph, table row and figure caption, in order.
   The voice is Piper (open source, Rhasspy), run in the visitor's own browser with vits-web; nothing is sent to a server.
   The voice model (about 60 MB) is downloaded once and kept by the browser (its private storage for this site).
   The audio is encoded to MP3 (lamejs) as it is made, so even long reports fit in memory.
   The music is part of it: the two years and their difference as Compare plays them, the natural events, and the SI's rhythms are rendered
   (offline, faster than real time, with the site's own music code) and placed where the report talks about them.
   "Play the finished example" streams an audio report that was already made (Bangladesh, 2005 and 2020) from the Earth Jukebox Archives. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i) };
  var VOICE = "en_US-hfc_female-medium", VITS = "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm", LAME = "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js",
    ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/+esm", PIPER = "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/dist/piper-DeOu3H9E.js/+esm";
  var busy = false, stop = false;
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  /* yield to the page without a timer: timers are slowed to once a minute in a background tab, messages are not */
  function yieldNow() { return new Promise(function (r) { var c = new MessageChannel(); c.port1.onmessage = function () { c.port1.close(); r() }; c.port2.postMessage(0) }) }
  var WORKER = "https://earthjukebox-byteamnovaquest.shaiyanzaman99310.workers.dev", EXAMPLE = { id: "ra72l80-2005-2020", place: "Bangladesh", y1: 2005, y2: 2020 };

  /* ---------- music clips, rendered offline at the voice's sample rate ---------- */
  /* float samples to 16-bit at a loudness close to the voice's (RMS 0.08, peaks at most 0.95), faded out at the end */
  function level(f, n, sr, fadeS) {
    var pk = 0, ss = 0, i; for (i = 0; i < n; i++) { var a = Math.abs(f[i]); if (a > pk) pk = a; ss += f[i] * f[i] }
    var rms = Math.sqrt(ss / Math.max(1, n)), g = rms > 0 ? Math.min(.08 / rms, .95 / pk) : 1, out = new Int16Array(n);
    for (i = 0; i < n; i++) { var v = Math.max(-1, Math.min(1, f[i] * g)); out[i] = v < 0 ? v * 32768 : v * 32767 }
    var fade = Math.min(n, Math.round(sr * fadeS)); for (i = 0; i < fade; i++) out[n - 1 - i] = Math.round(out[n - 1 - i] * i / fade);
    return out;
  }
  async function render(secs, sr, draw) {
    var oc = new OfflineAudioContext(1, Math.ceil(sr * secs), sr), len = draw(oc); if (!len) return null;
    var f = (await oc.startRendering()).getChannelData(0); return level(f, Math.min(f.length, Math.ceil(sr * len)), sr, .6);
  }
  /* one Compare track (b = first year, a = second year, d = difference) through the site's own music engine (index.html section 3,
     with the extra layers of musiclayers.js), stepped exactly as Compare steps it, but into an offline context; the page's own sound is untouched */
  async function yearClip(k, secs, sr) {
    var G = window, D = G.CMPX && CMPX.C && CMPX.C.data; if (!D || typeof G.setup !== "function" || typeof G.playStep !== "function") return null;
    var h = k === "b" ? D.B.h : k === "a" ? D.A.h : D.Dh; if (!h || !h.length) return null;
    var names = ["ctx", "bus", "wet", "dry", "crk", "lfoG", "master", "synG", "analyser", "H", "T", "step", "lastM", "nextT"], keep = {}, AC0 = G.AudioContext, AH = G.applyH;
    names.forEach(function (n) { keep[n] = G[n] });
    var oc = new OfflineAudioContext(1, Math.ceil(sr * (secs + 4)), sr);
    try {
      G.AudioContext = function () { return oc }; G.applyH = function () { };   /* setup() builds the engine's nodes in the offline context */
      G.setup();
      G.master.gain.value = .8; var first = h.find(function (v) { return v !== null && v !== undefined }); G.H = G.T = first === undefined ? .5 : first; G.step = 0; G.lastM = 72;
      var t = .1, n = h.length;
      while (t < secs) {
        var i = Math.min(n - 1, Math.floor(t / secs * n)), v = h[i], beat = 60 / (58 + G.H * 42);
        if (v !== null && v !== undefined) G.T = v;
        G.H += (G.T - G.H) * (1 - Math.pow(.95, 30 * beat));   /* the page eases H toward T by 5% per frame at 60 frames a second */
        var H = G.H; G.bus.frequency.setValueAtTime(600 + Math.pow(H, 1.2) * 5000, t); G.wet.gain.setValueAtTime(.55 - H * .35, t); G.dry.gain.setValueAtTime(.6 + H * .3, t); G.crk.gain.setValueAtTime(Math.max(0, .5 - H) * .12, t); G.lfoG.gain.setValueAtTime((1 - H) * 30, t);
        if (v !== null && v !== undefined) G.playStep(t, beat);
        t += beat / 2; G.step++;
      }
    } finally { G.AudioContext = AC0; G.applyH = AH; names.forEach(function (n) { G[n] = keep[n] }) }
    var f = (await oc.startRendering()).getChannelData(0); return level(f, Math.min(f.length, Math.ceil(sr * (secs + 2))), sr, 1.5);
  }
  async function clips(sr, say) {
    var C = {}, YS = 40;
    say("Rendering the music of each year…");
    try { C.b = await yearClip("b", YS, sr); C.a = await yearClip("a", YS, sr); C.d = await yearClip("d", 30, sr) } catch (e) { C.b = C.a = C.d = null }
    try { if (window.EJEV) { var R = EJEV.last && EJEV.last(); if (!R || !R.ev) R = await EJEV.analyse({ quiet: true }); if (R && R.ev && R.ev.length) { C.ev = await render(24, sr, function (oc) { return EJEV.play(R, { ctx: oc }) }); C.evR = R } } } catch (e) { C.ev = null }
    try { if (window.EJSI) { var S = await EJSI.learn({ quiet: true }); if (S) C.si = await render(40, sr, function (oc) { return EJSI.play(S, { ctx: oc }) }) } } catch (e) { C.si = null }
    C.YS = YS; return C;
  }
  function loadScript(u) { return new Promise(function (res, rej) { if (window.lamejs) return res(); var s = document.createElement("script"); s.src = u; s.onload = res; s.onerror = function () { rej(new Error("could not load the MP3 encoder")) }; document.head.appendChild(s) }) }
  /* words a voice reads well */
  function speakable(t) {
    return String(t || "").replace(/\s+/g, " ")
      .replace(/(\d)\s*°C/g, "$1 degrees Celsius").replace(/°C/g, "degrees Celsius").replace(/(\d)\s*°\s*([NSEW])\b/g, function (m, d, c) { return d + " degrees " + { N: "north", S: "south", E: "east", W: "west" }[c] }).replace(/°/g, " degrees")
      .replace(/km²/g, "square kilometres").replace(/m²/g, "square metres").replace(/µg\/m³/g, "micrograms per cubic metre").replace(/m³\/s/g, "cubic metres per second").replace(/kg\/m³/g, "kilograms per cubic metre")
      .replace(/(\d)\s*km\b/g, "$1 kilometres").replace(/(\d)\s*mm\/day/g, "$1 millimetres a day").replace(/(\d)\s*mm\b/g, "$1 millimetres").replace(/(\d)\s*m\/s/g, "$1 metres per second").replace(/kWh\/m²\/day/g, "kilowatt hours per square metre per day").replace(/MJ\/m²\/day/g, "megajoules per square metre per day")
      .replace(/ppbv/g, "parts per billion").replace(/ppm/g, "parts per million").replace(/(\d)\s*%/g, "$1 percent").replace(/ × 10¹⁵/g, " times 10 to the 15").replace(/10\^(-?\d+)/g, "10 to the $1")
      .replace(/±/g, "plus or minus ").replace(/≈/g, "about ").replace(/→|->/g, " to ").replace(/−/g, "minus ").replace(/(\d)–(\d)/g, "$1 to $2").replace(/\bp < 0\.001/g, "p below 0.001").replace(/\bp = /g, "p equals ").replace(/ & /g, " and ").replace(/>=/g, "at least").replace(/<=/g, "at most").replace(/\(mm\b/g, "(millimetres").replace(/\bmm\)/g, "millimetres)")
      .replace(/NO₂/g, "N O 2").replace(/CO₂/g, "C O 2").replace(/O₃/g, "ozone").replace(/PM2\.5/g, "P M 2.5").replace(/NDVI/g, "N D V I").replace(/\bAOD\b/g, "A O D").replace(/https?:\/\/\S+/g, "").replace(/doi\.org\/\S+/g, "")
      .replace(/[₀-₉⁰-⁹]/g, function (c) { var i = "₀₁₂₃₄₅₆₇₈₉".indexOf(c); return String(i >= 0 ? i : "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)) });
  }
  /* the report as a list of spoken pieces (short enough for the voice), with pauses after headings and paragraphs */
  function script(items, D, M) {
    M = M || {}; var out = [], clip = function (pcm) { if (pcm && pcm.length) out.push({ t: "", clip: pcm, pause: .8 }) }, add = function (t, pause) { t = speakable(t).trim(); if (!t) return; var parts = t.match(/[\s\S]+?(?:[.!?]+["')\]]*(?=\s|$)|$)/g) || [t], buf = ""; parts.forEach(function (s) { if ((buf + s).length > 420 && buf) { out.push({ t: buf.trim(), pause: .25 }); buf = "" } buf += s }); if (buf.trim()) out.push({ t: buf.trim(), pause: pause }) };
    add("Earth Jukebox research report. Comparative environmental assessment of " + D.place.name + ", " + D.y1 + " and " + D.y2 + ".", 1);
    if (M.b || M.a) {
      add("First, the music. Earth Jukebox plays every day of each year from NASA's measurements: a day cooler or wetter than this place's normal sounds brighter, a hotter or drier day darker and slower. Here is " + D.y1 + ", from January to December, in " + M.YS + " seconds.", .8); clip(M.b);
      add("And here is " + D.y2 + ".", .8); clip(M.a);
      if (M.d) { add("Finally, the difference: " + D.y2 + " played against " + D.y1 + " day by day, shifted darker or brighter by the year-wide verdict, so lost water or plants, more heat extremes or dirtier air are heard too.", .8); clip(M.d) }
      add("Now the report itself.", .9);
    }
    items.forEach(function (it) {
      if (it.k === "h1") { add("Section. " + it.t + ".", .9);
        if (M.ev && /natural events/i.test(it.t)) { add("Listen to these events first, in time order from " + (M.evR ? M.evR.y1 : D.y1) + " to today, in 20 seconds: low notes are storms, middle notes floods, high notes fires; louder means closer.", .6); clip(M.ev) }
        if (M.si && /how the SI learned/i.test(it.t)) { add("Here is what the SI learned, as music in G major: first each cycle it found as an interval above the yearly note, then the SI's model of the temperature through the whole record, rising and falling with every year, with chords from the slow cycles and bells for the months that surprised it.", .6); clip(M.si) }
        return }
      else if (it.k === "h2") add(it.t + ".", .7);
      else if (it.k === "p") add(it.t, .45);
      else if (it.k === "cap") add(it.t, .5);
      else if (it.k === "table") {
        var rows = it.rows.slice(0, 40); add("Table, with columns: " + it.cols.filter(Boolean).join(", ") + ".", .35);
        rows.forEach(function (r) { if (r && !Array.isArray(r)) { if (r.g) add(r.g + ".", .3); return } add((r || []).map(function (c, i) { return (i && it.cols[i] ? it.cols[i] + ": " : "") + String(c === null || c === undefined ? "" : (c && c.t !== undefined ? c.t : c)) }).join("; ") + ".", .3) });
        if (it.rows.length > rows.length) add("And " + (it.rows.length - rows.length) + " more rows, listed in the PDF.", .4);
      }
    });
    add("End of the report.", .5);
    return out;
  }
  /* vits-web's own predict() makes a new voice engine for every sentence and the browser runs out of memory after a few
     hundred, so the same pieces (its phonemizer and ONNX Runtime, same versions) are used here with ONE engine for the
     whole report, and the text is turned into sounds (phonemes) 30 pieces at a time. */
  var ENG = null;
  async function engine(tts, say) {
    if (ENG) return ENG;
    var get = async function () { var stored = []; try { stored = await tts.stored() } catch (e) { }
      if (stored.indexOf(VOICE) < 0) await tts.download(VOICE, function (p) { if (p && p.total) say("Downloading the voice (once only, kept by your browser): " + Math.round(p.loaded * 100 / p.total) + "%") });
      var dir = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper"), cfg = JSON.parse(await (await (await dir.getFileHandle(VOICE + ".onnx.json")).getFile()).text()), buf = await (await (await dir.getFileHandle(VOICE + ".onnx")).getFile()).arrayBuffer();
      if (buf.byteLength < 5e6) throw new Error("the stored voice file is incomplete"); return { cfg: cfg, buf: buf } };
    /* a voice download that was cut off leaves a broken file in the browser ("No graph was found in the protobuf"): it is deleted and downloaded once more */
    var drop = async function () { try { await tts.remove(VOICE) } catch (e) { } try { var d0 = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper"); for (var nm of [VOICE + ".onnx", VOICE + ".onnx.json"]) { try { await d0.removeEntry(nm) } catch (e) { } } } catch (e) { } };
    var ort = await import(ORT), piper = await import(PIPER); ort.env.allowLocalModels = false; ort.env.wasm.wasmPaths = tts.ONNX_BASE; ort.env.wasm.numThreads = navigator.hardwareConcurrency || 1;
    var v = null, sess = null;
    try { v = await get(); sess = await ort.InferenceSession.create(v.buf) }
    catch (e) { say("The voice stored in your browser was damaged; downloading it again…"); await drop(); try { v = await get(); sess = await ort.InferenceSession.create(v.buf) } catch (e2) { await drop(); throw new Error("the voice could not be downloaded in full from Hugging Face (" + (e2.message || e2) + "); check the internet connection and press the button again") } }
    ENG = { ort: ort, piper: piper, cfg: v.cfg, tts: tts, sess: sess }; return ENG;
  }
  function phonemes(E, lines) {
    return new Promise(async function (res, rej) {
      var out = [], tm = setTimeout(function () { res(out) }, 60000);
      try { (await E.piper.createPiperPhonemize({ print: function (u) { try { out.push(JSON.parse(u).phoneme_ids) } catch (e) { out.push(null) } if (out.length === lines.length) { clearTimeout(tm); res(out) } }, printErr: function () { }, locateFile: function (u) { return u.endsWith(".wasm") ? E.tts.WASM_BASE + ".wasm" : u.endsWith(".data") ? E.tts.WASM_BASE + ".data" : u } })).callMain(["-l", E.cfg.espeak.voice, "--input", JSON.stringify(lines.map(function (t) { return { text: t } })), "--espeak_data", "/espeak-ng-data"]) } catch (e) { clearTimeout(tm); rej(e) }
    });
  }
  async function speak(E, ids) {
    var o = E.ort, c = E.cfg.inference, x = { input: new o.Tensor("int64", ids, [1, ids.length]), input_lengths: new o.Tensor("int64", [ids.length]), scales: new o.Tensor("float32", [c.noise_scale, c.length_scale, c.noise_w]) };
    if (Object.keys(E.cfg.speaker_id_map || {}).length) x.sid = new o.Tensor("int64", [0]);
    var d = (await E.sess.run(x)).output.data, pcm = new Int16Array(d.length);
    for (var i = 0; i < d.length; i++) { var v = Math.max(-1, Math.min(1, d[i])); pcm[i] = v < 0 ? v * 32768 : v * 32767 }
    return pcm;
  }
  /* the whole script to MP3: returns {blob, secs} */
  /* the voice and its sample rate, ready before the music is rendered at the same rate */
  async function voice(say) { var tts = await import(VITS); await loadScript(LAME); say("Loading the voice…"); return engine(tts, say) }
  async function synth(parts, say, isStopped, kbps) {
    var E = await voice(say), sr = E.cfg.audio.sample_rate, enc = new lamejs.Mp3Encoder(1, sr, kbps || 64), mp3 = [], secs = 0, done = 0, total = parts.reduce(function (a, q) { return a + q.t.length }, 0), t0 = Date.now();
    for (var b = 0; b < parts.length; b += 30) {
      var grp = parts.slice(b, b + 30), spoken = grp.filter(function (q) { return !q.clip }), ids0 = spoken.length ? await phonemes(E, spoken.map(function (q) { return q.t })) : [], ids = [], si = 0;
      grp.forEach(function (q) { ids.push(q.clip ? null : ids0[si++]) });
      for (var i = 0; i < grp.length; i++) {
        if (isStopped && isStopped()) throw new Error("stopped");
        var pcm = grp[i].clip ? grp[i].clip : ids[i] && ids[i].length ? await speak(E, ids[i]) : new Int16Array(0), gap = Math.round(sr * grp[i].pause), all = new Int16Array(pcm.length + gap); all.set(pcm);
        for (var k = 0; k < all.length; k += 1152) { var o = enc.encodeBuffer(all.subarray(k, k + 1152)); if (o.length) mp3.push(new Uint8Array(o)) }
        secs += all.length / sr; done += grp[i].t.length;
        var el = (Date.now() - t0) / 1000, left = el / Math.max(1, done) * (total - done);
        say("Speaking the report: " + Math.round(100 * done / total) + "% (" + Math.round(secs / 60) + " min of audio so far; about " + Math.max(1, Math.round(left / 60)) + " min left)");
        await yieldNow();
      }
    }
    var end = enc.flush(); if (end.length) mp3.push(new Uint8Array(end));
    return { blob: new Blob(mp3, { type: "audio/mpeg" }), secs: secs, kbps: kbps || 64 };
  }
  function wavPCM(buf) {
    var v = new DataView(buf), sr = v.getUint32(24, true), bits = v.getUint16(34, true), ch = v.getUint16(22, true), p = 12;
    while (p < v.byteLength - 8) { var id = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3)), sz = v.getUint32(p + 4, true); if (id === "data") { if (bits !== 16) throw new Error("unexpected voice format"); var n = Math.floor(Math.min(sz, v.byteLength - p - 8) / 2 / ch), out = new Int16Array(n); for (var i = 0; i < n; i++) out[i] = v.getInt16(p + 8 + i * 2 * ch, true); return { sr: sr, pcm: out } } p += 8 + sz + (sz & 1) }
    throw new Error("the voice returned no sound");
  }
  async function make(opts) {
    opts = opts && opts.type !== "click" ? opts : {};
    var X = window.CMPX, D = X && X.C && X.C.data, st = $("cmpaudst"), btn = $("cmpaud"), say = function (t) { if (st) st.textContent = t };
    if (busy) { stop = true; say("Stopping…"); return }
    if (!D) { say("Set up a comparison first."); return }
    busy = true; stop = false; btn.textContent = "Stop making the audio"; var t0 = Date.now();
    try {
      say("Collecting the report's text (the in-depth research runs first if it has not yet)…");
      var items = [], ps = $("cmppdfst"), poll = setInterval(function () { if (ps && ps.textContent) say("Preparing the report's text: " + ps.textContent) }, 700), r;
      try { r = await EJR.pdf({ nosave: true, collect: items }) } finally { clearInterval(poll) }
      if (!r || !r.ok) throw new Error("the report could not be made" + (r && r.err ? ": " + r.err : ""));
      var E = await voice(say), M = opts.nomusic ? {} : await clips(E.cfg.audio.sample_rate, say);
      var parts = script(items, D, M), total = parts.reduce(function (a, q) { return a + q.t.length }, 0), est = total / 10.5 + parts.reduce(function (a, q) { return a + q.pause + (q.clip ? q.clip.length / E.cfg.audio.sample_rate : 0) }, 0);
      /* a file kept online must stay under the storage limit, so a very long report is encoded at a lower bit rate (speech stays clear down to 32 kbit/s) */
      var kbps = 64; if (opts.maxMB) [64, 56, 48, 40, 32, 24].some(function (k) { kbps = k; return est * k * 125 <= opts.maxMB * 1e6 * .9 });
      var out = await synth(parts, say, function () { return stop }, kbps), blob = out.blob, secs = out.secs, name = (r.name || "EarthJukebox_report.pdf").replace(/\.pdf$/, "_audio.mp3");
      if (opts.keep) { window.EJA.lastBlob = blob; say("Made " + name + " (" + Math.round(secs / 60) + " minutes, " + (blob.size / 1e6).toFixed(1) + " MB, " + kbps + " kbit/s)."); return { ok: true, name: name, minutes: secs / 60, mb: blob.size / 1e6, kbps: kbps, est: est / 60 } }
      var u = URL.createObjectURL(blob), aEl = document.createElement("a");
      aEl.href = u; aEl.download = name; document.body.appendChild(aEl); aEl.click(); aEl.remove(); setTimeout(function () { URL.revokeObjectURL(u) }, 60000);
      say("Saved " + name + " (" + Math.round(secs / 60) + " minutes, " + (blob.size / 1e6).toFixed(1) + " MB) to your downloads.");
      return { ok: true, name: name, minutes: secs / 60, mb: blob.size / 1e6 };
    } catch (e) { say(e.message === "stopped" ? "Stopped. No file was saved." : "The audio could not be made: " + (e.message || e) + ". The PDF button still works."); return { ok: false, err: e.message } }
    finally { busy = false; stop = false; if (btn) btn.textContent = "Download audio track of report" }
  }
  function ui() {
    var pdf = $("cmppdf"); if (!pdf || $("cmpaud")) return !!pdf;
    var b = document.createElement("button"); b.id = "cmpaud"; b.type = "button"; b.className = pdf.className; b.textContent = "Download audio track of report"; b.style.marginLeft = "8px"; b.title = "A spoken version of the whole report as an MP3 file, made in your browser";
    var st = document.createElement("p"); st.className = "cmpnote"; st.id = "cmpaudst"; st.setAttribute("aria-live", "polite"); st.textContent = "The whole report read aloud (MP3). Made in your browser with the open-source Piper voice; the first time downloads the voice (about 60 MB). A long report takes several minutes.";
    var host = $("cmppdfst") || pdf; host.parentNode.insertBefore(b, host.nextSibling); b.parentNode.insertBefore(st, b.nextSibling);
    b.addEventListener("click", make);
    var ex = document.createElement("button"); ex.id = "cmpaudex"; ex.type = "button"; ex.className = pdf.className; ex.style.marginLeft = "8px"; ex.textContent = "Load an already finished example (Bangladesh)";
    ex.title = "Play an audio report that was already made: Bangladesh, " + EXAMPLE.y1 + " and " + EXAMPLE.y2 + ", with the music, comparison, in-depth research, natural events and the SI's rhythms";
    b.parentNode.insertBefore(ex, b.nextSibling); ex.addEventListener("click", example);
    return true;
  }
  /* the finished example: streamed from the Earth Jukebox Archives (Cloudflare), so judges and visitors need not wait for one to be made */
  function exampleUrl() { return WORKER + "/library/audio?id=" + EXAMPLE.id }
  function example() {
    var st = $("cmpaudst"), box = $("cmpaudbox");
    if (!box) { box = document.createElement("div"); box.id = "cmpaudbox"; box.style.margin = "8px 0"; st.parentNode.insertBefore(box, st.nextSibling) }
    box.innerHTML = '<p class="cmpnote" style="margin:0 0 6px">Finished example: the audio report of <b>Bangladesh, ' + EXAMPLE.y1 + ' and ' + EXAMPLE.y2 + '</b>, made with this button from the in-depth research in the Archives. It starts with the music of both years and their difference, then reads the whole report (comparison, in-depth research, natural events with their sound, and the SI\'s rhythms with their music).</p><audio controls preload="none" style="width:100%;max-width:640px" src="' + exampleUrl() + '"></audio><div><a href="' + exampleUrl() + '&dl=1" download="EarthJukebox_report_Bangladesh_' + EXAMPLE.y1 + '-' + EXAMPLE.y2 + '_audio.mp3">Download the MP3</a></div>';
    var au = box.querySelector("audio"); au.addEventListener("error", function () { if (st) st.textContent = "The finished example could not be loaded from the Earth Jukebox Archives just now. Check the internet connection and try again." });
    try { au.play().catch(function () { }) } catch (e) { }
    if (st) st.textContent = "Playing the finished example (Bangladesh, " + EXAMPLE.y1 + " and " + EXAMPLE.y2 + ").";
    return au;
  }
  window.EJA = { make: make, script: script, speakable: speakable, synth: synth, example: example, exampleUrl: exampleUrl, EXAMPLE: EXAMPLE, clips: clips, yearClip: yearClip };
  var tries = 0; (function wait() { if (ui() || ++tries > 60) return; setTimeout(wait, 500) })();
})();
