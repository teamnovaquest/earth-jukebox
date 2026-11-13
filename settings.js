/* Earth Jukebox: Settings (button left of Compare), language (Google website translator), sidebar details, colour key, clouds, reset; and the Credits link. */
(function () {
var $ = function (id) { return document.getElementById(id) };
var KEY = "ejSet", S = { details: false, key: true, lang: "" };
try { var sv = JSON.parse(localStorage.getItem(KEY) || "{}"); if (sv && typeof sv === "object") { S.details = !!sv.details; S.key = sv.key !== false; S.lang = typeof sv.lang === "string" ? sv.lang : "" } } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) {} }

/* every language Google's website translator offers (English names; the site's own blind-assistance languages also in their own script) */
var LANGS = [["", "English (original)"], ["af", "Afrikaans"], ["sq", "Albanian"], ["am", "Amharic"], ["ar", "Arabic (العربية)"], ["hy", "Armenian"], ["as", "Assamese"], ["ay", "Aymara"], ["az", "Azerbaijani"], ["bm", "Bambara"], ["eu", "Basque"], ["be", "Belarusian"], ["bn", "Bengali (বাংলা)"], ["bho", "Bhojpuri"], ["bs", "Bosnian"], ["bg", "Bulgarian"], ["ca", "Catalan"], ["ceb", "Cebuano"], ["ny", "Chichewa"], ["zh-CN", "Chinese, Simplified (简体中文)"], ["zh-TW", "Chinese, Traditional (繁體中文)"], ["co", "Corsican"], ["hr", "Croatian"], ["cs", "Czech"], ["da", "Danish"], ["dv", "Dhivehi"], ["doi", "Dogri"], ["nl", "Dutch"], ["eo", "Esperanto"], ["et", "Estonian"], ["ee", "Ewe"], ["tl", "Filipino"], ["fi", "Finnish"], ["fr", "French (Français)"], ["fy", "Frisian"], ["gl", "Galician"], ["ka", "Georgian"], ["de", "German (Deutsch)"], ["el", "Greek"], ["gn", "Guarani"], ["gu", "Gujarati"], ["ht", "Haitian Creole"], ["ha", "Hausa"], ["haw", "Hawaiian"], ["iw", "Hebrew"], ["hi", "Hindi (हिन्दी)"], ["hmn", "Hmong"], ["hu", "Hungarian"], ["is", "Icelandic"], ["ig", "Igbo"], ["ilo", "Ilocano"], ["id", "Indonesian (Bahasa Indonesia)"], ["ga", "Irish"], ["it", "Italian (Italiano)"], ["ja", "Japanese (日本語)"], ["jw", "Javanese"], ["kn", "Kannada"], ["kk", "Kazakh"], ["km", "Khmer"], ["rw", "Kinyarwanda"], ["gom", "Konkani"], ["ko", "Korean (한국어)"], ["kri", "Krio"], ["ku", "Kurdish (Kurmanji)"], ["ckb", "Kurdish (Sorani)"], ["ky", "Kyrgyz"], ["lo", "Lao"], ["la", "Latin"], ["lv", "Latvian"], ["ln", "Lingala"], ["lt", "Lithuanian"], ["lg", "Luganda"], ["lb", "Luxembourgish"], ["mk", "Macedonian"], ["mai", "Maithili"], ["mg", "Malagasy"], ["ms", "Malay (Bahasa Melayu)"], ["ml", "Malayalam"], ["mt", "Maltese"], ["mi", "Maori"], ["mr", "Marathi"], ["mni-Mtei", "Meiteilon (Manipuri)"], ["lus", "Mizo"], ["mn", "Mongolian"], ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"], ["or", "Odia"], ["om", "Oromo"], ["ps", "Pashto"], ["fa", "Persian"], ["pl", "Polish"], ["pt", "Portuguese (Português)"], ["pa", "Punjabi"], ["qu", "Quechua"], ["ro", "Romanian"], ["ru", "Russian (Русский)"], ["sm", "Samoan"], ["sa", "Sanskrit"], ["gd", "Scots Gaelic"], ["nso", "Sepedi"], ["sr", "Serbian"], ["st", "Sesotho"], ["sn", "Shona"], ["sd", "Sindhi"], ["si", "Sinhala"], ["sk", "Slovak"], ["sl", "Slovenian"], ["so", "Somali"], ["es", "Spanish (Español)"], ["su", "Sundanese"], ["sw", "Swahili (Kiswahili)"], ["sv", "Swedish"], ["tg", "Tajik"], ["ta", "Tamil"], ["tt", "Tatar"], ["te", "Telugu"], ["th", "Thai (ไทย)"], ["ti", "Tigrinya"], ["ts", "Tsonga"], ["tr", "Turkish (Türkçe)"], ["tk", "Turkmen"], ["ak", "Twi"], ["uk", "Ukrainian"], ["ur", "Urdu (اردو)"], ["ug", "Uyghur"], ["uz", "Uzbek"], ["vi", "Vietnamese (Tiếng Việt)"], ["cy", "Welsh"], ["xh", "Xhosa"], ["yi", "Yiddish"], ["yo", "Yoruba"], ["zu", "Zulu"]];

function inject() {
 var css = document.createElement("style");
 css.textContent = "#setb{background:rgba(8,11,16,.85);color:var(--amber);border:1px solid var(--amber);padding:8px 14px;font-size:13px;width:auto}#setb:hover,#setb[aria-expanded=true]{background:var(--amber);color:#1a1205}" +
  "#setp{position:absolute;right:16px;bottom:62px;z-index:22;width:360px;max-width:calc(100% - 32px);max-height:calc(100% - 90px);overflow-y:auto;background:linear-gradient(180deg,#151c28,#0c1118);border:1px solid #6b5426;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.6);padding:14px 16px;color:var(--bone)}#setp[hidden]{display:none}" +
  "#setp header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}#setp header b{font:600 17px/1.2 'Iowan Old Style',Georgia,serif;color:var(--amber)}#setx{width:auto;background:transparent;border:0;color:var(--bone);font-size:22px;padding:0 4px;cursor:pointer}" +
  ".setrow{padding:10px 0;border-top:1px solid #222a36}.setrow label.tg{display:flex;gap:10px;align-items:flex-start;cursor:pointer;font-size:14px}.setrow input[type=checkbox]{width:auto;margin-top:3px;accent-color:#e0a43a}.setrow small{display:block;color:var(--mute);font-size:12px;line-height:1.45;margin-top:4px}.setrow select{width:100%}" +
  "#setreset{width:auto;padding:7px 12px;font-size:13px}#setsure[hidden]{display:none}#setsure{margin-top:8px;font-size:13px}#setsure button{width:auto;margin-right:6px;padding:6px 12px;font-size:13px}" +
  /* sidebar without details: only the controls and the essential readings */
  "body.ejbrief #earthPanel .ex:not(#moodnote):not(#pwarn),body.ejbrief #eicBox .ex:not(#pwarn),body.ejbrief #earthPanel details.ex,body.ejbrief .ejdetail{display:none!important}" +
  "body.ejbrief #note{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px}body.ejnokey #key{display:none!important}" +
  "#ejhelp{display:none;border:1px solid #2a3240;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5;background:#0d121a}body:not(.ejbrief) #ejhelp{display:block}#ejhelp b{color:var(--amber)}#ejhelp ul{margin:6px 0 0;padding-left:18px}#ejhelp li{margin:2px 0}" +
  "#gt_el{display:none}.goog-te-banner-frame,.skiptranslate>iframe,#goog-gt-tt,.goog-te-balloon-frame,.goog-tooltip,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf{display:none!important}body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}";
 document.head.appendChild(css);
 var row = $("bbtns"), b = document.createElement("button"); b.id = "setb"; b.type = "button"; b.textContent = "Settings"; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "setp"); b.title = "Language, sidebar details and other options";
 if (row) row.insertBefore(b, row.firstChild); else document.body.appendChild(b);
 var p = document.createElement("section"); p.id = "setp"; p.hidden = true; p.setAttribute("aria-label", "Settings");
 p.innerHTML = '<header><b>Settings</b><button id="setx" type="button" aria-label="Close settings">&times;</button></header>' +
  '<div class="setrow"><label for="setlang" class="notranslate" translate="no">Language / ভাষা / भाषा / 语言 / Idioma / Langue / اللغة</label><select id="setlang"></select><small id="setlangnote">Translates the website\'s text with Google Translate. Place names and scientific terms may be imperfect; numbers and NASA data do not change. Blind assistance keeps its own spoken language (choose it in its menu).</small></div>' +
  '<div class="setrow"><label class="tg"><input type="checkbox" id="setdet"> <span>Turn on sidebar details<small>Explanations of each mode, button and setting, data notes and sources in the sidebar. Off keeps the sidebar short.</small></span></label></div>' +
  '<div class="setrow"><label class="tg"><input type="checkbox" id="setkey"> <span>Colour key on the globe<small>The box at the lower left that explains the colours of the picture.</small></span></label></div>' +
  '<div class="setrow"><label class="tg"><input type="checkbox" id="setcl"> <span>Clouds on the globe<small>Off shows NASA Blue Marble, a cloud-free picture of Earth. Same as the Clouds button at the top.</small></span></label></div>' +
  '<div class="setrow"><button id="setreset" type="button" class="alt">Reset everything</button><small>Clears your settings, blind-assistance choices, saved analyses and DJ Box volume on this device, then reloads the page.</small><div id="setsure" hidden>Are you sure? <button id="setyes" type="button">Yes, reset</button><button id="setno" type="button" class="alt">No</button></div></div>';
 (row && row.parentNode ? row.parentNode : document.body).appendChild(p);
 var sel = $("setlang"); LANGS.forEach(function (l) { var o = document.createElement("option"); o.value = l[0]; o.textContent = l[1]; sel.appendChild(o) }); sel.value = S.lang;
 sel.classList.add("notranslate"); sel.setAttribute("translate", "no");
 b.addEventListener("click", function () { toggle() });
 $("setx").addEventListener("click", function () { toggle(false) });
 document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !p.hidden) toggle(false) });
 sel.addEventListener("change", function () { setLang(sel.value) });
 $("setdet").addEventListener("change", function () { S.details = $("setdet").checked; save(); applyDetails() });
 $("setkey").addEventListener("change", function () { S.key = $("setkey").checked; save(); document.body.classList.toggle("ejnokey", !S.key) });
 $("setcl").addEventListener("change", function () { var c = $("cl"); if (c && (c.getAttribute("aria-pressed") === "true") !== $("setcl").checked) c.click() });
 $("setreset").addEventListener("click", function () { $("setsure").hidden = false; $("setyes").focus() });
 $("setno").addEventListener("click", function () { $("setsure").hidden = true });
 $("setyes").addEventListener("click", resetAll);
 /* the "music follows" box is an explanation too */
 var dx = $("dexp"); if (dx && dx.parentNode) dx.parentNode.classList.add("ejdetail");
 /* a short guide to the current mode and the buttons, shown only with details on */
 var aside = document.querySelector("aside"), help = document.createElement("div"); help.id = "ejhelp"; if (aside) aside.insertBefore(help, aside.firstChild);
 applyDetails(); document.body.classList.toggle("ejnokey", !S.key); modeHelp(); setInterval(modeHelp, 1500);
 /* credits */
 var cb = $("credb"), ca = $("credall"); if (cb && ca) cb.addEventListener("click", function () { ca.hidden = !ca.hidden; cb.setAttribute("aria-expanded", String(!ca.hidden)); cb.textContent = ca.hidden ? "Credits" : "Hide credits" });
 if (S.lang) setLang(S.lang, true);
}
function toggle(on) { var p = $("setp"), b = $("setb"); if (on === undefined) on = p.hidden; p.hidden = !on; b.setAttribute("aria-expanded", String(on)); if (on) { $("setdet").checked = S.details; $("setkey").checked = S.key; var c = $("cl"); $("setcl").checked = !c || c.getAttribute("aria-pressed") === "true"; $("setlang").value = S.lang; $("setsure").hidden = true; $("setlang").focus() } else b.focus() }
function applyDetails() { document.body.classList.toggle("ejbrief", !S.details); var c = $("setdet"); if (c) c.checked = S.details; modeHelp() }
var lastMode = "";
function modeHelp() {
 var h = $("ejhelp"); if (!h || !S.details) return;
 var moon = document.body.classList.contains("moon"), eic = !!window.EICON, m = moon ? "moon" : eic ? "eic" : "earth"; if (m === lastMode) return; lastMode = m;
 var intro = m === "moon" ? "<b>Moon mode.</b> A 3D Moon from NASA Moon Trek, with what is known about how people have changed it and the changes NASA's Lunar Reconnaissance Orbiter has seen. Drag to look around; click a site in the list to turn the Moon towards it; click Earth in the sky or press Esc to go back."
  : m === "eic" ? "<b>NASA Earth Information Center (EIC) mode.</b> Pick a NASA dataset (daily EIC visualisations, earth.gov data, or Visible Earth). Its frames are wrapped on the globe, and the music follows the dataset's value at your pin: where it sits on NASA's own colour scale, or compared with your pin's own average. When a frame has no reading at your pin, the music plays an estimate from the nearest readings and says so under the mood."
  : "<b>Earth mode.</b> NASA satellite pictures on the globe (Visible Earth, air temperature, sea surface temperature or sea level), and music made from NASA POWER's climate record at your pin since 1981 (the whole Earth since 1880). 50 out of 100 means normal for that place; lower and darker means hotter or drier than its 1981-2010 normal; higher and brighter means cooler or wetter.";
 h.innerHTML = intro + "<ul>" + [["Click the globe", "drop a pin; the music and numbers follow that place"], ["Play timeline", "plays the years as a time-lapse with music; Speed, Music length and the years set how"], ["Play music", "plays or stops the music for the date shown"], ["Live now", "jumps to NASA's newest picture"], ["Analytics", "the SI analyses every dataset under your pin (limited uses a day)"], ["Open SI Assistant", "ask questions; it can move the pin and play datasets"], ["More modes", "switches between EIC mode and the Earth layers"], ["Map view", "a flat, zoomable map with place names"], ["Clouds", "on: the day's real clouds; off: cloud-free Blue Marble"], ["Compare", "one place in two years: pictures, data, music and an SI research essay"], ["DJ Box", "volume, and your own music for each mood"], ["Examples", "one click plays a NASA dataset at a chosen place, or runs a real, documented event in Compare"], ["Accuracy", "how well the site's readings agree with independent scientific records, and the real events it was tested on"], ["Settings", "language, these details, the colour key, reset"], ["Blind assistance", "a spoken, keyboard or voice-controlled version of the whole site"]].map(function (x) { return "<li><b>" + x[0] + ":</b> " + x[1] + "</li>" }).join("") + "</ul>";
}
/* Google's website translator: loaded only when a language is chosen */
function gtCookie(v) { var d = location.hostname, exp = v ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT"; var val = v ? "/en/" + v : ""; document.cookie = "googtrans=" + val + "; path=/" + exp; if (d && d.indexOf(".") > 0) { document.cookie = "googtrans=" + val + "; path=/; domain=" + d + exp; document.cookie = "googtrans=" + val + "; path=/; domain=." + d + exp } }
function gtLoad() { return new Promise(function (res, rej) {
 if (window.google && google.translate && google.translate.TranslateElement && $("gt_el") && $("gt_el").querySelector(".goog-te-combo")) { res(); return }
 if (!$("gt_el")) { var d = document.createElement("div"); d.id = "gt_el"; document.body.appendChild(d) }
 window.ejGtInit = function () { try { new google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "gt_el") } catch (e) { rej(e); return } var t = Date.now(), iv = setInterval(function () { if ($("gt_el").querySelector(".goog-te-combo")) { clearInterval(iv); res() } else if (Date.now() - t > 15000) { clearInterval(iv); rej(new Error("timeout")) } }, 150) };
 if (!document.getElementById("gtjs")) { var s = document.createElement("script"); s.id = "gtjs"; s.src = "https://translate.google.com/translate_a/element.js?cb=ejGtInit"; s.onerror = function () { rej(new Error("blocked")) }; document.head.appendChild(s) } else if (window.google && google.translate) window.ejGtInit() }) }
function setLang(code, quiet) {
 var note = $("setlangnote");
 if (!code) { S.lang = ""; save(); gtCookie(""); if (!quiet) location.reload(); return }
 S.lang = code; save(); gtCookie(code);
 if (note && !quiet) note.textContent = "Loading the translation…";
 gtLoad().then(function () { var c = $("gt_el").querySelector(".goog-te-combo"), t0 = Date.now();
  /* the translator fills its own language list a moment after it loads */
  var go = function () { var ok = false; for (var i = 0; i < c.options.length; i++) if (c.options[i].value === code) ok = true;
   if (!ok && Date.now() - t0 < 6000) { setTimeout(go, 250); return }
   if (ok) { c.value = code; c.dispatchEvent(new Event("change")) }
   setTimeout(function () { var done = /translated-(ltr|rtl)/.test(document.documentElement.className); if (note) note.textContent = done ? "Translated with Google Translate. Choose English (original) to switch back." : "Google Translate does not offer this language on websites. Choose another one." }, 2500) };
  go() })
  .catch(function () { if (note) note.textContent = "Google Translate could not be reached. Check the connection, or an ad or script blocker, and try again." });
}
function resetAll() { try { if (window.BAX && BAX.clearPrefs) BAX.clearPrefs() } catch (e) {} try { ["ejSet", "ejMLEN", "ejAnalyses", "ejDJvol", "ejBA"].forEach(function (k) { localStorage.removeItem(k) }) } catch (e) {} gtCookie(""); location.reload() }

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject); else inject();
window.EJSET = { S: S, toggle: toggle, setLang: setLang };
})();
