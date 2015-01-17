var mongoose = require('mongoose');
var BBPromise = require('bluebird');

// load models
require('./event');
require('./tasklog');

var config = require('../settings/config');

module.exports = function (uri) {
  uri = uri ? uri : config.mongoURI;
  return new BBPromise(function(resolve, reject) {
    var conn = mongoose.createConnection(uri);
    conn.once('open', function () {
      resolve(conn);
    });
    conn.on('error', function (err) {
      reject(err);
    });
  }).disposer(function(conn) {
    conn.close();
  });
};
