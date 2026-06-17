const crypto = require('crypto');

const generateId = (prefix = '') => {
  const short = crypto.randomUUID().split('-')[0];
  return prefix ? `${prefix}_${short}` : short;
};

module.exports = { generateId };
