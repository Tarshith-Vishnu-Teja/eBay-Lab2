
/*
 * GET users listing.
 */
var mysql = require('./mysql');
var ejs = require("ejs");
var cryptoJS = require("crypto-js");
var hashPW = require('./hashPW');
var fileSystem = require('file-system');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebay";
var mq_client = require('../rpc/client');
var passport = require('passport');
//---------------------------------------------------INITIAL SIGN IN AND REGISTER REQUESTS-----------------------------

exports.signInRequest = function(req, res, next) {
	  passport.authenticate('signInRequest', function(err, user, info) {
		    if(err) {
		      return next(err);
		    }
		    if(!user) {
		    	console.log("session initilized user = " + user.email_id);
		    	return res.redirect('/');
		    }
		    req.logIn(user, {session:false}, function(err) {
		      if(err) {
		        return next(err);
		      }
		      
		      req.session.email_id = user.email_id;
              req.session.cart = [];
              req.session.totalPrice = 0;
              req.session.userDetails = user;
		      console.log("session initilized = " + req.session.email_id);
		      return res.render('userHome', {user:user});
		    });
	})(req, res, next);
};

exports.signUpRequest = function(req, res){
    var date = new Date();

	var firstname = req.body.jsonDetails.firstname;
	var lastname = req.body.jsonDetails.lastname;
	var dateOfBirth = req.body.jsonDetails.dateOfBirth;
	var registerEmail = req.body.jsonDetails.registerEmail;
	var registerPassword = req.body.jsonDetails.registerPassword;
	var reenterRegisterEmail = req.body.jsonDetails.reenterRegisterEmail;
	var phoneNumber = req.body.jsonDetails.phoneNumber;
	var location = req.body.jsonDetails.location;
	
	var encryptedPW = hashPW.encryptPW(registerPassword);
	
	var msg_payload = { 
			"firstname" : firstname,
            "lastname" : lastname,
            "email_id" : registerEmail,
            "password" : encryptedPW,
            "phoneNumber" : phoneNumber,
            "dateOfBirth" : dateOfBirth,
            "location" : location,
            "last_logged_in" : ""
     };
	
	console.log("In POST Request = Register Email:"+ registerEmail);
	mq_client.make_request('signup_queue',msg_payload, function(err,results){
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 403){
				res.send({
                    "statusCode" : "403"
                });
			}
			else if(results.code == 200) {    
				 res.send({
	                    "status" : "validLogin",
	                    "statusCode" : "200"
	             });
			}
		}  
	});
};	
//------------------------------------------------END OF INITIAL SIGN IN AND REGISTER REQUESTS-----------------------------



//--------------------------------------LOADING PAGES------------------------------------

exports.loadHome = function(req, res){
    var date = new Date();
	if(req.session.email_id){
        fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Requested Home Page at ' + date + '\n\n', function(err){
            console.log("Failed to Write into File!");
        });
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('userHome');
	}
	else res.render('signUp', { title: 'Ebay Sign Up' });
};

exports.loadProfile = function(req, res){
    var date = new Date();
	if(req.session.email_id){
        fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Requested Profile Page at ' + date + '\n\n', function(err){
            console.log("Failed to Write into File!");
        });
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('userProfile');	           
	}
	else res.render('signUp', { title: 'Ebay Sign Up' });
};

exports.shoppingCart = function(req, res){
    var date = new Date();
	if(req.session.email_id){
        fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Requested Shopping Cart Page at ' + date + '\n\n', function(err){
            console.log("Failed to Write into File!");
        });
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('shoppingCart');
	}
	else res.render('signUp', { title: 'Ebay Sign Up' });
};

exports.checkOut = function(req, res){
    var date = new Date();
    if(req.session.email_id){
        fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Requested Check Out Page at ' + date + '\n\n', function(err){
            console.log("Failed to Write into File!");
        });
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
       res.render('creditCardValidation');	
    }
    else res.render('signUp', { title: 'Ebay Sign Up' });
}

//-----------------------------------END OF LOADING PAGES-------------------------------------

//-----------------------------------------GET DETAILS FOR PAGES-------------------------------
exports.getDetails = function(req, res){
    var date = new Date();
    var user_id;
    var msg_payload = {
    		"email_id" : req.session.email_id,
    		"date" : date
    }
    console.log("In POST Request = get details for Email:"+ req.session.email_id);
	mq_client.make_request('getDetails_queue',msg_payload, function(err,results){
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 403){
				res.send({
					 "statusCode" : 403,
		              "error" : "Empty DB Response"
                });
			}
			else if(results.code == 200) {    
				 res.send({
					 "statusCode" : 200,
		              "firstname" : results.firstname,
		              "dateOfBirth" : results.dateOfBirth,
		              "phoneNumber" : results.phoneNumber,
		              "location" : results.location,
		              "rows" : results.rows,
		              "totalPrice" : req.session.totalPrice
	             });
			}
		}  
	});
}

exports.getAds = function(req, res){
    var date = new Date();
    var msg_payload = {
    		"email_id" : req.session.email_id,
    		"date" : date
    }
    mq_client.make_request('getAds_queue',msg_payload, function(err,results){
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 403){
				res.send({
					 "statusCode" : 403,
		              "error" : "Empty DB Response"
                });
			}
			else if(results.code == 200) {    
				res.send({ 
                    "statusCode" : 200,
                    "rows" : results.rows
                });
			}
		}  
	});
};

exports.getMySellingItems = function(req, res){
    var date = new Date();
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date
    }

    mq_client.make_request('getMySellingItems_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                      "error" : "Empty DB Response"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "firstname" : req.session.userDetails.firstname,
                    "dateOfBirth" : req.session.userDetails.dateOfBirth,
                    "phoneNumber" : req.session.userDetails.phoneNumber,
                    "location" : req.session.userDetails.location,
                    "rows" : results.rows
                });
            }
        }  
    });
}

exports.getItemsInCart = function(req, res){
    var date = new Date();
    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Requested for Items In Cart at ' + date +'\n\n', function(err){
        console.log("Failed to Write into File!");
    });
    res.send({
        "statusCode" : 200,
        "itemsInCart" : req.session.cart,
        "totalPriceOfItemsInCart" : req.session.totalPrice
    })
};

exports.getBidders = function(req, res){
    var date = new Date();
    var typeOfPriceTag = req.body.typeOfPriceTag;
    var itemName = req.body.itemName;
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date,
        "itemName" : itemName
    }

    mq_client.make_request('getBidders_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "No Bidders Yet!"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "bidders" : results.rows
                });
            }
        }  
    });
}

exports.showMyPurchases = function(req, res){
    var date = new Date();
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date
    }

    mq_client.make_request('showMyPurchases_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "Empty DB Response"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "myPurchases" : results.rows
                });
            }
        }  
    });
};

exports.showMyBids = function(req, res){
    var date = new Date();
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date
    }
    mq_client.make_request('showMyBids_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "Empty DB Response"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "myBids" : results.rows
                });
            }
        }  
    });
}

exports.showMySales = function(req, res){
    var date = new Date();
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date
    }

    mq_client.make_request('showMySales_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "Empty DB Response"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "mySales" : results.rows
                });
            }
        }  
    });
}
//-----------------------------------------END OF GET DETAILS FOR PAGES-------------------------------


//---------------------------------------------------SELL, ADD TO CART AND BUY---------------------------------
exports.sellItem = function(req, res){
    var date = new Date();
	var itemQuantity = req.body.itemQuantity;
	var itemName = req.body.itemName;
	var itemDescription = req.body.itemDescription;
	var durationFP = req.body.durationFP;
	var durationAP = req.body.durationAP;
	
    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date,
        "PriceTagType" : req.body.PriceTagType,
        "email_id" : req.session.email_id,
        "item_name" : itemName,
        "item_description" : itemDescription,
        "type_of_price_tag" : req.body.PriceTagType,
        "durationFP" : durationFP,
        "fixedPrice" : req.body.fixedPrice,
        "durationAP" : durationAP,
        "auctionPrice" : req.body.auctionPrice,
        "item_quantity" : itemQuantity,
        "firstname" : req.session.userDetails.firstname,
        "lastname" : req.session.userDetails.lastname,
        "phoneNumber" : req.session.userDetails.phoneNumber,
        "location" : req.session.userDetails.location
    }

    mq_client.make_request('sellItem_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "Empty DB Response"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200,
                    "rows" : results.rows
                });
            }
        }  
    });
}

exports.addToCart = function(req, res){
    var date = new Date();
    var sellerFirstname = req.body.sellerFirstname;
    var sellerEmailId = req.body.sellerEmailId;
    var productId = req.body.productId;
    var itemName = req.body.itemName;
    var userItemQuantity = req.body.userItemQuantity;
    var totalAvailableQuantity = req.body.totalAvailableQuantity;
    var itemDescription = req.body.itemDescription;
    var itemPrice = req.body.itemPrice;
    var typeOfPriceTag = req.body.typeOfPriceTag;

    req.session.totalPrice += Number(userItemQuantity) * Number(itemPrice);

    var msg_payload = {
        "sellerFirstname" : sellerFirstname,
        "sellerEmailId" : sellerEmailId,
        "productId" : productId,
        "itemName" : itemName,
        "userItemQuantity" : userItemQuantity,
        "totalAvailableQuantity" : totalAvailableQuantity,
        "itemDescription" : itemDescription,
        "itemPrice" : itemPrice,
        "email_id" : req.session.email_id,
        "date" : date,
        "cart" : req.session.cart
    }

    mq_client.make_request('addToCart_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 200) {    
            	req.session.cart = results.rows;
            	console.log("CART NOW IS = " + req.session.cart);
                res.send({ 
                    "statusCode" : 200,
                    "cart" : results.rows
                });
            }
        }  
    });
}

exports.placeBid = function(req, res){
    var date = new Date();
    var sellerFirstname = req.body.sellerFirstname;
    var sellerEmailId = req.body.sellerEmailId;
    var productId = req.body.productId;
    var itemName = req.body.itemName;
    var userItemQuantity = req.body.userItemQuantity;
    var totalAvailableQuantity = req.body.totalAvailableQuantity;
    var itemDescription = req.body.itemDescription;
    var itemPrice = req.body.itemPrice;
    var typeOfPriceTag = req.body.typeOfPriceTag;
    var biddingPrice = req.body.biddingPrice;

    var msg_payload = {
        "userItemQuantity" : userItemQuantity,
        "biddingPrice" : biddingPrice,
        "productId" : productId,
        "email_id" : req.session.email_id,
        "itemName" : itemName,
        "date" : date,
        "sellerEmailId" : sellerEmailId,
        "typeOfPriceTag" : typeOfPriceTag,
        "itemPrice" : itemPrice,
        "firstname" : req.session.userDetails.firstname,
        "lastname" : req.session.userDetails.firstname,
        "phoneNumber" : req.session.userDetails.phoneNumber,
        "location" : req.session.userDetails.location
     }

    mq_client.make_request('placeBid_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 401) {    
                res.send({ 
                    "statusCode" : 401,
                    "error" : "Enter all the Details Properly"
                });
            }
            else if(results.code == 402) {    
                res.send({ 
                    "statusCode" : 402,
                    "error" : "Place a Minimum Bid Value of " + itemPrice
                });
            }
            else if(results.code == 403){
                res.send({
                     "statusCode" : 403,
                     "error" : "Time Up! Sorry You Can't Bid Anymore, better Luck Next Time!"
                });
                console.log("response from DB Empty");
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200
                });
            }
        }  
    });
}

exports.removeItemFromCart = function(req,res){
    var date = new Date();
    var itemName = req.body.itemName;
    var userItemQuantity = req.body.userItemQuantity;
    var itemPrice = req.body.itemPrice;

    var msg_payload = {
        "date" : date,
        "itemName" : req.body.itemName,
        "userItemQuantity" : req.body.userItemQuantity,
        "itemPrice" : req.body.itemPrice,
        "email_id" : req.session.email_id,
        "totalPrice" : req.session.totalPrice,
        "cart" : req.session.cart
    }

    mq_client.make_request('removeItemFromCart_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 200) {    
            	req.session.cart = results.rows;
            	req.session.totalPrice = results.totalPrice; 
                res.send({ 
                    "statusCode" : 200,
                    "itemsInCart" : results.rows,
                    "totalPriceOfItemsInCart" : results.totalPrice
                });
            }
        }  
    });
}

exports.validate = function(req,res){
    var date = new Date();
    var ccNumber = req.body.ccNumber;
    var date = req.body.date;
    var cvv = req.body.cvv;
    
    var enteredDate = "";
    var enteredMonth = "";
    var enteredYear = "";

    var todaysFullDate = new Date();
    var currentMonth = todaysFullDate.getMonth() + 1;
    var currentDate = todaysFullDate.getDate();
    var currentYear = todaysFullDate.getFullYear();
    var dateStatus = "";

    var msg_payload = {
        "ccNumber" : ccNumber,
        "cvv" : cvv,
        "enteredDate" : enteredDate,
        "enteredMonth" : enteredMonth,
        "enteredYear" : enteredYear,
        "currentMonth" : currentMonth,
        "currentDate" : currentDate,
        "currentYear" : currentYear,
        "dateStatus" : dateStatus,
        "email_id" : req.session.email_id,
        "date" : date,
    }

    mq_client.make_request('validate_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){
                console.log("invalid Login");
                
                res.send({
                     "statusCode" : results.status
                });
            }
            else if(results.code == 200) {    
                res.send({ 
                    "statusCode" : 200
                });
            }
        }  
    });
}

exports.buyItem = function(req, res){
    var date = new Date();
    console.log("Recieved following from the client: " + JSON.stringify(req.body.billingInfo));
    var billingInfo = req.body.billingInfo;
    var billingAddress = billingInfo.streetAddress.concat(", ", billingInfo.city,", ", billingInfo.state,", ", billingInfo.country,", ", billingInfo.zip);
    console.log("Stroing address as = " + billingAddress);

    var msg_payload = {
        "email_id" : req.session.email_id,
        "date" : date,
        "billingInfo" : billingInfo,
        "billingAddress" : billingAddress,
        "cart" : req.session.cart,
        "totalPrice" : req.session.totalPrice
    }

    mq_client.make_request('buyItem_queue',msg_payload, function(err,results){
        console.log(results);
        if(err){
            throw err;
        }
        else 
        {
            if(results.code == 403){                
                res.send({
                    "statusCode" : 403,
                    "error" : "Billing Information is not complete"
                });
            }
            else if(results.code == 200) {    
            	req.session.cart = [];
                req.session.totalPrice = 0;
                res.send({ 
                    "statusCode" : 200
                });
            }
        }  
    });
};

//---------------------------------------------------END OF SELL, ADD TO CART AND BUY---------------------------------

exports.logOut = function(req, res){
    var date = new Date();
    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + req.session.email_id + ' Clicked Button ID: logOut and was logged out of the session at ' + date + '\n\n\n\n\n', function(err){
        console.log("Failed to Write into File!");
    });
	req.session.destroy();
	res.redirect('/');
};