var http = require('http'),
    qiniu = require('qiniu'),
    config = require('../config');
qiniu.conf.ACCESS_KEY = config.storage.access;
qiniu.conf.SECRET_KEY = config.storage.secret;

exports.down = function(req, res, io, db) {
    console.log(req.body);
    if (req.body.key) {
        var deadline = 1438358400,
            domain = config.storage.domain,
            key = req.body.key,
            baseUrl = qiniu.rs.makeBaseUrl(domain, key),
            policy = new qiniu.rs.GetPolicy(deadline);
        var insert = {
            src: policy.makeRequest(baseUrl),
            w: req.body.w || '1920',
            h: req.body.h || '1080',
            cost:req.body.cost,
            timestamp: Date.now(),
        };
        db.update({
            user: 'roy'
        }, {
            $inc: {
                storage: parseInt(req.body.size || 0),
            }
        }, function() {

        });
        db.insert(insert, function(err) {
            io.sockets.send(insert);
            res.json({});
        });
    } else {
        res.json({});
    }
};

exports.token = function(req, res) {
    var callbackBody = 'key=$(key)&size=$(fsize)&w=$(imageInfo.width)&h=$(imageInfo.height)',
        token = new qiniu.rs.PutPolicy(config.storage.bucket, null, null, null, null, null, null, 1438358400);
    res.send(token.token());
};

exports.upload = function(req, res) {
    var extra = new qiniu.io.PutExtra(),
        localFile = __dirname + '/test2.jpg',
        token = config.storage.token;
    qiniu.io.putFile(token, 'test2.jpg', localFile, extra, function(err, ret) {
        if (!err) {
            console.log(ret.key, ret.hash);
        } else {
            console.log(err);
        }
    });
    res.send('1')
};

exports.info = function(req, res) {
    var url = qiniu.rs.makeBaseUrl(config.storage.domain, req.query.img);
    var ii = new qiniu.fop.ImageInfo();
    url = ii.makeRequest(url);
    var policy = new qiniu.rs.GetPolicy(1438358400);
    url = policy.makeRequest(url);
    http.get(url, function(response) {
        var chunks = [];
        response.on('data', function(chunk) {
            chunks.push(chunk);
        });
        response.on('end', function() {
            res.send(Buffer.concat(chunks).toString());
        });
    });
};