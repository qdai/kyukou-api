'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const moment = require('moment');

chai.use(chaiAsPromised);
moment.locale('ja');

const expect = chai.expect;

const Hash = require('../lib/utils/hash');

describe('Utils', () => {
  describe('/hash', () => {
    describe('.create', () => {
      const data = [
        ['a', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'],
        ['b', '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'],
        ['string with space', 'caf7d0a818dbf6ade655de82886db446de7bba23d5e221ae8115e6d71bf5b572'],
        ['stringwithspace', 'caf7d0a818dbf6ade655de82886db446de7bba23d5e221ae8115e6d71bf5b572'],
        [' string with leading space', '1dbd5a9fcbdbba0d31bd3fb81a00cdabf02eef133b5c25785112c48eed0df878'],
        ['stringwithleadingspace', '1dbd5a9fcbdbba0d31bd3fb81a00cdabf02eef133b5c25785112c48eed0df878'],
        ['string with trailing space ', '346ad6828f4189545d62dbc037c97c2e2089d44225a8491f6fa0856e385a38e4'],
        ['stringwithtrailingspace', '346ad6828f4189545d62dbc037c97c2e2089d44225a8491f6fa0856e385a38e4']
      ];

      it('expected to create hash from string', () => {
        data.forEach(d => {
          expect(Hash.create(d[0])).to.deep.equal(d[1]);
        });
      });
    });

    describe('.isValid', () => {
      it('expected to return false when hash length is not 64', () => {
        expect(Hash.isValid('a'.repeat(63))).to.be.false;
        expect(Hash.isValid('a'.repeat(64))).to.be.true;
        expect(Hash.isValid('a'.repeat(65))).to.be.false;
      });

      it('expected to return false when hash includes invalid char', () => {
        const base = '0123456789abcdef'.repeat(4).slice(0, -1);
        expect(Hash.isValid(base + 'f')).to.be.true;
        expect(Hash.isValid(base + 'g')).to.be.false;
        expect(Hash.isValid(base + 'h')).to.be.false;
        expect(Hash.isValid(base + 'A')).to.be.false;
        expect(Hash.isValid(base + 'B')).to.be.false;
      });
    });
  });
});
