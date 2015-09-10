'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const findOrCreate = require('./findorcreate');

const stasklog = {
  name: {
    type: String,
    required: true
  },
  log: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true
  },
  elapsedTime: {
    type: Number,
    required: true
  }
};

module.exports = (() => {
  const Tasklog = new Schema(stasklog);
  Tasklog.plugin(findOrCreate);
  mongoose.model('Tasklog', Tasklog);
})();
