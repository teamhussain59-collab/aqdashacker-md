// Channel post react — .chreact (owner only, sirf apne channel par)
// Omegatech Rch API: GET /api/Fun/Rch?action=react&url=<post link>&emoji=<emojis>
// API queue par dalta hai, foran react nahi lagta. Koi key is code mein
// nahi rakhi jati aur API ka jawab chat mein dikhate waqt key/points
// wali fields nahi dikhayi jatin.
// Voting: is API ka vote wala endpoint user ne nahi diya, is liye
// .chvote abhi sirf batata hai ke vote ke liye kya chahiye, guess par
// koi request nahi bhejta.
const axios = require('axios');
const config = require('../config');
const { isOwner } = require('../license');

const API_BASE = 'https://api.omegatech.app/api/Fun/Rch';
const EMOJI_RE = /\p{Extended_Pictographic}/u;

// Arg parse: emoji aur link dono order mein ho sakte hain.
// ".chreact 🤫,🤗 <link>" ya ".chreact <link> 🤫,🤗" ya ".chreact 1917 🤫"
function parseChreact(arg) {
  const text = String(arg || '').trim();
  if (!text) return { error: 'empty' };
  const tokens = text.split(/\s+/);
  let postUrl = null;
  const emojiParts = [];
  for (const tok of tokens) {
    if (tok.startsWith('http')) { postUrl = tok; continue; }
    if (/^\d+$/.test(tok)) {
      // Sirf post number diya ho to apne channel ka link banao.
      postUrl = config.CHANNEL_URL.replace(/\/$/, '') + '/' + tok;
      continue;
    }
    if (EMOJI_RE.test(tok)) { emojiParts.push(tok); continue; }
    // Koi aur lafz ho to ignore karo, emoji/link hi chahiye.
  }
  const cleanEmojis = emojiParts.join(',').replace(/\s+/g, '').replace(/,+/g, ',').replace(/^,|,$/g, '');
  if (!postUrl) return { error: 'no-url' };
  if (!cleanEmojis) return { error: 'no-emoji' };
  // Sirf apna channel: dusre channel par react bhejna mana hai.
  const base = config.CHANNEL_URL.replace(/\/$/, '');
  if (!postUrl.startsWith(base + '/') && postUrl !== base) return { error: 'other-channel', postUrl };
  return { postUrl, emojis: cleanEmojis };
}

async function callReactApi(postUrl, emojis) {
  const { data } = await axios.get(API_BASE, {
    params: { action: 'react', url: postUrl, emoji: emojis },
    timeout: 60000,
  });
  return data;
}

async function handle(ctx) {
  const { sock, jid, cmd, arg, msg } = ctx;
  const P = config.PREFIX;

  if (cmd === 'chvote' || cmd === 'channelvote') {
    await sock.sendMessage(jid, { text:
      `🗳️ *CHANNEL VOTE*\n\nVote ke liye abhi koi API endpoint nahi diya gaya hai.\nReact ke liye use karo: ${P}chreact 🤫 <post link>\n\nVote add karne ke liye vote wala API link / example bhejo, main usi tarah add kar dunga. Guess par vote request nahi bheji jati.` }, msg ? { quoted: msg } : {});
    return true;
  }

  if (!['chreact', 'channelreactapi', 'reactchannel'].includes(cmd)) return false;

  if (!isOwner(jid) && !isOwner(ctx.sender)) {
    await sock.sendMessage(jid, { text: '❌ Ye command sirf owner use kar sakta hai.' }, msg ? { quoted: msg } : {});
    return true;
  }

  const parsed = parseChreact(arg);
  if (parsed.error === 'empty' || parsed.error === 'no-url' || parsed.error === 'no-emoji') {
    await sock.sendMessage(jid, { text:
      `Use: ${P}chreact <emoji> <channel post link>\n\nExample:\n${P}chreact 🤫,🤗 ${config.CHANNEL_URL}/1917\n\nYa sirf post number:\n${P}chreact 🤫 1917\n\nSirf apne channel ki post par react bhejta hai.` }, msg ? { quoted: msg } : {});
    return true;
  }
  if (parsed.error === 'other-channel') {
    await sock.sendMessage(jid, { text: '❌ Sirf apne channel ki post ka link do. Dusre channel par react nahi bheja jata.' }, msg ? { quoted: msg } : {});
    return true;
  }

  await sock.sendMessage(jid, { text: `⏳ React queue mein bheja ja raha hai...\n\nPost: ${parsed.postUrl}\nEmoji: ${parsed.emojis}` }, msg ? { quoted: msg } : {});
  try {
    const res = await callReactApi(parsed.postUrl, parsed.emojis);
    const d = res && res.data ? res.data : {};
    if (d.ok === false || res.success === false) {
      await sock.sendMessage(jid, { text: `❌ React API ne mana kar diya.\n\n${d.message || res.message || 'Koi wajah nahi mili.'}` }, msg ? { quoted: msg } : {});
      return true;
    }
    // Key/points/usage fields chat mein kabhi nahi dikhate.
    await sock.sendMessage(jid, { text:
      `✅ *CHANNEL REACT QUEUED*\n\nPost: ${d.target || parsed.postUrl}\nEmoji: ${d.emojis || parsed.emojis}\n${d.task_id ? 'Task: ' + d.task_id + '\n' : ''}${d.message ? d.message + '\n' : ''}\n⚠️ Ye react third-party API ki queue se lagta hai, apne WhatsApp account se nahi. WhatsApp isko hata bhi sakta hai.` }, msg ? { quoted: msg } : {});
  } catch (e) {
    await sock.sendMessage(jid, { text: `❌ React API se jawab nahi mila.\n\n${e.message}` }, msg ? { quoted: msg } : {});
  }
  return true;
}

module.exports = { handle, parseChreact, callReactApi };
