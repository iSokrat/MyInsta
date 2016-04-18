var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');
var path = require('path');
var mongoose = require('mongoose');
var flash = require('connect-flash');

const font_middleware = require("connect-fonts");
const opensans = require("connect-fonts-opensans");

var index = require('./routes/index');
var profile = require('./routes/profile');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
    secret: 'my secret word',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('node_modules'));
app.use(express.static('uploads'));
app.use(font_middleware.setup({
    fonts: [ opensans ],
    allow_origin: undefined,
    ua: "all",
    maxage: 24 * 60 * 60 * 1000 ,  // 1 day
    compress:true
}));

app.use('/', index);
app.use('/', profile);

// passport config
var Account = require('./models/models').Account;

passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//connection to DB
var db = mongoose.connect('mongodb://localhost/MyInsta').connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback () {
    console.log("Connected!");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
