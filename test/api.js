/* global describe, it, after */

'use strict';

const chai = require('chai');

const expect = chai.expect;

const config = require('./fixtures/config');

const lib = require('../lib');
const db = require('../lib/db');

const api = lib(config.mongoURI);

describe('API', () => {
  after(() => db.close());

  it('expected to have some functions', () => {
    expect(api.private.events.list).to.be.a('function');
    expect(api.private.events.add).to.be.a('function');
    expect(api.private.events.edit).to.be.a('function');
    expect(api.private.events.delete).to.be.a('function');
    expect(api.private.tasks.task).to.be.a('function');
    expect(api.private.tasks.twitNew).to.be.a('function');
    expect(api.private.tasks.twitTomorrow).to.be.a('function');
    expect(api.private.tasks.delete).to.be.a('function');
    expect(api.public.events.list).to.be.a('function');
    expect(api.public.events.yyyymmdd).to.be.a('function');
    expect(api.public.events.search).to.be.a('function');
    expect(api.public.logs.about).to.be.a('function');
  });

  it('expected to throw error', () => {
    expect(lib.bind(lib, config.mongoURI)).to.throw(/Trying to open unclosed connection/);
  });
});
