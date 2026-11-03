// License helpers — key kabhi chat mein print nahi hoti.
const config = require('./config');

const isOwner = (jid) => {
  if (!config.OWNER_NUMBER) return false;
  return String(jid || '').startsWith(config.OWNER_NUMBER);
};

const isLicensed = (jid) => {
  if (!config.LICENSED_NUMBERS.length) return true; // no allowlist = open
  const num = String(jid || '').replace(/[^0-9]/g, '');
  return isOwner(jid) || config.LICENSED_NUMBERS.some((n) => num.startsWith(n));
};

const checkLicenseKey = (key) => String(key || '').trim() === config.LICENSE_KEY;

module.exports = { isOwner, isLicensed, checkLicenseKey };
