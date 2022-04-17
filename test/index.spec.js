'use strict';

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const Api = require('../lib');

describe('api', () => {
  let api = null;

  beforeAll(async () => {
    await db.open();
    api = new Api(config);
  });

  afterAll(async () => {
    await db.clear();
    await db.close();
  });

  it('expected to have Events, Logs and Tasks', () => {
    expect(api.events).toBeInstanceOf(Object);
    expect(api.logs).toBeInstanceOf(Object);
    expect(api.tasks).toBeInstanceOf(Object);
  });
});
