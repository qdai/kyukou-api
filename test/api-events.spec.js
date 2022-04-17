'use strict';

const { sortBy } = require('lodash');

const db = require('./fixtures/db');

const ApiEvents = require('../lib/api/events');

const apiEvents = new ApiEvents();

const toPlainObject = event => event.toObject();
const getEventsList = async () => {
  const events = (await apiEvents.list()).map(toPlainObject);
  return events;
};
const pickByEventDate = (yyyy, mm, dd) => ({ eventDate }) => eventDate.getFullYear() === yyyy
  && eventDate.getMonth() + 1 === mm
  && eventDate.getDate() === dd;

describe('events API', () => {
  beforeAll(() => db.open());

  afterAll(async () => {
    await db.clear();
    await db.close();
  });

  afterEach(() => db.clearEvent());

  describe('.list', () => {
    it('expected to be fulfilled with all scheduled events which are sorted by eventDate', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/eventdate');
      await db.insertEvent(data);
      const events = (await apiEvents.list()).map(toPlainObject);
      expect(events).toStrictEqual(sortBy(data, 'eventDate'));
    });

    it('expected to be fulfilled with all scheduled events which are sorted by period', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/period');
      await db.insertEvent(data);
      const events = (await apiEvents.list()).map(toPlainObject);
      expect(events).toStrictEqual(sortBy(data, 'period'));
    });

    it('expected to be fulfilled with specified department\'s events 1', async () => {
      expect.assertions(1);
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
      const events = sortBy((await apiEvents.list(departments)).map(toPlainObject), 'department');
      expect(events).toStrictEqual(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with specified department\'s events 2', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/department');
      const departments = [
        'sci',
        'edu',
        'edu'
      ];
      const departmentsJa = ['理学部', '教育学部'];
      await db.insertEvent(data);
      const events = sortBy((await apiEvents.list(departments)).map(toPlainObject), 'department');
      expect(events).toStrictEqual(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with events which are start with startIndex', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/eventdate');
      const startIndex = 2;
      await db.insertEvent(data);
      // @ts-expect-error
      const events = (await apiEvents.list(null, startIndex)).map(toPlainObject);
      expect(events).toStrictEqual(sortBy(data, 'eventDate').slice(startIndex));
    });

    it('expected to be fulfilled with specified count events', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/eventdate');
      const count = 2;
      await db.insertEvent(data);
      // @ts-expect-error
      const events = (await apiEvents.list(null, null, count)).map(toPlainObject);
      expect(events).toStrictEqual(sortBy(data, 'eventDate').slice(0, count));
    });
  });

  describe('.yyyymmdd', () => {
    it('expected to be fulfilled with specified days events which are sorted by period', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/eventdate');
      const [{ eventDate }] = data;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      await db.insertEvent(data);
      const events = (await apiEvents.yyyymmdd(yyyy, mm, dd)).map(toPlainObject);
      expect(events).toStrictEqual(data.filter(pickByEventDate(yyyy, mm, dd)));
    });

    it('expected to be rejected when the day is invalid', async () => {
      expect.assertions(1);
      // @ts-expect-error
      const promise = apiEvents.yyyymmdd('yyyy', 'mm', 'dd');
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected to be fulfilled with specified count events', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/eventdate');
      const [{ eventDate }] = data;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      const count = 2;
      await db.insertEvent(data);
      const events = (await apiEvents.yyyymmdd(yyyy, mm, dd, count)).map(toPlainObject);
      expect(events).toStrictEqual(data.filter(pickByEventDate(yyyy, mm, dd)).slice(0, count));
    });
  });

  describe('.search', () => {
    it('expected to be rejected when query is not specified', async () => {
      expect.assertions(1);
      // @ts-expect-error
      const promise = apiEvents.search();
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected to be rejected when query is too long', async () => {
      expect.assertions(1);
      const promise = apiEvents.search('long string'.repeat(12));
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected to be fulfilled with matched events', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/department');
      const q = '教育学部';
      await db.insertEvent(data);
      const events = (await apiEvents.search(q)).map(toPlainObject);
      expect(events).toStrictEqual(data.filter(d => d.department === q));
    });

    it('expected to be fulfilled with specified count events', async () => {
      expect.assertions(1);
      const data = require('./fixtures/events/period');
      const q = 'test';
      const count = 2;
      await db.insertEvent(data);
      const events = (await apiEvents.search(q, count)).map(toPlainObject);
      expect(events).toStrictEqual(sortBy(data, 'period').slice(0, count));
    });
  });

  describe('.add', () => {
    const data = require('./fixtures/events/index');
    const invalidDateData = require('./fixtures/events/invalid-date');

    it('expected to add new event', async () => {
      expect.assertions(1);
      await apiEvents.add(data);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });

    it('expected to be rejected when the event already exist', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.add(data);
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to modify event when the event already exist', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.add(data).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });

    it('expected to be rejected when eventDate is invalid', async () => {
      expect.assertions(1);
      const promise = apiEvents.add(invalidDateData);
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to add event when eventDate is invalid', async () => {
      expect.assertions(1);
      await apiEvents.add(invalidDateData).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([]);
    });
  });

  describe('.edit', () => {
    const data = require('./fixtures/events/index');
    const editData = require('./fixtures/events/edit-data');
    const modifiedData = require('./fixtures/events/edit-modified');
    modifiedData.eventDate = editData.eventDate;
    modifiedData.pubDate = data.pubDate;

    it('expected to modify specified event', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.edit(data.hash, editData);
      await expect(getEventsList()).resolves.toStrictEqual([modifiedData]);
    });

    it('expected to be rejected when hash is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.edit('invalid hash', editData);
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to modify event when hash is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.edit('invalid hash', editData).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });

    it('expected to be rejected when key is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.edit(data.hash, { invalidKey: 'value' });
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to modify event when key is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.edit(data.hash, { invalidKey: 'value' }).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });

    it('expected to be rejected when hash doesn\'t found', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.edit(data.hash.replace(/1/gu, 'a'), editData);
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to modify event when hash doesn\'t found', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.edit(data.hash.replace(/1/gu, 'a'), editData).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });
  });

  describe('.delete', () => {
    const data = require('./fixtures/events/index');

    it('expected to delete specified event', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.delete(data.hash);
      await expect(getEventsList()).resolves.toStrictEqual([]);
    });

    it('expected to be rejected when hash is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.delete('invalid hash');
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to delete event when hash is invalid', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.delete('invalid hash').catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });

    it('expected to be rejected when hash doesn\'t found', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      const promise = apiEvents.delete(data.hash.replace(/1/gu, 'a'));
      await expect(promise).rejects.toThrow(Error);
    });

    it('expected not to delete event when hash doesn\'t found', async () => {
      expect.assertions(1);
      await db.insertEvent(data);
      await apiEvents.delete(data.hash.replace(/1/gu, 'a')).catch(e => e);
      await expect(getEventsList()).resolves.toStrictEqual([data]);
    });
  });
});
