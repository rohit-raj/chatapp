var express     = require('express');
var path        = require('path');
var logger      = require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
var config      = require("config");

var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

var chatHandler = require('./lib/chatHandler');
var index = require('./routes/index');

var app = express();
var http = require('http').createServer(app)
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionMiddleware = session({
    name: 'connecsid',
    secret: 'hashed',
    resave: false,
    saveUninitialized: true
});
app.use(sessionMiddleware); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

http.listen(config.get('port'), function () {
    console.log("server started http://localhost:" + config.get('port'));
});

io.use(function (socket, next) {
    sessionMiddleware(socket.request, {}, next);
}).on("connection", function (socket) {
    console.log("a user connected");
    var user = socket.request.session.passport.user;
    //if(socket.request.session.passport && socket.request.session.passport.user)


    socket.on('message', function (msg) {
        console.log('message: ' + msg);
        chatHandler.saveChat(msg, user, function (err, db) {
            //io.emit('message', msg);
        });
    });
    chatHandler.tailableChat(user, function (err, res) {
        socket.emit("message", res);
    });

    chatHandler.tailableUsers(user, function (err, res) {
        socket.emit("usernames", res);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
