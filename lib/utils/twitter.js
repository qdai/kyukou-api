'use strict';

const Twit = require('twit');
const truncate = require('truncate');
const twitterText = require('twitter-text');

const getRemainingLength = text => {
  const length = twitterText.parseTweet(text).weightedLength;
  const maxLength = twitterText.configs.defaults.maxWeightedTweetLength;
  return maxLength - length;
};

const Twitter = class {
  constructor (config) {
    this.twit = new Twit(config);
  }

  async post (text) {
    const remain = getRemainingLength(text);
    const status = remain < 0 ? truncate(text, text.length + remain - 2) : text;
    const { data } = await this.twit.post('statuses/update', { status });
    return data;
  }
};

module.exports = Twitter;
