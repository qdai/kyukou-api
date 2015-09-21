'use strict';

module.exports = {
  localhost: 'http://localhost:8000',
  mongoURI: 'mongodb://localhost/kyukouapitest',
  twitter: JSON.parse(process.env.TEST_CONFIG_TWITTER)
};
