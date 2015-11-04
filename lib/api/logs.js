'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const mTaskLog = mongoose.model('Tasklog');

const ApiLogs = class {
  about (about) {
    about = about.toString();
    if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
      return Promise.reject(createHttpError(400, ':about must be one of task, twit_new, twit_tomorrow, delete'));
    }
    return mTaskLog.findOne({
      name: about
    }, '-_id -__v').lean().exec();
  }
};

module.exports = ApiLogs;
