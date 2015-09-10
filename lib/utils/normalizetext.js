'use strict';

/*
 * zenkaku to hankaku
 * replace Ideographic Space and below:
 * ！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？
 * ＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＺＸＹＺ［＼］＾＿
 * ｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｚｘｙｚ｛｜｝～
 */
module.exports = text => {
  return text.replace(/[\uff01-\uff5e]/g, s => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  }).replace(/\u3000/g, '\u0020').trim();
};
