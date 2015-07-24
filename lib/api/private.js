'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const createHash = require('../utils/createhash');

const mEvent = mongoose.model('Event');
const mTaskLog = mongoose.model('Tasklog');
const runTask = function (name, arg) {
  const time = new Date();
  const hrtime = process.hrtime();
  return require('../tasks/' + name)(arg).catch(function (err) {
    return 'err: ' + err.stack;
  }).then(function (log) {
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
    return Promise.resolve(mTaskLog.findOneAndUpdate({
      name: tasklog.name
    }, tasklog, {
      new: true
    }).exec());
  });
};

const events = {
  list () {
    return Promise.resolve(mEvent.find(null, '-__v', {
      sort: {
        eventDate: 1,
        period: 1
      }
    }).exec());
  },
  add (event) {
    event.eventDate = new Date(event.eventDate);
    if (event.pubDate) {
      event.pubDate = new Date(event.pubDate);
    }
    event.hash = createHash(event.raw);
    return new Promise(function (resolve, reject) {
      mEvent.findOrCreate({
        hash: event.hash
      }, event, function (err, result, created) {
        if (err) {
          reject(err);
        } else if (created) {
          resolve({
            success: {
              message: result.hash + ' created'
            }
          });
        } else {
          reject(createHttpError(409, result.hash + ' already exist'));
        }
      });
    });
  },
  edit (hash, data) {
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash ' + hash));
    }
    const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
    for (const key in data) {
      if (validKeys.indexOf(key) === -1) {
        return Promise.reject(createHttpError(400, 'Invalid key ' + key));
      }
    }
    if (data.eventDate) {
      data.eventDate = new Date(data.eventDate);
    }
    return Promise.resolve(mEvent.findOneAndUpdate({
      hash
    }, {
      $set: data
    }, {
      new: true
    }).exec()).then(function (event) {
      if (event) {
        return {
          success: {
            message: event.hash + ' updated'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, hash + ' not found'));
      }
    });
  },
  delete (hash) {
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash ' + hash));
    }
    return Promise.resolve(mEvent.findOneAndRemove({
      hash
    }).exec()).then(function (event) {
      if (event) {
        return {
          success: {
            message: event.hash + ' deleted'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, hash + ' not found'));
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
