'use strict';

const createHttpError = require('http-errors');
const moment = require('moment');

const Hash = require('../utils/hash');

const fromDepartmentKeys = departments => {
  const departmentquery = [];
  departments.forEach((d, index, arr) => {
    if (arr.lastIndexOf(d) === index) {
      switch (d) { // eslint-disable-line default-case
        case 'edu':
          departmentquery.push('教育学部');
          break;
        case 'lit':
          departmentquery.push('文学部');
          break;
        case 'law':
          departmentquery.push('法学部');
          break;
        case 'sci':
          departmentquery.push('理学部');
          break;
        case 'econ':
          departmentquery.push('経済学部');
          break;
      }
    }
  });
  return departmentquery;
};
const Event = require('../models/event');

/**
 * Success message.
 * @typedef {Object} successMessage
 * @property {Object} success
 * @property {string} success.message - Success message.
 */

/**
 * Events API.
 */
const ApiEvents = class {
  /**
   * Get a list of current sheduled events.
   * @version 1.1.0
   * @since 1.0.0
   * @param {string[]} [departments] - Specify department. Allowed values: `edu`, `lit`, `law`, `sci`, `econ`.
   * @param {number} [startIndex=0] - Starting index.
   * @param {number} [count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  list (departments, startIndex, count) {
    if (!Array.isArray(departments)) {
      departments = String(departments).split(',');
    }
    departments = fromDepartmentKeys(departments);
    let query;
    if (departments.length === 0) {
      query = null;
    } else {
      query = {
        department: new RegExp(departments.join('|'))
      };
    }
    startIndex = parseInt(startIndex, 10) || 0;
    count = parseInt(count, 10) || null;
    return Event.find(query, '-_id -__v', {
      skip: startIndex,
      limit: count,
      sort: {
        eventDate: 1,
        period: 1
      }
    }).exec();
  }
  /**
   * Get a list of YYYY-MM-DD's events.
   * @version 1.0.0
   * @since 1.0.0
   * @param {number} yyyy - Year.
   * @param {number} mm - Month.
   * @param {number} dd - Date.
   * @param {number} [count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  yyyymmdd (yyyy, mm, dd, count) {
    const date = moment([parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10)]);
    if (!date.isValid()) {
      return Promise.reject(createHttpError(400, 'Invalid Date'));
    }
    count = parseInt(count, 10) || null;
    return Event.find({
      eventDate: date.toDate()
    }, '-_id -__v', {
      limit: count,
      sort: {
        period: 1
      }
    }).exec();
  }
  /**
   * Get a list of events matched search query.
   * @version 1.0.0
   * @since 1.0.0
   * @param {string} q - Query.
   * @param {number} [count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  search (q, count) {
    if (!q) {
      return Promise.reject(createHttpError(400, 'Query is not specified'));
    }
    q = String(q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
    if (q.length >= 128) {
      return Promise.reject(createHttpError(400, 'Too long query'));
    }
    count = parseInt(count, 10) || null;
    return Event.find({
      $or: [{
        department: {
          $regex: q
        }
      }, {
        raw: {
          $regex: q
        }
      }, {
        about: {
          $regex: q
        }
      }]
    }, '-_id -__v', {
      limit: count,
      sort: {
        eventDate: 1,
        period: 1
      }
    }).exec();
  }
  /**
   * Add event.
   * @access private
   * @param {event} event - New event.
   * @return {Promise<successMessage>} Success message.
   */
  add (event) {
    event.hash = Hash.create(event.raw);
    return Event.findOrCreate({
      hash: event.hash
    }, event).then(result => {
      if (result[1]) {
        return {
          success: {
            message: event.hash + ' created'
          }
        };
      } else {
        return Promise.reject(createHttpError(409, result[0].hash + ' already exist'));
      }
    });
  }
  /**
   * Edit event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @param {object} data - Allowed keys: `about`, `link`, `eventDate`, `period`, `department`, `subject`, `teacher`, `campus`, `room`, `note`, `raw`, `tweet.new`, `tweet.tomorrow`.
   * @return {Promise<successMessage>} Success message.
   */
  edit (hash, data) {
    if (!Hash.isValid(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash: ' + hash));
    }
    const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
    for (const key in data) {
      if (validKeys.indexOf(key) === -1) {
        return Promise.reject(createHttpError(400, 'Invalid key: ' + key));
      }
    }
    return Event.findOneAndUpdate({
      hash
    }, data, {
      new: true
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: result.hash + ' updated'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, hash + ' not found'));
      }
    });
  }
  /**
   * Delete event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @return {Promise<successMessage>} Success message.
   */
  delete (hash) {
    if (!Hash.isValid(hash)) {
      return Promise.reject(createHttpError(400, 'Invalid hash: ' + hash));
    }
    return Event.findOneAndRemove({
      hash
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: result.hash + ' deleted'
          }
        };
      } else {
        return Promise.reject(createHttpError(404, 'Hash: ' + hash + ' not found'));
      }
    });
  }
};

module.exports = ApiEvents;
