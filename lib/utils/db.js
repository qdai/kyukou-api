'use strict';

const Log = require('../models/log');
const logNames = require('./lognames');
const mongoose = require('mongoose');

const tasklogs = logNames.map(name => ({
  elapsedTime: 0,
  level: 1,
  log: 'initialized',
  name,
  time: new Date()
}));
const initDb = () => {
  const findOrCreate = tasklog => {
    const conditions = { name: tasklog.name };
    return Log.findOrCreate(conditions, tasklog);
  };
  return Promise.all(tasklogs.map(findOrCreate));
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
    return mongoose.connect(uri)
      .then(() => initDb());
  }
};
