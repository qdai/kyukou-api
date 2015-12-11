'use strict';

const moment = require('moment');

const mEvent = require('../models/event');

// delete expired data
module.exports = () => {
  return mEvent.find({
    eventDate: {
      $lte: moment().subtract(1, 'day').startOf('day').toDate()
    }
  }).remove().then(removed => {
    return 'msg: ' + removed.result.n + ' event(s) deleted';
  });
};
