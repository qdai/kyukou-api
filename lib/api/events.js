'use strict';

const Event = require('../models/event');
const Hash = require('../utils/hash');
const _ = require('lodash');
const createHttpError = require('http-errors');
const moment = require('moment');

const fromDepartmentKeys = keys => {
  const departments = {
    edu: '教育学',
    law: '法学',
    lit: '文学',
    sci: '理学'
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
   * @param {string[]} [departments] - Specify department. Allowed values: `edu`, `lit`, `law`, `sci`.
   * @param {number} [startIndex=0] - Starting index.
   * @param {number} [count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  async list (departments, startIndex = 0, count) {
    const departmentKeys = Array.isArray(departments) ? departments : String(departments).split(',');
    const departmentsArray = fromDepartmentKeys(departmentKeys);

    const conditions = departmentsArray.length === 0 ? null : { department: new RegExp(departmentsArray.join('|')) };
    const options = {
      limit: parseInt(count, 10) || null,
      skip: parseInt(startIndex, 10),
      sort: {
        eventDate: 1,
        period: 1
      }
    };
    const events = await Event.find(conditions, '-_id -__v', options).exec();
    return events;
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
  async yyyymmdd (yyyy, mm, dd, count) {
    const date = moment([
      parseInt(yyyy, 10),
      parseInt(mm, 10) - 1,
      parseInt(dd, 10)
    ]);
    if (!date.isValid()) {
      throw new createHttpError.BadRequest('Invalid Date');
    }

    const conditions = { eventDate: date.toDate() };
    const options = {
      limit: parseInt(count, 10) || null,
      sort: { period: 1 }
    };
    const events = await Event.find(conditions, '-_id -__v', options).exec();
    return events;
  }

  /**
   * Get a list of events matched search query.
   * @version 1.0.0
   * @since 1.0.0
   * @param {string} q - Query.
   * @param {number} [count] - List count. Returns all event if `count` is not specified.
   * @return {Promise<event[]>} Array of event.
   */
  async search (q, count) {
    if (!q) {
      throw new createHttpError.BadRequest('Query is not specified');
    }
    const query = String(q).replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
    if (query.length >= 128) {
      throw new createHttpError.BadRequest('Too long query');
    }

    const conditions = {
      $or: [
        { department: { $regex: query } },
        { raw: { $regex: query } },
        { about: { $regex: query } }
      ]
    };
    const options = {
      limit: parseInt(count, 10) || null,
      sort: {
        eventDate: 1,
        period: 1
      }
    };
    const events = await Event.find(conditions, '-_id -__v', options).exec();
    return events;
  }

  /**
   * Add event.
   * @access private
   * @param {event} event - New event.
   * @return {Promise<successMessage>} Success message.
   */
  async add (event) {
    event.hash = Hash.create(event.raw);

    const conditions = { hash: event.hash };
    const [result, created] = await Event.findOrCreate(conditions, event);
    if (!created) {
      throw new createHttpError.Conflict(`${result.hash} already exist`);
    }
    return { success: { message: `${event.hash} created` } };
  }

  /**
   * Edit event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @param {object} data - Allowed keys: `about`, `link`, `eventDate`, `period`, `department`, `subject`, `teacher`, `campus`, `room`, `note`, `raw`, `tweet.new`, `tweet.tomorrow`.
   * @return {Promise<successMessage>} Success message.
   */
  async edit (hash, data) {
    if (!Hash.isValid(hash)) {
      throw new createHttpError.BadRequest(`Invalid hash: ${hash}`);
    }
    const validKeys = [
      'about',
      'link',
      'eventDate',
      'period',
      'department',
      'subject',
      'teacher',
      'campus',
      'room',
      'note',
      'raw',
      'tweet.new',
      'tweet.tomorrow'
    ];
    const invalidKeys = _.difference(Object.keys(data), validKeys);
    if (invalidKeys.length !== 0) {
      throw new createHttpError.BadRequest(`Invalid key(s): ${invalidKeys.join(', ')}`);
    }

    const conditions = { hash };
    const options = { new: true };
    const result = await Event.findOneAndUpdate(conditions, data, options).lean().exec();
    if (!result) {
      throw new createHttpError.NotFound(`${hash} not found`);
    }
    return { success: { message: `${result.hash} updated` } };
  }

  /**
   * Delete event.
   * @access private
   * @param {string} hash - Hash for target event.
   * @return {Promise<successMessage>} Success message.
   */
  async delete (hash) {
    if (!Hash.isValid(hash)) {
      throw new createHttpError.BadRequest(`Invalid hash: ${hash}`);
    }

    const conditions = { hash };
    const result = await Event.findOneAndRemove(conditions).lean().exec();
    if (!result) {
      throw new createHttpError.NotFound(`${hash} not found`);
    }
    return { success: { message: `${result.hash} deleted` } };
  }
};

module.exports = ApiEvents;
