'use strict';

const Bluebird = require('bluebird');

const dbConnection = require('../db');

// delete expired data
module.exports = function () {
  return Bluebird.using(dbConnection(), function (db) {
    const today = new Date();
    return db.model('Event').find({
      eventDate: {
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0)
      }
    }).remove().exec();
  }).then(function (removed) {
    return 'msg: ' + removed.result.n + ' event(s) deleted';
  });
};
