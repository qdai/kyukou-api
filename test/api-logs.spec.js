'use strict';

const db = require('./fixtures/db');

const ApiLogs = require('../lib/api/logs');
const logNames = require('../lib/utils/lognames');

const apiLogs = new ApiLogs();

describe('logs API', () => {
  beforeAll(() => db.open());

  afterAll(async () => {
    await db.clear();
    await db.close();
  });

  describe('.about', () => {
    it('expected to be rejected when arg is invalid', async () => {
      expect.assertions(1);
      const about = 'invalid';
      const promise = apiLogs.about(about);
      await expect(promise).rejects.toThrow(Error);
    });

    it.each(logNames)('expected to be fulfilled with tasklog', async about => {
      expect.assertions(1);
      const { name } = await apiLogs.about(about);
      expect(name).toStrictEqual(about);
    });
  });
});
