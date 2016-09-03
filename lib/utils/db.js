'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

const Log = require('../models/log');
const logNames = require('../utils/lognames');
const tasklogs = logNames.map(name => {
  return {
    name,
    log: 'initialized',
    level: 1,
    time: new Date(),
    elapsedTime: 0
  };
});
const initDb = () => {
  return Promise.all(tasklogs.map(tasklog => {
    return Log.findOrCreate({
      name: tasklog.name
    }, tasklog);
  }));
};

mongoose.connection.on('error', err => {
  /* istanbul ignore next */
  throw err;
});

module.exports = {
  open (uri) {
    return mongoose.connect(uri).then(() => initDb());
  },
  close () {
    return mongoose.connection.close();
  }
};
