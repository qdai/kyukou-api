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
    if (remain < 0) {
      text = truncate(text, text.length + remain - 1);
    }
    return this.twit.post('statuses/update', { status: text }).then(result => result.data);
  }
};

module.exports = Twitter;
