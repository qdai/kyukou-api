'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const mEvent = mongoose.model('Event');

const api = {};

api.list = function () {
  return Promise.resolve(mEvent.find(null, '-__v', {
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec());
};

api.add = function (event) {
  event.eventDate = new Date(event.eventDate);
  if (event.pubDate) {
    event.pubDate = new Date(event.pubDate);
  }
  event.hash = require('crypto').createHash('sha256').update(event.raw.replace(/\s/g, '')).digest('hex');
  return new Promise(function (resolve, reject) {
    mEvent.findOrCreate({
      hash: event.hash
    }, event, function (err, result, created) {
      if (err) {
        reject(err);
      } else if (created) {
        resolve({
          success: {
            message: result.hash + ' created'
          }
        });
      } else {
        reject(createHttpError(409, result.hash + ' already exist'));
      }
    });
  });
};

api.edit = function (hash, data) {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return Promise.reject(createHttpError(400, 'Invalid hash ' + hash));
  }
  const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
  for (const key in data) {
    if (validKeys.indexOf(key) === -1) {
      return Promise.reject(createHttpError(400, 'Invalid key ' + key));
    }
  }
  if (data.eventDate) {
    data.eventDate = new Date(data.eventDate);
  }
  return Promise.resolve(mEvent.findOneAndUpdate({
    hash
  }, {
    $set: data
  }, {
    new: true
  }).exec()).then(function (event) {
    if (event) {
      return {
        success: {
          message: event.hash + ' updated'
        }
      };
    } else {
      return Promise.reject(createHttpError(404, hash + ' not found'));
    }
  });
};

api.delete = function (hash) {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return Promise.reject(createHttpError(400, 'Invalid hash ' + hash));
  }
  return Promise.resolve(mEvent.findOneAndRemove({
    hash
  }).exec()).then(function (event) {
    if (event) {
      return {
        success: {
          message: event.hash + ' deleted'
        }
      };
    } else {
      return Promise.reject(createHttpError(404, hash + ' not found'));
    }
  });
};

module.exports = api;
