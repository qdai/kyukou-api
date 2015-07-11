'use strict';

const config = require('config');
const express = require('express');
const pwd = require('pwd');

const admin = config.get('admin');
const router = express.Router(); // eslint-disable-line new-cap
const site = config.get('site');

const privateAPI = require('../api').private;
const sendAPIResult = require('../lib/sendapiresult');

router.get('/', function (req, res) {
  if (req.session.loggedin) {
    res.render('admin', {
      site,
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
      site,
      page: {
        title: 'Login - ' + site.name
      }
    });
  }
});

router.post('/login', function (req, res) {
  const name = req.body.name;
  const pass = req.body.password;
  if (name === admin.name) {
    new Promise(function (resolve, reject) {
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
    res.status(403).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
});

router.post('/:adminmethod', function (req, res) {
  if (req.session.loggedin) {
    const hash = req.body.hash;
    switch (String(req.params.adminmethod)) {
    case 'add':
      var event = req.body; // eslint-disable-line no-var
      sendAPIResult(privateAPI.add(event), res);
      break;
    case 'edit':
      var key = req.body.key; // eslint-disable-line no-var
      var value = req.body.value; // eslint-disable-line no-var
      var data = {}; // eslint-disable-line no-var
      data[key] = value;
      sendAPIResult(privateAPI.edit(hash, data), res);
      break;
    case 'delete':
      sendAPIResult(privateAPI.delete(hash), res);
      break;
    default:
      res.status(404).json({
        error: {
          message: 'Unknown method ' + String(req.params.adminmethod)
        }
      });
    }
  } else {
    res.status(403).json({
      error: {
        message: 'Authentication required'
      }
    });
  }
});

router.get('/:adminmethod', function (req, res) {
  res.status(405).json({
    error: {
      message: 'Method Not Allowed'
    }
  });
});

module.exports = router;
