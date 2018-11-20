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
const logLevel = log => [
  /inf: /,
  /wrn: /,
  /err: /
].map(regexp => regexp.test(log)).lastIndexOf(true) + 2;

const runTask = async fn => {
  const time = new Date();
  const start = process.hrtime.bigint();
  const result = await fn().catch(err => `err: ${err.stack}`);
  const end = process.hrtime.bigint();
  const log = {
    elapsedTime: Number(end - start) * 1e-6,
    level: logLevel(result),
    log: result,
    time
  };
  return log;
};

module.exports = runTask;
