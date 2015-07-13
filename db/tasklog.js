'use strict';

const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;

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

module.exports = (function () {
  const Tasklog = new Schema(stasklog);
  Tasklog.plugin(findOrCreate);
  mongoose.model('Tasklog', Tasklog);
})();
