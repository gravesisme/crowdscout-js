var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    lessMiddleware = require('less-middleware'),
    app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(favicon('public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/build'));
app.use("/bower_components", express.static(__dirname + "/bower_components"));

app.get('*', function(req, res){
    res.render('base', {
        title: "CrowdScout-JS",
        bootstrapped_content: "{}",
        content: ""
    });
});

module.exports = app;
