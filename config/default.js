'use strict';

const jsonfile = require('jsonfile');
const path = require('path');

const pkg = jsonfile.readFileSync(path.join(__dirname, '../package.json'));

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  admin: {
    name: '',
    hash: '',
    salt: ''
  },
  secret: '',
  mongoURI: 'mongodb://localhost/kyukou',
  twitter: {
    consumer_key: '', // eslint-disable-line camelcase
    consumer_secret: '', // eslint-disable-line camelcase
    access_token: '', // eslint-disable-line camelcase
    access_token_secret: '' // eslint-disable-line camelcase
  },
  site: {
    name: '',
    description: '',
    keywords: '',
    url: '',
    lang: 'ja',
    twitter: '',
    version: 'v' + pkg.version,
    author: pkg.author,
    generator: pkg.name
  }
};
