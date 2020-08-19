var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');//importing mongoose

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var campsiteRouter = require('./routes/campsiteRouter');
var promotionsRouter = require('./routes/promotionRouter');
var partnersRouter = require('./routes/partnerRouter');

const url = 'mongodb://localhost:27017/nucampsite';//setting the connection string 

var app = express();

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
app.use(cookieParser());

function auth(req,res,next){
  console.log(req.header);//logging request header
  const authHeader = req.headers.authorization;//obtaining authorization field value from request header
  //If authorization value is null, sending a 401 error and an input firm to enter credentials
  if(!authHeader){
    const err = new Error('You are not authenticated');
    res.setHeader('WWW-Autheticate','Basic');
    err.status=401;
    return next(err);
  }

  const auth = Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');//using buffer inbuilt function 
  const user = auth[0];
  const password = auth[1];
  //verifying the credentials
  if(user === 'admin' && password === 'password'){
    return next();
  }
  else{
    const err = new Error('You are not authenticated');
    res.setHeader('WWW-Autheticate','Basic');
    err.status=401;
    return next(err);
  }
}

app.use(auth);//using the above defined auth function
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionsRouter);
app.use('/partners', partnersRouter);

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
