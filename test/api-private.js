/* global describe, it, before, after, afterEach */

'use strict';

const arrayShuffle = require('array-shuffle');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

const config = require('./fixtures/config');
const db = require('./fixtures/db');

const privateAPI = require('../lib/api/private');
const publicAPI = require('../lib/api/public');

const getEventsList = () => {
  return privateAPI.events.list().then(events => {
    return events.map(event => {
      delete event._id; // eslint-disable-line no-underscore-dangle
      return event;
    });
  });
};

describe('Private API', () => {
  before(() => db.open());

  after(() => db.clear().then(() => db.close()));

  describe('.events', () => {
    afterEach(() => db.clearEvent());

    describe('.list', () => {
      it('expected to be fulfilled with all scheduled events which are sorted by eventDate', () => {
        const data = require('./fixtures/events/eventdate');
        const promise = db.insertEvent(arrayShuffle(data)).then(() => {
          return privateAPI.events.list();
        }).then(events => {
          return events.map(event => {
            delete event._id; // eslint-disable-line no-underscore-dangle
            return event;
          });
        });
        return expect(promise).to.become(data);
      });

      it('expected to be fulfilled with all scheduled events which are sorted by period', () => {
        const data = require('./fixtures/events/period');
        const promise = db.insertEvent(arrayShuffle(data)).then(() => {
          return privateAPI.events.list();
        }).then(events => {
          return events.map(event => {
            delete event._id; // eslint-disable-line no-underscore-dangle
            return event;
          });
        });
        return expect(promise).to.become(data);
      });
    });

    describe('.add', () => {
      const data = require('./fixtures/events/index');
      const invalidDateData = require('./fixtures/events/invalid-date');

      it('expected to add new event', () => {
        const promise = privateAPI.events.add(data).then(getEventsList);
        return expect(promise).to.become([data]);
      });

      it('expected to be rejected when the event already exist', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.add(data);
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to modify event when the event already exist', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.add(data);
        }).catch(e => {
          return e;
        }).then(getEventsList);
        return expect(promise).to.become([data]);
      });

      it('expected to be rejected when eventDate is invalid', () => {
        const promise = privateAPI.events.add(invalidDateData);
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to add event when eventDate is invalid', () => {
        const promise = privateAPI.events.add(invalidDateData).catch(e => {
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
          return privateAPI.events.edit(data.hash, editData);
        }).then(getEventsList);
        return expect(promise).to.become([modifiedData]);
      });

      it('expected to be rejected when hash is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit('invalid hash', editData);
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to modify event when hash is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit('invalid hash', editData);
        }).catch(e => {
          return e;
        }).then(getEventsList);
        return expect(promise).to.become([data]);
      });

      it('expected to be rejected when key is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit(data.hash, {
            invalidKey: 'value'
          });
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to modify event when key is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit(data.hash, {
            invalidKey: 'value'
          });
        }).catch(e => {
          return e;
        }).then(getEventsList);
        return expect(promise).to.become([data]);
      });

      it('expected to be rejected when hash doesn\'t found', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit(data.hash.replace(/1/g, 'a'), editData);
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to modify event when hash doesn\'t found', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.edit(data.hash.replace(/1/g, 'a'), editData);
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
          return privateAPI.events.delete(data.hash);
        }).then(getEventsList);
        return expect(promise).to.become([]);
      });

      it('expected to be rejected when hash is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.delete('invalid hash');
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to delete event when hash is invalid', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.delete('invalid hash');
        }).catch(e => {
          return e;
        }).then(getEventsList);
        return expect(promise).to.become([data]);
      });

      it('expected to be rejected when hash doesn\'t found', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.delete(data.hash.replace(/1/g, 'a'));
        });
        return expect(promise).to.be.rejectedWith(Error);
      });

      it('expected not to delete event when hash doesn\'t found', () => {
        const promise = db.insertEvent(data).then(() => {
          return privateAPI.events.delete(data.hash.replace(/1/g, 'a'));
        }).catch(e => {
          return e;
        }).then(getEventsList);
        return expect(promise).to.become([data]);
      });
    });
  });

  describe('.tasks', () => {
    describe('.task', () => {
      it('expected to be fulfilled with tasklog and save result in db', function () {
        this.timeout(10000);
        const promise = privateAPI.tasks.task().then(tasklog => {
          return publicAPI.logs.about('task').then(savedTasklog => {
            return expect(savedTasklog).to.deep.equal(tasklog);
          });
        });
        return expect(promise).to.fulfilled;
      });
    });

    describe('.twitNew', () => {
      it('expected to be fulfilled with tasklog and save result in db', () => {
        const promise = privateAPI.tasks.twitNew(config.twitter).then(tasklog => {
          return publicAPI.logs.about('twit_new').then(savedTasklog => {
            return expect(savedTasklog).to.deep.equal(tasklog);
          });
        });
        return expect(promise).to.fulfilled;
      });
    });

    describe('.twitTomorrow', () => {
      it('expected to be fulfilled with tasklog and save result in db', () => {
        const promise = privateAPI.tasks.twitTomorrow(config.twitter).then(tasklog => {
          return publicAPI.logs.about('twit_tomorrow').then(savedTasklog => {
            return expect(savedTasklog).to.deep.equal(tasklog);
          });
        });
        return expect(promise).to.fulfilled;
      });
    });

    describe('.delete', () => {
      it('expected to be fulfilled with tasklog and save result in db', () => {
        const promise = privateAPI.tasks.delete().then(tasklog => {
          return publicAPI.logs.about('delete').then(savedTasklog => {
            return expect(savedTasklog).to.deep.equal(tasklog);
          });
        });
        return expect(promise).to.fulfilled;
      });
    });
  });
});
