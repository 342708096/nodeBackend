const Details = require('./mongo.js').VisitDetails;
const _net = require('./utils/net.js');
const _verify = require('./utils/verify.js');

exports.setup = function (server) {
    server.add_get('/api/summary', function (req, res, next) {
        const result = {
          visitTimes: 1,
          ipCount:1000,
          peakIpCount:30,
          totalDuration: 1568,
          averageDuration: 200,
        };
        _net.responseObj(res, result);
        return next();
    }, 'Get summary');
};