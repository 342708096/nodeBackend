const User = require('./mongo.js').User;
const Token = require('./mongo.js').Token;
const _net = require('./utils/net.js');
const crypto = require('crypto');

exports.setup = function (server) {
    server.add_post('/api/login', login);
    function login(req, res, next) {
        let loginInfo = {};
        loginInfo.username = req.body.username;
        loginInfo.password = req.body.password;
        loginInfo.browser = req.body.browser;
        loginInfo.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        //check the correctness of login info.
        User.findOne({username: loginInfo.username}).exec().then(
            function (user) {
                if (user && user.password === loginInfo.password) {
                    //refresh its token
                    Token.findOne({username: loginInfo.username}).then(
                        function () {
                            let token = {};
                            token.token = crypto.createHash('md5').update(Date.now() + 'sa' + user.username + 'lt').digest('hex');
                            token.username = loginInfo.username;
                            token.signTime = new Date();
                            token.ipAddress = loginInfo.ipAddress;
                            token.browser = loginInfo.browser;
                            Token.update({username: token.username}, token, {upsert: true}).exec();
                            User.update({username: token.username}, {$set: {lastLogin: token.signTime}}).exec();
                            //return new token
                            _net.responseObj(res, {status: 'OK'}, token.token);
                            return next();
                        },
                        function (error) {
                            return next(error);
                        }
                    );
                }
                _net.responseError(res, "Authentication Failed!", 401);
                return next(null, false);
            },
            function (error) {
                return next(error);
            });
    }


    server.add_get('/api/logout', logout);
    function logout(req, res, next) {
        const token = req.query.token;
        Token.findOne({token: token}).exec().then(
            function () {
                Token.remove({token: token}).exec();
                _net.responseText(res, {status: 'OK'}, "You have been logout!");
                return next();
            },
            function (error) {
                return next(error);
            }
        );
    }
};