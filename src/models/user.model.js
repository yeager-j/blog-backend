let mongoose = require('mongoose');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let config = require('../../config/config.json');

let userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    hash: {
        required: true,
        type: String
    },
    salt: {
        required: true,
        type: String
    },
    rank: {
        default: 2,
        type: Number
    },
    articles: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Article',
        default: []
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Comment',
        default: []
    },
    date_created: {
        default: Date.now(),
        type: Date
    },
    deleted: {
        default: false,
        type: Boolean
    }
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.checkPassword = function (password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        exp: parseInt(expiry.getTime() / 1000)
    }, config.secret_key);
};

module.exports = mongoose.model('User', userSchema);
