'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const createHash = require('../utils/createhash');
const isValidHash = require('../utils/isvalidhash');

mongoose.Promise = Promise;

const mEvent = mongoose.model('Event');
const mTaskLog = mongoose.model('Tasklog');
const runTask = (name, arg) => {
  const time = new Date();
  const hrtime = process.hrtime();
  return require('../tasks/' + name)(arg).catch(err => {
    return 'err: ' + err.stack;
  }).then(log => {
    const diff = process.hrtime(hrtime);
    const tasklog = {
      name,
      log,
      level: 1,
      time,
      elapsedTime: diff[0] * 1e3 + diff[1] * 1e-6
    };
    if (/err: /.test(tasklog.log)) {
      tasklog.level = 4;
    } else if (/wrn: /.test(tasklog.log)) {
      tasklog.level = 3;
    } else if (/inf: /.test(tasklog.log)) {
      tasklog.level = 2;
    }
    return mTaskLog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, {
      new: true
    }).lean().exec().then(result => {
      delete result._id; // eslint-disable-line no-underscore-dangle
      delete result.__v; // eslint-disable-line no-underscore-dangle
      return result;
    });
  });
};

const events = {
  list () {
    return mEvent.find(null, '-__v', {
      sort: {
        eventDate: 1,
        period: 1
      }
    }).lean().exec();
  },
  add (event) {
    event.hash = createHash(event.raw);
    return mEvent.findOrCreate({
      hash: event.hash
    }, event).then(result => {
      if (result[1]) {
        return {
          success: {
            message: event.hash + ' created'
          }
        };
      } else {
        return Promise.reject(createHttpError(409, result[0].hash + ' already exist'));
      }
    });
  },
  edit (hash, data) {
    if (!isValidHash(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash: ' + hash));
    }
    const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
    for (const key in data) {
      if (validKeys.indexOf(key) === -1) {
        return Promise.reject(createHttpError(400, 'Invalid key: ' + key));
      }
    }
    return mEvent.findOneAndUpdate({
      hash
    }, data, {
      new: true
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: result.hash + ' updated'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, hash + ' not found'));
      }
    });
  },
  delete (hash) {
    if (!isValidHash(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash: ' + hash));
    }
    return mEvent.findOneAndRemove({
      hash
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: result.hash + ' deleted'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, 'Hash: ' + hash + ' not found'));
      }
    });
  }
};

const tasks = {
  task () {
    return runTask('task');
  },
  twitNew (config) {
    return runTask('twit_new', config);
  },
  twitTomorrow (config) {
    return runTask('twit_tomorrow', config);
  },
  delete () {
    return runTask('delete');
  }
};

module.exports = {
  events,
  tasks
};
