'use strict';

const mongoose = require('mongoose');

const mEvent = mongoose.model('Event');

// delete expired data
module.exports = function () {
  const today = new Date();
  return Promise.resolve(mEvent.find({
    eventDate: {
      $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0)
    }
  }).remove().exec()).then(function (removed) {
    return 'msg: ' + removed.result.n + ' event(s) deleted';
  });
};
