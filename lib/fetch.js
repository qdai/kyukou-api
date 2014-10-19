var request = require('request');
var jschardet = require("jschardet");
var Iconv = require('iconv').Iconv;
var cheerio = require('cheerio');

// callback(err, res, $cheerio);
var fetch = function (url, encode, callback) {
  request({
    url: url,
    encoding: null
  }, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      if (!err) {
        err = new Error('fetch ' + res.url + ' status code: ' + res.statusCode);
      }
      return callback(err, res, null);
    }
    var detected = jschardet.detect(body);
    if (encode !== detected.encoding) {
      console.warn('wrn: given encoding doesn\'t equal auto-detected encoding.');
      if (detected.confidence >= 0.99) {
        encode = detected.encoding;
        console.warn('wrn: encoding seem to be ' + encode + ', use this.');
      } else {
        console.warn('wrn: use given encoding.');
      }
    }
    if (encode !== 'UTF-8') {
      var iconv = new Iconv(encode, 'UTF-8//TRANSLIT//IGNORE');
      body = iconv.convert(body).toString();
    }
    return callback(null, res, cheerio.load(body));
  });
};

module.exports = fetch;
