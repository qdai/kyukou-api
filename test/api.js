/* global describe, it, before, after */

'use strict';

const chai = require('chai');

const expect = chai.expect;

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const Api = require('../lib');

describe('Api', () => {
  let api;

  before(() => {
    api = new Api(config);
  });

  after(() => db.clear().then(() => db.close()));

  it('expected to have Events, Logs and Tasks', () => {
    expect(api.events).to.be.an('object');
    expect(api.logs).to.be.an('object');
    expect(api.tasks).to.be.an('object');
  });
});
