'use strict';

const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const findOrCreate = require('./findorcreate');

const sevent = {
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
    validate (value) {
      value = moment(value);
      const date = moment().subtract(18, 'hours');
      return !value.isBefore(date);
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

module.exports = (() => {
  const Event = new Schema(sevent);
  Event.plugin(findOrCreate);
  mongoose.model('Event', Event);
})();
