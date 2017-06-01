const Like = require('./mongo.js').Like;
const Histories = require('./mongo.js').Histories;
const Favorites = require('./mongo.js').Favorites;
const Comments = require('./mongo.js').Comments;
const Barrier = require('./mongo.js').Barrier;
const Video = require('./mongo.js').Video;
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');


const do_like = function (username, like, videoId) {
    if (like) {
        Like.update({username: username, videoId: videoId},
            {username: username, videoId: videoId, date: Date.now},
            {upsert: true}).exec().then(
            function () {
                Video.update({videoId: videoId}, {$inc: {likeCount: 1}}).exec();
            }
        );
    } else {
        Like.remove({username: username, videoId: videoId}).exec().then(
            function () {
                Video.update({videoId: videoId}, {$inc: {likeCount: -1}}).exec();
            });
    }
    return {"todo": username + ' ' + (type ? 'like' : 'unlike') + ' ' + videoId};
};

const do_favorite = function (username, favorite, videoId) {
    if (favorite) {
        Favorites.update({username: username, videoId: videoId},
            {username: username, videoId: videoId, date: Date.now},
            {upsert: true}).exec().then(
            function () {
                Video.update({videoId: videoId}, {$inc: {favoriteCount: 1}}).exec();
            }
        );
    } else {
        Favorites.remove({username: username, videoId: videoId}).exec().then(
            function () {
                Video.update({videoId: videoId}, {$inc: {favoriteCount: -1}}).exec();
            });
    }
    return {"todo": username + ' ' + (type ? 'favorite' : 'un-favorite') + ' ' + videoId};
};

exports.setup = function (server) {
    server.add_get('/api/like/:videoId', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        if (operator) {
            const result = do_like(operator, true, req.params.videoId);
            _net.responseObj(res, result);
        } else {
            _net.responseError(res, "Authentication Failed!", 401);
        }
        return next();
    }, 'Like a video');

    server.add_get('/api/unlike/:videoId', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        if (operator) {
            const result = do_like(operator, false, req.params.videoId);
            _net.responseObj(res, result);
        } else {
            _net.responseError(res, "Authentication Failed!", 401);
        }
        return next();
    }, 'Unlike a video');

    server.add_get('/api/favorite/:videoId', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        if (operator) {
            const result = do_favorite(operator, true, req.params.videoId);
            _net.responseObj(res, result);
        } else {
            _net.responseError(res, "Authentication Failed!", 401);
        }
        return next();
    }, 'Favorite a video');

    server.add_get('/api/unFavorite/:videoId', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        if (operator) {
            const result = do_favorite(operator, false, req.params.videoId);
            _net.responseObj(res, result);
        } else {
            _net.responseError(res, "Authentication Failed!", 401);
        }
        return next();
    }, 'Un-favorite a video');

    server.add_get('/api/play/:videoId', function (req, res, next) {
        const operator = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const videoId = req.params.videoId;

        Video.findOne({videoId: videoId}).exec().then(
            function (video) {
                if (video && video.audited) {
                    delete video.auditInfo;
                    Histories.create({username: operator, videoId: videoId, date: Date.now()}).exec();
                    _net.responseObj(res, video);
                } else {
                    _net.responseError(res, "Video not found!", 404);
                }
            },
            function (error) {
                console.log("Get video failed with error:" + error);
                _net.responseError(res, "Fail to get video!", 500);
            }
        );
        return next();
    }, 'Get a video for play');

    server.add_put('/api/barrier/:videoId', function (req, res, next) {
        const player = _verify.tokenVerify(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const videoId = req.params.videoId;
        const barrier = req.body;
        if (!player) {
            _net.responseError(res, "Authentication Failed!", 401);
            return next();
        }

        const ban = _verify.isBanned(player);
        if (ban) {
            _net.responseError(res, "You don't have permission to shoot!", 403);
            return next();
        }

        Barrier.create({videoId: videoId, username: player, comment: barrier, date: Date.now}).exec().then(
            function () {
                _net.responseObj(res, {status: 'OK'});
            },
            function (error) {
                console.log("Put Barrier failed with error:" + error);
                _net.responseError(res, "Fail to set barrier !", 500);
            }
        );

        return next();
    }, 'Set barrier');

    server.add_get('/api/barrier/:videotype', function (req, res, next) {
        _net.responseObj(res, [ 
{"videoId": "video1", "url": "http://video.gvrcraft.com/water1.mp4", "duration": 70,  "description": "这是个好视频", "preview": "http://video.gvrcraft.com/water1.jpg", "like": 3456, "viewSeconds": 829122, "viewpeople": 230, "maxViewPeople": 574
},
{"videoId": "video2", "url": "http://gvrcraft.com/me.html?ld", "duration": 0,  "description": "这是个链接", "preview": "http://video.gvrcraft.com/aqua.jpg"
}
]);
        return next();
      

//        const videotype = req.params.videotype;
//
//        Barrier.find({videoId: videotype}).sort({date: -1}).limit(100).exec().then(
//            function (result) {
//                _net.responseObj(res, result);
//            },
//            function (error) {
//                console.log("Load barrier failed with error:" + error);
//                _net.responseError(res, "Fail to load barrier!", 500);
//            }
//        );
//
//        return next();
    }, 'Load barrier');
  
  
    server.add_get('/api/user/:username/favorite', function(req, res, next) {
          _net.responseObj(res, [ 
{"videoId": "video1", "url": "http://video.gvrcraft.com/water1.mp4", "duration": 70,  "description": "这是个好视频", "preview": "http://video.gvrcraft.com/water1.jpg", "like": 3456, "viewSeconds": 829122, "viewpeople": 230, "maxViewPeople": 574
},
{"videoId": "video2", "url": "http://video.gvrcraft.com/aqua.mp4", "duration": 80,  "description": "这也是个好视频", "preview": "http://video.gvrcraft.com/aqua.jpg", "like": 3476, "viewSeconds": 829133, "viewpeople": 260, "maxViewPeople": 594
}
]);
        return next();
    }, 'List favorite video of a user');
  
  
    server.add_get('/api/videos/:videotype', function(req, res, next) {
          _net.responseObj(res, [ 
{"videoId": "video1", "url": "http://video.gvrcraft.com/water1.mp4", "duration": 70,  "description": "这是个好视频", "preview": "http://video.gvrcraft.com/water1.jpg", "like": 3456, "viewSeconds": 829122, "viewpeople": 230, "maxViewPeople": 574
},
{"videoId": "video2", "url": "http://video.gvrcraft.com/aqua.mp4", "duration": 80,  "description": "这也是个好视频", "preview": "http://video.gvrcraft.com/aqua.jpg", "like": 3476, "viewSeconds": 829133, "viewpeople": 260, "maxViewPeople": 594
}
]);
        return next();
    }, 'List videos');
  
  
    server.add_get('/api/hotwords', function(req, res, next) {
      _net.responseObj(res, ['good', 'cool']);
      return next();
    }, 'List hot words');
  
    server.add_get('/api/splash/:filter', function(req, res, next) {
      _net.responseObj(res, { "url": "http://video.gvrcraft.com/aqua.jpg", "type": "video", "param": "video2", "duration": 3 });
      return next();
    }, 'Get Splash Screen');
  
  
    server.add_get('/api/videotypes', function(req, res, next) {
      _net.responseObj(res, [{"name": "game", "icon": "http://pic.gvrcraft.com/sport.png", "display": "赛事" }, 
                             {"name": "knowledge", "icon": "http://pic.gvrcraft.com/knowledge.png", "display": "知识"}]);
      
      return next();
    }, 'Get video supported types');

    server.add_put('/api/comment/:videotype', function (req, res, next) {
        _verify.tokenVerify(req);
        const comment = req.body;
        const videotype = req.params.videotype;
        if (!player) {
            _net.responseError(res, "Authentication Failed!", 401);
            return next();
        }

        const ban = _verify.isBanned(player);
        if (ban) {
            _net.responseError(res, "You don't have permission to comment!", 403);
            return next();
        }

        Comments.create({videoId: videotype, username: player, comment: comment, date: Date.now}).exec().then(
            function () {
                _net.responseObj(res, {status: 'OK'});
            },
            function (error) {
                console.log("Send comment failed with error:" + error);
                _net.responseError(res, "Fail to comment video!", 500);
            }
        );

        return next();
    }, 'Send comment');

    //25 documents per page
    server.add_get('/api/comment/:videoId/page/:page', function (req, res, next) {      
        const videoId = req.params.videoId;
        let page = req.params.page;
        if (!Number.isInteger(page) || page < 0) {
            page = 0;
        }

        Comments.find({videoId: videoId}).sort({date: -1}).limit(25).skip(page * 25).exec().then(
            function (result) {
                _net.responseObj(res, result);
            },
            function (error) {
                console.log("Load comment failed with error:" + error);
                _net.responseError(res, "Fail to load comment!", 500);
            }
        );

        return next();
    }, 'Load comment');
};