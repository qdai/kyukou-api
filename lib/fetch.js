var cheerio = require('cheerio');
var Iconv = require('iconv').Iconv;
var jschardet = require("jschardet");
var BBPromise = require('bluebird');
var request = require('request');

// resolve([res, $cheerio]), reject(err)
module.exports = function (url, encode) {
  return new BBPromise(function (resolve, reject) {
    request({
      url: url,
      encoding: null
    }, function (err, res, body) {
      if (!err && res.statusCode === 200) {
        var detected = jschardet.detect(body);
        if (encode !== detected.encoding && detected.confidence >= 0.99) {
          console.warn('Encoding seem to be ' + encode + ', use this');
          encode = detected.encoding;
        }
        if (encode.toLowerCase() !== 'utf-8') {
          var iconv = new Iconv(encode, 'UTF-8//TRANSLIT//IGNORE');
          body = iconv.convert(body).toString();
        }
        resolve([res, cheerio.load(body)]);
      } else {
        err = err ? err : new Error('status code: ' + res.statusCode);
        reject(err);
      }
    });
  });
};
