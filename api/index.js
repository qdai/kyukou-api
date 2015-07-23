'use strict';

module.exports = function (mongoURI) {
  require('../db')(mongoURI);
  require('../lib/init_db');
  return {
    private: require('./private'),
    public: require('./public')
  };
};
