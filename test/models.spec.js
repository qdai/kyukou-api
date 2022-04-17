'use strict';

const moment = require('moment');

const Event = require('../lib/models/event');

describe('db', () => {
  beforeAll(() => {
    moment.locale('ja');
  });

  describe('/event', () => {
    describe('.eventDate validator', () => {
      const eventDateValidator = Event.schema.paths.eventDate.validators[1].validator;
      it('expected to return false when the event expired', () => {
        expect(eventDateValidator(moment().subtract(1, 'day').toDate())).toBe(false);
        expect(eventDateValidator(moment().subtract(18.1, 'hours').toDate())).toBe(false);
        expect(eventDateValidator(moment().subtract(17.9, 'hours').toDate())).toBe(true);
        expect(eventDateValidator(moment().toDate())).toBe(true);
      });
    });
  });
});
