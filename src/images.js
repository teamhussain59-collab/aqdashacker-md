// Images — local file pehle, URL backup, text last.
const fs = require('fs');
const path = require('path');
const config = require('./config');

const menuImagePath = () => {
  for (const f of ['menu.jpg', 'menu.png', 'menu.jpeg', 'menu.webp']) {
    const p = path.join(config.ROOT, 'assets', f);
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const aliveSongPath = () => {
  for (const f of ['alive.mp3', 'alive.m4a', 'song.mp3']) {
    const p = path.join(config.ROOT, 'assets', f);
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const sendMenuImage = async (sock, jid, caption) => {
  const img = menuImagePath();
  if (img) { await sock.sendMessage(jid, { image: fs.readFileSync(img), caption }); return; }
  if (config.MENU_IMAGE_URL) { await sock.sendMessage(jid, { image: { url: config.MENU_IMAGE_URL }, caption }); return; }
  await sock.sendMessage(jid, { text: caption });
};

module.exports = { menuImagePath, aliveSongPath, sendMenuImage };
