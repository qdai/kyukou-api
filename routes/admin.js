'use strict';

const config = require('config');
const createHttpError = require('http-errors');
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

router.get('/events/list.json', function (req, res) {
  if (req.session.loggedin) {
    sendAPIResult(privateAPI.events.list(), res);
  } else {
    throw createHttpError(403);
  }
});

router.post('/events/add', function (req, res) {
  if (req.session.loggedin) {
    const event = req.body;
    sendAPIResult(privateAPI.events.add(event), res);
  } else {
    throw createHttpError(403);
  }
});

router.post('/events/edit', function (req, res) {
  if (req.session.loggedin) {
    const hash = req.body.hash;
    const key = req.body.key;
    const value = req.body.value;
    const data = {};
    data[key] = value;
    sendAPIResult(privateAPI.events.edit(hash, data), res);
  } else {
    throw createHttpError(403);
  }
});

router.post('/events/delete', function (req, res) {
  if (req.session.loggedin) {
    const hash = req.body.hash;
    sendAPIResult(privateAPI.events.delete(hash), res);
  } else {
    throw createHttpError(403);
  }
});

router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });
});

router.get('/events', function () {
  throw createHttpError(400);
});

router.get('/events/:method', function (req) {
  if (['add', 'edit', 'delete'].indexOf(req.params.method) !== -1) {
    throw createHttpError(405);
  } else {
    throw createHttpError(400);
  }
});

module.exports = router;
