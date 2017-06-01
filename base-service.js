// HTTP Server
//

var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawnSync;

var _net = require('./utils/net.js');
var _file = require('./utils/file.js');

var restify = require('restify');

var server1 = restify.createServer({name: "GVR Server"});

//var fs = require('fs');
//var https_options = {
//  key: fs.readFileSync('keyfiles/gvrcraft.key'),
//  certificate: fs.readFileSync('keyfiles/gvrcraft.crt'),
//  ca: fs.readFileSync('keyfiles/1.root.crt')
//}
//var https_server = restify.createServer(https_options);


var init_server = function (server) {
    server.use(restify.CORS());
    server.use(restify.bodyParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());

    server.g_api = [];
    server.send_help = function (res) {
        _net.responseError(res,
            "GVR Server 1.0\n" + server.g_api.join('\n'), 404
        );
    };

    server.add_get = function (path, fn1, description) {
        if (description)
            server.g_api.push('GET  ' + path + " \t " + description);
        else
            server.g_api.push('GET  ' + path);

        server.get(path, fn1);
    };

    server.add_put = function (path, fn1, description) {
        if (description)
            server.g_api.push('PUT  ' + path + " \t " + description);
        else
            server.g_api.push('PUT  ' + path);

        server.put(path, fn1);
    };

    server.add_post = function (path, fn1, description) {
        if (description)
            server.g_api.push('POST ' + path + " \t " + description);
        else
            server.g_api.push('POST ' + path);

        server.post(path, fn1);
    };

    server.add_delete = function (path, fn1, description) {
        if (description)
            server.g_api.push('DEL  ' + path + " \t " + description);
        else
            server.g_api.push('DEL  ' + path);

        server.del(path, fn1);
    };

    server.get('/', function (req, res, next) {
        server.send_help(res);
        return next();
    });

    server.get('/restart', function (req, res, next) {
        exec('git pull', function () {
            _net.responseText(res, 'Code updated.');
            next();
        });
    });

};

init_server(server1);
//init_server(https_server);

exports.server = server1;

