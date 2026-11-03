// Fun commands — fake hack prank (SIRF MAZAK), jokes/facts/quotes via
// free APIs with offline fallback, dice/coin, dog/cat photos, QR code.
// Fake hack mein koi real access, password, OTP, location ya data nahi hota.
const config = require('../config');
const { sleep, pick } = require('../utils');
const { JOKES, FACTS, QUOTES, EIGHTBALL } = require('../data');
const { fetchJoke, fetchFact, fetchQuote, fetchAnimal, qrUrl } = require('../services/freeApis');

async function handle(ctx) {
  const { sock, jid, cmd, arg } = ctx;
  const P = config.PREFIX;

  if (cmd === 'hack' || cmd === 'fakehack') {
    const target = arg.replace(/[\r\n]+/g, ' ').slice(0, 30) || 'Dost';
    await sock.sendMessage(jid, { text: `🎭 *FAKE HACK PRANK START* 🎭\n\n⚠️ Ye SIRF MAZAK hai. Koi real hack nahi ho raha, koi data nahi liya ja raha.\nTarget: ${target}\nMovie-style terminal chal raha hai... 🖥️` });
    await sleep(1200);
    await sock.sendMessage(jid, { text: `💻 [████░░░░░░] 10%\nTerminal khul raha hai...` });
    await sleep(1200);
    await sock.sendMessage(jid, { text: `💻 [████████░░] 40%\nEmoji aur funny code load ho raha hai... 😂` });
    await sleep(1200);
    await sock.sendMessage(jid, { text: `💻 [██████████] 85%\nPrank almost complete...` });
    await sleep(1000);
    await sock.sendMessage(jid, { text: `😂 *PRANK COMPLETE!* 😂\n\n"${target}" ko kuch nahi hua! Ye sirf ek fake hack prank tha.\nKoi account, phone ya data hack nahi hua.\nHacker sirf naam/style hai — real hacking nahi sikhayi jati. 🔥\n\nMaze ke liye dobara: ${P}hack <naam>` });
    return true;
  }
  if (cmd === 'joke') { await sock.sendMessage(jid, { text: `😂 *JOKE*\n\n${await fetchJoke().catch(() => pick(JOKES))}` }); return true; }
  if (cmd === 'fact') { await sock.sendMessage(jid, { text: `🤯 *AMAZING FACT*\n\n${await fetchFact().catch(() => pick(FACTS))}` }); return true; }
  if (cmd === 'quote') { await sock.sendMessage(jid, { text: `✨ *QUOTE*\n\n${await fetchQuote().catch(() => pick(QUOTES))}` }); return true; }
  if (cmd === '8ball') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}8ball apna sawal likho` }); return true; }
    await sock.sendMessage(jid, { text: `🎱 *MAGIC 8 BALL*\n\nSawal: ${arg}\nJawab: ${pick(EIGHTBALL)}` });
    return true;
  }
  if (cmd === 'dice') { await sock.sendMessage(jid, { text: `🎲 *DICE*\n\nDice par aaya: ${1 + Math.floor(Math.random() * 6)}` }); return true; }
  if (cmd === 'coin') { await sock.sendMessage(jid, { text: `🪙 *COIN TOSS*\n\nCoin par aaya: ${Math.random() < 0.5 ? 'Head 👑' : 'Tail 🪙'}` }); return true; }
  if (cmd === 'dog' || cmd === 'cat') {
    const url = await fetchAnimal(cmd).catch(() => null);
    if (url) await sock.sendMessage(jid, { image: { url }, caption: cmd === 'dog' ? '🐶 *CUTE DOG*' : '🐱 *CUTE CAT*' });
    else await sock.sendMessage(jid, { text: 'Photo nahi mili, thodi der baad dobara try karo.' });
    return true;
  }
  if (cmd === 'qr') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}qr apna text ya link likho` }); return true; }
    await sock.sendMessage(jid, { image: { url: qrUrl(arg) }, caption: `🔳 *QR CODE*\n\nText: ${arg}` });
    return true;
  }
  return false;
}

module.exports = { handle };
