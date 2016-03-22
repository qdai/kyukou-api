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
 * Events API.
 */
const ApiEvents = class {
  /**
   * Get a list of current sheduled events.
   * @version 2.0.0
   * @since 2.0.0
   * @param {object} [options] - Options
   * @param {string[]} [options.departments] - Specify department. Allowed values: `edu`, `lit`, `law`, `sci`, `econ`.
   * @param {number} [options.date] - Date as YYYY-MM-DD.
   * @param {string} [options.q] - Query.
   * @param {number} [options.start=0] - Starting index.
   * @param {number} [options.count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  values (options) {
    let conditions = {};
    let count = null;
    let start = 0;
    if (typeof options === 'object') {
      // query
      if (options.q) {
        const q = String(options.q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        if (q.length >= 128) {
          return Promise.reject(createHttpError(400, 'Too long query'));
        }
        conditions.$or = [{
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
        }];
      }
      // department
      if (options.departments) {
        let departments = options.departments;
        if (!Array.isArray(departments)) {
          departments = String(departments).split(',');
        }
        departments = fromDepartmentKeys(departments);
        if (departments.length !== 0) {
          conditions.department = new RegExp(departments.join('|'));
        } else {
          return Promise.reject(createHttpError(400, 'Invalid departments'));
        }
      }
      // eventDate
      if (options.date) {
        const date = moment(options.date).startOf('day');
        if (date.isValid()) {
          conditions.eventDate = date.toDate();
        } else {
          return Promise.reject(createHttpError(400, 'Invalid Date'));
        }
      }
      // count
      count = parseInt(options.count, 10);
      // start
      start = parseInt(options.start, 10);
    }
    // find
    if (Object.keys(conditions).length === 0) {
      conditions = null;
    }
    return Event.find(conditions, '-_id -__v', {
      skip: start,
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
   * @return {Promise<event>} Added event.
   */
  add (event) {
    event.hash = Hash.create(event.raw);
    return Event.findOrCreate({
      hash: event.hash
    }, event, '-_id -__v').then(result => {
      if (result[1]) {
        return result[0];
      }
      return Promise.reject(createHttpError(409, `${result[0].hash} already exist`));
    });
  }
  /**
   * Get event.
   * @version 2.0.0
   * @since 2.0.0
   * @param {string} hash - Hash for target event.
   * @return {Promise<event>} Event
   */
  get (hash) {
    if (!Hash.isValid(hash)) {
      return Promise.reject(createHttpError(400, `Invalid hash: ${hash}`));
    }
    return Event.findOne({
      hash
    }, '-_id -__v').exec().then(result => {
      if (result) {
        return result;
      }
      return Promise.reject(createHttpError(404, `${hash} not found`));
    });
  }
  /**
   * Update event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @param {object} data - Allowed keys: `about`, `link`, `eventDate`, `period`, `department`, `subject`, `teacher`, `campus`, `room`, `note`, `raw`, `tweet.new`, `tweet.tomorrow`.
   * @return {Promise<event>} Updated event.
   */
  update (hash, data) {
    if (!Hash.isValid(hash)) {
      return Promise.reject(createHttpError(400, `Invalid hash: ${hash}`));
    }
    const validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
    for (const key in data) {
      if (validKeys.indexOf(key) === -1) {
        return Promise.reject(createHttpError(400, `Invalid key: ${key}`));
      }
    }
    return Event.findOneAndUpdate({
      hash
    }, data, {
      new: true,
      select: '-_id -__v'
    }).exec().then(result => {
      if (result) {
        return result;
      }
      return Promise.reject(createHttpError(404, `${hash} not found`));
    });
  }
  /**
   * Delete event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @return {Promise} Promise fulfilled with null.
   */
  delete (hash) {
    if (!Hash.isValid(hash)) {
      return Promise.reject(createHttpError(400, `Invalid hash: ${hash}`));
    }
    return Event.findOneAndRemove({
      hash
    }).exec().then(result => {
      if (result) {
        return null;
      }
      return Promise.reject(createHttpError(404, `${hash} not found`));
    });
  }
};

module.exports = ApiEvents;
