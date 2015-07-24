'use strict';

module.exports = function (mongoURI) {
  require('./db')(mongoURI);
  require('./utils/init_db');
  return {
    private: require('./api/private'),
    public: require('./api/public')
  };
};
