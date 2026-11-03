// Number pehle check karo, taake ghalat number par express load
// hone se pehle hi saaf error mile.
const __rawPair = (() => {
  const i = process.argv.indexOf('--pair');
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith('--pair='));
  if (eq) return eq.slice('--pair='.length);
  return process.env.PAIR_NUMBER || null;
})();
const __pairNumber = __rawPair ? String(__rawPair).replace(/[^0-9]/g, '') : null;
if (__rawPair && !/^[0-9]{10,15}$/.test(__pairNumber)) {
  console.error('Sahi number likho: country code ke sath, sirf digits. Example: 923001234567');
  process.exit(1);
}

// AQDAS HACKER MD BOT — entry point (thin wrapper).
// Asal code src/ folders mein hai:
//   src/config.js, src/state.js, src/utils.js, src/data.js, src/menu.js,
//   src/images.js, src/license.js,
//   src/services/ (ai, downloader, freeApis),
//   src/commands/ (bot, ai, downloader, fun, utility),
//   src/handlers/messages.js, src/bot.js, src/server.js
// WARNING: Baileys is unofficial. Use an EXTRA number, never main number.
//
// Termux pairing — website khole baghair:
//   node index.js --pair 923001234567
//   ya: PAIR_NUMBER=923001234567 node index.js
//   ya: npm run pair -- 923001234567
// Number Termux mein hi do, code Termux mein hi aaye ga.
const { app, PORT, startBot } = require('./src/server');
const state = require('./src/state');

module.exports = app;

function cliPairNumber() {
  return __pairNumber;
}

if (require.main === module) {
  const raw = __rawPair;
  const number = __pairNumber;
  app.listen(PORT, async () => {
    console.log(`AQDAS HACKER MD BOT website running on port ${PORT}`);
    if (!number) return;
    console.log('Termux pairing shuru hai, number:', number);
    console.log('Code yahin Termux mein aaye ga, website kholne ki zarorat nahi.');
    let shownCode = null;
    let shownOnline = false;
    let shownError = null;
    setInterval(() => {
      if (state.lastPairingCode && state.lastPairingCode !== shownCode) {
        shownCode = state.lastPairingCode;
        console.log('\n===== PAIRING CODE =====');
        console.log(shownCode);
        console.log('========================');
        console.log('Ye code WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead mein foran likho. Sirf taaza code likho.');
      }
      if (state.botStatus === 'online' && !shownOnline) {
        shownOnline = true;
        console.log('CONNECTED — bot online hai, WhatsApp par .menu bhejo.');
      }
      if (state.botStatus === 'offline' && state.pairingError && state.pairingError !== shownError) {
        shownError = state.pairingError;
        console.log('Pairing error:', state.pairingError);
      }
    }, 1000);
    try {
      await startBot(number);
    } catch (err) {
      console.error('Pairing start error:', err.message || err);
    }
  });
}
