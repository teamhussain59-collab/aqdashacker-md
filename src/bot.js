// Bot core — Baileys connection, pairing code, reconnect. Baaki sab
// handlers/ aur commands/ mein hai, yahan sirf connection hai.
//
// Pairing fix (3 Nov 2026): purana code har 3 second baad naya code
// bana deta tha, is liye user purana code likhta tha aur WhatsApp
// "Couldn't link device" kehta tha. Ab:
// - Pairing ke doran auto-restart NAHI hoga, code tab tak wahi rahega.
// - Dobara Pairing dabane par naya socket NAHI banega, wahi code milega.
// - Sirf pehle se paired (registered) session hi auto-reconnect karega.
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const config = require('./config');
const state = require('./state');
const { isValidNumber } = require('./utils');
const { handleMessages } = require('./handlers/messages');

let starting = false;

async function startBot(phoneNumber) {
  // Agar wahi number ke liye abhi code bana hua hai aur 90 second
  // nahi guzre, to dobara socket mat banao — wahi code wapas do.
  if (
    state.botStatus === 'waiting-pairing' &&
    state.lastNumber === phoneNumber &&
    state.lastPairingCode &&
    state.pairingStartedAt &&
    Date.now() - state.pairingStartedAt < 90000
  ) {
    return state.sock;
  }
  if (starting) return state.sock;
  starting = true;

  try {
    // Purane socket ko sirf band karo, logout NAHI karo — logout
    // pairing code ko bhi khatam kar deta hai.
    try { if (state.sock) state.sock.end(); } catch {}
    state.sock = null;
    state.botStatus = 'waiting-pairing';
    state.pairingError = null;
    state.lastNumber = phoneNumber;
    state.lastPairingCode = null;
    state.pairingStartedAt = Date.now();

    const { state: authState, saveCreds } = await useMultiFileAuthState(path.join(config.ROOT, 'session'));
    const wasRegistered = Boolean(authState.creds.registered);
    // Fallback version Baileys master se verified: 3 Nov 2026.
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1043857760] }));

    const sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: [config.BOT_NAME, 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
    });
    state.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        state.botStatus = 'online';
        state.lastPairingCode = null;
        state.pairingError = null;
        console.log(config.BOT_NAME, 'connected');
      }
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        state.botStatus = 'offline';
        console.log('Closed, reason:', reason);
        // Pairing abhi hui hi nahi: auto-restart mat karo, warna
        // code badal jayega aur user purana code likhega.
        if (!wasRegistered) {
          state.lastPairingCode = null;
          state.pairingError = 'Connection band ho gaya (reason ' + reason + '). Dobara Pairing Code dabao aur code foran likho.';
          return;
        }
        if (reason === DisconnectReason.loggedOut) {
          try { fs.rmSync(path.join(config.ROOT, 'session'), { recursive: true, force: true }); } catch {}
        } else if (state.lastNumber && isValidNumber(state.lastNumber)) {
          setTimeout(() => startBot(state.lastNumber).catch(console.error), 3000);
        }
      }
    });

    if (!authState.creds.registered) {
      await new Promise((r) => setTimeout(r, 2500));
      try {
        state.lastPairingCode = await sock.requestPairingCode(phoneNumber);
        state.pairingStartedAt = Date.now();
        state.botStatus = 'waiting-pairing';
        console.log('Pairing code:', state.lastPairingCode);
      } catch (err) {
        state.pairingError = err.message || String(err);
        state.botStatus = 'offline';
      }
    } else {
      state.botStatus = 'online';
    }

    sock.ev.on('messages.upsert', async ({ messages }) => handleMessages(sock, messages));
    return sock;
  } finally {
    starting = false;
  }
}

module.exports = { startBot };
