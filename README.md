# AQDAS HACKER MD BOT

WhatsApp Multi-Device bot + pairing-code website. Railway par deploy karo, website par number likho, pairing code lo, WhatsApp me code dalo — bot online.

**Bot name:** AQDAS HACKER MD BOT
**Web:** https://aqdashacker.web.app
**Channel:** https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q

## Features (is version me)

- Stylish `.menu` — aapki bheji hui image (`assets/menu.jpg`) ke sath
- `.alive` — image + text, aur agar `assets/alive.mp3` ho to wo song bhi bhejta hai
- `.ping`, `.owner`, `.channel`, `.help`
- `.ai <sawal>` — AI se baat
- `.aion` / `.aioff` — Auto AI reply, sirf owner, default OFF. Sirf DM me, group me nahi.
- `.song <naam/link>` / `.video <naam/link>` — search + download link (Cobalt API, kabhi kabhi fail ho sakta hai)
- `.apk <naam>` — Play Store / APKPure search link. Direct APK unofficial site se nahi — unsafe hota hai.
- Auto React — DM par 🔥 react
- Status Seen — status auto seen hota hai, status save NAHI hota
- Channel Auto React — channel post par 🔥 react, **sirf us account ke liye jis ka device link hai aur jo channel ka admin hai**. `CHANNEL_JID` set karo to sirf ek channel par. Dusre ke channel par reliable react Baileys me nahi hota, is liye wo try nahi hota. Owner `.channelreact` / `.channelreactoff` se on/off kar sakta hai.

## Jo is me NAHI hai — jaan boojh kar

- **One-view photo kholna / save karna:** Nahi. View-once dusre ki marzi se private hota hai, us ko save karna uski privacy ke khilaf hai.
- **Anti-delete (deleted message wapas dikhana):** Nahi. Kisi ne message delete kiya to uska content wapas dikhana uski marzi ke khilaf hai.

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

## Apni image / song lagana

- Menu/Alive image: `assets/menu.jpg` — pehle se aapki image lagi hui hai.
- Alive song: `assets/alive.mp3` naam se song file daalo, dobara deploy karo. `.alive` par wo song bhi jayega.

## Local test

```
npm install
npm start
```

Phir http://localhost:3000 kholo.
