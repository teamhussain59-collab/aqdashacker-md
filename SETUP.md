# 𝐀𝐐𝐃𝐀𝐒 𝐇𝐀𝐂𝐊𝐄𝐑 𝐌𝐃 𝐁𝐎𝐓 — 𝐅𝐔𝐋𝐋 𝐒𝐄𝐓𝐔𝐏

> 𝐄𝐱𝐭𝐫𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐮𝐬𝐞 𝐤𝐚𝐫𝐨, 𝐦𝐚𝐢𝐧 𝐧𝐮𝐦𝐛𝐞𝐫 𝐧𝐚𝐡𝐢. 𝐔𝐧𝐨𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐛𝐨𝐭 𝐬𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐛𝐚𝐧 𝐡𝐨 𝐬𝐚𝐤𝐭𝐚 𝐡𝐚𝐢.

## 1. 𝐓𝐞𝐫𝐦𝐮𝐱 𝐈𝐧𝐬𝐭𝐚𝐥𝐥 𝐊𝐚𝐫𝐨

1. F-Droid se Termux install karo. Play Store wala purana hai, us se package fail hote hain.
2. Termux kholo.

## 2. 𝐏𝐚𝐜𝐤𝐚𝐠𝐞𝐬 𝐈𝐧𝐬𝐭𝐚𝐥𝐥 𝐊𝐚𝐫𝐨

```
pkg update && pkg upgrade -y
pkg install -y git nodejs-lts
node -v
```

Node 20 ya us se upar hona chahiye.

## 3. 𝐁𝐨𝐭 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐊𝐚𝐫𝐨

Pehli dafa:

```
cd ~
git clone --depth 1 https://github.com/teamhussain59-collab/aqdashacker-md.git aqdas-hacker-md
cd ~/aqdas-hacker-md
```

Update karna ho to, purana bot band kar ke:

```
pkill node
cd ~/aqdas-hacker-md
git pull
```

## 4. 𝐈𝐧𝐬𝐭𝐚𝐥𝐥 𝐀𝐮𝐫 𝐒𝐭𝐚𝐫𝐭

```
rm -rf session
npm install --allow-git=all
npm start
```

Agar `npm install` par git wali error aaye to wahi `--allow-git=all` wali line dobara likho.

Bot chalne par ye dikhe ga:

```
AQDAS HACKER MD BOT website running on port 3000
```

## 5. 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 — 𝐒𝐚𝐛 𝐒𝐞 𝐙𝐚𝐫𝐨𝐨𝐫𝐢 𝐇𝐢𝐬𝐬𝐚

1. Chrome mein kholo: `http://localhost:3000`
2. Number is tarteeb se likho: country code ke sath, `+` mat likho, aur 92 ke baad pehla `0` mat likho.
   - Sahi: `92` + `3xx...` (0 hata kar)
   - Ghalat: `9203xx...`, `+92...`, `030...`
3. **PAIRING CODE LO** button **ek dafa** dabao.
4. Code milte hi **10-15 second** mein WhatsApp mein likho:
   WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead.
5. **Number check:** Website wala number aur WhatsApp profile wala number digit by digit same hona chahiye. Profile dekhne ke liye WhatsApp Settings mein apni photo par tap karo. Number mujhe mat bhejo, khud milao.

Agar WhatsApp kahe **"Couldn't link device. Check the phone number is correct"** to matlab number same nahi hai. Naya code mangwane se kuch nahi hoga, pehle number theek karo.

## 6. 𝐁𝐨𝐭 𝐓𝐞𝐬𝐭 𝐊𝐚𝐫𝐨

Link hote hi bot wale number par, ya kisi dusre number se bot ko ye bhejo:

```
.menu
.alive
.ping
```

`.menu` par stylish menu aur image aani chahiye. `.alive` par song aana chahiye.

## 7. 𝐑𝐨𝐳𝐚𝐧𝐚 𝐔𝐬𝐞

- Termux band ho jaye, phone restart ho jaye, ya battery optimization bot ko rok de to dobara sirf ye likho, dobara pairing nahi karni pare gi jab tak session folder maujood hai:

```
cd ~/aqdas-hacker-md
npm start
```

- Termux ki battery optimization OFF rakho, warna phone Termux ko background mein band kar de ga.
- Do dafa `npm start` mat chalao, aur ek hi session folder par do process mat chalao.

## 𝐃𝐨𝐨𝐬𝐫𝐚 𝐀𝐜𝐜𝐨𝐮𝐧𝐭

Ek process = ek WhatsApp account. Doosra account alag session aur port par chalao:

```
SESSION_DIR=session2 PORT=3001 npm start
```

Us ki website `http://localhost:3001` par khulegi.

## 𝐌𝐚𝐬𝐥𝐞 𝐀𝐮𝐫 𝐇𝐚𝐥

| Masla | Hal |
|---|---|
| `Closed, reason: 428 / 408` | Connection band ho gaya. WiFi par try karo, Termux foreground mein rakho, phone lock mat karo. |
| `Closed, reason: 401` | WhatsApp ne reject kiya. Number check karo, bar bar code mat mango, kuch der ruk kar try karo. |
| `Couldn't link device` | Number same nahi hai. Upar wala number check dobara karo. |
| Clone beech mein toote | `git clone --depth 1 ...` use karo, WiFi par dobara try karo. |
| `EALLOWGIT` | `npm install --allow-git=all` likho. |
| Code late aaye | Slow network. WiFi par try karo, code milte hi foran likho. |

## 𝐒𝐭𝐲𝐥𝐢𝐬𝐡 𝐖𝐫𝐢𝐭𝐢𝐧𝐠

Bot ke menu aur `.alive`, `.ping`, `.owner`, `.channel` jawab stylish bold writing mein hain. Stylish writing sirf display ke liye hai — command naam, number aur link hamesha simple rehte hain, taake copy karna asan rahe. Stylish text ka code `src/stylish.js` mein hai.

## 𝐘𝐚𝐚𝐝 𝐑𝐚𝐤𝐡𝐨

- Pairing code kisi ko mat do, screenshot mein mat dikhao.
- GitHub token chat mein mat bhejo. Token dikh jaye to foran GitHub Settings se delete/revoke karo.
- Vercel par sirf website chalegi, live bot nahi. Live bot ke liye Railway, Render ya Termux chahiye.
