// Usage: 
// mongo.User.find().exec().then()
// mongo.User.insertOne({name: 'abc', password: 'bbbddd', ...}).exec().then();

const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect('mongodb://localhost:27017/db1');

//================USER RELATED==================
exports.User = mongolass.model('User', {
    username: {type: 'string'},
    password: {type: 'string'},
    nickname: {type: 'string'},
    //Tou2Xiang4
    avatar: {type: 'string'},
    priv: {type: 'integer'},
    userInfo: {type: 'string'},
    lastLogin: {type: 'date'},
    weChatToken:{type: 'string'},
    weboToken:{type: 'string'}
});
exports.User.index({username: 1}, {unique: true}).exec();

exports.UserInfo = mongolass.model('UserInfo', {
    username: {type: 'string'},
    //for infrequently used information, which is accessed less than once per login
    userInfo: {type: 'string'}
});
exports.UserInfo.index({username: 1}, {unique: true}).exec();

exports.BanList = mongolass.model('BanList', {
    username: {type: 'string'},
    releaseDate: {type: 'date'},
    reason: {type: 'string'},
    operator: {type: 'string'}
});
exports.BanList.index({username: 1}, {unique: true}).exec();
//user will be banned until bannedUntil expires.
//normally it will be remove from ban list within 60 seconds from database.
exports.BanList.index({releaseDate: 1}, {expireAfterSeconds: 0}).exec();

exports.Token = mongolass.model('Token', {
    token: {type: 'string'},
    username: {type: 'string'},
    signTime: {type: 'date'},
    ipAddress: {type: 'string'},
    browser: {type: 'string'}
});
exports.Token.index({token: 1}, {unique: true}).exec();
exports.Token.index({username: 1}, {unique: true}).exec();
//token will expire after it has been signed 86400 seconds (1 day).
//normally token will be delete within 60 seconds from database.
exports.Token.index({signTime: 1}, {expireAfterSeconds: 86400}).exec();

exports.LostAndFound = mongolass.model('LostAndFound', {
    phone: {type: 'string'},
    code: {type: 'string'}
});
exports.LostAndFound.index({phone: 1}).exec();

//================VIDEO RELATED==================
exports.Video = mongolass.model('Video', {
    name: {type: 'string'},
    url: {type: 'string'},
    duration: {type: 'integer'},
    author: {type: 'string'},
    description: {type: 'string'},
    preview: {type: 'string'},
    type: {type: 'string'},
    tags: {type: 'array'},
    viewSeconds: {type: 'integer'},
    currentViewPeople: {type: 'integer'},
    totalViewPeople: {type: 'integer'},
    likeCount: {type: 'integer'},
    favoriteCount: {type: 'integer'},
    lastModify: {type: 'date'},
    audited: {type: 'boolean'},
    auditInfo: {type: 'string'}
    //auditInfo:{auditedBy: {type: 'string'}, auditedAt: {type: 'date'}}
});
exports.Video.index({name: 1}, {unique: true}).exec();
exports.Video.index({type: 1}).exec();
exports.Video.index({tags: 1}).exec();
exports.Video.index({lastModify: -1}).exec();
//barrages implemented by HTML file


//================CROSS RELATED==================
exports.Favorites = mongolass.model('Favorites', {
    username: {type: 'string'},
    videoId: {type: 'integer'},
    date: {type: 'date'}
});
exports.Favorites.index({username: 1, videoId: 1}, {unique: true}).exec();

exports.Like = mongolass.model('Like', {
    username: {type: 'string'},
    videoId: {type: 'integer'},
    date: {type: 'date'}
});
exports.Like.index({username: 1, videoId: 1}, {unique: true}).exec();

exports.Histories = mongolass.model('Histories', {
    username: {type: 'string'},
    videoId: {type: 'integer'},
    date: {type: 'date'}
});
exports.Favorites.index({username: 1, date: 1}).exec();

exports.Comments = mongolass.model('Comments', {
    videoId: {type: 'integer'},
    username: {type: 'string'},
    content: {type: 'string'},
    date: {type: 'date'}
});
exports.Favorites.index({videoId: 1, date: -1}).exec();

exports.Barrages = mongolass.model('Barrages', {
    videoId: {type: 'integer'},
    username: {type: 'string'},
    content: {type: 'string'},
    date: {type: 'date'}
});
exports.Barrages.index({videoId: 1, date: 1}).exec();
exports.Barrages.index({date: 1}, {expireAfterSeconds: 15}).exec();

//====================OTHER=====================
exports.Search = mongolass.model('Search', {
    keyWord: {type: 'string'},
    count: {type: 'integer'}
});
exports.Favorites.index({keyWord: 1, date: -1}).exec();

//======================页面统计========================
exports.VisitDetails = mongolass.model('VisitDetails', {
    ip: {type: 'string'},
    date: {type: 'date'},
    type: {type: 'string'},
    region: {type: 'string'},
    city: {type: 'string'},
    platform: {type: 'string'},
    browser: {type: 'string'}
});
exports.VisitDetails.index({ip: 1}).exec();
exports.VisitDetails.index({date: -1}).exec();