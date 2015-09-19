/* global describe, it, before, after, afterEach */

'use strict';

const arrayShuffle = require('array-shuffle');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const db = require('./fixtures/db');

const publicAPI = require('../lib/api/public');

describe('Public API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  describe('.events', () => {
    afterEach(() => db.clearEvent());

    describe('.list', () => {
      it('expected to be fulfilled with all scheduled events which are sorted by eventDate', () => {
        const data = require('./fixtures/events/eventdate');
        const promise = db.insertEvent(arrayShuffle(data)).then(() => {
          return publicAPI.events.list();
        });
        return expect(promise).to.become(data);
      });

      it('expected to be fulfilled with all scheduled events which are sorted by period', () => {
        const data = require('./fixtures/events/period');
        const promise = db.insertEvent(arrayShuffle(data)).then(() => {
          return publicAPI.events.list();
        });
        return expect(promise).to.become(data);
      });

      it('expected to be fulfilled with specified department\'s events', () => {
        const data = require('./fixtures/events/department');
        const departments = ['edu', 'lit', 'law'];
        const departmentsJa = ['教育学部', '文学部', '法学部'];
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.list(departments);
        }).then(events => events.sort((a, b) => a.department > b.department ? 1 : -1));
        return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
      });

      it('expected to be fulfilled with specified department\'s events', () => {
        const data = require('./fixtures/events/department');
        const departments = ['sci', 'econ', 'econ'];
        const departmentsJa = ['理学部', '経済学部'];
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.list(departments.join(','));
        }).then(events => events.sort((a, b) => a.department > b.department ? 1 : -1));
        return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
      });

      it('expected to be fulfilled with events which are start with startIndex', () => {
        const data = require('./fixtures/events/eventdate');
        const startIndex = 2;
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.list(null, startIndex);
        });
        return expect(promise).to.become(data.slice(startIndex));
      });

      it('expected to be fulfilled with specified count events', () => {
        const data = require('./fixtures/events/eventdate');
        const count = 2;
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.list(null, null, count);
        });
        return expect(promise).to.become(data.slice(0, count));
      });
    });

    describe('.yyyymmdd', () => {
      it('expected to be fulfilled with specified days events which are sorted by period', () => {
        const data = require('./fixtures/events/eventdate');
        const eventDate = data[0].eventDate;
        const yyyy = eventDate.getFullYear();
        const mm = eventDate.getMonth() + 1;
        const dd = eventDate.getDate();
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.yyyymmdd(yyyy, mm, dd);
        });
        return expect(promise).to.become(data.filter(d => {
          return d.eventDate.getFullYear() === yyyy
            && d.eventDate.getMonth() + 1 === mm
            && d.eventDate.getDate() === dd;
        }));
      });

      it('expected to be rejected when the day is invalid', () => {
        const promise = publicAPI.events.yyyymmdd('yyyy', 'mm', 'dd');
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected to be fulfilled with specified count events', () => {
        const data = require('./fixtures/events/eventdate');
        const eventDate = data[0].eventDate;
        const yyyy = eventDate.getFullYear();
        const mm = eventDate.getMonth() + 1;
        const dd = eventDate.getDate();
        const count = 2;
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.yyyymmdd(yyyy, mm, dd, count);
        });
        return expect(promise).to.become(data.filter(d => {
          return d.eventDate.getFullYear() === yyyy
            && d.eventDate.getMonth() + 1 === mm
            && d.eventDate.getDate() === dd;
        }).slice(0, count));
      });
    });

    describe('.search', () => {
      it('expected to be rejected when query is not specified', () => {
        const promise = publicAPI.events.search();
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected to be rejected when query is too long', () => {
        const promise = publicAPI.events.search('long string'.repeat(12));
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected to be fulfilled with matched events', () => {
        const data = require('./fixtures/events/department');
        const q = '教育学部';
        const promise = db.insertEvent(data).then(() => {
          return publicAPI.events.search(q);
        });
        return expect(promise).to.become(data.filter(d => d.department === q));
      });

      it('expected to be fulfilled with specified count events', () => {
        const data = require('./fixtures/events/period');
        const q = 'test';
        const count = 2;
        const promise = db.insertEvent(arrayShuffle(data)).then(() => {
          return publicAPI.events.search(q, count);
        });
        return expect(promise).to.become(data.slice(0, count));
      });
    });
  });

  describe('.logs', () => {
    describe('.about', () => {
      it('expected to be rejected when arg is invalid', () => {
        const about = 'invalid';
        const promise = publicAPI.logs.about(about);
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected to be fulfilled with specified tasklog', () => {
        const aboutList = ['task', 'twit_new', 'twit_tomorrow', 'delete'];
        const promise = Promise.all(aboutList.map(about => publicAPI.logs.about(about).then(tasklog => tasklog.name)));
        return expect(promise).to.become(aboutList);
      });
    });
  });
});
