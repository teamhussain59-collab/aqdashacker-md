// Bot core — Baileys connection, pairing code, reconnect. Baaki sab
// handlers/ aur commands/ mein hai, yahan sirf connection hai.
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

async function startBot(phoneNumber) {
  try { if (state.sock) await state.sock.logout().catch(() => {}); } catch {}
  try { if (state.sock) state.sock.end(); } catch {}
  state.sock = null;
  state.botStatus = 'waiting-pairing';
  state.pairingError = null;
  state.lastNumber = phoneNumber;

  const { state: authState, saveCreds } = await useMultiFileAuthState(path.join(config.ROOT, 'session'));
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  const sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: [config.BOT_NAME, 'Chrome', '1.0.0'],
  });
  state.sock = sock;
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      state.botStatus = 'online';
      state.lastPairingCode = null;
      console.log(config.BOT_NAME, 'connected');
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      state.botStatus = 'offline';
      console.log('Closed, reason:', reason);
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
}

module.exports = { startBot };
