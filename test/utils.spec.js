'use strict';

const mongoose = require('mongoose');

const Event = require('../lib/models/event');
const Hash = require('../lib/utils/hash');
const Log = require('../lib/models/log');
const db = require('../lib/utils/db');
const asString = require('../lib/utils/eventasstring');
const runTask = require('../lib/utils/runtask');
const logNames = require('../lib/utils/lognames');

const config = require('./fixtures/config');
const testDb = require('./fixtures/db');

describe('utils', () => {
  describe('/db', () => {
    describe('.open', () => {
      afterEach(() => db.close());

      it('expected to open database connection', async () => {
        expect.assertions(2);
        expect(mongoose.connection.readyState).toBe(0);
        await db.open(config.mongoURI);
        expect(mongoose.connection.readyState).toBe(1);
      });
    });

    describe('.close', () => {
      beforeEach(() => db.open(config.mongoURI));

      it('expected to close database connection', async () => {
        expect.assertions(2);
        expect(mongoose.connection.readyState).toBe(1);
        await db.close();
        expect(mongoose.connection.readyState).toBe(0);
      });
    });
  });

  describe('/eventasstring', () => {
    it('expected to return event as string 1', () => {
      const event = {
        about: 'about',
        campus: 'campus',
        department: 'department',
        eventDate: new Date('2015-01-01'),
        note: 'note',
        period: 'period',
        room: 'room',
        subject: 'subject',
        teacher: 'teacher'
      };
      const eventAsString = asString.bind(event);
      expect(eventAsString('title')).toBe('【about】period時限「subject（campus）」（教員：teacher）');
      expect(eventAsString('summary')).toBe('【about】1月1日（木）period時限department「subject（campus）」（教員：teacher）');
      expect(eventAsString('note')).toBe('教室：room\n備考：note');
      expect(eventAsString()).toBe('【about】1月1日（木）\ndepartmentperiod時限「subject（campus）」（教員：teacher）\n教室：room\n備考：note');
    });

    it('expected to return event as string 2', () => {
      const event = {
        about: 'about',
        department: 'department',
        eventDate: new Date('2015-01-01'),
        period: 'period',
        subject: 'subject'
      };
      const eventAsString = asString.bind(event);
      expect(eventAsString('title')).toBe('【about】period時限「subject」');
      expect(eventAsString('summary')).toBe('【about】1月1日（木）period時限department「subject」');
      expect(eventAsString('note')).toBe('');
      expect(eventAsString()).toBe('【about】1月1日（木）\ndepartmentperiod時限「subject」');
    });

    it('expected to return event as string', () => {
      const event = {
        about: 'about',
        campus: 'campus',
        department: 'department',
        eventDate: new Date('2015-01-01'),
        note: 'note',
        period: 'period',
        room: 'room',
        subject: 'subject',
        teacher: 'teacher'
      };
      const eventAsString = asString.bind(event);
      expect(eventAsString('title')).toBe('【about】period時限「subject（campus）」（教員：teacher）');
      expect(eventAsString('summary')).toBe('【about】1月1日（木）period時限department「subject（campus）」（教員：teacher）');
      expect(eventAsString('note', '<br />')).toBe('教室：room<br />備考：note');
      expect(eventAsString(null, '<br />')).toBe('【about】1月1日（木）<br />departmentperiod時限「subject（campus）」（教員：teacher）<br />教室：room<br />備考：note');
    });
  });

  describe('/findorcreate', () => {
    beforeAll(() => testDb.open());

    afterEach(() => testDb.clearEvent());

    afterAll(async () => {
      await testDb.clear();
      await testDb.close();
    });

    it('expected to create new one when the event not found', async () => {
      expect.assertions(2);
      const data = require('./fixtures/events/index');
      const [, created] = await Event.findOrCreate({ hash: data.hash }, data);
      expect(created).toBe(true);
      const condition = { hash: data.hash };
      const events = await Event.find(condition, '-_id -__v').lean().exec();
      expect(events).toStrictEqual([data]);
    });

    it('expected to return a event when the event already exist', async () => {
      expect.assertions(2);
      const data = require('./fixtures/events/index');
      await testDb.insertEvent(data);
      const condition = { hash: data.hash };
      const [event, created] = await Event.findOrCreate(condition, data);
      delete event.__v; // eslint-disable-line no-underscore-dangle
      delete event._id; // eslint-disable-line no-underscore-dangle
      expect(event).toStrictEqual(data);
      expect(created).toBe(false);
    });
  });

  describe('/hash', () => {
    describe('.create', () => {
      const data = [
        ['a', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'],
        ['b', '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'],
        ['string with space', 'caf7d0a818dbf6ade655de82886db446de7bba23d5e221ae8115e6d71bf5b572'],
        ['stringwithspace', 'caf7d0a818dbf6ade655de82886db446de7bba23d5e221ae8115e6d71bf5b572'],
        [' string with leading space', '1dbd5a9fcbdbba0d31bd3fb81a00cdabf02eef133b5c25785112c48eed0df878'],
        ['stringwithleadingspace', '1dbd5a9fcbdbba0d31bd3fb81a00cdabf02eef133b5c25785112c48eed0df878'],
        ['string with trailing space ', '346ad6828f4189545d62dbc037c97c2e2089d44225a8491f6fa0856e385a38e4'],
        ['stringwithtrailingspace', '346ad6828f4189545d62dbc037c97c2e2089d44225a8491f6fa0856e385a38e4']
      ];

      it('expected to create hash from string', () => {
        data.forEach(d => {
          expect(Hash.create(d[0])).toStrictEqual(d[1]);
        });
      });
    });

    describe('.isValid', () => {
      it('expected to return false when hash length is not 64', () => {
        expect(Hash.isValid('a'.repeat(63))).toBe(false);
        expect(Hash.isValid('a'.repeat(64))).toBe(true);
        expect(Hash.isValid('a'.repeat(65))).toBe(false);
      });

      it('expected to return false when hash includes invalid char', () => {
        const base = '0123456789abcdef'.repeat(4).slice(0, -1);
        expect(Hash.isValid(`${base}f`)).toBe(true);
        expect(Hash.isValid(`${base}g`)).toBe(false);
        expect(Hash.isValid(`${base}h`)).toBe(false);
        expect(Hash.isValid(`${base}A`)).toBe(false);
        expect(Hash.isValid(`${base}B`)).toBe(false);
      });
    });
  });

  describe('/runtask', () => {
    it('expected to become a valid log', async () => {
      expect.assertions(1);
      const log = await runTask(() => Promise.resolve('msg: test'));
      [log.name] = logNames;
      await expect(new Log(log).validate()).resolves.toBeUndefined();
    });

    it('expected to be fulfilled when fn is rejected', async () => {
      expect.assertions(1);
      const log = await runTask(() => Promise.reject(new Error('test')));
      [log.name] = logNames;
      await expect(new Log(log).validate()).resolves.toBeUndefined();
    });
  });
});
