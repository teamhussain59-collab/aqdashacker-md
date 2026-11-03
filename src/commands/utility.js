// Utility commands — time, calc, weather/translate/define/crypto via free APIs.
const config = require('../config');
const { safeCalc } = require('../utils');
const { fetchWeather, translateText, fetchDefinition, fetchCrypto } = require('../services/freeApis');

async function handle(ctx) {
  const { sock, jid, cmd, arg } = ctx;
  const P = config.PREFIX;

  if (cmd === 'time' || cmd === 'date') {
    const now = new Date();
    const pk = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'medium' }).format(now);
    await sock.sendMessage(jid, { text: `🕒 *TIME / DATE*\n\nPakistan: ${pk}\nUTC: ${now.toUTCString()}` });
    return true;
  }
  if (cmd === 'calc') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}calc 12*8+5` }); return true; }
    const v = safeCalc(arg);
    await sock.sendMessage(jid, { text: v === null ? '❌ Sirf number aur + - * / ( ) % use karo.\nMasalan: ' + P + 'calc 12*8+5' : `🧮 *CALC*\n\n${arg} = *${v}*` });
    return true;
  }
  if (cmd === 'weather') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}weather Lahore` }); return true; }
    try {
      const w = await fetchWeather(arg);
      if (!w) throw new Error('not found');
      await sock.sendMessage(jid, { text: `🌤️ *WEATHER: ${w.name}*\n\n${w.desc}\n🌡️ Temp: ${w.temp}°C (mehsoos: ${w.feels}°C)\n💧 Humidity: ${w.humidity}%\n💨 Hawa: ${w.wind} km/h\n🕒 Time: ${w.time}\n\nSource: Open-Meteo (free API, no key)` });
    } catch {
      await sock.sendMessage(jid, { text: `🌤️ *WEATHER: ${arg}*\n\nLive mausam nahi mila, link kholo:\nhttps://wttr.in/${encodeURIComponent(arg)}\nGoogle: https://www.google.com/search?q=weather+${encodeURIComponent(arg)}` });
    }
    return true;
  }
  if (cmd === 'translate') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}translate hello, kaise ho?` }); return true; }
    const t = await translateText(arg, 'ur').catch(() => null);
    if (t) await sock.sendMessage(jid, { text: `🌐 *TRANSLATE (Urdu)*\n\nOriginal: ${arg}\nTarjuma: ${t}` });
    else await sock.sendMessage(jid, { text: `🌐 *TRANSLATE*\n\nText: ${arg}\nLink: https://translate.google.com/?sl=auto&tl=ur&text=${encodeURIComponent(arg)}&op=translate` });
    return true;
  }
  if (cmd === 'define' || cmd === 'meaning') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}define hello` }); return true; }
    try {
      const d = await fetchDefinition(arg.split(/\s+/)[0]);
      if (!d || !d.definition) throw new Error('not found');
      await sock.sendMessage(jid, { text: `📖 *DEFINE: ${d.word}*\n\n${d.phonetic ? '🔊 ' + d.phonetic + '\n' : ''}${d.partOfSpeech ? '📌 ' + d.partOfSpeech + '\n' : ''}💬 ${d.definition}${d.example ? '\n\n✍️ Example: ' + d.example : ''}\n\nSource: dictionaryapi.dev (free API, no key)` });
    } catch {
      await sock.sendMessage(jid, { text: `❌ "${arg}" ka matlab nahi mila. English ka ek word likho, masalan: ${P}define hello` });
    }
    return true;
  }
  if (cmd === 'crypto' || cmd === 'btc') {
    try {
      const d = await fetchCrypto();
      const b = d.bitcoin, e = d.ethereum;
      await sock.sendMessage(jid, { text: `💰 *CRYPTO PRICE*\n\n₿ Bitcoin: $${Number(b.usd).toLocaleString('en-US')} / Rs ${Number(b.pkr).toLocaleString('en-US')}\nΞ Ethereum: $${Number(e.usd).toLocaleString('en-US')} / Rs ${Number(e.pkr).toLocaleString('en-US')}\n\nSource: CoinGecko (free API, no key)` });
    } catch {
      await sock.sendMessage(jid, { text: 'Crypto price nahi mili, thodi der baad try karo. Link: https://www.coingecko.com/' });
    }
    return true;
  }
  return false;
}

module.exports = { handle };
