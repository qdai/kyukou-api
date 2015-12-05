/* global describe, it, before, after, afterEach */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');

chai.use(chaiAsPromised);
mongoose.Promise = Promise;

const expect = chai.expect;

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const taskScrap = require('../lib/tasks/scrap');
const taskDelete = require('../lib/tasks/delete');
const taskTwitNew = require('../lib/tasks/twit_new');
const taskTwitTomorrow = require('../lib/tasks/twit_tomorrow');

describe('Tasks', () => {
  before(() => db.open());

  afterEach(() => db.clearEvent());

  after(() => db.clear().then(() => db.close()));

  describe('/delete', () => {
    it('expected to remove expired events', () => {
      const data = require('./fixtures/events/delete');
      const promise = mongoose.model('Event').collection.insertMany(data).then(() => taskDelete()).then(msg => {
        expect(msg).to.deep.equal('msg: 2 event(s) deleted');
        return mongoose.model('Event').find({}).lean().exec();
      });
      return expect(promise).to.become(data.slice(2));
    });
  });

  describe('/scrap', () => {
    it('expected to scrap events and save', () => {
      const data = require('./fixtures/scraps/index');
      const promise = taskScrap([() => Promise.resolve(data)]).then(() => {
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save expired event', () => {
      const data = require('./fixtures/scraps/index');
      const expiredData = require('./fixtures/scraps/expired');
      const promise = taskScrap([() => Promise.resolve(data), () => Promise.resolve(expiredData)]).then(log => {
        expect(log).to.includes('inf: ');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save invalid-date event', () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateData = require('./fixtures/scraps/invalid-date');
      const promise = taskScrap([() => Promise.resolve(data), () => Promise.resolve(invalidDateData)]).then(log => {
        expect(log).to.includes('err: ');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected not to save Error', () => {
      const data = require('./fixtures/scraps/index');
      const invalidDateError = require('./fixtures/scraps/invalid-eventdate');
      const promise = taskScrap([() => Promise.resolve(data), () => Promise.resolve(invalidDateError)]).then(log => {
        expect(log).to.includes('wrn: ');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });

    it('expected to do noting when the event already exist', () => {
      const data = require('./fixtures/scraps/index');
      const promise = taskScrap([() => Promise.resolve(data)]).then(() => taskScrap([() => Promise.resolve(data)])).then(log => {
        expect(log).to.deep.equal('msg: 0 event(s) created\nmsg: 1 event(s) already exist');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data);
    });
  });

  describe('/twit_new', () => {
    it('expected to post tweet and update db', () => {
      const data = require('./fixtures/events/new');
      const promise = db.insertEvent(data).then(() => taskTwitNew(config.twitter)).then(result => {
        expect(result).to.deep.equal('msg: 1 event(s) posted');
        return taskTwitNew(config.twitter);
      }).then(result => {
        expect(result).to.deep.equal('msg: 0 event(s) posted');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data.map(d => {
        d.tweet.new = true;
        return d;
      }));
    });
  });

  describe('/twit_tomorrow', () => {
    it('expected to post tweet and update db', () => {
      const data = require('./fixtures/events/tomorrow');
      const promise = db.insertEvent(data).then(() => taskTwitTomorrow(config.twitter)).then(result => {
        expect(result).to.deep.equal('msg: 1 event(s) posted');
        return taskTwitTomorrow(config.twitter);
      }).then(result => {
        expect(result).to.deep.equal('msg: 0 event(s) posted');
        return mongoose.model('Event').find({}, '-_id -__v').lean().exec();
      });
      return expect(promise).to.become(data.map(d => {
        d.tweet.tomorrow = true;
        return d;
      }));
    });
  });
});
