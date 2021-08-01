var createError = require('http-errors');
var express = require('express');
var hbs = require('express-handlebars')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./config/connection')
var session = require('express-session')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
var eventRouter = require('./routes/event_owner');
var theaterRouter = require('./routes/theater_owner');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'key',cookie:{maxAge:604800000},resave:true,saveUninitialized:false}))
db.connect((err)=>{
  if(err){
    console.log("mongo not connected")
  }else{
    console.log('mongo connected');
  }
})
app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('/event-management', eventRouter);
app.use('/theater-management', theaterRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
