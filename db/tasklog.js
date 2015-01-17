var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var stasklog = {
  name: {
    type: String,
    required: true
  },
  log: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  time: {
    type: Date,
    default: new Date()
  },
  elapsedTime: {
    type: Number,
    required: true
  }
};

module.exports = (function () {
  var Tasklog = new Schema(stasklog);
  Tasklog.plugin(findOrCreate);
  mongoose.model('Tasklog', Tasklog);
})();
