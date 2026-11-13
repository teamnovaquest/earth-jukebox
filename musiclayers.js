/* Earth Jukebox: the other datasets join the music.
   The main signal (index.html, section 3) still sets the mood, speed, chords and melody, so the music keeps its sound.
   Each extra dataset adds one gentle layer, always in the same key and on the same beat, so they blend into one piece:
     rain        -> raindrops: soft high notes from the same scale; more rain, more drops
     wind        -> breeze: soft filtered air that swells; stronger wind, louder and brighter breeze
     humidity    -> echo: more humid air, a little more echo
     cloud cover -> tone: a little softer under more cloud
     sunlight    -> sparkle: an occasional gentle chime in sunny months
     greenness   -> harmony: an added ninth on the chords, fuller where the land is greener
     haze        -> PM2.5 above 15 µg/m³ (the WHO 24-hour guideline level) or aerosol optical depth above 0.3: muffled tone and a slow wobble
     fires       -> crackle
     SI listening (when on) -> bells in the chord's notes for the months that surprised the SI's model of the place (see siLayer below)
   The numbers come from the Data panel's rows (datapanel.js), so what you hear is what the panel lists. A dataset with no
   value for the moment adds nothing. The notes are chosen from a seed made of the place, the moment and the beat, so the
   same place and timeline always give the same music. */
(function () {
  "use strict";
  var V = {}, nodes = null;
  function c01(v) { return Math.max(0, Math.min(1, v)) }
  function has(k) { return V[k] !== undefined && V[k] !== null && isFinite(V[k]) }
  /* how strong each layer is (0 = silent) */
  function amt() {
    var a = {};
    a.rain = has("rain") ? (V.rain < .2 ? 0 : c01(Math.log(1 + V.rain) / Math.log(1 + 25))) : 0;      /* 0.2 mm/day and below: dry; 25 mm/day: full */
    a.wind = has("wind") ? c01((V.wind - 1) / 11) : 0;                                                     /* 1 m/s calm .. 12 m/s strong */
    a.hum = has("rh") ? Math.max(-1, Math.min(1, (V.rh - 55) / 40)) : 0;
    a.cloud = has("cloud") ? c01(V.cloud / 100) : 0;
    a.sun = has("sun") ? c01((V.sun - 10) / 16) : 0;                                                       /* MJ/m²/day: 10 dull .. 26 very sunny */
    a.veg = has("ndvi") ? c01((V.ndvi - .2) / .6) : 0;
    a.haze = has("pm25") ? (V.pm25 <= 15 ? 0 : c01(Math.log(V.pm25 / 15) / Math.log(5))) : has("aod") ? c01((V.aod - .3) / .7) : 0;
    a.fire = has("fire") ? c01(V.fire) : 0;
    return a;
  }
  function make() {
    if (nodes || typeof ctx === "undefined" || !ctx || !bus) return nodes;
    var n = {}, len = ctx.sampleRate * 3, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    n.src = ctx.createBufferSource(); n.src.buffer = b; n.src.loop = true;
    n.bp = ctx.createBiquadFilter(); n.bp.type = "bandpass"; n.bp.Q.value = .8; n.bp.frequency.value = 600;
    n.g = ctx.createGain(); n.g.gain.value = 0;
    n.lfo = ctx.createOscillator(); n.lfo.frequency.value = .09; n.lg = ctx.createGain(); n.lg.gain.value = 0; n.lfo.connect(n.lg); n.lg.connect(n.g.gain);
    n.src.connect(n.bp); n.bp.connect(n.g); n.g.connect(bus); n.src.start(); n.lfo.start();
    nodes = n; return n;
  }
  /* after the main engine sets its sound (applyH), nudge the shared filter, echo and wobble by the extra datasets */
  function adjust() {
    if (typeof ctx === "undefined" || !ctx || !bus) return; var n = make(), a = amt(), t = ctx.currentTime;
    var base = 600 + Math.pow(H, 1.2) * 5000, f = base * (1 - .2 * a.cloud) * (1 - .35 * a.haze);
    bus.frequency.setTargetAtTime(Math.max(350, f), t, .4);
    wet.gain.setTargetAtTime(Math.max(.05, Math.min(.75, .55 - H * .35 + .08 * a.hum)), t, .6);
    lfoG.gain.setTargetAtTime((1 - H) * 30 + 10 * a.haze, t, .6);
    crk.gain.setTargetAtTime(Math.max(0, .5 - H) * .12 + .07 * a.fire, t, .4);
    if (n) { var w = a.wind; n.g.gain.setTargetAtTime(w ? .012 + .045 * w : 0, t, 1.2); n.lg.gain.setTargetAtTime(w ? .01 + .02 * w : 0, t, 1.2); n.bp.frequency.setTargetAtTime(380 + 900 * w, t, 1.5) }
  }
  /* extra notes on each eighth-note step, from the same scale and chord as the main engine */
  function layers(t, beat) {
    if (typeof PROG === "undefined") return; var a = amt(), P = PROG[H >= .66 ? "bright" : H >= .33 ? "mid" : "sad"], bar = Math.floor(step / 8) % 4, pos = step % 8, ch = P.ch[bar];
    if (a.rain && Math.random() < .08 + .5 * a.rain) { var n = P.sc[Math.floor(Math.random() * P.sc.length)] + 24 + (Math.random() < .3 ? 12 : 0); tone(n, t + Math.random() * beat * .25, beat * .18, .012 + .018 * a.rain, "sine", .004) }
    if (a.sun && pos === 4 && Math.random() < .12 + .35 * a.sun) tone(ch[Math.floor(Math.random() * 3)] + 24, t, beat * 1.5, .014 + .014 * a.sun, "triangle", .02);
    if (a.veg && pos === 0 && !(ch.indexOf(56) >= 0)) tone(ch[0] + 14, t, beat * 4, .018 + .03 * a.veg, "sine", .7 - H * .5);
    siLayer(t, beat, ch, bar, pos);
  }
  /* SI listening (si-rhythms.js): how surprising this month was to the SI's model of the place, in standard deviations (z).
     Every note is a tone of the chord being played, so the surprises ring in tune:
       temperature 2 sigma or more: a bell (with a soft fifth above it) on the first beat of every bar; warmer than expected rings high,
                                   cooler than expected rings low; 3 sigma or more adds an answering bell mid-bar;
       temperature 1 to 2 sigma:   one soft high chime every other bar;
       rain 2 sigma or more:       wetter than expected, a falling run of four high chord tones; drier, one soft low note. */
  function bellT(n, t, beat, v) { tone(n, t, beat * 3, v, "sine", .005); tone(n + 19, t, beat * 1.5, v * .25, "sine", .005) }
  function siLayer(t, beat, ch, bar, pos) {
    var Z = window.EJSI && EJSI.listening && EJSI.listening() ? EJSI.now() : null; if (!Z) return;
    var zt = Z.zt, zp = Z.zp;
    if (zt !== null) { var at = Math.abs(zt), v = .03 + .012 * Math.min(2, at - 2);
      if (at >= 2) { if (pos === 0) bellT(zt > 0 ? ch[(bar + 1) % 3] + 24 : ch[0], t, beat, v); if (at >= 3 && pos === 4) bellT(zt > 0 ? ch[(bar + 2) % 3] + 24 : ch[1], t, beat, v * .8) }
      else if (at >= 1 && pos === 0 && bar % 2 === 0) tone((zt > 0 ? ch[2] + 24 : ch[2] + 12), t, beat * 2, .016, "sine", .01) }
    if (zp !== null && Math.abs(zp) >= 2) {
      if (zp > 0 && pos >= 4) tone([ch[2] + 24, ch[1] + 24, ch[0] + 24, ch[2] + 12][pos - 4], t, beat * .6, .018, "sine", .004);
      else if (zp < 0 && pos === 4 && bar % 2 === 1) tone(ch[0] - 12, t, beat * 3, .04, "sine", .2) }
  }
  function seed(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296 } }
  function hook() {
    if (typeof window.playStep !== "function" || window.playStep._ej) return;
    var ps = window.playStep, ah = window.applyH;
    window.playStep = function (t, beat) {
      var I = window.EJP && EJP.instant ? EJP.instant() : null, P = window.pinLL, r = Math.random;
      Math.random = rng(seed((P ? P[0].toFixed(3) + "," + P[1].toFixed(3) : "earth") + "|" + (I ? I.t : 0) + "|" + step));
      try { ps(t, beat); layers(t, beat) } finally { Math.random = r }
    };
    window.playStep._ej = 1;
    window.applyH = function () { ah.apply(this, arguments); try { adjust() } catch (e) { } };
  }
  window.EJM = {
    set: function (v) { V = v || {}; try { adjust() } catch (e) { } },
    wants: function () { return typeof playing !== "undefined" && playing },
    amounts: amt, values: function () { return V }
  };
  hook();
})();
