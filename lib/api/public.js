'use strict';

const createHttpError = require('http-errors');
const moment = require('moment');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

const fromDepartmentKeys = departments => {
  const departmentquery = [];
  departments.forEach((d, index, arr) => {
    if (arr.lastIndexOf(d) === index) {
      switch (d) {
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
const mEvent = mongoose.model('Event');
const mTaskLog = mongoose.model('Tasklog');

const events = {
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
    return mEvent.find(query, '-_id -__v', {
      skip: startIndex,
      limit: count,
      sort: {
        eventDate: 1,
        period: 1
      }
    }).lean().exec();
  },
  yyyymmdd (yyyy, mm, dd, count) {
    const date = moment([parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10)]);
    if (!date.isValid()) {
      return Promise.reject(createHttpError(400, 'Invalid Date'));
    }
    count = parseInt(count, 10) || null;
    return mEvent.find({
      eventDate: date.toDate()
    }, '-_id -__v', {
      limit: count,
      sort: {
        period: 1
      }
    }).lean().exec();
  },
  search (q, count) {
    if (!q) {
      return Promise.reject(createHttpError(400, 'Query is not specified'));
    }
    q = String(q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
    if (q.length >= 128) {
      return Promise.reject(createHttpError(400, 'Too long query'));
    }
    count = parseInt(count, 10) || null;
    return mEvent.find({
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
    }).lean().exec();
  }
};

const logs = {
  about (about) {
    about = about.toString();
    if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
      return Promise.reject(createHttpError(400, ':about must be one of task, twit_new, twit_tomorrow, delete'));
    }
    return mTaskLog.findOne({
      name: about
    }, '-_id -__v').lean().exec();
  }
};

module.exports = {
  events,
  logs
};
