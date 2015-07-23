'use strict';

const config = require('config');

const mongoURI = config.get('mongoURI');

require('../db')(mongoURI);

const api = {
  private: require('./private'),
  public: require('./public')
};

module.exports = api;
