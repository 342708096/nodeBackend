const Details = require('./mongo.js').VisitDetails;
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');
const uaParser = require('ua-parser-js');
const http = require('http');

exports.setup = function (server) {
    server.add_put('/api/enter', function (req, res, next){
        // ip: {type: 'string'},
        // date: {type: 'date'},
        // type: {type: 'string'},
        // region: {type: 'string'},
        // city: {type: 'string'},
        // platform: {type: 'string'},
        // browser: {type: 'string'},
        // duration: {type: 'number'}
        const ip = req.connection.remoteAddress;
        const date = new Date();
        const type = '直播';
        const ua = uaParser(req.headers['user-agent']);
        const platform = ua.os.name;
        const browser = ua.browser.name;
        const duration = 60;

        const options = {
            host: 'ip.taobao.com',
            port: 80,
            path: `/service/getIpInfo.php?ip=${ip}`,
            // 'Content-Type': 'application/x-www-form-urlencoded',
            // headers: {'Content-Type': 'application/x-www-form-urlencoded'}

        };
        http.get(options, function(resp){
            resp.setEncoding('utf8');
            resp.on('data', function(response){
                response = JSON.parse(response);
                const region = response.data.region;
                const city = response.data.city;
                _net.responseObj(res, {ip, date, type, platform, browser, duration, region, city});
            });
        }).on("error", function(e){
            console.log("Got error: " + e.message);
            _net.responseObj(res);
        });

        return next()
    });


    server.add_get('/api/summary', function (req, res, next) {


        const visitTimePromise = Details.count().exec();
        const ipCountPromise = Details.distinct('ip').exec().then(ips =>
            ips.length);
        const totalDurationPromise = Details.aggregate([{
            $group : {
                _id: {},
                totalDuration: {$sum: '$duration'}
            }
        }]).exec().then(([group]) => group.totalDuration);

        const averageDurationPromise = Details.aggregate([{
            $group: {
                _id:{},
                averageDuration: {$avg: '$duration'}
            }
        }]).exec().then(([group]) => group.averageDuration);
        Promise.all([visitTimePromise,ipCountPromise, totalDurationPromise, averageDurationPromise])
            .then(([visitTimes, ipCount, totalDuration, averageDuration]) => {
            _net.responseObj(res, {visitTimes, ipCount, totalDuration, averageDuration});
        });

        // {"visitTimes":1,"ipCount":1000,"peakIpCount":30,"totalDuration":1568,"averageDuration":200}
        return next();
    }, 'Get summary');
};