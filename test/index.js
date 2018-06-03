'use strict';

const chai = require('chai');

const { expect } = chai;

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const Api = require('../lib');

describe('Api', () => {
  let api = null;

  before(() => {
    api = new Api(config);
  });

  after(async () => {
    await db.clear();
    await db.close();
  });

  it('expected to have Events, Logs and Tasks', () => {
    expect(api.events).to.be.an('object');
    expect(api.logs).to.be.an('object');
    expect(api.tasks).to.be.an('object');
  });
});
