var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var tasklog = {
  name: {
    type: String,
    required: true
  },
  log: {
    type: String,
    required: true
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

module.exports = function () {
  var Tasklog = new Schema(tasklog);
  Tasklog.plugin(findOrCreate);
  mongoose.model('Tasklog', Tasklog);
};
