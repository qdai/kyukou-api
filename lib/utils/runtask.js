'use strict';

/**
 * @param {string} log - log message
 * @return {number} log level
 * level:
 *   msg: 1
 *   inf: 2
 *   wrn: 3
 *   err: 4
 */
const logLevel = log =>
  [/inf: /, /wrn: /, /err: /].map(regexp => regexp.test(log)).indexOf(true) + 2;

const runTask = fn => {
  const time = new Date();
  const hrtime = process.hrtime();
  return fn().catch(err => {
    return `err: ${err.stack}`;
  }).then(result => {
    const diff = process.hrtime(hrtime);
    const log = {
      elapsedTime: (diff[0] * 1e3) + (diff[1] * 1e-6),
      level: logLevel(result),
      log: result,
      time
    };
    return log;
  });
};

module.exports = runTask;
