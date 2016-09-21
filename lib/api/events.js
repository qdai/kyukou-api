'use strict';

const Event = require('../models/event');
const Hash = require('../utils/hash');
const _ = require('lodash');
const createHttpError = require('http-errors');
const moment = require('moment');

const fromDepartmentKeys = keys => {
  const departments = {
    econ: '経済学部',
    edu: '教育学部',
    law: '法学部',
    lit: '文学部',
    sci: '理学部'
  };
  const validKeys = Object.keys(departments);
  return keys
    .filter((key, index, arr) => validKeys.includes(key) && arr.lastIndexOf(key) === index)
    .map(key => departments[key]);
};

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
  list (departments, startIndex = 0, count) {
    const departmentsArray = fromDepartmentKeys(Array.isArray(departments) ? departments : String(departments).split(','));
    const query = departmentsArray.length === 0 ? null : {
      department: new RegExp(departmentsArray.join('|'))
    };
    const limit = parseInt(count, 10) || null;
    const skip = parseInt(startIndex, 10);
    return Event.find(query, '-_id -__v', {
      limit,
      skip,
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
    const limit = parseInt(count, 10) || null;
    return Event.find({
      eventDate: date.toDate()
    }, '-_id -__v', {
      limit,
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
    const query = String(q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
    if (query.length >= 128) {
      return Promise.reject(createHttpError(400, 'Too long query'));
    }
    const limit = parseInt(count, 10) || null;
    return Event.find({
      $or: [{
        department: {
          $regex: query
        }
      }, {
        raw: {
          $regex: query
        }
      }, {
        about: {
          $regex: query
        }
      }]
    }, '-_id -__v', {
      limit,
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
            message: `${event.hash} created`
          }
        };
      }
      return Promise.reject(createHttpError(409, `${result[0].hash} already exist`));
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
      return Promise.reject(createHttpError(400, `Invalid hash: ${hash}`));
    }
    const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
    const invalidKeys = _.difference(Object.keys(data), validKeys);
    if (invalidKeys.length !== 0) {
      return Promise.reject(createHttpError(400, `Invalid key(s): ${invalidKeys.join(', ')}`));
    }
    return Event.findOneAndUpdate({
      hash
    }, data, {
      new: true
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: `${result.hash} updated`
          }
        };
      }
      return Promise.reject(createHttpError(404, `${hash} not found`));
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
      return Promise.reject(createHttpError(400, `Invalid hash: ${hash}`));
    }
    return Event.findOneAndRemove({
      hash
    }).lean().exec().then(result => {
      if (result) {
        return {
          success: {
            message: `${result.hash} deleted`
          }
        };
      }
      return Promise.reject(createHttpError(404, `${hash} not found`));
    });
  }
};

module.exports = ApiEvents;
