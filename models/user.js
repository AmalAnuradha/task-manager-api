var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config');

var UserSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    mobile: String,
    password: String,
    email: {type: String, unique: true, required: true},
    profile: String, 
    cover: String,
    emailVerified: { type : Boolean, default: true },
    emailVerifiedAt: { type : Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, 8);
    next();
});

UserSchema.methods.validatePassword = function (password) {
    if(password){
        return bcrypt.compareSync(password, this.password);
    }    
}

UserSchema.methods.tokenizedUser = function () {
    let token = jwt.sign({ id: this._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });     
    let newuser = this.toObject();
    newuser.token = token
    return newuser;
}

var user = mongoose.model('user', UserSchema);
module.exports = user;
