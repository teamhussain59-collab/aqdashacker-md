# AQDAS HACKER MD BOT

WhatsApp Multi-Device bot + pairing-code website. Railway par deploy karo, website par number likho, pairing code lo, WhatsApp me code dalo — bot online.

**Bot name:** AQDAS HACKER MD BOT
**Web:** https://aqdashacker.web.app
**Channel:** https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q

## Features (is version me — v2.2.0, 35+ commands, folders wali proper structure)

```
index.js                 Entry point, sirf wrapper
src/config.js            Settings / env vars
src/state.js             Bot status, pending song choice
src/utils.js             Safe helpers (calc, number, sleep)
src/data.js              Offline jokes/facts/quotes (fallback)
src/menu.js              Stylish menu text
src/images.js            Local image pehle, URL backup
src/license.js           License check, key kabhi print nahi hoti
src/bot.js               Baileys connection / pairing / reconnect
src/server.js            Express pairing website
src/handlers/messages.js Auto react, status seen, channel react, dispatch
src/commands/            bot.js, ai.js, downloader.js, fun.js, utility.js
src/services/            ai.js, downloader.js, freeApis.js
public/                  Pairing website
assets/                  menu.jpg, alive.mp3
api/index.js             Vercel website entry (bot nahi)
```

- Stylish `.menu` — aapki bheji hui image (`assets/menu.jpg`) ke sath
- `.alive` — image + text, aur agar `assets/alive.mp3` ho to wo song bhi bhejta hai
- `.ping`, `.owner`, `.channel`, `.help`, `.uptime`, `.features`, `.imageurl`
- `.ai <sawal>` — AI se baat (Pollinations free API, no key)
- `.aion` / `.aioff` — Auto AI reply, sirf owner, default OFF. Sirf DM me, group me nahi.
- `.song <naam/link>` / `.video <naam/link>` — `.song` likhne par bot pehle aapki image ke sath pooche ga: *1 / mp3* ya *2 / video*? Jawab do to us hisab se MP3 ya Video ka link mile ga, MP3 mein iTunes ka 30 sec preview bhi mile ga jab mile. Jawab 5 minute mein dena hai, warna dobara `.song` likhna pare ga. `.video` seedha video ka link deta hai. Download link ke liye Cobalt API use hoti hai, kabhi kabhi fail ho sakta hai.
- `.apk <naam>` — Play Store / APKPure search link. Direct APK unofficial site se nahi — unsafe hota hai.
- Auto React — DM par 🔥 react
- Status Seen — status auto seen hota hai, status save NAHI hota
- Channel Auto React — channel post par 🔥 react, **sirf us account ke liye jis ka device link hai aur jo channel ka admin hai**. `CHANNEL_JID` set karo to sirf ek channel par. Dusre ke channel par reliable react Baileys me nahi hota, is liye wo try nahi hota. Owner `.channelreact` / `.channelreactoff` se on/off kar sakta hai.

### Free APIs — sab no-key, sab ke fallback

Test karke add ki gayi hain, 3 Nov 2026 ko check hui thin. Koi API fail ho to command link ya offline list se jawab deti hai, khali nahi jati:

- Joke: Official Joke API — `.joke`
- Fact: Useless Facts API — `.fact`
- Quote: DummyJSON Quotes — `.quote`
- Weather: Open-Meteo Geocoding + Forecast, asal mausam — `.weather Lahore` (test mein Lahore 24.8°C mila tha)
- Translate: Google free endpoint, phir MyMemory — `.translate hello` (dono fail hon to Google Translate ka link milta hai)
- Define: dictionaryapi.dev — `.define hello`
- Crypto: CoinGecko — `.crypto` (Bitcoin/Ethereum, USD + PKR)
- Dog/Cat photo: Dog CEO / TheCatAPI — `.dog`, `.cat`
- QR code: QRServer — `.qr <text>`
- Song preview: iTunes Search — `.song` ke MP3 jawab mein
- AI: Pollinations — `.ai`
- Downloader: Cobalt — `.song` / `.video` link hon par

### Fake Hack Prank — sirf mazak

- `.hack <naam>` / `.fakehack <naam>` — Movie-style fake terminal animation, 4-5 message mein. Shuru aur end mein saaf likha hota hai ke ye sirf prank hai, koi real hack nahi hua, koi data nahi liya gaya, koi fake password/OTP nahi banaya jata. Real hacking is mein hai hi nahi.

### Fun — free APIs + offline fallback

- `.joke`, `.fact`, `.quote` — free API se, fail ho to offline list se
- `.8ball <sawal>`, `.dice`, `.coin`, `.dog`, `.cat`, `.qr <text>`

### Utility — free APIs

- `.time` / `.date`, `.calc <hisab>`, `.weather <sheher>` (asal mausam), `.translate <text>` (asal translate, fail ho to link), `.define <word>`, `.crypto`

### License system

- `.license` — bot ki license info: naam, version, Licensed To, type, status. Key chat mein nahi dikhayi jati.
- `.checklicense <key>` — key sahi hai ya galat, bina key dikhaye batata hai.
- Railway env vars: `LICENSE_KEY` (apni key set karo, default `AQDAS-FREE-2026`), `LICENSE_TYPE`, aur `LICENSED_NUMBERS` (comma se alag numbers — set ho to sirf wo + owner commands use kar sakte hain, khali ho to sab ke liye open). Poori shartein `LICENSE.md` mein hain.

**1000 features wali baat:** 1000 alag real, kaam karne wale features ek file mein likhna mumkin nahi hai, aur likh bhi diye jayen to bot slow aur kharab ho jaye ga. Is liye is version mein 30+ saaf, test hone wale commands hain — bot, AI, downloader, auto, fake hack prank, fun, utility aur license. Agar koi khaas feature chahiye to naam batao, wo alag se add kar doon ga.

## Jo is me NAHI hai — jaan boojh kar

- **One-view photo kholna / save karna:** Nahi. View-once dusre ki marzi se private hota hai, us ko save karna uski privacy ke khilaf hai.
- **Anti-delete (deleted message wapas dikhana):** Nahi. Kisi ne message delete kiya to uska content wapas dikhana uski marzi ke khilaf hai.

## Vercel par deploy — sirf website, bot NAHI

`vercel.json` aur `api/index.js` is liye add kiye gaye hain taake yehi repo Vercel par bhi aaram se deploy ho jaye. Lekin seedhi baat samajh lo:

- **Vercel par website chalegi:** pairing page, menu image, status, health — sab dikhega.
- **Vercel par bot NAHI chalega:** Vercel serverless hai, uska function kuch second me band ho jata hai. WhatsApp bot ko hamesha khula connection chahiye hota hai, jo Vercel par nahi rukta, aur session bhi save nahi rehta. Koi bhi code is limit ko khatam nahi kar sakta.
- Is liye Vercel par `/api/pair` jaan boojh kar mana karta hai aur Railway use karne ko kehta hai, taake ghalat code mil kar pairing fail na ho.

Vercel steps: GitHub repo ko https://vercel.com par import karo → Deploy dabao → website URL mil jayegi. Bot chalane ke liye phir bhi upar wale Railway steps use karo, wahi aapki pairing website hai.

## Render par deploy — sab se asaan free cloud (lekin so jata hai)

`render.yaml` pehle se add hai, is liye Render par GitHub repo chuno to settings khud bhar jayengi.

1. https://render.com kholo, GitHub se login karo.
2. New → Web Service → `teamhussain59-collab/aqdashacker-md` repo chuno.
3. Plan **Free** rakho, Start Command `node index.js` hona chahiye.
4. Deploy karo, Render URL milegi, us par pairing karo.

**Limit saaf samajh lo:** Free web service 15 minute bina inbound traffic ke baad spin down ho jati hai aur dobara khulne mein lagbhag 1 minute lagta hai.【1217915744761685081†L10-L11】 File system bhi ephemeral hai, is liye spin down / redeploy par session khatam ho sakta hai aur dobara pairing karni pare gi. Bot ko hamesha online rakhne ke liye paid instance chahiye hota hai.

## Railway par deploy (free, phone se bhi ho sakta hai)

1. GitHub par naya repo banao, is folder ki files upload karo. `session/` aur `node_modules/` upload mat karo.
2. https://railway.app kholo, apne account se login karo.
3. **New Project → Deploy from GitHub repo** → apna repo chuno.
4. Deploy hone ka wait karo. Railway ek URL dega, jaise `https://aqdas-hacker-md-bot-production.up.railway.app` — wahi aapki pairing website hai.
5. Us URL ko kholo, apna **extra** number likho (country code ke sath, `+` ke baghair, jaise `923001234567`), **PAIRING CODE LO** dabao.
6. 8 digit code milega. WhatsApp kholo → Settings → Linked Devices → Link a Device → **Link with phone number instead** → code likho.
7. Status `online` hote hi bot par `.menu` bhejo.

**Zaroori:**
- Extra number use karo, main number nahi. Unofficial bot se number ban ho sakta hai.
- Railway par redeploy / restart par session khatam ho sakta hai — dobara pairing karni paregi.
- Railway free plan ki limit hoti hai, bot 24/7 guarantee nahi hai.
- `OWNER_NUMBER` environment variable Railway me set karo (sirf digits) taake sirf tum `.aion` kar sako. Is code me owner number pehle se set hai, env var se badla ja sakta hai.

## Multiple accounts (ek se zyada number)

Ek bot process = ek WhatsApp account. Ek hi process mein do number link nahi hote — WhatsApp ka linked-device system ek account ke liye hota hai. Doosra account chalana ho to doosra process chalao, apna session folder aur port alag rakho:

```
# Pehla account (Termux session 1)
npm start

# Doosra account (Termux session 2, alag folder/session)
SESSION_DIR=session2 PORT=3001 BOT_LABEL="AQDAS HACKER 2" npm start
```

Doosre account ki pairing website `http://localhost:3001` par khulegi. Har account ka `session/` / `session2/` folder alag rahega, ek ka session doosre ko kharab nahi karega. Ek hi folder mein do dafa `npm start` mat chalao — do process ek hi session par ladenge aur code badalta rahega (408/401/428).

## Pairing fail ho to (408 / 401 / 428)

- **408/428:** Connection WhatsApp se band ho gaya, aksar slow network (H+/2G) ya socket band hone se. WiFi / strong 4G par try karo.
- **401:** WhatsApp ne code reject kiya. Aksar wajah: website wala number aur WhatsApp profile wala number same nahi hai, code purana ho gaya hai, ya bar bar code mangwane par WhatsApp ne temporarily rok diya hai.
- Button **ek dafa** dabao. Code milte hi 10-15 second mein likho. Dobara button dabane se code badal jayega.
- Ek hi waqt mein ek hi `npm start` chalao. Do process chal rahe hon to Termux band kar ke dobara kholo, phir `rm -rf session` kar ke ek dafa start karo.
- WhatsApp Settings > profile mein number check karo, website wale number se digit by digit milao. Linked Devices mein purani devices remove karo. WhatsApp update karo.
- Bar bar fail ho to 30-60 minute ruk jao, phir ek dafa try karo.

## Apni image / song lagana

- Menu/Alive image: `assets/menu.jpg` — pehle se aapki image lagi hui hai.
- Alive song: `assets/alive.mp3` naam se song file daalo, dobara deploy karo. `.alive` par wo song bhi jayega.

## Image URL (khud banayi hui)

Aapki image ka URL code mein add kar diya gaya hai:

`https://muse.ai/files/1361303167066234/2344656512958812/i9npw80au2cpccebj8cx9ai5/menu.jpg`

**Expiry: 5 November 2026, 08:57 PKT.** Is link ko jis ke paas hai wo image khol sakta hai. Bot pehle local `assets/menu.jpg` use karta hai, ye URL sirf backup hai agar local file upload na hui ho. Link expire hone ke baad bot phir bhi local file se image bhejta rahe ga. Permanent URL chahiye to image ko GitHub repo mein `assets/menu.jpg` ke tor par upload karo, phir uska raw URL Railway env var `MENU_IMAGE_URL` mein set karo, masalan: `https://raw.githubusercontent.com/<username>/<repo>/main/assets/menu.jpg`. Bot mein `.imageurl` likhne se bhi ye URL mile ga.

## Local test

```
npm install
npm start
```

Phir http://localhost:3000 kholo.
