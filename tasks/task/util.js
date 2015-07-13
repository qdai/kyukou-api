'use strict';

const cheerio = require('cheerio');
const crypto = require('crypto');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const request = require('request');

module.exports = {
  // resolve([res, $cheerio]), reject(err)
  fetch (url, encode) {
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
  },
  /*
   * zenkaku to hankaku
   * replace Ideographic Space and below:
   * ！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？
   * ＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＺＸＹＺ［＼］＾＿
   * ｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｚｘｙｚ｛｜｝～
   */
  normalizeText (text) {
    return text.replace(/[\uff01-\uff5e]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).replace(/\u3000/g, '\u0020').trim();
  },
  isValidDate (date, youbi) {
    return ['日', '月', '火', '水', '木', '金', '土', '日'][date.getDay()] === youbi;
  },
  createHash (str) {
    return crypto.createHash('sha256').update(str.replace(/\s/g, '')).digest('hex');
  }
};
