var BBPromise = require('bluebird');
var mongoose = require('mongoose');
var mEvent = mongoose.model('Event');
var mTaskLog = mongoose.model('Tasklog');

function HttpError(code, message) {
  /* jshint -W103 */
  // TODO use Object.setPrototypeOf() (not implemented)
  this.constructor.prototype.__proto__ = Error.prototype;
  /* jshint +W103 */
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.code = code;
  this.message = message;
}

var api = {};

api.public = {};

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
api.public.events = {};

/**
 * @api {get} /events/list.json List
 * @apiDescription Get a list of current sheduled events.
 * @apiVersion 1.0.0
 * @apiName EventsList
 * @apiGroup Events
 *
 * @apiParam {Number} [start_index=0] Starting index.
 * @apiParam {Number} [count] List count. Returns all event if <code>count</code> is not specified.
 *
 * @apiUse FormatEvents
 */
api.public.events.list = function (start_index, count) {
  start_index = parseInt(start_index, 10) || 0;
  count = parseInt(count, 10) || null;
  return BBPromise.resolve(mEvent.find(null, '-_id -__v', {
    skip: start_index,
    limit: count,
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec()).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
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
api.public.events.yyyymmdd = function (yyyy, mm, dd, count) {
  var date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  if (isNaN(date.getTime())) {
    return BBPromise.reject(new HttpError(400, 'Invalid Date'));
  }
  count = parseInt(count, 10) || null;
  return BBPromise.resolve(mEvent.find({
    eventDate: date
  }, '-_id -__v', {
    limit: count,
    sort: {
      period: 1
    }
  }).exec()).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
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
api.public.events.search = function (q, count) {
  if (!q) {
    return BBPromise.reject(new HttpError(400, 'Query is not specified'));
  }
  q = String(q).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
  if (q.length >= 128) {
    return BBPromise.reject(new HttpError(400, 'Too long query'));
  }
  count = parseInt(count, 10) || null;
  return BBPromise.resolve(mEvent.find({
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
  }).exec()).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
};

/**
 * @apiDefine FormatLog
 * @apiSuccess {Object} log Log object.
 * @apiSuccess {String} log.name Log type. Same as requested <code>about</code>.
 * @apiSuccess {String} log.log Main content.
 * @apiSuccess {Number} log.level Error level.
 * @apiSuccess {Date} log.time Loged time.
 * @apiSuccess {Number} log.elapsedTime Elapsed time in ms.
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *     "name": "task",
 *     "log": "msg: 0 event(s) created\nmsg: 19 event(s) already exist",
 *     "level": 1,
 *     "time": "2015-01-21T11:05:00.298Z",
 *     "elapsedTime": 915.768167
 *   }
 */
api.public.logs = {};

/**
 * @api {get} /logs/:about.json :About
 * @apiDescription Get latest log.
 * @apiVersion 1.0.0
 * @apiName LogsAbout
 * @apiGroup Logs
 *
 * @apiParam {String=task,twit_new,twit_tomorrow,delete} about
 *
 * @apiUse FormatLog
 */
api.public.logs.about = function (about) {
  about = about.toString();
  if (['task', 'twit_new', 'twit_tomorrow', 'delete'].indexOf(about) === -1) {
    return BBPromise.reject(new HttpError(400, ':about must be one of task, twit_new, twit_tomorrow, delete'));
  }
  return BBPromise.resolve(mTaskLog.findOne({
    name: about
  }, '-_id -__v').exec()).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
};

api.private = {};
api.private.list = function () {
  return BBPromise.resolve(mEvent.find(null, '-__v', {
    sort: {
      eventDate: 1,
      period: 1
    }
  }).exec()).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
};
api.private.add = function (event) {
  event.eventDate = new Date(event.eventDate);
  if (event.pubDate) {
    event.pubDate = new Date(event.pubDate);
  }
  event.hash = require('crypto').createHash('sha256').update(event.raw.replace(/\s/g, '')).digest('hex');
  return new BBPromise(function (resolve, reject) {
    mEvent.findOrCreate({
      hash: event.hash
    }, event, function (err, event, created) {
      if (err) {
        reject(new HttpError(500, err.message));
      } else if (created) {
        resolve({
          success: {
            message: event.hash + ' created'
          }
        });
      } else {
        reject(new HttpError(400, event.hash + ' already exist'));
      }
    });
  });
};
api.private.edit = function (hash, data) {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return BBPromise.reject(new HttpError(400, 'Invalid hash ' + hash));
  }
  var validKeys = ['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'];
  for (var key in data) {
    if (validKeys.indexOf(key) === -1) {
      return BBPromise.reject(new HttpError(400, 'Invalid key ' + key));
    }
  }
  if (data.eventDate) {
    data.eventDate = new Date(data.eventDate);
  }
  return BBPromise.resolve(mEvent.findOneAndUpdate({
    hash: hash
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
      return BBPromise.reject(new HttpError(400, hash + ' not found'));
    }
  }).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
};
api.private.delete = function (hash) {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return BBPromise.reject(new HttpError(400, 'Invalid hash ' + hash));
  }
  return BBPromise.resolve(mEvent.findOneAndRemove({
    hash: hash
  }).exec()).then(function (event) {
    if (event) {
      return {
        success: {
          message: event.hash + ' deleted'
        }
      };
    } else {
      return BBPromise.reject(new HttpError(400, hash + ' not found'));
    }
  }).catch(function (err) {
    return BBPromise.reject(new HttpError(500, err.message));
  });
};

module.exports = api;
