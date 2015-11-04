/* global describe, it, before, after, afterEach */

'use strict';

const arrayShuffle = require('array-shuffle');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const db = require('./fixtures/db');

const ApiEvents = require('../lib/api/events');

const apiEvents = new ApiEvents();

const getEventsList = () => {
  return apiEvents.list().then(events => {
    return events;
  });
};

describe('Events API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  afterEach(() => db.clearEvent());

  describe('.list', () => {
    it('expected to be fulfilled with all scheduled events which are sorted by eventDate', () => {
      const data = require('./fixtures/events/eventdate');
      const promise = db.insertEvent(arrayShuffle(data)).then(() => {
        return apiEvents.list();
      });
      return expect(promise).to.become(data);
    });

    it('expected to be fulfilled with all scheduled events which are sorted by period', () => {
      const data = require('./fixtures/events/period');
      const promise = db.insertEvent(arrayShuffle(data)).then(() => {
        return apiEvents.list();
      });
      return expect(promise).to.become(data);
    });

    it('expected to be fulfilled with specified department\'s events', () => {
      const data = require('./fixtures/events/department');
      const departments = ['edu', 'lit', 'law'];
      const departmentsJa = ['教育学部', '文学部', '法学部'];
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.list(departments);
      }).then(events => events.sort((a, b) => a.department > b.department ? 1 : -1));
      return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with specified department\'s events', () => {
      const data = require('./fixtures/events/department');
      const departments = ['sci', 'econ', 'econ'];
      const departmentsJa = ['理学部', '経済学部'];
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.list(departments.join(','));
      }).then(events => events.sort((a, b) => a.department > b.department ? 1 : -1));
      return expect(promise).to.become(data.filter(d => departmentsJa.indexOf(d.department) !== -1));
    });

    it('expected to be fulfilled with events which are start with startIndex', () => {
      const data = require('./fixtures/events/eventdate');
      const startIndex = 2;
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.list(null, startIndex);
      });
      return expect(promise).to.become(data.slice(startIndex));
    });

    it('expected to be fulfilled with specified count events', () => {
      const data = require('./fixtures/events/eventdate');
      const count = 2;
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.list(null, null, count);
      });
      return expect(promise).to.become(data.slice(0, count));
    });
  });

  describe('.yyyymmdd', () => {
    it('expected to be fulfilled with specified days events which are sorted by period', () => {
      const data = require('./fixtures/events/eventdate');
      const eventDate = data[0].eventDate;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.yyyymmdd(yyyy, mm, dd);
      });
      return expect(promise).to.become(data.filter(d => {
        return d.eventDate.getFullYear() === yyyy
          && d.eventDate.getMonth() + 1 === mm
          && d.eventDate.getDate() === dd;
      }));
    });

    it('expected to be rejected when the day is invalid', () => {
      const promise = apiEvents.yyyymmdd('yyyy', 'mm', 'dd');
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be fulfilled with specified count events', () => {
      const data = require('./fixtures/events/eventdate');
      const eventDate = data[0].eventDate;
      const yyyy = eventDate.getFullYear();
      const mm = eventDate.getMonth() + 1;
      const dd = eventDate.getDate();
      const count = 2;
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.yyyymmdd(yyyy, mm, dd, count);
      });
      return expect(promise).to.become(data.filter(d => {
        return d.eventDate.getFullYear() === yyyy
          && d.eventDate.getMonth() + 1 === mm
          && d.eventDate.getDate() === dd;
      }).slice(0, count));
    });
  });

  describe('.search', () => {
    it('expected to be rejected when query is not specified', () => {
      const promise = apiEvents.search();
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be rejected when query is too long', () => {
      const promise = apiEvents.search('long string'.repeat(12));
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected to be fulfilled with matched events', () => {
      const data = require('./fixtures/events/department');
      const q = '教育学部';
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.search(q);
      });
      return expect(promise).to.become(data.filter(d => d.department === q));
    });

    it('expected to be fulfilled with specified count events', () => {
      const data = require('./fixtures/events/period');
      const q = 'test';
      const count = 2;
      const promise = db.insertEvent(arrayShuffle(data)).then(() => {
        return apiEvents.search(q, count);
      });
      return expect(promise).to.become(data.slice(0, count));
    });
  });

  describe('.add', () => {
    const data = require('./fixtures/events/index');
    const invalidDateData = require('./fixtures/events/invalid-date');

    it('expected to add new event', () => {
      const promise = apiEvents.add(data).then(getEventsList);
      return expect(promise).to.become([data]);
    });

    it('expected to be rejected when the event already exist', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.add(data);
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when the event already exist', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.add(data);
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });

    it('expected to be rejected when eventDate is invalid', () => {
      const promise = apiEvents.add(invalidDateData);
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to add event when eventDate is invalid', () => {
      const promise = apiEvents.add(invalidDateData).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([]);
    });
  });

  describe('.edit', () => {
    const data = require('./fixtures/events/index');
    const editData = require('./fixtures/events/edit-data');
    const modifiedData = require('./fixtures/events/edit-modified');
    modifiedData.eventDate = editData.eventDate;
    modifiedData.pubDate = data.pubDate;

    it('expected to modify specified event', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit(data.hash, editData);
      }).then(getEventsList);
      return expect(promise).to.become([modifiedData]);
    });

    it('expected to be rejected when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit('invalid hash', editData);
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit('invalid hash', editData);
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });

    it('expected to be rejected when key is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit(data.hash, {
          invalidKey: 'value'
        });
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when key is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit(data.hash, {
          invalidKey: 'value'
        });
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });

    it('expected to be rejected when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit(data.hash.replace(/1/g, 'a'), editData);
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to modify event when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.edit(data.hash.replace(/1/g, 'a'), editData);
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });
  });

  describe('.delete', () => {
    const data = require('./fixtures/events/index');

    it('expected to delete specified event', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete(data.hash);
      }).then(getEventsList);
      return expect(promise).to.become([]);
    });

    it('expected to be rejected when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete('invalid hash');
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to delete event when hash is invalid', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete('invalid hash');
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });

    it('expected to be rejected when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete(data.hash.replace(/1/g, 'a'));
      });
      return expect(promise).to.be.rejectedWith(Error);
    });

    it('expected not to delete event when hash doesn\'t found', () => {
      const promise = db.insertEvent(data).then(() => {
        return apiEvents.delete(data.hash.replace(/1/g, 'a'));
      }).catch(e => {
        return e;
      }).then(getEventsList);
      return expect(promise).to.become([data]);
    });
  });
});
