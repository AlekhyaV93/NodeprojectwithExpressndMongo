var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose');//importing mongoose
const passport = require('passport');
const config = require('./config');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var campsiteRouter = require('./routes/campsiteRouter');
var promotionsRouter = require('./routes/promotionRouter');
var partnersRouter = require('./routes/partnerRouter');
var uploadRouter = require('./routes/uploadRouter');

const url = config.mongoURL;//setting the connection string 

var app = express();

app.all('*',(req,res,next)=>{
  if(req.secure){
    return next();
  }else{
    console.log(`Redirecting the request to https://${req.hostname}:${app.get('securePort')}${req.url}`);
    res.redirect(301,`https://${req.hostname}:${app.get('securePort')}${req.url}`);
  }
})

//connecting to mongoDb by passing the connection string
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(console.log('Connected to the server'),err=>{
  console.log(err);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize());//using passport middleware

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionsRouter);
app.use('/partners', partnersRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
