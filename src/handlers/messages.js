// Message handler — auto react, status seen, channel react, license gate,
// song choice reply, command dispatch, auto-AI. Bot ka dil yahan hai.
const config = require('../config');
const state = require('../state');
const { isLicensed } = require('../license');
const { dispatch, handleSongReply } = require('../commands');
const { askAi } = require('../services/ai');

async function handleMessages(sock, messages) {
  for (const m of messages) {
    try {
      if (!m.message) continue;

      // Channel auto react — sirf linked/admin account ke channel posts par.
      if (m.key.remoteJid && m.key.remoteJid.endsWith('@newsletter')) {
        if (state.channelAutoReact && (!config.CHANNEL_JID || m.key.remoteJid === config.CHANNEL_JID)) {
          try { await sock.sendMessage(m.key.remoteJid, { react: { text: '🔥', key: m.key } }); } catch {}
        }
        continue;
      }

      // Status seen — seen mark karo, save mat karo.
      if (m.key.remoteJid === 'status@broadcast') {
        try { await sock.readMessages([m.key]); } catch {}
        continue;
      }
      if (m.key.fromMe) continue;

      // Auto react — DM par, group mein nahi (spam se bachne ke liye).
      if (state.autoReact && !m.key.remoteJid.endsWith('@g.us')) {
        try { await sock.sendMessage(m.key.remoteJid, { react: { text: '🔥', key: m.key } }); } catch {}
      }

      const text = m.message.conversation || m.message.extendedTextMessage?.text
        || m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson && (() => { try { return JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id || ''; } catch { return ''; } })()
        || m.message.interactiveResponseMessage?.body?.text
        || m.message.buttonsResponseMessage?.selectedButtonId
        || m.message.templateButtonReplyMessage?.selectedId
        || m.message.listResponseMessage?.singleSelectReply?.selectedRowId
        || '';
      const jid = m.key.remoteJid;
      const isGroup = jid.endsWith('@g.us');
      const sender = m.key.participant || jid;

      // Song choice reply — command nahi, pending sawal ka jawab hai.
      if (!text.startsWith(config.PREFIX) && text.trim()) {
        if (await handleSongReply({ sock, jid }, text)) continue;
      }

      if (text.startsWith(config.PREFIX)) {
        const parts = text.slice(1).trim().split(/\s+/);
        const cmd = (parts[0] || '').toLowerCase();
        const arg = parts.slice(1).join(' ').trim();

        if (!isLicensed(jid) && !['license', 'checklicense', 'menu', 'help', 'owner'].includes(cmd)) {
          await sock.sendMessage(jid, { text: `❌ *LICENSE REQUIRED*\n\nIs bot ko use karne ke liye aapka number license list mein hona chahiye.\nOwner se rabta karo: https://wa.me/${config.OWNER_NUMBER}\n\nLicense info: ${config.PREFIX}license` });
          continue;
        }

        await dispatch({ sock, jid, cmd, arg, isGroup, state, config, msg: m, sender });
        continue;
      }

      // Auto AI — owner on kare, DM only, group mein nahi.
      if (state.autoAi && !isGroup && text.trim()) {
        const ans = await askAi(text.trim()).catch(() => null);
        if (ans) await sock.sendMessage(jid, { text: `🤖 *AQDAS AI*\n\n${ans}` });
      }
    } catch (e) {
      console.error('Handler error:', e.message);
    }
  }
}

module.exports = { handleMessages };
