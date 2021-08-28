var createError = require('http-errors');
var express = require('express');
var hbs = require('express-handlebars')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./config/connection')
var collections = require('./config/collection')
var session = require('express-session')
var handlebars = require('handlebars')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
var eventRouter = require('./routes/event_owner');
var theaterRouter = require('./routes/theater_owner');
var fileupload = require('express-fileupload')
var GitHubStrategy = require('passport-github').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout', partialsDir: __dirname + '/views/partials' }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'key', cookie: { maxAge: 604800000 }, resave: true, saveUninitialized: false }))
db.connect((err) => {
  if (err) {
    console.log("mongo not connected")
  } else {
    console.log('mongo connected');
  }
})
app.use(passport.initialize())
app.use(passport.session())

app.use(fileupload())
app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('/event-management', eventRouter);
app.use('/theater-management', theaterRouter);

// handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//   return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });


passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

// github authentication -----------------------------------         ----------------------------------->>

app.get('/auth/github',
  passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    req.session.userDetails = req.user
    req.session.userStatus = true
    if(req.session.paymentPage===true){
      res.redirect('/payment');
    }else{
      res.redirect('/');
    }

  });

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://mishabak.ml/auth/github/callback"
}, async function (accessToken, refreshToken, profile, cb) {
  var user = await db.get().collection(collections.USER_COLLECTION).findOne({ Auth_id: profile.id });
  if (!user) {
    var data = await db.get().collection(collections.USER_COLLECTION).insertOne({ Auth_id: profile.id, Name: profile.username, Email: '', phone: '', Phone: '' })
    user = data.ops[0];
  }
  cb(null, user);
}
));


// app.get('/theater-management/auth/github',
//   passport.authenticate('github')
// );
// app.get('/theater-management/auth/github/callback',
//   passport.authenticate('github',{ failureRedirect: '/theater-management/email-login' }),
//   function (req, res) {
//     req.session.theaterDetails = req.user
//     req.session.theaterStatus = true
//     res.redirect('/theater-management');
//   });


// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_OWNERS_ID,
//   clientSecret: process.env.GITHUB_OWNERS_SECRET,
//   callbackURL: "http://localhost:3000/theater-management/auth/github/callback"
// },
//   async function (accessToken, refreshToken, profile, cb) {
//     var user = await db.get().collection(collections.THEATER_COLLECTION).findOne({ Auth_id: profile.id });
//     if (!user) {
//       var data = await db.get().collection(collections.THEATER_COLLECTION).insertOne({
//         Auth_id: profile.id,
//         Owner_name: profile.username,
//         Theater_name: "",
//         Email: "",
//         phone: "",
//         Phone: "",
//         Terms_of_service: "on",
//         Confirm: "confirm",
//         Block: "block",
//       })
//       user = data.ops[0];
//     }
//     cb(null, user);
//   }
// ));
// google authentication --------------------------------------         -------------------------------->>

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', function (req, res, next) {
  passport.authenticate('google', function (err, user, info) {
    if (err) { return next(err); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      console.log(user);
      req.session.userDetails = user
      req.session.userStatus = true
      if(req.session.paymentPage===true){
        return res.redirect('/payment');
      }else{
        return res.redirect('/');
      }
      
    });
  })(req, res, next);
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://mishabak.ml/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    var user = await db.get().collection(collections.USER_COLLECTION).findOne({ Auth_id: profile.id });
    if (!user) {
      var data = await db.get().collection(collections.USER_COLLECTION).insertOne({ Auth_id: profile.id, Name: profile.displayName, Email: profile.emails[0].value, phone: '', Phone: '' })
      user = data.ops[0];
    }
    cb(null, user);
  }
));

// app.get('/theater-management/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }));

//   app.get('/theater-management/auth/google/callback', function (req, res, next) {
//     passport.authenticate('google', function (err, user, info) {
//       if (err) { return next(err); }
//       req.logIn(user, function (err) {
//         if (err) { return next(err); }
//         console.log(user);
//         req.session.theaterDetails = user
//         req.session.theaterStatus = true
//         return res.redirect('/theater-management');
//       });
//     })(req, res, next);
//   });


// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_OWNER_ID,
//     clientSecret: process.env.GOOGLE_OWNER_SECRET ,
//     callbackURL: "http://localhost:3000/theater-management/auth/google/callback"
//   },
//   async function(accessToken, refreshToken, profile, cb) {
//      var user = await db.get().collection(collections.THEATER_COLLECTION).findOne({ Auth_id: profile.id });
//     if (!user) {
//       var data = await db.get().collection(collections.THEATER_COLLECTION).insertOne({ 
//         Auth_id: profile.id,
//         Owner_name: profile.displayName,
//         Theater_name: "",
//         Email: profile.emails[0].value,
//         phone: "",
//         Phone: "",
//         Terms_of_service: "on",
//         Confirm: "confirm",
//         Block: "block",     
//        })
//       user = data.ops[0];
//     }
//     cb(null, user);
//   }
// ));




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
