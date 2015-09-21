'use strict';

const finalhandler = require('finalhandler');
const http = require('http');
const path = require('path');
const serveStatic = require('serve-static');

const serve = serveStatic(path.resolve(__dirname, './task'));

module.exports = http.createServer((req, res) => {
  const done = finalhandler(req, res);
  serve(req, res, done);
});
