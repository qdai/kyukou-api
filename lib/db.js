var mongoose = require('mongoose');

var config = require('../settings/config');

module.exports = {
  connect: function () {
    mongoose.connect(config.mongoURI);
    mongoose.connection.once('open', function() {
      console.log('msg: database connect success.');
    });
    mongoose.connection.on('error', function (err) {
      console.log('msg: database connect failed.');
      throw err
    });
  },
  disconnect: function () {
    return mongoose.connection.close(function () {
      console.log('msg: database disconnect success.');
    });
  }
}
