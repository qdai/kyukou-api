'use strict';

const Bluebird = require('bluebird');
const config = require('config');
const mongoose = require('mongoose');

// load models
require('./event');
require('./tasklog');

module.exports = function (uri) {
  uri = uri || config.get('mongoURI');
  return new Bluebird(function (resolve, reject) {
    const conn = mongoose.createConnection(uri);
    conn.once('open', function () {
      resolve(conn);
    });
    conn.on('error', function (err) {
      reject(err);
    });
  }).disposer(function (conn) {
    conn.close();
  });
};
