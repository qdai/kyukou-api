'use strict';

const db = require('./db');

module.exports = mongoURI => {
  db.open(mongoURI).then(() => {
    console.log('Mongoose connected'); // eslint-disable-line no-console
  });
  process.on('SIGINT', () => {
    db.close().then(() => {
      console.log('Mongoose disconnected'); // eslint-disable-line no-console
      process.exit(0);
    });
  });
  return {
    private: require('./api/private'),
    public: require('./api/public')
  };
};
