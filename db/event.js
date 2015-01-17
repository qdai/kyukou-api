var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var sevent = {
  raw: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    validate: function (value) {
      return value.getTime() - Date.now() >= -64800000; // 18hours
    },
    required: true
  },
  pubDate: {
    type: Date,
    default: new Date()
  },
  period: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacher: {
    type: String
  },
  campus: {
    type: String
  },
  room: {
    type: String
  },
  note: {
    type: String
  },
  hash: {
    type: String,
    required: true
  },
  // below auto
  tweet: {
    new: {
      type: Boolean,
      default: false
    },
    tomorrow: {
      type: Boolean,
      default: false
    }
  }
};

module.exports = (function () {
  var Event = new Schema(sevent);
  Event.plugin(findOrCreate);
  mongoose.model('Event', Event);
})();
