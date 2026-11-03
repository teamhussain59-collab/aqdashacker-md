// Pairing website — Express app. Railway par chalta hai, Vercel par
// sirf website dikhata hai (pairing Vercel par mana hai, serverless limit).
const express = require('express');
const path = require('path');
const config = require('./config');
const state = require('./state');
const { cleanNumber, isValidNumber } = require('./utils');
const { startBot } = require('./bot');

const app = express();
let pairInFlight = null;
app.use(express.json());
app.use(express.static(path.join(config.ROOT, 'public')));
app.use('/assets', express.static(path.join(config.ROOT, 'assets')));

app.get('/api/status', (req, res) => res.json({
  bot: config.BOT_NAME, version: config.BOT_VERSION,
  licensedTo: config.LICENSED_TO, licenseType: config.LICENSE_TYPE,
  status: state.botStatus, number: state.lastNumber, error: state.pairingError,
  session: config.SESSION_DIR,
}));

app.post('/api/pair', async (req, res) => {
  if (process.env.VERCEL) return res.status(503).json({ ok: false, error: 'Vercel par pairing nahi hoga — Vercel serverless hai, bot ka connection nahi rukta. Bot ke liye Railway wali URL use karo, Vercel sirf website ke liye hai.' });
  const number = cleanNumber(req.body && req.body.number);
  if (!isValidNumber(number)) return res.status(400).json({ ok: false, error: 'Sahi number likho: country code ke sath, sirf digits. Example: 923001234567' });
  if (state.botStatus === 'online' && state.lastNumber === number) return res.json({ ok: true, status: 'online', message: 'Bot pehle se online hai.' });
  // Code abhi bana hua hai to wahi code wapas do, naya code mat banao.
  if (state.botStatus === 'waiting-pairing' && state.lastNumber === number && state.lastPairingCode && state.pairingStartedAt && Date.now() - state.pairingStartedAt < 90000) {
    return res.json({ ok: true, status: state.botStatus, code: state.lastPairingCode, number });
  }
  // Pairing pehle se chal rahi hai to dusri request se naya socket mat banao.
  if (pairInFlight) {
    try { await pairInFlight; } catch {}
    if (state.lastPairingCode && state.lastNumber === number) {
      return res.json({ ok: true, status: state.botStatus, code: state.lastPairingCode, number });
    }
  }
  try {
    pairInFlight = startBot(number);
    await pairInFlight;
    pairInFlight = null;
    // Slow network (H+/2G) par code late aata hai, is liye 20 second tak wait karo.
    for (let i = 0; i < 40 && !state.lastPairingCode && state.botStatus === 'waiting-pairing' && !state.pairingError; i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (state.pairingError) return res.status(500).json({ ok: false, error: state.pairingError });
    if (state.lastPairingCode) return res.json({ ok: true, status: state.botStatus, code: state.lastPairingCode, number });
    return res.json({ ok: true, status: state.botStatus, message: 'Pairing shuru ho gaya, status check karo.' });
  } catch (err) {
    pairInFlight = null;
    state.botStatus = 'offline';
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true, bot: config.BOT_NAME, version: config.BOT_VERSION, licensedTo: config.LICENSED_TO, status: state.botStatus }));

module.exports = { app, PORT: config.PORT, startBot };
