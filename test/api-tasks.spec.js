'use strict';

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const ApiTasks = require('../lib/api/tasks');
const Event = require('../lib/models/event');

jest.mock('twitter-api-v2', () => ({ TwitterApi: jest.fn().mockImplementation(() => ({ v1: { tweet: jest.fn().mockResolvedValue({}) } })) }));

const apiLogs = new ApiLogs();
const api = new ApiTasks({
  scrapers: [() => Promise.resolve()],
  twitter: config.twitter
});

describe('tasks API', () => {
  beforeAll(() => db.open());

  afterEach(() => db.clearEvent());

  afterAll(async () => {
    await db.clear();
    await db.close();
  });

  describe('.scrap', () => {
    it('expected to scrap events and save', async () => {
      expect.assertions(1);
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      await apiTasks.scrap();
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data);
    });

    it('expected not to save expired event', async () => {
      expect.assertions(2);
      const data = require('./fixtures/scraps/index');
      const expiredData = require('./fixtures/scraps/expired');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(expiredData)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).toContain('inf: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data);
    });

    it('expected not to save invalid-date event', async () => {
      expect.assertions(2);
      const data = require('./fixtures/scraps/index');
      const invalidDateData = require('./fixtures/scraps/invalid-date');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateData)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).toContain('err: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data);
    });

    it('expected not to save Error', async () => {
      expect.assertions(2);
      const data = require('./fixtures/scraps/index');
      const invalidDateError = require('./fixtures/scraps/invalid-eventdate');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateError)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).toContain('wrn: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data);
    });

    it('expected to do noting when the event already exist', async () => {
      expect.assertions(2);
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      await apiTasks.scrap();
      const log = await apiTasks.scrap();
      expect(log.log).toBe('msg: 0 event(s) created\nmsg: 1 event(s) already exist');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data);
    });

    describe('log.level', () => {
      it('expected to be 2 when information', async () => {
        expect.assertions(1);
        const expiredData = require('./fixtures/scraps/expired');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(expiredData)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).toBe(2);
      });

      it('expected to be 3 when warning', async () => {
        expect.assertions(1);
        const data = require('./fixtures/scraps/invalid-eventdate');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).toBe(3);
      });

      it('expected to be 4 when error', async () => {
        expect.assertions(1);
        const data = require('./fixtures/scraps/invalid-date');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).toBe(4);
      });
    });

    it('expected to be fulfilled with scrap log and save result in db', async () => {
      expect.assertions(1);
      const tasklog = await api.scrap();
      const savedTasklog = await apiLogs.about('scrap');
      expect(savedTasklog).toStrictEqual(tasklog);
    });
  });

  describe('.twitNew', () => {
    it('expected to post tweet and update db', async () => {
      expect.assertions(3);
      const data = require('./fixtures/events/new');
      await db.insertEvent(data);
      const log1 = await api.twitNew();
      expect(log1.log).toBe('msg: 1 event(s) posted');
      const log2 = await api.twitNew();
      expect(log2.log).toBe('msg: 0 event(s) posted');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data.map(d => {
        d.tweet.new = true;
        return d;
      }));
    });

    it('expected to be fulfilled with twit_new log and save result in db', async () => {
      expect.assertions(1);
      const tasklog = await api.twitNew();
      const savedTasklog = await apiLogs.about('twit_new');
      expect(savedTasklog).toStrictEqual(tasklog);
    });
  });

  describe('.twitTomorrow', () => {
    it('expected to post tweet and update db', async () => {
      expect.assertions(3);
      const data = require('./fixtures/events/tomorrow');
      await db.insertEvent(data);
      const log1 = await api.twitTomorrow();
      expect(log1.log).toBe('msg: 1 event(s) posted');
      const log2 = await api.twitTomorrow();
      expect(log2.log).toBe('msg: 0 event(s) posted');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).toStrictEqual(data.map(d => {
        d.tweet.tomorrow = true;
        return d;
      }));
    });

    it('expected to be fulfilled with twit_tomorrow log and save result in db', async () => {
      expect.assertions(1);
      const tasklog = await api.twitTomorrow();
      const savedTasklog = await apiLogs.about('twit_tomorrow');
      expect(savedTasklog).toStrictEqual(tasklog);
    });
  });

  describe('.delete', () => {
    it('expected to remove expired events', async () => {
      expect.assertions(2);
      const data = require('./fixtures/events/delete');
      await Event.collection.insertMany(data);
      const log = await api.delete();
      expect(log.log).toBe('msg: 2 event(s) deleted');
      const events = await Event.find({}).lean().exec();
      expect(events).toStrictEqual(data.slice(2));
    });

    it('expected to be fulfilled with delete log and save result in db', async () => {
      expect.assertions(1);
      const tasklog = await api.delete();
      const savedTasklog = await apiLogs.about('delete');
      expect(savedTasklog).toStrictEqual(tasklog);
    });
  });
});
