'use strict';

const config = require('config');
const mongoose = require('mongoose');

const mongoURI = config.get('mongoURI');

// db setting
require('../db/event');
require('../db/tasklog');
mongoose.connect(mongoURI);
mongoose.connection.once('open', function () {
  console.log('Mongoose connected');
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connect failed');
  throw err;
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected');
    process.exit(0); // eslint-disable-line no-process-exit
  });
});

const api = {
  private: require('./private'),
  public: require('./public')
};

module.exports = api;
