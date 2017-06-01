var port = 8000;

var server = require('./base-service.js').server;

require('./auth-service.js').setup(server);
require('./user-active-service.js').setup(server);
require('./user-manage-service.js').setup(server);
require('./video-audience-service.js').setup(server);
require('./video-manage-service.js').setup(server);
require('./visit-analysis-service.js').setup(server);

server.listen(port, '0.0.0.0', function () {
    console.log("Listen started at " + port);
});

process.on('uncaughtException', function (err) {
    console.error(err);
});




