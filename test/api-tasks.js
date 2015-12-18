'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

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

  after(() => db.clear().then(() => db.close()));

  describe('.scrap', () => {
    it('expected to scrap events and save', () => {
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      const promise = apiTasks.scrap().then(() => {
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save expired event', () => {
      const data = require('./fixtures/scraps/index');
      const expiredData = require('./fixtures/scraps/expired');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(expiredData)],
        twitter: config.twitter
      });
      const promise = apiTasks.scrap().then(log => {
        expect(log.log).to.includes('inf: ');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save invalid-date event', () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateData = require('./fixtures/scraps/invalid-date');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateData)],
        twitter: config.twitter
      });
      const promise = apiTasks.scrap().then(log => {
        expect(log.log).to.includes('err: ');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save Error', () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateError = require('./fixtures/scraps/invalid-eventdate');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data), () => Promise.resolve(invalidDateError)],
        twitter: config.twitter
      });
      const promise = apiTasks.scrap().then(log => {
        expect(log.log).to.includes('wrn: ');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected to do noting when the event already exist', () => {
      const data = require('./fixtures/scraps/index');
      const apiTasks = new ApiTasks({
        scrapers: [() => Promise.resolve(data)],
        twitter: config.twitter
      });
      const promise = apiTasks.scrap().then(() => apiTasks.scrap()).then(log => {
        expect(log.log).to.deep.equal('msg: 0 event(s) created\nmsg: 1 event(s) already exist');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = api.scrap().then(tasklog => {
        return apiLogs.about('scrap').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });

    describe('log.level', () => {
      it('expected to be 2 when information', () => {
        const expiredData = require('./fixtures/scraps/expired');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(expiredData)],
          twitter: config.twitter
        });
        const promise = apiTasks.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(2);
      });

      it('expected to be 3 when warning', () => {
        const data = require('./fixtures/scraps/invalid-eventdate');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const promise = apiTasks.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(3);
      });

      it('expected to be 4 when error', () => {
        const data = require('./fixtures/scraps/invalid-date');
        const apiTasks = new ApiTasks({
          scrapers: [() => Promise.resolve(data)],
          twitter: config.twitter
        });
        const promise = apiTasks.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(4);
      });
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = api.scrap().then(tasklog => {
        return apiLogs.about('scrap').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.twitNew', () => {
    it('expected to post tweet and update db', () => {
      const data = require('./fixtures/events/new');
      const promise = db.insertEvent(data).then(() => api.twitNew()).then(log => {
        expect(log.log).to.deep.equal('msg: 1 event(s) posted');
        return api.twitNew();
      }).then(log => {
        expect(log.log).to.deep.equal('msg: 0 event(s) posted');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data.map(d => {
        d.tweet.new = true;
        return d;
      }));
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = api.twitNew().then(tasklog => {
        return apiLogs.about('twit_new').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.twitTomorrow', () => {
    it('expected to post tweet and update db', () => {
      const data = require('./fixtures/events/tomorrow');
      const promise = db.insertEvent(data).then(() => api.twitTomorrow()).then(log => {
        expect(log.log).to.deep.equal('msg: 1 event(s) posted');
        return api.twitTomorrow();
      }).then(log => {
        expect(log.log).to.deep.equal('msg: 0 event(s) posted');
        return Event.find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data.map(d => {
        d.tweet.tomorrow = true;
        return d;
      }));
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = api.twitTomorrow().then(tasklog => {
        return apiLogs.about('twit_tomorrow').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.delete', () => {
    it('expected to remove expired events', () => {
      const data = require('./fixtures/events/delete');
      const promise = Event.collection.insertMany(data).then(() => api.delete()).then(log => {
        expect(log.log).to.deep.equal('msg: 2 event(s) deleted');
        return Event.find({}).lean().exec();
      });
      return expect(promise).to.become(data.slice(2));
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = api.delete().then(tasklog => {
        return apiLogs.about('delete').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });
});
