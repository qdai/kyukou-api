var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync('./package.json').toString());

var config = {
  name: '九州大学休講情報 alpha',
  description: '九州大学の休講情報です。教育学部、文学部、法学部、理学部、経済学部に対応しています。',
  keywords: '九州大学休講情報,九州大学,九大,休講情報,休講,教育学部,文学部,法学部,理学部,経済学部',
  url: 'http://kyukou-kyudai.rhcloud.com',
  lang: 'ja',
  twitter: 'kyukou_kyudai',
  version: 'v' + pkg.version,
  author: pkg.author,
  genarator: pkg.name
};

module.exports = config;
