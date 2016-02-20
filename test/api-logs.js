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

  describe('.about', () => {
    it('expected to be rejected when arg is invalid', () => {
      const about = 'invalid';
      const promise = apiLogs.about(about);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be fulfilled with specified tasklog', () => {
      const promise = Promise.all(logNames.map(about => apiLogs.about(about).then(tasklog => tasklog.name)));
      return expect(promise).to.become(logNames);
    });
  });
});