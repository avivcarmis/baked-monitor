var config = require('./config');
var express = require('express');
var app = express();
var path = require("path");
var INDEX_PAGES = [
    "/",
    "/monitor",
    "/monitor/*",
    "/login",
    "/edit",
    "/edit/*",
    "/profile"
];

for (var i = 0; i < INDEX_PAGES.length; i++) {
    app.get(INDEX_PAGES[i], index);
}

app.use(express.static('src/public'));

app.use(function(req, res){
    res.status(404);
    if (req.accepts('html')) {
        html(res, '404');
    }
    else if (req.accepts('json')) {
        res.send(new APIResponse(false, "Requested resource not found", "Oops!"));
    }
    else {
        res.type('txt').send('not found');
    }
});

app.listen(config.port, function () {
    console.log('BlurMonitor started on port ' + config.port);
});

function index(req, res) {
    html(res, 'index');
}

function APIResponse(success, a, b) {
    this.success = success;
    this.result = success ? a : null;
    this.error = success ? null : {body: a, title: b};
}

function html(res, filename) {
    res.sendFile(path.join(__dirname + '/html/' + filename + '.html'));
}