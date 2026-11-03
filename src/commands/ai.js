// AI commands — .ai sirf, on/off bot.js mein hain (state ke sath).
const config = require('../config');
const { askAi } = require('../services/ai');

async function handle(ctx) {
  const { sock, jid, cmd, arg } = ctx;
  if (cmd !== 'ai') return false;
  if (!arg) { await sock.sendMessage(jid, { text: `Use: ${config.PREFIX}ai apna sawal likho` }); return true; }
  const ans = await askAi(arg).catch(() => 'AI se jawab nahi mila, thodi der baad try karo.');
  await sock.sendMessage(jid, { text: `🤖 *AQDAS AI*\n\n${ans}` });
  return true;
}

module.exports = { handle };
