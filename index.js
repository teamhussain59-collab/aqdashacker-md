// AQDAS HACKER MD BOT — entry point (thin wrapper).
// Asal code src/ folders mein hai:
//   src/config.js, src/state.js, src/utils.js, src/data.js, src/menu.js,
//   src/images.js, src/license.js,
//   src/services/ (ai, downloader, freeApis),
//   src/commands/ (bot, ai, downloader, fun, utility),
//   src/handlers/messages.js, src/bot.js, src/server.js
// WARNING: Baileys is unofficial. Use an EXTRA number, never main number.
const { app, PORT } = require('./src/server');

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`AQDAS HACKER MD BOT website running on port ${PORT}`));
}
