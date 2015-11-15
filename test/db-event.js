/* global describe, it, before, after */

'use strict';

const chai = require('chai');
const rewire = require('rewire');

const expect = chai.expect;

const event = rewire('../lib/db/event');
const eventAsString = event.__get__('asString');

describe('Event Schema', () => {
  describe('.asString', () => {
    it('expected to return event as string', () => {
      const event = {
        about: 'about',
        eventDate: new Date('2015-01-01'),
        period: 'period',
        department: 'department',
        subject: 'subject',
        teacher: 'teacher',
        campus: 'campus',
        room: 'room',
        note: 'note'
      };
      expect(eventAsString.call(event, 'title')).to.deep.equal('【about】period時限「subject（campus）」（teacher教員）');
      expect(eventAsString.call(event, 'summary')).to.deep.equal('【about】1月1日（木）period時限department「subject（campus）」（teacher教員）');
      expect(eventAsString.call(event, 'note')).to.deep.equal('教室：room\n備考：note');
      expect(eventAsString.call(event)).to.deep.equal('【about】1月1日（木）\ndepartmentperiod時限「subject（campus）」（teacher教員）\n教室：room\n備考：note');
    });

    it('expected to return event as string', () => {
      const event = {
        about: 'about',
        eventDate: new Date('2015-01-01'),
        period: 'period',
        department: 'department',
        subject: 'subject'
      };
      expect(eventAsString.call(event, 'title')).to.deep.equal('【about】period時限「subject」');
      expect(eventAsString.call(event, 'summary')).to.deep.equal('【about】1月1日（木）period時限department「subject」');
      expect(eventAsString.call(event, 'note')).to.deep.equal('');
      expect(eventAsString.call(event)).to.deep.equal('【about】1月1日（木）\ndepartmentperiod時限「subject」');
    });

    it('expected to return event as string', () => {
      const event = {
        about: 'about',
        eventDate: new Date('2015-01-01'),
        period: 'period',
        department: 'department',
        subject: 'subject',
        teacher: 'teacher',
        campus: 'campus',
        room: 'room',
        note: 'note'
      };
      expect(eventAsString.call(event, 'title')).to.deep.equal('【about】period時限「subject（campus）」（teacher教員）');
      expect(eventAsString.call(event, 'summary')).to.deep.equal('【about】1月1日（木）period時限department「subject（campus）」（teacher教員）');
      expect(eventAsString.call(event, 'note', '<br />')).to.deep.equal('教室：room<br />備考：note');
      expect(eventAsString.call(event, null, '<br />')).to.deep.equal('【about】1月1日（木）<br />departmentperiod時限「subject（campus）」（teacher教員）<br />教室：room<br />備考：note');
    });
  });
});
