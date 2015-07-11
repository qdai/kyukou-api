'use strict';

const config = require('config');
const express = require('express');
const jsonfile = require('jsonfile');
const path = require('path');

const router = express.Router(); // eslint-disable-line new-cap

const publicAPI = require('../api').public;
const sendAPIResult = require('../lib/sendapiresult');
const doc = jsonfile.readFileSync(path.join(__dirname, '../api/doc.json'));

router.get('/events', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/events/list.json', function (req, res) {
  const departments = req.query.departments;
  const startIndex = req.query.start_index;
  const count = req.query.count;
  sendAPIResult(publicAPI.events.list(departments, startIndex, count), res);
});

router.get('/events/:yyyy-:mm-:dd.json', function (req, res) {
  const yyyy = req.params.yyyy;
  const mm = req.params.mm;
  const dd = req.params.dd;
  const count = req.query.count;
  sendAPIResult(publicAPI.events.yyyymmdd(yyyy, mm, dd, count), res);
});

router.get('/events/search.json', function (req, res) {
  const q = req.query.q;
  const count = req.query.count;
  sendAPIResult(publicAPI.events.search(q, count), res);
});

router.get('/logs', function (req, res) {
  res.status(400).type('text/plain').send('Bad Request');
});

router.get('/logs/:about.json', function (req, res) {
  const about = req.params.about;
  sendAPIResult(publicAPI.logs.about(about), res);
});

router.get('/', function (req, res) {
  res.render('api', {
    site: config.get('site'),
    page: {
      title: doc.project.title,
      description: doc.project.description,
      keywords: '九州大学休講情報 API,九州大学,九大,休講情報,休講,API'
    },
    doc
  });
});

module.exports = router;
