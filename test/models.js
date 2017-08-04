'use strict';

const chai = require('chai');
const moment = require('moment');

moment.locale('ja');

const { expect } = chai;

const Event = require('../lib/models/event');

describe('db', () => {
  describe('/event', () => {
    describe('.eventDate validator', () => {
      const eventDateValidator = Event.schema.paths.eventDate.validators[1].validator;
      it('expected to return false when the event expired', () => {
        expect(eventDateValidator(moment().subtract(1, 'day').toDate())).to.be.false;
        expect(eventDateValidator(moment().subtract(18.1, 'hours').toDate())).to.be.false;
        expect(eventDateValidator(moment().subtract(17.9, 'hours').toDate())).to.be.true;
        expect(eventDateValidator(moment().toDate())).to.be.true;
      });
    });
  });
});
