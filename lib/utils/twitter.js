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
    return new Promise((resolve, reject) => {
      this.twit.post('statuses/update', { status: text }, (err, data, res) => {
        /* istanbul ignore else */
        if (!err && res.statusCode === 200) {
          resolve(data);
        } else {
          reject(err || new Error(`status code: ${res.statusCode}`));
        }
      });
    });
  }
};

module.exports = Twitter;
