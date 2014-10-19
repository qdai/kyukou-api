var express = require('express');
var router = express.Router();
var async = require('async');
var pwd = require('pwd');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

var config = require('../settings/config');
var site = require('../settings/site');

router.get('/', function (req, res) {
  if (!req.session.loggedin) {
    return res.redirect('/admin/login');
  }
  res.render('admin', {
    site: site
  });
});

router.get('/login', function (req, res) {
  if (req.session.loggedin) {
    return res.redirect('/admin');
  }
  res.render('login', {
    site: site
  });
});

router.post('/login', function (req, res) {
  var name = req.body.name;
  var pass = req.body.password;
  if (name !== config.admin.name) {
    return res.redirect('/admin/login');
  }
  pwd.hash(pass, config.admin.salt, function (err, hash) {
    if (err) {
      return res.render('error', {
        message: err.message,
        error: err
      });
    }
    if (hash !== config.admin.hash) {
      return res.redirect('/admin/login');
    }
    req.session.loggedin = true;
    return res.redirect('/admin');
  });
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/list.json', function (req, res) {
  res.set('Content-Type', 'application/json');
  if (!req.session.loggedin) {
    return res.send('{"error":{"message":"auth require"}}');
  }
  async.waterfall([
    function (callback) {
      Event.find(null, '-__v', {
        sort: {
          eventDate: 1,
          period: 1
        }
      }, function (err, events) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, events);
      });
    }
  ], function (err, events) {
    if (err) {
      return res.send('{"error":{"message":"' + err.message + '"}}');
    }
    res.send(JSON.stringify(events));
  });
})

router.post('/:adminmethod', function (req, res) {
  res.set('Content-Type', 'application/json');
  if (!req.session.loggedin) {
    return res.send('{"error":{"message":"auth require"}}');
  }
  switch (String(req.params.adminmethod)) {
    case 'add':
      var data = req.body; // TODO: validate
      data.eventDate = new Date(data.eventDate);
      if (!data.pubDate) {
        data.pubDat = new Date();
      }
      data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
      async.waterfall([
        function (callback) {
          Event.findOrCreate({
            hash: data.hash
          }, data, function (err, event, created) {
            if (err) {
              return callback(err, null);
            }
            if (!created) {
              return callback(new Error('not created'), null);
            }
            return callback(null, event);
          });
        }
      ], function (err, event) {
        if (err) {
          console.log(err)
          return res.send('{"error":{"message":"' + err.message + '"}}');
        }
        res.send('{"success":{"message":"' + event.hash + ' created"}}');
      });
      break;
    case 'edit':
      var hash = req.body.hash;
      if (!/^[a-f0-9]{64}$/.test(hash)) {
        return res.send('{"error":{"message":"invalid hash"}}');
      }
      var key = req.body.key;
      if (['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'].indexOf(key) === -1) {
        return res.send('{"error":{"message":"invalid data key"}}');
      }
      var value = req.body.value;
      if (key === 'eventDate') {
        value = new Date(value);
      }
      var data = {};
      data[key] = value;
      async.waterfall([
        function (callback) {
          Event.findOneAndUpdate({
            hash: hash
          }, {
            $set: data
          }, function (err, event) {
            if (err) {
              return callback(err, null);
            }
            return callback(null, event);
          });
        }
      ], function (err, event) {
        if (err) {
          return res.send('{"error":{"message":"' + err.message + '"}}');
        }
        if (!event){
          return res.send('{"error":{"message":"not found"}}');
        }
        res.send('{"success":{"message":"' + event.hash + ' updated"}}');
      });
      break;
    case 'delete':
      var hash = req.body.hash;
      if (!/^[a-f0-9]{64}$/.test(hash)) {
        return res.send('{"error":{"message":"invalid hash"}}');
      }
      async.waterfall([
        function (callback) {
          Event.findOneAndRemove({ hash: hash }, function (err, event) {
            if (err) {
              return callback(err, null);
            }
            return callback(null, event);
          });
        }
      ], function (err, event) {
        if (err) {
          return res.send('{"error":{"message":"' + err.message + '"}}');
        }
        if (!event){
          return res.send('{"error":{"message":"not found"}}');
        }
        res.send('{"success":{"message":"' + event.hash + ' deleted"}}');
      });
      break;
    default:
      res.send('{"error":{"message":"unknown method"}}');
  }
});

router.get('/:adminmethod', function (req, res) {
  res.redirect('/admin');
});

module.exports = router;
