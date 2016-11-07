
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var mongoSessionConnectURL = "mongodb://localhost:27017/ebay";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSession);
var mongo = require("./routes/mongo");
require('./routes/passport')(passport);

var app = express();

//view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// all environments
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(expressSession({
	secret: "CMPE273_passport",
	resave: false,
	saveUninitialized: false,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 6 * 1000,
	store: new mongoStore({
	    url: mongoSessionConnectURL
	  })
}));
app.use(app.router);
app.use(passport.initialize());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//GET Requests
app.get('/', routes.index);
app.get('/home', user.loadHome);
app.get('/profile', user.loadProfile);
app.get('/shoppingCart', user.shoppingCart);
app.get('/logOut', user.logOut);
app.get('/checkOut', user.checkOut);

//POST Requests
app.post('/signInRequest', user.signInRequest);
app.post('/signUpRequest', user.signUpRequest);
app.post('/getDetails', user.getDetails);
app.post('/sellItem', user.sellItem);
app.post('/getAds', user.getAds);
app.post('/getMySellingItems', user.getMySellingItems);
app.post('/addToCart', user.addToCart);
app.post('/getItemsInCart', user.getItemsInCart);
app.post('/removeItemFromCart', user.removeItemFromCart);
app.post('/validate', user.validate);
app.post('/buyItem', user.buyItem);
app.post('/showMyPurchases', user.showMyPurchases);
app.post('/showMySales', user.showMySales);
app.post("/placeBid", user.placeBid);
app.post('/getBidders', user.getBidders);
app.post('/showMyBids', user.showMyBids);

//catch 404 and forward to error handler
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
//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

mongo.connect(mongoSessionConnectURL, function(){
  console.log('Connected to mongo at: ' + mongoSessionConnectURL);
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });  
});
