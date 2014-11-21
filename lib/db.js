var mongoose = require('mongoose');

module.exports = {
  connect: function (uri) {
    mongoose.connect(uri);
    mongoose.connection.once('open', function () {
      console.log('msg: database connect success.');
    });
    mongoose.connection.on('error', function (err) {
      console.log('msg: database connect failed.');
      throw err
    });
  },
  disconnect: function () {
    mongoose.connection.close(function () {
      console.log('msg: database disconnect success.');
    });
  }
}
