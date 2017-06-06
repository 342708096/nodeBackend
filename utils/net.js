exports.responseJpg = function (res, data, req) {
    var content_type = 'image/jpeg';
    
    res.writeHead(200, {'Content-Type': content_type });
    res.end(data, 'binary');

    if (req) {
      console.log(data.length + ' sent for ' + req.url);
    }
    
    return true;
};

exports.responseText = function (res, msg) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    if (msg)
        res.write(msg);
    else
        res.write('OK.');

    res.end();
    return true;
};


exports.responseError = function (res, errMsg, errorCode) {
    if (!errorCode) { errorCode = 400; }

    res.writeHead(errorCode, {'Content-Type': 'application/json'});
    if (!errMsg) {
      errMsg = 'Failed';
    } else {
      console.log('Error: ' + errMsg);
    }
      
    res.write(JSON.stringify({error: errMsg}));
    res.end();
    return true;
};

exports.responseObj = function (res, obj) {
    if (!obj) {
        return exports.sendError(res, 'No exist');
    }

    res.writeHead(200, {'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":"PUT,POST,GET,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"});
    res.write(JSON.stringify(obj));
    res.end();

    return true;
};



exports.getBodyText = function (req, callback) {
    var data = '';
    req.on("data", function (trunk){
        data += trunk;
    });
    req.on("end", function () {
        callback(data);
    });
};

exports.getBodyBin = function (req, callback) {
    var chunks = [];
    req.on("data", function (trunk){
        chunks.push(trunk);
    });
    req.on("end", function () {
        var buffer = Buffer.concat(chunks);
        callback(buffer);
    });
};

