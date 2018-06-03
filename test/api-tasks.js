'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const ApiTasks = require('../lib/api/tasks');
const Event = require('../lib/models/event');

const apiLogs = new ApiLogs();
const api = new ApiTasks({
  scrapers: [() => Promise.resolve()],
  twitter: config.twitter
});

describe('Tasks API', () => {
  before(() => db.open());

  afterEach(() => db.clearEvent());

  after(async () => {
    await db.clear();
    await db.close();
  });

  describe('.scrap', () => {
    it('expected to scrap events and save', async () => {
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      await apiTasks.scrap();
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data);
    });

    it('expected not to save expired event', async () => {
      const data = require('./fixtures/scraps/index');
      const expiredData = require('./fixtures/scraps/expired');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(expiredData)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).to.includes('inf: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data);
    });

    it('expected not to save invalid-date event', async () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateData = require('./fixtures/scraps/invalid-date');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateData)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).to.includes('err: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data);
    });

    it('expected not to save Error', async () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateError = require('./fixtures/scraps/invalid-eventdate');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateError)],
        twitter: config.twitter
      });
      const log = await apiTasks.scrap();
      expect(log.log).to.includes('wrn: ');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data);
    });

    it('expected to do noting when the event already exist', async () => {
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      await apiTasks.scrap();
      const log = await apiTasks.scrap();
      expect(log.log).to.deep.equal('msg: 0 event(s) created\nmsg: 1 event(s) already exist');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data);
    });

    it('expected to be fulfilled with tasklog and save result in db', async () => {
      const tasklog = await api.scrap();
      const savedTasklog = await apiLogs.about('scrap');
      expect(savedTasklog).to.deep.equal(tasklog);
    });

    describe('log.level', () => {
      it('expected to be 2 when information', async () => {
        const expiredData = require('./fixtures/scraps/expired');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(expiredData)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).to.deep.equal(2);
      });

      it('expected to be 3 when warning', async () => {
        const data = require('./fixtures/scraps/invalid-eventdate');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).to.deep.equal(3);
      });

      it('expected to be 4 when error', async () => {
        const data = require('./fixtures/scraps/invalid-date');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const { level } = await apiTasks.scrap();
        expect(level).to.deep.equal(4);
      });
    });

    it('expected to be fulfilled with tasklog and save result in db', async () => {
      const tasklog = await api.scrap();
      const savedTasklog = await apiLogs.about('scrap');
      expect(savedTasklog).to.deep.equal(tasklog);
    });
  });

  describe('.twitNew', () => {
    it('expected to post tweet and update db', async () => {
      const data = require('./fixtures/events/new');
      await db.insertEvent(data);
      const log1 = await api.twitNew();
      expect(log1.log).to.deep.equal('msg: 1 event(s) posted');
      const log2 = await api.twitNew();
      expect(log2.log).to.deep.equal('msg: 0 event(s) posted');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data.map(d => {
        d.tweet.new = true;
        return d;
      }));
    });

    it('expected to be fulfilled with tasklog and save result in db', async () => {
      const tasklog = await api.twitNew();
      const savedTasklog = await apiLogs.about('twit_new');
      expect(savedTasklog).to.deep.equal(tasklog);
    });
  });

  describe('.twitTomorrow', () => {
    it('expected to post tweet and update db', async () => {
      const data = require('./fixtures/events/tomorrow');
      await db.insertEvent(data);
      const log1 = await api.twitTomorrow();
      expect(log1.log).to.deep.equal('msg: 1 event(s) posted');
      const log2 = await api.twitTomorrow();
      expect(log2.log).to.deep.equal('msg: 0 event(s) posted');
      const events = await Event.find({}, '-_id -__v').lean().exec();
      expect(events).to.deep.equal(data.map(d => {
        d.tweet.tomorrow = true;
        return d;
      }));
    });

    it('expected to be fulfilled with tasklog and save result in db', async () => {
      const tasklog = await api.twitTomorrow();
      const savedTasklog = await apiLogs.about('twit_tomorrow');
      expect(savedTasklog).to.deep.equal(tasklog);
    });
  });

  describe('.delete', () => {
    it('expected to remove expired events', async () => {
      const data = require('./fixtures/events/delete');
      await Event.collection.insertMany(data);
      const log = await api.delete();
      expect(log.log).to.deep.equal('msg: 2 event(s) deleted');
      const events = await Event.find({}).lean().exec();
      expect(events).to.deep.equal(data.slice(2));
    });

    it('expected to be fulfilled with tasklog and save result in db', async () => {
      const tasklog = await api.delete();
      const savedTasklog = await apiLogs.about('delete');
      expect(savedTasklog).to.deep.equal(tasklog);
    });
  });
});
