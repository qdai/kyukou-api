var pkg = require('../package.json');

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
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
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
