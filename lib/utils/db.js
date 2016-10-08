'use strict';

const Log = require('../models/log');
const logNames = require('./lognames');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const tasklogs = logNames.map(name => {
  return {
    elapsedTime: 0,
    level: 1,
    log: 'initialized',
    name,
    time: new Date()
  };
});
const initDb = () => {
  return Promise.all(tasklogs.map(tasklog => {
    const conditions = { name: tasklog.name };
    return Log.findOrCreate(conditions, tasklog);
  }));
};

mongoose.connection.on('error', err => {
  /* istanbul ignore next */
  throw err;
});

module.exports = {
  close () {
    return mongoose.connection.close();
  },
  open (uri) {
    return mongoose.connect(uri).then(() => initDb());
  }
};
