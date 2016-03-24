'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const logNames = require('../lib/utils/lognames');

const apiLogs = new ApiLogs();

describe('Logs API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  describe('.values', () => {
    it('is expected to be fulfilled with array of log', () => {
      const promise = apiLogs.values().then(logs => logs.map(log => log.name));
      return expect(promise).to.become(logNames);
    });
  });

  describe('.get', () => {
    it('is expected to be rejected when arg is invalid', () => {
      const name = 'invalid';
      const promise = apiLogs.get(name);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('is expected to be fulfilled with specified log', () => {
      const promise = Promise.all(logNames.map(name => apiLogs.get(name).then(log => log.name)));
      return expect(promise).to.become(logNames);
    });
  });
});
