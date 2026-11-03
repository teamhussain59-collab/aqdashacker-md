// Downloader service — Cobalt (public, no key) + iTunes Search (free, no key).
// Cobalt badal sakta hai / fail ho sakta hai — har jagah fallback link hai.
const axios = require('axios');

async function cobaltLink(videoUrl) {
  try {
    const res = await axios.post(
      'https://api.cobalt.tools/api/json',
      { url: videoUrl, downloadMode: 'auto', filenameStyle: 'basic' },
      { timeout: 20000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
    );
    if (res.data && res.data.url) return res.data.url;
  } catch {}
  return null;
}

// iTunes preview: 30 second ka asal audio preview, koi key nahi.
async function itunesPreview(query) {
  try {
    const res = await axios.get('https://itunes.apple.com/search', {
      params: { term: query, media: 'music', limit: 1 },
      timeout: 15000,
    });
    const r = res.data && res.data.results && res.data.results[0];
    if (!r) return null;
    return {
      track: r.trackName || null,
      artist: r.artistName || null,
      previewUrl: r.previewUrl || null,
      trackUrl: r.trackViewUrl || null,
    };
  } catch { return null; }
}

module.exports = { cobaltLink, itunesPreview };
