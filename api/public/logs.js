'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const mTaskLog = mongoose.model('Tasklog');

const api = {};

api.about = function (about) {
  about = about.toString();
  if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
    return Promise.reject(createHttpError(400, ':about must be one of task, twit_new, twit_tomorrow, delete'));
  }
  return Promise.resolve(mTaskLog.findOne({
    name: about
  }, '-_id -__v').exec());
};

module.exports = api;
