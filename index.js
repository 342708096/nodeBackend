var port = 8000;

var server = require('./base-service.js').server;

require('./auth-service.js').setup(server);
require('./user-active-service.js').setup(server);
require('./user-manage-service.js').setup(server);
require('./video-audience-service.js').setup(server);
require('./video-manage-service.js').setup(server);
require('./visit-analysis-service.js').setup(server);
const VisitDetails = require('./mongo.js').VisitDetails;
const MaxVisitors = require('./mongo.js').MaxVisitors;

server.listen(port, '0.0.0.0', function () {
    console.log("Listen started at " + port);
});

process.on('uncaughtException', function (err) {
    console.error(err);
});

setInterval(() => {
    const before60s = new Date(new Date() - 60 * 1000);
    VisitDetails.find({begin: {$lte: before60s}, end: {$gte: before60s}})
        .exec()
        .then(({length})=> {
        MaxVisitors.create({count: length, date: new Date()}).exec();
    }, (error) => {
        console.error(error);
    });

}, 60 * 1000);


