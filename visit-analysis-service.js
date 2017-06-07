
const mongo = require('./mongo.js');
const Details = mongo.VisitDetails;
const MaxVisitors = mongo.MaxVisitors;
const _net = require('./utils/net.js');
const uaParser = require('ua-parser-js');
const http = require('http');

exports.setup = function (server) {

    server.add_post('/api/enter', (req, res, next) => {
        const ip = req.connection.remoteAddress;
        const date = new Date();
        const type = '直播';
        const ua = uaParser(req.headers['user-agent']);
        const platform = ua.os.name;
        const browser = ua.browser.name;
        http.get({
            host: 'ip.taobao.com',
            port: 80,
            path: `/service/getIpInfo.php?ip=${ip}`,
            // 'Content-Type': 'application/x-www-form-urlencoded',
            // headers: {'Content-Type': 'application/x-www-form-urlencoded'}

        }, function(resp){
            resp.setEncoding('utf8');
            resp.on('data', function(response){
                response = JSON.parse(response);
                const region = response.data.region || 'unknown';
                const city = response.data.city || 'unknown';
                Details.create({ip, begin: date, end: new Date(new Date() + 60 * 1000), duration:60 * 1000, type, platform, browser, region, city}).exec().then((response) => {
                    _net.responseObj(res, response.ops[0]._id);
                }, (error) => {
                    _net.responseObj(res, error);
                });



            });
        }).on("error", function(e){
            console.error("Got error: " + e.message);
            _net.responseObj(res);
        });
        return next();
    });


    server.add_put('/api/enter/:id', function (req, res, next){
        const _id = req.params.id;
        Details.findOne({_id}).then((data) => {
            if (!data) {
                _net.responseError(res, 'not found', 404);
                return;
            }
            const end = new Date();
            const duration = end - data.begin;
            Details.updateOne({_id}, {$set:{duration, end}}).exec();
            _net.responseObj(res, Object.assign(data, {duration, end}));
        },(error)=> {
            _net.responseObj(res, error);
        });

        return next()
    });

    server.add_get('/api/enter', (req, res, next) => {
        Details.find().sort({end: -1}).limit(100).exec().then((list) => {
            _net.responseObj(res,list)
        },(error) => {
            _net.responseError(error)
        });
        return next();
    });

    server.add_delete('/api/enter', (req, res, next) => {
        Promise.all([Details.remove().exec(),MaxVisitors.remove().exec()]).then(() => {
            _net.responseText(res)
        },(error) => {
            _net.responseError(error)
        });
        return next();
    });

    server.add_get('/api/online', (req, res, next) => {
        MaxVisitors.find().sort({date: 1}).exec().then((list) => {
            _net.responseObj(res, list);
        },(error) => {
            _net.responseError(error);
        });
        return next();
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
        }]).exec().then(([group]) => group ? group.totalDuration : 0);

        const averageDurationPromise = Details.aggregate([{
            $group: {
                _id:{},
                averageDuration: {$avg: '$duration'}
            }
        }]).exec().then(([group]) => group ? group.averageDuration : 0);

        const maxVisitorsPromise = MaxVisitors.aggregate([{
            $group: {
                _id: {},
                max: {$max: '$count'}
            }
            }]).exec().then(([group]) => group ? group.max : 0);

        const platformWeightPromise = Details.aggregate([{
            $group: {
                _id: '$platform',
                count: {$sum: 1}
            }
        }]).exec();

        const browserWeightPromise = Details.aggregate([{
            $group: {
                _id: '$browser',
                count: {$sum: 1}
            }
        }]).exec();

        const AreaWeightPromise = Details.aggregate([{
            $group: {
                _id: '$region',
                count: {$sum: 1}
            }
        }]).exec();


        Promise.all([visitTimePromise,ipCountPromise, totalDurationPromise, averageDurationPromise, maxVisitorsPromise, platformWeightPromise, browserWeightPromise,AreaWeightPromise])
            .then(([visitTimes, ipCount, totalDuration, averageDuration, peakIpCount,  platformWeight, browserWeight,areaWeight]) => {
            _net.responseObj(res, {visitTimes, ipCount, totalDuration, averageDuration, peakIpCount, platformWeight, browserWeight, areaWeight});
        });

        // {"visitTimes":1,"ipCount":1000,"peakIpCount":30,"totalDuration":1568,"averageDuration":200}
        return next();
    }, 'Get summary');

};