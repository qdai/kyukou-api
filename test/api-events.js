'use strict';

const arrayShuffle = require('array-shuffle');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const db = require('./fixtures/db');

const ApiEvents = require('../lib/api/events');

const apiEvents = new ApiEvents();

const toPlainObject = event => event.toObject();
const toPlainObjects = events => events.map(toPlainObject);
const getEventsList = () => apiEvents.values().then(toPlainObjects);

describe('Events API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  afterEach(() => db.clearEvent());

  describe('.values', () => {
    it('is expected to be fulfilled with all scheduled events which are sorted by eventDate', () => {
      const data = require('./fixtures/events/eventdate');
      const promise = db.insertEvent(arrayShuffle(data)).then(() => {
        return apiEvents.values().then(toPlainObjects);
      });
      return expect(promise).to.become(data);
    });

    it('is expected to be fulfilled with all scheduled events which are sorted by period', () => {
      const data = require('./fixtures/events/period');
      const promise = db.insertEvent(arrayShuffle(data)).then(() => {
        return apiEvents.values().then(toPlainObjects);
      });
      return expect(promise).to.become(data);
    });

    describe('(departments)', () => {
      it('is expected to be fulfilled with specified department\'s events', () => {
        const data = require('./fixtures/events/department');
        const departments = ['edu', 'lit', 'law'];
        const departmentsJa = ['教育学部', '文学部', '法学部'];
        const promise = db.insertEvent(data).then(() => {
          return apiEvents.values({ departments }).then(toPlainObjects);
        }).then(events => events.sort((a, b) => {
          return a.department > b.department ? 1 : -1;
        }));
        return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
      });

      it('is expected to be fulfilled with specified department\'s events', () => {
        const data = require('./fixtures/events/department');
        const departments = ['sci', 'econ', 'econ'];
        const departmentsJa = ['理学部', '経済学部'];
        const promise = db.insertEvent(data).then(() => {
          return apiEvents.values({
            departments: departments.join(',')
          }).then(toPlainObjects);
        }).then(events => events.sort((a, b) => {
          return a.department > b.department ? 1 : -1;
        }));
        return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
      });

      it('is expected to be rejected when departments is invalid', () => {
        const data = require('./fixtures/events/department');
        const departments = ['invalid', 'department'];
        const promise = db.insertEvent(data).then(() => {
          return apiEvents.values({ departments });
        });
        return expect(promise).to.be.rejectedWith(Error);
      });
    });

    describe('(date)', () => {
      it('is expected to be fulfilled with specified days events which are sorted by period', () => {
        const data = require('./fixtures/events/eventdate');
        const date = data[0].eventDate;
        const promise = db.insertEvent(data).then(() => {
          return apiEvents.values({ date }).then(toPlainObjects);
        });
        return expect(promise).to.become(data.filter(d => {
          return d.eventDate.toISOString() === date.toISOString();
        }));
      });

      it('is expected to be rejected when the day is invalid', () => {
        const promise = apiEvents.values({
          date: 'yyyy-mm-dd'
        }).then(toPlainObjects);
        return expect(promise).to.be.rejectedWith(Error);
      });
    });

    describe('(q)', () => {
      it('is expected to be rejected when query is too long', () => {
        const promise = apiEvents.values({
          q: 'long string'.repeat(12)
        }).then(toPlainObjects);
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('is expected to be fulfilled with matched events', () => {
        const data = require('./fixtures/events/department');
        const q = '教育学部';
        const promise = db.insertEvent(data).then(() => {
          return apiEvents.values({ q }).then(toPlainObjects);
        });
        return expect(promise).to.become(data.filter(d => d.department === q));
      });
    });

    it('is expected to be fulfilled with events which are start with start index', () => {
      const data = require('./fixtures/events/eventdate');
      const start = 2;
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.values({
          start
        }).then(toPlainObjects);
      });
      return expect(promise).to.become(data.slice(start));
    });

    it('is expected to be fulfilled with specified count events', () => {
      const data = require('./fixtures/events/eventdate');
      const count = 2;
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.values({
          count
        }).then(toPlainObjects);
      });
      return expect(promise).to.become(data.slice(0, count));
    });
  });

  describe('.add', () => {
    const data = require('./fixtures/events/index');
    const invalidDateData = require('./fixtures/events/invalid-date');

    it('is expected to add new event', () => {
      const promise = apiEvents.add(data);
      return Promise.all([
        expect(promise.then(toPlainObject)).to.become(data),
        expect(promise.then(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when the event already exist', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.add(data);
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when eventDate is invalid', () => {
      const promise = apiEvents.add(invalidDateData);
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([])
      ]);
    });
  });

  describe('.get', () => {
    const data = require('./fixtures/events/index');

    it('is expected to be resolved with specified event', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.get(data.hash);
      });
      return Promise.all([
        expect(promise.then(toPlainObject)).to.become(data),
        expect(promise.then(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.get('invalid hash');
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.get(data.hash.replace(/1/g, 'a'));
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });
  });

  describe('.update', () => {
    const data = require('./fixtures/events/index');
    const editData = require('./fixtures/events/edit-data');
    const modifiedData = require('./fixtures/events/edit-modified');
    modifiedData.eventDate = editData.eventDate;
    modifiedData.pubDate = data.pubDate;

    it('is expected to modify specified event', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.update(data.hash, editData);
      });
      return Promise.all([
        expect(promise.then(toPlainObject)).to.become(modifiedData),
        expect(promise.then(getEventsList)).to.become([modifiedData])
      ]);
    });

    it('is expected to be rejected when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.update('invalid hash', editData);
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when key is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.update(data.hash, {
          invalidKey: 'value'
        });
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.update(data.hash.replace(/1/g, 'a'), editData);
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });
  });

  describe('.delete', () => {
    const data = require('./fixtures/events/index');

    it('is expected to delete specified event', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete(data.hash);
      });
      return Promise.all([
        expect(promise).to.become(null),
        expect(promise.then(getEventsList)).to.become([])
      ]);
    });

    it('is expected to be rejected when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete('invalid hash');
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });

    it('is expected to be rejected when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete(data.hash.replace(/1/g, 'a'));
      });
      return Promise.all([
        expect(promise).to.be.rejectedWith(Error),
        expect(promise.catch(getEventsList)).to.become([data])
      ]);
    });
  });
});
