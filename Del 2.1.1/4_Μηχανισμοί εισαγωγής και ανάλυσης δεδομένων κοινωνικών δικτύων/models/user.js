var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var findOrCreate = require('mongoose-findorcreate');

//Build User Schema
var User = new Schema({
    password: String,
    created: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    //We will work to hash the Twitter credentials
    twitter:{
      consumerKey: String,
      consumerSecret: String, 
      accessToken: String,
      accessSecret: String
    },
    stripeToken: Schema.Types.Mixed ,
    resetPasswordToken: String,
    resetPasswordExpires: Date
,});

User.plugin(findOrCreate);

//Hash user password
User.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

User.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

//Asset function to find user by id
User.statics.findProfileById = function(id, fields, callback) {
    var User = this;
    return User.findById(id, fields, function(err, obj) {
        if (err) return callback(err);
        if (!obj) return callback(new Error('User is not found'));
        callback(null, obj);
    });
}

//Asset function to find users by params
User.statics.findUsersByParams = function(params, fields, callback) {
    var User = this;
    var searchObj = {};
    if (Object.keys(params).length > 0) {
        searchObj = {
            $or: []
        };
        if (params.hasOwnProperty('email')) {
            searchObj.$or.push({
                email: {
                    $regex: params.email,
                    $options: "$i"
                }
            })
        } else if (hasOwnProperty('displayName')) {
            searchObj.$or.push({
                email: {
                    $regex: params.displayName,
                    $options: "$i"
                }
            })
        }
    }
    return User.find(searchObj, fields, function(err, obj) {
        if (err) return callback(err);
        if (!obj) return callback(new Error('No User found'));
        callback(null, obj);
    });
}

module.exports = User;