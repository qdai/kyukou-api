'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;

const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const logNames = require('../lib/utils/lognames');

const apiLogs = new ApiLogs();

describe('Logs API', () => {
  before(() => db.open());

  after(async () => {
    await db.clear();
    await db.close();
  });

  describe('.about', () => {
    it('expected to be rejected when arg is invalid', () => {
      const about = 'invalid';
      const promise = apiLogs.about(about);
      return expect(promise).to.be.rejectedWith(Error);
    });

    logNames.forEach(about => {
      it(`expected to be fulfilled with tasklog about ${about}`, async () => {
        const { name } = await apiLogs.about(about);
        expect(name).to.deep.equal(about);
      });
    });
  });
});
