/* global describe, it, before, after */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const config = {
  scrapers: [Promise.resolve([])],
  twitter: {
    consumer_key: '*', // eslint-disable-line camelcase
    consumer_secret: '*', // eslint-disable-line camelcase
    access_token: '*', // eslint-disable-line camelcase
    access_token_secret: '*' // eslint-disable-line camelcase
  }
};
const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const ApiTasks = require('../lib/api/tasks');

const apiLogs = new ApiLogs();
const apiTasks = new ApiTasks(config);

describe('Tasks API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  describe('.scrap', () => {
    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = apiTasks.scrap().then(tasklog => {
        return apiLogs.about('scrap').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });

    describe('log.level', () => {
      it('expected to be 2 when information', () => {
        const expiredData = require('./fixtures/scraps/expired');
        const apiTasksLocal = new ApiTasks({ scrapers: [Promise.resolve(expiredData)] });
        const promise = apiTasksLocal.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(2);
      });

      it('expected to be 3 when warning', () => {
        const data = require('./fixtures/scraps/invalid-eventdate');
        const apiTasksLocal = new ApiTasks({ scrapers: [Promise.resolve(data)] });
        const promise = apiTasksLocal.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(3);
      });

      it('expected to be 4 when error', () => {
        const data = require('./fixtures/scraps/invalid-date');
        const apiTasksLocal = new ApiTasks({ scrapers: [Promise.resolve(data)] });
        const promise = apiTasksLocal.scrap().then(log => {
          return log.level;
        });
        return expect(promise).to.become(4);
      });
    });

    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = apiTasks.scrap().then(tasklog => {
        return apiLogs.about('scrap').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.twitNew', () => {
    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = apiTasks.twitNew().then(tasklog => {
        return apiLogs.about('twit_new').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.twitTomorrow', () => {
    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = apiTasks.twitTomorrow().then(tasklog => {
        return apiLogs.about('twit_tomorrow').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });

  describe('.delete', () => {
    it('expected to be fulfilled with tasklog and save result in db', () => {
      const promise = apiTasks.delete().then(tasklog => {
        return apiLogs.about('delete').then(savedTasklog => {
          return expect(savedTasklog).to.deep.equal(tasklog);
        });
      });
      return expect(promise).to.fulfilled;
    });
  });
});
