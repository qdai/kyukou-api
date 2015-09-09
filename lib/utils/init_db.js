'use strict';

const mongoose = require('mongoose');

const mTaskLog = mongoose.model('Tasklog');
const tasklogs = ['task', 'twit_new', 'twit_tomorrow', 'delete'].map(function (name) {
  return {
    name,
    log: 'initialized',
    level: 1,
    time: new Date(),
    elapsedTime: 0
  };
});

Promise.all(tasklogs.map(function (tasklog) {
  return new Promise(function (resolve, reject) {
    mTaskLog.findOrCreate({
      name: tasklog.name
    }, tasklog, function (err, event, created) {
      if (err) {
        reject(err);
      } else {
        resolve(created);
      }
    });
  });
})).then(function () {
  console.log('msg: db init success'); // eslint-disable-line no-console
}).catch(function (err) {
  console.log('err: ' + err.stack); // eslint-disable-line no-console
});
