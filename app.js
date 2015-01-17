var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

var config = require('./settings/config');
var site = require('./settings/site.js');

// db setting
require('./db/event');
require('./db/tasklog');
mongoose.connect(config.mongoURI);
mongoose.connection.once('open', function () {
  console.log('Mongoose connected');
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connect failed');
  console.log(err);
  process.exit(1);
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected');
    process.exit(0);
  });
});

// routes
var routes = require('./routes/index');
var apiStatus = require('./routes/status');
var rss = require('./routes/rss');
var api = require('./routes/api');
var api0 = require('./routes/api0');
var admin = require('./routes/admin');

var app = express();

// cron job
require('./cron');
// additional setting
app.set('x-powered-by', false);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// session for routes/admin
app.use(session({
  store: new MongoStore({
    url: config.mongoURI,
    autoReconnect: true,
    cookie: {}
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}));

// redirect to HTTPS on production
if (app.get('env') === 'production') {
  app.use(function (req, res, next) {
    if (req.headers['x-forwarded-proto'] === 'http') {
      // TODO: remove
      if (req.originalUrl === '/kyukou.appcache') {
        res.set('Content-Type', 'text/cache-manifest; charset=UTF-8');
        return res.status(410).send('CACHE MANIFEST\n'
                                  + '\n'
                                  + 'NETWORK:\n'
                                  + '*\n');
      }
      // end TODO
      res.set('strict-transport-security', 'max-age=63072000');
      res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    } else {
      res.set('strict-transport-security', 'max-age=63072000');
      next();
    }
  });
}
app.use('/', routes);
app.use('/status', apiStatus);
app.use('/rss', rss);
app.use('/api/1', function (req, res, next) {
  // TODO: remove
  res.set('access-control-allow-origin', 'http://' + site.url);
  next();
}, api);
app.use('/api', api0);
app.use('/admin', admin);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
