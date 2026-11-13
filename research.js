/* Earth Jukebox: research tools.
   1. Examples: one-click NASA datasets at chosen places, and Compare runs of real, documented events.
   2. Accuracy: how well the site's reading of NASA's EIC frames agrees with independent records (test run 8 Nov 2026), and the real-event tests.
   3. "Why it sounds like this": a plain sentence under the music, built from the same numbers that drive the sound.
   4. The formal PDF research report for Compare (statistics, tables, figures, references).
   Blind assistance reads all of this through window.EJR. */
(function () {
var $ = function (id) { return document.getElementById(id) };
function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) }

/* ---------------- data: the accuracy test ----------------
   Each NASA EIC frame was read exactly as the site reads it (the colour at a point, matched to NASA's own colour bar, median of the 3 x 3 nearest
   samples on a 512 x 256 copy of the frame) at a global grid of places, and compared with an independent record at the same place and hour. */
var ACC = {"t2m":{"title":"Near-surface air temperature (GEOS-FP)","unit":"°C","ref":"ERA5 2 m air temperature","frames":16,"places":234,"tried":3744,"decoded":3744,"range":[-40,40],"scaleType":"linear","colours":388,"step":0.2067,"t0":"2026-10-23T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":3744,"r":0.986,"mae":1.227,"medae":0.775,"rmse":2.152,"bias":0.322,"mSite":15.887,"mRef":15.565},"land":{"n":1168,"r":0.976,"mae":2.218,"medae":1.506,"rmse":3.545,"bias":-0.088,"mSite":9.788,"mRef":9.876},"sea":{"n":2576,"r":0.997,"mae":0.777,"medae":0.617,"rmse":1.018,"bias":0.508,"mSite":18.653,"mRef":18.145},"logAll":null,"logLand":null,"logSea":null,"below":null,"bins":[[-16.86,57,-15.161,-18.915,-13.127],[-11.58,88,-9.612,-13.127,-7.752],[-6.3,113,-6.673,-9.199,-5.065],[-1.02,195,-0.548,-1.344,0.724],[4.26,388,3.752,2.171,5.478],[9.54,507,9.53,8.165,11.059],[14.82,406,15.217,13.953,16.848],[20.1,563,20.68,19.328,22.429],[25.38,1013,27.054,25.736,28.837],[30.66,341,29.523,29.044,30.284]],"binLog":false},"q2m":{"title":"Near-surface humidity (GEOS-FP)","unit":"g/kg","ref":"ERA5 2 m specific humidity (from dew point and surface pressure)","frames":16,"places":234,"tried":3744,"decoded":3735,"range":[0,22],"scaleType":"linear","colours":388,"step":0.0568,"t0":"2026-10-23T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":3735,"r":0.986,"mae":0.694,"medae":0.451,"rmse":1.075,"bias":0.049,"mSite":10.132,"mRef":10.083},"land":{"n":1159,"r":0.967,"mae":1.01,"medae":0.618,"rmse":1.573,"bias":-0.511,"mSite":6.615,"mRef":7.126},"sea":{"n":2576,"r":0.993,"mae":0.552,"medae":0.396,"rmse":0.749,"bias":0.301,"mSite":11.714,"mRef":11.413},"logAll":null,"logLand":null,"logSea":null,"below":null,"bins":[[1.607,309,1.593,0.91,1.99],[3.553,488,3.428,3.013,3.866],[5.498,559,5.347,4.832,5.969],[7.444,414,7.304,6.537,8.072],[9.39,291,9.266,8.698,10.005],[11.335,261,11.501,10.744,12.506],[13.281,211,13.63,13.075,14.439],[15.227,193,15.646,15.008,16.656],[17.172,390,17.753,17.339,18.419],[19.118,544,19.076,18.646,19.556]],"binLog":false},"wind":{"title":"Near-surface wind speed (GEOS-FP)","unit":"m/s","ref":"ERA5 10 m wind speed","frames":16,"places":234,"tried":3744,"decoded":3271,"range":[0,40],"scaleType":"linear","colours":246,"step":0.1034,"t0":"2026-10-23T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":2372,"r":0.948,"mae":1.1,"medae":0.903,"rmse":1.419,"bias":0.031,"mSite":7.399,"mRef":7.368},"land":{"n":873,"r":0.683,"mae":1.348,"medae":1.236,"rmse":1.629,"bias":0.907,"mSite":4.061,"mRef":3.154},"sea":{"n":1499,"r":0.926,"mae":0.955,"medae":0.776,"rmse":1.281,"bias":-0.479,"mSite":9.343,"mRef":9.822},"logAll":null,"logLand":null,"logSea":null,"below":{"n":899,"threshold":4,"refBelow":705,"refBelowPlus2":839},"bins":[[1.478,331,3.585,3.411,3.824],[3.252,294,3.843,3.411,3.824],[5.027,237,5.084,3.824,6.202],[6.802,382,6.803,6.305,7.339],[8.577,405,7.863,7.339,8.269],[10.352,288,9.62,8.992,10.233],[12.127,180,11.118,10.439,11.783],[13.902,107,12.989,12.3,13.54],[15.677,66,14.727,14.16,15.401],[17.453,36,16.494,15.401,17.364]],"binLog":false},"sst":{"title":"Sea surface temperature (MUR)","unit":"°C","ref":"Copernicus Marine / Meteo-France global sea surface temperature analysis (about 8 km), daily mean","frames":12,"places":161,"tried":1801,"decoded":1801,"range":[-5,35],"scaleType":"linear","colours":770,"step":0.052,"t0":"2024-05-20","t1":"2026-03-18","coloured":{"n":1801,"bias":0.671,"mae":1.587,"rmse":1.755,"r":0.996,"medae":1.527,"meanSite":20.4,"meanRef":19.73},"land":null,"sea":{"n":1801,"bias":0.671,"mae":1.587,"rmse":1.755,"r":0.996,"medae":1.527,"meanSite":20.4,"meanRef":19.73},"logAll":null,"logLand":null,"logSea":null,"below":null,"bins":[[1.141,75,0.384,-0.111,1.242],[4.257,89,2.058,1.606,2.386],[7.373,124,5.694,3.791,7.172],[10.489,127,9.492,8.992,10.085],[13.605,118,12.536,11.541,13.205],[16.72,133,17.822,17.263,18.771],[19.836,142,21.199,20.28,22.204],[22.952,222,24.738,23.921,25.273],[26.068,321,28.061,27.042,29.122],[29.184,414,30.709,30.111,32.191]],"binLog":false},"o3":{"title":"Near-surface ozone, O3 (GEOS-CF)","unit":"ppbv","ref":"CAMS global surface ozone (converted to ppb at 25 C, 1 atm)","frames":18,"places":234,"tried":4212,"decoded":4212,"range":[5,60],"scaleType":"linear","colours":390,"step":0.1414,"t0":"2026-10-22T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":3243,"r":0.647,"mae":5.472,"medae":3.433,"rmse":9.175,"bias":2.074,"mSite":34.904,"mRef":32.83},"land":{"n":1225,"r":0.619,"mae":7.729,"medae":5.89,"rmse":10.257,"bias":5.939,"mSite":38.496,"mRef":32.558},"sea":{"n":2018,"r":0.712,"mae":4.103,"medae":2.846,"rmse":8.45,"bias":-0.272,"mSite":32.724,"mRef":32.996},"logAll":null,"logLand":null,"logSea":null,"below":{"n":969,"threshold":20,"refBelow":485,"refBelowPlus2":811},"bins":[[16.402,142,27.759,23.38,30.98],[21.699,562,26.945,23.38,27.905],[26.997,704,29.109,24.841,31.334],[32.294,506,33.276,27.905,38.438],[37.592,537,40.18,37.519,42.609],[42.889,455,43.511,41.478,46.144],[48.187,168,46.304,44.165,49.679],[53.484,70,47.457,42.044,54.627],[58.782,22,49.474,45.578,56.607],[64.079,13,48.357,45.013,54.627]],"binLog":false},"co":{"title":"Carbon monoxide, CO (GEOS-CF)","unit":"ppbv","ref":"CAMS global surface carbon monoxide (converted to ppb at 25 C, 1 atm)","frames":18,"places":234,"tried":4212,"decoded":4154,"range":[40,500],"scaleType":"ticks","colours":392,"step":0.5048,"t0":"2026-10-22T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":4154,"r":0.231,"mae":31.409,"medae":14.206,"rmse":239.176,"bias":-22.257,"mSite":83.001,"mRef":105.258},"land":{"n":1270,"r":0.7,"mae":31.078,"medae":17.11,"rmse":56.469,"bias":-11.92,"mSite":111.169,"mRef":123.089},"sea":{"n":2884,"r":0.267,"mae":31.555,"medae":11.771,"rmse":284.591,"bias":-26.809,"mSite":70.597,"mRef":97.406},"logAll":{"n":4154,"r":0.763,"mae":0.093,"medae":0.076,"rmse":0.139,"bias":-0.057,"mSite":1.884,"mRef":1.941},"logLand":{"n":1270,"r":0.786,"mae":0.1,"medae":0.082,"rmse":0.128,"bias":-0.051,"mSite":1.997,"mRef":2.048},"logSea":{"n":2884,"r":0.747,"mae":0.09,"medae":0.075,"rmse":0.143,"bias":-0.06,"mSite":1.834,"mRef":1.894},"below":null,"bins":[[1.703,700,1.752,1.741,1.757],[1.795,544,1.772,1.757,1.776],[1.888,567,1.818,1.787,1.847],[1.98,1376,1.892,1.865,1.902],[2.072,458,1.98,1.897,2.037],[2.164,209,2.123,1.989,2.263],[2.257,103,2.149,1.932,2.303],[2.349,74,2.18,1.929,2.362],[2.441,41,2.237,2.033,2.43],[2.533,22,2.21,2.016,2.403]],"binLog":true},"pm25":{"title":"Fine particulate matter, PM2.5 (GEOS-CF)","unit":"µg/m³","ref":"CAMS global PM2.5","frames":16,"places":234,"tried":3744,"decoded":3712,"range":[0.4,409.6],"scaleType":"pow","colours":388,"step":0.2293,"t0":"2026-10-23T09:00:00.000Z","t1":"2026-11-02T17:00:00.000Z","coloured":{"n":3712,"r":0.318,"mae":8.924,"medae":7.886,"rmse":13.073,"bias":-8.724,"mSite":1.424,"mRef":10.148},"land":{"n":1145,"r":0.387,"mae":7.344,"medae":3.519,"rmse":13.323,"bias":-6.699,"mSite":2.388,"mRef":9.087},"sea":{"n":2567,"r":0.43,"mae":9.63,"medae":8.967,"rmse":12.959,"bias":-9.627,"mSite":0.994,"mRef":10.621},"logAll":{"n":3680,"r":0.358,"mae":0.905,"medae":0.977,"rmse":0.97,"bias":-0.861,"mSite":-0.017,"mRef":0.844},"logLand":{"n":1113,"r":0.646,"mae":0.604,"medae":0.601,"rmse":0.688,"bias":-0.464,"mSite":0.139,"mRef":0.603},"logSea":{"n":2567,"r":0.374,"mae":1.035,"medae":1.09,"rmse":1.069,"bias":-1.033,"mSite":-0.085,"mRef":0.948},"below":null,"bins":[[-0.869,54,-0.195,-0.321,-0.102],[-0.607,46,-0.193,-0.297,-0.079],[-0.344,45,-0.163,-0.297,-0.056],[-0.082,82,-0.17,-0.297,-0.11],[0.18,152,-0.141,-0.273,-0.048],[0.442,324,-0.114,-0.266,-0.017],[0.704,649,-0.064,-0.234,0.061],[0.967,1334,-0.061,-0.211,0.006],[1.229,802,0.056,-0.149,0.162],[1.491,154,0.566,0.294,0.862]],"binLog":true}};
var ACC_META = { run: "2026-11-08", grid: "234 places: every 10 degrees of latitude (52.5 S to 67.5 N) and 20 degrees of longitude, offset from map lines; sea surface temperature at the 161 of them over the sea",
 timing: "GEOS-FP and GEOS-CF frames are hourly; frame 1 is the time NASA printed on it (23 Oct 2026 09:00 UTC; 22 Oct for CO and ozone), confirmed on later frames. Only hours that ERA5 already covered (to 2 Nov 2026) were used, every 16th hour.",
 refs: "ERA5 reanalysis (ECMWF, through Open-Meteo, model 'era5' only); CAMS global atmospheric composition (Copernicus/ECMWF, through Open-Meteo); Copernicus Marine / Meteo-France global sea surface temperature analysis (through Open-Meteo marine)." };
var ACC_NOTE = {
 t2m: "Strong agreement. Over the sea the two records agree almost perfectly (correlation 0.997); over land differences are larger where mountains and coasts change temperature within one grid cell.",
 q2m: "Strong agreement. The reference humidity is computed from ERA5's dew point and surface pressure.",
 wind: "Good agreement for coloured readings. NASA leaves calm air (under about 4 m/s) uncoloured; the site then reports 'calm', and ERA5 agreed (under 4 m/s) at 78% of those points and under 5 m/s at 93%.",
 sst: "Very high correlation, but the reading is slightly stretched: about 1.5 degrees C warm at the warm end (29 to 30 degrees C) and about 0.8 degrees C cool near freezing, against the independent analysis. NASA's printed colour bar (-5 to 35 degrees C) is used correctly, so the stretch most likely comes from colour changes in NASA's video frames; treat single readings as within about 1.5 degrees C.",
 o3: "Moderate agreement, as is usual between two different air-quality models. Where NASA leaves the map uncoloured (below about 20 ppb) the site says 'below about 20 ppbv'; CAMS was under 20 ppb at half of those points and under 25 ppb at 84%.",
 co: "Good agreement on a logarithmic scale (correlation 0.76). A few very high CAMS values near fires make the plain average difference large.",
 pm25: "Weak agreement. The site reproduces NASA's printed colour scale exactly (0.4 to 409.6 micrograms per cubic metre), but NASA's GEOS-CF frames show much lower PM2.5 than CAMS over the open ocean and deserts (about 1 against 11 over the sea), so the two models' products differ. NASA's page does not say which particle types the picture includes. Over land the two agree moderately (correlation 0.65 on a logarithmic scale)."
};
var ACC_REFLINK = { t2m: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels", q2m: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels", wind: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels", sst: "https://marine.copernicus.eu/", o3: "https://atmosphere.copernicus.eu/", co: "https://atmosphere.copernicus.eu/", pm25: "https://atmosphere.copernicus.eu/" };
/* What the site shows, checked against NASA's own server: for each dataset with saved NASA numbers, the site's reading (EJN, the same code the
   site uses) at 234 places and 7 frames (first, last and five between) against the same value fetched fresh from NASA's OPeNDAP server
   at test time; the frame's hour on NASA's server was confirmed for every frame. Measured, not estimated. */
var ACC_NASA = {"run": "9 November 2026", "places": 234, "frames": "7 per dataset, 25 October to 9 November 2026", "res": {"t2m": {"title": "Near-surface air temperature (GEOS-FP)", "unit": "°C", "enc": "lin", "n": 1638, "frames": 7, "r": 0.99999997, "medae": 0.0025, "max": 0.005, "p99": 0.00476, "medRel": 0.000143, "maxRel": null, "bias": -0.000174}, "q2m": {"title": "Near-surface humidity (GEOS-FP)", "unit": "g/kg", "enc": "lin", "n": 1638, "frames": 7, "r": 0.99999989, "medae": 0.00252, "max": 0.00499, "p99": 0.00493, "medRel": 0.000249, "maxRel": 0.0123, "bias": -0.000104}, "wind": {"title": "Near-surface wind speed (GEOS-FP)", "unit": "m/s", "enc": "lin", "n": 1638, "frames": 7, "r": 0.9999997, "medae": 0.00249, "max": 0.005, "p99": 0.00496, "medRel": 0.000459, "maxRel": 0.055, "bias": -7.15e-05}, "co": {"title": "Carbon monoxide, CO (GEOS-CF)", "unit": "ppbv", "enc": "log", "n": 1638, "frames": 7, "r": 0.99999868, "medae": 0.0431, "max": 0.472, "p99": 0.211, "medRel": 0.000593, "maxRel": 0.00115, "bias": -0.00659}, "o3": {"title": "Near-surface ozone, O3 (GEOS-CF)", "unit": "ppbv", "enc": "lin", "n": 1638, "frames": 7, "r": 0.99999997, "medae": 0.0026, "max": 0.00499, "p99": 0.00495, "medRel": 8.18e-05, "maxRel": 0.000769, "bias": 6.83e-06}, "pm25": {"title": "Fine particulate matter, PM2.5 (GEOS-CF)", "unit": "µg/m³", "enc": "log", "n": 1638, "frames": 7, "r": 0.99999975, "medae": 0.00174, "max": 0.0665, "p99": 0.0358, "medRel": 0.000552, "maxRel": 0.00115, "bias": -0.000165}, "nox": {"title": "Nitrogen oxides, NOx (GEOS-CF)", "unit": "ppbv", "enc": "log", "n": 1638, "frames": 7, "r": 0.99999978, "medae": 1.52e-05, "max": 0.0096, "p99": 0.00283, "medRel": 0.0006, "maxRel": 0.00115, "bias": 1.67e-05}}};
/* NASA's exact numbers (EJN, as the site shows them) against independent records at the same 234 places and hours (ERA5 for temperature,
   humidity and wind; CAMS for ozone, CO and PM2.5), every 8th NASA frame from 25 Oct 2026 to the last hour each reference covered (run 10 Nov 2026).
   This measures NASA's models against other scientists' models, not the website. Measured; graded with the same thresholds as ACC. */
var ACC_MODEL = {"run": "10 November 2026", "res": {"t2m": {"title": "Near-surface air temperature (GEOS-FP)", "ref": "ERA5", "unit": "°C", "n": 936, "r": 0.993, "medae": 0.56, "bias": 0.196, "land": 0.99, "sea": 0.997}, "q2m": {"title": "Near-surface humidity (GEOS-FP)", "ref": "ERA5", "unit": "g/kg", "n": 936, "r": 0.989, "medae": 0.396, "bias": 0.0699, "land": 0.982, "sea": 0.993}, "wind": {"title": "Near-surface wind speed (GEOS-FP)", "ref": "ERA5", "unit": "m/s", "n": 936, "r": 0.957, "medae": 0.72, "bias": -0.307, "land": 0.797, "sea": 0.958}, "o3": {"title": "Near-surface ozone, O3 (GEOS-CF)", "ref": "CAMS", "unit": "ppb", "n": 1404, "r": 0.777, "medae": 4.12, "bias": 1.38, "land": 0.671, "sea": 0.865}, "co": {"title": "Carbon monoxide, CO (GEOS-CF)", "ref": "CAMS", "unit": "ppb", "n": 1404, "r": 0.342, "rlog": 0.844, "medae": 12.4, "bias": -20.4}, "pm25": {"title": "Fine particulate matter, PM2.5 (GEOS-CF)", "ref": "CAMS", "unit": "µg/m³", "n": 1404, "r": 0.447, "medae": 5.36, "bias": -2.89, "logLand": 0.652, "logSea": 0.382}}};

/* ---------------- data: real events (Compare), run on the site on 8 Nov 2026 ---------------- */
var EVENTS = [
 { id: "aral", y1: 1990, y2: 2020, kind: "water", x: 94.4, y: 0.2,
  place: { name: "Aral Sea", full: "Aral Sea, Kazakhstan", lat: 45.081, lon: 60.22, bb: [43.375, 46.784, 58.199, 61.664], cls: "place", type: "locality" },
  found: "Water-like surface in the Landsat picture (central 100 km) fell from 94.4% (Landsat 5, August 1990) to 0.2% (Landsat 8, July and August 2020).",
  pub: "The Aral Sea shrank after the rivers feeding it were diverted for irrigation from the 1960s; the eastern lobe of the South Aral Sea disappeared completely in 2014.",
  src: [["NASA Earth Observatory: World of Change, Shrinking Aral Sea", "https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea/"]] },
 { id: "mead", y1: 2000, y2: 2022, kind: "water", x: 11.2, y: 5.9,
  place: { name: "Lake Mead", full: "Lake Mead, Nevada, United States", lat: 36.21, lon: -114.41, bb: [36.0, 36.43, -114.84, -114.1], cls: "water", type: "reservoir" },
  found: "Water-like surface in the Landsat picture of the lake area (83 km wide) fell from 11.2% (Landsat 5, 21 December 2000) to 5.9% (Landsat 9, 8 January 2022).",
  pub: "In July 2022 Lake Mead's water level was the lowest since 1937, when the reservoir was first being filled, at about 27% of capacity, after a long drought.",
  src: [["NASA Earth Observatory: Lake Mead Keeps Dropping (22 July 2022)", "https://science.nasa.gov/earth/earth-observatory/lake-mead-keeps-dropping-150111"]] },
 { id: "palm", y1: 2000, y2: 2011, kind: "water", x: 89.0, y: 76.9,
  place: { name: "Palm Jumeirah", full: "Palm Jumeirah, Dubai, United Arab Emirates", lat: 25.1, lon: 55.12, bb: [25.1, 25.14, 55.11, 55.15], cls: "place", type: "island" },
  found: "Water in the Landsat picture (7 km wide) fell from 89.0% (19 November 2000) to 76.9% (November 2011) as the artificial island was built on the sea.",
  pub: "NASA's Terra satellite showed the Palm Jumeirah island appearing from 2002, its palm shape complete by November 2003, and buildings on it by 2011.",
  src: [["NASA Earth Observatory: World of Change, Urbanization of Dubai", "https://science.nasa.gov/earth/earth-observatory/world-of-change/dubai/"]] },
 { id: "paris", y1: 2001, y2: 2003, kind: "heat", x: 31.2, y: 37.9, m: 0, n: 5,
  place: { name: "Paris", full: "Paris, Île-de-France, France", lat: 48.85, lon: 2.35, bb: [48.82, 48.9, 2.22, 2.47], cls: "place", type: "city" },
  found: "The hottest day rose from 31.2 °C (25 August 2001) to 37.9 °C on 12 August 2003; days of 35 °C or more rose from 0 to 5; the year's rainfall fell from 754 mm to 457 mm (NASA POWER).",
  pub: "Summer 2003 brought a record heat wave to France and much of Europe; NASA's Terra satellite measured the land in southern and eastern France about 10 °C hotter in July 2003 than in July 2001.",
  src: [["NASA Earth Observatory: European Heat Wave", "https://science.nasa.gov/earth/earth-observatory/european-heat-wave-3714/"], ["Encyclopaedia Britannica: European heat wave of 2003", "https://www.britannica.com/event/European-heat-wave-of-2003"]] },
 { id: "peshawar", y1: 2009, y2: 2010, kind: "rain", x: 31, y: 295, z: 101,
  place: { name: "Peshawar", full: "Peshawar, Khyber Pakhtunkhwa, Pakistan", lat: 34.01, lon: 71.58, bb: [33.92, 34.08, 71.37, 71.63], cls: "place", type: "city" },
  found: "July rainfall rose from 31 mm (2009) to 295 mm (2010); the wettest day was 101 mm on 28 July 2010 and the wettest three days 201 mm (69 mm in 2009); the year's rain rose from 510 mm to 731 mm (NASA POWER).",
  pub: "Monsoon rains far above normal in late July and early August 2010 caused the Indus floods, Pakistan's worst natural disaster to that date; Khyber Pakhtunkhwa received 250 to 300 mm of rain in 36 hours.",
  src: [["NASA Earth Observatory: Unusually Intense Monsoon Rains (12 August 2010)", "https://science.nasa.gov/earth/earth-observatory/unusually-intense-monsoon-rains-45177/"], ["Al Jazeera: Scores dead in Pakistan floods (29 July 2010)", "https://www.aljazeera.com/news/2010/7/29/scores-dead-in-pakistan-floods"]] }
];
/* ---------------- data: one-click datasets (checked: every frame has a reading at these places) ---------------- */
var EXAMPLES = [
 { id: "delhi", mode: "g:pm25", lat: 28.61, lon: 77.21, name: "New Delhi, India", title: "Air pollution over New Delhi", text: "NASA GEOS-CF fine particles (PM2.5), hourly: the smog rises and falls with every day and night." },
 { id: "sahara", mode: "g:t2m", lat: 23.0, lon: 12.0, name: "Sahara Desert, Niger", title: "Day and night in the Sahara", text: "NASA GEOS-FP air temperature, hourly: hot days and cool nights in the desert." },
 { id: "punjab", mode: "g:ndvi", lat: 30.9, lon: 75.85, name: "Punjab farmland, India", title: "Two harvests a year in Punjab", text: "NASA VIIRS vegetation since December 2023: the fields turn green and are harvested twice a year." },
 { id: "phoenix", mode: "n:air", lat: 33.45, lon: -112.07, name: "Phoenix, United States", y1: 1981, title: "A warming city: Phoenix since 1981", text: "NASA POWER air temperature record since 1981, one step a year." }
];

/* ---------------- styles, buttons and panels ---------------- */
function inject() {
 var css = document.createElement("style");
 css.textContent = "#exb,#accb{background:rgba(8,11,16,.85);color:var(--amber);border:1px solid var(--amber);padding:8px 14px;font-size:13px;width:auto}#exb:hover,#accb:hover,#exb[aria-expanded=true],#accb[aria-expanded=true]{background:var(--amber);color:#1a1205}" +
  ".rsp{position:fixed;right:16px;bottom:70px;z-index:40;width:620px;max-width:calc(100% - 32px);max-height:calc(100% - 100px);overflow-y:auto;background:linear-gradient(180deg,#151c28,#0c1118);border:1px solid #6b5426;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.6);padding:14px 18px;color:var(--bone);font-size:14px;line-height:1.5}.rsp[hidden]{display:none}" +
  ".rsp header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;position:sticky;top:-14px;background:#141b26;padding:6px 0;z-index:1}.rsp header b{font:600 18px/1.2 'Iowan Old Style',Georgia,serif;color:var(--amber)}.rsp .rsx{width:auto;background:transparent;border:0;color:var(--bone);font-size:22px;padding:0 4px;cursor:pointer}" +
  ".rsp h3{font:600 15px/1.3 'Iowan Old Style',Georgia,serif;color:var(--amber);margin:16px 0 6px}.rsp p{margin:6px 0}.rsp small,.rsp .mute{color:var(--mute);font-size:12.5px}.rsp a{color:var(--amber)}" +
  ".excard{border:1px solid #2a3240;border-radius:8px;padding:10px 12px;margin:8px 0;background:#0d121a}.excard b{display:block;margin-bottom:2px}.excard button{width:auto;margin-top:6px;padding:6px 12px;font-size:13px}" +
  ".acctab{width:100%;border-collapse:collapse;font-size:12.5px;margin:6px 0}.acctab th,.acctab td{border-bottom:1px solid #222a36;padding:5px 6px;text-align:left;vertical-align:top}.acctab th{color:var(--mute);font-weight:600}.acctab td.n{text-align:right;white-space:nowrap}" +
  ".accgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin:8px 0}.accgrid figure{margin:0;border:1px solid #222a36;border-radius:8px;padding:6px;background:#0b0f15}.accgrid figcaption{font-size:11.5px;color:var(--mute);margin-bottom:4px}.accgrid canvas{width:100%;height:160px;display:block}" +
  ".acctag{display:inline-block;font-size:11px;padding:1px 7px;border-radius:9px;margin-left:6px;vertical-align:1px}.acctag.g{background:#1f3a26;color:#9fe0ab}.acctag.m{background:#3a3420;color:#f0d58a}.acctag.w{background:#3d2020;color:#ffb0a4}" +
  "#whyline{margin:8px 0 2px;font-size:13px;line-height:1.5;color:var(--bone)}#whyline b{color:var(--amber)}@media(max-width:640px){.rsp{right:8px;left:8px;width:auto;bottom:64px}}";
 document.head.appendChild(css);
 var row = $("bbtns");
 var mk = function (id, txt, title, ctl) { var b = document.createElement("button"); b.id = id; b.type = "button"; b.textContent = txt; b.title = title; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", ctl); if (row) row.insertBefore(b, row.firstChild); else document.body.appendChild(b); return b };
 var ab = mk("accb", "Accuracy", "How accurate is the site? Tests against independent records and real events", "accp"), eb = mk("exb", "Examples", "One-click examples of NASA data and real events", "exp");
 var mkp = function (id, title) { var p = document.createElement("section"); p.id = id; p.className = "rsp"; p.hidden = true; p.setAttribute("aria-label", title); p.innerHTML = '<header><b>' + esc(title) + '</b><button class="rsx" type="button" aria-label="Close">&times;</button></header><div class="rsb"></div>'; document.body.appendChild(p); p.querySelector(".rsx").addEventListener("click", function () { panel(id, false) }); return p };
 mkp("exp", "Try an example"); mkp("accp", "How accurate is this?");
 eb.addEventListener("click", function () { panel("exp", $("exp").hidden) }); ab.addEventListener("click", function () { panel("accp", $("accp").hidden) });
 document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!$("exp").hidden) panel("exp", false); if (!$("accp").hidden) panel("accp", false) } });
 /* the "why" line under "What you're hearing" */
 var hb = $("hearBox"), kd = $("kd"); if (hb && kd && !$("whyline")) { var w = document.createElement("p"); w.id = "whyline"; w.setAttribute("aria-live", "off"); kd.parentNode.insertBefore(w, kd.nextSibling) }
 setInterval(whyUpdate, 1000);
}
function panel(id, open) {
 var p = $(id), b = $(id === "exp" ? "exb" : "accb"); if (!p) return;
 if (open) { var other = id === "exp" ? "accp" : "exp"; if ($(other) && !$(other).hidden) panel(other, false); if (id === "exp") renderExamples(); else renderAccuracy(); }
 p.hidden = !open; if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
 if (open) setTimeout(function () { try { p.querySelector(".rsx").focus() } catch (e) {} }, 30);
}
function srcLinks(src) { return src.map(function (s) { return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a>" }).join("; ") }
function renderExamples() {
 var b = $("exp").querySelector(".rsb");
 b.innerHTML = '<p class="mute">Each example sets the place, the dataset and the years for you, then starts the music. You can change anything afterwards.</p><h3>Listen to NASA data</h3>' +
  EXAMPLES.map(function (x) { return '<div class="excard"><b>' + esc(x.title) + '</b><span class="mute">' + esc(x.text) + ' Place: ' + esc(x.name) + '.</span><br><button type="button" data-ex="' + x.id + '">Play this example</button></div>' }).join("") +
  '<h3>Compare two years: real events</h3><p class="mute">Each was checked against published reports; the numbers below are what the site measured when we ran it (8 November 2026).</p>' +
  EVENTS.map(function (e) { return '<div class="excard"><b>' + esc(e.place.name) + ", " + e.y1 + " and " + e.y2 + '</b><span>' + esc(e.found) + '</span><br><span class="mute">Reported: ' + esc(e.pub) + " Source: " + srcLinks(e.src) + '</span><br><button type="button" data-ev="' + e.id + '">Run this comparison</button></div>' }).join("");
 b.querySelectorAll("button[data-ex]").forEach(function (bt) { bt.addEventListener("click", function () { var x = EXAMPLES.filter(function (z) { return z.id === bt.dataset.ex })[0]; panel("exp", false); runExample(x) }) });
 b.querySelectorAll("button[data-ev]").forEach(function (bt) { bt.addEventListener("click", function () { var x = EVENTS.filter(function (z) { return z.id === bt.dataset.ev })[0]; panel("exp", false); runEvent(x) }) });
}
/* ---------------- running examples ---------------- */
function runExample(x, opts) {
 opts = opts || {};
 try { if (window.CMPX && CMPX.isOpen()) { CMPX.stop(); CMPX.close(true) } } catch (e) {}
 var s0 = window.series, hit = { lat: x.lat, lon: x.lon, name: x.name, cls: "place", type: "city", bb: null };
 var y2 = x.y1 ? new Date().getFullYear() - 1 : undefined;
 if (opts.ba && window.BAX && BAX.exPlay) return BAX.exPlay(hit, x.mode, x.y1, y2);
 try { geoApply(hit) } catch (e) { return Promise.resolve(false) }
 if (window.BAX && BAX.playQuiet) return BAX.playQuiet({ mode_id: x.mode, from_year: x.y1, to_year: y2 }, s0).then(function (t) { return true }).catch(function () { return false });
 return Promise.resolve(false);
}
function runEvent(e) {
 var X = window.CMPX; if (!X) return Promise.resolve(false);
 try { if (window.tplaying && typeof stopPlay === "function") stopPlay() } catch (er) {}
 X.open(true); try { $("cmpa").value = "0"; $("cmpm").value = "1-12" } catch (er) {}
 X.pick(e.place, true); X.setYears(e.y1, e.y2);
 return X.setup();
}

/* ---------------- accuracy panel ---------------- */
function fx(v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (+v).toFixed(d) }
/* sea surface temperature correlates very highly but its readings are stretched (about 1.5 °C at the warm end), so it is graded moderate */
function grade(k) { var c = ACC[k].coloured, r = (k === "pm25" || k === "co") && ACC[k].logAll ? ACC[k].logAll.r : c.r; return k === "pm25" ? "w" : k === "sst" ? "m" : r >= .93 ? "g" : r >= .6 ? "m" : "w" }
function gradeText(g) { return g === "g" ? "strong agreement" : g === "m" ? "moderate agreement" : "weak agreement" }
function accRows() {
 return Object.keys(ACC).map(function (k) { var a = ACC[k], c = a.coloured, lg = a.logAll, g = grade(k);
  return "<tr><td>" + esc(a.title) + '<span class="acctag ' + g + '">' + gradeText(g) + "</span></td><td>" + esc(a.ref) + '</td><td class="n">' + c.n.toLocaleString("en-US") + '</td><td class="n">' + fx(c.r, 3) + (lg ? "<br><small>log: " + fx(lg.r, 3) + "</small>" : "") + '</td><td class="n">' + fx(c.medae, 2) + " " + esc(a.unit) + '</td><td class="n">' + fx(c.mae, 2) + '</td><td class="n">' + (c.bias > 0 ? "+" : "") + fx(c.bias, 2) + "</td></tr>" }).join("");
}
function renderAccuracy() {
 var b = $("accp").querySelector(".rsb"), keys = Object.keys(ACC), tot = keys.reduce(function (s, k) { return s + ACC[k].coloured.n }, 0);
 var NS = numSets();
 b.innerHTML = (NS.length ? '<p>In EIC mode the site uses <b>NASA\'s own numbers</b> for ' + esc(NS.map(function (d) { return d.title }).join(", ")) + ': the exact values NASA drew those pictures from, saved from NASA\'s server together with the frames, at the NASA grid point nearest your pin. ' +
   'For the other datasets, or if those numbers cannot be loaded, it reads the <b>colours</b> of NASA\'s Earth Information Center pictures and turns them back into values with NASA\'s own colour bars, and says so.</p>' + srvTable() + modelTable() + numTable(NS)
   : '<p>In EIC mode the site reads the <b>colours</b> of NASA\'s Earth Information Center pictures and turns them back into values with NASA\'s own colour bars.</p>') +
  '<h3>' + (NS.length ? "The backup method, reading NASA\'s pictures by colour: compared with other scientists\' records" : "Reading NASA\'s pictures by colour: agreement with independent records") + '</h3><p>' + (NS.length ? "The site reads colours only when NASA\'s numbers cannot be loaded (and for sea surface temperature, which has no saved numbers). " : "") + 'To check the colour reading, we read ' + tot.toLocaleString("en-US") + ' points from NASA\'s frames exactly as the site does and compared each with an independent scientific record at the same place and hour (test run ' + ACC_META.run + '). For ozone, carbon monoxide and PM2.5 the reference (CAMS) is a different scientists\' model of the same air, so part of the difference is the two models disagreeing, not the reading.</p>' +
  '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>NASA EIC dataset</th><th>Compared with</th><th>Points</th><th>Correlation</th><th>Typical difference (median)</th><th>Average difference</th><th>Average offset (site minus reference)</th></tr></thead><tbody>' + accRows() + "</tbody></table></div>" +
  '<p class="mute">Correlation 1 means the two records rise and fall together perfectly. The differences include real differences between NASA\'s model and the reference record, not only reading errors: two good records of the same air never agree exactly.</p>' +
  '<div class="accgrid">' + keys.map(function (k) { return '<figure><figcaption>' + esc(ACC[k].title) + (ACC[k].binLog ? " (logarithmic)" : "") + '</figcaption><canvas id="accc_' + k + '" aria-label="Agreement chart for ' + esc(ACC[k].title) + '"></canvas></figure>' }).join("") + '</div><p class="mute">Each chart: the reference value across, the site\'s reading up. Dots are averages, bars the middle half of the readings, the line is perfect agreement.</p>' +
  keys.map(function (k) { return "<p><b>" + esc(ACC[k].title) + ":</b> " + esc(ACC_NOTE[k]) + "</p>" }).join("") +
  '<h3>Tested against real events</h3><p class="mute">We ran Compare mode on five well-documented events. In every case the site\'s own measurements move the way published reports describe.</p>' +
  EVENTS.map(function (e) { return '<div class="excard"><b>' + esc(e.place.name) + ", " + e.y1 + " and " + e.y2 + '</b>The site measured: ' + esc(e.found) + '<br><span class="mute">Reported: ' + esc(e.pub) + " Source: " + srcLinks(e.src) + '</span><br><button type="button" data-ev="' + e.id + '">Run it yourself</button></div>' }).join("") +
  '<h3>How the test was done</h3><p class="mute">Places: ' + esc(ACC_META.grid) + ". Timing: " + esc(ACC_META.timing) + " References: " + esc(ACC_META.refs) + " Ozone and carbon monoxide from CAMS were converted from micrograms per cubic metre to parts per billion at 25 °C and 1 atmosphere. Readings at the uncoloured ends of NASA's scales (calm wind, low ozone) are scored separately. Gaps where a colour matched no colour on NASA's bar (labels, map lines) are left out, as on the site.</p>";
 b.querySelectorAll("button[data-ev]").forEach(function (bt) { bt.addEventListener("click", function () { var x = EVENTS.filter(function (z) { return z.id === bt.dataset.ev })[0]; panel("accp", false); runEvent(x) }) });
 setTimeout(function () { keys.forEach(function (k) { try { accChart($("accc_" + k), ACC[k]) } catch (e) {} }) }, 30);
}
function accChart(c, a) {
 var r = c.getBoundingClientRect(), dp = window.devicePixelRatio || 1, w = Math.max(120, r.width), h = Math.max(100, r.height); c.width = w * dp; c.height = h * dp; var x = c.getContext("2d"); x.setTransform(dp, 0, 0, dp, 0, 0);
 var B = a.bins, lo = Math.min.apply(null, B.map(function (b) { return Math.min(b[0], b[3]) })), hi = Math.max.apply(null, B.map(function (b) { return Math.max(b[0], b[4]) })), pad = (hi - lo) * .06; lo -= pad; hi += pad;
 var L = 30, Bm = 18, X = function (v) { return L + (v - lo) / (hi - lo) * (w - L - 6) }, Y = function (v) { return h - Bm - (v - lo) / (hi - lo) * (h - Bm - 6) };
 x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1; x.strokeRect(L, 6, w - L - 6, h - Bm - 6);
 x.strokeStyle = "rgba(224,164,58,.6)"; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(X(lo), Y(lo)); x.lineTo(X(hi), Y(hi)); x.stroke(); x.setLineDash([]);
 x.strokeStyle = "#7fb0ff"; x.fillStyle = "#cfe0ff"; B.forEach(function (b) { x.beginPath(); x.moveTo(X(b[0]), Y(b[3])); x.lineTo(X(b[0]), Y(b[4])); x.stroke(); x.beginPath(); x.arc(X(b[0]), Y(b[2]), 3, 0, 7); x.fill() });
 x.fillStyle = "rgba(255,255,255,.5)"; x.font = "10px sans-serif"; var f = function (v) { return a.binLog ? (Math.pow(10, v) >= 10 ? Math.round(Math.pow(10, v)) : Math.pow(10, v).toFixed(1)) : Math.round(v) };
 x.fillText(f(lo + pad), L, h - 5); x.fillText(f(hi - pad), w - 30, h - 5); x.fillText(f(hi - pad), 2, 14); x.fillText(f(lo + pad), 2, h - Bm);
}
/* datasets whose current frames have NASA's own numbers saved (get_eic_frames.py num_update) */
function srvTable() {
 var K = Object.keys(ACC_NASA.res); if (!K.length) return "";
 var tot = K.reduce(function (s, k) { return s + ACC_NASA.res[k].n }, 0);
 return '<h3>What the site shows, checked against NASA\'s own server</h3><p>On ' + esc(ACC_NASA.run) + ' we fetched ' + tot.toLocaleString("en-US") + ' values fresh from NASA\'s own data server (the GEOS OPeNDAP server at NASA Goddard) and compared each with what the site shows for the same place and hour: 234 places around the world, 7 frames per dataset spread from the first to the last. The hour of every frame was confirmed on NASA\'s server.</p>' +
  '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>Dataset</th><th>Checks</th><th>Correlation</th><th>Typical difference</th><th>Largest difference</th></tr></thead><tbody>' +
  K.map(function (k) { var a = ACC_NASA.res[k], big = a.enc === "log";
   return "<tr><td>" + esc(a.title) + '<span class="acctag ' + (a.r >= .999 ? "g" : a.r >= .93 ? "m" : "w") + '">' + gradeText(a.r >= .999 ? "g" : a.r >= .93 ? "m" : "w") + '</span></td><td class="n">' + a.n.toLocaleString("en-US") + '</td><td class="n">' + (Math.floor(a.r * 1e6) / 1e6).toFixed(6) + '</td><td class="n">' + (big ? fx(a.medRel * 100, 2) + "%" : fx(a.medae, 3) + " " + esc(a.unit)) + '</td><td class="n">' + (big ? fx(a.maxRel * 100, 2) + "%" : fx(a.max, 3) + " " + esc(a.unit)) + "</td></tr>" }).join("") +
  '</tbody></table></div><p class="mute">The only differences come from rounding when the numbers are stored for the website: to 0.01 of a unit for temperature, humidity, wind and ozone, and to about 3 significant figures for carbon monoxide, PM2.5 and nitrogen oxides (shown as a percentage). This checks that the site shows NASA\'s numbers correctly; how close NASA\'s model is to other scientists\' records is a separate question, answered further down.</p>';
}
function modelTable() {
 var K = Object.keys(ACC_MODEL.res), gr = function (a) { var r = a.rlog || a.r; return r >= .93 ? "g" : r >= .6 ? "m" : "w" };
 return '<h3>How NASA\'s models compare with other scientists\' records (using NASA\'s exact numbers)</h3><p>This compares NASA\'s own numbers, not the website: on ' + esc(ACC_MODEL.run) + ' NASA\'s exact values at the same 234 places were compared with ERA5 (ECMWF) for weather and CAMS (Copernicus) for air quality, at the same hours. Differences here are differences between scientific models.</p>' +
  '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>Dataset</th><th>Reference</th><th>Pairs</th><th>Correlation</th><th>Typical difference</th><th>NASA minus reference</th></tr></thead><tbody>' +
  K.map(function (k) { var a = ACC_MODEL.res[k], g = gr(a); return "<tr><td>" + esc(a.title) + '<span class="acctag ' + g + '">' + gradeText(g) + '</span></td><td>' + esc(a.ref) + '</td><td class="n">' + a.n.toLocaleString("en-US") + '</td><td class="n">' + fx(a.r, 3) + (a.rlog ? " (log " + fx(a.rlog, 3) + ")" : "") + '</td><td class="n">' + fx(a.medae, 2) + " " + esc(a.unit) + '</td><td class="n">' + (a.bias > 0 ? "+" : "") + fx(a.bias, 2) + " " + esc(a.unit) + "</td></tr>" }).join("") +
  '</tbody></table></div><p class="mute">Temperature, humidity and wind agree strongly (over the sea 0.958 to 0.997; over land, where mountains and coasts change the weather within one grid cell, 0.797 to 0.990). Ozone and carbon monoxide agree moderately: NASA\'s GEOS-CF has more ozone than CAMS over land and less carbon monoxide almost everywhere. PM2.5 agrees weakly: over land moderately on a log scale (0.652), but over the open ocean NASA\'s PM2.5 (at 35% relative humidity) is about half of CAMS\'s. These are genuine differences between two models, not reading errors.</p>';
}
function numSets() { var m = window.GAL && GAL.man; return ((m && m.datasets) || []).filter(function (d) { return window.EJN && EJN.ok(d) }) }
function numTable(NS) {
 return '<h3>NASA\'s own numbers: checked against NASA\'s pictures</h3><p class="mute">Before saving, the numbers for the first, middle and last frame are compared with NASA\'s picture at thousands of places. Rank correlation 1 means every place is in the same order in both. The hour of each frame is accepted only if it fits better than 1 hour or 1 day either side.</p>' +
  '<div style="overflow-x:auto"><table class="acctab"><thead><tr><th>Dataset</th><th>NASA source of the numbers</th><th>Frames</th><th>Rank correlation with the picture (first / middle / last frame)</th><th>Typical difference from the picture\'s colour</th></tr></thead><tbody>' +
  NS.map(function (d) { var n = d.num, c = n.check || {}, md = c.middle && c.middle.median_diff;
   return "<tr><td>" + esc(d.title) + "</td><td>" + esc(n.what || "") + '<br><small class="mute">' + esc((n.times[0] || "") + " to " + (n.times[n.times.length - 1] || "")) + '</small></td><td class="n">' + n.times.length + '</td><td class="n">' + ["first", "middle", "last"].map(function (k) { return c[k] ? fx(c[k].rho, 4) : "n/a" }).join(" / ") + '</td><td class="n">' + (md === undefined || md === null ? "n/a" : fx(md, 2) + " " + esc(n.unit)) + "</td></tr>" }).join("") +
  '</tbody></table></div><p class="mute">The small difference is the limit of reading a value back from a colour (the colour bar\'s step size and small unevenness in how NASA\'s colour bar image maps to values), not an error in NASA\'s numbers: these are the values NASA drew the picture from.</p>';
}
/* plain summary for blind assistance and the report */
function accSummaryEN() {
 return Object.keys(ACC).map(function (k) { var a = ACC[k], c = a.coloured; return a.title + ": " + c.n + " points against " + a.ref + "; correlation " + fx(c.r, 2) + ", typical difference " + fx(c.medae, 1) + " " + a.unit + "." }).join(" ");
}
/* the accuracy note shown with each EIC dataset in EIC mode */
function accNote(key) { var nd = numSets().filter(function (d) { return d.key === key })[0]; if (nd) { var sv = ACC_NASA.res[key]; return " Readings are NASA's own numbers (" + nd.num.what + "), saved from NASA with these frames; colour reading is only the backup." + (sv ? " Checked against NASA's own server (" + sv.n.toLocaleString("en-US") + " checks at 234 places and 7 hours): " + (sv.enc === "log" ? "within " + fx(sv.maxRel * 100, 2) + "%" : "within " + fx(sv.max, 3) + " " + sv.unit) + " (" + gradeText(sv.r >= .999 ? "g" : sv.r >= .93 ? "m" : "w") + "; see Accuracy)." : "") } var a = ACC[key]; if (!a) return ""; var c = a.coloured; return " Accuracy check (" + ACC_META.run + "): against " + a.ref + " at " + c.n.toLocaleString("en-US") + " points, correlation " + fx(c.r, 2) + ", typical difference " + fx(c.medae, 1) + " " + a.unit + " (" + gradeText(grade(key)) + "; see Accuracy)." }

/* ---------------- why it sounds like this ---------------- */
function nm(m) { try { return noteName(m) } catch (e) { return "" } }
/* structured: { bpm, note, ch: "bright|mixed|dark", r: { k: ..., values } } */
function whyParts() {
 /* the data's target signal T (the sound glides to it within a second or two); H if T is not set */
 var h = typeof T === "number" && isFinite(T) ? T : typeof H === "number" && isFinite(H) ? H : null, out = { r: { k: "none" } };
 if (h !== null) { out.bpm = Math.round(58 + h * 42); out.note = nm(58 + h * 26); out.ch = h >= .66 ? "bright" : h >= .33 ? "mixed" : "dark"; out.sig = Math.round(h * 100) }
 try {
  var X = window.CMPX;
  if (X && X.isOpen() && X.C.data && X.C.play) { var D = X.C.data, k = X.C.play.k, n = 365, i = Math.min(n - 1, Math.floor((X.C.pos[k] || 0) * n)), Y = k === "a" ? D.A : D.B, day = (Y.days[i] || {}).d, m = day ? +day.slice(5, 7) : 1;
   if (k === "d") { out.r = { k: "cmpd", day: day, a: D.y2, b: D.y1, verdict: D.over && D.over.verdict }; return out }
   var t7 = Y.t7 && Y.t7[i], p7 = null, s = 0, c = 0; for (var j = Math.max(0, i - 3); j <= Math.min(n - 1, i + 3); j++) { var v = Y.days[j] && Y.days[j].pr; if (v !== null && v !== undefined) { s += v; c++ } } p7 = c ? s / c : null;
   out.r = { k: "cmp", day: day, dt: t7 !== null && t7 !== undefined ? t7 - D.N.t[m] : null, dp: p7 !== null && D.N.p[m] !== null ? p7 - D.N.p[m] : null }; return out }
  if (window.MUTE && !(X && X.isOpen() && X.C.play)) { out.r = { k: "none" }; return out }
  if (!window.series || !series.length || typeof idx !== "number" || !series[idx]) return out;
  var x = series[idx];
  if (window.EICON) {
   if (window.EICWAIT) return out;
   var col = EIC.col || {}, title = col.title || col.id || "", sad = $("epol") && $("epol").value === "sad";
   if (col._gal) { var pos = x.pos !== undefined && x.pos !== null ? x.pos : window.EICPOS; out.r = { k: "eic", mode: title, pct: pos === null || pos === undefined ? null : Math.round(pos * 100), val: x.v !== null ? x.pv : null, est: !!x.est, sad: sad, below: col._gal.below && x.t === col._gal.below.t } }
   else if (x.pos !== null && x.pos !== undefined) out.r = { k: "eicr", mode: title, pct: Math.round(x.pos * 100), est: !!x.est, sad: sad };
   else out.r = { k: "eicz", mode: title, z: x.z, est: !!x.est, sad: sad };
   return out;
  }
  if (window.mode === "global") { out.r = { k: "glob", an: x.an, y: x.y, m: x.m }; return out }
  var lay = $("lay") ? $("lay").value : "vis", sea = lay === "sst" || lay === "sea";
  out.r = { k: sea ? "sea" : lay === "vis" ? "land" : "air", an: sea ? x.ans : x.an, pr: x.pr, y: x.y, m: x.m };
 } catch (e) {}
 return out;
}
function sg(v, d) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d) }
function whyEN(P) {
 P = P || whyParts(); var r = P.r;
 if (!P.bpm) return "";
 var snd = "<b>Why it sounds like this:</b> tempo " + P.bpm + " beats a minute, melody around " + P.note + ", " + P.ch + " chords (signal " + P.sig + " of 100). ";
 if (r.k === "none") return snd + "Nothing is driving the music yet: pick a dataset and drop a pin.";
 if (r.k === "eic") { if (r.below) return snd + esc(r.mode) + " at your pin is below the lowest colour on NASA's scale, the quietest end of the music."; return snd + esc(r.mode) + " at your pin is " + r.pct + "% of the way up NASA's colour scale" + (r.val ? " (" + esc(r.val) + ")" : "") + (r.est ? ", estimated from the nearest NASA readings" : "") + "; for this dataset, higher values sound " + (r.sad ? "lower and sadder." : "higher and brighter.") }
 if (r.k === "eicr") return snd + esc(r.mode) + " at your pin is " + r.pct + "% of the way up the dataset's display range" + (r.est ? " (estimated)" : "") + "; higher values sound " + (r.sad ? "lower and sadder." : "higher and brighter.");
 if (r.k === "eicz") return snd + esc(r.mode) + " at your pin is " + (r.z === null || r.z === undefined ? "near" : Math.abs(r.z).toFixed(1) + " standard deviations " + (r.z >= 0 ? "above" : "below")) + " its usual value here" + (r.est ? " (estimated)" : "") + "; higher values sound " + (r.sad ? "lower and sadder." : "higher and brighter.");
 if (r.k === "glob") return snd + "The whole Earth's temperature is " + (r.an === null || r.an === undefined ? "unknown here" : sg(r.an, 2) + " °C compared with 1951–1980 (NASA GISTEMP)") + "; warmer than that sounds lower and sadder.";
 if (r.k === "air" || r.k === "land" || r.k === "sea") { var what = r.k === "sea" ? "The sea's skin temperature" : "The 12-month average air temperature"; return snd + what + " here is " + (r.an === null || r.an === undefined ? "not available" : sg(r.an, 2) + " °C compared with this place's 1981–2010 normal") + (r.k === "land" ? "; rain counts too (wetter than normal sounds brighter)" : "") + "; warmer than normal sounds lower and sadder." }
 if (r.k === "cmp") return snd + "On " + r.day + " the week's average temperature was " + (r.dt === null ? "unknown" : sg(r.dt, 1) + " °C") + " and rain " + (r.dp === null ? "unknown" : sg(r.dp, 1) + " mm a day") + " compared with this place's normal for the month; cooler and wetter sounds brighter.";
 if (r.k === "cmpd") return snd + "The difference track is brighter on days when " + r.a + " was cooler or wetter than " + r.b + " on the same date, and darker when it was hotter or drier; it is shifted " + (r.verdict === "worse" ? "darker because " + r.a + " was worse overall" : r.verdict === "better" ? "brighter because " + r.a + " was better overall" : r.verdict === "none" ? "not at all, because no overall verdict could be given" : "little, because the years were about the same overall") + ".";
 return snd;
}
var lastWhy = "";
function whyUpdate() { var e = $("whyline"); if (!e || e.offsetParent === null) return; var t = whyEN(); if (t !== lastWhy) { lastWhy = t; e.innerHTML = t } }

/* ---------------- statistics for the research report (checked against SciPy) ---------------- */
var ST = (function () {
 function lgamma(x) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, .1208650973866179e-2, -.5395239384953e-5], y = x, t = x + 5.5; t -= (x + .5) * Math.log(t); var s = 1.000000000190015; for (var j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x) }
 function betacf(a, b, x) { var MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300, qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; var h = d;
  for (var m = 1; m <= MAXIT; m++) { var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
   aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; var del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break } return h }
 function ibeta(x, a, b) { if (x <= 0) return 0; if (x >= 1) return 1; var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b }
 function tp(t, df) { if (!isFinite(t) || !(df > 0)) return null; return ibeta(df / (df + t * t), df / 2, .5) }
 function tq(alpha, df) { var lo = 0, hi = 1000; for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (tp(mid, df) > alpha) lo = mid; else hi = mid } return (lo + hi) / 2 }
 function erfc(x) { var z = Math.abs(x), t = 1 / (1 + .5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (.37409196 + t * (.09678418 + t * (-.18628806 + t * (.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-.82215223 + t * .17087277))))))))); return x >= 0 ? r : 2 - r }
 function zp(z) { return erfc(Math.abs(z) / Math.SQRT2) }
 function clean(a) { return a.filter(function (v) { return v !== null && v !== undefined && isFinite(v) }) }
 function mean(a) { a = clean(a); return a.length ? a.reduce(function (s, v) { return s + v }, 0) / a.length : null }
 function sd(a) { a = clean(a); var n = a.length; if (n < 2) return null; var m = mean(a); return Math.sqrt(a.reduce(function (s, v) { return s + (v - m) * (v - m) }, 0) / (n - 1)) }
 function pct(a, p) { a = clean(a).slice().sort(function (x, y) { return x - y }); if (!a.length) return null; var k = (a.length - 1) * p, f = Math.floor(k), c = Math.ceil(k); return a[f] + (a[c] - a[f]) * (k - f) }
 function r1(a) { var m = mean(a); if (m === null) return 0; var num = 0, den = 0; for (var i = 0; i < a.length; i++) { if (a[i] === null || a[i] === undefined || !isFinite(a[i])) continue; den += (a[i] - m) * (a[i] - m); if (i > 0 && a[i - 1] !== null && a[i - 1] !== undefined && isFinite(a[i - 1])) num += (a[i] - m) * (a[i - 1] - m) } return den > 0 ? num / den : 0 }
 function neff(n, r) { r = Math.max(-.99, Math.min(.99, r)); return Math.max(2, Math.min(n, n * (1 - r) / (1 + r))) }
 function paired(A, B) { var d = []; for (var i = 0; i < Math.min(A.length, B.length); i++) d.push(A[i] === null || B[i] === null || A[i] === undefined || B[i] === undefined || !isFinite(A[i]) || !isFinite(B[i]) ? null : A[i] - B[i]);
  var dd = clean(d), n = dd.length; if (n < 10) return null; var m = mean(dd), s = sd(dd), r = r1(d), ne = neff(n, r), se = s / Math.sqrt(ne), t = se > 0 ? m / se : 0, df = ne - 1, tc = tq(.05, df);
  return { n: n, mean: m, sd: s, r1: r, neff: ne, se: se, t: t, df: df, p: tp(t, df), lo: m - tc * se, hi: m + tc * se, dz: s > 0 ? m / s : null } }
 /* rank test; the variance is inflated by (1 + r1) / (1 - r1) for day-to-day persistence (r1 = mean lag-1 autocorrelation of the two series) */
 function mwu(A, B) { var a = clean(A), b = clean(B), n1 = a.length, n2 = b.length; if (n1 < 8 || n2 < 8) return null; var ra = Math.max(0, Math.min(.9, (r1(A) + r1(B)) / 2)), infl = Math.sqrt((1 + ra) / (1 - ra)); var all = a.map(function (v) { return [v, 0] }).concat(b.map(function (v) { return [v, 1] })).sort(function (x, y) { return x[0] - y[0] }), N = all.length, ranks = new Array(N), tie = 0;
  for (var i = 0; i < N;) { var j = i; while (j + 1 < N && all[j + 1][0] === all[i][0]) j++; var rk = (i + j) / 2 + 1, tc = j - i + 1; for (var k = i; k <= j; k++) ranks[k] = rk; if (tc > 1) tie += tc * tc * tc - tc; i = j + 1 }
  var R1 = 0; for (var q = 0; q < N; q++) if (all[q][1] === 0) R1 += ranks[q]; var U1 = R1 - n1 * (n1 + 1) / 2, mu = n1 * n2 / 2, sig = Math.sqrt(n1 * n2 / 12 * ((N + 1) - tie / (N * (N - 1)))), z0 = sig > 0 ? (U1 - mu) / sig : 0, z = z0 / infl;
  return { U: U1, z: z, z0: z0, rho: ra, p: zp(z), n1: n1, n2: n2, r: z0 / Math.sqrt(N) } }
 /* rA, rB: lag-1 autocorrelation of each series after removing the seasonal cycle */
 function ks(A, B, rA, rB) { var a = clean(A).sort(function (x, y) { return x - y }), b = clean(B).sort(function (x, y) { return x - y }); if (a.length < 10 || b.length < 10) return null; var i = 0, j = 0, D = 0;
  while (i < a.length && j < b.length) { var x = Math.min(a[i], b[j]); while (i < a.length && a[i] <= x) i++; while (j < b.length && b[j] <= x) j++; D = Math.max(D, Math.abs(i / a.length - j / b.length)) }
  var na = neff(a.length, rA === undefined ? r1(A) : rA), nb = neff(b.length, rB === undefined ? r1(B) : rB), en = Math.sqrt(na * nb / (na + nb)), lam = (en + .12 + .11 / en) * D, p = 0, sg = 1;
  for (var k = 1; k <= 100; k++) { var term = 2 * sg * Math.exp(-2 * k * k * lam * lam); p += term; if (Math.abs(term) < 1e-10) break; sg = -sg } return { D: D, p: Math.max(0, Math.min(1, p)), na: na, nb: nb } }
 function prop(x1, n1, x2, n2, rho) { if (!n1 || !n2) return null; var p1 = x1 / n1, p2 = x2 / n2, pp = (x1 + x2) / (n1 + n2), r = Math.max(0, Math.min(.9, rho || 0)), se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2) * (1 + r) / (1 - r)); if (!(se > 0)) return { p1: p1, p2: p2, z: 0, p: 1, rho: r }; var z = (p1 - p2) / se; return { p1: p1, p2: p2, z: z, p: zp(z), rho: r } }
 /* departure from a 31-day running mean: removes the seasonal cycle before measuring persistence */
 function deseason(a) { return a.map(function (v, i) { if (v === null || v === undefined || !isFinite(v)) return null; var s = 0, n = 0; for (var j = Math.max(0, i - 15); j <= Math.min(a.length - 1, i + 15); j++) if (a[j] !== null && a[j] !== undefined && isFinite(a[j])) { s += a[j]; n++ } return v - s / n }) }
 return { mean: mean, sd: sd, pct: pct, r1: r1, neff: neff, paired: paired, mwu: mwu, ks: ks, prop: prop, tp: tp, tq: tq, zp: zp, deseason: deseason };
})();

/* the SI essay (Markdown) as sections: [{ h, body }] */
function ovSections(text) {
 var out = [], cur = { h: "", body: [] };
 String(text || "").split(/\r?\n/).forEach(function (l) { var m = l.match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/); if (m) { if (cur.h || cur.body.join("").trim()) out.push(cur); cur = { h: m[1].replace(/\*+/g, "").trim(), body: [] } } else cur.body.push(l) });
 if (cur.h || cur.body.join("").trim()) out.push(cur);
 return out.map(function (s) { return { h: s.h, body: s.body.join("\n").replace(/\*\*?|__/g, "").replace(/^\s*[-*]\s+/gm, "• ").replace(/\n{3,}/g, "\n\n").trim() } }).filter(function (s) { return s.body || s.h });
}

/* ---------------- the PDF research report ---------------- */
var JSPDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
function loadJsPdf() { if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF); return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = JSPDF_URL; s.onload = function () { if (window.jspdf && window.jspdf.jsPDF) res(window.jspdf.jsPDF); else rej(new Error("the PDF library did not start")) }; s.onerror = function () { rej(new Error("the PDF library could not be downloaded")) }; document.head.appendChild(s) }) }
/* the PDF's built-in fonts hold only Western European letters: everything else is spelt out or replaced */
function L1(s) {
 return String(s === undefined || s === null ? "" : s).replace(/[−‒–]/g, "-").replace(/—/g, " - ").replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'").replace(/…/g, "...").replace(/•/g, "-").replace(/≈/g, "~").replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/→/g, "->").replace(/₂/g, "2").replace(/₃/g, "3").replace(/₄/g, "4").replace(/₀/g, "0").replace(/₅/g, "5").replace(/⁻¹/g, "^-1").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]{2,}/g, function (m) { return "^" + m.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, function (c) { return "0123456789-"["⁰¹²³⁴⁵⁶⁷⁸⁹⁻".indexOf(c)] }) }).replace(/[⁴⁵⁶⁷⁸⁹⁰]/g, function (c) { return "^" + "0123456789"["⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)] }).replace(/ /g, " ").replace(/[^\u0000-ÿ]/g, "?");
}
function nonLatinShare(s) { s = String(s || ""); var n = 0; for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 0x24f) n++; return s.length ? n / s.length : 0 }
function pfmt(p) { if (p === null || p === undefined || !isFinite(p)) return "n/a"; return p < .001 ? "< 0.001" : p.toFixed(3) }
function f(v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (+v).toFixed(d === undefined ? 1 : d) }
function sgn(v, d) { return v === null || v === undefined || !isFinite(v) ? "n/a" : (v > 0 ? "+" : "") + (+v).toFixed(d === undefined ? 1 : d) }
function dmy(s) { if (!s) return "n/a"; var d = new Date(s + "T00:00:00Z"), M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; return isNaN(d) ? s : d.getUTCDate() + " " + M[d.getUTCMonth()] + " " + d.getUTCFullYear() }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16).toUpperCase().padStart(8, "0") }
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/* page layout */
function Lay(doc) { this.doc = doc; this.W = 595.28; this.H = 841.89; this.M = 56; this.cw = this.W - 2 * this.M; this.y = this.M + 6; this.fig = 0; this.tab = 0 }
Lay.prototype.need = function (h) { if (this.y + h > this.H - this.M - 18) { this.doc.addPage(); this.y = this.M + 6 } };
Lay.prototype.h1 = function (t) { var d = this.doc; this.need(40); this.y += 10; d.setFont("times", "bold"); d.setFontSize(13.5); d.setTextColor(20, 20, 20); d.text(L1(t), this.M, this.y); this.y += 6; d.setDrawColor(150, 120, 60); d.setLineWidth(.6); d.line(this.M, this.y, this.M + this.cw, this.y); this.y += 14 };
Lay.prototype.h2 = function (t) { var d = this.doc; this.need(30); this.y += 4; d.setFont("times", "bold"); d.setFontSize(11.5); d.setTextColor(30, 30, 30); d.text(L1(t), this.M, this.y); this.y += 14 };
Lay.prototype.p = function (t, o) { o = o || {}; var d = this.doc, fs = o.size || 10.3, lh = fs * 1.38; d.setFont("times", o.style || "normal"); d.setFontSize(fs); d.setTextColor(o.grey ? 90 : 25, o.grey ? 90 : 25, o.grey ? 90 : 25);
 var lines = d.splitTextToSize(L1(t), this.cw - (o.indent || 0)); for (var i = 0; i < lines.length; i++) { this.need(lh); d.text(lines[i], this.M + (o.indent || 0), this.y, o.justify && i < lines.length - 1 ? { align: "justify", maxWidth: this.cw - (o.indent || 0) } : undefined); this.y += lh } this.y += o.after === undefined ? 5 : o.after };
Lay.prototype.bullets = function (arr, o) { var self = this; arr.forEach(function (t) { var d = self.doc, fs = (o && o.size) || 10, lh = fs * 1.36; d.setFont("times", "normal"); d.setFontSize(fs); d.setTextColor(25, 25, 25); var lines = d.splitTextToSize(L1(t), self.cw - 14); lines.forEach(function (l, i) { self.need(lh); if (i === 0) d.text("-", self.M + 3, self.y); d.text(l, self.M + 14, self.y); self.y += lh }); self.y += 2 }); this.y += 3 };
Lay.prototype.caption = function (kind, t) { var n = kind === "Figure" ? ++this.fig : ++this.tab; this.p(kind + " " + n + ". " + t, { size: 9, style: "italic", grey: true, after: 6 }); return n };
/* cols: [{ t, w (fraction), a }]; rows: arrays of strings; o.group rows: { g: "title" } */
Lay.prototype.table = function (cols, rows, o) {
 o = o || {}; var d = this.doc, fs = o.size || 8.6, lh = fs * 1.3, pad = 3.2, self = this, W = this.cw, xs = [], x = this.M;
 cols.forEach(function (c) { xs.push(x); x += c.w * W });
 var head = function () { d.setFont("times", "bold"); d.setFontSize(fs); var hl = cols.map(function (c) { return d.splitTextToSize(L1(c.t), c.w * W - 2 * pad) }), hh = Math.max.apply(null, hl.map(function (l) { return l.length })) * lh + 2 * pad;
  self.need(hh + lh * 2 + 2 * pad); d.setFillColor(236, 232, 222); d.rect(self.M, self.y, W, hh, "F"); d.setTextColor(20, 20, 20); hl.forEach(function (l, i) { d.text(l, cols[i].a === "r" ? xs[i] + cols[i].w * W - pad : xs[i] + pad, self.y + pad + fs * .95, cols[i].a === "r" ? { align: "right" } : undefined) }); self.y += hh; d.setDrawColor(120, 120, 120); d.setLineWidth(.6); d.line(self.M, self.y, self.M + W, self.y) };
 head();
 rows.forEach(function (r, ri) {
  if (r && r.g) { d.setFont("times", "bold"); d.setFontSize(fs); var gl = d.splitTextToSize(L1(r.g), W - 2 * pad), gh = gl.length * lh + 2 * pad; if (self.y + gh > self.H - self.M - 18) { d.addPage(); self.y = self.M + 6; head() } d.setFillColor(247, 245, 240); d.rect(self.M, self.y, W, gh, "F"); d.setTextColor(60, 50, 30); d.text(gl, self.M + pad, self.y + pad + fs * .95); self.y += gh; return }
  d.setFont("times", "normal"); d.setFontSize(fs); var cl = r.map(function (v, i) { return d.splitTextToSize(L1(v), cols[i].w * W - 2 * pad) }), rh = Math.max.apply(null, cl.map(function (l) { return l.length })) * lh + 2 * pad;
  if (self.y + rh > self.H - self.M - 18) { d.addPage(); self.y = self.M + 6; head() }
  d.setTextColor(25, 25, 25); cl.forEach(function (l, i) { d.text(l, cols[i].a === "r" ? xs[i] + cols[i].w * W - pad : xs[i] + pad, self.y + pad + fs * .95, cols[i].a === "r" ? { align: "right" } : undefined) });
  self.y += rh; d.setDrawColor(215, 212, 205); d.setLineWidth(.3); d.line(self.M, self.y, self.M + W, self.y) });
 d.setDrawColor(120, 120, 120); d.setLineWidth(.6); d.line(this.M, this.y, this.M + W, this.y); this.y += 15;
};
/* a chart frame: returns plotting helpers */
Lay.prototype.plot = function (h, xr, yr, o) {
 o = o || {}; var d = this.doc; this.need(h + 40); var L = this.M + 34, T = this.y + 14, Wd = this.cw - 40, Hd = h - 22, self = this;
 var X = function (v) { return L + (v - xr[0]) / (xr[1] - xr[0]) * Wd }, Y = function (v) { return T + Hd - (v - yr[0]) / (yr[1] - yr[0]) * Hd };
 d.setDrawColor(140, 140, 140); d.setLineWidth(.4); d.rect(L, T, Wd, Hd, "S");
 d.setFont("times", "normal"); d.setFontSize(7.5); d.setTextColor(70, 70, 70);
 (o.yt || []).forEach(function (v) { var yy = Y(v); d.setDrawColor(225, 225, 225); d.setLineWidth(.3); d.line(L, yy, L + Wd, yy); d.text(L1(o.yf ? o.yf(v) : String(v)), L - 3, yy + 2.5, { align: "right" }) });
 (o.xt || []).forEach(function (t) { d.text(L1(t[1]), X(t[0]), T + Hd + 9, { align: "center" }) });
 if (o.yl) { d.text(L1(o.yl), this.M, T - 6) }
 this.y = T + Hd + 26;
 return { X: X, Y: Y, L: L, T: T, Wd: Wd, Hd: Hd, d: d };
};
Lay.prototype.legend = function (items) { var d = this.doc, x = this.M + 34; d.setFont("times", "normal"); d.setFontSize(8); items.forEach(function (it) { d.setDrawColor(it.c[0], it.c[1], it.c[2]); d.setFillColor(it.c[0], it.c[1], it.c[2]); d.setLineWidth(1.6); if (it.dash) d.setLineDashPattern([3, 2], 0); d.line(x, this.y - 3, x + 16, this.y - 3); d.setLineDashPattern([], 0); d.setTextColor(40, 40, 40); d.text(L1(it.t), x + 20, this.y); x += 26 + d.getTextWidth(L1(it.t)) + 10 }, this); this.y += 10 };

function seasonOf(m) { return m === 12 || m <= 2 ? 0 : m <= 5 ? 1 : m <= 8 ? 2 : 3 }
async function makePdf(opts) {
 opts = opts || {};
 var X = window.CMPX, st = $("cmppdfst"), D = X && X.C && X.C.data, say = function (t) { if (st && !opts.quiet) st.textContent = t };
 if (!D) { say("Set up a comparison first."); return { ok: false, why: "nodata" } }
 if (!D.pics) { say("The pictures are still loading; the report will include them, so wait until the page says Ready."); return { ok: false, why: "loading" } }
 var btn = $("cmppdf"); if (btn) btn.disabled = true;
 try {
  /* the in-depth research (deep.js) goes into the report: run it first if it has not been run for this comparison */
  if (window.EJD && X.deep && !(D.deep && D.deep.done)) {
   say("Running the in-depth research for the report first (about two minutes)…");
   var poll = setInterval(function () { if (D.deep && D.deep.status) say("In-depth research for the report: " + D.deep.status) }, 700);
   try { await X.deep(false) } catch (e) {} finally { clearInterval(poll) }
   if (X.C.data !== D) { say("The comparison changed; press the button again."); return { ok: false, why: "changed" } }
  }
  say("Preparing the report…");
  var JS = await loadJsPdf(), doc = new JS({ unit: "pt", format: "a4", compress: true }), Ly = new Lay(doc);
  /* opts.collect: an array that receives the report's words in reading order (headings, paragraphs, captions, tables),
     used by audioreport.js to make the spoken version from exactly the same content */
  if (opts.collect) { var CL = opts.collect, quiet = 0, w1 = Ly.h1, w2 = Ly.h2, wp = Ly.p, wb = Ly.bullets, wc = Ly.caption, wt = Ly.table;
   Ly.h1 = function (t) { CL.push({ k: "h1", t: t }); return w1.apply(this, arguments) }; Ly.h2 = function (t) { CL.push({ k: "h2", t: t }); return w2.apply(this, arguments) };
   Ly.p = function (t) { if (!quiet) CL.push({ k: "p", t: t }); return wp.apply(this, arguments) };
   Ly.bullets = function (arr) { (arr || []).forEach(function (t) { CL.push({ k: "p", t: t }) }); quiet++; try { return wb.apply(this, arguments) } finally { quiet-- } };
   Ly.caption = function (kind, t) { CL.push({ k: "cap", t: kind + ". " + t }); quiet++; try { return wc.apply(this, arguments) } finally { quiet-- } };
   Ly.table = function (cols, rows) { CL.push({ k: "table", cols: (cols || []).map(function (c) { return c.t }), rows: rows || [] }); quiet++; try { return wt.apply(this, arguments) } finally { quiet-- } } }
  var P = D.place, B = D.B, A = D.A, Bs = B.s, As = A.s, PI = D.pics || {}, EX = D.ext || {}, now = new Date(), gen = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  var rid = "EJ-" + hash(P.name + P.lat + P.lon + D.y1 + D.y2 + now.toISOString()), srcN = D.src === "power" ? "NASA POWER (MERRA-2 based), daily" : "ERA5 reanalysis (ECMWF), daily", kmTxt = D.km >= 10 ? Math.round(D.km) + " km" : D.km.toFixed(1) + " km";
  var g = function (Y, k) { return Y.days.map(function (x) { return x[k] === undefined ? null : x[k] }) };
  var T = { t: ST.paired(g(A, "t"), g(B, "t")), tx: ST.paired(g(A, "tx"), g(B, "tx")), tn: ST.paired(g(A, "tn"), g(B, "tn")), rh: ST.paired(g(A, "rh"), g(B, "rh")), ws: ST.paired(g(A, "ws"), g(B, "ws")), sw: ST.paired(g(A, "sw"), g(B, "sw")), td: ST.paired(g(A, "td"), g(B, "td")), cl: ST.paired(g(A, "cl"), g(B, "cl")) };
  var MW = ST.mwu(g(A, "pr"), g(B, "pr")), rds = function (Y, k) { return ST.r1(ST.deseason(g(Y, k))) }, KS = ST.ks(g(A, "tx"), g(B, "tx"), rds(A, "tx"), rds(B, "tx")), KSn = ST.ks(g(A, "tn"), g(B, "tn"), rds(A, "tn"), rds(B, "tn"));
  var wetB = g(B, "pr").filter(function (v) { return v !== null && v >= 1 }).length, wetA = g(A, "pr").filter(function (v) { return v !== null && v >= 1 }).length, nB = g(B, "pr").filter(function (v) { return v !== null }).length, nA = g(A, "pr").filter(function (v) { return v !== null }).length, wi = function (Y) { return g(Y, "pr").map(function (v) { return v === null ? null : v >= 1 ? 1 : 0 }) }, PR = ST.prop(wetA, nA, wetB, nB, (ST.r1(wi(A)) + ST.r1(wi(B))) / 2);
  var O = D.over || { parts: [], score: 0, verdict: "same" }, pb = PI.b, pa = PI.a;
  var RD = D.deep && D.deep.done ? D.deep : null, LTI = RD ? RD.items.filter(function (it) { return it.section === "lt" }) : [], HBI = RD ? RD.items.filter(function (it) { return it.section === "hab" }) : [];
  /* a figure from deep.js drawn on a white canvas and placed across the text width (maps a little narrower) */
  /* charts are drawn as vector lines and text (sharp at any zoom); maps as high-resolution PNG images (deep2.js EJD.pdfFig) */
  var deepFig = function (fig, cap) { var isMap = fig.type === "map", w = isMap ? Ly.cw * .8 : Ly.cw, h = isMap ? w * 860 / 940 : w * 520 / 1120;
   Ly.need(h + 26); var x0 = Ly.M + (Ly.cw - w) / 2;
   try { if (EJD.pdfFig) EJD.pdfFig(doc, fig, x0, Ly.y, w, h); else { var c = document.createElement("canvas"); c.width = isMap ? 1410 : 1680; c.height = isMap ? 1290 : 780; EJD.draw(c, fig, { dark: false, scale: 3 }); doc.addImage(c.toDataURL("image/png"), "PNG", x0, Ly.y, w, h) } } catch (e) { return }
   doc.setTextColor(0, 0, 0); doc.setDrawColor(0, 0, 0); doc.setLineWidth(.5); doc.setFont("times", "normal"); Ly.y += h + 6; Ly.caption("Figure", cap) };
  var deepItem = function (it) {
   Ly.p(it.title, { style: "bold", after: 2 }); Ly.p(it.text, { justify: true });
   (it.figs || []).forEach(function (fg) { deepFig(fg, it.title + (fg.caption ? ", " + fg.caption : "") + (fg.type === "map" ? ". Red dot: the point of analysis." + (fg.outline ? " Dark outline: mangroves in the 2000 map (Giri et al. 2011)." : "") + (fg.ring ? " Dashed circle: " + fg.ring + " km from the point." : "") + (fg.border ? " Dark line: the outline of the area studied (OpenStreetMap)." : "") : fg.trend ? ". Dashed line: Sen's slope trend." + (fg.mark ? " Dots: " + D.y1 + " and " + D.y2 + "." : "") + (fg.change ? " Purple dashed line: Pettitt change point." : "") : ".")) });
   if (it.table && it.table.rows.length) { var n = it.table.head.length, ws = n === 8 ? [.2, .09, .1, .1, .19, .09, .14, .09] : n === 4 ? [.4, .2, .22, .18] : it.table.head.map(function () { return 1 / n }); Ly.table(it.table.head.map(function (h, k) { return { t: h, w: ws[k], a: k ? "r" : undefined } }), it.table.rows); Ly.caption("Table", it.title + ".") }
  };

  /* ---- title block ---- */
  /* the title can take several lines for long place names; everything below it moves down */
  doc.setFont("times", "bold"); doc.setFontSize(19); var tl = doc.splitTextToSize(L1("Comparative environmental assessment of " + P.name), Ly.cw).slice(0, 4), th = 22 * tl.length, hh = 118 + th - 22;
  doc.setFillColor(28, 34, 46); doc.rect(0, 0, Ly.W, hh, "F");
  doc.setTextColor(224, 164, 58); doc.setFontSize(9); doc.text("EARTH JUKEBOX  -  RESEARCH REPORT", Ly.M, 36);
  doc.setTextColor(245, 240, 228); doc.setFontSize(19); tl.forEach(function (l, i) { doc.text(l, Ly.M, 62 + 22 * i) });
  doc.setFont("times", "normal"); doc.setFontSize(12.5); doc.text(L1(D.y1 + " compared with " + D.y2), Ly.M, 84 + th - 22);
  doc.setFontSize(8.5); doc.setTextColor(200, 196, 186); doc.text(L1("Report " + rid + "  |  generated " + gen + "  |  " + Math.abs(P.lat).toFixed(4) + (P.lat < 0 ? " S" : " N") + ", " + Math.abs(P.lon).toFixed(4) + (P.lon < 0 ? " W" : " E")), Ly.M, 104 + th - 22);
  Ly.y = 140 + th - 22;

  /* ---- abstract ---- */
  var ab = [];
  ab.push("This report compares " + P.full + " (" + P.lat.toFixed(3) + ", " + P.lon.toFixed(3) + ") in " + D.y1 + " and " + D.y2 + " using " + srcN + " climate data, satellite pictures of the surrounding area (" + kmTxt + " across), and records of greenhouse gases, air quality, natural events and earthquakes.");
  ab.push("The annual mean temperature was " + f(Bs.t, 2) + " °C in " + D.y1 + " and " + f(As.t, 2) + " °C in " + D.y2 + (T.t ? " (mean daily difference " + sgn(T.t.mean, 2) + " °C, 95% confidence interval " + sgn(T.t.lo, 2) + " to " + sgn(T.t.hi, 2) + " °C; paired test with autocorrelation correction, p " + (T.t.p < .001 ? "< 0.001" : "= " + pfmt(T.t.p)) + ")" : "") + ".");
  ab.push("Precipitation totalled " + Math.round(Bs.rain) + " mm and " + Math.round(As.rain) + " mm (" + sgn(Bs.pAnom, 0) + "% and " + sgn(As.pAnom, 0) + "% relative to the 1981–2010 normal); days with a maximum of 35 °C or more numbered " + Bs.hotDays + " and " + As.hotDays + ".");
  if (pb && pa && !!pb.modis === !!pa.modis && pb.water !== null && pa.water !== null && pb.water !== undefined && pa.water !== undefined) ab.push("In the " + (pb.modis ? "MODIS" : "Landsat") + " pictures, water-like surface covered " + f(pb.water * 100, 1) + "% and " + f(pa.water * 100, 1) + "% of the area, and green vegetation " + f(pb.veg * 100, 1) + "% and " + f(pa.veg * 100, 1) + "%.");
  ab.push(O.verdict === "none" ? (O.why === "wait" ? "No overall index is given yet: the satellite pictures were still loading." : "No overall index is given: " + P.name + " is mostly water, and its water could not be measured from two comparable pictures, so the weather alone would mislead.") : "On the site's fixed composite index, " + D.y2 + " scored " + sgn(O.score, 2) + " on a scale from -1 to +1 relative to " + D.y1 + " (" + (O.verdict === "worse" ? "worse" : O.verdict === "better" ? "better" : "about the same") + "). Two single years describe weather as well as climate; their difference is not a trend.");
  if (RD && RD.LT && RD.LT.idx.tm && RD.LT.idx.tm.full) { var lt0 = RD.LT.idx.tm.full; ab.push("In the ERA5 record since " + RD.LT.from + ", the annual mean temperature here changed by " + sgn(lt0.slope * 10, 2) + " °C per decade (Sen's slope; Mann-Kendall test corrected for autocorrelation, p " + (lt0.ph < .001 ? "< 0.001" : "= " + pfmt(lt0.ph)) + ").") }
  if (RD && RD.H) ab.push("Classified from NASA land cover as " + RD.H.label + ", the place was further studied with " + HBI.map(function (it) { return it.title.replace(/ \(.*$/, "").toLowerCase() }).join(", ") + ".");
  Ly.h2("Abstract"); Ly.p(ab.join(" "), { justify: true });
  Ly.p("Keywords: " + P.name + "; climate comparison; NASA POWER; reanalysis; Landsat; NDWI; NDVI; paired difference test; effective sample size; sonification.", { size: 9, style: "italic", grey: true });

  /* ---- 1. study area ---- */
  Ly.h1("1. Study area");
  Ly.p(P.full + ". The point of analysis is " + Math.abs(P.lat).toFixed(4) + "° " + (P.lat < 0 ? "S" : "N") + ", " + Math.abs(P.lon).toFixed(4) + "° " + (P.lon < 0 ? "W" : "E") + ". The pictures cover a box about " + kmTxt + " wide (west " + D.bb[0].toFixed(3) + "°, south " + D.bb[1].toFixed(3) + "°, east " + D.bb[2].toFixed(3) + "°, north " + D.bb[3].toFixed(3) + "°)" + (D.capped ? "; the place itself is wider, and its central 100 km is shown because wide-area pictures (NASA MODIS) begin only in 2000" : "") + ". The climate values describe one model grid cell around the point: about 0.5° × 0.625° (roughly 55 × 65 km) for NASA POWER, or 0.25° (about 25 km) for ERA5. They represent the area, not a single weather station.", { justify: true });

  if (RD && RD.H) Ly.p("Kind of place: " + RD.H.label + ". In NASA's MODIS land cover map for " + RD.H.year + " (IGBP classes, 500 m), the point itself is " + RD.H.pinName.toLowerCase() + ", and the 20 km around it is " + Object.keys(RD.H.share).sort(function (a, b) { return RD.H.share[b] - RD.H.share[a] }).slice(0, 4).map(function (k) { return (RD.H.share[k] * 100).toFixed(0) + "% " + EJD.IGBP[k].toLowerCase() }).join(", ") + (RD.H.mangrove > 0 ? "; mangroves cover " + (RD.H.mangrove * 100).toFixed(0) + "% of it in the global mangrove map for 2000 (Giri et al. 2011)" : "") + ". This classification chose the place-specific research in Section 3.8.", { justify: true });

  /* ---- 2. data and methods ---- */
  Ly.h1("2. Data and methods");
  Ly.h2("2.1 Climate data");
  Ly.p((D.src === "power" ? "Daily values for both years come from NASA's Prediction Of Worldwide Energy Resources (POWER) project (agroclimatology community, API version 2), which is based on the MERRA-2 reanalysis of NASA's Global Modeling and Assimilation Office with satellite-based solar radiation. Variables: 2 m air temperature (mean, maximum, minimum), corrected precipitation, 2 m relative humidity, 2 m wind speed, maximum 10 m wind, all-sky surface shortwave radiation (MJ/m² per day divided by 3.6 to give kWh/m²), cloud amount, root-zone soil wetness, 2 m dew point and aerosol optical depth at 550 nm." : "Daily values for both years come from the ERA5 global reanalysis of the European Centre for Medium-Range Weather Forecasts (Copernicus Climate Change Service), retrieved through the Open-Meteo archive interface. Variables: 2 m air temperature (mean, maximum, minimum), precipitation, 2 m relative humidity, 10 m wind (mean and gusts), surface shortwave radiation, cloud cover, dew point and soil moisture to 1 m. ERA5 is used for both years because " + (D.why || "NASA POWER was not suitable for this pair of years") + ", so both years are measured the same way.") + " Normals are monthly means for 1981–2010 from the same source. 29 February is removed so the two years align day by day (365 days each).", { justify: true });
  Ly.h2("2.2 Satellite pictures and surface shares");
  var picDesc = function (k, Y, pic) { if (!pic || !pic.used || !pic.used.length) return Y + ": no picture (" + (Y < 1982 ? "Landsat surface pictures begin in 1982" : D.km > 100 && Y < 2000 ? "wide-area MODIS pictures begin in 2000" : "no clear scene was found") + ")."; return Y + ": " + pic.used.map(function (u) { return u.wb ? u.sat + ", captured " + dmy(u.date) : u.sat + " " + dmy(u.date) + (u.modis ? "" : " (" + Math.round(u.cloud) + "% cloud in the scene; " + u.id + ")") }).join("; ") + (pic.statsFrom ? "; surface shares from Landsat " + pic.statsFrom.map(function (u) { return dmy(u.date) }).join(", ") : "") + "." };
  Ly.p("Pictures are chosen automatically for the clearest view in the chosen season, with the second year matched to the first year's time of year where possible. " + picDesc("b", D.y1, pb) + " " + picDesc("a", D.y2, pa), { justify: true });
  Ly.p("Water-like surface is the share of valid pixels with a Normalized Difference Water Index above zero, NDWI = (green - NIR) / (green + NIR) (McFeeters 1996), and green reflectance below 0.3; brighter pixels with NDWI above zero (snow, ice or cloud) are reported separately and not counted as water; green vegetation is the share with NDVI = (NIR - red) / (NIR + red) above 0.3 (Tucker 1979), computed from Landsat Collection 2 surface reflectance. Season, cloud, haze and differences between Landsat sensors (TM, ETM+, OLI) shift these shares by a few percentage points. Archive pictures have no near-infrared band, so their shares are taken from Landsat. For MODIS pictures (areas wider than 100 km, or when Landsat has no clear scene), water and green plants are classified from the NASA GIBS MODIS corrected-reflectance bands 7-2-1 picture of the same day and satellite (band 7, shortwave infrared 2.1 µm; band 2, near infrared 0.86 µm; band 1, red 0.65 µm): water where the near-infrared is no brighter than red light and the shortwave infrared is low, green plants where the near-infrared exceeds red light and (NIR - SWIR) / (NIR + SWIR) is above 0.3; missing and cloud-white pixels are excluded. This is a colour classification of 250 m pixels, so narrow rivers, cloud shadows and haze shift it by a few points; Landsat and MODIS shares are never compared with each other.", { justify: true });
  Ly.h2("2.3 Further records");
  Ly.p("Global annual mean carbon dioxide (Mauna Loa), methane and nitrous oxide from the NOAA Global Monitoring Laboratory; near-surface air quality from the Copernicus Atmosphere Monitoring Service (CAMS) global forecasts and analyses, whole years from 2023 only; natural events within about 550 km from NASA's Earth Observatory Natural Event Tracker (EONET, thin before about 2015); earthquakes of magnitude 4.5 and above within 300 km from the U.S. Geological Survey ComCat catalogue. Earthquakes are listed because they can change the land the pictures show, not because they relate to climate.", { justify: true });
  Ly.h2("2.4 Statistical methods");
  Ly.p("Because the two years are aligned by calendar day, differences are tested as paired daily differences (" + D.y2 + " minus " + D.y1 + " on the same date). Daily weather is autocorrelated, which makes naive tests too confident; each test therefore uses an effective sample size n_eff = n (1 - r1) / (1 + r1), where r1 is the lag-1 autocorrelation of the daily differences (Zwiers and von Storch 1995; Bretherton et al. 1999). The mean difference is tested with Student's t on n_eff - 1 degrees of freedom and reported with a 95% confidence interval and the standardized effect size d_z (mean difference divided by the standard deviation of the differences; Cohen 1988). Daily precipitation, which is skewed and has many dry days, is compared with the two-sided Mann-Whitney U test (normal approximation with tie correction; Mann and Whitney 1947), and the frequency of wet days (1 mm or more) with a two-proportion z test; in both, the variance is inflated by (1 + r1) / (1 - r1), where r1 is the mean lag-1 autocorrelation of the two daily series. The whole distributions of daily maximum and minimum temperature are compared with the two-sample Kolmogorov-Smirnov test (Smirnov 1948), with effective sample sizes from the lag-1 autocorrelation after removing the seasonal cycle (departures from a 31-day running mean). A p-value below 0.05 is called statistically significant; it means the difference is unlikely to be day-to-day noise within these two years, not that it reflects long-term climate change.", { justify: true });
  Ly.h2("2.5 Composite assessment");
  Ly.p("The site's overall verdict converts each change into a score from -1 (much worse) to +1 (much better) with a fixed rule, score = tanh(change / scale), and averages the scores with fixed weights (Section 3.6). Warmer than normal, more very hot days and hot nights, longer heat and dry spells, more heavy-rain days, less water or vegetation in the pictures, dirtier air and more carbon dioxide count as worse; for rain, a year closer to its normal counts as better, so both floods and droughts count as worse. Natural events and earthquakes are not scored because their records are not comparable over time. The rule and weights are a transparent design choice of this site, not an established index.", { justify: true });

  if (RD) {
   Ly.h2("2.6 Long-term record and climate extremes");
   Ly.p("Daily mean, maximum and minimum 2 m air temperature, precipitation, maximum 10 m wind speed and 0-7 cm soil moisture from 1 January 1950 to the end of the last complete year come from ECMWF's ERA5 reanalysis (Hersbach et al. 2020; 0.25° grid, the 'era5' model of the Open-Meteo historical API). For every complete year, annual means and climate-extreme indices are computed with the definitions of the WMO Expert Team on Climate Change Detection and Indices (ETCCDI; Zhang et al. 2011): TXx (hottest day), TX90p (share of days with a maximum above the calendar-day 90th percentile of 1961-1990, 5-day window, without the bootstrap), TR (nights with a minimum above 20 °C), PRCPTOT (precipitation on days with at least 1 mm), R20mm, Rx1day and CDD (longest run of days under 1 mm within the year), plus windy days (maximum wind at least 10.8 m/s, Beaufort 6).", { justify: true });
   Ly.p("Monotonic trends are tested with the Mann-Kendall test (Mann 1945; Kendall 1975) with the variance correction of Hamed and Rao (1998) for autocorrelation of the detrended ranks, applied only when it widens the uncertainty (a cautious choice), and their size is estimated with Sen's (1968) slope and its 95% confidence interval (Gilbert 1987) computed from the same variance, so interval and p-value agree. Trends are given for the whole record and since 1979, when satellite observations entered the reanalysis; earlier decades rest on fewer observations. The most likely change point is found with Pettitt's (1979) test. The test code reproduces SciPy and the reference algorithms to machine precision.", { justify: true });
   Ly.h2("2.7 Research for this kind of place");
   Ly.p("Several products are read from NASA's Global Imagery Browse Services (GIBS). GIBS draws each data value with a colour from a published colour map in which every colour stands for one value range or class, so reading the colours of a lossless map image recovers the value range exactly; colours not in the map are counted and excluded (none were found in testing), and open-ended classes (for example 'below 30 psu' or '1,000 or more people per km²') are treated as limits, not values. Per-pixel trends in the greenness map use the plain Mann-Kendall test and Sen's slope on each pixel's yearly highest NDVI. Other series use the same tests as Section 2.6. The products used for this place are listed with each result in Section 3.8 and in the references.", { justify: true });
  }

  /* ---- 3. results ---- */
  Ly.h1("3. Results");
  Ly.h2("3.1 Annual summary");
  var row = function (n, b, a, dd) { return [n, b, a, dd] }, rows = [];
  var Eb = Bs.ext || {}, Ea = As.ext || {};
  rows.push({ g: "Temperature" });
  rows.push(row("Mean temperature (°C)", f(Bs.t, 2), f(As.t, 2), sgn(As.t - Bs.t, 2)));
  rows.push(row("Mean daily maximum (°C)", f(Bs.tx, 2), f(As.tx, 2), sgn(As.tx - Bs.tx, 2)));
  rows.push(row("Mean daily minimum (°C)", f(Bs.tn, 2), f(As.tn, 2), sgn(As.tn - Bs.tn, 2)));
  rows.push(row("Anomaly against 1981–2010 (°C)", sgn(Bs.tAnom, 2), sgn(As.tAnom, 2), sgn(As.tAnom - Bs.tAnom, 2)));
  rows.push(row("Hottest day (°C, date)", Bs.hot ? f(Bs.hot.tx, 1) + ", " + dmy(Bs.hot.d) : "n/a", As.hot ? f(As.hot.tx, 1) + ", " + dmy(As.hot.d) : "n/a", Bs.hot && As.hot ? sgn(As.hot.tx - Bs.hot.tx, 1) : "n/a"));
  rows.push(row("Coldest night (°C, date)", Bs.cold ? f(Bs.cold.tn, 1) + ", " + dmy(Bs.cold.d) : "n/a", As.cold ? f(As.cold.tn, 1) + ", " + dmy(As.cold.d) : "n/a", Bs.cold && As.cold ? sgn(As.cold.tn - Bs.cold.tn, 1) : "n/a"));
  rows.push(row("Days with maximum >= 35 °C", String(Bs.hotDays), String(As.hotDays), sgn(As.hotDays - Bs.hotDays, 0)));
  rows.push(row("Nights with minimum >= 25 °C", String(Eb.hotN), String(Ea.hotN), sgn(Ea.hotN - Eb.hotN, 0)));
  rows.push(row("Longest run of days >= 35 °C", String(Eb.spell), String(Ea.spell), sgn(Ea.spell - Eb.spell, 0)));
  rows.push(row("Frost nights (minimum < 0 °C)", String(Bs.frost), String(As.frost), sgn(As.frost - Bs.frost, 0)));
  rows.push({ g: "Precipitation" });
  rows.push(row("Total (mm)", f(Bs.rain, 0), f(As.rain, 0), sgn(As.rain - Bs.rain, 0)));
  rows.push(row("Against 1981–2010 normal (%)", sgn(Bs.pAnom, 0), sgn(As.pAnom, 0), sgn(As.pAnom - Bs.pAnom, 0)));
  rows.push(row("Wet days (>= 1 mm)", String(Bs.rainy), String(As.rainy), sgn(As.rainy - Bs.rainy, 0)));
  rows.push(row("Wettest day (mm, date)", Bs.wet ? f(Bs.wet.pr, 1) + ", " + dmy(Bs.wet.d) : "n/a", As.wet ? f(As.wet.pr, 1) + ", " + dmy(As.wet.d) : "n/a", Bs.wet && As.wet ? sgn(As.wet.pr - Bs.wet.pr, 1) : "n/a"));
  rows.push(row("Wettest three consecutive days (mm)", f(Eb.w3, 1), f(Ea.w3, 1), sgn(Ea.w3 - Eb.w3, 1)));
  rows.push(row("Heavy-rain days (>= 50 mm) / very heavy (>= 100 mm)", Eb.heavy + " / " + Eb.vheavy, Ea.heavy + " / " + Ea.vheavy, sgn(Ea.heavy - Eb.heavy, 0) + " / " + sgn(Ea.vheavy - Eb.vheavy, 0)));
  rows.push(row("Longest dry spell (days < 1 mm)", String(Bs.dry), String(As.dry), sgn(As.dry - Bs.dry, 0)));
  rows.push({ g: "Air, wind, radiation, moisture" });
  rows.push(row("Relative humidity (%)", f(Bs.rh, 1), f(As.rh, 1), sgn(As.rh - Bs.rh, 1)));
  rows.push(row("Dew point (°C)", f(Eb.td, 1), f(Ea.td, 1), sgn(Ea.td - Eb.td, 1)));
  rows.push(row("Wind speed (m/s)", f(Bs.ws, 2), f(As.ws, 2), sgn(As.ws - Bs.ws, 2)));
  rows.push(row(D.src === "power" ? "Strongest daily maximum 10 m wind (m/s)" : "Strongest 10 m gust (m/s)", f(Eb.wmax, 1), f(Ea.wmax, 1), sgn(Ea.wmax - Eb.wmax, 1)));
  rows.push(row("Surface solar radiation (kWh/m² per day)", f(Bs.sw, 2), f(As.sw, 2), sgn(As.sw - Bs.sw, 2)));
  rows.push(row("Cloud cover (%)", f(Eb.cl, 0), f(Ea.cl, 0), sgn(Ea.cl - Eb.cl, 0)));
  rows.push(row(D.src === "power" ? "Root-zone soil wetness (0-1)" : "Soil moisture 0-1 m (m³/m³)", f(Eb.soil, 3), f(Ea.soil, 3), sgn(Ea.soil - Eb.soil, 3)));
  if (D.src === "power") rows.push(row("Aerosol optical depth, 550 nm (MERRA-2)", f(Eb.aod, 3), f(Ea.aod, 3), sgn(Ea.aod - Eb.aod, 3)));
  var gb = EX.gas && EX.gas.b, ga = EX.gas && EX.gas.a, qb = EX.aq && EX.aq.b, qa = EX.aq && EX.aq.a;
  rows.push({ g: "Atmospheric composition" });
  rows.push(row("CO2, global annual mean (ppm, NOAA)", f(gb && gb.co2, 2), f(ga && ga.co2, 2), gb && ga ? sgn(ga.co2 - gb.co2, 2) : "n/a"));
  rows.push(row("CH4, global annual mean (ppb, NOAA)", f(gb && gb.ch4, 1), f(ga && ga.ch4, 1), gb && ga && gb.ch4 && ga.ch4 ? sgn(ga.ch4 - gb.ch4, 1) : "n/a"));
  rows.push(row("N2O, global annual mean (ppb, NOAA)", f(gb && gb.n2o, 2), f(ga && ga.n2o, 2), gb && ga && gb.n2o && ga.n2o ? sgn(ga.n2o - gb.n2o, 2) : "n/a"));
  rows.push(row("PM2.5 at the place (µg/m³, CAMS)", f(qb && qb.pm2_5, 1), f(qa && qa.pm2_5, 1), qb && qa ? sgn(qa.pm2_5 - qb.pm2_5, 1) : "n/a"));
  rows.push(row("Days with PM2.5 above 15 µg/m³ (WHO 2021 daily guideline)", qb ? String(qb.pmDaysOver15) : "n/a", qa ? String(qa.pmDaysOver15) : "n/a", qb && qa ? sgn(qa.pmDaysOver15 - qb.pmDaysOver15, 0) : "n/a"));
  rows.push({ g: "Surface (pictures)" });
  var sh = function (o, k) { return o && o[k] !== null && o[k] !== undefined ? f(o[k] * 100, 1) : "n/a" };
  var mixP = pb && pa && !!pb.modis !== !!pa.modis, moP = (pb && pb.modis) || (pa && pa.modis);
  rows.push(row(moP && !mixP ? "Water, MODIS bands 7-2-1 (% of area)" : "Water-like surface, NDWI > 0 (% of area)", sh(pb, "water"), sh(pa, "water"), !mixP && pb && pa && pb.water !== null && pa.water !== null && pb.water !== undefined && pa.water !== undefined ? sgn((pa.water - pb.water) * 100, 1) + " points" : "n/a"));
  rows.push(row(moP && !mixP ? "Green plants, MODIS bands 7-2-1 (% of area)" : "Green vegetation, NDVI > 0.3 (% of area)", sh(pb, "veg"), sh(pa, "veg"), !mixP && pb && pa && pb.veg !== null && pa.veg !== null && pb.veg !== undefined && pa.veg !== undefined ? sgn((pa.veg - pb.veg) * 100, 1) + " points" : "n/a"));
  if (!moP || mixP) rows.push(row("Snow, ice or cloud: bright, NDWI > 0 (% of area)", sh(pb, "snow"), sh(pa, "snow"), pb && pa && pb.snow !== null && pa.snow !== null && pb.snow !== undefined && pa.snow !== undefined ? sgn((pa.snow - pb.snow) * 100, 1) + " points" : "n/a"));
  if (D.seasOK === false) rows.push({ g: "The two pictures were taken " + D.seasGap + " days apart in the year: their shares reflect the seasons as much as the years and are not scored in the composite assessment." });
  var Vb = EX.ev && EX.ev.b, Va = EX.ev && EX.ev.a, Qb = EX.eq && EX.eq.b, Qa = EX.eq && EX.eq.a;
  rows.push({ g: "Events" });
  rows.push(row("Natural events within ~550 km (NASA EONET)", Vb ? String(Vb.n) : "n/a", Va ? String(Va.n) : "n/a", Vb && Va ? sgn(Va.n - Vb.n, 0) : "n/a"));
  rows.push(row("Earthquakes M >= 4.5 within 300 km (USGS)", Qb ? Qb.n + (Qb.big ? " (largest M" + Qb.big.mag.toFixed(1) + ")" : "") : "n/a", Qa ? Qa.n + (Qa.big ? " (largest M" + Qa.big.mag.toFixed(1) + ")" : "") : "n/a", Qb && Qa ? sgn(Qa.n - Qb.n, 0) : "n/a"));
  Ly.table([{ t: "Quantity", w: .44 }, { t: String(D.y1), w: .19, a: "r" }, { t: String(D.y2), w: .19, a: "r" }, { t: "Difference", w: .18, a: "r" }], rows);
  Ly.caption("Table", "Annual statistics for " + P.name + ", " + D.y1 + " and " + D.y2 + ". Sources as in Section 2; n/a = not available for that year or place.");

  Ly.h2("3.2 Statistical tests");
  var trow = function (name, r, u, dp) { if (!r) return [name, "n/a", "n/a", "n/a", "n/a", "n/a"]; return [name, sgn(r.mean, dp) + " " + u, sgn(r.lo, dp) + " to " + sgn(r.hi, dp), f(r.neff, 0) + " (r1 = " + f(r.r1, 2) + ")", f(r.t, 2) + ", " + pfmt(r.p), f(r.dz, 2)] };
  Ly.table([{ t: "Daily variable (" + D.y2 + " minus " + D.y1 + ")", w: .25 }, { t: "Mean difference", w: .14, a: "r" }, { t: "95% confidence interval", w: .17, a: "r" }, { t: "Effective n (lag-1 autocorr.)", w: .17, a: "r" }, { t: "t, p (two-sided)", w: .15, a: "r" }, { t: "Effect size d_z", w: .12, a: "r" }],
   [trow("Mean temperature", T.t, "°C", 2), trow("Maximum temperature", T.tx, "°C", 2), trow("Minimum temperature", T.tn, "°C", 2), trow("Dew point", T.td, "°C", 2), trow("Relative humidity", T.rh, "%", 1), trow("Wind speed", T.ws, "m/s", 2), trow("Solar radiation", T.sw, "kWh/m²", 2), trow("Cloud cover", T.cl, "%", 1)]);
  Ly.caption("Table", "Paired daily differences with the effective-sample-size correction for autocorrelation. d_z: about 0.2 small, 0.5 medium, 0.8 large (Cohen 1988).");
  Ly.table([{ t: "Test", w: .34 }, { t: "Statistic", w: .3, a: "r" }, { t: "p (two-sided)", w: .16, a: "r" }, { t: "Reading", w: .2 }],
   [["Daily precipitation, Mann-Whitney U", MW ? "U = " + f(MW.U, 0) + ", z = " + f(MW.z, 2) + " (r1 = " + f(MW.rho, 2) + "), r = " + f(MW.r, 2) : "n/a", MW ? pfmt(MW.p) : "n/a", MW ? (MW.p < .05 ? (MW.z > 0 ? D.y2 + " wetter" : D.y2 + " drier") + " day to day" : "no clear difference") : ""],
    ["Wet-day frequency (>= 1 mm), two-proportion z", PR ? f(PR.p2 * 100, 1) + "% vs " + f(PR.p1 * 100, 1) + "%, z = " + f(PR.z, 2) + " (r1 = " + f(PR.rho, 2) + ")" : "n/a", PR ? pfmt(PR.p) : "n/a", PR ? (PR.p < .05 ? (PR.z > 0 ? "more" : "fewer") + " wet days in " + D.y2 : "no clear difference") : ""],
    ["Daily maximum distribution, Kolmogorov-Smirnov", KS ? "D = " + f(KS.D, 3) + " (n_eff " + f(KS.na, 0) + ", " + f(KS.nb, 0) + ")" : "n/a", KS ? pfmt(KS.p) : "n/a", KS ? (KS.p < .05 ? "distributions differ" : "no clear difference") : ""],
    ["Daily minimum distribution, Kolmogorov-Smirnov", KSn ? "D = " + f(KSn.D, 3) + " (n_eff " + f(KSn.na, 0) + ", " + f(KSn.nb, 0) + ")" : "n/a", KSn ? pfmt(KSn.p) : "n/a", KSn ? (KSn.p < .05 ? "distributions differ" : "no clear difference") : ""]]);
  Ly.caption("Table", "Distribution tests. In the Mann-Whitney row, r = z / sqrt(N) is an effect size and positive z means " + D.y2 + " had larger daily amounts.");
  var pc = function (Y, k, p) { return f(ST.pct(g(Y, k), p), 1) };
  Ly.table([{ t: "Percentile of daily values", w: .34 }, { t: "5th", w: .11, a: "r" }, { t: "25th", w: .11, a: "r" }, { t: "50th", w: .11, a: "r" }, { t: "75th", w: .11, a: "r" }, { t: "95th", w: .11, a: "r" }, { t: "99th", w: .11, a: "r" }],
   [["Maximum temperature " + D.y1 + " (°C)", pc(B, "tx", .05), pc(B, "tx", .25), pc(B, "tx", .5), pc(B, "tx", .75), pc(B, "tx", .95), pc(B, "tx", .99)], ["Maximum temperature " + D.y2 + " (°C)", pc(A, "tx", .05), pc(A, "tx", .25), pc(A, "tx", .5), pc(A, "tx", .75), pc(A, "tx", .95), pc(A, "tx", .99)],
    ["Minimum temperature " + D.y1 + " (°C)", pc(B, "tn", .05), pc(B, "tn", .25), pc(B, "tn", .5), pc(B, "tn", .75), pc(B, "tn", .95), pc(B, "tn", .99)], ["Minimum temperature " + D.y2 + " (°C)", pc(A, "tn", .05), pc(A, "tn", .25), pc(A, "tn", .5), pc(A, "tn", .75), pc(A, "tn", .95), pc(A, "tn", .99)],
    ["Precipitation on wet days " + D.y1 + " (mm)", f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .05), 1), f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .25), 1), f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .5), 1), f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .75), 1), f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .95), 1), f(ST.pct(g(B, "pr").filter(function (v) { return v !== null && v >= 1 }), .99), 1)],
    ["Precipitation on wet days " + D.y2 + " (mm)", f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .05), 1), f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .25), 1), f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .5), 1), f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .75), 1), f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .95), 1), f(ST.pct(g(A, "pr").filter(function (v) { return v !== null && v >= 1 }), .99), 1)]], { size: 8.4 });
  Ly.caption("Table", "Percentiles of the daily values (linear interpolation).");

  /* figure: daily temperature */
  Ly.h2("3.3 The year day by day");
  var all = B.t7.concat(A.t7).filter(function (v) { return v !== null && v !== undefined }), nts = []; for (var m0 = 1; m0 <= 12; m0++) if (D.N.t[m0] !== null && D.N.t[m0] !== undefined) nts.push(D.N.t[m0]);
  var lo = Math.floor(Math.min.apply(null, all.concat(nts)) - 1), hi = Math.ceil(Math.max.apply(null, all.concat(nts)) + 1), step = hi - lo > 30 ? 10 : hi - lo > 12 ? 5 : 2, yt = []; for (var v0 = Math.ceil(lo / step) * step; v0 <= hi; v0 += step) yt.push(v0);
  var xt = []; for (var mm = 0, cum = 0; mm < 12; cum += MD[mm], mm++) xt.push([cum + MD[mm] / 2, MONTHS[mm]]);
  var pl = Ly.plot(170, [0, 364], [lo, hi], { yt: yt, xt: xt, yl: "°C" });
  var dline = function (arr, c, dash) { var d = pl.d; d.setDrawColor(c[0], c[1], c[2]); d.setLineWidth(1.1); if (dash) d.setLineDashPattern([3, 2], 0); var st0 = null; arr.forEach(function (v, i) { if (v === null || v === undefined) { st0 = null; return } var p = [pl.X(i), pl.Y(v)]; if (st0) d.line(st0[0], st0[1], p[0], p[1]); st0 = p }); d.setLineDashPattern([], 0) };
  var nline = []; for (var di = 0, mi = 0, c2 = 0; di < 365; di++) { if (di >= c2 + MD[mi]) { c2 += MD[mi]; mi++ } nline.push(D.N.t[mi + 1]) }
  dline(nline, [150, 150, 150], true); dline(B.t7, [70, 110, 190]); dline(A.t7, [205, 120, 30]);
  Ly.legend([{ t: D.y1, c: [70, 110, 190] }, { t: D.y2, c: [205, 120, 30] }, { t: "1981–2010 monthly normal", c: [150, 150, 150], dash: true }]);
  Ly.caption("Figure", "Daily mean temperature at " + P.name + ", 7-day running mean, " + D.y1 + " and " + D.y2 + ", with this place's 1981–2010 monthly normal.");
  /* figure: monthly precipitation */
  var mpmax = Math.max(5, Math.max.apply(null, Bs.mp.slice(1).concat(As.mp.slice(1)).concat(D.N.p.slice(1).map(function (v, i) { return (v || 0) * MD[i] })))), stp = mpmax > 400 ? 100 : mpmax > 150 ? 50 : mpmax > 60 ? 20 : 10, yt2 = []; for (var u = 0; u <= mpmax * 1.08; u += stp) yt2.push(u);
  var pl2 = Ly.plot(150, [0, 12], [0, mpmax * 1.08], { yt: yt2, xt: MONTHS.map(function (n, i) { return [i + .5, n] }), yl: "mm" });
  for (var q = 1; q <= 12; q++) { var d2 = pl2.d, x0 = pl2.X(q - 1), wq = pl2.X(q) - x0; [[Bs.mp[q], [70, 110, 190], .14], [As.mp[q], [205, 120, 30], .5]].forEach(function (s) { if (s[0] === null || s[0] === undefined) return; d2.setFillColor(s[1][0], s[1][1], s[1][2]); d2.rect(x0 + wq * s[2], pl2.Y(s[0]), wq * .34, pl2.Y(0) - pl2.Y(s[0]), "F") });
   var nv = (D.N.p[q] || 0) * MD[q - 1]; d2.setDrawColor(60, 60, 60); d2.setLineWidth(1); d2.line(x0 + wq * .08, pl2.Y(nv), x0 + wq * .92, pl2.Y(nv)) }
  Ly.legend([{ t: D.y1, c: [70, 110, 190] }, { t: D.y2, c: [205, 120, 30] }, { t: "1981–2010 normal", c: [60, 60, 60] }]);
  Ly.caption("Figure", "Monthly precipitation totals at " + P.name + " with the 1981–2010 monthly normal (horizontal marks).");
  /* figure: distribution of daily maximum temperature */
  var tB = g(B, "tx").filter(function (v) { return v !== null }).sort(function (a, b) { return a - b }), tA = g(A, "tx").filter(function (v) { return v !== null }).sort(function (a, b) { return a - b });
  if (tB.length > 10 && tA.length > 10) { var l3 = Math.floor(Math.min(tB[0], tA[0])), h3 = Math.ceil(Math.max(tB[tB.length - 1], tA[tA.length - 1])), xt3 = [], s3 = h3 - l3 > 30 ? 10 : 5; for (var w3 = Math.ceil(l3 / s3) * s3; w3 <= h3; w3 += s3) xt3.push([w3, w3 + " °C"]);
   var pl3 = Ly.plot(140, [l3, h3], [0, 1], { yt: [0, .25, .5, .75, 1], yf: function (v) { return Math.round(v * 100) + "%" }, xt: xt3, yl: "share of days at or below" });
   [[tB, [70, 110, 190]], [tA, [205, 120, 30]]].forEach(function (s) { var d3 = pl3.d, prev = null; d3.setDrawColor(s[1][0], s[1][1], s[1][2]); d3.setLineWidth(1.2); s[0].forEach(function (v, i) { var p = [pl3.X(v), pl3.Y((i + 1) / s[0].length)]; if (prev) { d3.line(prev[0], prev[1], p[0], prev[1]); d3.line(p[0], prev[1], p[0], p[1]) } prev = p }) });
   Ly.legend([{ t: D.y1, c: [70, 110, 190] }, { t: D.y2, c: [205, 120, 30] }]);
   Ly.caption("Figure", "Empirical cumulative distribution of daily maximum temperature" + (KS ? " (Kolmogorov-Smirnov D = " + f(KS.D, 3) + ", p " + (KS.p < .001 ? "< 0.001" : "= " + pfmt(KS.p)) + ")" : "") + "."); }

  /* monthly and seasonal tables */
  Ly.h2("3.4 Monthly and seasonal values");
  var mrows = []; for (var k = 1; k <= 12; k++) mrows.push([MONTHS[k - 1], f(D.N.t[k], 1), f(Bs.mt[k], 1), f(As.mt[k], 1), Bs.mt[k] !== null && As.mt[k] !== null ? sgn(As.mt[k] - Bs.mt[k], 1) : "n/a", f((D.N.p[k] || 0) * MD[k - 1], 0), f(Bs.mp[k], 0), f(As.mp[k], 0), sgn(As.mp[k] - Bs.mp[k], 0)]);
  Ly.table([{ t: "Month", w: .1 }, { t: "Normal T (°C)", w: .11, a: "r" }, { t: D.y1 + " T", w: .11, a: "r" }, { t: D.y2 + " T", w: .11, a: "r" }, { t: "Diff. T", w: .1, a: "r" }, { t: "Normal P (mm)", w: .12, a: "r" }, { t: D.y1 + " P", w: .12, a: "r" }, { t: D.y2 + " P", w: .12, a: "r" }, { t: "Diff. P", w: .11, a: "r" }], mrows, { size: 8.2 });
  Ly.caption("Table", "Monthly mean temperature (T) and precipitation total (P), with 1981–2010 normals.");
  var SN = ["Dec-Jan-Feb (same calendar year)", "Mar-Apr-May", "Jun-Jul-Aug", "Sep-Oct-Nov"], sea = function (Y) { var o = [[], [], [], []], r = [0, 0, 0, 0]; Y.days.forEach(function (x) { var s = seasonOf(+x.d.slice(5, 7)); if (x.t !== null) o[s].push(x.t); if (x.pr !== null) r[s] += x.pr }); return { t: o.map(function (a) { return ST.mean(a) }), p: r } }, sb = sea(B), sa = sea(A);
  Ly.table([{ t: "Season", w: .32 }, { t: D.y1 + " T (°C)", w: .12, a: "r" }, { t: D.y2 + " T (°C)", w: .12, a: "r" }, { t: "Diff. T", w: .1, a: "r" }, { t: D.y1 + " P (mm)", w: .12, a: "r" }, { t: D.y2 + " P (mm)", w: .12, a: "r" }, { t: "Diff. P", w: .1, a: "r" }],
   SN.map(function (n, i) { return [n, f(sb.t[i], 1), f(sa.t[i], 1), sgn(sa.t[i] - sb.t[i], 1), f(sb.p[i], 0), f(sa.p[i], 0), sgn(sa.p[i] - sb.p[i], 0)] }), { size: 8.4 });
  Ly.caption("Table", "Seasonal means and totals (meteorological seasons; winter uses January, February and December of the same calendar year).");

  /* pictures */
  Ly.h2("3.5 Surface pictures");
  var cvb = $("cmpvb"), cva = $("cmpva"), img = function (c) { try { if (!c || !c.width) return null; var k = Math.min(1, 960 / c.width), o = document.createElement("canvas"); o.width = Math.round(c.width * k); o.height = Math.round(c.height * k); var ox = o.getContext("2d"); ox.fillStyle = "#ffffff"; ox.fillRect(0, 0, o.width, o.height); ox.drawImage(c, 0, 0, o.width, o.height); return o.toDataURL("image/jpeg", .8) } catch (e) { return null } }, ib = pb && pb.used && pb.used.length ? img(cvb) : null, ia = pa && pa.used && pa.used.length ? img(cva) : null;
  if (ib || ia) { var iw = (Ly.cw - 12) / 2, ih = iw * .75; Ly.need(ih + 30); var y0 = Ly.y; [[ib, D.y1, 0], [ia, D.y2, 1]].forEach(function (z) { var xx = Ly.M + z[2] * (iw + 12); if (z[0]) doc.addImage(z[0], "JPEG", xx, y0, iw, ih); else { doc.setDrawColor(180, 180, 180); doc.rect(xx, y0, iw, ih, "S"); doc.setFontSize(9); doc.text("No picture for " + z[1], xx + iw / 2, y0 + ih / 2, { align: "center" }) } doc.setFont("times", "bold"); doc.setFontSize(9); doc.setTextColor(30, 30, 30); doc.text(String(z[1]), xx, y0 + ih + 12) }); Ly.y = y0 + ih + 28;
   Ly.caption("Figure", "The area around " + P.name + " (about " + kmTxt + " across). " + picDesc("b", D.y1, pb) + " " + picDesc("a", D.y2, pa)) }
  else Ly.p("No surface pictures are available for these years and this area.", { grey: true });

  /* composite */
  Ly.h2("3.6 Composite assessment");
  var cr = O.parts.map(function (p0) { return [p0.name, (+p0.b).toFixed(p0.d) + p0.unit, (+p0.a).toFixed(p0.d) + p0.unit, sgn(p0.s, 2), f(p0.w, 2), sgn(p0.c, 3)] });
  if (cr.length) { Ly.table([{ t: "Factor", w: .36 }, { t: D.y1, w: .13, a: "r" }, { t: D.y2, w: .13, a: "r" }, { t: "Score (-1 to +1)", w: .14, a: "r" }, { t: "Weight", w: .1, a: "r" }, { t: "Contribution", w: .14, a: "r" }], cr);
   Ly.caption("Table", "Factors of the composite index, largest contributions first. " + (O.verdict === "none" ? "No overall score is given (mostly water, water not measurable from comparable pictures)" : "Overall score " + sgn(O.score, 3)) + " (" + (O.verdict === "none" ? "no verdict" : O.verdict === "worse" ? D.y2 + " worse than " + D.y1 : O.verdict === "better" ? D.y2 + " better than " + D.y1 : "about the same") + "; |score| < 0.08 counts as about the same)." + (D.seasOK === false ? " Water and plant shares are not scored because the two pictures were taken " + D.seasGap + " days apart in the year." : "")) }

  if (RD) {
   Ly.h2("3.7 Long-term trends since " + (RD.LT ? RD.LT.from : 1950));
   if (LTI.length) LTI.forEach(deepItem); else Ly.p("The long-term record could not be read this time" + (RD.errors.length ? " (" + RD.errors.filter(function (e) { return /ERA5/.test(e[0]) }).map(function (e) { return e[1] }).join("; ") + ")" : "") + ".", { grey: true });
   Ly.h2("3.8 Research for this kind of place" + (RD.H ? ": " + RD.H.label : ""));
   if (HBI.length) HBI.forEach(deepItem); else Ly.p("No place-specific research could be made this time.", { grey: true });
   var errs = RD.errors.filter(function (e) { return !/ERA5/.test(e[0]) }); if (errs.length) Ly.p("Not available for this place or not reachable when the report was made: " + errs.map(function (e) { return e[0] + " (" + e[1] + ")" }).join("; ") + ".", { grey: true, size: 9 });
  }

  /* ---- 3.9 natural events near the place (NASA EONET), made fresh for the report if not already run for this place ---- */
  if (window.EJEV && !opts.noevents) {
   var EV = EJEV.last(); if (!EV || Math.abs(EV.lat - (+P.lat)) > .01 || Math.abs(EV.lon - (+P.lon)) > .01) { say("Adding natural events from NASA EONET…"); try { EV = await EJEV.analyse({ quiet: true }) } catch (e) { EV = null } }
   Ly.h2((RD ? "3.9" : "3.7") + " Natural events near " + P.name);
   if (!EV) Ly.p("NASA's natural event tracker (EONET) could not be reached when the report was made.", { grey: true });
   else {
    Ly.p(EJEV.summary(EV), { justify: true });
    var evm = await new Promise(function (res) { EJEV.drawMap(EV, 1000, 1000, res) }), mw = Ly.cw * .78; Ly.need(mw + 26);
    doc.addImage(evm.toDataURL("image/jpeg", .85), "JPEG", Ly.M + (Ly.cw - mw) / 2, Ly.y, mw, mw, undefined, "FAST"); Ly.y += mw + 6;
    Ly.caption("Figure", "Natural events from NASA EONET whose track or location came within " + EJEV.RADIUS + " km (dashed circle) of the point of analysis (red dot), " + EV.y1 + " to " + EV.y2 + ". Lines are storm tracks; dots are recorded positions. Background: NASA Blue Marble (GIBS).");
    if (EV.ev.length) {
     var evc = EJEV.drawChart(EV, 1000, 290, false), chh = Ly.cw * .29; Ly.need(chh + 26);
     doc.addImage(evc.toDataURL("image/png"), "PNG", Ly.M, Ly.y, Ly.cw, chh, undefined, "FAST"); Ly.y += chh + 6;
     Ly.caption("Figure", "Natural events per year, coloured by type (" + Object.keys(EJEV.counts(EV)).join(", ") + ").");
     Ly.table([{ t: "Event", w: .34 }, { t: "Type", w: .14 }, { t: "Dates", w: .26 }, { t: "Closest", w: .12, a: "r" }, { t: "Peak", w: .14, a: "r" }], EJEV.rows(EV), { size: 8 });
     Ly.caption("Table", "Every natural event in NASA EONET within " + EJEV.RADIUS + " km of the point, with its closest distance and its peak value as EONET records it (wind in knots for storms).");
    }
    Ly.p("EONET (eonet.gsfc.nasa.gov) gathers notable events reported by GDACS, the Joint Typhoon Warning Center, NOAA, USGS, InciWeb and others, mostly from 2000 onwards. It is not a complete record, so a missing event does not mean nothing happened. Ocean-climate patterns such as El Niño are not events in EONET and are not included.", { grey: true });
   }
  }

  /* ---- SI rhythms: what the SI learned about this place (made fresh for the report if not already run) ---- */
  if (window.EJSI && !opts.nosi) {
   var SI = EJSI.last(); if (!SI || Math.abs(SI.lat - (+P.lat)) > .001 || Math.abs(SI.lon - (+P.lon)) > .001) { say("Letting the SI learn this place's rhythms…"); try { SI = await EJSI.learn({ quiet: true }) } catch (e) { SI = null } }
   Ly.h2((RD ? "3.10" : "3.8") + " How the SI learned " + P.name + "'s rhythms");
   if (!SI) Ly.p("NASA POWER's monthly record could not be reached when the report was made, so the SI could not learn this place.", { grey: true });
   else {
    Ly.p(EJSI.summary(SI), { justify: true });
    SI.vars.forEach(function (V) {
     if (V.err) return;
     [[EJSI.chartPG(V, 1000, 330, false), "Strength of each cycle length in " + V.name.toLowerCase() + " (share of the variation a single wave of that length explains). Dots: the cycles the SI kept; dashed line: the level 95% of shuffled copies of the same data stay under."],
      [EJSI.chartFit(V, 1000, 300, false), V.name + ": NASA POWER's monthly values (grey) and the SI's model (blue). The shaded years were hidden during training and used to test it. Red and blue dots: the most unexpected months."]].forEach(function (z) {
      var hh = Ly.cw * z[0].height / z[0].width; Ly.need(hh + 26); doc.addImage(z[0].toDataURL("image/png"), "PNG", Ly.M, Ly.y, Ly.cw, hh, undefined, "FAST"); Ly.y += hh + 6; Ly.caption("Figure", z[1]) });
     if (V.cycles.length) { Ly.table([{ t: "Cycle", w: .3 }, { t: "Share of variation", w: .18, a: "r" }, { t: "Chance it is luck", w: .17, a: "r" }, { t: "Heard as", w: .35 }], V.cycles.map(function (c) { return [EJSI.per(c.P) + (c.peakIn ? " (peaks in " + c.peakIn + ")" : ""), EJSI.pct(c.share), c.p <= 0.01 ? "1% or less" : EJSI.pct(c.p), c.interval + " (" + c.ratio + ")"] }), { size: 8 });
      Ly.caption("Table", V.name + ": the cycles the SI found, tested against 99 shuffled copies of the same months.") }
     if (V.anomalies.length) { Ly.table([{ t: "Month", w: .3 }, { t: "NASA measured", w: .24, a: "r" }, { t: "The SI expected", w: .24, a: "r" }, { t: "How unusual", w: .22, a: "r" }], V.anomalies.slice(0, 6).map(function (a) { return [EJSI.MON[a.m] + " " + a.y, EJSI.fx(a.v, V.dp) + " " + V.unit, EJSI.fx(a.exp, V.dp) + " " + V.unit, (a.z > 0 ? "+" : "") + EJSI.fx(a.z, 1) + " sd"] }), { size: 8 });
      Ly.caption("Table", V.name + ": the months NASA measured furthest from the SI's expectation (in standard deviations of the model's usual error).") }
    });
    Ly.p("Method: for each quantity the SI is trained on NASA POWER's monthly values from 1981 up to five years before the end of the record, and tested on those last five years. It searches every cycle length from 2.5 months to a third of the record with a least-squares spectrum, keeps a cycle only if it is stronger than in 95% of 99 randomly shuffled copies of the same values, removes it and searches again (at most four cycles), then fits trend and cycles by least squares and measures one month of memory. It never fills in, smooths or replaces NASA's values; the full method is in the monograph \"How the SI Learns\".", { grey: true });
   }
  }

  /* ---- 4. discussion ---- */
  Ly.h1("4. Discussion");
  var disc = [];
  if (T.t) disc.push(T.t.p < .05 ? "Daily temperatures in " + D.y2 + " were " + (T.t.mean > 0 ? "higher" : "lower") + " than on the same dates in " + D.y1 + " by " + Math.abs(T.t.mean).toFixed(2) + " °C on average, a difference that is statistically significant after allowing for day-to-day persistence (effect size d_z = " + f(T.t.dz, 2) + ")." : "The average daily temperature difference between the two years (" + sgn(T.t.mean, 2) + " °C) is not statistically significant once day-to-day persistence is allowed for, so it cannot be told apart from ordinary weather variability within these two years.");
  if (MW) disc.push(MW.p < .05 ? "Daily precipitation amounts differed significantly (Mann-Whitney p " + (MW.p < .001 ? "< 0.001" : "= " + pfmt(MW.p)) + "), with " + D.y2 + " " + (MW.z > 0 ? "wetter" : "drier") + " from day to day." : "Daily precipitation amounts did not differ significantly between the two years (Mann-Whitney p = " + pfmt(MW.p) + "), even though the annual totals were " + Math.round(Bs.rain) + " and " + Math.round(As.rain) + " mm; rainfall is concentrated in a few wet days, so totals can differ a lot by chance.");
  if (pb && pa && !!pb.modis === !!pa.modis && pb.water !== null && pa.water !== null && pb.water !== undefined && pa.water !== undefined && Math.abs(pa.water - pb.water) > .05 && D.seasOK !== false) disc.push("The share of water-like surface changed from " + f(pb.water * 100, 1) + "% to " + f(pa.water * 100, 1) + "% of the pictured area. Changes of this size in a single cloud-free scene usually reflect real changes in lakes, rivers, reservoirs or coastlines (or construction on water), but season and water level on the day of the picture also matter; the pictures in Figure " + (Ly.fig) + " should be inspected.");
  if (D.trend) disc.push("For context, NASA POWER's long-term temperature trend at this place is " + sgn(D.trend.slope * 10, 2) + " °C per decade over " + D.trend.from + "–" + D.trend.to + " (" + (D.trend.sig ? "statistically clear at the 95% level" : "not statistically clear") + "). Climate change is a statement about such multi-decade trends; any two single years also carry natural variability, such as El Niño or La Niña years, volcanic aerosols and local land changes.");
  if (RD && RD.LT && RD.LT.idx.tm) { var tmx = RD.LT.idx.tm, r1 = tmx.r1, r2 = tmx.r2; disc.push("Seen against the full record since " + RD.LT.from + ", " + D.y1 + " ranks " + (r1 ? r1.r + " and " + D.y2 + " ranks " + (r2 ? r2.r : "n/a") + " of " + r1.of + " years by annual mean temperature (1 = warmest)" : "n/a") + ", with a long-term change of " + sgn(tmx.full.slope * 10, 2) + " °C per decade at this place. The difference between the two chosen years therefore mixes this long-term change with year-to-year variability.") }
  if (HBI.length) disc.push("The place-specific results (Section 3.8) add independent evidence from satellites, river and ocean models and biodiversity records. Each comes from a different measuring system, so where they point the same way the conclusion is stronger; where they disagree, the difference in what each system measures (for example greenness versus land-cover class, or offshore versus coastal salinity) usually explains it.");
  disc.push("The results describe what the records show at this place; they do not by themselves attribute the changes to any cause. Attribution needs long records, climate model experiments and local knowledge (irrigation, urban growth, reservoir management).");
  disc.forEach(function (t) { Ly.p(t, { justify: true }) });

  /* ---- 5. limitations ---- */
  Ly.h1("5. Limitations");
  var lim = ["Reanalysis data are model estimates constrained by observations; they describe a grid cell of " + (D.src === "power" ? "about 55 × 65 km" : "about 25 km") + ", not a station, and are less reliable for local extremes, mountains and coasts.", "Two single years cannot establish a trend. The statistical tests ask whether the two years differ beyond day-to-day noise, not whether the climate has changed."];
  if (D.bk) lim.push("NASA POWER's record at this place shows a sudden step around " + D.bk.y + " caused by a change in the model's input data." + (D.src === "era5" ? " ERA5 is therefore used for both years." : " Both years are on the same side of it."));
  if (D.y1 < 1981) lim.push("Reanalysis for years before 1981 rests on fewer observations (before weather satellites in 1979, and fewer still before 1950), so early values are less certain.");
  lim.push("Surface shares from single pictures depend on the date, cloud, haze, sensor and the water level or crop stage on that day.");
  lim.push("EONET lists notable events only and is thin before about 2015; a count of zero does not prove nothing happened. Air quality is available only for whole years from 2023.");
  lim.push("The composite verdict uses fixed, stated weights chosen by this site; other reasonable weights could give a different verdict.");
  if (RD) { lim.push("ERA5 before 1979, and especially before 1950, rests on far fewer observations; a change point near 1979 can partly reflect the arrival of satellite data rather than the climate. The TX90p threshold is computed without the bootstrap of Zhang et al. (2005), which slightly inflates counts at the edges of 1961-1990.");
   lim.push("Values read from GIBS maps are exact to the width of each colour class (for example 0.0075 NDVI, 0.04 psu or 0.15 °C) and open-ended classes are limits; the underlying products have their own uncertainties. GloFAS river flow is a model, not a gauge, and does not fully include dams and water withdrawals. Satellite salinity is about 40 km wide and cannot see river channels or the shoreline. Species records reflect where people looked, and IUCN categories are global, not local, assessments.") }
  Ly.bullets(lim);

  /* ---- 6. data availability ---- */
  Ly.h1("6. Data availability and reproducibility");
  Ly.p("All data are open and were retrieved at the time of generation (" + gen + ") from these services. Climate: " + (D.src === "power" ? "https://power.larc.nasa.gov/api/temporal/daily/point (community=AG; parameters T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, WS2M, ALLSKY_SFC_SW_DWN, WS10M_MAX, CLOUD_AMT, GWETROOT, T2MDEW, AOD_55) and the monthly point API for normals" : "https://archive-api.open-meteo.com/v1/archive (ERA5)") + ". Landsat: Microsoft Planetary Computer STAC API, collection landsat-c2-l2" + [[pb, D.y1], [pa, D.y2]].filter(function (z) { return z[0] && z[0].used && z[0].used.length && !z[0].modis && !z[0].wayback }).map(function (z) { return "; items for " + z[1] + ": " + z[0].used.map(function (u) { return u.id }).join(", ") }).join("") + ". MODIS: NASA GIBS WMS, MODIS Terra/Aqua corrected reflectance. Archive pictures: Esri World Imagery Wayback. Gases: NOAA GML annual mean files. Air quality: Open-Meteo air-quality API (CAMS). Events: https://eonet.gsfc.nasa.gov/api/v3. Earthquakes: https://earthquake.usgs.gov/fdsnws/event/1. The same comparison can be repeated on the site with the place, the two years, area 'Fit the place' and the picture season shown in this report.", { size: 9.4, justify: true });

  if (RD) { var dsv = { lt_t: "ERA5 daily, 1950 onwards: https://archive-api.open-meteo.com/v1/archive (models=era5)", green: "NASA GIBS WMS layer MODIS_Terra_L3_NDVI_16Day with colour map MODIS_L3_NDVI, and Mangrove_Forest_Distribution_2000", lc: "NASA GIBS WMS layer MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual (colour map MODIS_IGBP_Land_Cover_Type)", sl: "NOAA Laboratory for Satellite Altimetry regional files https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/slr/", sss: "NASA GIBS WMS layer SMAP_L3_Sea_Surface_Salinity_REMSS_Monthly", sst: "NASA GIBS WMS layer GHRSST_L4_MUR25_Sea_Surface_Temperature", river: "GloFAS v4 through https://flood-api.open-meteo.com/v1/flood", species: "https://api.gbif.org/v1/occurrence/search and https://api.obis.org/v3", dust: "NASA GIBS WMS layer MERRA2_Dust_Surface_Mass_Concentration_Monthly", city: "NASA GIBS WMS layers GPW_Population_Density_2000-2020 and UHI_Urban-Rural_Summer_*_Land_Surface_Temp_Difference_2013" };
   Ly.p("In-depth research (Sections 2.6-2.7 and 3.7-3.8), retrieved at the same time: " + RD.items.map(function (it) { return dsv[it.id] }).filter(function (v, i, a) { return v && a.indexOf(v) === i }).join("; ") + ". NASA GIBS: https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi with colour maps from https://gibs.earthdata.nasa.gov/colormaps/v1.3/.", { justify: true }) }

  /* ---- references ---- */
  Ly.h1("References");
  [ "Bretherton, C. S., Widmann, M., Dymnikov, V. P., Wallace, J. M., and Bladé, I. (1999). The effective number of spatial degrees of freedom of a time-varying field. Journal of Climate, 12, 1990-2009.",
   "Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.",
   "Copernicus Atmosphere Monitoring Service (CAMS). Global atmospheric composition forecasts and analyses. ECMWF. https://atmosphere.copernicus.eu/",
   "Esri. World Imagery Wayback. https://livingatlas.arcgis.com/wayback/",
   D.src === "power" ? "Gelaro, R., et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). Journal of Climate, 30, 5419-5454." : "",
   D.src === "era5" ? "Hersbach, H., et al. (2020). The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society, 146, 1999-2049." : "",
   "Mann, H. B., and Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics, 18, 50-60.",
   "McFeeters, S. K. (1996). The use of the Normalized Difference Water Index (NDWI) in the delineation of open water features. International Journal of Remote Sensing, 17, 1425-1432.",
   "Microsoft. Planetary Computer: Landsat Collection 2 Level-2. https://planetarycomputer.microsoft.com/",
   "NASA Earth Observatory. Natural Event Tracker (EONET), version 3. https://eonet.gsfc.nasa.gov/",
   "NASA Global Imagery Browse Services (GIBS). https://www.earthdata.nasa.gov/gibs",
   "NASA Langley Research Center. Prediction Of Worldwide Energy Resources (POWER) project. https://power.larc.nasa.gov/",
   "NOAA Global Monitoring Laboratory. Trends in atmospheric carbon dioxide, methane and nitrous oxide. https://gml.noaa.gov/ccgg/trends/",
   "Open-Meteo. Historical weather and air-quality APIs. https://open-meteo.com/",
   "Smirnov, N. (1948). Table for estimating the goodness of fit of empirical distributions. Annals of Mathematical Statistics, 19, 279-281.",
   "Tucker, C. J. (1979). Red and photographic infrared linear combinations for monitoring vegetation. Remote Sensing of Environment, 8, 127-150.",
   "U.S. Geological Survey. Landsat Collection 2 Level-2 Science Products. https://www.usgs.gov/landsat-missions/landsat-collection-2-level-2-science-products",
   "U.S. Geological Survey. ANSS Comprehensive Earthquake Catalog (ComCat). https://earthquake.usgs.gov/",
   "World Health Organization (2021). WHO global air quality guidelines. Geneva: WHO.",
   RD ? "Zhang, X., Hegerl, G., Zwiers, F. W., and Kenyon, J. (2005). Avoiding inhomogeneity in percentile-based indices of temperature extremes. Journal of Climate, 18, 1641-1651." : "",
   "Zwiers, F. W., and von Storch, H. (1995). Taking serial correlation into account in tests of the mean. Journal of Climate, 8, 336-351." ].filter(Boolean).concat(RD ? EJD.refsOf(RD).map(function (r) { return r.text + (r.url ? " " + r.url : "") }) : []).filter(function (t, i, arr) { var nk = function (u) { return u.replace(/[^A-Za-z0-9]/g, "").slice(0, 20) }, k = nk(t); return arr.findIndex(function (u) { return nk(u) === k }) === i }).sort(function (a, b) { return a.localeCompare(b) }).forEach(function (t) { Ly.p(t, { size: 9, after: 2 }) });

  /* ---- appendix: SI essay ---- */
  var ov = X.C.ov;
  if (ov && ov.key === P.name + "|" + D.y1 + "|" + D.y2) {
   Ly.h1("Appendix A. SI research essay (machine-generated)");
   Ly.p("Written by the site's Super Intelligence (SI), powered by Google Gemini, on " + ov.at.slice(0, 16).replace("T", " ") + " UTC from the numbers in this report" + (ov.sources && ov.sources.length ? " and the published sources listed at the end" : "") + ". It is not peer-reviewed; verify its statements and sources before citing them.", { size: 9, style: "italic", grey: true });
   if (nonLatinShare(ov.text) > .03) Ly.p("The essay was written in " + ov.lang + ", which the PDF's built-in fonts cannot display. Read it on the site, or generate it in English for the report.", { grey: true });
   else { ovSections(ov.text).forEach(function (s) { if (s.h) Ly.h2(s.h); s.body.split(/\n\s*\n/).forEach(function (para) { para = para.trim(); if (!para) return; if (/^• /.test(para)) Ly.bullets(para.split(/\n/).map(function (l) { return l.replace(/^•\s*/, "") })); else Ly.p(para.replace(/\n/g, " "), { justify: true }) }) });
    if (ov.sources && ov.sources.length) { Ly.h2("Sources the SI read"); ov.sources.forEach(function (s, i) { Ly.p((i + 1) + ". " + (s.title || s.uri) + ". " + s.uri, { size: 8.8, after: 1 }) }) } }
  }
  /* ---- appendix: about the site and AI use ---- */
  Ly.h1("Appendix B. About this report");
  Ly.p("Generated by Earth Jukebox, a NASA Space Apps Challenge 2026 project that turns NASA Earth data into music and supports blind and low-vision users. All figures and tables are computed in the browser from the open data cited above at the time of generation; no values are typed in by hand. The statistical code was checked against SciPy. Parts of the site's code were written with the help of Claude (Anthropic); the optional SI essay is generated by Google Gemini and is marked as such. Sounds and the composite verdict are design choices of the site, not physical laws.", { size: 9.2, justify: true });

  /* page headers and footers */
  var np = doc.getNumberOfPages();
  for (var pg = 1; pg <= np; pg++) { doc.setPage(pg); doc.setFont("times", "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 110);
   if (pg > 1) { doc.text(L1("Earth Jukebox research report  |  " + (P.name.length > 60 ? P.name.slice(0, 57) + "..." : P.name) + ", " + D.y1 + " and " + D.y2), Ly.M, 34); doc.setDrawColor(200, 200, 200); doc.setLineWidth(.3); doc.line(Ly.M, 38, Ly.W - Ly.M, 38) }
   doc.text(L1("Report " + rid + "  |  page " + pg + " of " + np), Ly.W - Ly.M, Ly.H - 26, { align: "right" }); doc.text(L1("Data: NASA, USGS, NOAA, ECMWF/Copernicus, Esri" + (RD ? ", GBIF, OBIS, World Bank, Open-Meteo, OpenStreetMap" : "") + ". Generated " + gen + "."), Ly.M, Ly.H - 26) }
  var fname = ("EarthJukebox_report_" + P.name + "_" + D.y1 + "-" + D.y2).replace(/[^A-Za-z0-9_\-]+/g, "_").replace(/_+/g, "_") + ".pdf";
  if (!opts.nosave) doc.save(fname);
  /* a research loaded from the Archives whose stored PDF was removed: this fuller PDF (with natural events and any SI overview) becomes its Archives copy.
     Never when the comparison had to fall back to another climate record than the one the research was made with. */
  if (!opts.nosave && RD && RD.libId && !D.warn && window.EJAR && EJAR.hasPdf) EJAR.hasPdf(RD.libId).then(function (h) { if (!h) EJAR.pdfUpload(RD.libId, doc).then(function (ok) { if (ok) say("Saved " + fname + " (" + np + " pages) to your downloads, and to the Earth Jukebox Archives.") }) }).catch(function () { });
  say("Saved " + fname + " (" + np + " pages) to your downloads.");
  return { ok: true, name: fname, pages: np, doc: doc };
 } catch (e) { say("The report could not be made: " + (e.message || e)); return { ok: false, why: "error", err: e.message || String(e) } }
 finally { if (btn) btn.disabled = false }
}


window.EJR = { ACC: ACC, ACC_NASA: ACC_NASA, ACC_MODEL: ACC_MODEL, ACC_META: ACC_META, ACC_NOTE: ACC_NOTE, EVENTS: EVENTS, EXAMPLES: EXAMPLES, why: whyParts, whyEN: function () { return whyEN().replace(/<[^>]+>/g, "") }, runExample: runExample, runEvent: runEvent, pdf: makePdf, accNote: accNote, numSets: numSets, accSummaryEN: accSummaryEN, grade: grade, panel: panel, ST: ST, ovSections: ovSections };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject); else inject();
})();
