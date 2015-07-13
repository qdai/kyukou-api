'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const config = require('config');
const connectMongo = require('connect-mongo');
const cookieParser = require('cookie-parser');
const createHttpError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');

const MongoStore = connectMongo(session);
const mongoURI = config.get('mongoURI');

// routes
const routes = require('./routes/index');
const apiStatus = require('./routes/status');
const rss = require('./routes/rss');
const calendar = require('./routes/calendar');
const api = require('./routes/api');
const api0 = require('./routes/api0');
const admin = require('./routes/admin');

const app = express();

// cron job
require('./cron');
// additional setting
app.set('x-powered-by', false);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(compression());
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// session for routes/admin
app.use(session({
  store: new MongoStore({
    url: mongoURI,
    autoReconnect: true,
    cookie: {}
  }),
  secret: config.get('secret'),
  resave: false,
  saveUninitialized: false
}));

// redirect to HTTPS on production
if (app.get('env') === 'production') {
  app.use(function (req, res, next) {
    res.set('strict-transport-security', 'max-age=63072000');
    if (req.headers['x-forwarded-proto'] === 'http') {
      res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    } else {
      next();
    }
  });
}
app.use('/', routes);
app.use('/status', apiStatus);
app.use('/rss', rss);
app.use('/calendar', calendar);
app.use('/api/1', api);
app.use('/api', api0);
app.use('/admin', admin);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createHttpError(404));
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
    res.status(err.status || 500).type('text/plain').send(err.stack);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500).type('text/plain').send(err.message);
});

module.exports = app;
