'use strict';

module.exports = function (getPromise, res) {
  getPromise.then(function (data) {
    res.json(data);
  }).catch(function (err) {
    res.status(err.status || 500).json({
      error: {
        message: err.message
      }
    });
  });
};
