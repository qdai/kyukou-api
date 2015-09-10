'use strict';

const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = url => {
  return fetch(url).then(res => {
    return res.text();
  }).then(body => {
    return cheerio.load(body);
  });
};
