var BBPromise = require('bluebird');
var config = require('config');
var express = require('express');
var mongoose = require('mongoose');
var vobject = require('vobject');

var mEvent = mongoose.model('Event');
var router = express.Router();
var site = config.get('site');

var get = require('../lib/getasstring');

router.get('/', function (req, res) {
  res.render('calendar', {
    site: site,
    page: {
      title: 'Calendar - ' + site.name,
      description: '休講情報をiCalendar形式で配信しています。'
    }
  });
});

router.get('/kyukou.ics', function (req, res) {
  var departments = String(req.query.department).split(',').filter(function (val, index, arr) {
    return arr.lastIndexOf(val) === index;
  });
  var departmentquery = [];
  for (var i = 0; i < departments.length; i++) {
    switch(departments[i]) {
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
  var condition = {
    department: new RegExp(departmentquery.join('|'))
  };
  if (departmentquery.length === 0) {
    condition = null;
  }
  BBPromise.resolve(mEvent.find(condition, '-_id -__v').exec()).then(function (events) {
    var calendar = vobject.calendar();
    calendar.setProperty(vobject.property('PRODID', '-//' + site.author + '//' + site.generator + '//EN'));
    for (var i = 0; i < events.length; i++) {
      var startDate = new Date(events[i].eventDate);
      startDate.setHours(startDate.getHours() + 9);
      var endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      startDate = vobject.dateValue(startDate.toISOString().slice(0, 10));
      endDate = vobject.dateValue(endDate.toISOString().slice(0, 10));
      var event = vobject.event();
      event.setSummary(get(events[i]).asCalSummary());
      event.setDescription(get(events[i]).asCalDescription());
      event.setUID(events[i].hash);
      event.setDTStart(startDate);
      event.setDTEnd(endDate);
      calendar.pushComponent(event);
    }
    res.set('Content-Type', 'text/calendar');
    res.send(calendar.toICS());
  }).catch(function (err) {
    res.status(500).render('error', {
      message: '500 Internal Server Error',
      error: err
    });
  });
});

module.exports = router;
