'use strict';

const mongoose = require('mongoose');

const config = require('./config');
const db = require('../../lib/utils/db');
const mEvent = require('../../lib/models/event');
const mTasklog = require('../../lib/models/log');

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
    return dbInsert(mEvent, data);
  },
  insertTasklog (data) {
    return dbInsert(mTasklog, data);
  },
  clearEvent () {
    return dbClear(mEvent);
  },
  clearTasklog () {
    return dbClear(mTasklog);
  },
  clear () {
    return Promise.all([this.clearEvent(), this.clearTasklog()]);
  }
};

module.exports = testDb;
