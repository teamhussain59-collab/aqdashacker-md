// Bot core — Baileys connection, pairing code, reconnect. Baaki sab
// handlers/ aur commands/ mein hai, yahan sirf connection hai.
//
// v2.2.1 pairing audit (3 Nov 2026) — asal issue ye nikla:
// 1) Purana socket band hote waqt uska close handler naye socket ka
//    code bhi khatam kar deta tha (stale-socket bug). Ab har handler
//    pehle check karta hai ke ye event current socket ka hai ya nahi.
// 2) Pairing ke doran auto-restart code badal deta tha. Ab pairing
//    ke doran restart NAHI hota; sirf paired session reconnect karta hai.
// 3) 401 pairing ke doran logout NAHI hai, is liye session delete
//    NAHI hota jab tak pehle se paired session logout na ho.
// 4) Slow network par history sync timeout (408) se bachne ke liye
//    syncFullHistory band hai aur timeouts 60s hain.
// Baileys 6.7.24 (legacy stable) pin hai. 7.0.0-rc14 release
// candidate hai, is liye upgrade NAHI kiya — usme breaking changes
// aur Termux/ARM par rust-bridge ka risk hai.
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
let attemptId = 0;
let reconnectTimer = null;

function clearReconnectTimer() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

async function startBot(phoneNumber, opts = {}) {
  const force = Boolean(opts.force);
  // Wahi code abhi fresh hai to dobara socket mat banao.
  if (
    !force &&
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
  const myAttempt = ++attemptId;
  clearReconnectTimer();

  try {
    // Purane socket ko band karo, lekin uske handlers ko stale
    // mark karo taake wo naye attempt ko kharab na karein.
    const oldSock = state.sock;
    state.sock = null;
    if (oldSock) {
      try { oldSock.ev.removeAllListeners('connection.update'); } catch {}
      try { oldSock.ev.removeAllListeners('messages.upsert'); } catch {}
      try { oldSock.ev.removeAllListeners('creds.update'); } catch {}
      try { oldSock.end(); } catch {}
    }
    state.botStatus = 'waiting-pairing';
    state.pairingError = null;
    state.lastNumber = phoneNumber;
    state.lastPairingCode = null;
    state.pairingStartedAt = Date.now();

    const { state: authState, saveCreds } = await useMultiFileAuthState(config.SESSION_PATH);
    const wasRegistered = Boolean(authState.creds.registered);
    // Fallback version Baileys master se verified: 3 Nov 2026.
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1043857760] }));
    console.log('Baileys version:', version.join('.'), 'registered:', wasRegistered, 'session:', config.SESSION_DIR);

    const sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: [config.BOT_LABEL, 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });
    state.sock = sock;
    sock.ev.on('creds.update', saveCreds);
    // Messages handler pehle lagao, pairing code ke baad nahi.
    sock.ev.on('messages.upsert', async ({ messages }) => {
      if (state.sock !== sock) return;
      await handleMessages(sock, messages);
    });

    sock.ev.on('connection.update', async (update) => {
      // Stale socket ka event ho to ignore karo — yehi asal bug tha.
      if (state.sock !== sock || myAttempt !== attemptId) return;
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
        console.log('Closed, reason:', reason, 'registered:', wasRegistered);
        // Pairing abhi hui hi nahi: restart mat karo, code wahi rehne do
        // jab tak user dobara button na dabaye. Session bhi mat delete karo.
        if (!wasRegistered) {
          state.lastPairingCode = null;
          state.pairingError = 'Connection band ho gaya (reason ' + reason + '). Dobara Pairing Code dabao, WiFi par, aur code foran likho.';
          return;
        }
        if (reason === DisconnectReason.loggedOut) {
          try { fs.rmSync(config.SESSION_PATH, { recursive: true, force: true }); } catch {}
          state.pairingError = 'Logged out ho gaya, dobara pairing karo.';
        } else if (state.lastNumber && isValidNumber(state.lastNumber)) {
          clearReconnectTimer();
          reconnectTimer = setTimeout(() => startBot(state.lastNumber).catch(console.error), 5000);
        }
      }
    });

    if (!authState.creds.registered) {
      await new Promise((r) => setTimeout(r, 2500));
      // Agar is doran socket band ho gaya ho to dead socket par code mat mango.
      if (state.sock !== sock || myAttempt !== attemptId) return sock;
      try {
        state.lastPairingCode = await sock.requestPairingCode(phoneNumber);
        state.pairingStartedAt = Date.now();
        state.botStatus = 'waiting-pairing';
        console.log('Pairing code:', state.lastPairingCode);
      } catch (err) {
        if (state.sock === sock) {
          state.pairingError = err.message || String(err);
          state.botStatus = 'offline';
        }
      }
    } else {
      state.botStatus = 'online';
    }

    return sock;
  } finally {
    starting = false;
  }
}

module.exports = { startBot };
