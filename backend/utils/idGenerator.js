const { v4: uuidv4 } = require('uuid');

const generateId = (prefix = '') => {
  const short = uuidv4().split('-')[0];
  return prefix ? `${prefix}_${short}` : short;
};

module.exports = { generateId };
