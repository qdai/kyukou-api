'use strict';

const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = function (url) {
  return fetch(url).then(function (res) {
    return res.text();
  }).then(function (body) {
    return cheerio.load(body);
  });
};
