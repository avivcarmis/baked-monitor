var config = require('./config');
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.dbFileName);
var bodyParser = require('body-parser');
var md5 = require('md5');
var path = require("path");

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS `users` (`email` VARCHAR(128) NOT NULL,`password` VARCHAR(256) NOT NULL,PRIMARY KEY (`email`))");
    db.run("CREATE TABLE IF NOT EXISTS `servers` (`user` VARCHAR(128) NOT NULL, `title` VARCHAR(256) NOT NULL, `url` VARCHAR(512) NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS `meters` (`server` INT NOT NULL, `data` TEXT NOT NULL)");

    // populate demo data:

    // db.run("INSERT INTO `users` (`email`, `password`) VALUES ('avivcarmis@gmail.com', '" + md5("1234") + "');");
    // db.run("INSERT INTO `servers` (`user`, `title`, `url`) VALUES ('avivcarmis@gmail.com', 'Example Server', 'http://localhost:8080/metrics');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"prototypeCollection\":{\"collectionPath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"}],\"titlePrefix\":\"\",\"titlePath\":[{\"type\":\"OBJECT\",\"result\":\"title\"}],\"titleSuffix\":\"Exit Rate\"},\"width\":12,\"type\":\"GRAPH\",\"config\":{\"maxHistory\":12,\"participants\":[{\"type\":\"INSTANCE\",\"title\":\"get_user_by_id exit rate\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Exit\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean Rate\"},\"result\":\"value\"}]}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Endpoint Comparison\",\"width\":12,\"type\":\"GRAPH\",\"config\":{\"maxHistory\":12,\"participants\":[{\"type\":\"INSTANCE\",\"title\":\"get_user_by_id exit rate\",\"valuePath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Exit\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean Rate\"},\"result\":\"value\"}]},{\"type\":\"COLLECTION\",\"collectionPath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"}],\"titlePath\":[{\"type\":\"OBJECT\",\"result\":\"title\"}],\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Enter\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean Rate\"},\"result\":\"value\"}]}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Total Count Comparison\",\"width\":12,\"type\":\"PIE\",\"config\":{\"participants\":[{\"type\":\"INSTANCE\",\"title\":\"get_user_by_id exit rate\",\"valuePath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Exit\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Total Count\"},\"result\":\"value\"}]},{\"type\":\"COLLECTION\",\"collectionPath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"}],\"titlePath\":[{\"type\":\"OBJECT\",\"result\":\"title\"}],\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Enter\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Total Count\"},\"result\":\"value\"}]}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Mean Time\",\"width\":3,\"type\":\"VALUE\",\"config\":{\"prefix\":\"\",\"suffix\":\"ms\",\"path\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean\"},\"result\":\"value\"}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Min Time\",\"width\":3,\"type\":\"VALUE\",\"config\":{\"prefix\":\"\",\"suffix\":\"ms\",\"path\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Min\"},\"result\":\"value\"}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Max Time\",\"width\":3,\"type\":\"VALUE\",\"config\":{\"prefix\":\"\",\"suffix\":\"ms\",\"path\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Max\"},\"result\":\"value\"}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Standard Deviation\",\"width\":3,\"type\":\"VALUE\",\"config\":{\"prefix\":\"\",\"suffix\":\"%\",\"path\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"GET /get_user_by_id\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Standard Deviation\"},\"result\":\"value\"}]}}');");
    // db.run("INSERT INTO `meters` (`server`, `data`) VALUES ('1', '{\"title\":\"Endpoint Analysis\",\"width\":12,\"type\":\"TABLE\",\"config\":{\"table\":{\"collectionPath\":[{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Endpoint\"},\"result\":\"value\"}],\"titlePath\":[{\"type\":\"OBJECT\",\"result\":\"title\"}],\"values\":[{\"title\":\"Enter Per Sec.\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Enter\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean Rate\"},\"result\":\"value\"}]},{\"title\":\"Exit Per Sec.\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Exit\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean Rate\"},\"result\":\"value\"}]},{\"title\":\"Currently Active\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Active\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Count\"},\"result\":\"value\"}]},{\"title\":\"Median Duration\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Mean\"},\"result\":\"value\"}]},{\"title\":\"98 Perc. Duration\",\"valuePath\":[{\"type\":\"OBJECT\",\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"Duration\"},\"result\":\"value\"},{\"type\":\"ARRAY\",\"conditions\":{\"title\":\"98th Percentile\"},\"result\":\"value\"}]}]}}}');");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/register', function (req, res) {
    if (req.body.adminPassword !== config.adminPassword) {
        res.send(new APIResponse(false, "no permission"));
    }
    if (req.body.password.length < config.minPasswordLength) {
        res.send(new APIResponse(false, "password must be at least " + config.minPasswordLength + " characters long"));
    }
    else {
        db.run("INSERT INTO `users` (`email`, `password`) VALUES (?, ?)", [req.body.email, md5(req.body.password)], function (err) {
            if (err) {
                internalError(res, err);
            }
            else {
                res.send(new APIResponse(true, null));
            }
        });
    }
});

app.post('/login', function (req, res) {
    db.get("SELECT * FROM `users` WHERE `email` = ?", [req.body.email], function (err, row) {
        if (err) {
            internalError(res, err);
        }
        else if (!row || row.password !== md5(req.body.password)) {
            res.send(new APIResponse(false, "illegal credentials"));
        }
        else {
            db.all("SELECT `rowid` AS `id`, `servers`.* FROM `servers` WHERE `user` = ?", [req.body.email], function (err, rows) {
                if (err) {
                    internalError(res, err);
                }
                else {
                    var servers = {};
                    var serverIDs = [];
                    for (var i = 0; i < rows.length; i++) {
                        servers[rows[i].id] = rows[i];
                        serverIDs.push(rows[i].id);
                    }
                    serverIDs = serverIDs.join(",");
                    db.all("SELECT * FROM `meters` WHERE `server` in (" + serverIDs + ")", [], function (err, rows) {
                        if (err) {
                            internalError(res, err);
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                var meter = rows[i];
                                try {
                                    var meterData = JSON.parse(meter.data);
                                } catch (e) {
                                    continue;
                                }
                                var serverId = meter.server;
                                if (servers[serverId]) {
                                    if (!servers[serverId].meters) {
                                        servers[serverId].meters = [];
                                    }
                                    servers[serverId].meters.push(meterData);
                                }
                            }
                            res.send(new APIResponse(true, servers));
                        }
                    });
                }
            });
        }
    });
});

app.use(express.static('src/public'));

app.use(function(req, res){
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname+'/404.html'));
    }
    else if (req.accepts('json')) {
        res.send(new APIResponse(false, "not found"));
    }
    else {
        res.type('txt').send('not found');
    }
});

app.listen(config.port, function () {
    console.log('BlurMonitor started on port ' + config.port);
});

function APIResponse(success, result) {
    this.success = success;
    this.result = success ? result : null;
    this.error = success ? null : result;
}

function internalError(res, err) {
    console.log(err);
    res.send(new APIResponse(false, "internal error"));
}