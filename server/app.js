var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//課程相關api
const courseRoutes = require('./routes/courseRoutes');
//主題相關api
const themeRoutes = require('./routes/themeRoutes');
const discussionRoutes=require('./routes/discussionRoutes')
const documentRoutes=require('./routes/documentRoute')
var learningRoutes=require('./routes/learning')
const progressRoutes=require('./routes/ progressRoutes')
const quizRoutes=require('./routes/quizRoutes')
const profolioRoutes=require('./routes/profolioRoutes')
var app = express();
const session=require('express-session')
const MongoStore=require('connect-mongo')
const {DBHOST,DBPORT,DBNAME}=require('./config/config')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const React = require('react');
const { BrowserRouter: Router, Route, Switch } = require('react-router-dom');
const sessionMiddleware=app.use(session({
  name:'sid',
  secret:'123',
  saveUninitialized:false,
  resave:true,
  store:MongoStore.create({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME} `
  }),
  cookie:{
      httpOnly:true,
      maxAge:60*1000*60
  }
}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/learning', learningRoutes);
app.use('/api', courseRoutes);
app.use('/api', themeRoutes);
app.use('/api', discussionRoutes);
app.use('/api',documentRoutes)
app.use('/api',progressRoutes)
app.use('/api',profolioRoutes)
app.use('/api',quizRoutes)
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
