// Utils — chhote, safe helpers. Koi API, koi side-effect nahi.
const cleanNumber = (s) => String(s || '').replace(/[^0-9]/g, '');
const isValidNumber = (n) => /^[0-9]{10,15}$/.test(n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Sirf number aur + - * / ( ) % wale hisab — code injection nahi ho sakta.
const safeCalc = (expr) => {
  const e = String(expr || '').trim().slice(0, 50);
  if (!e || !/^[0-9+\-*/().\s%]+$/.test(e)) return null;
  try {
    const v = Function('return (' + e + ')')();
    if (typeof v !== 'number' || !isFinite(v)) return null;
    return Math.round(v * 1000000) / 1000000;
  } catch { return null; }
};

module.exports = { cleanNumber, isValidNumber, sleep, pick, safeCalc };
