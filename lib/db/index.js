'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

// load models
require('./event')();
require('./tasklog')();

const mTaskLog = mongoose.model('Tasklog');
const tasklogs = ['scrap', 'twit_new', 'twit_tomorrow', 'delete'].map(name => {
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
    return mTaskLog.findOrCreate({
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
