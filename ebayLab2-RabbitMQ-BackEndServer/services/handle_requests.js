var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebay";
var fileSystem = require('file-system');
var cryptoJS = require("crypto-js");
var hashPW = require('./hashPW');

exports.signinRequests = function(msg_payload, callback){
	var res = {};	

	mongo.connect(mongoURL, function(){
	    console.log('Connected to mongo at: ' + mongoURL);
	    var loginCollection = mongo.collection('users');
	    loginCollection.findOne({email_id : msg_payload.username, password : msg_payload.password}, function(error, user) {
	    	res.error = error;
	    	res.user = user;
	    	callback(null, res);
	    })
	})
}

exports.signUpRequests = function(msg_payload, callback){
	var res = {};
	var date = new Date();	
	 mongo.connect(mongoURL, function(){
	        console.log('Connected to mongo at: ' + mongoURL);
	        var coll = mongo.collection('users');
		//Checking If the User Already Exists or Not
	    coll.findOne({email_id:msg_payload.email_id}, function(err, user){
	        if(user){
	            fileSystem.appendFile('public/myLogs/myLogs.txt', 'Existing User ' + msg_payload.email_id + ' tried to Sign Up at: ' + date + '\n\n', function(err){
	                console.log("Failed to Write into File!");
	            });
	            console.log("Already Exists");
	            res.code = "403";
	            callback(null, res);
	        } else {												//If User Does Not Exist, Create a New User
	            console.log("New Entry");
	            encryptedPW = hashPW.encryptPW(msg_payload.password);
	            coll.insert({
	                "firstname" : msg_payload.firstname,
	                "lastname" : msg_payload.lastname,
	                "email_id" : msg_payload.email_id,
	                "password" : encryptedPW,
	                "phoneNumber" : msg_payload.phoneNumber,
	                "dateOfBirth" : msg_payload.dateOfBirth,
	                "location" : msg_payload.location,
	                "last_logged_in" : ""
	            })
	            fileSystem.appendFile('public/myLogs/myLogs.txt', 'New User ' + msg_payload.email_id + ' Signed Up at: ' + date + '\n\n', function(err){
	                console.log("Failed to Write into File!");
	            });
	            res.code = "200";
	            callback(null,res);
	        }
	    })
	 })	
}

exports.getDetailsRequests = function(msg_payload, callback){
	var user_id;
	var res = {};
	
	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var coll = mongo.collection('users');
	    coll.findOne({email_id: msg_payload.email_id}, function(err, user){
	        if (user) {
	            console.log("location = " + user.location);
	            mongo.connect(mongoURL, function(){
	            	user_id = user._id;
	            	console.log("user_id = " + user_id);
                    console.log('Connected to mongo at: ' + mongoURL);
                    var userCol = mongo.collection('users');
                    userCol.update({"_id" : user_id}, {$set: {"last_logged_in" : msg_payload.date}}, function(err, user){
                        if (err) {
                            throw err;
                        } 
                        else {
                            console.log("Last Log In details Updation Successfull");
                        } 
                    })
                })
                res.code = "200";
	            res.firstname = user.firstname;
	            res.dateOfBirth = user.dateOfBirth;
	            res.phoneNumber = user.phoneNumber;
	            res.location = user.location;
	            res.rows = user;
	            callback(null, res);
	        }
	        else {
	            res.code = "403";
	            console.log("response from DB Empty");
	            callback(null, res);
	        }
	    });	    
    })
}

exports.getAdsRequests = function(msg_payload, callback){
	var res = {};
	
	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var sell_product_collection = mongo.collection('sell_product');
        sell_product_collection.find({"email_id" : {$ne : msg_payload.email_id}}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', 'Loaded All the Ads for ' + msg_payload.email_id + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
                callback(null, res);
            }
            else {
                res.code = "403";
                callback(null, res);
            }
        })
    });
}
exports.getMySellingItemsRequests = function(msg_payload, callback){
	var res = {};

	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var sell_product_collection = mongo.collection('sell_product');
        sell_product_collection.find({"email_id" : msg_payload.email_id}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: View My Advertisements at ' + msg_payload.date + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
            	callback(null, res);
            }
            else {
            	res.code = "403";
            	callback(null, res);
            }
        })
	});
}

exports.getBiddersRequests = function(msg_payload, callback){
	var res = {};

	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var sell_product_collection = mongo.collection('buy_product');
        sell_product_collection.find({"item_name" : msg_payload.itemName}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked on link ID: AllBids and Requested List of Bidders for Product ID: ' + msg_payload.productId + ' at ' + msg_payload.date + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
                callback(null, res);
            }
            else {
                res.code = "403";
                callback(null, res);
            }
        })
    });
}

exports.showMyPurchasesRequests = function(msg_payload, callback){
	var res = {};

	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var buy_product_collection = mongo.collection('buy_product');
        buy_product_collection.find({"buyer_email" : msg_payload.email_id}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: ViewMyPurchases at ' + msg_payload.date + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
                callback(null, res);
            }
            else {
                res.code = "403";
                callback(null, res);
            }
        })
    })
}

exports.showMyBidsRequests = function(msg_payload, callback){
	var res = {};

	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var buy_product_collection = mongo.collection('buy_product');
        console.log("msg_payload.email_id = " + msg_payload.email_id);
        buy_product_collection.find({"buyer_email" : msg_payload.email_id, "typeOfPriceTag" : "A"}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: ViewMyBids at ' + msg_payload.date + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
                console.log("user = "+ user);
                callback(null, res);

            }
            else {
                res.code = "403";
                callback(null, res);
            }
        })
    })
}

exports.showMySalesRequests = function(msg_payload, callback){
	var res = {};

	mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var buy_product_collection = mongo.collection('buy_product');
        buy_product_collection.find({"seller_email_id" : msg_payload.email_id}).toArray(function(err, user){
            if (user) {
                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: ViewMySales at ' + msg_payload.date + '\n\n', function(err){
                    console.log("Failed to Write into File!");
                });
                res.code = "200";
                res.rows = user;
                callback(null, res);
            }
            else {
                res.code = "403";
                callback(null, res);
            }
        })
    });
}

exports.sellItemRequests = function(msg_payload, callback){
	var res = {};

	if(msg_payload.PriceTagType == "F"){
		var fixedPrice = msg_payload.fixedPrice;
		
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var sell_product_collection = mongo.collection('sell_product');
            sell_product_collection.insert({
                "email_id" : msg_payload.email_id,
                "item_name" : msg_payload.item_name,
                "item_description" : msg_payload.item_description,
                "type_of_price_tag" : msg_payload.type_of_price_tag,
                "duration" : msg_payload.durationFP,
                "item_price" : msg_payload.fixedPrice,
                "item_quantity" : msg_payload.item_quantity,
                "firstname" : msg_payload.firstname,
                "lastname" : msg_payload.lastname,
                "phoneNumber" : msg_payload.phoneNumber,
                "location" : msg_payload.location
            });
            sell_product_collection.find({"email_id" :msg_payload.email_id}).toArray(function(err, user){
                if(user){
                    console.log("user = " + user);
                    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: SellItem and ' + msg_payload.item_name + ' was put for sale for Fixed Price of ' + msg_payload.fixedPrice + ' at ' + msg_payload.date + '\n\n', function(err){
                        console.log("Failed to Write into File!");
                    });
                    res.code = "200";
                    res.rows = user;
                    callback(null, res);
                }
                else {
                    res.code = "403";
                 	callback(null, res);
                }
            })
    	})
    }
	else if(msg_payload.PriceTagType == "A"){
		var auctionPrice = msg_payload.auctionPrice;
        var todaysDate = new Date();
        function addDays(theDate, days) {
            return new Date(theDate.getTime() + days*24*60*60*1000);
        }

        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var sell_product_collection = mongo.collection('sell_product');
            console.log("available till date = " + addDays(todaysDate, durationAP));
            sell_product_collection.insert({
                "email_id" : msg_payload.email_id,
                "item_name" : msg_payload.item_name,
                "item_description" : msg_payload.item_description,
                "type_of_price_tag" : msg_payload.type_of_price_tag,
                "duration" : msg_payload.durationAP,
                "item_price" : msg_payload.auctionPrice,
                "item_quantity" : msg_payload.item_quantity,
                "date_of_sale" : todaysDate,
                "available_till" : addDays(todaysDate, msg_payload.durationAP),
                "firstname" : msg_payload.firstname,
                "lastname" : msg_payload.lastname,
                "phoneNumber" : msg_payload.phoneNumber,
                "location" : msg_payload.location
            });
            sell_product_collection.find({"email_id" : msg_payload.email_id}).toArray(function(err, user){
                if(user){
                    console.log("user = " + user);
                    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: SellItem and ' + msg_payload.item_name + ' was put for sale for Fixed Price of ' + msg_payload.fixedPrice + ' at ' + msg_payload.date + '\n\n', function(err){
                        console.log("Failed to Write into File!");
                    });
                    res.code = "200";
                    res.rows = user;
                    callback(null, res);
                }
                else {
                    res.code = "403";
                    callback(null, res);
                }
            })
	   })
    }
}

exports.placeBidRequests = function(msg_payload, callback){
	var res = {};

	if(isNaN(msg_payload.userItemQuantity)){
    	console.log("User Quantity is not a number");
    	res.code = "401";
    	callback(null, res);
    }
    else if(isNaN(msg_payload.biddingPrice)){
    	res.code = "401";
    	callback(null, res);
    }
    else{
        mongo.connect(mongoURL, function(){
            console.log('Connected to mongo at: ' + mongoURL);
            var sell_product_collection = mongo.collection('sell_product');
            sell_product_collection.find({"_id": msg_payload.productId,"available_till" : {$gt:new Date()}}, function(err, user){
                if(user){
                    console.log("user = " + user)
                    console.log("biddingPrice = " + msg_payload.biddingPrice);
                    console.log("user.item_price" + user.item_price);
                   
                    mongo.connect(mongoURL, function(){
                        console.log('Connected to mongo at: ' + mongoURL);
                        var sell_product_collection = mongo.collection('sell_product');
                        
                        sell_product_collection.find({"_id": msg_payload.productId, "item_price" : {$lt: msg_payload.biddingPrice}}, function(err, results){
                            fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: placeBid and ' + msg_payload.itemName + ' with Product ID ' + msg_payload.productId + ' was bidded for a Price of ' + msg_payload.biddingPrice + ' at ' + msg_payload.date + '\n\n', function(err){
                                console.log("Failed to Write into File!");
                            });
                            if(results){
                                mongo.connect(mongoURL, function(){
                                    console.log('Connected to mongo at: ' + mongoURL);
                                    var sell_product_collection = mongo.collection('sell_product');
                                    sell_product_collection.update({"_id" : msg_payload.productId}, {$set : {"item_price" : msg_payload.biddingPrice}}, function(err, user){
                                        if (err) {
                                            throw err;
                                        } 
                                        else {
                                            console.log("Updation Successfull");
                                        } 
                                    })
                                    mongo.connect(mongoURL, function(){
                                        console.log('Connected to mongo at: ' + mongoURL);
                                        var buy_product_collection = mongo.collection('buy_product');
                                        buy_product_collection.insert({
                                            "product_id" : msg_payload.productId,
                                            "item_name" : msg_payload.itemName,
                                            "quantity_bought" : msg_payload.userItemQuantity,
                                            "buyer_email" : msg_payload.email_id,
                                            "seller_email_id" : msg_payload.sellerEmailId,
                                            "total_priceOfThisItem" : msg_payload.biddingPrice,
                                            "typeOfPriceTag" : msg_payload.typeOfPriceTag,
                                            "firstname" : msg_payload.firstname,
                                            "lastname" : msg_payload.firstname,
                                            "phoneNumber" : msg_payload.phoneNumber,
                                            "location" : msg_payload.location
                                        }, function(err,data){
                                            if (err) {
                                            throw err;
                                            } 
                                            else {
                                                console.log("Insertion Successfull");
												res.code = "200";
												callback(null, res);
                                            }
                                        })
                                    })
                                })
                            }
                            else{
                                fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: placeBid and ' + msg_payload.itemName + ' with Product ID ' + msg_payload.productId + ' and bid Failed at ' + msg_payload.date + '\n\n', function(err){
                                    console.log("Failed to Write into File!");
                                });
                                res.code = "402";
    							callback(null, res);
                            }
                        })
                    })
                }
                else {
                    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: placeBid and ' + msg_payload.itemName + ' with Product ID ' + msg_payload.productId + ' and bid Failed at ' + msg_payload.date + '\n\n', function(err){
                        console.log("Failed to Write into File!");
                    });
					res.code = "403";
    				callback(null, res);
                }
            })
        })
    }
}

exports.validateRequests = function(msg_payload, callback){
	var res = {};

	if(isNaN(msg_payload.ccNumber)){
        res.code = "403";
        res.status = "CCNWrong";
        callback(null, res);
    }
    else if(isNaN(msg_payload.cvv)){
    	res.code = "403";
    	res.status = "CVVWrong";
        callback(null, res);
    }
    else{   
        for(var i = 0; i < 4; i++){                 //extracting Year
            msg_payload.enteredYear += msg_payload.date[i];
        }
        for(var j = 5; j < 7; j++){                 //extracting Month
            msg_payload.enteredMonth += msg_payload.date[j];
        }
        for(var k = 8; k < 10; k++){                //extracting Date
            msg_payload.enteredDate += msg_payload.date[k];
        }
        if(msg_payload.enteredYear > msg_payload.currentYear){              
            msg_payload.dateStatus = "OK";
        }
        else if(msg_payload.enteredYear == msg_payload.currentYear){        // if year is same, we have to check for month next
            if(msg_payload.enteredMonth > msg_payload.currentMonth){
                msg_payload.dateStatus = "OK";
            }   
            else if(msg_payload.enteredMonth == msg_payload.currentMonth){  //if month is same we have to check for date next
                if(msg_payload.enteredDate > msg_payload.currentDate){
                    msg_payload.dateStatus = "OK";
                }
                else {
                    msg_payload.dateStatus = "NotOK";
                }
            }
            else{
                msg_payload.dateStatus = "NotOK";
            }
        }
        else{
            msg_payload.dateStatus = "NotOK";
        }
        if(msg_payload.ccNumber.length == 16 && msg_payload.cvv.length == 3 && msg_payload.dateStatus == "OK"){
            fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: validate and credit card was successfully validated at ' + msg_payload.date + '\n\n', function(err){
                console.log("Failed to Write into File!");
            });
            res.code = "200";
        	callback(null, res);
        }
        else if(ccNumber.length != 16){
            fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: validate and credit card validation failed at ' + msg_payload.date + '\n\n', function(err){
                console.log("Failed to Write into File!");
            });
            res.code = "403";
            res.status = "CCNWrong";
        	callback(null, res);
        }
        else if(cvv.length != 3){
            fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: validate and credit card validation failed at ' + msg_payload.date + '\n\n', function(err){
                console.log("Failed to Write into File!");
            });
            res.code = "403";
            res.status = "CCNWrong";
       		callback(null, res);
        }
        else {
            fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: validate and credit card validation failed at ' + msg_payload.date + '\n\n', function(err){
                console.log("Failed to Write into File!");
            });
            res.code = "403";
            res.status = "dateWrong";
      		callback(null, res);
        }
    }
}

exports.buyItemRequests = function(msg_payload, callback){
	var res = {};

	if(msg_payload.billingInfo.streetAddress == null || msg_payload.billingInfo.city == null || 
		msg_payload.billingInfo.state == null || msg_payload.billingInfo.country == null || 
		msg_payload.billingInfo.zip == null){

		res.code = "403";
		callback(null, res);
    }
    else{
    	console.log("product id inside buy item = " + msg_payload.cart[0].productId);
    	console.log("CART.LENGTH = " +msg_payload.cart.length);
    	for (var i = 0; i < msg_payload.cart.length; i++){
    		var productId = msg_payload.cart[i].productId;
    		var itemName = msg_payload.cart[i].itemName;
    		var userItemQuantity = msg_payload.cart[i].userItemQuantity;
    		var email_id = msg_payload.email_id;
    		var sellerEmailId = msg_payload.cart[i].sellerEmailId;
    		var total_priceOfThisItem = (Number(msg_payload.cart[i].itemPrice) * Number(msg_payload.cart[i].userItemQuantity));
    		
    		console.log("product id inside buy item = " + msg_payload.cart[i].productId);
            console.log("req.session.email_id = " + msg_payload.email_id);
            mongo.connect(mongoURL, function(){
                console.log('Connected to mongo at: ' + mongoURL);
                var buy_product_collection = mongo.collection('buy_product');
                buy_product_collection.insert({
                    "product_id" :productId ,
                    "item_name" : itemName,
                    "quantity_bought" : userItemQuantity,
                    "buyer_email" : email_id,
                    "seller_email_id" : sellerEmailId,
                    "total_priceOfThisItem" : total_priceOfThisItem,
                    "billingAddress" : msg_payload.billingAddress,
                    "type_of_price_tag" : 'F'
                })
            })
        }
    }

    for(var j = 0; j < msg_payload.cart.length; j++){
        var updateProductQuantity = msg_payload.cart[j].totalAvailableQuantity - msg_payload.cart[j].userItemQuantity;
        console.log("Updating Quantity:  " + updateProductQuantity);
        var updateProducts = "update ebay.sell_product set item_quantity ='" + updateProductQuantity + "' where product_id ='" + msg_payload.cart[j].productId + "' and email_id ='" + msg_payload.cart[j].sellerEmailId + "'";
        var productId = msg_payload.cart[j].productId;
    	var sellerEmailId = msg_payload.cart[j].sellerEmailId;
        
        mongo.connect(mongoURL, function(){
	        console.log('Connected to mongo at: ' + mongoURL);
	        var sell_product_collection = mongo.collection('sell_product');
	        sell_product_collection.update({"product_id" : productId, "email_id" : sellerEmailId}, {$set : {"item_quantity" : updateProductQuantity}}, function(err, user){
	            if (err) {
	                throw err;
	            } 
	            else {
	            	res.code = "200";
            		callback(null, res);
	            } 
	        })
	    })
    }
}

exports.addToCartRequests = function(msg_payload, callback){
	var res = {};

    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: addToCart and ' + msg_payload.itemName + ' with Product ID ' + msg_payload.productId + ' was added to cart at ' + msg_payload.date + '\n\n', function(err){
        console.log("Failed to Write into File!");
    });

    msg_payload.cart.push({
        "sellerFirstname" : msg_payload.sellerFirstname,
        "sellerEmailId" : msg_payload.sellerEmailId,
        "productId" : msg_payload.productId,
        "itemName" : msg_payload.itemName,
        "userItemQuantity" : msg_payload.userItemQuantity,
        "totalAvailableQuantity" : msg_payload.totalAvailableQuantity,
        "itemDescription" : msg_payload.itemDescription,
        "itemPrice" : msg_payload.itemPrice,
        "cartStatus" : "occupied"
    });
    res.code = "200";
    res.rows = msg_payload.cart;
    callback(null, res);
}

exports.removeItemFromCartRequests = function(msg_payload, callback){
	var res = {};	
	var i = 0;
    
    for (i = msg_payload.cart.length - 1; i >= 0; i--) {
        if (msg_payload.cart[i].itemName == msg_payload.itemName) {
            msg_payload.cart.splice(i, 1);
        }
    }
    msg_payload.totalPrice = msg_payload.totalPrice - (Number(msg_payload.userItemQuantity) * Number(msg_payload.itemPrice));
    fileSystem.appendFile('public/myLogs/myLogs.txt', '' + msg_payload.email_id + ' Clicked Button ID: removeItemFromCart and ' + msg_payload.itemName + ' and was removed from cart at ' + msg_payload.date + '\n\n', function(err){
        console.log("Failed to Write into File!");
    });
    res.code = "200";
    res.rows = msg_payload.cart;
    res.totalPrice = msg_payload.totalPrice;
    callback(null, res);
}


