'use strict';

const { TwitterApi } = require('twitter-api-v2');
const truncate = require('truncate');
const twitterText = require('twitter-text');

const getRemainingLength = text => {
  const length = twitterText.parseTweet(text).weightedLength;
  const maxLength = twitterText.configs.defaults.maxWeightedTweetLength;
  return maxLength - length;
};

const Twitter = class {
  constructor (config) {
    this.api = new TwitterApi({
      accessSecret: config.access_token_secret,
      accessToken: config.access_token,
      appKey: config.consumer_key,
      appSecret: config.consumer_secret
    });
  }

  async post (text) {
    const remain = getRemainingLength(text);
    const status = remain < 0 ? truncate(text, text.length + remain - 2) : text;
    const data = await this.api.v1.tweet(status);
    return data;
  }
};

module.exports = Twitter;
