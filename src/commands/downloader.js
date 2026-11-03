// Downloader commands — .song (choice flow), .video, .apk.
// .song: pehle image + sawal, phir user ka "1/mp3" ya "2/video" jawab
// handleSongReply() se complete hota hai. State pendingSong mein rehta hai.
const config = require('../config');
const state = require('../state');
const { sendMenuImage } = require('../images');
const { cobaltLink, itunesPreview } = require('../services/downloader');

async function handle(ctx) {
  const { sock, jid, cmd, arg } = ctx;
  const P = config.PREFIX;

  if (cmd === 'song') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}song song ka naam ya YouTube link` }); return true; }
    const isLink = arg.startsWith('http');
    const searchUrl = isLink ? arg : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(arg);
    state.pendingSong.set(jid, { query: arg, searchUrl, isLink, at: Date.now() });
    const choiceText = `🎵 *SONG: ${arg}*\n\nAapko kya chahiye? 👇\n\n*1* ya *mp3* likho — MP3 (audio) ke liye\n*2* ya *video* likho — Video ke liye\n\nJawab 5 minute ke andar do, warna dobara ${P}song likhna pare ga.`;
    await sendMenuImage(sock, jid, choiceText);
    return true;
  }
  if (cmd === 'video') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}video video ka naam ya YouTube link` }); return true; }
    const isLink = arg.startsWith('http');
    const searchUrl = isLink ? arg : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(arg);
    const dl = isLink ? await cobaltLink(arg) : null;
    await sock.sendMessage(jid, { text:
      `🎬 *VIDEO*\n\n🔎 Search: ${arg}\n🔗 Watch: ${searchUrl}\n${dl ? '⬇️ Download: ' + dl + '\n' : ''}\n⚠️ Sirf wo content download karo jis ka haq tumhare paas ho / jo free ho.` });
    return true;
  }
  if (cmd === 'apk') {
    if (!arg) { await sock.sendMessage(jid, { text: `Use: ${P}apk app ka naam` }); return true; }
    await sock.sendMessage(jid, { text:
      `📱 *APK SEARCH: ${arg}*\n\n▶️ Play Store: https://play.google.com/store/search?q=${encodeURIComponent(arg)}&c=apps\n🔎 APKPure: https://apkpure.com/search?q=${encodeURIComponent(arg)}\n\n⚠️ APK sirf official / trusted source se lo. Unknown APK phone ke liye khatarnak ho sakta hai.` });
    return true;
  }
  return false;
}

// Non-command reply to a pending .song question. Returns true if handled.
async function handleSongReply(ctx, text) {
  const { sock, jid } = ctx;
  const P = config.PREFIX;
  if (!state.pendingSong.has(jid)) return false;
  const reply = text.trim().toLowerCase();
  const pending = state.pendingSong.get(jid);

  if (Date.now() - pending.at > 5 * 60 * 1000) {
    state.pendingSong.delete(jid);
    await sock.sendMessage(jid, { text: '⏰ Song wali choice ka waqt khatam ho gaya.\nDobara likho: ' + P + 'song ' + pending.query });
    return true;
  }
  if (['cancel', 'band', 'ruk', 'stop'].includes(reply)) {
    state.pendingSong.delete(jid);
    await sock.sendMessage(jid, { text: '❌ Song wali choice cancel kar di. Dobara chahiye to ' + P + 'song ' + pending.query + ' likho.' });
    return true;
  }
  if (['1', 'mp3', 'mp3 song', 'audio'].includes(reply)) {
    state.pendingSong.delete(jid);
    const dl = pending.isLink ? await cobaltLink(pending.query) : null;
    const preview = pending.isLink ? null : await itunesPreview(pending.query);
    const musicUrl = pending.isLink ? pending.searchUrl : 'https://music.youtube.com/search?q=' + encodeURIComponent(pending.query);
    await sock.sendMessage(jid, { text:
      `🎵 *MP3 — ${pending.query}*\n\n${preview && preview.track ? `🎧 Mila: ${preview.track} — ${preview.artist || ''}\n` : ''}${preview && preview.previewUrl ? '▶️ Preview (30 sec): ' + preview.previewUrl + '\n' : ''}🔗 Suno: ${pending.searchUrl}\n🎧 Music: ${musicUrl}\n${dl ? '⬇️ Download: ' + dl + '\n' : '⬇️ Download: upar wale link ko kholo, phir Cobalt / YouTube se MP3 lo.\n'}\n⚠️ Sirf wo content download karo jis ka haq tumhare paas ho / jo free ho.` });
    return true;
  }
  if (['2', 'video', 'video song', 'mp4'].includes(reply)) {
    state.pendingSong.delete(jid);
    const dl = pending.isLink ? await cobaltLink(pending.query) : null;
    await sock.sendMessage(jid, { text:
      `🎬 *VIDEO — ${pending.query}*\n\n🔗 Dekho: ${pending.searchUrl}\n${dl ? '⬇️ Download: ' + dl + '\n' : ''}\n⚠️ Sirf wo content download karo jis ka haq tumhare paas ho / jo free ho.` });
    return true;
  }
  if (reply) {
    await sock.sendMessage(jid, { text: `Batao, *${pending.query}* ke liye kya chahiye?\n\n*1* ya *mp3* likho — MP3 ke liye\n*2* ya *video* likho — Video ke liye\nCancel ke liye *cancel* likho.` });
    return true;
  }
  return false;
}

module.exports = { handle, handleSongReply };
