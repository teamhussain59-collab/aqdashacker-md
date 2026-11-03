// AQDAS HACKER MD BOT — Railway pairing website + bot
// WARNING: Baileys is an unofficial WhatsApp Web library.
// WhatsApp can ban numbers using unofficial bots. Use an EXTRA number,
// never your main number. Do not use it for spam / bulk messages.
// Only download songs/videos/APKs you have the right to download.
// Session is in ./session — Railway loses it on redeploy, so re-pair then.

const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const axios = require('axios');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_NAME = 'AQDAS HACKER MD BOT';
const PREFIX = '.';
const OWNER_NUMBER = process.env.OWNER_NUMBER || '923194997157'; // owner number, no + — set by user for .owner / owner-only commands
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q';
const CHANNEL_JID = process.env.CHANNEL_JID || ''; // e.g. 120207123456789012@newsletter — optional, empty = any channel post the linked account receives
let channelAutoReact = process.env.CHANNEL_AUTO_REACT !== 'false'; // ON by default, owner can toggle with .channelreact

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

let sock = null;
let botStatus = 'offline';
let lastPairingCode = null;
let lastNumber = null;
let pairingError = null;
let autoAi = false; // default OFF — owner turns it on with .aion
let autoReact = true;

const cleanNumber = (s) => String(s || '').replace(/[^0-9]/g, '');
const isValidNumber = (n) => /^[0-9]{10,15}$/.test(n);
const isOwner = (jid) => {
  if (!OWNER_NUMBER) return false;
  return String(jid || '').startsWith(OWNER_NUMBER);
};
const menuImagePath = () => {
  for (const f of ['menu.jpg', 'menu.png', 'menu.jpeg', 'menu.webp']) {
    const p = path.join(__dirname, 'assets', f);
    if (fs.existsSync(p)) return p;
  }
  return null;
};
const aliveSongPath = () => {
  for (const f of ['alive.mp3', 'alive.m4a', 'song.mp3']) {
    const p = path.join(__dirname, 'assets', f);
    if (fs.existsSync(p)) return p;
  }
  return null;
};

// ── STYLISH MENU ──────────────────────────────────────────────
const MENU_TEXT = `╭━━━〔 *${BOT_NAME}* 〕━━━╮
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
┃ ${PREFIX}song <naam/link> — Song search + download link
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
*${BOT_NAME} — Free, Fast, Stylish* 🔥`;

async function askAi(question) {
  // Free, no-key text API. If it fails, bot tells the user honestly.
  const res = await axios.get(
    'https://text.pollinations.ai/' + encodeURIComponent(question),
    { timeout: 20000, responseType: 'text' }
  );
  const t = String(res.data || '').trim();
  return t.slice(0, 1500) || 'AI se jawab nahi mila, dobara try karo.';
}

async function cobaltLink(videoUrl) {
  // Cobalt is a public downloader API. It can change/break — fallback is the link itself.
  try {
    const res = await axios.post(
      'https://api.cobalt.tools/api/json',
      { url: videoUrl, downloadMode: 'auto', filenameStyle: 'basic' },
      { timeout: 20000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
    );
    if (res.data && res.data.url) return res.data.url;
  } catch {}
  return null;
}

async function startBot(phoneNumber) {
  try { if (sock) await sock.logout().catch(() => {}); } catch {}
  try { if (sock) sock.end(); } catch {}
  sock = null;
  botStatus = 'waiting-pairing';
  pairingError = null;
  lastNumber = phoneNumber;

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: [BOT_NAME, 'Chrome', '1.0.0'],
  });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      botStatus = 'online';
      lastPairingCode = null;
      console.log(BOT_NAME, 'connected');
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      botStatus = 'offline';
      console.log('Closed, reason:', reason);
      if (reason === DisconnectReason.loggedOut) {
        try { fs.rmSync(path.join(__dirname, 'session'), { recursive: true, force: true }); } catch {}
      } else if (lastNumber && isValidNumber(lastNumber)) {
        setTimeout(() => startBot(lastNumber).catch(console.error), 3000);
      }
    }
  });

  if (!state.creds.registered) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      lastPairingCode = await sock.requestPairingCode(phoneNumber);
      botStatus = 'waiting-pairing';
      console.log('Pairing code:', lastPairingCode);
    } catch (err) {
      pairingError = err.message || String(err);
      botStatus = 'offline';
    }
  } else {
    botStatus = 'online';
  }

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      try {
        if (!m.message) continue;

        // ── CHANNEL AUTO REACT ──
        // Only for channel/newsletter posts the LINKED account receives.
        // In practice WhatsApp only delivers your own channel's admin
        // posts to the linked device, so this only works for the
        // linked/admin account. CHANNEL_JID, when set, restricts it
        // to one specific channel. Reacting to other people's
        // channels is not reliable in Baileys and is not attempted.
        if (m.key.remoteJid && m.key.remoteJid.endsWith('@newsletter')) {
          if (channelAutoReact && (!CHANNEL_JID || m.key.remoteJid === CHANNEL_JID)) {
            try { await sock.sendMessage(m.key.remoteJid, { react: { text: '🔥', key: m.key } }); } catch {}
          }
          continue;
        }

        // ── STATUS SEEN: mark status as seen, do not save it ──
        if (m.key.remoteJid === 'status@broadcast') {
          try { await sock.readMessages([m.key]); } catch {}
          continue;
        }
        if (m.key.fromMe) continue;

        // ── AUTO REACT ──
        if (autoReact && !m.key.remoteJid.endsWith('@g.us')) {
          try { await sock.sendMessage(m.key.remoteJid, { react: { text: '🔥', key: m.key } }); } catch {}
        }

        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const jid = m.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');

        // ── COMMANDS ──
        if (text.startsWith(PREFIX)) {
          const parts = text.slice(1).trim().split(/\s+/);
          const cmd = (parts[0] || '').toLowerCase();
          const arg = parts.slice(1).join(' ').trim();

          if (cmd === 'menu' || cmd === 'help') {
            const img = menuImagePath();
            if (img) await sock.sendMessage(jid, { image: fs.readFileSync(img), caption: MENU_TEXT });
            else await sock.sendMessage(jid, { text: MENU_TEXT });
            continue;
          }
          if (cmd === 'alive') {
            const aliveText = `*${BOT_NAME} is ALIVE* ⚡🔥\n\nOwner: AQDAS HACKER\nWeb: aqdashacker.web.app\nChannel: ${CHANNEL_URL}\n\nType ${PREFIX}menu for all commands.`;
            const img = menuImagePath();
            const song = aliveSongPath();
            if (img) await sock.sendMessage(jid, { image: fs.readFileSync(img), caption: aliveText });
            else await sock.sendMessage(jid, { text: aliveText });
            // User's song: put it in assets/alive.mp3 and it will be sent here
            if (song) await sock.sendMessage(jid, { audio: fs.readFileSync(song), mimetype: 'audio/mpeg' });
            continue;
          }
          if (cmd === 'ping') { await sock.sendMessage(jid, { text: 'Pong! 🏓\nAQDAS HACKER MD BOT is live.' }); continue; }
          if (cmd === 'owner') { await sock.sendMessage(jid, { text: '*Owner:* AQDAS HACKER\n*Bot:* AQDAS HACKER MD BOT\n*Number:* https://wa.me/' + OWNER_NUMBER + '\n*Web:* aqdashacker.web.app\n*Channel:* ' + CHANNEL_URL }); continue; }
          if (cmd === 'channel') { await sock.sendMessage(jid, { text: '📢 *AQDAS HACKER WhatsApp Channel*\n\n' + CHANNEL_URL + '\n\nChannel ko follow karo, naye updates ke liye.' }); continue; }
          if (cmd === 'aion' && isOwner(jid)) { autoAi = true; await sock.sendMessage(jid, { text: 'Auto AI ON ✅\nAb contacts ko AI auto reply dega.' }); continue; }
          if (cmd === 'aioff' && isOwner(jid)) { autoAi = false; await sock.sendMessage(jid, { text: 'Auto AI OFF ❌' }); continue; }
          if ((cmd === 'channelreact' || cmd === 'channelreacton') && isOwner(jid)) { channelAutoReact = true; await sock.sendMessage(jid, { text: 'Channel Auto React ON ✅\nSirf linked/admin account ke channel par react hoga.' }); continue; }
          if (cmd === 'channelreactoff' && isOwner(jid)) { channelAutoReact = false; await sock.sendMessage(jid, { text: 'Channel Auto React OFF ❌' }); continue; }
          if (cmd === 'ai') {
            if (!arg) { await sock.sendMessage(jid, { text: `Use: ${PREFIX}ai apna sawal likho` }); continue; }
            const ans = await askAi(arg).catch(() => 'AI se jawab nahi mila, thodi der baad try karo.');
            await sock.sendMessage(jid, { text: `🤖 *AQDAS AI*\n\n${ans}` });
            continue;
          }
          if (cmd === 'song' || cmd === 'video') {
            if (!arg) { await sock.sendMessage(jid, { text: `Use: ${PREFIX}${cmd} song/video ka naam ya YouTube link` }); continue; }
            const isLink = arg.startsWith('http');
            const searchUrl = isLink ? arg : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(arg);
            const dl = isLink ? await cobaltLink(arg) : null;
            await sock.sendMessage(jid, { text:
              `🎵 *${cmd === 'song' ? 'SONG' : 'VIDEO'}*\n\n🔎 Search: ${arg}\n🔗 Watch: ${searchUrl}\n${dl ? '⬇️ Download: ' + dl + '\n' : ''}\n⚠️ Sirf wo content download karo jis ka haq tumhare paas ho / jo free ho.` });
            continue;
          }
          if (cmd === 'apk') {
            if (!arg) { await sock.sendMessage(jid, { text: `Use: ${PREFIX}apk app ka naam` }); continue; }
            await sock.sendMessage(jid, { text:
              `📱 *APK SEARCH: ${arg}*\n\n▶️ Play Store: https://play.google.com/store/search?q=${encodeURIComponent(arg)}&c=apps\n🔎 APKPure: https://apkpure.com/search?q=${encodeURIComponent(arg)}\n\n⚠️ APK sirf official / trusted source se lo. Unknown APK phone ke liye khatarnak ho sakta hai.` });
            continue;
          }
          continue;
        }

        // ── AUTO AI REPLY (owner-enabled, DM only, no groups) ──
        if (autoAi && !isGroup && text.trim()) {
          const ans = await askAi(text.trim()).catch(() => null);
          if (ans) await sock.sendMessage(jid, { text: `🤖 *AQDAS AI*\n\n${ans}` });
        }
      } catch (e) {
        console.error('Handler error:', e.message);
      }
    }
  });
  return sock;
}

// ── Pairing website API ──
app.get('/api/status', (req, res) => res.json({ bot: BOT_NAME, status: botStatus, number: lastNumber, error: pairingError }));
app.post('/api/pair', async (req, res) => {
  const number = cleanNumber(req.body && req.body.number);
  if (!isValidNumber(number)) return res.status(400).json({ ok: false, error: 'Sahi number likho: country code ke sath, sirf digits. Example: 923001234567' });
  if (botStatus === 'online' && lastNumber === number) return res.json({ ok: true, status: 'online', message: 'Bot pehle se online hai.' });
  try {
    await startBot(number);
    for (let i = 0; i < 10 && !lastPairingCode && botStatus === 'waiting-pairing' && !pairingError; i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (pairingError) return res.status(500).json({ ok: false, error: pairingError });
    if (lastPairingCode) return res.json({ ok: true, status: botStatus, code: lastPairingCode, number });
    return res.json({ ok: true, status: botStatus, message: 'Pairing shuru ho gaya, status check karo.' });
  } catch (err) {
    botStatus = 'offline';
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});
app.get('/health', (req, res) => res.json({ ok: true, bot: BOT_NAME, status: botStatus }));

app.listen(PORT, () => console.log(`${BOT_NAME} website running on port ${PORT}`));
