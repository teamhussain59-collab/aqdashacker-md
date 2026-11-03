// Config — saari settings ek jagah. Railway env vars se badli ja sakti hain.
const path = require('path');

module.exports = {
  BOT_NAME: 'AQDAS HACKER MD BOT',
  BOT_VERSION: '2.2.2',
  BOT_LABEL: process.env.BOT_LABEL || 'AQDAS HACKER MD BOT',
  PREFIX: '.',
  PORT: process.env.PORT || 3000,
  // Multi-account: har account ka apna session folder.
  // Dusra account: SESSION_DIR=session2 PORT=3001 npm start
  SESSION_DIR: process.env.SESSION_DIR || 'session',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '923194997157',
  CHANNEL_URL: 'https://whatsapp.com/channel/0029Vb9FRVV8F2pDezlyrD0q',
  CHANNEL_JID: process.env.CHANNEL_JID || '',
  // Menu image URL — Muse storage link, expires 5 Nov 2026 08:57 PKT.
  // Local assets/menu.jpg pehle use hoti hai, ye sirf backup hai.
  // Permanent URL ke liye GitHub raw URL yahan env var se set karo.
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || 'https://muse.ai/files/1361303167066234/2344656512958812/i9npw80au2cpccebj8cx9ai5/menu.jpg',
  LICENSED_TO: 'AQDAS HACKER',
  LICENSE_TYPE: process.env.LICENSE_TYPE || 'Personal / Owner License',
  LICENSE_KEY: process.env.LICENSE_KEY || 'AQDAS-FREE-2026',
  LICENSED_NUMBERS: String(process.env.LICENSED_NUMBERS || '')
    .split(',')
    .map((s) => s.replace(/[^0-9]/g, ''))
    .filter(Boolean),
  ROOT: path.join(__dirname, '..'),
  get SESSION_PATH() { return path.join(this.ROOT, this.SESSION_DIR); },
};
