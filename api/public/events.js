'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const mEvent = mongoose.model('Event');
const fromDepartmentKeys = function (departments) {
  const departmentquery = [];
  departments.forEach(function (d, index, arr) {
    if (arr.lastIndexOf(d) === index) {
      switch(d) {
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

/**
 * @apiDefine FormatEvents
 * @apiSuccess {Object[]} events Array of event. Sorted by <code>eventDate</code> and <code>period</code>.
 * @apiSuccess {String} events.about Event type.
 * @apiSuccess {String} events.department Department.
 * @apiSuccess {String} events.subject Subject.
 * @apiSuccess {String} events.period Event period.
 * @apiSuccess {String} events.link Event URL.
 * @apiSuccess {Date} events.eventDate Event date.
 * @apiSuccess {Date} events.pubDate Date the event published.
 * @apiSuccess {String} events.raw Event source.
 * @apiSuccess {String} events.hash Event ID.
 * @apiSuccess {Object} events.tweet Tweet flags.
 * @apiSuccess {Boolean} events.tweet.new
 * @apiSuccess {Boolean} events.tweet.tomorrow
 * @apiSuccess {String} [events.campus] Campus.
 * @apiSuccess {String} [events.room] Room.
 * @apiSuccess {String} [events.teacher] Teacher.
 * @apiSuccess {String} [events.note] Notes.
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   [
 *     {
 *       "about": "休講",
 *       "department": "教育学部",
 *       "subject": "教科名",
 *       "period": "1",
 *       "link": "http://www.education.kyushu-u.ac.jp/topics/student_index",
 *       "eventDate": "2015-01-18T15:00:00.000Z",
 *       "pubDate": "2015-01-15T15:00:00.000Z",
 *       "raw": "【休講】1月19日（月） 1限 「教科名」（教員名教員）",
 *       "hash": "89c5918f7d1decffcfd72eebec6413ac7f3795d71f335bd97129df0c69818e8f",
 *       "tweet": {
 *         "tomorrow": true,
 *         "new": true
 *       },
 *       "teacher": "教員名"
 *     }
 *   ]
 */
const api = {};

/**
 * @api {get} /events/list.json List
 * @apiDescription Get a list of current sheduled events.
 * @apiVersion 1.1.0
 * @apiName EventsList
 * @apiGroup Events
 *
 * @apiParam {string[]=edu,lit,law,sci,econ} [departments] Specify department. Must be array of allowed values.
 * @apiParam {Number} [start_index=0] Starting index.
 * @apiParam {Number} [count] List count. Returns all event if <code>count</code> is not specified.
 *
 * @apiUse FormatEvents
 */
api.list = function (departments, start_index, count) { // eslint-disable-line camelcase
  if (!Array.isArray(departments)) {
    departments = String(departments).split(',');
  }
  departments = fromDepartmentKeys(departments);
  let condition;
  if (departments.length === 0) {
    condition = null;
  } else {
    condition = {
      department: new RegExp(departments.join('|'))
    };
  }
  const startIndex = parseInt(start_index, 10) || 0;
  count = parseInt(count, 10) || null;
  return Promise.resolve(mEvent.find(condition, '-_id -__v', {
    skip: startIndex,
    limit: count,
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec());
};

/**
 * @api {get} /events/:YYYY-:MM-:DD.json :YYYY-:MM-:DD
 * @apiDescription Get a list of YYYY-MM-DD's events.
 * @apiVersion 1.0.0
 * @apiName EventsYYYYMMDD
 * @apiGroup Events
 *
 * @apiParam {Number} YYYY Year.
 * @apiParam {Number} MM Month.
 * @apiParam {Number} DD Date.
 * @apiParam {Number} [count] List count. Returns all event if <code>count</code> is not specified.
 *
 * @apiUse FormatEvents
 */
api.yyyymmdd = function (yyyy, mm, dd, count) {
  const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  if (isNaN(date.getTime())) {
    return Promise.reject(createHttpError(400, 'Invalid Date'));
  }
  count = parseInt(count, 10) || null;
  return Promise.resolve(mEvent.find({
    eventDate: date
  }, '-_id -__v', {
    limit: count,
    sort: {
      period: 1
    }
  }).exec());
};

/**
 * @api {get} /events/search.json Search
 * @apiDescription Get a list of events matched search query.
 * @apiVersion 1.0.0
 * @apiName EventsSearch
 * @apiGroup Events
 *
 * @apiParam {String} q Query.
 * @apiParam {Number} [count] List count. Returns all event if <code>count</code> is not specified.
 *
 * @apiUse FormatEvents
 */
api.search = function (q, count) {
  if (!q) {
    return Promise.reject(createHttpError(400, 'Query is not specified'));
  }
  q = String(q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
  if (q.length >= 128) {
    return Promise.reject(createHttpError(400, 'Too long query'));
  }
  count = parseInt(count, 10) || null;
  return Promise.resolve(mEvent.find({
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
  }).exec());
};

module.exports = api;
