var Bluebird = require('bluebird');
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
  var departmentquery = [];
  String(req.query.department).split(',').forEach(function (department, index, arr) {
    if (arr.lastIndexOf(department) === index) {
      switch(department) {
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
  var condition;
  if (departmentquery.length === 0) {
    condition = null;
  } else {
    condition = {
      department: new RegExp(departmentquery.join('|'))
    };
  }
  Bluebird.resolve(mEvent.find(condition, '-_id -__v').exec()).then(function (events) {
    var calendar = vobject.calendar();
    calendar.setProperty(vobject.property('PRODID', '-//' + site.author + '//' + site.generator + '//EN'));
    events.forEach(function (event) {
      var startDate = new Date(event.eventDate);
      startDate.setHours(startDate.getHours() + 9);
      var endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      var vevent = vobject.event();
      vevent.setSummary(get(event).asCalSummary());
      vevent.setDescription(get(event).asCalDescription());
      vevent.setUID(event.hash);
      vevent.setDTStart(vobject.dateValue(startDate.toISOString().slice(0, 10)));
      vevent.setDTEnd(vobject.dateValue(endDate.toISOString().slice(0, 10)));
      calendar.pushComponent(vevent);
    });
    res.set('Content-Type', 'text/calendar');
    res.send(calendar.toICS());
  });
});

module.exports = router;
