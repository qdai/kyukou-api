'use strict';

const Twit = require('twit');
const truncate = require('truncate');
const twitterText = require('twitter-text');

const getRemainingLength = text => 140 - twitterText.getTweetLength(text);

const Twitter = class {
  constructor (config) {
    this.twit = new Twit(config);
  }

  post (text) {
    const remain = getRemainingLength(text);
    const status = remain < 0 ? truncate(text, text.length + remain - 1) : text;
    return this.twit.post('statuses/update', { status }).then(result => result.data);
  }
};

module.exports = Twitter;
