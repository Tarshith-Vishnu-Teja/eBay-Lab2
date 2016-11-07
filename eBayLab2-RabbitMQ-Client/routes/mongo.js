/*var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;

/**
 * Connects to the MongoDB Database with the provided URL
 
exports.connect = function(url, callback){
    MongoClient.connect(url, function(err, _db){
      if (err) { throw new Error('Could not connect: '+err); }
      db = _db;
      connected = true;
      console.log(connected +" is connected?");
      callback(db);
    });
};

/**
 * Returns the collection on the selected database
 
exports.collection = function(name){
    if (!connected) {
      throw new Error('Must connect to Mongo before calling "collection"');
    } 
    return db.collection(name);
  
};*/

var MongoClient = require('mongodb').MongoClient;
var db;
var db2;
var connected = false;
var url = "mongodb://localhost:27017/ebay";

/**
 * Connects to the MongoDB Database with the provided URL
 */
exports.connectEbay = function(callback){
	var option = {
			  db:{
			    numberOfRetries : 5
			  },
			  server: {
			    auto_reconnect: true,
			    poolSize : 5000,
			    socketOptions: {
			        connectTimeoutMS: 5000
			    }
			  },
			  replSet: {},
			  mongos: {}
			};
	MongoClient.connect(url,option, function(err,_db2){
		db2=_db2;
		if (err){
			throw new Error('could not connect'+err);
		}
		console.log(db2);
		callback(db2);
	});
};

exports.connect = function(url, callback){
    MongoClient.connect(url, function(err, _db){
      if (err) { throw new Error('Could not connect: '+err); }
      db = _db;
      connected = true;
      console.log(connected +" is connected?");
      callback(db);
    });
};


/**
 * Returns the collection on the selected database
 */
exports.collection = function(name){
    if (!connected) {
      throw new Error('Must connect to Mongo before calling "collection"');
    } 
    return db.collection(name);
  
};