'use strict';

const tasks = {
  task: require('./task'),
  twit_new: require('./twit_new'), // eslint-disable-line camelcase
  twit_tomorrow: require('./twit_tomorrow'), // eslint-disable-line camelcase
  delete: require('./delete')
};

module.exports = tasks;
