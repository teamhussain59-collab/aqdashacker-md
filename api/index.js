// Vercel serverless entry point — website only, NOT the live bot.
// Vercel functions end after a few seconds, so they cannot keep the
// Baileys WhatsApp connection open. The Express app is reused here so
// the pairing page, status and assets work on Vercel, while /api/pair
// honestly refuses on Vercel (see src/server.js) and tells the user to use
// the Railway URL for the real bot.
const app = require('../index.js');

module.exports = app;
