const Token = require('../mongo.js').Token;
const BanList = require('../mongo.js').BanList;
const User = require('../mongo.js').User;

exports.tokenVerify = function tokenVerify(req) {
    var token = req.query.token;
    var ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return Token.findOne({token: token}).exec().then(
        function (tokenObj) {
            if (tokenObj && tokenObj.ipAddress === ipAddress) {
                return tokenObj.username;
            }
            return null;
        },
        function (error) {
            console.log("Verify token failed with error:" + error);
            return null;
        }
    );
};

exports.authority = function (req) {
    var token = req.query.token;
    var ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    let user = {};
    user.username = tokenVerify(token, ipAddress);
    return User.findOne({username: user.username}).exec().then(
        function (target) {
            if (target) {
                user.priv = target.priv;
                return user;
            }
            return null;
        },
        function (error) {
            console.log("Find user failed with error:" + error);
            return null;
        }
    );
};

exports.isBanned = function (username) {
    return BanList.findOne({username: username}).exec().then(
        function (banObj) {
            return banObj ? true : false;
        },
        function (error) {
            console.log("Check ban list failed with error:" + error);
            return true;
        }
    );
};