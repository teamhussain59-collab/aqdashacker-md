// TikTok search + download — .ttsearch / .tiktoks / .searchtt
// User ka bheja hua code, is bot ke handler style mein adapt kiya gaya:
// dispatch() { sock, jid, cmd, arg, msg, sender } deta hai, is liye
// session/from/args/prefix wala purana signature yahan nahi chalta.
// Search: TikWM free API. Download: button dabane par wahi message
// dobara ".ttsearch dl_video <url>" / ".ttsearch dl_audio <url>" ban kar
// aata hai, is liye download flow isi handler mein hai.
// Sirf wo content download karo jis ka haq tumhare paas ho / jo free ho.
const axios = require('axios');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const config = require('../config');

const FALLBACK_THUMB = 'https://i.ibb.co/mVvK7CFB/ad09bf786822.jpg';
const FALLBACK_BUF = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const MAX_MEDIA_BYTES = 60 * 1024 * 1024; // WhatsApp file limit ke qareeb, is se bara ho to link bhejo

async function react(sock, jid, msg, text) {
  if (!msg || !msg.key) return;
  try { await sock.sendMessage(jid, { react: { text, key: msg.key } }); } catch {}
}

async function downloadFlow(ctx, action, url) {
  const { sock, jid, msg } = ctx;
  if (!url) return true;
  try {
    await react(sock, jid, msg, '⏳');
    const { data } = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 30000 });
    if (data.code !== 0 || !data.data) throw new Error('ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴍᴇᴅɪᴀ');

    const author = data.data.author?.nickname || 'ᴜɴᴋɴᴏᴡɴ';
    const title = (data.data.title || 'ɴᴏ ᴛɪᴛʟᴇ').substring(0, 50) + '...';
    const header = `*╭┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈᛭*`;
    const footer = `*╰┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉━┈᛭*`;

    if (action === 'dl_video') {
      const videoRes = await axios.get(data.data.play, { responseType: 'arraybuffer', timeout: 60000 });
      const buf = Buffer.from(videoRes.data);
      const caption = `${header}\n*┇•* 🎬 *ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ*\n*┇•* 👤 *ᴄʀᴇᴀᴛᴏʀ:* ${author}\n*┇•* 📝 *ᴛɪᴛʟᴇ:* ${title}\n*┇•* 📦 *ᴛʏᴘᴇ:* ᴍᴘ4\n${footer}`;
      if (buf.length > MAX_MEDIA_BYTES) {
        await sock.sendMessage(jid, { text: `${caption}\n\n⚠️ Video boht bara hai, is liye link bhej raha hoon:\n${url}` }, msg ? { quoted: msg } : {});
      } else {
        await sock.sendMessage(jid, { video: buf, caption, mimetype: 'video/mp4' }, msg ? { quoted: msg } : {});
      }
    } else {
      const audioRes = await axios.get(data.data.music, { responseType: 'arraybuffer', timeout: 60000 });
      const buf = Buffer.from(audioRes.data);
      const caption = `${header}\n*┇•* 🎵 *ᴛɪᴋᴛᴏᴋ ᴀᴜᴅɪᴏ*\n*┇•* 👤 *ᴄʀᴇᴀᴛᴏʀ:* ${author}\n*┇•* 📝 *ᴛɪᴛʟᴇ:* ${title}\n*┇•* 📦 *ᴛʏᴘᴇ:* ᴍᴘ3\n${footer}`;
      if (buf.length > MAX_MEDIA_BYTES) {
        await sock.sendMessage(jid, { text: `${caption}\n\n⚠️ Audio boht bara hai, is liye link bhej raha hoon:\n${url}` }, msg ? { quoted: msg } : {});
      } else {
        await sock.sendMessage(jid, {
          audio: buf,
          mimetype: 'audio/mp4',
          fileName: 'tiktok_audio.mp3',
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: author,
              body: title,
              mediaType: 1,
              renderLargerThumbnail: true,
              thumbnailUrl: data.data.cover || FALLBACK_THUMB,
              sourceUrl: url,
            },
          },
        }, msg ? { quoted: msg } : {});
      }
    }
    await react(sock, jid, msg, '✅');
  } catch (e) {
    console.error('[ttsearch download] Error:', e.message);
    await react(sock, jid, msg, '❌');
    await sock.sendMessage(jid, { text: `❌ ᴇʀʀᴏʀ: ${e.message}` }, msg ? { quoted: msg } : {});
  }
  return true;
}

async function handle(ctx) {
  const { sock, jid, cmd, arg, msg } = ctx;
  if (!['ttsearch', 'tiktoks', 'searchtt'].includes(cmd)) return false;
  const P = config.PREFIX;

  const parts = (arg || '').trim().split(/\s+/).filter(Boolean);
  if (parts[0] === 'dl_video' || parts[0] === 'dl_audio') {
    return downloadFlow(ctx, parts[0], parts[1]);
  }

  const query = (arg || '').trim();
  if (!query) {
    await sock.sendMessage(jid, { text: `🩸 *ᴜsᴀɢᴇ:* ${P}ttsearch <sᴇᴀʀᴄʜ ǫᴜᴇʀʏ>` }, msg ? { quoted: msg } : {});
    return true;
  }

  try {
    await react(sock, jid, msg, '🔎');
    await sock.sendMessage(jid, { text: `🔎 *sᴇᴀʀᴄʜɪɴɢ ᴛɪᴋᴛᴏᴋ ғᴏʀ:* ${query}...` }, msg ? { quoted: msg } : {});

    const { data: ttSearchData } = await axios.get('https://www.tikwm.com/api/feed/search/', {
      params: { keywords: query, count: 5, cursor: 0 },
      timeout: 30000,
      maxContentLength: 5 * 1024 * 1024,
    });

    if (ttSearchData.code !== 0 || !ttSearchData.data || !ttSearchData.data.videos || ttSearchData.data.videos.length === 0) {
      throw new Error('ɴᴏ ᴛɪᴋᴛᴏᴋs ғᴏᴜɴᴅ ғᴏʀ ᴛʜɪs ǫᴜᴇʀʏ.');
    }

    const ttResults = ttSearchData.data.videos.slice(0, 5);

    // Carousel banane mein koi masla ho to plain list fallback hai,
    // taake user ko results phir bhi mil jayein.
    try {
      let ttFallbackBuf;
      try {
        const fRes = await axios.get(FALLBACK_THUMB, { responseType: 'arraybuffer', timeout: 10000 });
        ttFallbackBuf = Buffer.from(fRes.data);
      } catch (e) { ttFallbackBuf = FALLBACK_BUF; }

      const ttCards = [];
      for (let i = 0; i < ttResults.length; i++) {
        const video = ttResults[i];
        const ttTitle = (video.title || 'ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ').slice(0, 50) + '...';
        const ttAuthor = video.author?.nickname || 'ᴄʀᴇᴀᴛᴏʀ';
        const ttAuthorId = video.author?.unique_id || 'tiktok';
        const ttThumbUrl = video.cover || video.origin_cover || FALLBACK_THUMB;
        const ttOfficialUrl = `https://www.tiktok.com/@${ttAuthorId}/video/${video.video_id}`;

        let ttCardMedia;
        try {
          const ttThumbRes = await axios.get(ttThumbUrl, { responseType: 'arraybuffer', timeout: 5000 });
          ttCardMedia = await prepareWAMessageMedia({ image: Buffer.from(ttThumbRes.data) }, { upload: sock.waUploadToServer });
        } catch (err) {
          ttCardMedia = await prepareWAMessageMedia({ image: ttFallbackBuf }, { upload: sock.waUploadToServer });
        }

        ttCards.push({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `👤 *ᴄʀᴇᴀᴛᴏʀ:* ${ttAuthor}\n📝 *ᴅᴇsᴄ:* ${ttTitle}`,
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: `ᴛɪᴋᴛᴏᴋ ʀᴇsᴜʟᴛ ${i + 1}`,
            hasMediaAttachment: true,
            imageMessage: ttCardMedia.imageMessage,
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎬 ᴠɪᴅᴇᴏ (ᴍᴘ4)', id: `${P}ttsearch dl_video ${ttOfficialUrl}` }) },
              { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎵 ᴀᴜᴅɪᴏ (ᴍᴘ3)', id: `${P}ttsearch dl_audio ${ttOfficialUrl}` }) },
            ],
          }),
        });
      }

      const senderJid = ctx.sender || jid;
      const ttInteractiveMsg = proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: `🎵 *ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ ʀᴇsᴜʟᴛs*\n\nʜᴇʏ @${senderJid.split('@')[0]}\nsᴡɪᴘᴇ ᴀɴᴅ ᴄʜᴏᴏsᴇ ʏᴏᴜʀ ᴅᴏᴡɴʟᴏᴀᴅ! ➡️`,
        }),
        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({ cards: ttCards, messageVersion: 1 }),
      });

      const ttFinalMsg = generateWAMessageFromContent(jid, {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: ttInteractiveMsg,
      }, msg ? { quoted: msg, mentions: [senderJid] } : { mentions: [senderJid] });

      const ttBizNodes = [{
        tag: 'biz',
        attrs: {},
        content: [{
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [{ tag: 'native_flow', attrs: { v: '2', name: 'mixed' }, content: undefined }],
        }],
      }];
      if (!jid.endsWith('@g.us')) {
        ttBizNodes[0].content.push({ tag: 'bot', attrs: { biz_bot: '1' }, content: undefined });
      }

      await sock.relayMessage(jid, ttFinalMsg.message, { messageId: ttFinalMsg.key.id, additionalNodes: ttBizNodes });
    } catch (carouselErr) {
      console.error('[ttsearch carousel fallback]', carouselErr.message);
      const lines = ttResults.map((v, i) => {
        const authorId = v.author?.unique_id || 'tiktok';
        return `${i + 1}. ${v.author?.nickname || 'ᴄʀᴇᴀᴛᴏʀ'} — ${(v.title || '').slice(0, 40)}\nhttps://www.tiktok.com/@${authorId}/video/${v.video_id}`;
      }).join('\n\n');
      await sock.sendMessage(jid, {
        text: `🎵 *ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ ʀᴇsᴜʟᴛs: ${query}*\n\n${lines}\n\nDownload ke liye likho:\n${P}ttsearch dl_video <link>\n${P}ttsearch dl_audio <link>`,
      }, msg ? { quoted: msg } : {});
    }

    await react(sock, jid, msg, '✅');
  } catch (e) {
    console.error('[TT ERROR]', e.message);
    await react(sock, jid, msg, '❌');
    await sock.sendMessage(jid, { text: `🩸 ᴇʀʀᴏʀ: ${e.message}` }, msg ? { quoted: msg } : {});
  }
  return true;
}

module.exports = { handle };
