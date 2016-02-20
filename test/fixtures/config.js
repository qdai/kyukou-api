'use strict';

module.exports = {
  mongoURI: 'mongodb://localhost/kyukouapitest',
  twitter: JSON.parse(process.env.TEST_CONFIG_TWITTER) // eslint-disable-line no-process-env
};
