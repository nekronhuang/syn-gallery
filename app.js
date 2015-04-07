var express = require('express'),
    path = require('path'),
    jade = require('jade'),
    app = express(),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    FileStore = require('session-file-store')(session),
    routes = require('./routes'),
    config = require('./config');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    store: new FileStore({
        path: './database/sessions'
    }),
    secret: config.key_A,
    saveUninitialized: true,
    resave: false
}));
app.use(compress());

if (config.debug) {
    app.use(express.static(__dirname + '/public'));
    app.use('/bower_components', express.static(__dirname + '/bower_components'));
} else {
    app.use(express.static(__dirname + '/public', {
        maxAge: '30d'
    }));
    app.use('/bower_components', express.static(__dirname + '/bower_components', {
        maxAge: '30d'
    }));
    app.set('env', 'production');
    app.set('view cache', true);
}
app.use(morgan('dev'));

var server = require('http').createServer(app),
    io = require('socket.io')(server);
server.listen(config.port, function() {
    console.log('listening on port %d in %s mode', config.port, app.settings.env);
});

var Datastore = require('nedb'),
    db = new Datastore({
        filename: './database/local.db'
    });
db.loadDatabase(function(err) {
    routes(app, io, db);
});