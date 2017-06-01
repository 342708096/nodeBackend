const Video = require('./mongo.js').Video;
const Comments = require('./mongo.js').Comments;
const _utf8 = require('utf8');
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');

const formatManageVideoInfo = function (content, user) {
    if (!user || user.priv < 2) {
        return null;
    }

    let videoInfo = {};
    if (content.name) {
        videoInfo.name = content.name;
    }
    if (content.url) {
        videoInfo.url = content.url;
    }
    if (content.duration) {
        videoInfo.duration = content.duration;
    }
    if (content.description) {
        videoInfo.description = content.description;
    }
    if (content.preview) {
        videoInfo.preview = content.preview;
    }
    if (content.type) {
        videoInfo.type = content.type;
    }
    if (content.tags) {
        videoInfo.tags = content.tags;
    }
    if (content.viewSeconds) {
        videoInfo.viewSeconds = content.viewSeconds;
    }
    videoInfo.lastModify = Date.now();

    if (user.priv > 2) {
        if (content.audited) {
            videoInfo.audited = content.audited;
        }
        if (content.auditInfo) {
            videoInfo.auditInfo = content.auditInfo;
        }
    }
    return videoInfo;
};

const formatCreateVideoInfo = function (content, user) {
    if (!user || user.priv < 2) {
        return null;
    }

    let videoInfo = {};
    videoInfo.videoId = new Date().getTime();  //NOTE: Unsafe operation!!!

    if (content.name) {
        videoInfo.name = content.name;
    }
    if (content.url) {
        videoInfo.url = content.url;
    }
    if (content.duration) {
        videoInfo.duration = content.duration;
    }
    videoInfo.author = user.username;
    if (content.description) {
        videoInfo.description = content.description;
    }
    if (content.preview) {
        videoInfo.preview = content.preview;
    }
    if (content.type) {
        videoInfo.type = content.type;
    }
    if (content.tags) {
        videoInfo.tags = content.tags;
    }
    if (content.viewSeconds) {
        videoInfo.viewSeconds = content.viewSeconds;
    }
    videoInfo.currentViewPeople = 0;
    videoInfo.totalViewPeople = 0;
    videoInfo.likeCount = 0;
    videoInfo.favoriteCount = 0;
    videoInfo.lastModify = Date.now();
    videoInfo.audited = false;
    videoInfo.auditInfo = "";
    return videoInfo;
};

exports.setup = function (server) {
    server.add_get('/api/video/:videoId', function (req, res, next) {
        const user = _verify.authority(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const videoId = req.params.videoId;

        if (user && user.priv > 2) {
            Video.findOne({videoId: videoId}).exec().then(
                function (video) {
                    if (video) {
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
        } else {
            _net.responseError(res, "Permission deny!", 401);
        }
        return next();
    }, 'Get a video for management');

    server.add_delete('/api/video/:videoId', function (req, res, next) {
        const user = _verify.authority(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const videoId = req.params.videoId;

        if (user && user.priv > 2) {
            Video.remove({videoId: videoId}).exec().then(
                function (video) {
                    _net.responseObj(res, video);
                },
                function (error) {
                    console.log("Delete video failed with error:" + error);
                    _net.responseError(res, "Fail to get video!", 500);
                }
            );
        } else {
            _net.responseError(res, "Permission deny!", 401);
        }
        return next();
    }, 'Delete a video');

    server.add_post('/api/video/:videoId', function (req, res, next) {
        const user = _verify.authority(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const videoId = req.params.videoId;
        const content = req.body;
        const videoInfo = formatManageVideoInfo(content, user);

        if (!user || user.priv < 2) {
            _net.responseError(res, "Permission deny!", 401);
            return next();
        }

        Video.findOne({videoId: videoId}).exec().then(
            function (video) {
                if (video) {
                    if (user.priv === 3 || user.username === video.author) {
                        Video.update({videoId: videoId}, {$set: videoInfo}).exec().then(
                            function () {
                                _net.responseObj(res, {status: 'OK'});
                            },
                            function (error) {
                                console.log("Update video info failed with error:" + error);
                                _net.responseError(res, "Fail to get video!", 500);
                            }
                        );
                    } else {
                        _net.responseError(res, "Permission deny!", 401);
                    }
                } else {
                    _net.responseError(res, "Video not found!", 404);
                }
            },
            function (error) {
                console.log("Update video failed with error:" + error);
                _net.responseError(res, "Fail to update video!", 500);
            }
        );
        return next();
    }, 'Manage a video');

    server.add_put('/api/video/', function (req, res, next) {
        const user = _verify.authority(req.query.token, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
        const content = req.body;
        const newVideo = formatCreateVideoInfo(content, user);

        if (!user || user.priv < 2) {
            _net.responseError(res, "Permission deny!", 401);
            return next();
        }

        Video.create(newVideo).exec().then(
            function () {
                _net.responseObj(res, {status: 'OK'});
            },
            function (error) {
                console.log("Upload video failed with error:" + error);
                _net.responseError(res, "Fail to upload video!", 500);
            }
        );
        return next();
    }, 'Upload a video');

    server.add_delete('/api/comment/:videoId/id/:date', function (req, res, next) {
        const videoId = req.params.videoId;
        let date = _utf8.decode(req.params.date);

        Comments.remove({videoId: videoId, date: date}).exec().then(
            function () {
                _net.responseObj(res, {status: "OK"});
            },
            function (error) {
                console.log("Delete comment failed with error:" + error);
                _net.responseError(res, "Fail to delete comment!", 500);
            }
        );

        return next();
    }, 'Load comment');
};