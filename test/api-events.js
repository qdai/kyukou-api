'use strict';

/* eslint max-lines: 0 */

const arrayShuffle = require('array-shuffle');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

const db = require('./fixtures/db');

const ApiEvents = require('../lib/api/events');

const apiEvents = new ApiEvents();

const toPlainObject = event => event.toObject();
const getEventsList = async () => {
  const events = (await apiEvents.list()).map(toPlainObject);
  return events;
};

describe('Events API', () => {
  before(() => db.open());

  after(async () => {
    await db.clear();
    await db.close();
  });

  afterEach(() => db.clearEvent());

  describe('.list', () => {
    it('expected to be fulfilled with all scheduled events which are sorted by eventDate', async () => {
      const data = require('./fixtures/events/eventdate');
      await db.insertEvent(arrayShuffle(data));
      const events = (await apiEvents.list()).map(toPlainObject);
      expect(events).to.deep.equal(data);
    });

    it('expected to be fulfilled with all scheduled events which are sorted by period', async () => {
      const data = require('./fixtures/events/period');
      await db.insertEvent(arrayShuffle(data));
      const events = (await apiEvents.list()).map(toPlainObject);
      expect(events).to.deep.equal(data);
    });

    it('expected to be fulfilled with specified department\'s events', async () => {
      const data = require('./fixtures/events/department');
      const departments = [
        'edu',
        'lit',
        'law'
      ];
      const departmentsJa = [
        '教育学部',
        '文学部',
        '法学部'
      ];
      await db.insertEvent(data);
      const events = (await apiEvents.list(departments))
        .map(toPlainObject)
        .sort((a, b) => {
          const diff = a.department > b.department;
          return diff ? 1 : -1;
        });
      expect(events).to.deep.equal(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with specified department\'s events', async () => {
      const data = require('./fixtures/events/department');
      const departments = [
        'sci',
        'edu',
        'edu'
      ];
      const departmentsJa = ['理学部', '教育学部'];
      await db.insertEvent(data);
      const events = (await apiEvents.list(departments.join(',')))
        .map(toPlainObject)
        .sort((a, b) => {
          const diff = a.department > b.department;
          return diff ? 1 : -1;
        });
      expect(events).to.deep.equal(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with events which are start with startIndex', async () => {
      const data = require('./fixtures/events/eventdate');
      const startIndex = 2;
      await db.insertEvent(data);
      const events = (await apiEvents.list(null, startIndex)).map(toPlainObject);
      expect(events).to.deep.equal(data.slice(startIndex));
    });

    it('expected to be fulfilled with specified count events', async () => {
      const data = require('./fixtures/events/eventdate');
      const count = 2;
      await db.insertEvent(data);
      const events = (await apiEvents.list(null, null, count)).map(toPlainObject);
      expect(events).to.deep.equal(data.slice(0, count));
    });
  });

  describe('.yyyymmdd', () => {
    it('expected to be fulfilled with specified days events which are sorted by period', async () => {
      const data = require('./fixtures/events/eventdate');
      const [{ eventDate }] = data;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      await db.insertEvent(data);
      const events = (await apiEvents.yyyymmdd(yyyy, mm, dd)).map(toPlainObject);
      expect(events).to.deep.equal(data.filter(d => d.eventDate.getFullYear() === yyyy
        && d.eventDate.getMonth() + 1 === mm
        && d.eventDate.getDate() === dd));
    });

    it('expected to be rejected when the day is invalid', () => {
      const promise = apiEvents.yyyymmdd('yyyy', 'mm', 'dd');
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be fulfilled with specified count events', async () => {
      const data = require('./fixtures/events/eventdate');
      const [{ eventDate }] = data;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      const count = 2;
      await db.insertEvent(data);
      const events = (await apiEvents.yyyymmdd(yyyy, mm, dd, count)).map(toPlainObject);
      expect(events).to.deep.equal(data.filter(d => d.eventDate.getFullYear() === yyyy
        && d.eventDate.getMonth() + 1 === mm
        && d.eventDate.getDate() === dd).slice(0, count));
    });
  });

  describe('.search', () => {
    it('expected to be rejected when query is not specified', () => {
      const promise = apiEvents.search();
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be rejected when query is too long', () => {
      const promise = apiEvents.search('long string'.repeat(12));
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be fulfilled with matched events', async () => {
      const data = require('./fixtures/events/department');
      const q = '教育学部';
      await db.insertEvent(data);
      const events = (await apiEvents.search(q)).map(toPlainObject);
      expect(events).to.deep.equal(data.filter(d => d.department === q));
    });

    it('expected to be fulfilled with specified count events', async () => {
      const data = require('./fixtures/events/period');
      const q = 'test';
      const count = 2;
      await db.insertEvent(arrayShuffle(data));
      const events = (await apiEvents.search(q, count)).map(toPlainObject);
      expect(events).to.deep.equal(data.slice(0, count));
    });
  });

  describe('.add', () => {
    const data = require('./fixtures/events/index');
    const invalidDateData = require('./fixtures/events/invalid-date');

    it('expected to add new event', async () => {
      await apiEvents.add(data);
      expect(await getEventsList()).to.deep.equal([data]);
    });

    it('expected to be rejected when the event already exist', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.add(data);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when the event already exist', async () => {
      await db.insertEvent(data);
      await apiEvents.add(data).catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });

    it('expected to be rejected when eventDate is invalid', () => {
      const promise = apiEvents.add(invalidDateData);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to add event when eventDate is invalid', async () => {
      await apiEvents.add(invalidDateData).catch(e => e);
      expect(await getEventsList()).to.deep.equal([]);
    });
  });

  describe('.edit', () => {
    const data = require('./fixtures/events/index');
    const editData = require('./fixtures/events/edit-data');
    const modifiedData = require('./fixtures/events/edit-modified');
    modifiedData.eventDate = editData.eventDate;
    modifiedData.pubDate = data.pubDate;

    it('expected to modify specified event', async () => {
      await db.insertEvent(data);
      await apiEvents.edit(data.hash, editData);
      expect(await getEventsList()).to.deep.equal([modifiedData]);
    });

    it('expected to be rejected when hash is invalid', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.edit('invalid hash', editData);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when hash is invalid', async () => {
      await db.insertEvent(data);
      await apiEvents.edit('invalid hash', editData).catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });

    it('expected to be rejected when key is invalid', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.edit(data.hash, { invalidKey: 'value' });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when key is invalid', async () => {
      await db.insertEvent(data);
      await apiEvents.edit(data.hash, { invalidKey: 'value' }).catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });

    it('expected to be rejected when hash doesn\'t found', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.edit(data.hash.replace(/1/g, 'a'), editData);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when hash doesn\'t found', async () => {
      await db.insertEvent(data);
      await apiEvents.edit(data.hash.replace(/1/g, 'a'), editData).catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });
  });

  describe('.delete', () => {
    const data = require('./fixtures/events/index');

    it('expected to delete specified event', async () => {
      await db.insertEvent(data);
      await apiEvents.delete(data.hash);
      expect(await getEventsList()).to.deep.equal([]);
    });

    it('expected to be rejected when hash is invalid', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.delete('invalid hash');
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to delete event when hash is invalid', async () => {
      await db.insertEvent(data);
      await apiEvents.delete('invalid hash').catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });

    it('expected to be rejected when hash doesn\'t found', async () => {
      await db.insertEvent(data);
      const promise = apiEvents.delete(data.hash.replace(/1/g, 'a'));
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to delete event when hash doesn\'t found', async () => {
      await db.insertEvent(data);
      await apiEvents.delete(data.hash.replace(/1/g, 'a')).catch(e => e);
      expect(await getEventsList()).to.deep.equal([data]);
    });
  });
});
