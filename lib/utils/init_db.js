'use strict';

const mongoose = require('mongoose');

const mTaskLog = mongoose.model('Tasklog');
const tasklogs = ['task', 'twit_new', 'twit_tomorrow', 'delete'].map(name => {
  return {
    name,
    log: 'initialized',
    level: 1,
    time: new Date(),
    elapsedTime: 0
  };
});

Promise.all(tasklogs.map(tasklog => {
  return mTaskLog.findOrCreate({
    name: tasklog.name
  }, tasklog).then(result => {
    return result[1];
  });
})).then(() => {
  console.log('msg: db init success'); // eslint-disable-line no-console
}).catch(err => {
  console.log('err: ' + err.stack); // eslint-disable-line no-console
});
