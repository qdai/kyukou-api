'use strict';

const mongoose = require('mongoose');

const config = require('./config');
const db = require('../../lib/db');

mongoose.Promise = Promise;

const dbInsert = (model, data) => {
  const Model = mongoose.model(model);
  if (!Array.isArray(data)) {
    data = [data];
  }
  return Promise.all(data.map(d => {
    return new Model(d).save();
  }));
};

const dbClear = model => {
  return new Promise((resolve, reject) => {
    mongoose.model(model).find({}).remove(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const testDb = {
  open () {
    return db.open(config.mongoURI);
  },
  close () {
    return db.close();
  },
  insertEvent (data) {
    return dbInsert('Event', data);
  },
  insertTasklog (data) {
    return dbInsert('Tasklog', data);
  },
  clearEvent () {
    return dbClear('Event');
  },
  clearTasklog () {
    return dbClear('Tasklog');
  },
  clear () {
    return Promise.all([this.clearEvent(), this.clearTasklog()]);
  }
};

module.exports = testDb;
