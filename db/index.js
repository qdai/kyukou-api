var Bluebird = require('bluebird');
var config = require('config');
var mongoose = require('mongoose');

// load models
require('./event');
require('./tasklog');

module.exports = function (uri) {
  uri = uri ? uri : config.get('mongoURI');
  return new Bluebird(function(resolve, reject) {
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
