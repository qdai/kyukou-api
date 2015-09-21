/* global describe, it, before, after */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const rewire = require('rewire');
const url = require('url');

chai.use(chaiAsPromised);

const expect = chai.expect;

const config = require('./fixtures/config');
const server = require('./fixtures/server');

const departments = ['economics', 'education', 'law', 'literature', 'science'];

describe('Tasks', () => {
  describe('/task', () => {
    before(done => server.listen(url.parse(config.localhost).port, done));

    after(done => server.close(done));

    departments.forEach(department => {
      describe('/' + department, () => {
        it('expected to build events about ' + department, () => {
          const getDepartment = rewire('../lib/tasks/task/' + department);
          getDepartment.__set__({ // eslint-disable-line no-underscore-dangle
            'config.baseURL': config.localhost,
            'config.resourcePath': '/' + department + '.html',
            'config.resourceURL': config.localhost + '/' + department + '.html'
          });
          const promise = getDepartment();
          const expected = require('./fixtures/task/' + department);
          return expect(promise).to.become(expected);
        });
      });
    });
  });
});
