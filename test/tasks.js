/* global describe, it, before, after, afterEach */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mongoose = require('mongoose');
const rewire = require('rewire');
const url = require('url');

chai.use(chaiAsPromised);
mongoose.Promise = Promise;

const expect = chai.expect;

const config = require('./fixtures/config');
const db = require('./fixtures/db');
const server = require('./fixtures/server');

const departments = ['economics', 'education', 'law', 'literature', 'science'];
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
      const promise = Promise.all(data.map(d => {
        return new Promise((resolve, reject) => {
          mongoose.model('Event').collection.insert(d, err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })).then(() => taskDelete()).then(msg => {
        expect(msg).to.deep.equal('msg: 2 event(s) deleted');
        return mongoose.model('Event').find({}).lean().exec();
      });
      return expect(promise).to.become(data.slice(2));
    });
  });

  describe('/task', () => {
    before(done => server.listen(url.parse(config.localhost).port, done));

    after(done => server.close(done));

    departments.forEach(department => {
      describe('/' + department, () => {
        it('expected to build events about ' + department, () => {
          const getDepartment = rewire('../lib/tasks/task/' + department);
          getDepartment.__set__({ // eslint-disable-line no-underscore-dangle
            'config.baseURL': config.localhost,
            'config.resourcePath': '/' + department + '.html',
            'config.resourceURL': config.localhost + '/' + department + '.html'
          });
          const promise = getDepartment();
          const expected = require('./fixtures/task/' + department);
          return expect(promise).to.become(expected);
        });
      });
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
