'use strict';

const runTask = fn => {
  const time = new Date();
  const hrtime = process.hrtime();
  return fn().catch(err => {
    return `err: ${err.stack}`;
  }).then(result => {
    const diff = process.hrtime(hrtime);
    const log = {
      elapsedTime: (diff[0] * 1e3) + (diff[1] * 1e-6),
      level: 1,
      log: result,
      time
    };
    if (/err: /.test(log.log)) {
      log.level = 4;
    } else if (/wrn: /.test(log.log)) {
      log.level = 3;
    } else if (/inf: /.test(log.log)) {
      log.level = 2;
    }
    return log;
  });
};

module.exports = runTask;
