/**

 */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var cryptoJS = require("crypto-js");
var hashPW = require('./hashPW');
var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebay";
var mq_client = require('../rpc/client');

module.exports = function(passport) {
    passport.use('signInRequest', new LocalStrategy(function(username, password, done) {
        password = hashPW.encryptPW(password);
        var msg_payload = {
            "username" : username,
            "password" : password
        }
        process.nextTick(function(){
            mq_client.make_request('signin_queue',msg_payload, function(err,results){
                console.log(results);
                if(err){
                    throw err;
                }
                else 
                {
                    if(results.error){
                        return done(results.error);
                    }
                    if(!results.user) { 
                        return done(null, false);
                    }
                    if(results.user.password != password) {
                        done(null, false);
                    }
                    console.log(results.user.email_id);
                    done(null, results.user);
                }  
            });
        });
    }));
};


