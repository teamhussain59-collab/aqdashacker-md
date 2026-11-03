// Shared bot state — ek hi jagah, taake server, bot aur commands
// hamesha ek hi status dekhen. Restart par ye reset ho jata hai.
const config = require('./config');

const state = {
  sock: null,
  botStatus: 'offline',
  lastPairingCode: null,
  lastNumber: null,
  pairingError: null,
  autoAi: false,
  channelAutoReact: process.env.CHANNEL_AUTO_REACT !== 'false',
  autoReact: true,
  // Pending .song choice: jid -> { query, searchUrl, isLink, at }
  pendingSong: new Map(),
  get config() { return config; },
};

module.exports = state;
