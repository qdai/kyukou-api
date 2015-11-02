'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const mEvent = mongoose.model('Event');

// delete expired data
module.exports = () => {
  return new Promise((resolve, reject) => {
    mEvent.find({
      eventDate: {
        $lte: moment().subtract(1, 'day').startOf('day').toDate()
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
