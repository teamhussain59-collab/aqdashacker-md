// Stylish menu — ek hi jagah se banta hai, .menu aur .features dono use karte hain.
const config = require('./config');
const { PREFIX, BOT_NAME, BOT_VERSION, OWNER_NUMBER, CHANNEL_URL } = config;

const getMenuText = () => `╭━━━〔 *${BOT_NAME}* 〕━━━╮
┃ ⚡ *OWNER:* AQDAS HACKER
┃ 📞 *OWNER:* https://wa.me/${OWNER_NUMBER}
┃ 🔥 *PREFIX:* ${PREFIX}
┃ 🌐 *WEB:* aqdashacker.web.app
┃ 📢 *CHANNEL:* ${CHANNEL_URL}
┃ ✅ *STATUS:* ONLINE
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🤖 *AI & CHAT* 〕━━━╮
┃ ${PREFIX}ai <sawal> — AI se baat karo
┃ ${PREFIX}aion / ${PREFIX}aioff — Auto AI reply ON/OFF (owner)
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ⬇️ *DOWNLOADER* 〕━━━╮
┃ ${PREFIX}song <naam/link> — Image ke sath pooche ga: MP3 ya Video?
┃ ${PREFIX}video <naam/link> — Video download link
┃ ${PREFIX}apk <app naam> — APK / Play Store link
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ⚡ *BOT* 〕━━━╮
┃ ${PREFIX}menu — Ye stylish menu
┃ ${PREFIX}alive — Bot alive + song
┃ ${PREFIX}ping — Speed check
┃ ${PREFIX}owner — Owner info
┃ ${PREFIX}channel — WhatsApp Channel link
┃ ${PREFIX}help — Madad
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ✨ *AUTO* 〕━━━╮
┃ Auto React: ON
┃ Status Seen: ON (status auto seen hota hai)
┃ Channel Auto React: ON (sirf linked/admin account ke channel par)
┃ Auto AI: owner ${PREFIX}aion se on kare
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🎭 *FAKE HACK PRANK* 〕━━━╮
┃ ${PREFIX}hack <naam> — Fake hack prank, SIRF MAZAK
┃ Koi real hack nahi hota, koi data nahi liya jata
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🎉 *FUN* 〕━━━╮
┃ ${PREFIX}joke — Mazahiya joke (free API)
┃ ${PREFIX}fact — Amazing fact (free API)
┃ ${PREFIX}quote — Motivation quote (free API)
┃ ${PREFIX}8ball <sawal> — Magic 8 ball jawab
┃ ${PREFIX}dice — Dice phenko (1-6)
┃ ${PREFIX}coin — Coin toss (Head/Tail)
┃ ${PREFIX}dog / ${PREFIX}cat — Dog/Cat ki photo (free API)
┃ ${PREFIX}qr <text> — QR code image (free API)
╰━━━━━━━━━━━━━━━━━━╯

╭━━━〔 🛠️ *UTILITY* 〕━━━╮
┃ ${PREFIX}time / ${PREFIX}date — Waqt aur tareekh
┃ ${PREFIX}calc <hisab> — Masalan: ${PREFIX}calc 12*8+5
┃ ${PREFIX}weather <sheher> — Asal mausam (free API)
┃ ${PREFIX}translate <text> — Asal translate (free API)
┃ ${PREFIX}define <word> — English word ka matlab (free API)
┃ ${PREFIX}crypto — Bitcoin price (free API)
┃ ${PREFIX}uptime — Bot kitni der se online hai
┃ ${PREFIX}features — Saare commands ki list
┃ ${PREFIX}license — Bot ki license info
┃ ${PREFIX}imageurl — Menu image ka URL
╰━━━━━━━━━━━━━━━━━━╯
*${BOT_NAME} v${BOT_VERSION} — Free, Fast, Stylish* 🔥`;

module.exports = { getMenuText };
