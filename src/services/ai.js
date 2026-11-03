// AI service — Pollinations free text API, no key needed.
const axios = require('axios');

async function askAi(question) {
  const res = await axios.get(
    'https://text.pollinations.ai/' + encodeURIComponent(question),
    { timeout: 20000, responseType: 'text' }
  );
  const t = String(res.data || '').trim();
  return t.slice(0, 1500) || 'AI se jawab nahi mila, dobara try karo.';
}

module.exports = { askAi };
