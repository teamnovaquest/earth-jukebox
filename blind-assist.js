/* Earth Jukebox: blind assistance.
   Keyboard (keys only, or typing) and voice control, spoken in the visitor's language.
   Loaded after index.html's main script; translations come from blind-assist-lang.js.
   Nothing here runs for sighted visitors who press J (or "No thanks") on the first screen. */
(function () {
"use strict";
var $ = function (id) { return document.getElementById(id) };
var STR = window.BA_STR || {};
var EN = {
 /* examples, accuracy, why it sounds like this, the PDF report and the SI overview menu (research.js) */
 m_ex: "Examples", d_ex: "One-click examples: NASA datasets at chosen places, and real events to compare.",
 m_acc: "How accurate is this?", d_acc: "How well the site's readings agree with independent scientific records, and the real events it was tested on.",
 m_why: "Why does it sound like this?", d_why: "Explains the music right now: its speed, notes and chords, and the data behind them. You can also press W at any time.",
 ex_g_mode: "Listen to NASA data", d_ex_g_mode: "Plays a NASA dataset at a chosen place.",
 ex_g_cmp: "Compare two years: real events", d_ex_g_cmp: "Runs Compare on a real, documented event. Press Backspace on an event to hear what the site measured and what scientists reported.",
 ex_delhi: "Air pollution over New Delhi", d_ex_delhi: "NASA's map of fine-particle pollution, hour by hour: the smog rises and falls with every day and night.",
 ex_sahara: "Day and night in the Sahara", d_ex_sahara: "NASA's map of air temperature, hour by hour: hot days and cool nights in the desert.",
 ex_punjab: "Two harvests a year in Punjab", d_ex_punjab: "NASA's vegetation map since December 2023: the fields turn green and are harvested twice a year.",
 ex_phoenix: "A warming city: Phoenix since 1981", d_ex_phoenix: "NASA POWER's air temperature record since 1981, one step a year.",
 ex_cmp: "{p}: {b} and {a}",
 ev_water: "The site measured the water in the satellite picture: {x} percent in {b} and {y} percent in {a}.",
 ev_heat: "The site measured the hottest day: {x} degrees Celsius in {b} and {y} degrees in {a}. Days of 35 degrees or more: {m} in {b} and {n} in {a}.",
 ev_rain: "The site measured the July rain: {x} millimetres in {b} and {y} millimetres in {a}. The wettest day of {a} had {z} millimetres.",
 ev_aral: "Scientists report that the Aral Sea shrank after the rivers feeding it were diverted to water farms from the 1960s, and that its eastern part dried up completely in 2014.",
 ev_mead: "Scientists report that in July 2022 Lake Mead was at its lowest level since it was first filled in 1937, about a quarter full, after a long drought.",
 ev_palm: "Scientists report that the Palm Jumeirah island was built on the sea from 2002, and that its palm shape was complete by late 2003.",
 ev_paris: "Scientists report that the summer of 2003 brought a record heat wave to France and much of Europe.",
 ev_peshawar: "Scientists report that monsoon rains far above normal in late July and August 2010 caused Pakistan's worst floods, with up to 300 millimetres of rain in 36 hours in this province.",
 ev_src: "Source: {s}.", ev_run: "Press Enter to run this comparison.",
 acc_sum_l: "Summary",
 acc_sum: "To check its readings, the site read {n} points from NASA's pictures and compared each with an independent scientific record at the same place and hour. Air temperature, humidity and wind agree strongly. Sea temperature, ozone and carbon monoxide agree moderately. Fine particles agree weakly, because NASA's model and the reference model differ.",
 acc_item: "{name}: {n} points compared with {ref}. Correlation {r}, where 1 would be perfect. Typical difference {d} {u}.",
 acc_note_sst: "The readings are slightly stretched: up to about 1.5 degrees too warm in very warm seas.",
 acc_note_pm: "Over oceans and deserts NASA's model shows much less fine-particle pollution than the reference model. The site reads NASA's colours correctly.",
 acc_ev: "Tested against real events", d_acc_ev: "Five documented events. Press Enter on one to hear what the site measured and what scientists reported.",
 acc_num_l: "NASA's own numbers",
 acc_srv_l: "Checked against NASA's server",
 acc_srv: "For {names}, what the site shows was checked against the same values fetched fresh from NASA's own server: {n} checks at 234 places around the world. They agree strongly, with a correlation of at least {r}, where 1 is perfect. The only differences come from rounding when the numbers are stored for the website.",
 acc_num: "For {names}, the site uses NASA's own numbers instead of reading colours: the exact values NASA drew the pictures from, saved from NASA's server with the frames, at the NASA grid point nearest your pin. Checked against NASA's pictures, they match with a rank correlation of {r}, where 1 would be perfect.",
 cm_aex: "Play the finished audio report example, Bangladesh", d_cm_aex: "Plays an audio report that was already made for Bangladesh, 2005 and 2020: the music of both years, then the whole report with the natural events and the SI's rhythms. Choose it again to pause. The report is in English.", cm_aplay: "Play the audio report", d_cm_aplay: "Reads the whole research report aloud now, section by section. Press Escape to stop. The report is in English.",
 cm_adl: "Download the audio report", d_cm_adl: "Makes the whole report as a spoken MP3 file and saves it to your downloads. It takes several minutes; I will tell you the progress.",
 cm_a_wait: "Preparing the report. This can take a few minutes.", cm_a_ok: "The audio report is saved to your downloads. It is {n} minutes long.", cm_a_fail: "Sorry, the audio report could not be made.",
 cm_si: "Let the SI learn this place", d_cm_si: "The SI trains a small model on NASA's monthly record of this place, finds its repeating cycles and unusual months, and reads what it learned aloud.", cm_si_wait: "The SI is learning this place. This takes a few seconds.", cm_si_fail: "NASA's monthly record could not be reached. Try again in a minute.", cm_siplay: "Hear the rhythms", d_cm_siplay: "Plays the cycles the SI found as voices pulsing at their own pace, with a ping for each unusual month.", cm_ev: "Analyse natural events", d_cm_ev: "Finds storms, floods, wildfires, volcanoes and earthquakes within 500 kilometres of this place since 2000, from NASA's natural event tracker, and reads the summary aloud.", cm_ev_wait: "Asking NASA's natural event tracker. This takes a few seconds.", cm_ev_fail: "The natural event tracker could not be reached. Try again in a minute.", cm_evplay: "Hear the natural events", d_cm_evplay: "Plays one note per event over 20 seconds: low notes are storms, middle notes floods, high notes fires; louder means closer.", cm_evpdf: "Download the natural events report", d_cm_evpdf: "Saves the natural events report as a PDF file.", cm_demo: "Load the finished example", d_cm_demo: "Loads a finished in-depth research of Dhaka, 1980 and 2020, in a few seconds.", cm_demo_ok: "Loaded the finished Dhaka example. Open in-depth research to hear it.",
 cm_lib: "Load a shared research for this place", d_cm_lib: "Loads an in-depth research that another visitor already made for this place and these years, instead of waiting for a new one.",
 cm_lib_none: "No shared research for this place and these years yet.", cm_lib_ok: "Loaded a shared research made on {d}. Open in-depth research to hear it.",
 m_data: "Data panel: every number right now", d_data: "Hear every dataset's real number for the moment the timeline is on, at your pin or averaged over your range, and what each one does to the music. The numbers are read in English.",
 m_range: "Range: average over an area", d_range: "Choose the area the music and the data panel average over: the pin itself, a circle from 10 to 5,000 kilometres around it, or the whole Earth.",
 r_pin: "At the pin", r_km: "Within {km} kilometres of the pin", r_earth: "The whole Earth", r_set: "Range set: {r}.",
 m_all: "Everything this website can do", d_all: "Hear every part of the website, one after another.",
 all_q: "Would you like to hear a list of everything this website can do? Press F for yes, or J for no.",
 all_intro: "Here is everything this website can do, in the order of the main menu.", data_wait: "Reading every dataset. One moment.",
 acc_how_l: "How the test was done",
 acc_how: "The test used {n} places around the world, one every 10 degrees of latitude and 20 degrees of longitude, at many hours between 22 October and 2 November 2026. Each reading was compared with the ERA5 and CAMS records of the European weather centre, or with the Copernicus ocean record.",
 u_c: "degrees Celsius", u_gkg: "grams per kilogram", u_ms: "metres per second", u_ppb: "parts per billion", u_ug: "micrograms per cubic metre",
 wy_snd: "The music has a tempo of {bpm} beats a minute, the melody is around {note}, with {ch} chords.",
 wy_ch_b: "bright", wy_ch_m: "mixed", wy_ch_d: "dark", wy_plus: "plus {v}", wy_minus: "minus {v}",
 wy_none: "Nothing is driving the music yet. Choose a dataset and a place first.",
 wy_eic: "This is because {mode} at your pin is {pct} percent of the way up NASA's colour scale.",
 wy_eicr: "This is because {mode} at your pin is {pct} percent of the way up the dataset's display range.",
 wy_eicz: "This is because {mode} at your pin is {z} standard deviations from its usual value here.",
 wy_below: "This is because {mode} at your pin is below the lowest colour on NASA's scale.",
 wy_est: "This reading is an estimate from the nearest NASA readings.",
 wy_sad: "For this dataset, higher values sound lower and sadder.", wy_br: "For this dataset, higher values sound higher and brighter.",
 wy_clim_air: "This is because the 12-month average air temperature here is {d} degrees compared with this place's 1981 to 2010 normal. Warmer than normal sounds lower and sadder.",
 wy_clim_sea: "This is because the sea's skin temperature here is {d} degrees compared with this place's 1981 to 2010 normal. Warmer than normal sounds lower and sadder.",
 wy_land_rain: "Rain counts too: wetter than normal sounds brighter.",
 wy_glob: "This is because the whole Earth's temperature is {d} degrees compared with 1951 to 1980. Warmer sounds lower and sadder.",
 wy_cmp: "On {date}, compared with this place's normal for the month, the week's temperature was {t} degrees and its rain {p} millimetres a day. Cooler and wetter sounds brighter.",
 wy_cmpd: "The difference track is brighter on days when {a} was cooler or wetter than {b}, and darker when it was hotter or drier.",
 wy_cmpd_w: "Overall {a} was worse, so it is shifted darker.", wy_cmpd_b: "Overall {a} was better, so it is shifted brighter.", wy_cmpd_s: "Overall the two years were about the same.",
 cm_pdf: "Download the research report (PDF)", d_cm_pdf: "Saves a formal research report of this comparison to your downloads folder: methods, every number, statistical tests, tables, pictures and references.",
 cm_pdf_wait: "Making the report. Please wait.", cm_pdf_ok: "The report has been saved to your downloads folder. It has {n} pages.", cm_pdf_fail: "Sorry, the report could not be made. Please try again.", cm_pdf_load: "The pictures are still loading. Please try again in a moment.",
 cm_deep: "In-depth research", d_cm_deep: "The full weather record of this place since 1950 with trend tests, and research chosen for this kind of place, such as greenness and land cover change, sea level, salinity, river flow and threatened species. It takes about two minutes. The research texts are in English.",
 cm_deep_wait: "Running the in-depth research. It takes about two minutes. I will tell you when it is ready.", cm_deep_busy: "The in-depth research is still running. {s}",
 cm_deep_ready: "The in-depth research is ready. Choose a part to hear it.", cm_deep_fail: "Sorry, the in-depth research could not be made. Please try again later.",
 cm_deep_kind: "Kind of place", cm_deep_err: "Parts that could not be made",
 cm_ov_all: "Read the whole overview", d_cm_ov_all: "Reads the whole SI research essay aloud.", d_cm_ov_part: "Reads this part of the SI research essay aloud.",
 cm_ov_src: "Sources the SI read", d_cm_ov_src: "Lists the published sources the SI used.",
 cm_ov_new: "Write a new overview", d_cm_ov_new: "The SI writes a new research essay. This uses one of your chat questions.",
 cm_ov_ready: "The SI overview is ready. Choose a part to hear it, or choose Read the whole overview.",
 d_cm_ov: "Hear the SI's research essay about these numbers, part by part. Writing it the first time uses one of your chat questions.",
 start_title: "Blind assistance",
 start: "Welcome to Earth Jukebox. Press F to turn on blind assistance, or J to continue without it.",
 btn_on: "Turn on (F)", btn_off: "No thanks (J)",
 later: "You can change this at any time with Control, Alt and B.",
 resume: "Blind assistance is on. Press any key to start, or J to turn it off.",
 is_on: "Blind assistance is on.",
 lang_q: "Choose your language. Press F for English, or J for another language.",
 lang_type: "Type the name of your language, or press the Down arrow to hear the list. Press Enter to choose.",
 lang_title: "Languages", lang_ph: "Type your language",
 lang_confirm: "{name}. Press Enter again to confirm, or keep moving with the arrows.",
 lang_nomatch: "No language matches that. Keep typing, or press the Down arrow for the list.",
 lang_set: "Language changed to {name}.",
 method_q: "Thank you for choosing your language. How would you like to use the site? Press F for the keyboard, or J for your voice.",
 kb_q: "Option one: use only the F, J, Space, Enter and arrow keys. Option two: type your requests, with a braille keyboard or by touch typing. Press F for option one, or J for option two.",
 voice_none: "Voice input does not work in this browser. Please use Chrome or Edge. For now, I will switch to typing.",
 voice_mic: "Please allow the microphone when your browser asks.",
 voice_denied: "The microphone is blocked, so I switched to typing.",
 guide_q: "Would you like a short two-minute guide to Earth Jukebox and how to use it? Press F for yes, or J for no.",
 m_sil: "SI listening: on or off", d_sil: "The SI learns your pin's NASA record, rings bells in the music for the months that surprised it, and the data panel says how expected each month was.", sil_on: "SI listening is on. The SI is learning this place. Surprising months will ring as bells in the music, and the data panel will say how expected each month was.", sil_off: "SI listening is off.", sil_pin: "Put a pin on a place first, then turn on SI listening.", m_mute: "Mute humans: on or off", d_mute: "Hear this place as it would be without the warming humans caused. It is a simulation: temperatures and carbon dioxide are recalculated, and rain, pollution and the other numbers stay NASA's real ones.", mute_on: "Humans muted. This is a simulation, not a measurement. Earth Jukebox now takes away the warming people caused: 1.37 degrees worldwide by 2024, about one and a half times that over land and a little less at sea, from published climate science. The music, the data panel and the temperature maps now use these simulated numbers, and carbon dioxide is set to 278 parts per million, its level before industry. Rain, pollution, greenery and sea level stay NASA's real numbers. Compare is paused. Choose this item again to bring humans back.", mute_off: "Humans are back. Everything is NASA's real data again.", mute_cmp: "Compare is paused while humans are muted. Turn off Mute humans in the main menu first.", m_more: "More about Earth Jukebox", d_more: "Hear the papers and presentations about Earth Jukebox, explained in plain words.", more_mono: "Hear monographs", d_more_mono: "Plain-language spoken versions of the papers about Earth Jukebox: the research paper, the user guide, how the SI learns, and the accuracy paper.", more_pres: "Hear presentations", d_more_pres: "Spoken versions of the presentations about Earth Jukebox.", more_sol: "Physical solutions: machines that act on climate change", d_more_sol: "Fifteen designs in three groups: domestic, industrial and municipal. Hear a summary, hear the parts one by one, or open the documents.", sol_domestic: "Domestic: homemade builds", sol_industrial: "Industrial: company scale", sol_municipal: "Municipal: city and government scale", sol_soon: "This model is still being prepared. Paddy Jukebox, in Domestic, is ready.", sol_sum: "Hear the summary", sol_parts: "Hear the parts, one by one", sol_build: "Open the build document", sol_fin: "Open the financial statement", sol_slides: "Open the presentation", sol_opened: "Opened in a new tab. Your screen reader can read it there.", doc_start: "{t}. Press Escape at any time to stop.", doc_end: "That is the end. Choose another one, or press Escape to go back.", doc_en: "This is read in English.",
 sr_warn: "Before you continue: Earth Jukebox works best with its own blind assistance, not with a screen reader. Blind assistance already speaks every part of the website for you, and two voices at once would be confusing. If a screen reader is running, please turn it off now for the fullest experience. In Narrator, press Windows, Control and Enter. In N V D A, press Insert and Q. In VoiceOver on a Mac, press Command and F5. Press J to skip this message.",
 guide_skip: "Press J at any time to skip the guide.",
 guide_end: "That is the end of the guide.",
 ready_keys: "Main menu. Use the Up and Down arrows, and press Enter to choose.",
 ready_typing: "The assistant is ready. Type your request and press Enter. Press Escape for the menus.",
 ready_voice: "Ready. Hold the Space bar, speak, then let go. Press Escape for the menus.",
 of: "{i} of {n}",
 hint: "Up and Down: move · Enter or Right: choose · Left or Escape: back · Space: play or pause · R: repeat",
 menu: "Main menu",
 m_play: "Play a dataset", m_now: "Now playing", m_place: "Choose a place", m_where: "Where am I", m_an: "Analytics", m_set: "Settings", m_help: "Help", m_repeat: "Repeat the last message",
 g_eic: "EIC daily visualizations", g_veda: "Earth.gov datasets", g_more: "Climate records since 1981",
 n_toggle: "Play or pause", n_loop: "Loop, now {v}", n_status: "Hear the current reading", n_louder: "Louder", n_quieter: "Quieter", n_faster: "Faster", n_slower: "Slower", n_stop: "Stop",
 p_here: "Use my current location", p_seas: "Oceans and seas", p_list: "Countries", p_recent: "Recent places", p_none: "No recent places yet.",
 c_af: "Africa", c_as: "Asia", c_eu: "Europe", c_na: "North America", c_sa: "South America", c_oc: "Oceania",
 s_lang: "Language", t_rate: "Voice speed", t_dates: "Announce dates while playing", t_voice: "Voice output", t_method: "Input method", s_rate: "Voice speed, now {v}", s_dates: "Announce dates while playing, now {v}", s_voice: "Voice output, now {v}", s_method: "Input method, now {v}", m_climate: "Climate here, last 10 years", climate_wait: "Reading NASA's climate record for this place.", climate_fail: "NASA's climate record for this place could not be read.", range_note: "You asked for {ask}, but NASA's data for this dataset covers {from} to {to}.", yrs: "{a} to {b}", still: "Still loading, {done} of {total} frames read.", still0: "Still loading. Please wait.",
 s_off: "Turn off blind assistance", s_restart: "Start blind assistance over",
 h_guide: "Play the guide", h_keys: "List the keys",
 on: "on", off: "off", r_slow: "slow", r_normal: "normal", r_fast: "fast", r_vfast: "very fast",
 d_ends: "start and end only", d_every: "every step",
 o_site: "this site's voice", o_sr: "my screen reader",
 me_keys: "keys only", me_typing: "typing", me_voice: "voice",
 saved: "Saved.",
 loading: "Loading {mode}. Please wait.",
 load_fail: "Sorry, this data could not be loaded.",
 play_ann: "Playing {mode} at {place}, from {from} to {to}.",
 play_loop: "It will repeat until you stop it.",
 ended: "The timeline has finished.",
 paused: "Paused.", playing: "Playing.", stopped: "Stopped.",
 nothing: "Nothing is loaded yet. Choose a dataset first.",
 loop_on: "Loop is on.", loop_off: "Loop is off.",
 vol: "Volume {v} percent.",
 faster_ok: "Faster.", slower_ok: "Slower.", speed_max: "This is already the fastest speed.", speed_min: "This is already the slowest speed.",
 clouds_on: "Clouds on.", clouds_off: "Clouds off.", map_on: "Map view.", globe_on: "Globe view.",
 status: "{place}. {mode}. {date}. {reading}. {mood}.",
 searching: "Searching.",
 pin_moved: "Your pin is now at {name}.",
 pin_area: "I could not find the exact place, so your pin is at {name}.",
 pin_fail: "I could not find that place.",
 my_loc: "My location",
 loc_fail: "Your location is not available.",
 an_nopin: "Choose a place first.",
 an_q: "Analyse the climate at your pin, {place}? You have {n} analyses left today. Press F for yes, or J for no.",
 an_wait: "Analysing. This takes about a minute.",
 an_done: "The analysis is ready. Use the arrows to move through it.",
 an_none: "There are no analyses left today.",
 an_fail: "The analysis could not be finished.",
 a_verdict: "Verdict", a_summary: "Summary", a_find: "Finding", a_region: "This region", a_act: "Action", a_limits: "Limits",
 v_degrading: "Climate getting worse here", v_improving: "Improving", v_stable: "No clear change", v_mixed: "Mixed signals", v_insufficient: "Not enough data",
 credits_out: "You have used today's assistant requests. The menus and short commands still work.",
 heard: "I heard: {text}.",
 think: "One moment.",
 busy: "Please wait, I am still working on your last request.",
 not_caught: "Sorry, I did not catch that. Please try again.",
 v_nospeech: "I did not hear anything. Hold the Space bar down the whole time you speak, then let go.",
 v_nomic: "No microphone was found. Check that it is plugged in and allowed for this site.",
 v_network: "The browser's speech service could not be reached, so I could not hear you. Check the internet connection, or press Escape and type instead.",
 v_lang: "This browser cannot recognise speech in this language, so I will listen for English from now on. You can also press Escape and type.",
 yn: "Press F for yes, or J for no.",
 yn_voice: "Say yes or no, or press F for yes, or J for no.",
 bs: "In any menu, Up and Down move, Enter chooses, Left goes back, and Backspace tells you what the highlighted item is and what it does.",
 gk: "Three keys work everywhere. Control, Alt and B turns blind assistance on or off. Control, Alt and R starts blind assistance again from the first question. Control, Alt and Backspace erases all your settings and history on this site, after asking you to confirm.",
 s_reset: "Erase all settings and history",
 reset_q: "Erase all your settings and history on this site? This deletes your language, input method, recent places, chat and saved analyses, and starts fresh like a first visit. Today's usage limits stay.",
 reset_yes: "Erase everything (F)", reset_no: "Cancel (J)", reset_done: "Everything is erased. Starting fresh.",
 vg_title: "A short guide",
 vg_q: "Would you like to listen to a short guide on how the Earth Information Jukebox works? Press F for yes, or J for no.",
 vg_yes: "Play the guide (F)", vg_no: "No thanks (J)", vg_stop: "Stop the guide (J)",
 vg1: "Earth Jukebox turns NASA's Earth data into music. Choose a place, called your pin, by clicking anywhere on the globe or by picking a place in the panel on the right. Then choose a dataset, such as air temperature, ozone or sea level, and press Play timeline. The picture steps through the days or years, and the music follows the reading at your pin: brighter, faster and higher music means a healthier reading, darker and slower music a worse one.",
 vg2: "The site opens in EIC mode, with daily visualizations from NASA's Earth Information Center and datasets from earth.gov. More modes switches to long climate records since 1981, and Back to EIC mode returns. The colour key on the left explains the colours, and the panel on the right shows the date, the reading and what you are hearing.",
 vg3: "Analytics studies the long-term climate at your pin and suggests actions, up to five times a day. Open SI Assistant to ask questions, or to say things like: put my pin on Dhaka, or play carbon dioxide here. Map view switches between the globe and a flat map, Clouds turns the clouds on or off in the photo layer, and DJ Box mixes your own music with the data.",
 vg4: "Press Control, Alt and B at any time for blind assistance, and Control, Alt and Backspace to erase your settings and start fresh. Enjoy listening to the Earth.",
 hint_bs: "Backspace: describe",
 d_none: "There is no extra description for this item.",
 d_play: "Choose a NASA dataset to hear at your pin. They are in three groups: daily visualizations from NASA's Earth Information Center, datasets from earth.gov, and climate records since 1981.",
 d_now: "Controls for what is playing: play or pause, loop, the current reading, volume, speed, and stop.",
 d_place: "Move your pin: to your own location, to a city chosen by continent and country, to an ocean or sea, or to a place you used before.",
 d_where: "Says where your pin is, what is playing, the date, the reading and the mood of the music.",
 d_climate: "Reads NASA's climate record at your pin and describes the last 10 years: temperature, rain, humidity, and how unusual recent years were.",
 d_an: "A full study of the long-term climate at your pin, with findings and suggested actions. It takes about a minute, and you can do five a day.",
 d_set: "Language, voice speed, date announcements, voice output, input method, and turning blind assistance off, starting again or erasing everything.",
 d_help: "Play the guide again, or hear the list of keys.",
 d_repeat: "Says the last message again. You can also press R at any time.",
 m_cmp: "Compare two years", d_cmp: "Compare one place in two different years: satellite pictures, NASA climate numbers and music, side by side. Made for research.",
 cm_title: "Compare", cm_sel: "press Enter to select", cm_need: "Choose the place, the Before year and the After year first.", cm_pin: "Your pin: {v}", cm_place: "Place: {v}", d_cm_place: "The place to compare. Press Enter to search for a city, district, lake, sea or landmark. At first it is your pin.",
 cm_find: "Type the name of a place, then press Down to hear the matches.", cm_nomatch: "No matching place. Keep typing, or try another spelling.", cm_none: "none",
 cm_y1: "Before year: {v}", cm_y2: "After year: {v}", d_cm_year: "Choose a year from 1940 to last year. Satellite pictures start in 1982; climate numbers go back to 1940.",
 cm_decade: "The {v}s", d_cm_decade: "A decade. Press Enter to hear its years.",
 cm_go: "Start the comparison", d_cm_go: "Loads the pictures, NASA climate numbers and music for both years. It takes about 10 to 30 seconds.",
 cm_wait: "Loading the comparison of {p}, {b} and {a}. This takes about 10 to 30 seconds.", cm_ready: "The comparison is ready.", cm_fail: "The comparison could not be loaded. Check the connection and try again.", cm_same: "Choose two different years.",
 cm_sum: "Hear the summary", d_cm_sum: "Reads the main differences between the two years.",
 cm_pb: "Play Before, {v}", cm_pa: "Play After, {v}", cm_pd: "Play the difference",
 d_cm_play: "Plays one year of days as music, while a red line moves across the picture. Cooler or wetter than normal sounds brighter; hotter or drier sounds darker. Select it again, or press Space, to pause.",
 d_cm_pd: "Plays After minus Before, day by day: brighter when After was better off than Before, darker when it was worse.",
 cm_playing: "Playing {v}.", cm_end: "Finished.", cm_diff: "the difference",
 cm_len: "Music length: {v}", d_cm_len: "How long each year of music lasts, from 1 minute to 2 hours.", cm_min: "{n} minutes", cm_min1: "1 minute", cm_hour1: "1 hour", cm_hours: "{n} hours",
 cm_ov: "SI overview",
 cm_ov_q: "Would you like to generate an SI overview of the data here? Warning: this uses one of your chat questions with the SI Assistant. Press F for yes, or J for no.",
 cm_new: "Change place or years", d_cm_new: "Go back to choose another place or other years.", cm_close: "Close Compare", d_cm_close: "Closes Compare and returns to the main menu.",
 cm_s1: "{p}: {a} compared with {b}.", cm_s_t: "Average temperature {x} degrees, then {y} degrees, a change of {d} degrees.", cm_s_r: "Rainfall {x} millimetres, then {y} millimetres.",
 cm_s_h: "Days of 35 degrees or more: {x}, then {y}.", cm_s_w: "Water in the picture: {x} percent, then {y} percent.", cm_s_v: "Green plants in the picture: {x} percent, then {y} percent.",
 cm_s_era1: "Both years use the ERA5 record, because {v} is before NASA's record starts in 1981.", cm_s_era2: "Both years use the ERA5 record, because NASA's record here has a sudden jump around {v} that is not real weather.",
 cm_s_note: "Two single years are not a trend: one year can be unusual.", cm_ov_w: "All things considered, {a} was worse than {b}.", cm_ov_b: "All things considered, {a} was better than {b}.", cm_ov_s: "All things considered, {a} was about the same as {b}.", cm_s_nopic: "There is no satellite picture for {v}.",
 d_g_eic: "NASA's Earth Information Center publishes daily animated maps of Earth, such as air temperature, ozone, wind, rain and fires. Earth Jukebox brings them here and turns each day's value at your pin into music. They cover recent weeks or months.",
 d_g_veda: "Datasets from earth.gov, NASA's Earth data portal, such as carbon dioxide and nitrogen dioxide. Each picture covers a day, a few days or a month, and the reading at your pin comes straight from NASA's data.",
 d_g_more: "Long climate records from NASA, mostly from 1981 to now: air temperature, sea surface temperature and sea level. Good for hearing change over decades.",
 d_n_toggle: "Plays the timeline, or pauses it. Space does the same from anywhere.",
 d_n_loop: "When loop is on, the timeline starts again from the beginning when it ends.",
 d_n_status: "Says the date and the NASA reading at your pin right now.",
 d_vol: "Changes the music volume by ten percent.",
 d_speed: "Changes how far the timeline jumps at each step, so it moves faster or slower.",
 d_n_stop: "Stops the timeline and the music, and goes back to the start.",
 d_p_here: "Puts your pin where you are now. Your browser asks for permission first.",
 d_p_list: "Choose a continent, then a country, then a city.",
 d_p_seas: "Puts your pin in an ocean or sea. Use this for the sea datasets, which have no readings on land.",
 d_p_recent: "Places you used before, newest first.",
 d_cont: "A continent. Press Enter to see its countries.",
 d_country: "A country. Press Enter to see its cities.",
 d_city: "A place. Press Enter to put your pin there.",
 d_lang: "A language. Press Enter to use it.",
 d_option: "One choice. Press Enter to choose it.",
 d_s_lang: "Changes the language that Earth Jukebox speaks and listens to.",
 d_s_rate: "How fast the voice speaks.",
 d_s_dates: "Whether dates are read only at the start and end of the timeline, or at every step.",
 d_s_voice: "Speak with this site's own voice, or let your own screen reader read the messages.",
 d_s_method: "Switch between keys only, typing, and voice.",
 d_s_off: "Turns blind assistance off. Control, Alt and B turns it on again.",
 d_s_restart: "Starts blind assistance again from the first question.",
 d_s_reset: "Deletes all your settings and history on this site and starts fresh, like a first visit.",
 d_h_guide: "Plays the spoken guide again.",
 d_h_keys: "Lists the keys for the way you are using the site.",
 nodata: "There is no NASA data for {mode} at your pin, in {place}.",
 nodata_land: "Your pin is on land.", nodata_sea: "Your pin is over the ocean.", nodata_seaonly: "This dataset covers only the oceans.",
 nodata_q: "Would you like to move your pin somewhere else?",
 which_mode: "Which dataset should I play there? Say or type its name, or press Escape for the list.",
 where_voice: "Hold the Space bar and say the place.", where_type: "Type the place and press Enter.",
 off_q: "Turn off blind assistance? Press F for yes, or J for no.",
 off_done: "Blind assistance is off. Press Control, Alt and B to turn it on again.",
 cancel: "Cancelled.",
 err_net: "The assistant could not be reached. The menus and short commands still work.",
 g1: "Earth Jukebox turns NASA satellite data into music. You choose a place on Earth, called your pin, and a dataset, such as air temperature, ozone or sea level. As the timeline plays through the days or years, the music follows the data at your pin.",
 g2: "Brighter, faster and higher music means a healthier reading for that dataset. Darker, slower and lower music means a worse one. This sound mapping is the project's own design choice. You can ask for the date, the reading and the mood at any time.",
 g3: "Your pin starts in the Amazon rainforest. You can move it to any city or landmark, or to your own location. Analytics studies the long-term climate record under your pin and suggests actions. You can run up to five analyses a day.",
 k1: "You are using option one, keys only. Up and Down move through a list, and each item is read with its number. Enter or the Right arrow chooses. Left or Escape goes back. In long lists, type a letter to jump to it.",
 k2: "The main menu has: play a dataset, now playing, choose a place, where am I, climate here, analytics, settings, help, and repeat. To start, choose play a dataset, then a group, then a dataset; it plays at your pin. Space plays or pauses the timeline from anywhere, and R repeats the last message. When I ask a question, press F for yes and J for no. Pressing Backspace while you're on the process of selecting something in the menu explains what you're hovering above and what happens if you select it.",
 t1: "You are using option two, typing. Type a request in your own words and press Enter. For example: play ozone for the whole timeline, put my pin on the Eiffel Tower, how is the climate here over the last 10 years, or what does this reading mean. I say what I am doing, then do it.",
 t2: "Short commands such as stop, pause, play, loop, louder, help and where am I work at once and are free. Press Escape at any time for the menus, so you can choose a dataset or a place without using requests. Pressing Backspace while you're on the process of selecting something in the menu explains what you're hovering above and what happens if you select it. You have up to seventy-five requests a day.",
 v1: "You are using voice. Hold the Space bar, say your request, then let go; the music gets quieter while you speak. For example: play carbon dioxide for Dhaka over the last 10 years, put my pin on the Eiffel Tower, or how is the climate here. Press R to hear the last message again.",
 v2: "Short commands such as stop, pause, play, loop, louder, help and where am I work at once and are free. When I ask a question, say yes or no, or press F or J. Press Escape at any time for the menus. Pressing Backspace while you're on the process of selecting something in the menu explains what you're hovering above and what happens if you select it. You have up to seventy-five voice requests a day."
};
/* [code, English name, own name, speech recognition code]; the first 20 have every prompt translated */
var LANGS = [
 ["en", "English", "English", "en-US"], ["bn", "Bangla", "বাংলা", "bn-BD"], ["hi", "Hindi", "हिन्दी", "hi-IN"], ["ur", "Urdu", "اردو", "ur-PK"],
 ["ar", "Arabic", "العربية", "ar-SA"], ["apc", "Palestinian Arabic", "العربية الفلسطينية", "ar-PS"], ["es", "Spanish", "Español", "es-ES"], ["pt", "Portuguese", "Português", "pt-BR"], ["fr", "French", "Français", "fr-FR"],
 ["de", "German", "Deutsch", "de-DE"], ["it", "Italian", "Italiano", "it-IT"], ["ru", "Russian", "Русский", "ru-RU"], ["zh", "Chinese (Mandarin)", "中文", "zh-CN"],
 ["ja", "Japanese", "日本語", "ja-JP"], ["ko", "Korean", "한국어", "ko-KR"], ["id", "Indonesian", "Bahasa Indonesia", "id-ID"], ["ms", "Malay", "Bahasa Melayu", "ms-MY"],
 ["tr", "Turkish", "Türkçe", "tr-TR"], ["vi", "Vietnamese", "Tiếng Việt", "vi-VN"], ["th", "Thai", "ไทย", "th-TH"], ["sw", "Swahili", "Kiswahili", "sw-KE"],
 ["af", "Afrikaans", "Afrikaans", "af-ZA"], ["am", "Amharic", "አማርኛ", "am-ET"], ["hy", "Armenian", "Հայերեն", "hy-AM"], ["az", "Azerbaijani", "Azərbaycan dili", "az-AZ"],
 ["bg", "Bulgarian", "Български", "bg-BG"], ["my", "Burmese", "မြန်မာ", "my-MM"], ["ca", "Catalan", "Català", "ca-ES"], ["hr", "Croatian", "Hrvatski", "hr-HR"],
 ["cs", "Czech", "Čeština", "cs-CZ"], ["da", "Danish", "Dansk", "da-DK"], ["nl", "Dutch", "Nederlands", "nl-NL"], ["et", "Estonian", "Eesti", "et-EE"],
 ["fil", "Filipino", "Filipino", "fil-PH"], ["fi", "Finnish", "Suomi", "fi-FI"], ["ka", "Georgian", "ქართული", "ka-GE"], ["el", "Greek", "Ελληνικά", "el-GR"],
 ["gu", "Gujarati", "ગુજરાતી", "gu-IN"], ["he", "Hebrew", "עברית", "he-IL"], ["hu", "Hungarian", "Magyar", "hu-HU"], ["is", "Icelandic", "Íslenska", "is-IS"],
 ["kn", "Kannada", "ಕನ್ನಡ", "kn-IN"], ["kk", "Kazakh", "Қазақ тілі", "kk-KZ"], ["km", "Khmer", "ខ្មែរ", "km-KH"], ["lo", "Lao", "ລາວ", "lo-LA"],
 ["lv", "Latvian", "Latviešu", "lv-LV"], ["lt", "Lithuanian", "Lietuvių", "lt-LT"], ["ml", "Malayalam", "മലയാളം", "ml-IN"], ["mr", "Marathi", "मराठी", "mr-IN"],
 ["mn", "Mongolian", "Монгол", "mn-MN"], ["ne", "Nepali", "नेपाली", "ne-NP"], ["no", "Norwegian", "Norsk", "nb-NO"], ["fa", "Persian", "فارسی", "fa-IR"],
 ["pl", "Polish", "Polski", "pl-PL"], ["pa", "Punjabi", "ਪੰਜਾਬੀ", "pa-Guru-IN"], ["ro", "Romanian", "Română", "ro-RO"], ["sr", "Serbian", "Српски", "sr-RS"],
 ["si", "Sinhala", "සිංහල", "si-LK"], ["sk", "Slovak", "Slovenčina", "sk-SK"], ["sl", "Slovenian", "Slovenščina", "sl-SI"], ["sv", "Swedish", "Svenska", "sv-SE"],
 ["ta", "Tamil", "தமிழ்", "ta-IN"], ["te", "Telugu", "తెలుగు", "te-IN"], ["uk", "Ukrainian", "Українська", "uk-UA"], ["uz", "Uzbek", "Oʻzbekcha", "uz-UZ"],
 ["zu", "Zulu", "isiZulu", "zu-ZA"]
];
function L(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i]; return LANGS[0] }
/* places for keys-only users: continent -> country (ISO code) -> cities; looked up live on OpenStreetMap when chosen */
var PLACES = {
 af: "DZ:Algiers|Oran;AO:Luanda;BJ:Porto-Novo|Cotonou;BW:Gaborone;BF:Ouagadougou;BI:Gitega|Bujumbura;CM:Yaoundé|Douala;CV:Praia;CF:Bangui;TD:N'Djamena;CD:Kinshasa|Lubumbashi;CG:Brazzaville;CI:Yamoussoukro|Abidjan;DJ:Djibouti;EG:Cairo|Alexandria|Luxor;ER:Asmara;ET:Addis Ababa;GA:Libreville;GM:Banjul;GH:Accra|Kumasi;GN:Conakry;KE:Nairobi|Mombasa;LS:Maseru;LR:Monrovia;LY:Tripoli|Benghazi;MG:Antananarivo;MW:Lilongwe;ML:Bamako|Timbuktu;MR:Nouakchott;MU:Port Louis;MA:Rabat|Casablanca|Marrakesh;MZ:Maputo;NA:Windhoek;NE:Niamey;NG:Abuja|Lagos|Kano;RW:Kigali;SN:Dakar;SL:Freetown;SO:Mogadishu;ZA:Pretoria|Cape Town|Johannesburg|Durban;SS:Juba;SD:Khartoum;TZ:Dodoma|Dar es Salaam|Zanzibar City;TG:Lomé;TN:Tunis;UG:Kampala;ZM:Lusaka;ZW:Harare",
 as: "AF:Kabul;AM:Yerevan;AZ:Baku;BH:Manama;BD:Dhaka|Chittagong|Sylhet|Khulna|Rajshahi|Cox's Bazar;BT:Thimphu;BN:Bandar Seri Begawan;KH:Phnom Penh|Siem Reap;CN:Beijing|Shanghai|Guangzhou|Shenzhen|Chengdu;GE:Tbilisi;IN:New Delhi|Mumbai|Kolkata|Chennai|Bengaluru|Hyderabad;ID:Jakarta|Surabaya|Denpasar;IR:Tehran|Isfahan;IQ:Baghdad|Basra;IL:Jerusalem|Tel Aviv;JP:Tokyo|Osaka|Kyoto|Sapporo;JO:Amman;KZ:Astana|Almaty;KW:Kuwait City;KG:Bishkek;LA:Vientiane;LB:Beirut;MY:Kuala Lumpur|George Town;MV:Malé;MN:Ulaanbaatar;MM:Naypyidaw|Yangon;NP:Kathmandu|Pokhara;KP:Pyongyang;OM:Muscat;PK:Islamabad|Karachi|Lahore;PS:Ramallah|Gaza;PH:Manila|Cebu City;QA:Doha;SA:Riyadh|Jeddah|Mecca;SG:Singapore;KR:Seoul|Busan;LK:Colombo|Kandy;SY:Damascus|Aleppo;TW:Taipei;TJ:Dushanbe;TH:Bangkok|Chiang Mai|Phuket;TL:Dili;TR:Ankara|Istanbul|Izmir;TM:Ashgabat;AE:Abu Dhabi|Dubai;UZ:Tashkent|Samarkand;VN:Hanoi|Ho Chi Minh City|Da Nang;YE:Sanaa|Aden",
 eu: "AL:Tirana;AT:Vienna;BY:Minsk;BE:Brussels|Antwerp;BA:Sarajevo;BG:Sofia;HR:Zagreb|Split;CY:Nicosia;CZ:Prague;DK:Copenhagen;EE:Tallinn;FI:Helsinki;FR:Paris|Marseille|Lyon;DE:Berlin|Munich|Hamburg;GR:Athens|Thessaloniki;HU:Budapest;IS:Reykjavík;IE:Dublin;IT:Rome|Milan|Venice|Naples;LV:Riga;LT:Vilnius;LU:Luxembourg;MT:Valletta;MD:Chișinău;ME:Podgorica;NL:Amsterdam|Rotterdam;MK:Skopje;NO:Oslo|Bergen|Tromsø;PL:Warsaw|Kraków;PT:Lisbon|Porto;RO:Bucharest;RU:Moscow|Saint Petersburg|Novosibirsk|Vladivostok;RS:Belgrade;SK:Bratislava;SI:Ljubljana;ES:Madrid|Barcelona|Seville;SE:Stockholm|Gothenburg;CH:Bern|Zurich|Geneva;UA:Kyiv|Lviv|Odesa;GB:London|Edinburgh|Manchester|Cardiff",
 na: "BS:Nassau;BZ:Belmopan;CA:Ottawa|Toronto|Vancouver|Montreal;CR:San José;CU:Havana;DO:Santo Domingo;SV:San Salvador;GL:Nuuk;GT:Guatemala City;HT:Port-au-Prince;HN:Tegucigalpa;JM:Kingston;MX:Mexico City|Guadalajara|Cancún;NI:Managua;PA:Panama City;PR:San Juan;TT:Port of Spain;US:Washington|New York City|Los Angeles|Chicago|Houston|Miami|Anchorage|Honolulu",
 sa: "AR:Buenos Aires|Córdoba|Ushuaia;BO:La Paz|Sucre;BR:Brasília|São Paulo|Rio de Janeiro|Manaus;CL:Santiago|Punta Arenas;CO:Bogotá|Medellín;EC:Quito|Guayaquil;GY:Georgetown;PY:Asunción;PE:Lima|Cusco;SR:Paramaribo;UY:Montevideo;VE:Caracas",
 oc: "AU:Canberra|Sydney|Melbourne|Perth|Darwin;FJ:Suva;KI:Tarawa;MH:Majuro;FM:Palikir;NR:Yaren;NZ:Wellington|Auckland|Christchurch;PW:Ngerulmud;PG:Port Moresby;WS:Apia;SB:Honiara;TO:Nukuʻalofa;TV:Funafuti;VU:Port Vila"
};
/* instant commands, English (other languages come from blind-assist-lang.js). They never use SI credits. */
var CMD_EN = {
 stop: ["stop", "stop it", "stop music", "stop the music", "stop playing", "stop the timeline", "stop everything", "end"],
 pause: ["pause", "pause it", "pause music", "pause the music", "pause the timeline", "hold on", "wait"],
 resume: ["play", "resume", "continue", "unpause", "start", "start playing", "play music", "play the music", "resume the music", "keep playing", "go on"],
 loop_on: ["loop", "repeat", "loop it", "play on loop", "play it on loop", "play on repeat", "play the music on loop", "play the music on repeat", "loop the music", "repeat the music", "put it on loop", "loop on", "turn on loop"],
 loop_off: ["loop off", "stop looping", "no loop", "turn off loop", "dont repeat", "do not repeat", "stop repeating"],
 help: ["help", "what can you do", "what can i do", "options", "commands", "features", "list of features", "list the features"],
 status: ["where am i", "status", "what is playing", "whats playing", "current reading", "the reading", "what is the reading", "whats the reading", "read the reading", "whats happening", "what is happening"],
 louder: ["louder", "volume up", "turn it up", "more volume", "increase volume", "increase the volume", "turn up the volume"],
 quieter: ["quieter", "softer", "volume down", "turn it down", "lower the volume", "less volume", "decrease volume", "decrease the volume", "turn down the volume"],
 faster: ["faster", "speed up", "go faster", "play faster"],
 slower: ["slower", "slow down", "go slower", "play slower"],
 menu: ["menu", "menus", "main menu", "open menu", "open the menu", "modes", "list modes", "list the modes", "show modes", "list of modes", "datasets", "list datasets", "list the datasets"],
 again: ["say that again", "repeat that", "say again", "what did you say", "again", "pardon"],
 yes: ["yes", "yeah", "yep", "sure", "ok", "okay", "confirm", "correct", "yes please"],
 no: ["no", "nope", "cancel", "no thanks", "dont"],
 clouds_on: ["clouds on", "show clouds", "turn on clouds"], clouds_off: ["clouds off", "hide clouds", "turn off clouds"],
 map_view: ["map view", "show map", "show the map", "switch to map", "open map", "open the map"], globe_view: ["globe view", "show globe", "show the globe", "switch to globe"],
 analytics: ["analytics", "analyse", "analyze", "run analytics", "analyse my pin", "analyze my pin", "analyse here", "analyze here", "analyse this place", "analyze this place"]
};

var BA = { on: false, lang: "en", speakLang: "en", method: "", rate: 1, dates: "ends", sr: false, loop: false, last: null, recent: [], busy: false, reqTok: 0, mainI: 0 };
window.BA = BA;
function settingsSave() { try { localStorage.setItem("ejBA", JSON.stringify({ on: BA.on, off: !BA.on, lang: BA.lang, method: BA.method, rate: BA.rate, dates: BA.dates, sr: BA.sr, recent: BA.recent.slice(0, 8) })) } catch (e) {} }
function settingsLoad() { try { return JSON.parse(localStorage.getItem("ejBA") || "null") } catch (e) { return null } }

/* ---------- speech ---------- */
var SP = { voices: [], tok: 0, cur: null };
function voicesLoad() { try { SP.voices = window.speechSynthesis ? speechSynthesis.getVoices() || [] : [] } catch (e) { SP.voices = [] } }
function pickVoice(code) {
 var c = String(code || "en").toLowerCase(), alias = { zh: ["zh", "cmn"], no: ["nb", "no", "nn"], fil: ["fil", "tl"], he: ["he", "iw"], apc: ["ar"] }[c] || [c];
 var vs = SP.voices.filter(function (v) { var l = String(v.lang || "").toLowerCase().replace("_", "-"); return alias.some(function (a) { return l === a || l.indexOf(a + "-") === 0 }) });
 if (!vs.length) return null;
 var want = c === "en" ? "en-us" : (L(c)[3] || "").toLowerCase();
 vs.sort(function (a, b) {
  /* English: Microsoft's newest natural voices (Edge) sound closest to a person: Ava, Andrew, Emma and Brian first, then Jenny, Aria and Guy; never the child voice */
  var s = function (v) { var n = String(v.name || ""); var vl = String(v.lang).toLowerCase().replace("_", "-"); return (/natural|online|neural/i.test(n) ? 4 : 0) + (/google/i.test(n) ? 2 : 0) + (vl === want ? 1 : 0) + (c === "apc" && /^ar-(ps|jo|lb|sy)$/.test(vl) ? 1.5 : 0)
   + (c === "en" ? (/\b(Ava|Andrew|Emma|Brian)(Multilingual)?\b.*(Natural|Online)/i.test(n) ? 3 : /\b(Jenny|Aria|Guy|Michelle|Christopher|Eric|Roger|Steffan|Sonia|Ryan|Libby)\b.*(Natural|Online)/i.test(n) ? 2 : 0) - (/\bAna\b/.test(n) ? 4 : 0) : 0) };
  return s(b) - s(a) });
 return vs[0];
}
function hasVoice(code) { return !!pickVoice(code) }
function duck(on) { window.BADUCK = on ? .3 : 1; try { if (typeof applyH === "function") applyH() } catch (e) {} }
function live(t) { var l = $("ba-live"); if (!l) return; l.textContent = ""; setTimeout(function () { l.textContent = t }, 30) }
function chunks(t, max) { max = max || 220; var out = [], raw = String(t).replace(/\s+/g, " ").trim().split(/([.!?।。！？؟]+\s+)/), parts = []; for (var q = 0; q < raw.length; q += 2) parts.push((raw[q] + (raw[q + 1] || "")).trim()); parts.forEach(function (p) { while (p.length > max) { var k = p.lastIndexOf(" ", max); if (k < 80) k = max; out.push(p.slice(0, k)); p = p.slice(k).trim() } if (!p) return; if (max > 220 && out.length && out[out.length - 1].length + p.length < max) out[out.length - 1] += " " + p; else out.push(p) }); return out }
/* say(text, {lang, then, must, keep}): speak (or hand to the screen reader). "then" runs when finished; with "must" it also runs if a key press cuts the speech short. */
/* say(text, {lang, then, must, keep}): speak (or hand to the screen reader). "then" runs when finished; with "must" it also runs if a key press cuts the speech short.
   Chrome needs three workarounds: keep the utterances referenced (otherwise it can forget to report the end), check every
   half second whether speech has really stopped (in case the end is never reported), and wait a moment after cancelling before speaking again. */
function say(text, o) {
 o = o || {}; text = String(text || ""); if (!text) { if (o.then) o.then(); return }
 if (BA.silent) { BA.silentLog.push(text); if (o.then) setTimeout(o.then, 0); return }
 if (!o.nolast) BA.lastSay = { text: text, lang: o.lang, clip: o.clip };
 var mine = ++SP.tok, next = o.then || null;
 live(text);
 if (!o.keep) stopSpeech(true);
 SP.cur = { tok: mine, then: next, must: !!o.must };
 var finished = false, done = function () { if (finished) return; finished = true; clearInterval(watch); if (SP.cur && SP.cur.tok === mine) { var f = SP.cur.then; SP.cur = null; duck(false); if (f) f() } }, watch = 0;
 if (BA.sr || !window.speechSynthesis) { setTimeout(done, Math.min(12000, 700 + text.length * 55)); return }
 var go = function () {
  if (!SP.cur || SP.cur.tok !== mine) return;
  var lang = o.lang || BA.speakLang, v = pickVoice(lang) || pickVoice("en"), ve = pickVoice("en"), t0 = Date.now(), started = false, list = [];
  chunks(v && String(v.lang || "").toLowerCase().indexOf("en") === 0 && lang !== "en" ? text : pron(text, lang), v && /online|natural/i.test(v.name || "") ? 600 : 220).forEach(function (c) {
   if (v && String(v.lang || "").toLowerCase().indexOf("en") !== 0) parts(c, lang).forEach(function (p) { list.push({ t: p.t, v: p.en && ve ? ve : v }) });
   else list.push({ t: c, v: v });
  });
  if (!list.length) list.push({ t: text, v: v });
  duck(true);
  try { speechSynthesis.resume() } catch (e) {}
  SP.utts = [];
  list.forEach(function (c, i) {
   var u = new SpeechSynthesisUtterance(c.t);
   u.lang = c.v ? c.v.lang : lang; if (c.v) try { u.voice = c.v } catch (e) {}
   u.rate = BA.rate;
   u.onstart = function () { started = true; SP.heard = Date.now(); SP.blocked = false };
   if (i === list.length - 1) { u.onend = done; u.onerror = function (e) { if (e && e.error === "not-allowed") { SP.blocked = true; finished = true; clearInterval(watch); if (SP.cur && SP.cur.tok === mine) SP.cur = null; duck(false); return } if (e && (e.error === "interrupted" || e.error === "canceled") && SP.cur && SP.cur.tok === mine) return; done() } }
   SP.utts.push(u);
   speechSynthesis.speak(u);
  });
  watch = setInterval(function () {
   if (!SP.cur || SP.cur.tok !== mine) { clearInterval(watch); return }
   var busy = false; try { busy = speechSynthesis.speaking || speechSynthesis.pending } catch (e) {}
   if (!busy && Date.now() - t0 > (started ? 400 : 2500)) done();
   else if (Date.now() - t0 > 90000) done();
  }, 400);
 };
 var tts = function () { var since = Date.now() - (SP.cancelAt || 0); if (since < 150) setTimeout(go, 150 - since); else go() };
 if (o.clip && CLIP.has(o.clip) && (o.lang || BA.speakLang) === "en") clipPlay(o.clip, mine, done, tts); else tts();
}
/* The guides have recordings in English (audio/<key>.mp3). They play instead of the device voice when the guide is spoken in English;
   if a file is missing, blocked or does not start within 5 seconds, the device voice reads the same text instead. */
var CLIP = { v: "2026-11-08a", keys: /^(guide_skip|g1|g2|g3|k1|k2|t1|t2|v1|v2|bs|gk|guide_end|vg1|vg2|vg3|vg4)$/, bad: {}, has: function (k) { return CLIP.keys.test(k) && !CLIP.bad[k] } };
function clipStop() { var a = SP.aud; SP.aud = null; if (a) { try { a.onended = a.onerror = null; a.pause(); a.removeAttribute("src"); a.load() } catch (e) {} } }
function clipPlay(k, mine, done, fallback) {
 var a, fin = false, t0 = Date.now(), started = 0, watch = 0;
 var mineNow = function () { return SP.cur && SP.cur.tok === mine };
 var end = function (ok) {
  if (fin) return; fin = true; clearInterval(watch);
  if (SP.aud === a) clipStop();
  if (!mineNow()) return;
  if (ok) done(); else { CLIP.bad[k] = true; fallback() }
 };
 try { a = new Audio("audio/" + k + ".mp3?v=" + CLIP.v) } catch (e) { CLIP.bad[k] = true; fallback(); return }
 clipStop(); SP.aud = a;
 try { a.playbackRate = BA.rate || 1 } catch (e) {}
 a.onplaying = function () { if (!started) started = Date.now(); SP.heard = Date.now(); SP.blocked = false };
 a.onended = function () { end(true) };
 a.onerror = function () { end(false) };
 watch = setInterval(function () {
  if (fin) { clearInterval(watch); return }
  if (!mineNow() || SP.aud !== a) { fin = true; clearInterval(watch); if (SP.aud === a) clipStop(); return }
  if (!started && Date.now() - t0 > 5000) { end(false); return }
  var d = a.duration; if (started && isFinite(d) && d > 0 && Date.now() - started > (d / (a.playbackRate || 1)) * 1000 + 4000) end(true);
 }, 400);
 duck(true);
 try { var p = a.play(); if (p && p.catch) p.catch(function () { end(false) }) } catch (e) { end(false) }
}
/* How key names and English words are spoken in languages that do not use the Latin alphabet.
   A Bangla, Hindi, Urdu, Arabic, Russian or Thai voice cannot read "F" or "Escape" (it says "fff"), so key names are
   written the way they sound in that script; any other English words (dataset and place names) are read by an English voice. */
var PRON = {
 bn: { "Microsoft Edge": "মাইক্রোসফট এজ", "Earth Information Jukebox": "আর্থ ইনফরমেশন জুকবক্স", "Earth Jukebox": "আর্থ জুকবক্স", "Earth.gov": "আর্থ ডট গভ", Space: "স্পেস", Enter: "এন্টার", Escape: "এসকেপ", Control: "কন্ট্রোল", Alt: "অল্ট", Chrome: "ক্রোম", Edge: "এজ", Microsoft: "মাইক্রোসফট", EIC: "ই আই সি", SI: "এস আই", NASA: "নাসা", F: "এফ", J: "জে", R: "আর", B: "বি" },
 hi: { "Microsoft Edge": "माइक्रोसॉफ़्ट एज", "Earth Information Jukebox": "अर्थ इन्फ़ॉर्मेशन ज्यूकबॉक्स", "Earth Jukebox": "अर्थ ज्यूकबॉक्स", "Earth.gov": "अर्थ डॉट गॉव", Space: "स्पेस", Enter: "एंटर", Escape: "एस्केप", Control: "कंट्रोल", Alt: "ऑल्ट", Chrome: "क्रोम", Edge: "एज", Microsoft: "माइक्रोसॉफ़्ट", EIC: "ई आई सी", SI: "एस आई", NASA: "नासा", F: "एफ़", J: "जे", R: "आर", B: "बी" },
 ur: { "Microsoft Edge": "مائیکروسافٹ ایج", "Earth Information Jukebox": "ارتھ انفارمیشن جوک باکس", "Earth Jukebox": "ارتھ جوک باکس", "Earth.gov": "ارتھ ڈاٹ گوو", Space: "اسپیس", Enter: "اینٹر", Escape: "ایسکیپ", Control: "کنٹرول", Alt: "آلٹ", Chrome: "کروم", Edge: "ایج", Microsoft: "مائیکروسافٹ", EIC: "ای آئی سی", SI: "ایس آئی", NASA: "ناسا", F: "ایف", J: "جے", R: "آر", B: "بی" },
 ar: { "Microsoft Edge": "مايكروسوفت إيدج", "Earth Information Jukebox": "إيرث إنفورميشن جوكبوكس", "Earth Jukebox": "إيرث جوكبوكس", "Earth.gov": "إيرث دوت جوف", Space: "المسافة", Enter: "إنتر", Escape: "إسكيب", Control: "كنترول", Alt: "ألت", Chrome: "كروم", Edge: "إيدج", Microsoft: "مايكروسوفت", EIC: "إي آي سي", SI: "إس آي", NASA: "ناسا", F: "إف", J: "جيه", R: "آر", B: "بي" },
 ru: { "Microsoft Edge": "Майкрософт Эдж", "Earth Information Jukebox": "Эрт Информейшн Джукбокс", "Earth Jukebox": "Эрт Джукбокс", "Earth.gov": "эрт точка гов", Space: "пробел", Enter: "Энтер", Escape: "Эскейп", Control: "Контрол", Alt: "Альт", Chrome: "Хром", Edge: "Эдж", Microsoft: "Майкрософт", EIC: "И-Ай-Си", SI: "Эс-Ай", NASA: "НАСА", F: "эф", J: "джей", R: "ар", B: "би" },
 th: { "Microsoft Edge": "ไมโครซอฟท์ เอดจ์", "Earth Information Jukebox": "เอิร์ธ อินฟอร์เมชัน จู๊กบ็อกซ์", "Earth Jukebox": "เอิร์ธ จู๊กบ็อกซ์", "Earth.gov": "เอิร์ธ ดอท กอฟ", Space: "สเปซ", Enter: "เอนเทอร์", Escape: "เอสเคป", Control: "คอนโทรล", Alt: "อัลต์", Chrome: "โครม", Edge: "เอดจ์", Microsoft: "ไมโครซอฟท์", EIC: "อีไอซี", SI: "เอสไอ", NASA: "นาซา", F: "เอฟ", J: "เจ", R: "อาร์", B: "บี" },
 de: { Strg: "Steuerung" },
 it: { Esc: "Escape" },
 zh: { "Earth.gov": "Earth dot gov" },
 ja: { "Earth.gov": "Earth dot gov" },
 ko: { "Earth.gov": "Earth dot gov" }
};
(function () { var bsp = { bn: "ব্যাকস্পেস", hi: "बैकस्पेस", ur: "بیک اسپیس", ar: "باك سبيس", ru: "Бэкспейс", th: "แบ็กสเปซ" }; for (var k in bsp) PRON[k].Backspace = bsp[k] })();
PRON.apc = PRON.ar;
var MIXED = /^(bn|hi|ur|ar|apc|ru|th|fa|he|el|uk|bg|sr|mk|ka|hy|am|my|km|lo|si|ta|te|kn|ml|gu|pa|mr|ne|mn|kk)$/;
function pron(text, lang) {
 var m = PRON[lang]; if (!m) return text;
 Object.keys(m).sort(function (a, b) { return b.length - a.length }).forEach(function (k) {
  var esc = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  text = text.replace(new RegExp("(^|[^A-Za-z])" + esc + "(?![A-Za-z])", "g"), function (all, pre) { return pre + m[k] });
 });
 return text;
}
/* split a sentence into parts in the language's own script and parts with Latin letters (English names), so each gets the right voice */
function parts(text, lang) {
 if (!MIXED.test(lang)) return [{ t: text, en: false }];
 var out = [], re = /[A-Za-z][A-Za-z0-9.,:'’()\/+\- ]*[A-Za-z0-9)]|[A-Za-z]/g, last = 0, m;
 while ((m = re.exec(text))) {
  if (m.index > last) out.push({ t: text.slice(last, m.index), en: false });
  out.push({ t: m[0], en: true }); last = m.index + m[0].length;
 }
 if (last < text.length) out.push({ t: text.slice(last), en: false });
 return out.filter(function (p) { return /[\p{L}\p{N}]/u.test(p.t) });
}
function sayP(text, o) { return new Promise(function (r) { o = o || {}; o.then = r; o.must = true; say(text, o) }) }
function stopSpeech(quiet) {
 var c = SP.cur; SP.cur = null; SP.tok++;
 clipStop();
 try { if (window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)) { speechSynthesis.cancel(); SP.cancelAt = Date.now() } } catch (e) {}
 if (!quiet) duck(false);
 if (c && c.must && c.then) c.then();
}
function T(k, v) { var D = STR[BA.speakLang] || {}, s = D[k] || EN[k] || k; if (v) s = s.replace(/\{(\w+)\}/g, function (m, n) { return v[n] !== undefined && v[n] !== null ? v[n] : m }); return s }
function TL(code, k, v) { var keep = BA.speakLang; BA.speakLang = code; var s = T(k, v); BA.speakLang = keep; return s }

/* short sounds, so moving through a list is quicker than the voice */
var EC = null, ECt = 0;
function beep(kind) {
 if (BA.silent) return;
 try {
  if (!EC) EC = new (window.AudioContext || window.webkitAudioContext)();
  if (EC.state === "suspended") EC.resume();
  var t = EC.currentTime, o = EC.createOscillator(), g = EC.createGain(), f = { move: [880, 880], select: [660, 990], back: [660, 440], error: [220, 170], listen: [520, 880], done: [880, 520] }[kind] || [700, 700];
  o.type = "sine"; o.frequency.setValueAtTime(f[0], t); o.frequency.linearRampToValueAtTime(f[1], t + .09);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.1, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .13);
  o.connect(g); g.connect(EC.destination); o.start(t); o.stop(t + .15);
  clearTimeout(ECt); ECt = setTimeout(function () { try { EC.suspend() } catch (e) {} }, 1500);
 } catch (e) {}
}

/* ---------- page parts ---------- */
function inject() {
 var css = document.createElement("style");
 css.textContent = "#ba-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
  "#bas{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100% - 32px));z-index:60;background:rgba(10,14,20,.98);border:1px solid var(--amber,#e0a43a);padding:22px 24px 18px;box-shadow:0 12px 40px rgba(0,0,0,.6);text-align:center;color:var(--bone,#ece6d8)}#bas[hidden]{display:none}" +
  "#bas h2{font:600 20px/1.3 'Iowan Old Style',Georgia,serif;margin:0 0 10px;color:var(--bone,#ece6d8)}#bas p{margin:0 0 10px;font-size:14px;line-height:1.5}#bas .ba2{color:var(--mute,#9aa3ad)}" +
  "#bas .babtn{display:flex;gap:10px;justify-content:center;margin:14px 0 8px;flex-wrap:wrap}#bas button{width:auto;padding:9px 16px;font-size:14px}" +
  "#bap{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 32px));max-height:min(74vh,640px);z-index:59;display:flex;flex-direction:column;background:rgba(10,14,20,.97);border:1px solid var(--amber,#e0a43a);box-shadow:0 12px 40px rgba(0,0,0,.55)}#bap[hidden]{display:none}" +
  "#bap .baph{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--rule,#2a3340)}#bap .baph b{font:600 17px/1.3 'Iowan Old Style',Georgia,serif;color:var(--amber,#e0a43a)}" +
  "#bap .baph button{width:auto;background:transparent;border:0;color:var(--bone,#ece6d8);font-size:20px;padding:0 4px;cursor:pointer}" +
  "#bapq{margin:10px 16px 0;width:auto}#bapq[hidden]{display:none}" +
  "#bapl{list-style:none;margin:0;padding:8px 0;overflow-y:auto;flex:1}#bapl li{padding:9px 18px;color:#fff;font-size:14.5px;cursor:pointer;border-left:3px solid transparent}" +
  "#bapl li.on{background:var(--amber,#e0a43a);color:#1a1205;border-left-color:#fff3d6;font-weight:600}#bapl li small{opacity:.75;margin-left:8px;font-weight:400}" +
  "#bap .bah{margin:0;padding:8px 16px 10px;border-top:1px solid var(--rule,#2a3340);color:var(--mute,#9aa3ad);font-size:11.5px;line-height:1.5}" +
  "#babadge{display:inline-block;margin-top:10px;pointer-events:auto;width:auto;background:rgba(10,14,20,.85);border:1px solid var(--amber,#e0a43a);color:var(--amber,#e0a43a);font-size:12px;font-weight:600;padding:5px 10px;cursor:pointer}#babadge:hover{background:var(--amber,#e0a43a);color:#1a1205}#babadge[hidden]{display:none}#babadge.bafix{position:fixed;left:12px;bottom:12px;z-index:58;margin:0}" +
  "body.balisten #babadge{background:var(--amber,#e0a43a);color:#1a1205}";
 document.head.appendChild(css);
 var d = document.createElement("div");
 d.innerHTML = '<div id="ba-live" aria-live="assertive" aria-atomic="true"></div>' +
  '<div id="bas" role="dialog" aria-modal="true" aria-labelledby="bast" hidden><h2 id="bast"></h2><p id="basp"></p><p id="basp2" class="ba2"></p><div class="babtn"><button id="basy" type="button"></button><button id="basn" type="button" class="alt"></button></div><p id="basl" class="ba2" style="font-size:12px;margin:0"></p></div>' +
  '<div id="bap" role="application" aria-labelledby="bapt" hidden><div class="baph"><b id="bapt"></b><button id="bapx" type="button" aria-label="Close">&times;</button></div><input id="bapq" name="language" type="text" autocomplete="off" aria-label="Type your language" hidden><ul id="bapl" role="listbox"></ul><p class="bah" id="bah"></p></div>' +
  '<button id="babadge" type="button" hidden></button>';
 while (d.firstChild) document.body.appendChild(d.firstChild);
 /* the restart button sits under the page title (top left); if that is missing it floats in the corner */
 var brand = document.querySelector(".brand"), bb = $("babadge"); if (brand) { brand.appendChild(document.createElement("br")); brand.appendChild(bb) } else bb.className = "bafix";
 $("basy").addEventListener("click", function () { startYes() });
 $("basn").addEventListener("click", function () { startNo() });
 $("bapx").addEventListener("click", function () { beep("back"); panelClose(); stopSpeech() });
 $("bapq").addEventListener("input", searchInput);
 $("babadge").addEventListener("click", function () { restartBA() });
}
function badge() { var b = $("babadge"); if (!b) return; b.hidden = false; b.textContent = BA.on ? "Blind assistance on · " + T("me_" + (BA.method || "keys")) + " · Restart" : "Blind assistance · Restart"; b.title = "Start blind assistance over from the first screen (Ctrl+Alt+R). Ctrl+Alt+B turns it on or off." ; b.setAttribute("aria-label", "Restart blind assistance (Control, Alt and R)") }

/* ---------- yes / no questions (F = yes, J = no) ---------- */
var YN = null;
function yesno(text, yes, no, lang) { YN = { yes: yes, no: no, text: text, lang: lang }; say(text, { lang: lang }) }
function ynHow() { return T(BA.method === "voice" ? "yn_voice" : "yn") }
function ynAnswer(ok) { var y = YN; YN = null; beep(ok ? "select" : "back"); stopSpeech(true); if (y) (ok ? y.yes : y.no)() }

/* ---------- first screen ---------- */
var START = { open: false };
function navLang() { if (/^ar-ps$/i.test(String(navigator.language || ""))) return "apc"; var n = String(navigator.language || "en").toLowerCase().split("-")[0]; if (n === "nb" || n === "nn") n = "no"; if (n === "tl") n = "fil"; return STR[n] ? n : "en" }
function showStart(resume) {
 var nl = navLang(), s = $("bas");
 START = { open: true, resume: !!resume, nl: nl, t0: Date.now() };
 $("bast").textContent = nl !== "en" ? TL(nl, "start_title") + " · " + EN.start_title : EN.start_title;
 $("basp").textContent = resume ? EN.resume : EN.start;
 $("basp2").textContent = nl !== "en" ? TL(nl, resume ? "resume" : "start") : "";
 $("basy").textContent = resume ? "Start (any key)" : (nl !== "en" ? TL(nl, "btn_on") : EN.btn_on);
 $("basn").textContent = resume ? "Turn off (J)" : (nl !== "en" ? TL(nl, "btn_off") : EN.btn_off);
 $("basl").textContent = nl !== "en" ? TL(nl, "later") : EN.later;
 s.hidden = false;
 setTimeout(function () { try { $("basy").focus() } catch (e) {} }, 0);
 startSpeak();
}
/* a question in the start box: F = yes, J or Escape = no; spoken in the browser's language (if translated) and English */
function dualT(k) { var nl = navLang(); return nl !== "en" && STR[nl] && STR[nl][k] ? TL(nl, k) + " · " + EN[k] : EN[k] }
function askDialog(o) {
 var nl = navLang(), s = $("bas");
 START = { open: true, nl: nl, t0: Date.now(), custom: o };
 $("bast").textContent = o.title;
 $("basp").textContent = EN[o.text] || o.text; $("basp2").textContent = nl !== "en" && STR[nl] && STR[nl][o.text] ? TL(nl, o.text) : "";
 $("basy").hidden = !o.yes; if (o.yes) $("basy").textContent = nl !== "en" && STR[nl] && STR[nl][o.yes] ? TL(nl, o.yes) : EN[o.yes];
 $("basn").textContent = nl !== "en" && STR[nl] && STR[nl][o.no] ? TL(nl, o.no) : EN[o.no];
 $("basl").textContent = "";
 s.hidden = false; setTimeout(function () { try { $(o.yes ? "basy" : "basn").focus() } catch (e) {} }, 0);
 if (!o.quiet) startSpeak();
}
function startSpeak() {
 if (START.custom) { var c = START.custom, nl0 = START.nl, k0 = c.speak || c.text; if (nl0 !== "en" && STR[nl0] && STR[nl0][k0] && hasVoice(nl0)) say(TL(nl0, k0), { lang: nl0, then: c.after }); else say(EN[k0] || k0, { lang: "en", then: c.after, clip: c.speak }); return }
 var nl = START.nl, k = START.resume ? "resume" : "start";
 if (nl !== "en" && hasVoice(nl)) say(TL(nl, k), { lang: nl, then: function () { say(EN[k], { lang: "en", keep: true }) } });
 else say(EN[k], { lang: "en" });
}
function startClose() { START.open = false; START.custom = null; $("bas").hidden = true; try { $("basy").hidden = false } catch (e) {} }
/* browsers stay silent until the visitor first clicks, taps or presses a key: speak the question again then */
function unlockSpeech(e) {
 if (Date.now() - (SP.kick || 0) < 1500) return;
 var t = e && e.target, onBtn = t && t.closest && t.closest("#basy, #basn");
 if (START.open && !onBtn && !(SP.heard > START.t0)) { SP.kick = Date.now(); startSpeak(); return }
 if (SP.blocked && BA.on && BA.lastSay && !START.open) { SP.kick = Date.now(); SP.blocked = false; say(BA.lastSay.text, { lang: BA.lastSay.lang, clip: BA.lastSay.clip }) }
}
["pointerdown", "touchend", "click"].forEach(function (ev) { document.addEventListener(ev, unlockSpeech, true) });
var SRW = false, SRW_LANG = false;   /* the screen-reader message is playing (J or Escape skips it); SRW_LANG: repeat it once in the language chosen next */
function startYes() {
 if (START.custom) { var c = START.custom; if (!c.yes) return; startClose(); beep("select"); c.onYes(); return }
 startClose(); beep("select"); BA.on = true;
 /* first, ask anyone using a screen reader to turn it off: blind assistance speaks the whole site itself (J skips the message) */
 var after = function (f) { return function () { if (!SRW) return; SRW = false; f() } };
 if (START.resume) { applySettings(); SRW = true; say(T("sr_warn"), { must: true, then: after(function () { say(T("is_on"), { then: ready }) }) }); return }
 BA.speakLang = "en"; SRW = true; SRW_LANG = true; say(T("sr_warn"), { must: true, then: after(langStep) });
}
function startNo() {
 if (START.custom) { var c = START.custom; startClose(); beep("back"); c.onNo(); return }
 startClose(); stopSpeech(); BA.on = false; settingsSave(); badge();
 /* visual mode: offer a short spoken guide to the page (not on a returning visit) */
 if (!START.resume) askDialog({ title: dualT("vg_title"), text: "vg_q", yes: "vg_yes", no: "vg_no", onYes: visualGuide, onNo: function () { stopSpeech() } });
}
/* the spoken guide for sighted visitors, about a minute and a half; J or Escape stops it */
function visualGuide() {
 var parts = ["vg1", "vg2", "vg3", "vg4"], i = 0, g = {}; VG = g;
 var next = function () {
  if (VG !== g) return;
  if (i >= parts.length) { VG = null; startClose(); return }
  var k = parts[i++];
  askDialog({ title: dualT("vg_title"), text: k, speak: k, no: "vg_stop", onNo: function () { VG = null; stopSpeech() }, after: next });
 };
 next();
}
var VG = null;

/* ---------- setup: language, input method, guide ---------- */
function langStep() {
 var nl = navLang(), txt = EN.lang_q;
 if (nl !== "en" && hasVoice(nl)) { say(TL(nl, "lang_q"), { lang: nl, then: function () { YN = { yes: function () { setLang("en", methodStep) }, no: langSearch, text: txt }; say(txt, { lang: "en", keep: true }) } }); YN = { yes: function () { setLang("en", methodStep) }, no: langSearch, text: txt }; return }
 yesno(txt, function () { setLang("en", methodStep) }, langSearch, "en");
}
function langItems(filter) {
 var f = String(filter || "").toLowerCase().trim();
 return LANGS.slice().sort(function (a, b) { return a[1] < b[1] ? -1 : 1 }).filter(function (l) { return !f || l[1].toLowerCase().indexOf(f) === 0 || l[2].toLowerCase().indexOf(f) === 0 || (f.length > 2 && (l[1].toLowerCase().indexOf(f) >= 0 || l[2].toLowerCase().indexOf(f) >= 0)) })
  .map(function (l) { return { d: "d_lang", label: l[1] + (l[2] !== l[1] ? " — " + l[2] : ""), say: hasVoice(l[0]) ? l[2] : l[1], lang: hasVoice(l[0]) ? l[0] : "en", code: l[0], key: l[1], act: function () { langPick(l[0]) } } });
}
function langSearch(after, back) {
 BA.langAfter = typeof after === "function" ? after : methodStep;
 panelOpen({ title: T("lang_title"), items: langItems(""), search: true, jump: true, quiet: true, onBack: function () { panelClose(); if (typeof back === "function") back(); else langStep() } });
 var q = $("bapq"); q.value = ""; q.placeholder = T("lang_ph"); q.hidden = false; setTimeout(function () { q.focus() }, 0); P.inSearch = true;
 say(T("lang_type"));
}
var searchT = 0;
function searchInput() {
 if (P.searchFn) { P.searchFn($("bapq").value); return }
 var q = $("bapq").value; P.items = langItems(q); P.i = 0; P.confirm = null; panelRender();
 clearTimeout(searchT); searchT = setTimeout(function () { var it = P.items[0]; if (!q.trim()) return; if (!it) say(T("lang_nomatch")); else say(it.say, { lang: it.lang }) }, 380);
}
function langPick(code) {
 if (P.confirm !== code) {
  P.confirm = code; beep("select");
  var l = L(code), sc = STR[code] && hasVoice(code) ? code : "en";
  say(TL(sc, "lang_confirm", { name: sc === "en" ? l[1] : l[2] }), { lang: sc }); return;
 }
 var after = BA.langAfter || methodStep; panelClose(); setLang(code, after);
}
function setLang(code, after) {
 var l = L(code); BA.lang = code;
 BA.speakLang = (code === "en" || (STR[code] && hasVoice(code))) ? code : "en";
 settingsSave(); badge();
 var notes = [], go0 = function () { if (after) after() }, go = function () {
  if (!SRW_LANG) { go0(); return } SRW_LANG = false;
  if (BA.speakLang === "en" || !(STR[BA.speakLang] && STR[BA.speakLang].sr_warn)) { go0(); return }
  SRW = true; say(T("sr_warn"), { must: true, then: function () { if (!SRW) return; SRW = false; go0() } });
 };
 if (code !== "en" && !hasVoice(code)) {
  if (offerEdge()) { yesno("Your device has no " + l[1] + " voice, so I will speak English. Microsoft Edge has more voices. If you would like to open the Earth Information Jukebox there, please press F. To stay here, press J.", openEdge, go, "en"); return }
  notes.push("Your device has no " + l[1] + " voice, so I will speak English.");
 } else if (code !== "en" && !STR[code]) notes.push("Menus will be read in English, and the assistant will answer in " + l[1] + ".");
 if (notes.length) say(notes.join(" "), { lang: "en", then: go }); else go();
}
/* Only on Windows computers that are not already in Edge (Edge comes with Windows; phones, tablets, Apple devices and TVs are left out) */
function offerEdge() { var ua = navigator.userAgent || ""; return /Windows NT/.test(ua) && !/Edg\/|EdgA|EdgiOS|Xbox|Windows Phone|Mobile|Tablet/.test(ua) }
function openEdge() { say("Opening Microsoft Edge. If your browser asks, press Enter to allow it.", { lang: "en", then: function () { try { location.href = "microsoft-edge:" + location.href } catch (e) {} } }) }
BA.siLang = function () { return hasVoice(BA.lang) ? L(BA.lang)[1] : "English" };
function siVoice() { return hasVoice(BA.lang) ? BA.lang : "en" }
function methodStep() {
 yesno(T("method_q"), function () { yesno(T("kb_q"), function () { BA.method = "keys"; guideStep() }, function () { BA.method = "typing"; guideStep() }) }, voiceSetup);
}
function voiceSetup() {
 var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (!SR) { BA.method = "typing"; say(T("voice_none"), { then: guideStep }); return }
 say(T("voice_mic"), { then: function () {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { BA.method = "voice"; guideStep(); return }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) { s.getTracks().forEach(function (t) { t.stop() }); BA.method = "voice"; guideStep() })
   .catch(function () { BA.method = "typing"; say(T("voice_denied"), { then: guideStep }) });
 } });
}
function guideStep() { settingsSave(); badge(); yesno(T("guide_q"), function () { playGuide(function () { offerAll(ready) }) }, ready) }
var GUIDE = null;
function playGuide(after) {
 var ch = ["g1", "g2", "g3"].concat(BA.method === "keys" ? ["k1", "k2"] : BA.method === "voice" ? ["v1", "v2"] : ["t1", "t2"]).concat(["bs", "gk"]), i = 0, g = GUIDE = { after: after };
 var next = function () { if (GUIDE !== g) return; if (i >= ch.length) { GUIDE = null; say(T("guide_end"), { then: after, clip: "guide_end" }); return } var k = ch[i++]; say(T(k), { then: next, clip: k }) };
 say(T("guide_skip"), { then: next, clip: "guide_skip" });
}
function guideSkip() { var g = GUIDE; GUIDE = null; stopSpeech(); beep("back"); if (g && g.after) g.after() }
function applySettings() {
 var s = settingsLoad() || {};
 BA.lang = s.lang || "en"; BA.method = s.method || "keys"; BA.rate = s.rate || 1; BA.dates = s.dates || "ends"; BA.sr = !!s.sr; BA.recent = s.recent || [];
 BA.speakLang = (BA.lang === "en" || (STR[BA.lang] && hasVoice(BA.lang))) ? BA.lang : "en";
}
function ready() {
 BA.on = true; settingsSave(); badge();
 AI.cap = BA.method === "keys" ? 20 : 75; try { aiFoot() } catch (e) {}
 if (BA.method === "keys") { try { if (!$("aip").hidden) aiToggle(false); if (document.activeElement && document.activeElement.blur) document.activeElement.blur() } catch (e) {} mainMenu(T("ready_keys")); return }
 if (BA.method === "typing") { aiToggle(true); setTimeout(function () { $("aiq").focus() }, 50); say(T("ready_typing")); return }
 aiToggle(true); setTimeout(function () { try { document.activeElement && document.activeElement.blur() } catch (e) {} }, 80); say(T("ready_voice"));
}
function clearPrefs() { try { ["ejBA", "ejAnalyses", "ejDJvol", "ejSet", "ejMLEN"].forEach(function (k) { localStorage.removeItem(k) }); sessionStorage.clear(); document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT" } catch (e) {} }
function resetAll() {
 clearPrefs();
 try { YN = null; GUIDE = null; panelClose(); listenStop() } catch (e) {}
 var go = function () { try { location.reload() } catch (e) {} }; setTimeout(go, 6000);
 say(T("reset_done"), { then: go });
}
function askReset() {
 if (BA.on && !START.open) { yesno(T("reset_q") + " " + ynHow(), resetAll, function () { say(T("cancel")) }); return }
 askDialog({ title: dualT("s_reset"), text: "reset_q", yes: "reset_yes", no: "reset_no", onYes: resetAll, onNo: function () { stopSpeech() } });
}
function restartBA() {
 YN = null; GUIDE = null; try { listenStop() } catch (e) {} stopSpeech(); panelClose(); BA.on = false; BA.method = ""; BA.lang = "en"; BA.speakLang = "en"; BA.mainI = 0;
 try { localStorage.removeItem("ejBA") } catch (e) {} AI.cap = 20; try { aiFoot() } catch (e) {} badge(); showStart(false);
}
function turnOff() {
 YN = null; GUIDE = null; try { listenStop() } catch (e) {} stopSpeech(); panelClose(); BA.on = false; settingsSave(); AI.cap = 20; try { aiFoot() } catch (e) {} badge();
 var u = new SpeechSynthesisUtterance(T("off_done")); try { var v = pickVoice(BA.speakLang); if (v) { u.voice = v; u.lang = v.lang } speechSynthesis.speak(u) } catch (e) {}
}

/* ---------- list panel (languages, menus, places, analysis) ---------- */
var P = { open: false, items: [], i: 0 };
function panelOpen(o) {
 P = { open: true, items: o.items || [], i: Math.min(o.index || 0, Math.max(0, (o.items || []).length - 1)), isMain: !!o.isMain, title: o.title || "", onBack: o.onBack || null, search: !!o.search, jump: !!o.jump, inSearch: false, confirm: null, readFull: !!o.readFull };
 $("bapt").textContent = P.title; $("bapq").hidden = true; $("bah").textContent = T("hint") + " · " + T("hint_bs");
 $("bap").hidden = false; panelRender();
 try { if (document.activeElement && document.activeElement !== document.body && BA.method !== "typing") document.activeElement.blur() } catch (e) {}
 if (!o.quiet) say((o.intro ? o.intro + " " : P.title + ". ") + itemText(), { lang: curItemLang(), nolast: !o.intro });
}
function panelClose() { P.open = false; P.inSearch = false; $("bap").hidden = true; $("bapq").hidden = true; if (BA.on && BA.method === "typing") setTimeout(function () { var q = $("aiq"); if (q && !$("aip").hidden) q.focus() }, 0) }
function panelRender() {
 var ul = $("bapl"); ul.innerHTML = "";
 P.items.forEach(function (it, k) {
  var li = document.createElement("li"); li.setAttribute("role", "option"); li.textContent = it.label; if (k === P.i) { li.className = "on"; li.setAttribute("aria-selected", "true") }
  li.addEventListener("click", function () { P.i = k; panelRender(); select() }); ul.appendChild(li);
 });
 var on = ul.querySelector("li.on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest" });
}
function curItemLang() { var it = P.items[P.i]; return it && it.lang ? it.lang : BA.speakLang }
function itemText() { var it = P.items[P.i]; if (!it) return ""; return (it.say || it.label) }
function sayItem() {
 var it = P.items[P.i]; if (!it) return;
 var pos = T("of", { i: P.i + 1, n: P.items.length });
 /* moving through a menu does not replace "the last message" (R repeats real messages), except items that carry content */
 var nl = !it.say;
 if (it.lang && it.lang !== BA.speakLang) say(it.say || it.label, { lang: it.lang, nolast: nl, then: function () { say(pos, { keep: true, nolast: true }) } });
 else say((it.say || it.label) + ". " + pos, { nolast: nl });
}
function describe() { var it = P.items[P.i]; if (!it) return; if (it.d) say(T(it.d)); else if (it.dtext) say(it.dtext, { lang: "en" }); else say(T("d_none")) }
function move(d) { if (!P.items.length) return; P.i = Math.max(0, Math.min(P.items.length - 1, P.i + d)); P.confirm = null; beep("move"); panelRender(); sayItem() }
function select() { var it = P.items[P.i]; if (!it || !it.act) return; if (P.isMain) BA.mainI = P.i; if (!P.search) beep("select"); it.act() }
function panelBack(how) { beep("back"); if (P.onBack) P.onBack(how); else if (BA.method === "keys") mainMenu(); else { panelClose(); stopSpeech() } }
function jump(ch) {
 ch = ch.toLowerCase(); var n = P.items.length;
 for (var k = 1; k <= n; k++) { var j = (P.i + k) % n, it = P.items[j]; if (String(it.key || it.label).toLowerCase().indexOf(ch) === 0) { P.i = j; beep("move"); panelRender(); sayItem(); return } }
}

/* ---------- menus ---------- */
function onoff(v) { return T(v ? "on" : "off") }
/* the main menu is the top level: Left (or Escape with keys only) goes back one step, to the language list */
function langFromMenu() { langSearch(function () { say(T("lang_set", { name: L(BA.lang)[STR[BA.lang] ? 2 : 1] }), { then: function () { mainMenu() } }) }, function () { mainMenu() }) }
function mainMenu(intro) {
 panelOpen({ title: T("menu"), intro: intro, index: BA.mainI || 0, isMain: true, onBack: function (how) { if (how === "Escape" && BA.method !== "keys") { panelClose(); stopSpeech() } else { BA.mainI = 0; langFromMenu() } }, items: [
  { label: T("m_play"), d: "d_play", act: modesMenu }, { label: T("m_now"), d: "d_now", act: nowMenu }, { label: T("m_place"), d: "d_place", act: placeMenu },
  { label: T("m_data"), d: "d_data", act: dataSay }, { label: T("m_sil"), d: "d_sil", act: silToggle }, { label: T("m_mute"), d: "d_mute", act: muteToggle }, { label: T("m_range"), d: "d_range", act: rangeMenu },
  { label: T("m_where"), d: "d_where", act: function () { say(statusText()) } }, { label: T("m_why"), d: "d_why", act: sayWhy }, { label: T("m_climate"), d: "d_climate", act: function () { climateFlow(10, null, ++BA.reqTok) } }, { label: T("m_an"), d: "d_an", act: analyticsFlow },
  { label: T("m_cmp"), d: "d_cmp", act: function () { if (window.EJMH && EJMH.on()) { say(T("mute_cmp")); return } BA.cmp = { place: null, y1: null, y2: null }; cmpMenu() } },
  { label: T("m_ex"), d: "d_ex", act: function () { exMenu() } }, { label: T("m_acc"), d: "d_acc", act: function () { accMenu() } },
  { label: T("m_more"), d: "d_more", act: moreMenu }, { label: T("m_set"), d: "d_set", act: settingsMenu }, { label: T("m_help"), d: "d_help", act: helpMenu }, { label: T("m_all"), d: "d_all", act: function () { sayAll() } }, { label: T("m_repeat"), d: "d_repeat", act: repeatLast }] });
}
/* More about Earth Jukebox: spoken, plain-language versions of the monographs and presentations (ba-docs.js); Escape stops */
function moreMenu() {
 panelOpen({ title: T("m_more"), onBack: function () { mainMenu() }, items: [
  { label: T("more_mono"), d: "d_more_mono", act: function () { docsMenu("mono") } },
  { label: T("more_pres"), d: "d_more_pres", act: function () { docsMenu("pres") } },
  { label: T("more_sol"), d: "d_more_sol", act: solMenu }] });
}
/* Physical Solutions (solutions.js): each model's summary and parts are spoken; its documents open in a new tab */
function solMenu() {
 var S = window.EJSOL; if (!S) { say(T("load_fail")); return }
 panelOpen({ title: T("more_sol"), onBack: moreMenu, items: S.GROUPS.map(function (g) { return { label: T("sol_" + g.id), dtext: g.sub, act: function () { solGroup(g.id) } } }) });
}
function solGroup(gid) {
 var S = window.EJSOL, L = S.MODELS.filter(function (m) { return m.g === gid });
 panelOpen({ title: T("sol_" + gid), onBack: solMenu, items: L.map(function (m) { return { label: m.name, lang: "en", dtext: m.line, act: function () { if (!m.ready) { say(T("sol_soon")); return } solModel(m) } } }) });
}
function solModel(m, idx) {
 var b = "solutions/" + m.id + "/", od = function (u) { var w = window.open(u, "_blank"); if (w) { try { w.opener = null } catch (e) {} say(T("sol_opened")) } else say(T("load_fail")) };
 panelOpen({ title: m.name, index: idx || 0, onBack: function () { solGroup(m.g) }, items: [
  { label: T("sol_sum"), act: function () { say(m.summary, { lang: "en" }) } },
  { label: T("sol_parts"), act: function () { solParts(m) } },
  { label: T("sol_build"), act: function () { od(b + "build.pdf") } },
  { label: T("sol_fin"), act: function () { od(b + "finance.pdf") } },
  { label: T("sol_slides"), act: function () { od(b + "slides.pdf") } }] });
}
function solParts(m) {
 var tok = ++BA.reqTok; say(T("data_wait"));
 window.EJSOL.parts(m.id).then(function (L) {
  if (tok !== BA.reqTok) return;
  panelOpen({ title: T("sol_parts"), onBack: function () { solModel(m, 1) }, items: L.map(function (t) { return { label: t.split(". ")[0], lang: "en", dtext: t, act: function () { say(t, { lang: "en" }) } } }) });
 }).catch(function () { say(T("load_fail")) });
}
function docsMenu(kind) {
 var L = (window.EJDOCS && EJDOCS[kind]) || []; if (!L.length) { say(T("load_fail")); return }
 panelOpen({ title: T(kind === "mono" ? "more_mono" : "more_pres"), onBack: moreMenu, items: L.map(function (d) { return { label: d.title, lang: "en", dtext: d.summary, act: function () { docPlay(d) } } }) });
}
function docPlay(d) {
 var parts = d.parts.slice(), i = 0, tok = ++BA.reqTok;
 var next = function () { if (tok !== BA.reqTok) return; if (i >= parts.length) { beep("done"); say(T("doc_end")); return } say(parts[i++], { lang: "en", then: next }) };
 say((BA.speakLang !== "en" ? T("doc_en") + " " : "") + T("doc_start", { t: d.title }), { then: next });
}
/* Mute humans (mutehumans.js): the place without human-caused warming, a simulation */
function muteToggle() {
 if (!window.EJMH) { say(T("load_fail")); return }
 say(T(EJMH.set(!EJMH.on()) ? "mute_on" : "mute_off"));
}
/* SI listening (si-rhythms.js): the SI marks the months that surprised it, in the music and the data panel */
function silToggle() {
 if (!window.EJSI || !EJSI.listen) { say(T("load_fail")); return }
 if (!EJSI.listening() && !window.pinLL) { say(T("sil_pin")); return }
 say(T(EJSI.listen(!EJSI.listening()) ? "sil_on" : "sil_off"));
}
/* Data panel (datapanel.js): every dataset's number for the moment the timeline is on */
async function dataSay() {
 if (!window.EJP || !EJP.read) { say(T("load_fail")); return }
 say(T("data_wait"));
 try { var t = await EJP.read(); say(t, { lang: "en" }) } catch (e) { say(T("load_fail")) }
}
/* Range (datapanel.js): the circle the music and the data panel average over */
function rangeMenu() {
 var R = window.EJRG, cur = R ? R.state() : { mode: "pin" }, opts = [["pin", 0], ["km", 10], ["km", 25], ["km", 50], ["km", 100], ["km", 250], ["km", 500], ["km", 1000], ["km", 2500], ["km", 5000], ["earth", 0]];
 var lab = function (o) { return o[0] === "pin" ? T("r_pin") : o[0] === "earth" ? T("r_earth") : T("r_km", { km: String(o[1]) }) };
 var idx0 = 0; opts.forEach(function (o, i) { if (o[0] === cur.mode && (o[0] !== "km" || o[1] === cur.km)) idx0 = i });
 panelOpen({ title: T("m_range"), index: idx0, onBack: function () { mainMenu() }, items: opts.map(function (o) { return { label: lab(o), d: "d_range", act: function () { if (!R) { say(T("load_fail")); return } R.set(o[0], o[1]); say(T("r_set", { r: lab(o) })) } } }) });
}
/* the main menu read as one list: every item's name and what it does */
function sayAll(then) {
 var keys = ["m_play", "m_now", "m_place", "m_data", "m_sil", "m_mute", "m_range", "m_where", "m_why", "m_climate", "m_an", "m_cmp", "m_ex", "m_acc", "m_more", "m_set", "m_help", "m_repeat"], ds = { m_play: "d_play", m_now: "d_now", m_place: "d_place", m_data: "d_data", m_sil: "d_sil", m_mute: "d_mute", m_range: "d_range", m_where: "d_where", m_why: "d_why", m_climate: "d_climate", m_an: "d_an", m_cmp: "d_cmp", m_ex: "d_ex", m_acc: "d_acc", m_more: "d_more", m_set: "d_set", m_help: "d_help", m_repeat: "d_repeat" };
 var t = T("all_intro") + " " + keys.map(function (k, i) { var a = String(T(k)).replace(/[.。．!?！？:：]+$/, ""), b = String(T(ds[k])); return (i + 1) + ". " + a + ". " + b }).join(" ");
 say(t, { then: then });
}
function offerAll(then) { yesno(T("all_q"), function () { sayAll(then) }, then) }
function siCatalog() { var c = catalog(), rank = function (z) { return z.g === "veda" ? 1 : 0 }; return c.map(function (z, i) { return [rank(z), i, z] }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1] }).map(function (x) { return { id: x[2].id, name: String(x[2].name).slice(0, 90) } }) }
/* "play", "hear" ... in English and in the chosen language's own instant-command words */
function wantsPlay(q) { var n = norm(q); if (/\b(play|hear|listen|sonify|switch to|put on)\b/.test(n)) return true; var c = STR[BA.lang] && STR[BA.lang].cmd; return !!(c && (c.resume || []).some(function (w) { w = norm(w); return w.length > 1 && (" " + n + " ").indexOf(" " + w + " ") >= 0 })) }
function shortDesc(t) { t = String(t || "").replace(/\s+/g, " ").trim(); var m = t.match(/^(.*?[.!?])\s+(.*?[.!?])(\s|$)/); t = m ? m[1] + " " + m[2] : t; return t.length > 360 ? t.slice(0, t.lastIndexOf(" ", 340)) + "." : t }
function catalog() {
 var X = window.EXP || {}, out = [{ id: "vis", name: "Visible Earth, VIIRS / MODIS true colour", g: "eic", desc: X.vis || "" }];
 try { ((window.GAL && GAL.man && GAL.man.datasets) || []).forEach(function (d) { out.push({ id: "g:" + d.key, name: d.title, g: "eic", desc: shortDesc(d.desc) }) }) } catch (e) {}
 try { ((window.EIC && EIC.cols) || []).forEach(function (c) { out.push({ id: "v:" + c.id, name: c.title || c.id, g: "veda", desc: shortDesc(c.description) }) }) } catch (e) {}
 Array.prototype.forEach.call($("lay").options, function (o) { if (o.value !== "vis") out.push({ id: "n:" + o.value, name: o.text, g: "more", desc: X[o.value] || "" }) });
 return out;
}
function modesMenu() {
 var cat = catalog(), grp = function (g, title) {
  var items = cat.filter(function (c) { return c.g === g }).map(function (c) { return { label: c.name, dtext: c.desc ? c.name + ". " + c.desc : "", act: function () { baPlay(c.id, {}) } } });
  return { label: title, d: "d_g_" + g, act: function () { if (!items.length) { say(T("load_fail")); return } panelOpen({ title: title, items: items, onBack: modesMenu }) } };
 };
 panelOpen({ title: T("m_play"), onBack: function () { mainMenu() }, items: [grp("eic", T("g_eic")), grp("veda", T("g_veda")), grp("more", T("g_more"))] });
}
function nowMenu(keep) {
 var items = [
  { label: T("n_toggle"), d: "d_n_toggle", act: function () { control(window.tplaying ? "pause" : "resume") } },
  { label: T("n_loop", { v: onoff(BA.loop) }), d: "d_n_loop", act: function () { control(BA.loop ? "loop_off" : "loop_on"); nowMenu(true) } },
  { label: T("n_status"), d: "d_n_status", act: function () { say(statusText()) } }, { label: T("m_why"), d: "d_why", act: sayWhy },
  { label: T("n_louder"), d: "d_vol", act: function () { control("louder") } }, { label: T("n_quieter"), d: "d_vol", act: function () { control("quieter") } },
  { label: T("n_faster"), d: "d_speed", act: function () { control("faster") } }, { label: T("n_slower"), d: "d_speed", act: function () { control("slower") } },
  { label: T("n_stop"), d: "d_n_stop", act: function () { control("stop") } }];
 if (keep === true) { P.items = items; panelRender(); return }
 panelOpen({ title: T("m_now"), items: items, onBack: function () { mainMenu() } });
}
function placeMenu() {
 panelOpen({ title: T("m_place"), onBack: function () { mainMenu() }, items: [
  { label: T("p_here"), d: "d_p_here", act: myLocation }, { label: T("p_list"), d: "d_p_list", act: continentMenu }, { label: T("p_seas"), d: "d_p_seas", act: seasMenu },
  { label: T("p_recent"), d: "d_p_recent", act: function () {
   if (!BA.recent.length) { say(T("p_none")); return }
   panelOpen({ title: T("p_recent"), onBack: placeMenu, items: BA.recent.map(function (r) { return { label: r.name, d: "d_city", act: function () { pinTo({ lat: r.lat, lon: r.lon, name: r.name, cls: "place", type: "city", bb: null }) } } }) });
  } }] });
}
function regionName(iso, lang) { if (lang === "apc") lang = "ar"; try { return new Intl.DisplayNames([lang], { type: "region" }).of(iso) } catch (e) { return iso } }
/* oceans and seas (for the sea datasets, which have no readings on land) */
function seasMenu() {
 var W = window.GEO_WATER || {}, skip = /^(antarctic ocean|mediterranean|arabian gulf|caribbean|east sea)$/;
 var items = Object.keys(W).filter(function (k) { return !skip.test(k) }).map(function (k) { var nm = k.replace(/\b\w/g, function (x) { return x.toUpperCase() }).replace(/\bOf\b/g, "of"); return { label: nm, key: nm, d: "d_city", act: function () { beep("select"); pinTo({ lat: W[k][0], lon: W[k][1], name: nm, cls: "natural", type: "water", bb: null }) } } })
  .sort(function (a, b) { return a.label.localeCompare(b.label) });
 panelOpen({ title: T("p_seas"), items: items, jump: true, onBack: placeMenu });
}
function continentMenu() {
 var items = ["af", "as", "eu", "na", "sa", "oc"].map(function (c) { return { label: T("c_" + c), d: "d_cont", act: function () { countryMenu(c) } } });
 panelOpen({ title: T("p_list"), items: items, onBack: placeMenu });
}
function countryMenu(c) {
 var tag = L(BA.speakLang)[3] || "en";
 var items = PLACES[c].split(";").map(function (e) { var p = e.split(":"), iso = p[0], cities = p[1].split("|"), nm = regionName(iso, tag);
  return { label: nm, key: nm, d: "d_country", act: function () { panelOpen({ title: nm, onBack: function () { countryMenu(c) }, items: cities.map(function (ci) { return { label: ci, d: "d_city", act: function () { findCity(ci, iso) } } }) }) } } })
  .sort(function (a, b) { return a.label.localeCompare(b.label, tag) });
 panelOpen({ title: T("c_" + c), items: items, jump: true, onBack: continentMenu });
}
function settingsMenu(idx) {
 var rates = [[.8, "r_slow"], [1, "r_normal"], [1.3, "r_fast"], [1.7, "r_vfast"]], rn = (rates.filter(function (r) { return r[0] === BA.rate })[0] || rates[1])[1];
 var pickList = function (title, opts, cur, set) { panelOpen({ title: title, onBack: function () { settingsMenu() }, index: Math.max(0, opts.map(function (o) { return o[0] }).indexOf(cur)), items: opts.map(function (o) { return { label: T(o[1]), d: "d_option", act: function () { set(o[0]); settingsSave(); badge(); say(T("saved"), { then: function () { settingsMenu() } }) } } }) }) };
 panelOpen({ title: T("m_set"), index: idx || 0, onBack: function () { mainMenu() }, items: [
  { label: T("s_lang"), d: "d_s_lang", act: function () { langSearch(function () { say(T("lang_set", { name: L(BA.lang)[STR[BA.lang] ? 2 : 1] }), { then: function () { settingsMenu() } }) }, function () { settingsMenu() }) } },
  { label: T("s_rate", { v: T(rn) }), d: "d_s_rate", act: function () { pickList(T("t_rate"), rates, BA.rate, function (v) { BA.rate = v }) } },
  { label: T("s_dates", { v: T(BA.dates === "every" ? "d_every" : "d_ends") }), d: "d_s_dates", act: function () { pickList(T("t_dates"), [["ends", "d_ends"], ["every", "d_every"]], BA.dates, function (v) { BA.dates = v }) } },
  { label: T("s_voice", { v: T(BA.sr ? "o_sr" : "o_site") }), d: "d_s_voice", act: function () { pickList(T("t_voice"), [[false, "o_site"], [true, "o_sr"]], BA.sr, function (v) { BA.sr = v }) } },
  { label: T("s_method", { v: T("me_" + BA.method) }), d: "d_s_method", act: function () { pickList(T("t_method"), [["keys", "me_keys"], ["typing", "me_typing"], ["voice", "me_voice"]], BA.method, function (v) { setMethod(v) }) } },
  { label: T("s_off"), d: "d_s_off", act: function () { yesno(T("off_q"), turnOff, function () { settingsMenu(5) }) } },
  { label: T("s_restart"), d: "d_s_restart", act: restartBA },
  { label: T("s_reset"), d: "d_s_reset", act: askReset }] });
}
function setMethod(m) {
 if (m === "voice" && !(window.SpeechRecognition || window.webkitSpeechRecognition)) { say(T("voice_none")); m = "typing" }
 BA.method = m; AI.cap = m === "keys" ? 20 : 75; try { aiFoot() } catch (e) {} settingsSave(); badge();
 if (m !== "keys") aiToggle(true); else { try { if (!$("aip").hidden) aiToggle(false); if (document.activeElement && document.activeElement.blur) document.activeElement.blur() } catch (e) {} }
 if (m === "voice") setTimeout(function () { try { document.activeElement && document.activeElement.blur() } catch (e) {} }, 80);
}
function helpMenu() {
 panelOpen({ title: T("m_help"), onBack: function () { mainMenu() }, items: [
  { label: T("h_guide"), d: "d_h_guide", act: function () { panelClose(); playGuide(function () { offerAll(function () { BA.method === "keys" ? mainMenu() : helpMenu() }) }) } },
  { label: T("h_keys"), d: "d_h_keys", act: function () { say((BA.method === "keys" ? T("k1") + " " + T("k2") : BA.method === "voice" ? T("v1") + " " + T("v2") : T("t1") + " " + T("t2")) + " " + T("bs") + " " + T("gk")) } }] });
}
function repeatLast() { var l = BA.lastSay; if (l) say(l.text, { lang: l.lang, clip: l.clip }) }

/* ---------- reading the screen out loud ---------- */
function txt(id) { var e = $(id); return e ? (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim() : "" }
function curModeName() { if (window.EICON && window.EIC && EIC.col) return EIC.col.title || EIC.col.id; if (window.EICVIS) return "Visible Earth"; var s = $("lay"); return s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : "" }
function placeName() {
 var g = txt("geo"), all = (txt("where") + (g && !/Finding|unavailable/.test(g) ? ", " + g : "")).split(/\s*,\s*|\s+·\s+/), out = [];
 all.forEach(function (x) { x = x.trim(); if (x && !out.some(function (y) { return y.toLowerCase() === x.toLowerCase() })) out.push(x) });
 return out.join(", ");
}
function statusText() {
 var nums = Array.prototype.map.call(($("nums") || { children: [] }).children, function (s) { return (s.innerText || s.textContent || "").replace(/\s+/g, " ").trim() }).filter(Boolean).join(". ");
 return T("status", { place: placeName(), mode: curModeName(), date: (txt("year") + " " + txt("month")).replace(/\u00a0/g, " ").trim(), reading: nums || "-", mood: txt("mood") }).replace(/(\.\s*){2,}/g, ". ");
}
function langTag() { return L(BA.speakLang)[3] || "en-US" }
function frameLabel(x) {
 if (!x) return "";
 if (x.date && !/^\d{4}-\d{2}-\d{2}/.test(String(x.date))) return x.label || String(x.date);
 if (x.date) { var d = new Date(x.date); if (!isNaN(d)) { var o = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }, s = d.toLocaleDateString(langTag(), o); if (/T\d\d:\d\d/.test(String(x.date)) && (d.getUTCHours() || d.getUTCMinutes())) s += " " + d.toLocaleTimeString(langTag(), { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC"; return s } return String(x.date) }
 if ($("sp") && $("sp").value !== "12" && x.m) { try { return new Date(Date.UTC(x.y, x.m - 1, 1)).toLocaleDateString(langTag(), { month: "long", year: "numeric", timeZone: "UTC" }) } catch (e) {} }
 return String(x.y);
}

/* ---------- playing a dataset ---------- */
var PLAYTOK = 0;
var OK_RE = /^NASA EIC data:|^NASA record loaded/, PIN_OK_RE = /^Pick an EIC dataset|^Click the globe/, BAD_RE = /^Could not|^This dataset has no frames|^No NASA pictures|^NASA has no usable record|not on this site/;
function waitNote(tk, ms) {
 return new Promise(function (res) {
  var t0 = Date.now(), fullAt = 0, iv = setInterval(function () {
   var n = txt("note");
   if (tk !== undefined && tk !== PLAYTOK) { clearInterval(iv); res(false); return }
   if (OK_RE.test(n) || (tk === undefined && PIN_OK_RE.test(n))) { clearInterval(iv); res(true); return }
   if (BAD_RE.test(n)) { clearInterval(iv); res(false); return }
   /* every frame has been read: it is ready (or there is simply no value at this pin) */
   var m = n.match(/at your pin: (\d+) of (\d+)/);
   if (m && m[1] === m[2]) { if (!fullAt) fullAt = Date.now(); else if (Date.now() - fullAt > 2500) { clearInterval(iv); res(!!(window.series && series.some(function (x) { return (x.v !== null && x.v !== undefined) || (x.h !== null && x.h !== undefined) }))); return } }
   if (Date.now() - t0 > (ms || 120000)) { clearInterval(iv); res(!!(window.series && series.length > 0)) }
  }, 300);
 });
}
/* after a pin move: done when the page has the new place's record (a new series), or says it has none; never more than 20 s */
function waitPin(s0) {
 return new Promise(function (res) {
  var t0 = Date.now(), iv = setInterval(function () {
   var n = txt("note");
   if ((window.series !== s0 && window.series && series.length) || OK_RE.test(n) || BAD_RE.test(n) || window.EICON || Date.now() - t0 > 20000) { clearInterval(iv); res() }
  }, 200);
 });
}
function isCurrent(id) {
 var eicUi = document.body.classList.contains("eic"), lay = $("lay").value;
 if (!window.series || !series.length) return false;
 if (id === "vis") return !!window.EICVIS || (!eicUi && lay === "vis");
 if (id.slice(0, 2) === "g:" || id.slice(0, 2) === "v:") return !!window.EICON && typeof eselCur === "function" && eselCur() === id && series.some(function (x) { return x.v !== null && x.v !== undefined });
 if (id.slice(0, 2) === "n:") return !eicUi && lay === id.slice(2);
 return false;
}
function loadMode(id, tk) {
 setNote("");
 var eicUi = document.body.classList.contains("eic");
 if (id === "vis") {
  if (eicUi) { if (!window.EICVIS) enterVis(true); else choose(last[0], last[1], last[2]) }
  else if ($("lay").value !== "vis") { $("lay").value = "vis"; $("lay").dispatchEvent(new Event("change")); if (series.length) return new Promise(function (r) { setTimeout(function () { r(true) }, 900) }) }
  else choose(last[0], last[1], last[2]);
  return waitNote(tk);
 }
 if (id.slice(0, 2) === "g:" || id.slice(0, 2) === "v:") {
  EIC.lastSel = id;
  if (!window.EICON) eicEnter(id);
  else if (id.slice(0, 2) === "g:") { var d = ((GAL.man && GAL.man.datasets) || []).filter(function (z) { return z.key === id.slice(2) })[0]; if (!d) return Promise.resolve(false); galSelect(d) }
  else { var c = (EIC.cols || []).filter(function (z) { return z.id === id.slice(2) })[0]; if (!c) return Promise.resolve(false); eicSelect(c) }
  try { eselRender() } catch (e) {}
  return waitNote(tk);
 }
 if (id.slice(0, 2) === "n:") {
  var k = id.slice(2), reload = false;
  if (eicUi) { reload = !!window.EICON; moreModes() }
  if ($("lay").value !== k) { $("lay").value = k; $("lay").dispatchEvent(new Event("change")) }
  if (reload || !series.length) { if (!reload) choose(last[0], last[1], last[2]); return waitNote(tk) }
  return new Promise(function (r) { setTimeout(function () { r(series.length > 0) }, 900) });
 }
 return Promise.resolve(false);
}
function setYears(y1, y2) {
 var a1 = $("y1"), a2 = $("y2"); if (!a1 || a1.disabled) return;
 var clamp = function (el, v) { var lo = el.min ? +el.min : -1e9, hi = el.max ? +el.max : 1e9; return Math.max(lo, Math.min(hi, v)) };
 if (y1) { a1.value = clamp(a1, y1); a1.dispatchEvent(new Event("change")) }
 if (y2) { a2.value = clamp(a2, y2); a2.dispatchEvent(new Event("change")) }
}
async function baPlay(id, o) {
 o = o || {}; var tk = ++PLAYTOK;
 if (window.mode3 === "moon") try { exitMoon() } catch (e) {}
 stopPlay(); window.TLONCE = false;
 var c = catalog().filter(function (z) { return z.id === id })[0], name = c ? c.name : id;
 var eicId = id.slice(0, 2) === "g:" || id.slice(0, 2) === "v:";
 /* earth.gov and EIC datasets read their own values at the new pin, so they need not wait for the page's climate record */
 if (BA.pinWait && !eicId) { await BA.pinWait; if (tk !== PLAYTOK) return }
 BA.pinWait = null;
 if (!isCurrent(id)) {
  say(T("loading", { mode: name }), { keep: true });
  var tick = setInterval(function () { if (tk !== PLAYTOK) { clearInterval(tick); return } var m = txt("note").match(/(\d+) of (\d+)/); if (!(window.speechSynthesis && speechSynthesis.speaking)) say(m ? T("still", { done: m[1], total: m[2] }) : T("still0")) }, 12000);
  var ok = await loadMode(id, tk); clearInterval(tick);
  if (tk !== PLAYTOK) return;
  if (!ok) { if (window.series && series.length && !pinHasData(id) || /at your pin: (\d+) of \1\b|no usable record|has no value|have no value/i.test(txt("note"))) { return noData(id, name, o) } beep("error"); say(T("load_fail") + " " + txt("note")); return }
 }
 if (o.y1 || o.y2) { setYears(o.y1, o.y2); await new Promise(function (r) { setTimeout(r, 400) }) }
 /* climate records: monthly steps for up to 15 years (the seasons can be heard and seen), one step per year for longer spans so it stays about a minute */
 if (id.slice(0, 2) === "n:" && $("sp") && !window.EICON) { var span = (+$("y2").value) - (+$("y1").value), want = span > 15 ? "12" : "1"; if ($("sp").value !== want) { $("sp").value = want; $("sp").dispatchEvent(new Event("change")); await new Promise(function (r) { setTimeout(r, 400) }); if (tk !== PLAYTOK) return } }
 if (!series.length || a > b) { beep("error"); say(T("load_fail") + " " + txt("note")); return }
 /* the sea layers have no reading on land: make sure the land map is in before deciding */
 if (/^n:(sea|sst)$/.test(id)) { await maskReady(); if (tk !== PLAYTOK) return; try { setSeriesH() } catch (e) {} }
 if (!pinHasData(id)) { return noData(id, name, o) }
 BA.last = { id: id, y1: o.y1, y2: o.y2 }; BA.loop = !!o.loop;
 setIdx(a);
 var yOf = function (x) { if (!x) return null; if (x.y > 0) return x.y; var d = /^(\d{4})-/.exec(String(x.date || "")); return d ? +d[1] : null };
 var fy = yOf(series[a]), ly = yOf(series[b]), note = "";
 if (fy && ly && ((o.y1 && fy > o.y1) || (o.y2 && ly < o.y2 - 1))) note = T("range_note", { ask: T("yrs", { a: o.y1 || fy, b: o.y2 || ly }), from: fy, to: ly }) + " ";
 /* EIC gallery visualizations cover only recent days: say so when years were asked for */
 else if (!fy && o.y1 && window.EIC && EIC.col && EIC.col._gal) { var fr = EIC.col._gal.frames || []; if (fr.length && fr[0].date) note = T("range_note", { ask: T("yrs", { a: o.y1, b: o.y2 || new Date().getFullYear() }), from: frameLabel({ date: fr[0].date }), to: frameLabel({ date: fr[fr.length - 1].date }) }) + " " }
 var msg = note + T("play_ann", { mode: name, place: placeName(), from: frameLabel(series[a]), to: frameLabel(series[b]) }) + (BA.loop ? " " + T("play_loop") : "");
 say(msg, { must: true, then: function () { if (tk !== PLAYTOK || tplaying) return; window.TLONCE = !BA.loop; setIdx(a); startPlay() } });
}
function pinHasData(id) {
 if (!window.series || !series.length) return false;
 if (id === "vis") return true;
 return series.some(function (x) { return x && ((x.v !== null && x.v !== undefined) || (x.h !== null && x.h !== undefined)) });
}
function maskReady() { if (window.LANDA || typeof landMask !== "function") return Promise.resolve(); return Promise.race([landMask().catch(function () {}), new Promise(function (r) { setTimeout(r, 5000) })]) }
function pinSurface() { try { if (window.pinLL && window.LANDA && typeof landAt === "function") return landAt(pinLL[0], pinLL[1]) > 128 ? "land" : "sea" } catch (e) {} return "" }
async function noData(id, name, o) {
 var tk = ++PLAYTOK; try { stopPlay() } catch (e) {} window.TLONCE = false; await maskReady(); if (tk !== PLAYTOK) return; beep("error");
 var surf = pinSurface(), seaOnly = /\b(sea|ocean|sst|marine|altimetry)\b|^n:sea$|^g:sst$|^n:sst$/i.test(name + " " + id);
 var msg = T("nodata", { mode: name, place: placeName() || "-" }) + (surf === "land" ? " " + T("nodata_land") : surf === "sea" ? " " + T("nodata_sea") : "") + (seaOnly && surf !== "sea" ? " " + T("nodata_seaonly") : "");
 if (BA.silent) { say(msg); return }
 BA.afterPin = { id: id, o: { y1: o.y1, y2: o.y2, loop: o.loop } };
 yesno(msg + " " + T("nodata_q") + " " + ynHow(), relocate, function () { BA.afterPin = null; say(T("cancel")) });
}
function relocate() {
 if (BA.method === "keys") { placeMenu(); return }
 if (BA.method === "voice") { say(T("where_voice")); return }
 aiToggle(true); setTimeout(function () { try { $("aiq").focus() } catch (e) {} }, 50); say(T("where_type"));
}
/* after "yes, move my pin", the dataset plays again at the new place (unless something else was asked meanwhile) */
function replayAfterPin() {
 var ap = BA.afterPin; if (!ap) return; BA.afterPin = null;
 var tk = PLAYTOK, t0 = Date.now(), iv = setInterval(function () {
  if (tk !== PLAYTOK) { clearInterval(iv); return }
  if (!SP.cur || Date.now() - t0 > 8000) { clearInterval(iv); baPlay(ap.id, ap.o) }
 }, 300);
}
/* the normal (sighted) SI assistant asked to play a dataset: same steps, no speech; returns what would have been said */
async function playQuiet(p, s0) {
 if (BA.on) { await baPlay(p.mode_id, { y1: p.from_year, y2: p.to_year, loop: p.loop }); return "" }
 if (s0) await waitPin(s0);
 BA.silent = true; BA.silentLog = [];
 try { await baPlay(p.mode_id, { y1: p.from_year, y2: p.to_year, loop: p.loop }); await new Promise(function (r) { setTimeout(r, 30) }) }
 finally { BA.silent = false }
 return BA.silentLog.filter(function (t) { return !/^(Please wait\.?|Loading .*|Still loading.*)$/.test(t) && t !== T("still0") }).join(" ");
}
window.onTimelineEnd = function () { if (BA.on) { beep("done"); say(T("ended")) } };
/* "announce dates while playing: every step" */
if (typeof window.setIdx === "function") {
 var _setIdx = window.setIdx;
 window.setIdx = function (i) { var before = window.idx; _setIdx(i); try { if (BA.on && BA.dates === "every" && window.tplaying && window.idx !== before && !(window.speechSynthesis && speechSynthesis.speaking)) say(frameLabel(series[idx])) } catch (e) {} };
}
function volume(d) {
 var e1 = $("djv1"), e2 = $("djv2"); if (!e1 || !e2) return;
 var t = Math.max(0, Math.min(100, (+e1.value) + (+e2.value) + d)), v1 = Math.min(50, t);
 e1.value = v1; e2.value = t - v1; e1.dispatchEvent(new Event("input")); e2.dispatchEvent(new Event("input"));
 say(T("vol", { v: t }));
}
function speed(d) {
 var s = $("sp"), order = window.EICON ? ["1", "3"] : ["1", "3", "12"], k = order.indexOf(s.value);
 if (k < 0) k = 0; var n = k + d;
 if (n < 0) { say(T("speed_min")); return } if (n >= order.length) { say(T("speed_max")); return }
 s.value = order[n]; s.dispatchEvent(new Event("change")); say(T(d > 0 ? "faster_ok" : "slower_ok"));
}
function control(a) {
 if (cmpActive() && /^(pause|resume|stop)$/.test(a)) { cmpControl(a); return }
 switch (a) {
  case "pause": if (tplaying) stopPlay(); if (playing) $("play").click(); say(T("paused")); break;
  case "resume": if (!series.length) { say(T("nothing")); break } window.TLONCE = !BA.loop; startPlay(); say(T("playing")); break;
  case "stop": PLAYTOK++; stopPlay(); if (playing) $("play").click(); window.TLONCE = false; BA.loop = false; if (series.length) setIdx(a0()); say(T("stopped")); break;
  case "loop_on": BA.loop = true;
   if (tplaying) { window.TLONCE = false; say(T("loop_on")) } else if (BA.last) baPlay(BA.last.id, { y1: BA.last.y1, y2: BA.last.y2, loop: true }); else if (series.length) { window.TLONCE = false; say(T("loop_on"), { then: startPlay }) } else say(T("nothing"));
   break;
  case "loop_off": BA.loop = false; if (tplaying) window.TLONCE = true; say(T("loop_off")); break;
  case "louder": volume(10); break;
  case "quieter": volume(-10); break;
  case "faster": speed(1); break;
  case "slower": speed(-1); break;
  case "clouds_on": case "clouds_off": if (!!window.CLOUDS !== (a === "clouds_on")) $("cl").click(); say(T(a)); break;
  case "map_view": mapToggle(true); say(T("map_on")); break;
  case "globe_view": mapToggle(false); say(T("globe_on")); break;
  case "status": say(statusText()); break;
  case "help": helpMenu(); break;
  case "menu": modesMenu(); break;
 }
}
function a0() { return window.a }

/* ---------- places ---------- */
function pinTo(hit, quiet) {
 setNote("");
 BA.pinWait = waitPin(window.series).then(function () { BA.pinWait = null });
 geoApply(hit);
 BA.recent = [{ name: hit.name, lat: +(+hit.lat).toFixed(5), lon: +(+hit.lon).toFixed(5) }].concat(BA.recent.filter(function (r) { return r.name !== hit.name })).slice(0, 8);
 settingsSave();
 if (!quiet) say(T("pin_moved", { name: hit.name }));
 if (BA.afterPin) replayAfterPin();
}
async function findCity(city, iso) {
 say(T("searching"));
 try {
  var n = await geoNom(city, "&countrycodes=" + iso.toLowerCase()), hit = (geoTown(n, city) || [])[0];
  if (!hit) { var r = await geoFind([city + ", " + regionName(iso, "en")]); hit = r && r.hit }
  if (!hit) { beep("error"); say(T("pin_fail")); return }
  hit.name = city; beep("select"); pinTo(hit);
 } catch (e) { beep("error"); say(T("pin_fail")) }
}
function myLocation() {
 if (!navigator.geolocation) { say(T("loc_fail")); return }
 say(T("searching"));
 navigator.geolocation.getCurrentPosition(function (p) {
  pinTo({ lat: p.coords.latitude, lon: p.coords.longitude, name: T("my_loc"), cls: "place", type: "suburb", bb: null }, true);
  setTimeout(function () { say(T("pin_moved", { name: placeName() })) }, 1800);
 }, function () { beep("error"); say(T("loc_fail")) }, { timeout: 15000, maximumAge: 600000 });
}

/* ---------- "how is the climate here over the last N years?" ---------- */
/* Measurements from NASA POWER monthly data at the pin, as plain English sentences (they are the only facts the SI may use) */
function climateFacts(rows, N) {
 var bk = window.anBreak ? anBreak(rows) : null, caution = null;
 if (bk) rows = rows.filter(function (r) { return r.y >= bk.y });
 var by = {}; rows.forEach(function (r) { (by[r.y] = by[r.y] || []).push(r) });
 var full = Object.keys(by).map(Number).filter(function (y) { return by[y].filter(function (r) { return r.t !== null }).length === 12 }).sort(function (p, q) { return p - q });
 if (full.length < 5) return [];
 var lastY = full[full.length - 1], y0 = Math.max(full[0], lastY - N + 1), win = full.filter(function (y) { return y >= y0 });
 if (bk && window.anBreakText) caution = anBreakText(bk, lastY);
 /* the normal to compare with: 1981-2010, or (after a jump in the record) the usable years before the period asked about */
 var B0 = bk ? bk.y : 1981, B1 = bk ? y0 - 1 : 2010, base = full.filter(function (y) { return y >= B0 && y <= B1 }), hasBase = base.length >= 8, BL = B0 + "-" + B1, longOK = full.length >= 15;
 var ann = function (k, y) { return anMean(by[y].map(function (r) { return r[k] })) };
 var f1 = function (v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : v.toFixed(d === undefined ? 1 : d) };
 var sg = function (v, d) { return (v > 0 ? "+" : "") + f1(v, d) };
 var out = ["Period described: " + y0 + " to " + lastY + " (the last " + win.length + " complete years" + (win.length < N ? " that can be used; " + N + " were asked for" : "") + " in NASA's record; " + (lastY + 1) + " is not complete yet). Source: NASA POWER monthly data (MERRA-2 reanalysis) at the pin."];
 if (caution) out.push("Data caution: " + caution);
 var tW = anMean(win.map(function (y) { return ann("t", y) })), tB = hasBase ? anMean(base.map(function (y) { return ann("t", y) })) : null;
 if (tW !== null) out.push("Average air temperature in " + y0 + "-" + lastY + ": " + f1(tW) + " °C" + (tB !== null ? ", " + sg(tW - tB, 2) + " °C compared with the " + BL + " average of " + f1(tB) + " °C." : "."));
 var trW = anTrend(win, win.map(function (y) { return ann("t", y) }));
 if (trW) out.push("Temperature trend within " + y0 + "-" + lastY + ": " + sg(trW.slope * 10, 2) + " °C per decade, " + (trW.sig ? "a clear trend (95% confidence)" : "not statistically clear over so few years") + ".");
 var trL = longOK ? anTrend(full, full.map(function (y) { return ann("t", y) })) : null;
 if (trL) out.push("Long-term temperature trend " + trL.from + "-" + trL.to + ": " + sg(trL.slope * 10, 2) + " °C per decade, " + (trL.sig ? "a clear trend (95% confidence)" : "not statistically clear") + ".");
 var ty = win.map(function (y) { return [y, ann("t", y)] }).filter(function (p) { return p[1] !== null }).sort(function (p, q) { return q[1] - p[1] });
 if (ty.length > 2) out.push("Warmest year in the period: " + ty[0][0] + " (" + f1(ty[0][1]) + " °C); coolest: " + ty[ty.length - 1][0] + " (" + f1(ty[ty.length - 1][1]) + " °C).");
 var xW = anMean(win.map(function (y) { return ann("tx", y) })), xB = hasBase ? anMean(base.map(function (y) { return ann("tx", y) })) : null;
 if (xW !== null) out.push("Average daily maximum temperature in the period: " + f1(xW) + " °C" + (xB !== null ? " (" + sg(xW - xB, 2) + " °C compared with " + BL + ")." : "."));
 var cl = [], sd = [];
 for (var m = 1; m <= 12; m++) { var v = rows.filter(function (r) { return r.m === m && r.y >= B0 && r.y <= B1 && r.t !== null }).map(function (r) { return r.t }), mu = anMean(v); cl[m] = mu; sd[m] = v.length > 2 ? Math.sqrt(anMean(v.map(function (x) { return (x - mu) * (x - mu) }))) : null }
 if (hasBase) {
  var rec = rows.filter(function (r) { return r.y >= y0 && r.y <= lastY && r.t !== null && sd[r.m] }), bas = rows.filter(function (r) { return r.y >= B0 && r.y <= B1 && r.t !== null && sd[r.m] });
  if (rec.length >= 24 && bas.length >= 96) {
   var hot = rec.filter(function (r) { return (r.t - cl[r.m]) / sd[r.m] > 1 }).length / rec.length * 100, hb = bas.filter(function (r) { return (r.t - cl[r.m]) / sd[r.m] > 1 }).length / bas.length * 100;
   out.push("Unusually hot months (more than one standard deviation above that month's " + BL + " normal): " + Math.round(hot) + "% of months in the period, compared with " + Math.round(hb) + "% in " + BL + ".");
  }
 }
 var pY = function (y) { var a = by[y].map(function (r) { return r.pr }).filter(function (v) { return v !== null }); return a.length === 12 ? anMean(a) * 365.25 : null };
 var pW = anMean(win.map(pY)), pB = hasBase ? anMean(base.map(pY)) : null;
 if (pW !== null) {
  var py = win.map(function (y) { return [y, pY(y)] }).filter(function (p) { return p[1] !== null }).sort(function (p, q) { return q[1] - p[1] });
  out.push("Yearly rainfall in the period averaged about " + Math.round(pW) + " mm" + (pB ? ", " + sg((pW - pB) / pB * 100, 0) + "% compared with the " + BL + " normal of about " + Math.round(pB) + " mm." : ".") + (py.length > 2 ? " Wettest year: " + py[0][0] + " (" + Math.round(py[0][1]) + " mm); driest: " + py[py.length - 1][0] + " (" + Math.round(py[py.length - 1][1]) + " mm)." : ""));
 }
 var trP = longOK ? anTrend(full, full.map(pY)) : null;
 if (trP) out.push("Long-term rainfall trend " + trP.from + "-" + trP.to + ": " + sg(trP.slope * 10, 0) + " mm per decade, " + (trP.sig ? "a clear trend (95% confidence)" : "not statistically clear") + ".");
 var hW = anMean(win.map(function (y) { return ann("rh", y) })), hB = hasBase ? anMean(base.map(function (y) { return ann("rh", y) })) : null;
 if (hW !== null) out.push("Average relative humidity in the period: " + Math.round(hW) + "%" + (hB !== null ? " (" + BL + ": " + Math.round(hB) + "%)." : "."));
 var lm = rows.filter(function (r) { return r.t !== null }).slice(-1)[0];
 if (lm && hasBase && cl[lm.m] !== null && cl[lm.m] !== undefined) out.push("Latest month in the record: " + ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][lm.m - 1] + " " + lm.y + ", " + f1(lm.t) + " °C (" + sg(lm.t - cl[lm.m], 1) + " °C compared with that month's " + BL + " average).");
 return out;
}
/* read NASA's record at the pin, then the SI explains it in the user's language (1 request); without the SI the numbers are read out directly */
var POWC = {};
function powerRows(lat, lon) { var k = lat.toFixed(3) + "," + lon.toFixed(3), c = POWC[k]; if (c && Date.now() - c.t < 6e5) return c.p; var p = anPowerRows(lat, lon); POWC[k] = { t: Date.now(), p: p }; p.catch(function () { delete POWC[k] }); return p }
async function climateFlow(years, q, req) {
 years = Math.max(3, Math.min(40, +years || 10));
 if (!window.pinLL) { say(T("an_nopin")); return }
 var lat = pinLL[0], lon = pinLL[1], place = placeName();
 say(T("climate_wait"), { keep: true });
 var rows = null, t0 = Date.now(); try { rows = await powerRows(lat, lon) } catch (e) {}
 if (req && req !== BA.reqTok) return;
 var facts = rows ? climateFacts(rows, years) : [];
 if (!facts.length) { beep("error"); await sayP(T("climate_fail")); return }
 if (aiUsed() < AI.cap) {
  try {
   var res = await fetch(ASSISTANT_URL || "api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q || ("How is the climate here, and how has it changed over the last " + years + " years?"), ba: true, mode: BA.method, lang: BA.siLang(), vid: ejVid(), place: place, context: "Place: " + place, facts: facts }) }), j = null;
   try { j = await res.json() } catch (e) {}
   if (req && req !== BA.reqTok) return;
   try { console.info("[Blind assistance] climate: NASA record " + ((Date.now() - t0) / 1000).toFixed(1) + " s" + (j && j.model ? ", SI " + j.model + " " + (j.ms / 1000).toFixed(1) + " s" : "")) } catch (e) {}
   if (res.ok && j && j.answer && !(j.actions && j.actions.length)) { aiCount(); show("a", j.answer); await sayP(j.answer, { lang: siVoice() }); return }
  } catch (e) {}
 }
 var plain = facts.slice(1, 8).join(" ");
 show("a", plain); await sayP(plain, { lang: "en" });
}

/* ---------- analytics ---------- */
function analyticsFlow() {
 if (!window.pinLL) { say(T("an_nopin")); return }
 if (anLeft() <= 0) { say(T("an_none")); return }
 yesno(T("an_q", { place: placeName(), n: anLeft() }), async function () {
  say(T("an_wait")); var t0 = Date.now();
  try { await anRun() } catch (e) {}
  var r = anList()[0];
  if (!r || new Date(r.time).getTime() < t0 - 2000) { beep("error"); say(T("an_fail")); return }
  readAnalysis(r);
 }, function () { say(T("cancel")) });
}
function readAnalysis(r) {
 var rep = r.report, items = [], j2 = function (x, y) { x = String(x || "").trim(); return x ? x.replace(/[.。．!?！？]+$/, "") + ". " + y : y }, add = function (head, body) { var s = j2(head, body); items.push({ label: s.length > 90 ? s.slice(0, 88) + "…" : s, say: s, act: function () { say(s) } }) };
 var vk = { degrading: "v_degrading", improving: "v_improving", stable: "v_stable", mixed: "v_mixed", "insufficient data": "v_insufficient" }[(rep && rep.verdict) || r.verdict];
 add(T("a_verdict"), rep && rep.headline ? j2(vk ? T(vk) : "", rep.headline) : (vk ? T(vk) : ""));
 if (rep) {
  if (rep.summary) add(T("a_summary"), rep.summary);
  (rep.findings || []).forEach(function (f) { add(T("a_find"), j2(f.title, f.detail)) });
  if (rep.regional_context) add(T("a_region"), rep.regional_context);
  (rep.actions || []).forEach(function (x) { add(T("a_act"), j2(x.action, x.why)) });
  if (rep.caveats && rep.caveats.length) add(T("a_limits"), rep.caveats.join(" "));
 } else { if (r.note) add(T("a_summary"), r.note); (r.facts || []).forEach(function (f) { add(f.name, f.text) }) }
 panelOpen({ title: T("m_an"), intro: T("an_done"), items: items, onBack: function () { mainMenu() } });
}

/* ---------- typed and spoken requests ---------- */
function norm(s) { return String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim() }
var POLITE = /^(please|pls|plz|ok|okay|now|hey|si|jukebox)\s+|\s+(please|pls|now|thanks|thank you)$/g;
function localCmd(q) {
 var n = norm(q).replace(POLITE, "").replace(POLITE, "").trim(); if (!n) return null;
 var tables = [CMD_EN]; Object.keys(STR).forEach(function (k) { if (STR[k].cmd) tables.push(STR[k].cmd) });
 for (var t = 0; t < tables.length; t++) for (var k in tables[t]) { var list = tables[t][k]; for (var i = 0; i < list.length; i++) if (norm(list[i]) === n) return k }
 return null;
}
/* "play ozone for the whole timeline" (English) without the SI, when it is clear */
var MODEKW = [[/\bozone\b|\bo3\b/, "g:o3"], [/\bnox\b|nitrogen (di)?oxides?|\bno2\b/, "g:nox"], [/carbon monoxide/, "g:co"], [/pm ?2 ?5|particulate|fine particles/, "g:pm25"], [/vegetation|\bndvi\b|greenness/, "g:ndvi"],
 [/humidity/, "g:q2m"], [/\bwind\b/, "g:wind"], [/\bfires?\b|wildfires?/, "g:fires"], [/(rain|rainfall|precipitation) (compared|anomal|versus|vs)/, "g:rainvar"], [/\brain\b|\brainfall\b|precipitation/, "g:rain"],
 [/sea level|altimetry/, "n:sea"], [/visible earth|true colou?r/, "vis"]];
function lastYears(q) {
 var n = norm(q), w = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, forty: 40 };
 if (/\b(last|past|previous) decade\b/.test(n)) return 10;
 var m = n.match(/\b(?:last|past|previous)\s+(\d{1,2}|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty)\s+years?\b/);
 return m ? (w[m[1]] || +m[1]) : null;
}
/* "climate" and "weather" in the fully translated languages (word stems, so any spelling or ending matches) */
var CLIMATE_RE = /climate|weather|জলবা|আবহাও|जलवायु|मौसम|آب و ہوا|موسم|مناخ|طقس|الجو |clima|climat|météo|meteo|klima|wetter|климат|погод|气候|氣候|天气|天氣|気候|天気|기후|날씨|iklim|cuaca|hava durumu|havas[ıi]|khí hậu|thời tiết|ภูมิอากาศ|สภาพอากาศ|อากาศ|hali ya hewa|tabianchi/i;
/* "the last 5 years" in any language: digits in any script, a few number words, or "decade" */
var NUMW = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30,
 "তিন": 3, "পাঁচ": 5, "দশ": 10, "পনেরো": 15, "বিশ": 20, "तीन": 3, "पाँच": 5, "पांच": 5, "दस": 10, "बीस": 20, "تین": 3, "پانچ": 5, "دس": 10, "بیس": 20,
 "ثلاث": 3, "خمس": 5, "عشر": 10, "عشرين": 20, "tres": 3, "três": 3, "cinco": 5, "diez": 10, "dez": 10, "veinte": 20, "vinte": 20, "trois": 3, "cinq": 5, "dix": 10, "vingt": 20,
 "drei": 3, "fünf": 5, "zehn": 10, "zwanzig": 20, "cinque": 5, "dieci": 10, "venti": 20, "три": 3, "пять": 5, "десять": 10, "двадцать": 20, "三": 3, "五": 5, "十": 10, "二十": 20,
 "lima": 5, "sepuluh": 10, "üç": 3, "beş": 5, "on": 10, "yirmi": 20, "ba": 3, "mười": 10, "สาม": 3, "ห้า": 5, "สิบ": 10, "tatu": 3, "tano": 5, "kumi": 10 };
var YEARW = "years?|yrs|বছর|সাল|साल|वर्ष|برس|سال|سنوات|سنين|سنة|عام|años|anos|ans|années|jahre?n?|anni|лет|года?|年|년|tahun|yıl|năm|ปี|miaka";
function yearsML(q) {
 var s = String(q || "").toLowerCase().replace(/[\u09e6-\u09ef\u0966-\u096f\u0660-\u0669\u06f0-\u06f9\u0e50-\u0e59\uff10-\uff19]/g, function (c) { var k = c.charCodeAt(0); return String(k - [0x09e6, 0x0966, 0x0660, 0x06f0, 0x0e50, 0xff10].filter(function (b) { return k >= b && k <= b + 9 })[0]) });
 if (/decade|দশক|दशक|عقد|década|décennie|jahrzehnt|decennio|десятилет|dekade|thập kỷ|ทศวรรษ|muongo/.test(s)) return 10;
 var test = function (w) { if (/^\d+$/.test(w)) return +w >= 2 && +w <= 45 ? +w : null; if (NUMW[w]) return NUMW[w]; var t = w.replace(/^(ال|في|of)/, ""); if (NUMW[t]) return NUMW[t]; var e = Object.keys(NUMW).filter(function (k) { return /[\u3400-\u9fff]/.test(k) && w.slice(-k.length) === k }).sort(function (x, y) { return y.length - x.length })[0]; return e ? NUMW[e] : null };
 var forms = [new RegExp("(\\d{1,2}|[^\\s\\d]{1,9})\\s*(?:" + YEARW + ")", "g"), new RegExp("(?:" + YEARW + ")\\s*(\\d{1,2}|[^\\s\\d]{1,9})", "g")];
 for (var f = 0; f < 2; f++) { var re = forms[f], m; while ((m = re.exec(s))) { var v = test(m[1]); if (v) return v } }
 return null;
}
var MODEKW_CAT = [[/carbon dioxide|\bco2\b/, /carbon dioxide|co₂|\bco2\b/i], [/methane|\bch4\b/, /methane|ch₄|\bch4\b/i], [/nitrogen dioxide/, /nitrogen dioxide|no₂|\bno2\b/i]];
function modeIntent(q, anyPlace) {
 var n = norm(q);
 if (!/\b(play|hear|listen|start|switch to|put on|give me|let me hear|i want to hear|i would like to hear|id like to hear)\b/.test(n)) return null;
 if (/^(what|why|how|when|which|does|is|are|explain|tell me)\b/.test(n)) return null;
 var hits = MODEKW.filter(function (m) { return m[0].test(n) });
 if (/sea surface temperature|ocean temperature|\bsst\b/.test(n)) hits = [[0, /over the years|decades?|since|long term|history|(?:last|past|previous) \S+ years?/.test(n) ? "n:sst" : "g:sst"]];
 else if (/temperature/.test(n) && !hits.length) hits = [[0, /over the years|decades?|since|long term|history|climate|(?:last|past|previous) \S+ years?/.test(n) ? "n:air" : "g:t2m"]];
 var cat = catalog();
 if (!hits.length) MODEKW_CAT.forEach(function (k) { if (k[0].test(n)) { var c = cat.filter(function (z) { return k[1].test(z.name) })[0]; if (c) hits.push([0, c.id]) } });
 if (hits.length !== 1) return null;
 var id = hits[0][1]; if (!cat.some(function (c) { return c.id === id })) return null;
 /* a place in the same sentence ("... for Dhaka") is left to the SI, which can move the pin first */
 var n2 = n.replace(/\b(?:for|over)\s+(?:the\s+)?(?:entire|whole|full)\s+timeline\b/g, "").replace(/\bover\s+the\s+years\b/g, "").replace(/\b(?:for|over|in|during)\s+the\s+(?:last|past|previous)\s+\S+(?:\s+years?)?\b/g, "").replace(/\b(?:for|in|at)\s+(?:my\s+pin|here|this\s+place)\b/g, "");
 var kwRe = null; MODEKW.concat(MODEKW_CAT).concat([[/sea surface temperature|ocean temperature|\bsst\b|temperature/]]).some(function (k) { if (k[0].test(n2)) { kwRe = k[0]; return true } return false });
 var km = kwRe ? n2.match(kwRe) : null, after = km ? n2.slice(n2.indexOf(km[0]) + km[0].length) : "";
 if (!anyPlace && /\b(?:for|in|at|near|around)\s+(?!the\b|a\b|an\b|loop\b|repeat\b)[a-z\u00c0-\uffff]/.test(after)) return null;
 var o = { id: id, loop: /\b(loop|repeat|on repeat)\b/.test(n) }, m = n.match(/\b(\d{4})\s*(?:to|until|till|through)\s*(\d{4})\b/), ly = lastYears(q);
 if (m) { o.y1 = +m[1]; o.y2 = +m[2] } else if ((m = n.match(/\bsince\s+(\d{4})\b/))) o.y1 = +m[1]; else if (ly) { o.y1 = new Date().getFullYear() - ly; o.y2 = new Date().getFullYear() }
 return o;
}
/* "put my pin on X" in other languages: take away the pin word and the words around the place, then look up what is left (still free).
   Returns a few spellings to try, best first; if none is found exactly, the request goes to the SI. */
function pinIntentML(q) {
 var k = BA.lang, pw = STR[k] && STR[k].pin; if (!pw) return null;
 var nf = function (x) { x = String(x || ""); try { x = x.normalize("NFC") } catch (e) {} return x.toLowerCase() };
 var s = nf(q), nouns = pw.nouns.map(nf), fill = (pw.fill || []).map(nf), suf = (pw.suffix || []).map(nf);
 if (!nouns.some(function (w) { return s.indexOf(w) >= 0 })) return null;
 var esc = function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }, out = [];
 if (/^(zh|ja|th)$/.test(k)) {
  var r = s; nouns.concat(fill).sort(function (a, b) { return b.length - a.length }).forEach(function (w) { r = r.split(w).join(" ") });
  r = r.replace(/[.!?。！？、，,]/g, " ").replace(/\s+/g, " ").trim(); return r.length >= 2 ? [r] : null;
 }
 var r2 = " " + s.replace(/[.!?¿¡,،؟।]/g, " ") + " ";
 nouns.concat(fill.filter(function (w) { return w.indexOf(" ") > 0 })).sort(function (a, b) { return b.length - a.length }).forEach(function (w) { r2 = r2.replace(new RegExp("(^|\\s)" + esc(w) + "(?=\\s|$)", "g"), "$1 ") });
 var t = r2.trim().split(/\s+/).filter(Boolean), lead = "";
 while (t.length && fill.indexOf(t[0]) >= 0) lead = t.shift();
 while (t.length && fill.indexOf(t[t.length - 1]) >= 0) t.pop();
 if (!t.length) return null;
 var base = t.join(" ");
 if (lead && /^(la|le|el|il|lo|les|los|las|the|o|a|l)$/.test(lead)) out.push(lead + " " + base);
 out.push(base);
 suf.forEach(function (sf) { var last = t[t.length - 1]; if (last.length > sf.length + 1 && last.slice(-sf.length) === sf) out.push(t.slice(0, -1).concat(last.slice(0, -sf.length)).join(" ")) });
 return out.filter(function (x, i) { return x.length >= 2 && out.indexOf(x) === i }).slice(0, 4);
}
function show(who, t) { try { return aiMsg(who, "", aiFormat(t)) } catch (e) { return null } }
async function runActions(acts, req, q) {
 BA.askWhich = false;
 var ly = q ? (lastYears(q) || yearsML(q)) : null, cy = new Date().getFullYear();
 /* a climate question where the SI only moved the pin: describe the climate there too */
 var pinOnly = acts.some(function (x) { return x.type === "pin" }) && !acts.some(function (x) { return /^(climate|play|analytics|control|language)$/.test(x.type) });
 if (q && pinOnly && wantsPlay(q)) { var mg = modeIntent(q, true); if (mg) { acts = acts.concat([{ type: "play", mode_id: mg.id, from_year: mg.y1, to_year: mg.y2, loop: mg.loop }]); pinOnly = false } else BA.askWhich = true }
 if (q && pinOnly && !BA.askWhich && CLIMATE_RE.test(q)) acts = acts.concat([{ type: "climate", years: ly || 10 }]);
 for (var i = 0; i < acts.length; i++) {
  if (req && req !== BA.reqTok) return;
  var x = acts[i];
  if (x.type === "play" && ly && !x.from_year) { x.from_year = cy - ly; x.to_year = cy }
  if (x.type === "climate") { await climateFlow(x.years || ly || 10, q, req); continue }
  if (x.type === "pin") {
   var r = null; try { r = await geoFind([x.query].concat(x.alternatives || [])) } catch (e) {}
   if (req && req !== BA.reqTok) return;
   if (r && r.hit) { pinTo(r.hit, true); var d = show("a", ""); if (d) geoReport(d, r); var nx = acts[i + 1], said = r.exact || r.road ? T("pin_moved", { name: r.hit.name }) : T("pin_area", { name: r.hit.name }); if (nx && (nx.type === "play" || nx.type === "climate")) say(said); else await sayP(said) }
   else { beep("error"); await sayP(T("pin_fail")) }
   if (BA.askWhich && i === acts.length - 1) { BA.askWhich = false; say(T("which_mode")) }
  } else if (x.type === "play") { await baPlay(x.mode_id, { y1: x.from_year, y2: x.to_year, loop: x.loop }) }
  else if (x.type === "control") control(x.action);
  else if (x.type === "analytics") analyticsFlow();
  else if (x.type === "language") { var want = String(x.language).toLowerCase(), l = LANGS.filter(function (z) { return z[1].toLowerCase() === want || z[2].toLowerCase() === want || z[0] === want })[0]; if (l) setLang(l[0], function () { say(T("lang_set", { name: STR[l[0]] ? l[2] : l[1] })) }) }
 }
}
function doCmd(k) {
 if (k === "yes" || k === "no") { if (YN) ynAnswer(k === "yes"); return }
 if (k === "again") { repeatLast(); return }
 if (k === "help") { helpMenu(); return }
 if (k === "menu") { mainMenu(); return }
 if (k === "analytics") { analyticsFlow(); return }
 if (k === "status") { say(statusText()); return }
 control(k === "loop_on" || k === "loop_off" || k === "louder" || k === "quieter" || k === "faster" || k === "slower" || k === "stop" || k === "pause" || k === "resume" || k === "clouds_on" || k === "clouds_off" ? k : k === "map_view" ? "map_view" : k === "globe_view" ? "globe_view" : k);
}
/* ---------- Compare (compare.js): one place, two years ---------- */
BA.cmp = { place: null, y1: null, y2: null };
function cmpX() { return window.CMPX || null }
function cmpActive() { var X = cmpX(); return !!(X && X.isOpen() && X.C.data) }
function cmpPin() { if (!window.pinLL) return null; var nm = placeName() || ""; return { name: nm || (pinLL[0].toFixed(2) + ", " + pinLL[1].toFixed(2)), full: nm, lat: pinLL[0], lon: pinLL[1], cls: "place", type: "locality", bb: null, src: "pin" } }
function cmpPlace() { return BA.cmp.place }
function cmpY2() { return BA.cmp.y2 }
function cmpMenu(idx, intro) {
 var X = cmpX(); if (!X) { say(T("load_fail")); return }
 var pl = cmpPlace();
 panelOpen({ title: T("cm_title"), index: idx || 0, intro: intro, onBack: function () { mainMenu() }, items: [
  { label: T("cm_place", { v: pl ? pl.name : T("cm_sel") }), d: "d_cm_place", act: cmpSearch },
  { label: T("cm_y1", { v: BA.cmp.y1 || T("cm_sel") }), d: "d_cm_year", act: function () { cmpDecades("y1") } },
  { label: T("cm_y2", { v: cmpY2() || T("cm_sel") }), d: "d_cm_year", act: function () { cmpDecades("y2") } },
  { label: T("cm_go"), d: "d_cm_go", act: cmpRun },
  { label: T("cm_close"), d: "d_cm_close", act: cmpClose }] });
}
/* the After year can only be later than the Before year, and the Before year only earlier than the After year */
function cmpRange(which) { var X = cmpX(), lo = X.FIRSTY, hi = X.LASTY; if (which === "y2" && BA.cmp.y1) lo = BA.cmp.y1 + 1; if (which === "y1" && BA.cmp.y2) hi = BA.cmp.y2 - 1; return [lo, hi] }
function cmpDecades(which) {
 var rg = cmpRange(which), items = [], set = (which === "y1" ? BA.cmp.y1 : cmpY2()), idx0 = 0;
 for (var d = Math.floor(rg[0] / 10) * 10; d <= rg[1]; d += 10) (function (d) { if (set && set >= d && set < d + 10) idx0 = items.length; items.push({ label: T("cm_decade", { v: d }), d: "d_cm_decade", act: function () { cmpYears(which, d) } }) })(d);
 if (!items.length) { beep("error"); say(T("cm_same")); return }
 if (!set) idx0 = which === "y1" ? Math.min(items.length - 1, Math.max(0, Math.floor((1990 - Math.floor(rg[0] / 10) * 10) / 10))) : items.length - 1;
 panelOpen({ title: T(which === "y1" ? "cm_y1" : "cm_y2", { v: set || T("cm_sel") }), items: items, index: idx0, onBack: function () { cmpMenu(which === "y1" ? 1 : 2) } });
}
function cmpYears(which, d) {
 var rg = cmpRange(which), items = [], cur = (which === "y1" ? BA.cmp.y1 : cmpY2()) || 0;
 for (var y = Math.max(d, rg[0]); y < d + 10 && y <= rg[1]; y++) (function (y) { items.push({ label: String(y), d: "d_cm_year", act: function () { if (which === "y1") BA.cmp.y1 = y; else BA.cmp.y2 = y; beep("select"); cmpMenu(which === "y1" ? 1 : 2, T("saved")) } }) })(y);
 var first = Math.max(d, rg[0]);
 panelOpen({ title: T("cm_decade", { v: d }), items: items, index: cur >= first && cur < d + 10 ? cur - first : 0, onBack: function () { cmpDecades(which) } });
}
var cmpST = 0, cmpSTok = 0;
function cmpSearch() {
 var pin = cmpPin(), pinItem = pin ? [{ label: T("cm_pin", { v: pin.name }), d: "d_cm_place", act: function () { BA.cmp.place = pin; beep("select"); cmpMenu(0, T("saved")) } }] : [];
 panelOpen({ title: T("cm_title") + ": " + T("m_place"), items: pinItem, search: true, quiet: true, onBack: function () { cmpMenu(0) } });
 P.searchFn = function (q) {
  clearTimeout(cmpST); var tk = ++cmpSTok; q = String(q || "").trim();
  if (q.length < 2) { P.items = pinItem; P.i = 0; panelRender(); return }
  cmpST = setTimeout(function () { look(q, false) }, 550);
 };
 /* Enter with nothing found yet: a full search (OpenStreetMap Nominatim) */
 P.searchEnter = function (q) { q = String(q || "").trim(); if (q.length < 2) { say(T("cm_find")); return } clearTimeout(cmpST); say(T("searching")); look(q, true, ++cmpSTok) };
 async function look(q, full, tk0) {
  var tk = tk0 || cmpSTok, list = []; try { list = await cmpX().findPlaces(q, full) } catch (e) {}
  if (tk !== cmpSTok || !P.open || !P.searchFn) return;
  if (!full && list.searchFailed) { look(q, true, tk); return }
  P.items = list.map(function (x) { var rest = String(x.full || "").split(",").slice(1, 3).join(",").trim(), lab = x.name + (rest ? ", " + rest : "");
   return { label: lab, d: "d_cm_place", act: function () { BA.cmp.place = x; beep("select"); cmpMenu(0, T("saved")) } } });
  P.i = 0; panelRender(); if (!P.items.length) say(T("cm_nomatch")); else say(P.items[0].label + ". " + T("of", { i: 1, n: P.items.length }), { nolast: true });
 }
 var q = $("bapq"); q.value = ""; q.placeholder = T("cm_find"); q.hidden = false; setTimeout(function () { q.focus() }, 0); P.inSearch = true;
 say(T("cm_find"));
}
async function cmpRun() {
 var X = cmpX(), pl = cmpPlace(), y1 = BA.cmp.y1, y2 = cmpY2();
 if (!pl || !y1 || !y2) { beep("error"); say(T("cm_need")); return }
 if (y1 === y2) { say(T("cm_same")); return }
 if (y1 > y2) { var t = y1; y1 = y2; y2 = t; BA.cmp.y1 = y1; BA.cmp.y2 = y2 }
 var tk = ++BA.reqTok; panelClose(); X.open(true); X.pick(pl, true); X.setYears(y1, y2);
 say(T("cm_wait", { p: pl.name, b: y1, a: y2 }));
 var ok = false; try { ok = await X.setup() } catch (e) {}
 if (tk !== BA.reqTok) return;
 if (!ok || !X.C.data) { beep("error"); say(T("cm_fail"), { then: function () { cmpMenu(3) } }); return }
 beep("select"); cmpResults(0, T("cm_ready"));
}
function cmpLenText(ms) { var m = Math.round(ms / 60000); return m === 1 ? T("cm_min1") : m < 60 ? T("cm_min", { n: m }) : m === 60 ? T("cm_hour1") : T("cm_hours", { n: m / 60 }) }
function cmpResults(idx, intro) {
 var X = cmpX(), D = X.C.data; if (!D) { cmpMenu(); return }
 panelOpen({ title: T("cm_title") + ": " + D.place.name + ", " + D.y1 + " / " + D.y2, index: idx || 0, intro: intro, onBack: function () { cmpMenu(3) }, items: [
  { label: T("cm_sum"), d: "d_cm_sum", act: function () { say(cmpSummary()) } },
  { label: T("cm_pb", { v: D.y1 }), d: "d_cm_play", act: function () { cmpPlay("b") } },
  { label: T("cm_pa", { v: D.y2 }), d: "d_cm_play", act: function () { cmpPlay("a") } },
  { label: T("cm_pd"), d: "d_cm_pd", act: function () { cmpPlay("d") } },
  { label: T("cm_len", { v: cmpLenText(X.C.len) }), d: "d_cm_len", act: cmpLen },
  { label: T("cm_ov"), d: "d_cm_ov", act: function () { cmpOvMenu() } },
  { label: T("cm_deep"), d: "d_cm_deep", act: function () { cmpDeepMenu() } },
  { label: T("cm_pdf"), d: "d_cm_pdf", act: cmpPdf },
  { label: T("cm_aplay"), d: "d_cm_aplay", act: cmpAudioPlay }, { label: T("cm_adl"), d: "d_cm_adl", act: cmpAudioDl },
  { label: T("cm_aex"), d: "d_cm_aex", act: function () { if (!window.EJA || !EJA.example) { say(T("load_fail")); return } var a = document.querySelector("#cmpaudbox audio"); if (a && !a.paused) { a.pause(); beep("done"); return } stopSpeech(); a = a || EJA.example(); if (a) a.play().catch(function () { beep("error"); say(T("load_fail")) }) } },
  { label: T("cm_lib"), d: "d_cm_lib", act: cmpLib },
  { label: T("cm_demo"), d: "d_cm_demo", act: async function () { if (!window.EJL) return; say(T("cm_demo")); try { await EJL.load("r45i84e-1980-2020"); beep("done"); say(T("cm_demo_ok")) } catch (e) { beep("error"); say(T("cm_lib_none")) } } },
  { label: T("cm_si"), d: "d_cm_si", act: async function () { if (!window.EJSI) return; say(T("cm_si_wait")); var R = await EJSI.learn(); if (!R) { beep("error"); say(T("cm_si_fail")); return } beep("done"); say(EJSI.summary(R)) } },
  { label: T("cm_siplay"), d: "d_cm_siplay", act: function () { if (!window.EJSI || !EJSI.last()) { say(T("cm_si")); return } EJSI.play() } },
  { label: T("cm_ev"), d: "d_cm_ev", act: async function () { if (!window.EJEV) return; say(T("cm_ev_wait")); var R = await EJEV.analyse(); if (!R) { beep("error"); say(T("cm_ev_fail")); return } beep("done"); say(EJEV.summary(R)) } },
  { label: T("cm_evplay"), d: "d_cm_evplay", act: function () { var R = window.EJEV && EJEV.last(); if (!R) { say(T("cm_ev")); return } EJEV.play(R) } },
  { label: T("cm_evpdf"), d: "d_cm_evpdf", act: async function () { var R = window.EJEV && EJEV.last(); if (!R) { say(T("cm_ev")); return } var d = await EJEV.makePdf(R); d.save(EJEV.fname(R) + ".pdf"); beep("done") } },
  { label: T("cm_new"), d: "d_cm_new", act: function () { X.stop(); cmpMenu(0) } },
  { label: T("cm_close"), d: "d_cm_close", act: cmpClose }] });
}
function cmpName(k) { var D = cmpX().C.data; return k === "b" ? D.y1 : k === "a" ? D.y2 : T("cm_diff") }
function cmpPlay(k) {
 var X = cmpX(), st = X.playState();
 if (st && st.k === k && st.on) { X.toggle(k); say(T("paused")); return }
 BA.cmpK = k; stopSpeech(true); X.toggle(k); say(T("cm_playing", { v: cmpName(k) }));
}
function cmpControl(a) {
 var X = cmpX(), st = X.playState();
 if (a === "stop") { X.stop(); say(T("stopped")); return }
 if (a === "pause" || (st && st.on)) { if (st && st.on) X.toggle(st.k); say(T("paused")); return }
 cmpPlay(st ? st.k : BA.cmpK || "b");
}
window.onCompareEnd = function () { if (BA.on) say(T("cm_end")) };
function cmpLen() {
 var X = cmpX(), opts = [1, 2, 5, 10, 30, 60, 120], cur = Math.round(X.C.len / 60000);
 panelOpen({ title: T("cm_len", { v: cmpLenText(X.C.len) }), index: Math.max(0, opts.indexOf(cur)), onBack: function () { cmpResults(4) }, items: opts.map(function (m) { return { label: cmpLenText(m * 60000), d: "d_cm_len", act: function () { X.setLenMs(m * 60000); beep("select"); cmpResults(4, T("saved")) } } }) });
}
function cmpOverview() {
 var X = cmpX();
 if (aiUsed() >= AI.cap) { beep("error"); say(T("credits_out")); return }
 yesno(T("cm_ov_q"), async function () {
  say(T("think")); var r = null; try { r = await X.overview(BA.siLang()) } catch (e) {}
  if (r && r.ok) { var txt = String(r.text).replace(/\*\*?/g, ""); show("a", txt); beep("done"); cmpOvMenu(0, T("cm_ov_ready")) }
  else { beep("error"); say(r && r.why === "limit" ? T("credits_out") : T("err_net")) }
 }, function () { say(T("cancel")) });
}
function cmpClose() { var X = cmpX(); if (X) { X.stop(); X.close(true) } mainMenu() }
function cmpRound(v, d) { return v === null || v === undefined || !isFinite(v) ? "?" : (+v).toFixed(d) }
function cmpSummary() {
 var D = cmpX().C.data, B = D.B.s, A = D.A.s, P = D.pics || {}, out = [];
 out.push(T("cm_s1", { p: D.place.name, a: D.y2, b: D.y1 }));
 if (D.over && D.over.verdict !== "none") out.push(T(D.over.verdict === "worse" ? "cm_ov_w" : D.over.verdict === "better" ? "cm_ov_b" : "cm_ov_s", { a: D.y2, b: D.y1 }));
 var dt = A.t - B.t; out.push(T("cm_s_t", { x: cmpRound(B.t, 1), y: cmpRound(A.t, 1), d: (dt > 0 ? "+" : "") + cmpRound(dt, 1) }));
 out.push(T("cm_s_r", { x: Math.round(B.rain), y: Math.round(A.rain) }));
 out.push(T("cm_s_h", { x: B.hotDays, y: A.hotDays }));
 if (P.b && P.a && P.b.water !== null && P.a.water !== null && P.b.water !== undefined && P.a.water !== undefined) { out.push(T("cm_s_w", { x: cmpRound(P.b.water * 100, 0), y: cmpRound(P.a.water * 100, 0) })); out.push(T("cm_s_v", { x: cmpRound(P.b.veg * 100, 0), y: cmpRound(P.a.veg * 100, 0) })) }
 [["b", D.y1], ["a", D.y2]].forEach(function (z) { if (!P[z[0]] || !P[z[0]].used || !P[z[0]].used.length) out.push(T("cm_s_nopic", { v: z[1] })) });
 if (D.src === "era5") out.push(D.y1 < 1981 ? T("cm_s_era1", { v: D.y1 }) : D.bk ? T("cm_s_era2", { v: D.bk.y }) : "");
 out.push(T("cm_s_note"));
 return out.filter(Boolean).join(" ");
}
/* "compare Dhaka 1990 and 2020", in any of the site's languages */
var CMP_RE = /compar|তুলনা|तुलना|موازن|مقارن|قارن|vergleich|confront|сравн|比较|比較|对比|對比|比べ|비교|bandingkan|banding|karşılaştır|so sánh|เปรียบเทียบ|linganisha/i;
var CMP_FILL = {}; ("and between with to vs versus in of the from year years please me for a an can you could would like i want y e et und и ve và dan na و في بين এবং ও আর সাল সালের সালে বছর বছরের করো করুন কর দেখাও শোনাও के और साल में से करो करें कीजिए کے اور سال میں سے کرو کریں و entre de del la le les des zwischen und von im tra fra di между и в год года годы と から まで の 和 与 年 및 와 과 년 antara tahun ile yıl yılları giữa năm và ระหว่าง และ ปี kati ya na mwaka miaka").split(" ").forEach(function (w) { CMP_FILL[w] = 1 });
function cmpDigits(s) { return String(s || "").replace(/[\u09e6-\u09ef\u0966-\u096f\u0660-\u0669\u06f0-\u06f9\u0e50-\u0e59\uff10-\uff19]/g, function (c) { var k = c.charCodeAt(0); return String(k - [0x09e6, 0x0966, 0x0660, 0x06f0, 0x0e50, 0xff10].filter(function (b) { return k >= b && k <= b + 9 })[0]) }) }
async function cmpIntent(q) {
 var X = cmpX(); if (!X) return false;
 var n = norm(q);
 /* while a comparison is open: short English commands */
 if (cmpActive()) {
  if (/\b(play|hear|listen)\b.*\bbefore\b|^before$/.test(n)) { cmpPlay("b"); return true }
  if (/\b(play|hear|listen)\b.*\bafter\b|^after$/.test(n)) { cmpPlay("a"); return true }
  if (/\b(play|hear|listen)\b.*\bdifference\b|^difference$/.test(n)) { cmpPlay("d"); return true }
  if (/\bsummary\b|\bsummari[sz]e\b/.test(n)) { say(cmpSummary()); return true }
  if (/\b(si|ai) overview\b|\boverview\b|\bessay\b/.test(n)) { cmpOvMenu(); return true }
  if (/\bpdf\b|\breport\b/.test(n)) { cmpPdf(); return true }
  if (/\b(close|exit|leave|quit)\b.*\bcompar/.test(n)) { cmpClose(); return true }
 }
 if (!CMP_RE.test(q)) return false;
 var s = cmpDigits(q), ys = (s.match(/(?:^|\D)(19[4-9]\d|20[0-9]\d)(?!\d)/g) || []).map(function (v) { return +v.replace(/\D/g, "") }).filter(function (v) { return v >= X.FIRSTY && v <= X.LASTY });
 var rest = s.replace(/(19[4-9]\d|20[0-9]\d)\s*(年|년)/g, " $1 ").replace(/(19[4-9]\d|20[0-9]\d)/g, " $1 ").replace(/\b(compar|vergleich|confront|сравн|bandingkan|banding|karşılaştır|linganisha)\S*/gi, " ").replace(new RegExp(CMP_RE.source, "gi"), " ").replace(/(?:^|\D)(19[4-9]\d|20[0-9]\d)(?!\d)/g, " ").replace(/[^\p{L}\p{M}\p{N}\s,'-]/gu, " ").split(/\s+/).filter(function (w) { return w && !CMP_RE.test(w) && !CMP_FILL[w.toLowerCase()] && !/^\d+$/.test(w) }).join(" ").replace(/^[,\s]+|[,\s]+$/g, "");
 if (!cmpActive()) BA.cmp = { place: null, y1: null, y2: null };
 if (ys.length >= 2) { BA.cmp.y1 = Math.min(ys[0], ys[1]); BA.cmp.y2 = Math.max(ys[0], ys[1]) } else if (ys.length === 1) { BA.cmp.y1 = ys[0]; BA.cmp.y2 = X.LASTY }
 if (rest.length >= 2 && !/^(it|this|here|there|my pin|pin|এটা|এখানে)$/i.test(rest)) {
  say(T("searching")); var hit = null;
  try { var list = await X.findPlaces(rest, true); hit = list[0] || null; if (!hit) { var r = await geoFind([rest]); hit = r && r.hit } } catch (e) {}
  if (!hit) { beep("error"); say(T("cm_nomatch")); cmpMenu(0); return true }
  BA.cmp.place = hit;
 }
 if (!BA.cmp.place && ys.length && cmpPin()) BA.cmp.place = cmpPin();
 if (ys.length && BA.cmp.place) cmpRun(); else cmpMenu(0);
 return true;
}
/* ---------- examples, accuracy and "why it sounds like this" (research.js: window.EJR) ---------- */
function RJ() { return window.EJR || null }
function num(v) { var n = +v; if (!isFinite(n)) return String(v); try { return n.toLocaleString(langTag(), { maximumFractionDigits: 3 }) } catch (e) { return String(n) } }
function exMenu(idx) {
 var E = RJ(); if (!E) { say(T("load_fail")); return }
 panelOpen({ title: T("m_ex"), index: idx || 0, onBack: function () { mainMenu() }, items: [
  { label: T("ex_g_mode"), d: "d_ex_g_mode", act: function () { panelOpen({ title: T("ex_g_mode"), onBack: function () { exMenu(0) }, items: E.EXAMPLES.map(function (x) { return { label: T("ex_" + x.id), d: "d_ex_" + x.id, act: function () { panelClose(); exPlay({ lat: x.lat, lon: x.lon, name: x.name, cls: "place", type: "city", bb: null }, x.mode, x.y1, x.y1 ? new Date().getFullYear() - 1 : undefined) } } }) }) } },
  { label: T("ex_g_cmp"), d: "d_ex_g_cmp", act: function () { panelOpen({ title: T("ex_g_cmp"), onBack: function () { exMenu(1) }, items: E.EVENTS.map(function (e) { return { label: T("ex_cmp", { p: e.place.name, b: e.y1, a: e.y2 }), dtext: evText(e) + " " + T("ev_run"), act: function () { exEvent(e) } } }) }) } }] });
}
/* play a dataset at a place (blind assistance speaks; the sighted page uses research.js with playQuiet) */
async function exPlay(hit, mode, y1, y2) {
 try { var X = cmpX(); if (X && X.isOpen()) { X.stop(); X.close(true) } } catch (e) {}
 pinTo(hit, true); await baPlay(mode, { y1: y1, y2: y2 });
}
function exEvent(e) { try { $("cmpa").value = "0"; $("cmpm").value = "1-12" } catch (er) {} BA.cmp = { place: e.place, y1: e.y1, y2: e.y2 }; cmpRun() }
function evText(e) {
 var v = { x: num(e.x), y: num(e.y), z: num(e.z), m: num(e.m), n: num(e.n), b: e.y1, a: e.y2 }, m = T(e.kind === "water" ? "ev_water" : e.kind === "heat" ? "ev_heat" : "ev_rain", v);
 return T("ex_cmp", { p: e.place.name, b: e.y1, a: e.y2 }) + ". " + m + " " + T("ev_" + e.id) + " " + T("ev_src", { s: e.src.map(function (z) { return z[0] }).join("; ") });
}
var ACC_U = { t2m: "u_c", sst: "u_c", q2m: "u_gkg", wind: "u_ms", o3: "u_ppb", co: "u_ppb", pm25: "u_ug" }, ACC_REF = { t2m: "ERA5", q2m: "ERA5", wind: "ERA5", sst: "Copernicus Marine", o3: "CAMS", co: "CAMS", pm25: "CAMS" };
function accLine(k) { var E = RJ(), a = E.ACC[k], c = a.coloured; return T("acc_item", { name: a.title, n: num(c.n), ref: ACC_REF[k] || a.ref, r: num(c.r.toFixed(3)), d: num(c.medae.toFixed(1)), u: T(ACC_U[k] || "u_c") }) + (k === "sst" ? " " + T("acc_note_sst") : k === "pm25" ? " " + T("acc_note_pm") : "") }
function accMenu(idx) {
 var E = RJ(); if (!E) { say(T("load_fail")); return }
 var keys = Object.keys(E.ACC), tot = keys.reduce(function (s, k) { return s + E.ACC[k].coloured.n }, 0);
 var items = [{ label: T("acc_sum_l"), dtext: T("acc_sum", { n: num(tot) }), act: function () { say(T("acc_sum", { n: num(tot) })) } }];
 var NS = E.numSets ? E.numSets() : [];
 if (NS.length) {
  var rmin = Math.min.apply(null, NS.map(function (d) { var c = d.num.check || {}; return Math.min.apply(null, ["first", "middle", "last"].map(function (k) { return c[k] ? c[k].rho : 1 })) }));
  var ntext = T("acc_num", { names: NS.map(function (d) { return d.title }).join(", "), r: num(rmin.toFixed(3)) });
  items.push({ label: T("acc_num_l"), dtext: ntext, act: function () { say(ntext) } });
  var SV = E.ACC_NASA && E.ACC_NASA.res, sk = SV ? Object.keys(SV) : [];
  if (sk.length && sk.every(function (k) { return SV[k].r >= .999 })) {
   var stext = T("acc_srv", { names: sk.map(function (k) { return SV[k].title }).join(", "), n: num(sk.reduce(function (a, k) { return a + SV[k].n }, 0)), r: num(Math.min.apply(null, sk.map(function (k) { return SV[k].r })).toFixed(4)) });
   items.push({ label: T("acc_srv_l"), dtext: stext, act: function () { say(stext) } });
  }
 }
 keys.forEach(function (k) { items.push({ label: E.ACC[k].title, dtext: accLine(k), act: function () { say(accLine(k)) } }) });
 var evAt = items.length;
 items.push({ label: T("acc_ev"), d: "d_acc_ev", act: function () { panelOpen({ title: T("acc_ev"), onBack: function () { accMenu(evAt) }, items: E.EVENTS.map(function (e) { return { label: T("ex_cmp", { p: e.place.name, b: e.y1, a: e.y2 }), dtext: evText(e), act: function () { say(evText(e)) } } }) }) } });
 items.push({ label: T("acc_how_l"), dtext: T("acc_how", { n: num(234) }), act: function () { say(T("acc_how", { n: num(234) })) } });
 panelOpen({ title: T("m_acc"), index: idx || 0, onBack: function () { mainMenu() }, items: items });
}
function whyText() {
 var E = RJ(); if (!E) return T("load_fail");
 var P = E.why(), r = P.r; if (!P.bpm || r.k === "none") return T("wy_none");
 var sd = function (v, d) { return v === null || v === undefined || !isFinite(v) ? "?" : T(v >= 0 ? "wy_plus" : "wy_minus", { v: num(Math.abs(v).toFixed(d)) }) };
 var out = [T("wy_snd", { bpm: num(P.bpm), note: P.note, ch: T(P.ch === "bright" ? "wy_ch_b" : P.ch === "mixed" ? "wy_ch_m" : "wy_ch_d") })];
 if (r.k === "eic" || r.k === "eicr" || r.k === "eicz") {
  out.push(r.below ? T("wy_below", { mode: r.mode }) : r.k === "eic" ? T("wy_eic", { mode: r.mode, pct: num(r.pct) }) : r.k === "eicr" ? T("wy_eicr", { mode: r.mode, pct: num(r.pct) }) : T("wy_eicz", { mode: r.mode, z: sd(r.z || 0, 1) }));
  if (r.est) out.push(T("wy_est")); out.push(T(r.sad ? "wy_sad" : "wy_br"));
 } else if (r.k === "glob") { if (r.an !== null && r.an !== undefined) out.push(T("wy_glob", { d: sd(r.an, 2) })) }
 else if (r.k === "air" || r.k === "land") { if (r.an !== null && r.an !== undefined) { out.push(T("wy_clim_air", { d: sd(r.an, 2) })); if (r.k === "land") out.push(T("wy_land_rain")) } }
 else if (r.k === "sea") { if (r.an !== null && r.an !== undefined) out.push(T("wy_clim_sea", { d: sd(r.an, 2) })) }
 else if (r.k === "cmp") out.push(T("wy_cmp", { date: frameLabel({ date: r.day }), t: sd(r.dt, 1), p: sd(r.dp, 1) }));
 else if (r.k === "cmpd") { out.push(T("wy_cmpd", { a: r.a, b: r.b })); if (r.verdict !== "none") out.push(T(r.verdict === "worse" ? "wy_cmpd_w" : r.verdict === "better" ? "wy_cmpd_b" : "wy_cmpd_s", { a: r.a })) }
 return out.join(" ");
}
function sayWhy() { say(whyText()) }
/* Compare: the PDF report and the SI overview as a menu of its parts */
function cmpPdf() {
 var E = RJ(), X = cmpX(); if (!E || !X || !X.C.data) { say(T("load_fail")); return }
 if (!X.C.data.pics) { say(T("cm_pdf_load")); return }
 say(T("cm_pdf_wait"));
 E.pdf().then(function (r) { if (r && r.ok) { beep("done"); say(T("cm_pdf_ok", { n: num(r.pages) })) } else { beep("error"); say(r && r.why === "loading" ? T("cm_pdf_load") : T("cm_pdf_fail")) } });
}
/* the audio report (audioreport.js): read aloud now with the device's voice, or made as an MP3 file */
async function cmpAudioPlay() {
 var E = RJ(), X = cmpX(); if (!E || !X || !X.C.data || !window.EJA) { say(T("load_fail")); return }
 if (!X.C.data.pics) { say(T("cm_pdf_load")); return }
 say(T("cm_a_wait")); var items = [];
 try { var r = await E.pdf({ nosave: true, collect: items }); if (!r || !r.ok) throw 0 } catch (e) { beep("error"); say(T("cm_a_fail")); return }
 var parts = EJA.script(items, X.C.data), i = 0, tok = ++BA.reqTok;
 (function next() { if (tok !== BA.reqTok || i >= parts.length) return; say(parts[i++].t, { lang: "en", then: next }) })();
}
async function cmpAudioDl() {
 var X = cmpX(); if (!X || !X.C.data || !window.EJA) { say(T("load_fail")); return }
 if (!X.C.data.pics) { say(T("cm_pdf_load")); return }
 say(T("cm_a_wait")); var st = $("cmpaudst"), last = "", tm = setInterval(function () { var t = st ? st.textContent : ""; if (t && t !== last && /%/.test(t)) { last = t; say(t, { lang: "en" }) } }, 60000);
 try { var r = await EJA.make(); clearInterval(tm); if (r && r.ok) { beep("done"); say(T("cm_a_ok", { n: num(Math.round(r.minutes)) })) } else { beep("error"); say(T("cm_a_fail")) } } catch (e) { clearInterval(tm); beep("error"); say(T("cm_a_fail")) }
}
/* the shared library (library.js): the research another visitor made for the same place and years */
async function cmpLib() {
 var X = cmpX(), D = X && X.C.data; if (!D || !window.EJL || !window.ASSISTANT_URL) { say(T("cm_lib_none")); return }
 try { var L = await EJL.list(), m = L.filter(function (x) { return x.y1 === D.y1 && x.y2 === D.y2 && Math.abs(x.lat - D.place.lat) < .05 && Math.abs(x.lon - D.place.lon) < .05 })[0];
  if (!m) { say(T("cm_lib_none")); return }
  await EJL.load(m.id); beep("done"); say(T("cm_lib_ok", { d: String(m.made).slice(0, 10) })) } catch (e) { beep("error"); say(T("cm_lib_none")) }
}
/* in-depth research (deep.js): runs once per comparison, then each part can be heard (texts are in English) */
function cmpDeepMenu(idx, intro) {
 var X = cmpX(), D = X && X.C.data; if (!D) { cmpMenu(); return }
 var R = D.deep;
 if (!R || !R.done) {
  if (!window.EJD || !X.deep) { say(T("load_fail")); return }
  if (D.deepP) { say(T("cm_deep_busy", { s: R && R.status ? R.status : "" })); return }
  say(T("cm_deep_wait"));
  X.deep(false).then(function () { if (X.C.data !== D) return; beep("done"); if (BA.on) cmpDeepMenu(0, T("cm_deep_ready")) }, function () { beep("error"); say(T("cm_deep_fail")) });
  return;
 }
 var items = [];
 if (R.H) { var kt = "Kind of place: " + R.H.label + ". NASA land cover " + R.H.year + " at the point: " + R.H.pinName.toLowerCase() + (R.H.mangrove > 0 ? "; mangroves cover " + Math.round(R.H.mangrove * 100) + " percent of the 20 kilometres around it in the 2000 mangrove map" : "") + "."; items.push({ label: T("cm_deep_kind"), dtext: kt, act: function () { say(kt, { lang: "en" }) } }) }
 R.items.forEach(function (it) { items.push({ label: it.title, dtext: it.text, act: function () { say(it.text, { lang: "en" }) } }) });
 if (R.errors.length) { var et = R.errors.map(function (e) { return e[0] + ": " + e[1] }).join(". ") + "."; items.push({ label: T("cm_deep_err"), dtext: et, act: function () { say(et, { lang: "en" }) } }) }
 panelOpen({ title: T("cm_deep"), index: idx || 0, intro: intro, onBack: function () { cmpResults(6) }, items: items });
}
function cmpOvMenu(idx, intro) {
 var X = cmpX(), D = X && X.C.data, ov = X && X.C.ov;
 if (!D) { cmpMenu(); return }
 if (!ov || ov.key !== D.place.name + "|" + D.y1 + "|" + D.y2) { cmpOverview(); return }
 var E = RJ(), secs = E && E.ovSections ? E.ovSections(ov.text) : [{ h: "", body: ov.text }], plain = function (t) { return String(t || "").replace(/[#*_`]/g, "").replace(/\s*•\s*/g, ". ").replace(/\s+/g, " ").replace(/(\.\s*){2,}/g, ". ").replace(/^\.\s*/, "").trim() };
 var whole = plain(secs.map(function (z) { return (z.h ? z.h + ". " : "") + z.body }).join(" "));
 var items = [{ label: T("cm_ov_all"), d: "d_cm_ov_all", act: function () { say(whole, { lang: siVoice() }) } }];
 secs.forEach(function (z) { if (!z.h && !z.body) return; items.push({ label: z.h ? plain(z.h) : plain(z.body).slice(0, 60) + "…", d: "d_cm_ov_part", act: function () { say(plain((z.h ? z.h + ". " : "") + z.body), { lang: siVoice() }) } }) });
 if (ov.sources && ov.sources.length) items.push({ label: T("cm_ov_src"), d: "d_cm_ov_src", act: function () { say(ov.sources.map(function (x, i) { return (i + 1) + ". " + (x.title || x.uri) }).join(". ")) } });
 items.push({ label: T("cm_ov_new"), d: "d_cm_ov_new", act: function () { cmpOverview(true) } });
 panelOpen({ title: T("cm_ov"), index: idx || 0, intro: intro, onBack: function () { cmpResults(5) }, items: items });
}
/* typed or spoken requests, in all of the site's languages */
var WHY_RE = /why\b.*\b(sound|music|tune|melody)|explain (the )?(sound|music)|কেন.*(শোনা|শব্দ|সুর|গান|মিউজিক|বাজ)|क्यों.*(सुनाई|आवाज़|आवाज|संगीत|धुन|बज)|کیوں.*(سنائی|آواز|موسیقی|دھن|بج)|(لماذا|ليش|ليه|لیش).*(صوت|الصوت|موسيقى|الموسيقى|يبدو|يرن|بيطلع)|por ?qu[eé].*(suena|sonido|m[uú]sica)|porque.*(soa|som|m[uú]sica)|pourquoi.*(son|musique|sonne)|warum.*(klingt|klang|musik|ton)|perch[eé].*(suona|suono|musica)|почему.*(звуч|звук|музык)|(为什么|為什麼|为何|為何).*(声音|聲音|音乐|音樂|听起来|聽起來)|(なぜ|どうして|なんで).*(音|聞こえ|音楽)|왜.*(소리|음악|들려|들리)|(kenapa|mengapa).*(bunyi|suara|musik|muzik|terdengar)|(neden|niye|niçin).*(ses|müzik|duyul)|(tại sao|vì sao|sao).*(âm thanh|nhạc|nghe)|ทำไม.*(เสียง|ดนตรี|เพลง)|kwa nini.*(sauti|muziki|inasikika)/i;
var EX_RE = /^(show |play |give |open )?(me )?(an? |some |the )?examples?\b|উদাহরণ|उदाहरण|مثال|أمثلة|امثلة|ejemplos?|exemplos?|exemples?|beispiele?|esempi|esempio|пример|示例|例子|範例|例を|サンプル|예시|예제|contoh|örnek|ví dụ|ตัวอย่าง|mfano|mifano/i;
var ACC_RE = /how (accurate|reliable|correct|trustworthy)|accuracy|নির্ভুল|কতটা সঠিক|सटीक|कितना सही|درستگی|کتنا درست|دقة|دقيق|qué tan precis|precisión|exactitud|precis[aã]o|exatid[aã]o|pr[ée]cision|genauigkeit|wie genau|precisione|accuratezza|точност|насколько точн|准确|準確|精度|正確さ|どれくらい正確|정확도|얼마나 정확|akurasi|ketepatan|ketepatan|doğruluk|ne kadar doğru|độ chính xác|chính xác đến|ความแม่นยำ|แม่นยำแค่ไหน|usahihi/i;
var PDF_RE = /\bpdf\b|\breport\b|রিপোর্ট|প্রতিবেদন|रिपोर्ट|प्रतिवेदन|رپورٹ|تقرير|informe|relat[oó]rio|rapport|bericht|rapporto|отч[её]т|报告|報告|レポート|보고서|laporan|rapor|báo cáo|รายงาน|ripoti/i;
function miscIntent(q) {
 var short = String(q || "").trim().split(/\s+/).length <= 8 || /[぀-ヿ㐀-鿿가-힯฀-๿]/.test(q) && String(q).length <= 30;
 if (WHY_RE.test(q)) { sayWhy(); return true }
 if (cmpActive() && PDF_RE.test(q)) { cmpPdf(); return true }
 if (short && EX_RE.test(q)) { exMenu(); return true }
 if (short && ACC_RE.test(q)) { accMenu(); return true }
 return false;
}
async function baAsk(q, src) {
 q = String(q || "").trim().slice(0, 500); if (!q) return;
 try { $("aic").innerHTML = "" } catch (e) {}
 show("u", q.replace(/\*/g, ""));
 var k = localCmd(q);
 if (k) { beep("select"); doCmd(k); return }
 if (await cmpIntent(q)) return;
 if (miscIntent(q)) return;
 /* a new request replaces one that is still running, instead of being refused */
 var req = ++BA.reqTok; if (BA.busy) { PLAYTOK++; stopSpeech(true) }
 BA.busy = true;
 try {
  if (YN) YN = null;
  var gq = (typeof geoIntent === "function" && geoIntent(q)) ? [geoIntent(q)] : pinIntentML(q);
  if (gq) {
   say(T("searching"));
   var r = null; try { r = await geoFind(gq) } catch (e) {}
   if (r && (r.exact || r.road)) { pinTo(r.hit, true); var d = show("a", ""); if (d) geoReport(d, r); say(r.exact ? T("pin_moved", { name: r.hit.name }) : T("pin_area", { name: r.hit.name })); return }
  }
  var mi = modeIntent(q);
  if (mi) { await baPlay(mi.id, mi); return }
  if (req !== BA.reqTok) return;
  if (aiUsed() >= AI.cap) { beep("error"); show("s", T("credits_out")); say(T("credits_out")); return }
  var pend = show("a", T("think")), tAsk = Date.now(); say(src === "voice" ? T("heard", { text: q }) + " " + T("think") : T("think"));
  var res = await fetch(ASSISTANT_URL || "api/assistant", { method: "POST", headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ question: q, history: AI.hist.slice(-4), context: aiContext(), vid: ejVid(), mode: BA.method, ba: true, lang: BA.siLang(), catalog: siCatalog() }) }), j = null;
  try { j = await res.json() } catch (e) {}
  try { console.info("[Blind assistance] SI reply " + ((Date.now() - tAsk) / 1000).toFixed(1) + " s" + (j && j.model ? " (" + j.model + ", " + (j.ms / 1000).toFixed(1) + " s at Gemini)" : "")) } catch (e) {}
  if (req !== BA.reqTok) return;
  if (res.ok && j && (j.answer || (j.actions && j.actions.length) || j.action)) {
   aiCount(); var acts = j.actions || (j.action && j.action.type === "pin" ? [j.action] : []), ans = String(j.answer || "").trim();
   if (pend) pend.innerHTML = aiFormat(ans || "✓");
   AI.hist.push({ role: "user", text: q }, { role: "model", text: ans || JSON.stringify(acts).slice(0, 300) }); AI.hist = AI.hist.slice(-12);
   if (ans) { if (acts.length) say(ans, { lang: siVoice() }); else await sayP(ans, { lang: siVoice() }) }
   if (acts.length) await runActions(acts, req, q);
   if (!ans && !acts.length) say(T("not_caught"));
  } else {
   var why = j && j.error ? j.error : "HTTP " + res.status;
   if (pend) pend.innerHTML = aiFormat(String(why));
   beep("error"); say(res.status === 429 && /limit|allowance|used up/.test(why) ? T("credits_out") : T("err_net"));
  }
 } catch (e) { beep("error"); say(T("err_net")) }
 finally { if (req === BA.reqTok) BA.busy = false; try { aiFoot() } catch (e) {} }
}
/* typing mode uses the SI panel's own box: route its requests here */
if (typeof window.aiAsk === "function") {
 var _aiAsk = window.aiAsk;
 window.aiAsk = function (q) { if (BA.on && (BA.method === "typing" || BA.method === "voice")) return baAsk(q, "typed"); return _aiAsk(q) };
}

/* ---------- voice: hold Space to talk ---------- */
var LIS = { on: false, rec: null, text: "", err: null, stopped: false };
function listenStart() {
 var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { say(T("voice_none")); setMethod("typing"); return }
 if (LIS.on) return;
 stopSpeech(true);
 var r = new SR(); r.lang = BA.srEn ? "en-US" : (L(BA.lang)[3] || "en-US"); r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;
 LIS = { on: true, rec: r, text: "", interim: "", err: null, stopped: false, t0: Date.now() };
 /* final results are kept; the latest unfinished one too, because some browsers end without finalising the last words when Space is let go */
 r.onresult = function (e) { var tmp = ""; for (var i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) LIS.text += e.results[i][0].transcript + " "; else tmp += e.results[i][0].transcript + " " } LIS.interim = tmp };
 r.onerror = function (e) { LIS.err = e.error };
 r.onend = function () {
  LIS.on = false; document.body.classList.remove("balisten"); duck(false);
  var t = (LIS.text.trim() || LIS.interim.trim());
  try { console.info("[Blind assistance] speech recognition (" + r.lang + "): " + (t ? "heard \"" + t + "\"" : "nothing") + (LIS.err ? ", error " + LIS.err : "") + ", held " + ((Date.now() - LIS.t0) / 1000).toFixed(1) + " s") } catch (e) {}
  if (LIS.err === "not-allowed" || LIS.err === "service-not-allowed") { beep("error"); say(T("voice_denied")); setMethod("typing"); return }
  if (!t) {
   if (LIS.err === "language-not-supported" && !BA.srEn) { BA.srEn = true; beep("error"); say(T("v_lang")); return }
   if (!LIS.stopped && !LIS.err) return;
   beep("error"); say(T(LIS.err === "audio-capture" ? "v_nomic" : LIS.err === "network" ? "v_network" : LIS.err === "aborted" ? "not_caught" : "v_nospeech")); return;
  }
  baAsk(t, "voice");
 };
 try { r.start(); beep("listen"); window.BADUCK = .12; try { applyH() } catch (e) {} document.body.classList.add("balisten") } catch (e) { LIS.on = false; try { console.info("[Blind assistance] speech recognition could not start: " + e.message) } catch (e2) {} }
}
function listenStop() { if (LIS.rec && LIS.on) { LIS.stopped = true; try { LIS.rec.stop() } catch (e) {} beep("done") } }

/* ---------- keys ---------- */
function typingTarget(e) { var t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) && t.id !== "bapq" }
function consume(e) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation() }
function onKey(e) {
 if (e.ctrlKey && e.altKey && e.code === "KeyR") { consume(e); restartBA(); return }
 if (e.ctrlKey && e.altKey && e.key === "Backspace") { consume(e); askReset(); return }
 if (e.ctrlKey && e.altKey && e.code === "KeyB") { consume(e); if (START.open) return; if (BA.on) turnOff(); else { var s = settingsLoad(); BA.on = true; if (s && s.method) { applySettings(); BA.on = true; say(T("is_on"), { then: ready }) } else { BA.speakLang = "en"; langStep() } } return }
 if (START.open) {
  if (e.code === "KeyF") { consume(e); startYes(); return }
  if (e.code === "KeyJ" || (START.custom && e.key === "Escape")) { consume(e); startNo(); return }
  if (e.key === "Tab" || ((e.key === "Enter" || e.key === " ") && (document.activeElement === $("basy") || document.activeElement === $("basn")))) return;
  if (/^(Shift|Control|Alt|Meta|CapsLock)$/.test(e.key)) return;
  consume(e); if (START.custom) { if (!START.custom.after) startSpeak(); return } if (START.resume) { startYes(); return } startSpeak(); return;
 }
 if (!BA.on) return;
 if (SRW) { if (/^(Shift|Control|Alt|Meta|CapsLock|NumLock|Tab)$/.test(e.key)) return; consume(e); if (e.code === "KeyJ" || e.key === "Escape") stopSpeech(); return }
 if (/^(Shift|Control|Alt|Meta|CapsLock|NumLock)$/.test(e.key)) return;
 if (e.ctrlKey || e.metaKey || e.altKey) return;
 if (GUIDE) { if (e.key === "Tab") return; consume(e); if (e.code === "KeyJ" || e.key === "Escape") guideSkip(); return }
 if (YN && !(BA.method === "voice" && e.code === "Space" && !typingTarget(e))) {
  if (e.code === "KeyF" || (e.key === "Enter" && !P.open)) { consume(e); ynAnswer(true); return }
  if (e.code === "KeyJ" || e.key === "Escape") { consume(e); ynAnswer(false); return }
  if (!typingTarget(e) || BA.method !== "typing") { consume(e); say(YN.text, { lang: YN.lang }) }
  return;
 }
 if (BA.method === "voice" && e.code === "Space" && !typingTarget(e) && !(P.open && P.inSearch)) { consume(e); if (!e.repeat) listenStart(); return }
 if (P.open) { panelKey(e); return }
 if (BA.method === "keys") {
  if (typingTarget(e)) return;
  consume(e);
  if (e.code === "Space") { control(tplaying ? "pause" : "resume"); return }
  if (e.code === "KeyR") { repeatLast(); return }
  if (e.code === "KeyW") { sayWhy(); return }
  mainMenu(); return;
 }
 if (e.key === "Escape") { consume(e); stopSpeech(); mainMenu(); return }
 if (BA.method === "voice" && e.code === "KeyR" && !typingTarget(e)) { consume(e); repeatLast(); return }
 if (BA.method === "voice" && e.code === "KeyW" && !typingTarget(e)) { consume(e); sayWhy(); return }
 if (typingTarget(e) && e.key.length === 1 && SP.cur) stopSpeech();
}
function panelKey(e) {
 if (P.inSearch) {
  if (e.key === "ArrowDown") { consume(e); P.inSearch = false; $("bapq").blur(); sayItem(); return }
  if (e.key === "Enter") { consume(e); if (!P.items.length && P.searchEnter) { P.searchEnter($("bapq").value); return } if (!P.items.length) { say(T(P.searchFn ? "cm_nomatch" : "lang_nomatch")); return } select(); return }
  if (e.key === "Escape") { consume(e); panelBack(); return }
  if (SP.cur && e.key.length === 1) stopSpeech(true);
  return;
 }
 consume(e);
 var k = e.key;
 if (k === "ArrowDown") move(1);
 else if (k === "ArrowUp") { if (P.search && P.i === 0) { P.inSearch = true; $("bapq").focus(); say(T(P.searchFn ? "cm_find" : "lang_type")) } else move(-1) }
 else if (k === "Home") move(-1e6);
 else if (k === "End") move(1e6);
 else if (k === "ArrowRight" || k === "Enter") select();
 else if (k === "ArrowLeft" || k === "Escape") panelBack(k);
 else if (e.code === "Space" && BA.method !== "voice") control(tplaying ? "pause" : "resume");
 else if (k === "Backspace") describe();
 else if (e.code === "KeyR" && !P.jump) repeatLast();
 else if (e.code === "KeyW" && !P.jump && !P.search) sayWhy();
 else if (P.jump && k.length === 1 && /\p{L}/u.test(k)) jump(k);
 else if (P.search && k.length === 1) { P.inSearch = true; var q = $("bapq"); q.focus(); q.value += k; searchInput() }
}
document.addEventListener("keydown", onKey, true);
document.addEventListener("keyup", function (e) { if (BA.on && BA.method === "voice" && e.code === "Space" && LIS.on) { consume(e); listenStop() } }, true);

/* ---------- start ---------- */
function boot() {
 inject(); voicesLoad();
 try { if (window.speechSynthesis) speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", voicesLoad) : (speechSynthesis.onvoiceschanged = voicesLoad) } catch (e) {}
 var s = settingsLoad();
 if (s && s.off) { badge(); return }
 if (s && s.on && s.method) { applySettings(); showStart(true); return }
 showStart(false);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
window.BAX = { dataSay: dataSay, rangeMenu: rangeMenu, sayAll: sayAll, offerAll: offerAll, exPlay: exPlay, exMenu: exMenu, accMenu: accMenu, sayWhy: sayWhy, whyText: whyText, cmpPdf: cmpPdf, cmpOvMenu: cmpOvMenu, miscIntent: miscIntent, evText: evText, accLine: accLine, cmpMenu: cmpMenu, cmpIntent: cmpIntent, cmpSummary: cmpSummary, cmpResults: cmpResults, cmpDeepMenu: cmpDeepMenu, cmpRun: cmpRun, P: function () { return P }, clearPrefs: clearPrefs, pickVoice: pickVoice, askReset: askReset, playQuiet: playQuiet, siCatalog: siCatalog, showStart: showStart, say: say, T: T, localCmd: localCmd, modeIntent: modeIntent, pinIntentML: pinIntentML, catalog: catalog, baPlay: baPlay, control: control, statusText: statusText, langItems: langItems, frameLabel: frameLabel, panel: function () { return P }, mainMenu: mainMenu, baAsk: baAsk, setLang: setLang, STR: STR, EN: EN, LANGS: LANGS, playGuide: playGuide, guideSkip: guideSkip, stopSpeech: stopSpeech, visualGuide: visualGuide, repeatLast: repeatLast, CLIP: CLIP, st: function () { return { BA: BA, SP: SP, GUIDE: GUIDE, VG: VG } } };
})();
