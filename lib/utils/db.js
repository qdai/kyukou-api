'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

const Log = require('../models/log');
const logNames = require('../utils/lognames');
const logs = logNames.map(name => {
  return {
    name,
    log: 'initialized',
    level: 1,
    time: new Date(),
    elapsedTime: 0
  };
});
const initDb = () => {
  return Promise.all(logs.map(log => {
    return Log.findOrCreate({
      name: log.name
    }, log);
  }));
};

mongoose.connection.on('error', err => {
  /* istanbul ignore next */
  throw err;
});

module.exports = {
  open (uri) {
    mongoose.connect(uri);
    return new Promise(resolve => {
      mongoose.connection.once('open', () => {
        resolve();
      });
    }).then(() => {
      return initDb();
    });
  },
  close () {
    return new Promise(resolve => {
      mongoose.connection.close(() => {
        resolve();
      });
    });
  }
};
