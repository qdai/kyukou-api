var express = require('express');
var router = express.Router();
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
    site: site,
    page: {
      title: 'Admin - ' + site.name
    }
  });
});

router.get('/login', function (req, res) {
  if (req.session.loggedin) {
    return res.redirect('/admin');
  }
  res.render('login', {
    site: site,
    page: {
      title: 'Login - ' + site.name
    }
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
      return res.status(500).render('error', {
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
  if (!req.session.loggedin) {
    return res.status(400).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
  Event.find(null, '-__v', {
    sort: {
      eventDate: 1,
      period: 1
    }
  }, function (err, events) {
    if (err) {
      return res.status(500).json({
        error: {
          message: err.message
        }
      });
    }
    res.json(events);
  });
})

router.post('/:adminmethod', function (req, res) {
  if (!req.session.loggedin) {
    return res.status(400).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
  switch (String(req.params.adminmethod)) {
    case 'add':
      var data = req.body;
      data.eventDate = new Date(data.eventDate);
      if (data.pubDate) {
        data.pubDate = new Date(data.pubDate);
      }
      data.hash = require('crypto').createHash('sha256').update(data.raw.replace(/\s/g, '')).digest('hex');
      Event.findOrCreate({
        hash: data.hash
      }, data, function (err, event, created) {
        if (err) {
          return res.status(500).json({
            error: {
              message: err.message
            }
          })
        }
        if (created) {
          res.json({
            success: {
              message: event.hash + ' created'
            }
          })
        } else {
          res.status(400).json({
            error: {
              message: event.hash + ' already exist'
            }
          });
        }
      });
      break;
    case 'edit':
      var hash = req.body.hash;
      if (!/^[a-f0-9]{64}$/.test(hash)) {
        return res.status(400).json({
          error: {
            message: 'Invalid hash ' + hash
          }
        });
      }
      var key = req.body.key;
      if (['about', 'link', 'eventDate', 'period', 'department', 'subject', 'teacher', 'campus', 'room', 'note', 'raw', 'tweet.new', 'tweet.tomorrow'].indexOf(key) === -1) {
        return res.status(400).json({
          error: {
            message: 'Invalid key ' + key
          }
        });
      }
      var value = req.body.value;
      if (key === 'eventDate') {
        value = new Date(value);
      }
      var data = {};
      data[key] = value;
      Event.findOneAndUpdate({
        hash: hash
      }, {
        $set: data
      }, function (err, event) {
        if (err) {
          return res.status(500).json({
            error: {
              message: err.message
            }
          });
        }
        if (!event) {
          return res.status(400).json({
            error: {
              message: hash + ' not found'
            }
          });
        }
        res.json({
          success: {
            message: event.hash + ' updated'
          }
        });
      });
      break;
    case 'delete':
      var hash = req.body.hash;
      if (!/^[a-f0-9]{64}$/.test(hash)) {
        return res.status(400).json({
          error: {
            message: 'Invalid hash ' + hash
          }
        });
      }
      Event.findOneAndRemove({
        hash: hash
      }, function (err, event) {
        if (err) {
          return res.status(500).json({
            error: {
              message: err.message
            }
          });
        }
        if (!event) {
          return res.status(400).json({
            error: {
              message: hash + ' not found'
            }
          });
        }
        res.json({
          success: {
            message: event.hash + ' deleted'
          }
        });
      });
      break;
    default:
      return res.status(400).json({
        error: {
          message: 'Unknown method ' + String(req.params.adminmethod)
        }
      });
  }
});

router.get('/:adminmethod', function (req, res) {
  res.redirect('/admin');
});

module.exports = router;
