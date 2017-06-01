const User = require('./mongo.js').User;
const BanList = require('./mongo.js').BanList;
const Token = require('./mongo.js').Token;
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');

const banUser = function (operator, bannedUser, banDays, reason, res) {
    if (operator.priv > 1 && bannedUser.priv < operator.priv) {
        if (banDays.isInteger() && banDays > 0) {
            const releaseDate = new Date(new Date().getTime() + banDay * 86400 * 1000);
            BanList.update({username: bannedUser.username},
                {username: bannedUser.username, releaseDate: releaseDate, reason: reason, operator: operator.username}
                , {upsert: true}).exec();
            _net.responseObj(res, {
                "todo": 'Operator:' + operator.username + ' bans user:' + bannedUser.username + ' ' + ' day(s), because:'
                + reason
            })
        }
    } else {
        console.log("Operaotr: " + operator + " does not have permission to ban this user:" + bannedUser.username + "!");
        _net.responseError(res, "Permission deny!", 401);
    }
};

const unBanUser = function (operator, bannedUser, res) {
    if (operator.priv > 2 && bannedUser.priv < operator.priv) {
        BanList.remove({username: bannedUser.username}).exec();
        _net.responseObj(res, {"todo": 'Operator:' + operator.username + ' un-bans user:' + bannedUser.username})

    } else {
        console.log("Operaotr: " + operator + " does not have permission to ban this user:" + bannedUser.username + "!");
        _net.responseError(res, "Permission deny!", 401);
    }
};

exports.setup = function (server) {
    server.add_get('/api/ban/:username', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const username = req.params.username;

        if (!operator) {
            User.findOne({username: operator}).exec().then(
                function (user) {
                    if (user) {
                        User.findOne({username: username}).exec().then(
                            function (target) {
                                if (target) {
                                    banUser(user, target, req.body.banDays, req.body.reason, res);
                                } else {
                                    console.log("Target user: " + username + " not found!");
                                    _net.responseError(res, "Operator not found!", 404);
                                }
                            },
                            function (error) {
                                console.log("Find user failed with error:" + error);
                                _net.responseError(res, "Target user not found!", 500);
                            }
                        );
                    } else {
                        console.log("Operaotr: " + operator + " not found!");
                        _net.responseError(res, "Operator not found!", 500);
                    }
                },
                function (error) {
                    console.log("Find user failed with error:" + error);
                    _net.responseError(res, "Operator not found!", 500);
                }
            );
        }
        return next();
    }, 'Ban an user');

    server.add_get('/api/unban/:username', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const username = req.params.username;

        if (!operator) {
            User.findOne({username: operator}).exec().then(
                function (user) {
                    if (user) {
                        User.findOne({username: username}).exec().then(
                            function (target) {
                                if (target) {
                                    unBanUser(user, target, res);
                                } else {
                                    console.log("Target user: " + username + " not found!");
                                    _net.responseError(res, "Operator not found!", 404);
                                }
                            },
                            function (error) {
                                console.log("Find user failed with error:" + error);
                                _net.responseError(res, "Target user not found!", 500);
                            }
                        );
                    } else {
                        console.log("Operaotr: " + operator + " not found!");
                        _net.responseError(res, "Operator not found!", 500);
                    }
                },
                function (error) {
                    console.log("Find user failed with error:" + error);
                    _net.responseError(res, "Operator not found!", 500);
                }
            );
        }
        return next();
    }, 'Ban an user');

    server.add_get('/api/currentOnline/', function (req, res, next) {
        const user = _verify.authority(req);

        if (user && user.priv > 2) {
            Token.count().exec().then(
                function (count) {
                    _net.responseObj(res, {total: count, status: 'OK'});
                },
                function (error) {
                    console.log("Count current online user failed with error:" + error);
                    _net.responseError(res, "Fail to count current online user!", 500);
                }
            );
        } else {
            _net.responseError(res, "Video not found!", 404);
        }
        return next();
    }, 'Current online user');
};