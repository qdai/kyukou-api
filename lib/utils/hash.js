'use strict';

const crypto = require('crypto');

const Hash = {
  create: str => crypto.createHash('sha256').update(str.replace(/\s/g, '')).digest('hex'),
  isValid: hash => /^[a-f0-9]{64}$/.test(hash)
};

module.exports = Hash;
