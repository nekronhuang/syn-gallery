var qn = require('./controllers/qn'),
    config = require('./config');

module.exports = function(app, io, db) {
    app.get('/', function(req, res) {
        if (req.session.user) {
            db.find({}, {
                _id: 0
            }).sort({
                timestamp: -1
            }).exec(function(err, docs) {
                var storage, items = [];
                for (var i = 0; i < docs.length; i++) {
                    var doc = docs[i];
                    if (doc.user) {
                        storage = doc.storage;
                    } else {
                        items.push({
                            src: doc.src,
                            w: doc.w,
                            h: doc.h
                        });
                    }
                }
                if (items.length == 0) {
                    items.push({
                        src: '/img/brand.png',
                        w: '400',
                        h: '400'
                    });
                }
                res.render('layout', {
                    isLogin: true,
                    items: JSON.stringify(items),
                    storage: storage
                });
            });
        } else {
            db.findOne({
                user: config.user.name
            }, function(err, doc) {
                res.render('layout', {
                    isLogin: false,
                    storage: doc.storage
                });
            });
        }
    });
    app.post('/tpl/login', function(req, res) {
        if (req.body.name == config.user.name && req.body.password == config.user.password) {
            req.session.user = true;
            db.find({
                user: {
                    $exists: false
                }
            }, {
                _id: 0
            }).sort({
                timestamp: -1
            }).exec(function(err, docs) {
                if (docs.length == 0) {
                    docs.push({
                        src: '/img/brand.png',
                        w: '400',
                        h: '400'
                    });
                }
                res.json({
                    items: docs
                });
            });
        } else {
            res.sendStatus(401);
        }
    });

    app.post('/qiniu/down', function(req, res) {
        return qn.down(req, res, io, db);
    });
    // app.get('/qiniu/token', qn.token);
    // app.get('/qiniu/upload', qn.upload);

    app.get('*', function(req, res) {
        res.redirect('/');
    });
    io.on('connection', function(socket) {
        console.log('connected');
        socket.on('disconnect', function() {
            console.log('disconnect');
        });
    });
};