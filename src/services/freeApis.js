// Free APIs — sab no-key, sab ke fallback hain.
// Koi bhi API fail ho to command khali nahi jati: local list ya link milta hai.
// MyMemory ka shared quota khatam ho sakta hai, is liye translate pehle
// Google ke free endpoint se try karta hai, phir MyMemory, phir link.
const axios = require('axios');
const { pick } = require('../utils');
const { JOKES, FACTS, QUOTES } = require('../data');

async function fetchJoke() {
  try {
    const res = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 12000 });
    if (res.data && res.data.setup && res.data.punchline) return `${res.data.setup}\n${res.data.punchline}`;
  } catch {}
  return pick(JOKES);
}

async function fetchFact() {
  try {
    const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', { timeout: 12000 });
    if (res.data && res.data.text) return res.data.text;
  } catch {}
  return pick(FACTS);
}

async function fetchQuote() {
  try {
    const res = await axios.get('https://dummyjson.com/quotes/random', { timeout: 12000 });
    if (res.data && res.data.quote) return `"${res.data.quote}" — ${res.data.author || 'Unknown'}`;
  } catch {}
  return pick(QUOTES);
}

async function fetchWeather(city) {
  // Step 1: geocoding (Open-Meteo, no key) -> lat/lon
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'en', format: 'json' },
    timeout: 15000,
  });
  const place = geo.data && geo.data.results && geo.data.results[0];
  if (!place) return null;
  // Step 2: current weather (Open-Meteo, no key)
  const w = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: place.latitude,
      longitude: place.longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'auto',
    },
    timeout: 15000,
  });
  const c = w.data && w.data.current;
  if (!c) return null;
  const codes = { 0: 'Saaf aasman ☀️', 1: 'Halke badal 🌤️', 2: 'Badal ⛅', 3: 'Badal chhaye ☁️', 45: 'Dhund 🌫️', 48: 'Dhund 🌫️', 51: 'Halki boond 🌦️', 53: 'Boond 🌦️', 55: 'Boond 🌦️', 61: 'Barish 🌧️', 63: 'Barish 🌧️', 65: 'Tez barish 🌧️', 71: 'Barf ❄️', 80: 'Barish 🌧️', 95: 'Toofan ⛈️' };
  return {
    name: `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}${place.country ? ', ' + place.country : ''}`,
    temp: c.temperature_2m,
    feels: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    desc: codes[c.weather_code] || ('Weather code ' + c.weather_code),
    time: c.time,
  };
}

async function translateText(text, target = 'ur') {
  // Google free endpoint (unofficial, no key)
  try {
    const res = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: { client: 'gtx', sl: 'auto', tl: target, dt: 't', q: text },
      timeout: 15000,
    });
    const parts = res.data && res.data[0];
    if (Array.isArray(parts)) {
      const out = parts.map((p) => p[0]).join('');
      if (out && out.trim()) return out;
    }
  } catch {}
  // MyMemory fallback
  try {
    const res = await axios.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair: 'en|' + target },
      timeout: 15000,
    });
    const t = res.data && res.data.responseData && res.data.responseData.translatedText;
    if (t && !/MYMEMORY WARNING/i.test(t) && !/QUERY LENGTH LIMIT/i.test(t)) return t;
  } catch {}
  return null;
}

async function fetchDefinition(word) {
  const res = await axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), { timeout: 15000 });
  const e = res.data && res.data[0];
  if (!e) return null;
  const meaning = e.meanings && e.meanings[0];
  const def = meaning && meaning.definitions && meaning.definitions[0];
  return {
    word: e.word,
    phonetic: (e.phonetics && e.phonetics.find((p) => p.text) || {}).text || null,
    partOfSpeech: meaning ? meaning.partOfSpeech : null,
    definition: def ? def.definition : null,
    example: def ? def.example : null,
  };
}

async function fetchCrypto() {
  const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: { ids: 'bitcoin,ethereum', vs_currencies: 'usd,pkr' },
    timeout: 15000,
  });
  return res.data;
}

async function fetchAnimal(kind) {
  if (kind === 'dog') {
    const res = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 12000 });
    return res.data && res.data.message ? res.data.message : null;
  }
  const res = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 12000 });
  return res.data && res.data[0] && res.data[0].url ? res.data[0].url : null;
}

const qrUrl = (text) => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(text);

module.exports = { fetchJoke, fetchFact, fetchQuote, fetchWeather, translateText, fetchDefinition, fetchCrypto, fetchAnimal, qrUrl };
