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
api.public.events = {};
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
api.public.logs = {};
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
