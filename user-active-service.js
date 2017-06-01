const User = require('./mongo.js').User;
const LostAndFound = require('./mongo.js').LostAndFound;
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');
// const base_folder = require('path').basename(__dirname);

const createUser = function (user) {
    return User.create(user).exec();
};

exports.setup = function (server) {
    server.add_put('/api/user/:user', function (req, res, next) {
        _net.responseObj(res, {error: ''});
        return next();

        //_verify.tokenVerify(req);
        var user = req.body;
        if (user && user.username && user.nickname && username == user.username) {
            return User.findOne({username: user.username}).then(function (result) {
                if (!result) {
                    user.priv = 1;
                    return createUser(user).then(function () {
                        _net.responseObj(res, {error: ''});
                        return next();
                    }, function(err) {
                        _net.responseError(res, "User creation failed!", 500);
                        return next();
                    });
                } else {
                    _net.responseError(res, "User already exists!", 409)
                    return next();
                }
            });
        } else {
          _net.responseError(res, "Invalid input!", 400)
          return next();
        }
    }, 'Set data of a user');

    server.add_put('/api/user/:user/nickName/:nickName', function (req, res, next) {
        //_verify.tokenVerify(req);
        var nickName = req.params.nickName;
        if (nickName) {
            User.update({username: operator}, {$set: {nickname: nickName}}).exec().then(
                function () {
                    _net.responseObj(res, {error: ''});
                },
                function (error) {
                    _net.responseError(res, "Fail to change nick name!", 500);
                }
            );
        } else {
            console.log("Operator user: " + operatorName + " not found!");
            _net.responseError(res, "Operator not found!", 404);
        }
        return next();
    }, 'Update the nickname of a user');
  
  
    server.add_get('/api/login/:user/:password', function(req, res, next) {
      _net.responseObj(res, {error: "", token: "UKDFJOE382SFHHFV653AJF2319EK"});
      return next();
      
    }, 'Login with user and password');

    server.add_put('/api/user/:user/avatar', function (req, res, next) {
        //_verify.tokenVerify(req);
        var base64Png = req.body;
        if (operatorName && base64Png) {
            User.update({username: operatorName}, {$set: {avatar: base64Png}}).exec().then(
                function () {
                    _net.responseObj(res, {error: ''});
                },
                function (error) {
                    console.log("Change avatar failed with error:" + error);
                    _net.responseError(res, "Fail to update avatar!", 500);
                }
            );
        } else {
            console.log("Operator user: " + operatorName + " not found!");
            _net.responseError(res, "Operator not found!", 404);
        }
        return next();
    }, 'Change avatar of a user');

    server.add_get('/api/sendcode/:phoneNumber', function (req, res, next) {
        var phone = req.params.phoneNumber;
      
        if (phone.length == 11) {
          var code = Math.random().toString().slice(-6);
          return LostAndFound.create({phone: phone, code: code, signTime: Date.now()}).exec().then(
              function () {
                  _net.responseObj(res, { error: ''});
                  return next();
              },
              function (error) {
                  console.log("Create verify code failed with error:" + error);
                  _net.responseError(res, "Fail to create verify code!", 500);
                  return next();
              }
          );
        } else {
          _net.responseError(res, "Invalid phone number", 400);
          return next();
        }
    }, 'Get verification code for changing password of a user');

    server.add_put('/api/user/:user/changePassword', function (req, res, next) {
        var username = req.params.user;
        var newPwd = req.body.pw;
        var code = req.body.code;
        if (username) {
            LostAndFound.findOne({username: username, code: code}).exec().then(
                function (record) {
                    if (record) {
                        User.update({username: username}, {$set: {password: newPwd}}).exec().then(
                            function () {
                                LostAndFound.remove({username: username}).exec();
                                _net.responseObj(res, {error: ''});
                            },
                            function (error) {
                                console.log("Change password failed with error:" + error);
                                _net.responseError(res, "Fail to change password!", 500);
                            }
                        );
                    } else {
                        _net.responseError(res, "Verification code not found!", 404);
                    }
                },
                function (error) {
                    console.log("Change password failed with error:" + error);
                    _net.responseError(res, "Fail to change password!", 500);
                }
            );
        } else {
            console.log("Operator user: " + username + " not found!");
            _net.responseError(res, "Operator not found!", 404);
        }
        return next();
    }, 'Change password of a user');

    server.add_put('/api/user/:user/weChat', function (req, res, next) {
        const operatorName = _verify.tokenVerify(req);
        const weChatToken = req.body.weChatToken;
        if (operatorName && weChatToken) {
            User.update({username: operatorName}, {$set: {weChatToken: weChatToken}}).exec().then(
                function () {
                    _net.responseObj(res, {error: ''});
                },
                function (error) {
                    console.log("link weChat failed with error:" + error);
                    _net.responseError(res, "Fail to link weChat!", 500);
                }
            );
        } else {
            console.log("Operator user: " + operatorName + " not found!");
            _net.responseError(res, "Operator not found!", 404);
        }
        return next();
    }, 'Link a user with WeChat');

    server.add_put('/api/user/:user/weibo', function (req, res, next) {
        //_verify.tokenVerify(req);
        const weboToken = req.body.weboToken;
        if (operatorName && weChatToken) {
            User.update({username: operatorName}, {$set: {weboToken: weboToken}}).exec().then(
                function () {
                    _net.responseObj(res, {error: ''});
                },
                function (error) {
                    console.log("link weibo failed with error:" + error);
                    _net.responseError(res, "Fail to link weibo!", 500);
                }
            );
        } else {
            console.log("Operator user: " + operatorName + " not found!");
            _net.responseError(res, "Operator not found!", 404);
        }
        return next();
    }, 'Link a user with weibo');

    server.add_get('/api/user/:user', function (req, res, next) {
        _net.responseObj(res, { "username": "18600028197", "nickname": "xiaoming", "avatar": "img3", "info": "此人没有介绍" });
        return next();

        //_verify.tokenVerify(req);
        const userName = req.params.user;
        return User.findOne({username: userName}).then(
            function (target) {
                if (target) { // && target.priv < operator.priv
                    delete target.password;
                    _net.responseObj(res, target);
                } else {
                    _net.responseError(res, "User not found!", 404);
                }
                return next();
            });
    }, 'Get a user');
};

