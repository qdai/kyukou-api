'use strict';

const mongoose = require('mongoose');

const config = require('./config');
const db = require('../../lib/utils/db');
const Event = require('../../lib/models/event');
const Log = require('../../lib/models/log');

mongoose.Promise = Promise;

const dbInsert = (Model, data) => {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return Promise.all(data.map(d => {
    return new Model(d).save();
  }));
};

const dbClear = Model => {
  return Model.find({}).remove();
};

const testDb = {
  open () {
    return db.open(config.mongoURI);
  },
  close () {
    return db.close();
  },
  insertEvent (data) {
    return dbInsert(Event, data);
  },
  insertTasklog (data) {
    return dbInsert(Log, data);
  },
  clearEvent () {
    return dbClear(Event);
  },
  clearTasklog () {
    return dbClear(Log);
  },
  clear () {
    return Promise.all([this.clearEvent(), this.clearTasklog()]);
  }
};

module.exports = testDb;
