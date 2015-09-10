'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

// load models
require('./event');
require('./tasklog');

module.exports = uri => {
  mongoose.connect(uri);
  mongoose.connection.once('open', () => {
    console.log('Mongoose connected'); // eslint-disable-line no-console
  });
  mongoose.connection.on('error', err => {
    console.log('Mongoose connect failed'); // eslint-disable-line no-console
    throw err;
  });
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose disconnected'); // eslint-disable-line no-console
      process.exit(0); // eslint-disable-line no-process-exit
    });
  });
};
