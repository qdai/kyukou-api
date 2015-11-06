'use strict';

module.exports = hash => {
  return /^[a-f0-9]{64}$/.test(hash);
};
