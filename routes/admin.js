var Bluebird = require('bluebird');
var config = require('config');
var express = require('express');
var pwd = require('pwd');

var admin = config.get('admin');
var router = express.Router();
var site = config.get('site');

var privateAPI = require('../api').private;
var sendAPIResult = require('../lib/sendapiresult');

router.get('/', function (req, res) {
  if (req.session.loggedin) {
    res.render('admin', {
      site: site,
      page: {
        title: 'Admin - ' + site.name
      }
    });
  } else {
    res.redirect('/admin/login');
  }
});

router.get('/login', function (req, res) {
  if (req.session.loggedin) {
    res.redirect('/admin');
  } else {
    res.render('login', {
      site: site,
      page: {
        title: 'Login - ' + site.name
      }
    });
  }
});

router.post('/login', function (req, res) {
  var name = req.body.name;
  var pass = req.body.password;
  if (name === admin.name) {
    new Bluebird(function (resolve, reject) {
      pwd.hash(pass, admin.salt, function (err, hash) {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    }).then(function (hash) {
      if (hash !== admin.hash) {
        res.redirect('/admin/login');
      } else {
        req.session.loggedin = true;
        res.redirect('/admin');
      }
    });
  } else {
    res.redirect('/admin/login');
  }
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

router.get('/list.json', function (req, res) {
  if (req.session.loggedin) {
    sendAPIResult(privateAPI.list(), res);
  } else {
    res.status(400).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
});

router.post('/:adminmethod', function (req, res) {
  if (req.session.loggedin) {
    var hash = req.body.hash;
    switch (String(req.params.adminmethod)) {
    case 'add':
      var event = req.body;
      sendAPIResult(privateAPI.add(event), res);
      break;
    case 'edit':
      var key = req.body.key;
      var value = req.body.value;
      var data = {};
      data[key] = value;
      sendAPIResult(privateAPI.edit(hash, data), res);
      break;
    case 'delete':
      sendAPIResult(privateAPI.delete(hash), res);
      break;
    default:
      res.status(400).json({
        error: {
          message: 'Unknown method ' + String(req.params.adminmethod)
        }
      });
    }
  } else {
    res.status(400).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
});

router.get('/:adminmethod', function (req, res) {
  res.redirect('/admin');
});

module.exports = router;
