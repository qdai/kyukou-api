'use strict';

const mongoose = require('mongoose');

mongoose.Promise = Promise;

const mEvent = mongoose.model('Event');

// delete expired data
module.exports = () => {
  const today = new Date();
  return new Promise((resolve, reject) => {
    mEvent.find({
      eventDate: {
        $lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0)
      }
    }).remove((err, removed) => {
      if (err) {
        reject(err);
      } else {
        resolve(removed);
      }
    });
  }).then(removed => {
    return 'msg: ' + removed.result.n + ' event(s) deleted';
  });
};
