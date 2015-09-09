'use strict';

const mongoose = require('mongoose');

// load models
require('./event');
require('./tasklog');

module.exports = function (uri) {
  mongoose.connect(uri);
  mongoose.connection.once('open', function () {
    console.log('Mongoose connected'); // eslint-disable-line no-console
  });
  mongoose.connection.on('error', function (err) {
    console.log('Mongoose connect failed'); // eslint-disable-line no-console
    throw err;
  });
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose disconnected'); // eslint-disable-line no-console
      process.exit(0); // eslint-disable-line no-process-exit
    });
  });
};
