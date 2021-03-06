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
    role: Number,
    emailVerified: { type : Boolean, default: true },
    presence: { type : String, default: 'offline' },
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
    let token = jwt.sign({ 
        id: this._id, 
        "role": 
            this.role
          
    }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });     
    let newuser = this.toObject();
    newuser.token = token
    return newuser;
}

var user = mongoose.model('user', UserSchema);
module.exports = user;
