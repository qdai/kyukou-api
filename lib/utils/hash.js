'use strict';

const { createHash } = require('crypto');

const Hash = {
  create: str => createHash('sha256').update(str.replace(/\s/gu, '')).digest('hex'),
  isValid: hash => /^[a-f0-9]{64}$/u.test(hash)
};

module.exports = Hash;
