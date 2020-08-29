'use strict';

const Event = require('../../lib/models/event');
const Log = require('../../lib/models/log');
const config = require('./config');
const db = require('../../lib/utils/db');

const dbInsert = (Model, data) => {
  const dataArray = Array.isArray(data) ? data : [data];
  return Promise.all(dataArray.map(d => new Model(d).save()));
};

const dbClear = Model => Model.find({}).deleteMany();

const testDb = {
  clear () {
    return Promise.all([this.clearEvent(), this.clearTasklog()]);
  },
  clearEvent () {
    return dbClear(Event);
  },
  clearTasklog () {
    return dbClear(Log);
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
  open () {
    return db.open(config.mongoURI);
  }
};

module.exports = testDb;
