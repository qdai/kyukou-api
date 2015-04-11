var BBPromise = require('bluebird');

var getConnection = require('../db');

// delete expired data
module.exports = function () {
  return BBPromise.using(getConnection(), function (db) {
    var today = new Date();
    return db.model('Event').find({
      eventDate: {
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0)
      }
    }).remove().exec();
  }).then(function (removed) {
    return 'msg: ' + removed.result.n + ' event(s) deleted';
  });
};
