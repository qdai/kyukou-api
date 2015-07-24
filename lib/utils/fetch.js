'use strict';

const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const request = require('request');

// resolve([res, $cheerio]), reject(err)
module.exports = function (url, encode) {
  return new Promise(function (resolve, reject) {
    request({
      url,
      encoding: null
    }, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        const detected = jschardet.detect(body);
        if (encode !== detected.encoding && detected.confidence >= 0.99) {
          console.warn('Encoding seem to be ' + encode + ', use this');
          encode = detected.encoding;
        }
        if (encode.toLowerCase() !== 'utf-8') {
          body = iconv.decode(body, encode);
        }
        resolve([res, cheerio.load(body)]);
      } else {
        reject(err || new Error('status code: ' + res.statusCode));
      }
    });
  });
};
