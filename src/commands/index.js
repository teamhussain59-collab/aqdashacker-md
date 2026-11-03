// Command dispatcher — har group apni file mein, yahan sirf order hai.
const botCmds = require('./bot');
const aiCmds = require('./ai');
const downloaderCmds = require('./downloader');
const funCmds = require('./fun');
const utilityCmds = require('./utility');

const handlers = [botCmds, aiCmds, downloaderCmds, funCmds, utilityCmds];

async function dispatch(ctx) {
  for (const h of handlers) {
    if (await h.handle(ctx)) return true;
  }
  return false;
}

module.exports = { dispatch, handleSongReply: downloaderCmds.handleSongReply };
