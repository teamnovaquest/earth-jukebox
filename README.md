Earth Jukebox

Hear how any place on Earth has changed, decade by decade, as music made from NASA's measurements.

Earth Jukebox turns NASA Earth-observation data into sound. Drop a pin anywhere on a 3D globe, choose a NASA dataset, and a timeline plays music that follows the real numbers year by year. Compare mode then sets two years side by side and writes a full research report about what changed and why.

Live site: https://teamnovaquest.github.io/earth-jukebox/
Final video (30 s): https://youtu.be/-iP3tz_CcVo
Local Video (4 min): https://youtu.be/8BJ4OHqc7Wc
Code: https://github.com/teamnovaquest/earth-jukebox
Made for: NASA International Space Apps Challenge 2026, challenge The Earth Information Jukebox
Team: Team NovaQuest, Bangladesh (members listed below)
The problem

Climate data is published as numbers, maps and charts. Most people never open them, and people who are blind or have low vision can barely use them at all. A rise of 0.2 °C per decade is hard to feel from a table.

Our solution

Earth Jukebox makes NASA data something you can hear, explore and check:

Listen: any place, any NASA dataset, played as music over the decades.
Compare: two years side by side, with the change measured, tested for statistical significance and explained in plain words.
Research: an in-depth report (25+ pages, PDF) for any place on Earth, with maps, trend tests and future climate projections.
Share: finished research is saved to a public archive so anyone can read it instantly.
Learn: the SI trains a small, explainable model on NASA's monthly record of any place, finds its own climate rhythms (each tested against shuffled data), checks itself on five years it never saw, flags the months that broke the pattern, and turns the rhythms into harmony. With SI listening on, it also judges every month the main music plays: the Data panel shows how expected the month was, and surprising months ring as bells in the music.
Mute humans: one button plays any place as it would be without human-caused warming. Published attribution science (human-caused warming of 1.37 °C by 2024, scaled for land or sea with IPCC AR6) is taken off NASA's temperatures; the music, the Data panel and NASA's temperature maps follow the simulation, every simulated number is labelled, and rain, pollution and the other datasets stay real.
Why it matters
Accessible to everyone: a full blind-assistance mode, with spoken guidance in 20 languages and spoken audio reports. Climate change becomes something you can hear.
Built for real research: every report states its sources, methods and limits, so students, teachers and local researchers can use it as a starting point.
Local: it works for any spot on Earth, from a home town to a river delta, not just big cities.
NASA data used
NASA source	What Earth Jukebox uses it for
NASA Earth Information Center (EIC)	12 daily visualizations played as music: air temperature, humidity and wind (GEOS-FP); PM2.5, ozone, CO and NO<sub>x</sub> (GEOS-CF); rain and seasonal rain (GPM IMERG); sea surface temperature (MUR); active fires (VIIRS); vegetation (NDVI)
GEOS-FP and GEOS-CF (NASA GMAO)	Exact values behind the EIC pictures: temperature, humidity, wind, ozone, CO, NO<sub>x</sub>, PM2.5
GISTEMP (NASA GISS)	Global temperature record
NASA POWER	Long daily climate records at any point
MERRA-2	Reanalysis used for area averages and corrections
MODIS (Terra/Aqua)	Land-cover change and plant greenness (NDVI) maps
GIBS (Blue Marble, Black Marble and more)	Satellite imagery of every place
NEX-GDDP-CMIP6 (NASA Ames / NCCS)	Downscaled future climate projections (SSP2-4.5 and SSP5-8.5)
Landsat (NASA/USGS, via Microsoft Planetary Computer)	Water and plant measurements in Compare
EONET	Natural events listed in the research reports
VEDA / earth.gov	Extra layers in the Data panel
Moon Trek (LRO)	The Moon you can zoom out to

Supporting, non-NASA sources are named in every report and used only for cross-checks and context. They include ERA5 and CAMS (ECMWF/Copernicus), NOAA sea level, USGS, GBIF, OBIS, the World Bank, OpenStreetMap and Esri base maps.

Is it accurate? (measured, not claimed)

We test the site against independent sources and publish the results, including the weak ones.

Test 1, the site against NASA's own server: at 234 places, the values the site shows match NASA's servers with a correlation above 0.99999 for all seven GEOS datasets (1,638 pairs each).
Test 3, NASA's models against other scientists' records: NASA's temperature, humidity and wind agree strongly with ERA5 (r = 0.957–0.993). Ozone and carbon monoxide agree moderately with CAMS. PM2.5 agrees weakly, a known difference between two air-quality models, which we explain rather than hide.
Real events reproduced: the Aral Sea drying (water 94.4% → 0.2%, 1990 → 2020), Lake Mead's decline, the 2003 Paris heatwave (hottest day 31.2 → 37.9 °C) and the 2010 Pakistan floods (Peshawar July rain 31 → 295 mm).
Statistics: Mann–Kendall trend tests with Hamed–Rao correction, Sen's slope and Pettitt change-point tests.

Full details: Accuracy paper (PDF)

Papers
Research paper (29 pages): the mathematics, sonification, statistics, NASA data pipeline and software design
User guide (21 pages): every feature, step by step
Accuracy paper (10 pages): how every number is checked, with measured results
How the SI Learns (21 pages): the mathematics, implementation and optimisation of the SI's per-place climate-rhythm model, and how it joins the music
Presentations: Listen to the Planet and Getting the Most from the SI (PowerPoint; PDF copies alongside)
Physical Solutions

Earth Jukebox helps people hear climate change; Physical Solutions are machines and programmes that act on it. From the launch screen (nav bar or the Open Models button), models are grouped as Domestic (homemade builds, 7), Industrial (company scale, 5) and Municipal (city and government scale, 3). Each finished model has a build document (PDF), a financial statement (PDF), an interactive 3D model and a presentation. All 15 models are finished:

Domestic: Paddy Jukebox (rice-field water stake for Alternate Wetting and Drying), Jukebox Siren (hazard-warning box), Watt Song (electricity meter that sings), Cool Conductor (smart air-conditioner controller), Biogas Guardian (leak watcher for home digesters), Sun Dryer (solar crop dryer that knows when food is dry), Ground Truth Node (street air-quality and heat station checked against NASA data).
Industrial: Leak Hunter Rig (methane leak survey kit guided by NASA EMIT), Solar Cold Room (pay-per-crate market cold room), Market Digester (market food waste to cooking gas), Swap Station (solar-assisted battery swapping), Paddy Gateway (LoRa gateway collecting Paddy Jukebox records).
Municipal: Siren Mast (solar warning tower), Heat Refuge Shelter (cool-roofed bus stop with water and heat alerts), Neighbourhood Organics Station (food-waste drop-off with a small digester).

Part prices are makers' list prices from 12 November 2026 where published; anything else is marked as an estimate inside the documents. Files: solutions.js and solutions/<model>/.

How it works
Front end: a single static website (HTML, JavaScript, three.js for the globe, Web Audio for the music, jsPDF for reports). It runs entirely in the visitor's browser.
Back end: one small Cloudflare Worker that relays requests to NASA servers, runs the SI (AI) research essays, and stores the public research archive. Shared research is spot-checked against its sources before it is saved.
Privacy: no accounts, and nothing about visitors is stored. The archive keeps only the research itself.
Use of AI

We used AI tools while building Earth Jukebox and say so openly. Claude (Anthropic) helped write the code and texts, Google Gemini powers the SI assistant and research essays, ElevenLabs voiced our videos, and Google Gemini (Nano Banana 2) generated our team logo. The data and the SI's rhythm model are not AI-generated: the data comes from NASA and the sources above, and the rhythm model is classical statistics in our own code. Full details: AI_DISCLOSURE.md

Team NovaQuest
Member	Role
Shaiyan Sarim Zaman	Team Leader, Data Analyst, Researcher, Developer
Shamayil Illiyin Zaman	Presenter, Researcher
Tasnim Tanha	Designer, Researcher
Sharjil Azwad Farhan	Researcher
Muhammad Ayman Adil	Researcher
Afrah Hasan Olivia	Researcher
Run it yourself

Open index.html through any static web server, for example python get_eic_frames.py --serve, then go to http://localhost:8000.

Licence

The Earth Jukebox code is released under the MIT Licence. NASA data and imagery are public and are credited inside the site and in every report; other data sources keep their own terms, which are named where they are used.
