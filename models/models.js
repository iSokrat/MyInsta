/**
 * Created by Ura on 23.11.2015.
 */

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new mongoose.Schema({
    username: String,
    password: String
});

var User = new mongoose.Schema({
    username: String,
    name:String,
    surname:String,
    pathToAvatar:String
});

var Images = new mongoose.Schema({
    username:String,
    path:String,
    dateAdded:Date
});

var Subscribtion = new mongoose.Schema({
    username:String,
    toUsername:String
});

Account.plugin(passportLocalMongoose);

module.exports = {
    Account: mongoose.model('accounts', Account),
    Users:  mongoose.model('users', User),
    Images: mongoose.model('images',Images),
    Subscribtion: mongoose.model('subscribtions', Subscribtion)
};