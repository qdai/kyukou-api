'use strict';

const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const fromDepartmentKeys = function (departments) {
  const departmentquery = [];
  departments.forEach(function (d, index, arr) {
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
  list (departments, start_index, count) { // eslint-disable-line camelcase
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
  },
  yyyymmdd (yyyy, mm, dd, count) {
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
  }
};

const logs = {
  about (about) {
    about = about.toString();
    if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
      return Promise.reject(createHttpError(400, ':about must be one of task, twit_new, twit_tomorrow, delete'));
    }
    return Promise.resolve(mTaskLog.findOne({
      name: about
    }, '-_id -__v').exec());
  }
};

module.exports = {
  events,
  logs
};
