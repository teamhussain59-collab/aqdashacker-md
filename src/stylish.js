// Stylish writing — sirf display text ke liye, command/number/URL
// kabhi stylish nahi hote, taake copy karna aur samajhna asan rahe.
// Mathematical bold code points se banaya jata hai, taake har
// character poora rahe (surrogate-pair wali ghalti se bacha jaye).
function bold(text) {
  return String(text).split('').map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + code - 48);
    return ch;
  }).join('');
}

function title(text) {
  return bold(String(text).toUpperCase());
}

module.exports = { bold, title };
