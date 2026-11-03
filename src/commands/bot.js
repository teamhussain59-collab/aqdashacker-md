// Bot info commands — menu, alive, ping, owner, channel, uptime, features, license.
const fs = require('fs');
const config = require('../config');
const state = require('../state');
const { getMenuText } = require('../menu');
const { sendMenuImage, aliveSongPath } = require('../images');
const { isOwner } = require('../license');
const { checkLicenseKey } = require('../license');

async function handle(ctx) {
  const { sock, jid, cmd, arg } = ctx;
  const P = config.PREFIX;

  if (cmd === 'menu' || cmd === 'help') {
    await sendMenuImage(sock, jid, getMenuText());
    return true;
  }
  if (cmd === 'alive') {
    const aliveText = `*${config.BOT_NAME} is ALIVE* ⚡🔥\n\nOwner: AQDAS HACKER\nWeb: aqdashacker.web.app\nChannel: ${config.CHANNEL_URL}\n\nType ${P}menu for all commands.`;
    await sendMenuImage(sock, jid, aliveText);
    const song = aliveSongPath();
    if (song) await sock.sendMessage(jid, { audio: fs.readFileSync(song), mimetype: 'audio/mpeg' });
    return true;
  }
  if (cmd === 'ping') { await sock.sendMessage(jid, { text: 'Pong! 🏓\nAQDAS HACKER MD BOT is live.' }); return true; }
  if (cmd === 'owner') {
    await sock.sendMessage(jid, { text: '*Owner:* AQDAS HACKER\n*Bot:* AQDAS HACKER MD BOT\n*Number:* https://wa.me/' + config.OWNER_NUMBER + '\n*Web:* aqdashacker.web.app\n*Channel:* ' + config.CHANNEL_URL });
    return true;
  }
  if (cmd === 'channel') {
    await sock.sendMessage(jid, { text: '📢 *AQDAS HACKER WhatsApp Channel*\n\n' + config.CHANNEL_URL + '\n\nChannel ko follow karo, naye updates ke liye.' });
    return true;
  }
  if (cmd === 'uptime') {
    const s = Math.floor(process.uptime());
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    await sock.sendMessage(jid, { text: `⏱️ *UPTIME*\n\nBot ${h} ghante, ${m} minute, ${sec} second se online hai.\nVersion: v${config.BOT_VERSION}` });
    return true;
  }
  if (cmd === 'features') {
    await sock.sendMessage(jid, { text:
      `✨ *${config.BOT_NAME} — ALL COMMANDS (35+)*\n\n*Bot:* ${P}menu, ${P}alive, ${P}ping, ${P}owner, ${P}channel, ${P}help, ${P}uptime, ${P}features, ${P}license, ${P}checklicense, ${P}imageurl\n*AI:* ${P}ai, ${P}aion, ${P}aioff\n*Download:* ${P}song, ${P}video, ${P}apk\n*Fake Hack Prank:* ${P}hack, ${P}fakehack\n*Fun:* ${P}joke, ${P}fact, ${P}quote, ${P}8ball, ${P}dice, ${P}coin, ${P}dog, ${P}cat, ${P}qr\n*Utility:* ${P}time, ${P}date, ${P}calc, ${P}weather, ${P}translate, ${P}define, ${P}crypto\n*Auto:* Auto React, Status Seen, Channel Auto React, Auto AI (owner)\n\nPoori list ke liye ${P}menu likho.` });
    return true;
  }
  if (cmd === 'license') {
    await sock.sendMessage(jid, { text:
      `📜 *BOT LICENSE*\n\n*Bot:* ${config.BOT_NAME}\n*Version:* v${config.BOT_VERSION}\n*Licensed To:* ${config.LICENSED_TO}\n*License Type:* ${config.LICENSE_TYPE}\n*Status:* ✅ ACTIVE\n*Web:* aqdashacker.web.app\n\nLicense key chat mein nahi dikhayi jati, wo sirf owner ke paas hoti hai.\nCheck karne ke liye: ${P}checklicense <key>` });
    return true;
  }
  if (cmd === 'checklicense') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}checklicense <license key>` }); return true; }
    const okKey = checkLicenseKey(arg);
    await sock.sendMessage(jid, { text: okKey
      ? `✅ *LICENSE VERIFIED*\n\nYe bot ${config.LICENSED_TO} ke liye licensed hai.\nVersion: v${config.BOT_VERSION}\nType: ${config.LICENSE_TYPE}`
      : `❌ *LICENSE GALAT HAI*\n\nYe key is bot ke liye valid nahi hai. Sahi key owner se lo, aur key ko kisi ke sath share mat karo.` });
    return true;
  }
  if (cmd === 'imageurl' || cmd === 'imgurl') {
    await sock.sendMessage(jid, { text:
      `🖼️ *MENU IMAGE URL*\n\n${config.MENU_IMAGE_URL}\n\nYe link 5 Nov 2026, 08:57 PKT tak chalega, uske baad expire ho jaye ga. Local file assets/menu.jpg pehle use hoti hai, ye sirf backup hai. Permanent URL ke liye image ko GitHub par upload karo aur Railway mein MENU_IMAGE_URL env var set karo.` });
    return true;
  }
  // Owner toggles (state yahan se badalti hai, messages handler use karta hai)
  if (cmd === 'aion' && isOwner(jid)) { state.autoAi = true; await sock.sendMessage(jid, { text: 'Auto AI ON ✅\nAb contacts ko AI auto reply dega.' }); return true; }
  if (cmd === 'aioff' && isOwner(jid)) { state.autoAi = false; await sock.sendMessage(jid, { text: 'Auto AI OFF ❌' }); return true; }
  if ((cmd === 'channelreact' || cmd === 'channelreacton') && isOwner(jid)) { state.channelAutoReact = true; await sock.sendMessage(jid, { text: 'Channel Auto React ON ✅\nSirf linked/admin account ke channel par react hoga.' }); return true; }
  if (cmd === 'channelreactoff' && isOwner(jid)) { state.channelAutoReact = false; await sock.sendMessage(jid, { text: 'Channel Auto React OFF ❌' }); return true; }
  return false;
}

module.exports = { handle };
