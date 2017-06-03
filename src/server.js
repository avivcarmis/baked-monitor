var config = require('./config');
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.dbFileName);
var bodyParser = require('body-parser');
var md5 = require('md5');
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
var AVATARS = [
    "abraham",
    "helen",
    "holly",
    "jim",
    "jones",
    "leroy",
    "natalie",
    "sandra"
];

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS `users` (`email` VARCHAR(128) NOT NULL,`password` VARCHAR(256) NOT NULL,`fname` VARCHAR(256),`lname` VARCHAR(256),`avatar` VARCHAR(32) NOT NULL,`color` VARCHAR(8) NOT NULL,PRIMARY KEY (`email`))");
    db.run("CREATE TABLE IF NOT EXISTS `servers` (`user` VARCHAR(128) NOT NULL, `title` VARCHAR(256) NOT NULL, `url` VARCHAR(512) NOT NULL, `method` VARCHAR(16) NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS `meters` (`server` INT NOT NULL, `data` TEXT NOT NULL)");

    // populate demo data:

    // db.run("INSERT INTO `users` (`email`, `password`, `avatar`, `color`) VALUES ('avivcarmis@gmail.com', '" + md5("1234") + "', '" + randomAvatar() + "', '#505050');");
    // db.run("INSERT INTO `servers` (`user`, `title`, `url`, `method`) VALUES ('avivcarmis@gmail.com', 'Server 1', 'http://localhost:8080/metrics', 'GET');");
    // db.run("INSERT INTO `servers` (`user`, `title`, `url`, `method`) VALUES ('avivcarmis@gmail.com', 'Server 2', 'http://localhost:8081', 'GET');");
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

app.post('/login', function (req, res) {
    db.get("SELECT * FROM `users` WHERE `email` = ?", [req.body.email], function (err, row) {
        if (err) {
            internalError(res, err);
        }
        else if (!row || row.password !== md5(req.body.password)) {
            res.send(new APIResponse(false, "Illegal credentials given", "Could Not Login"));
        }
        else {
            var user = row;
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
                                meterData.id = guid();
                                meterData.serverId = meter.server;
                                if (!meterData.prototypeCollection) {
                                    meterData.prototypeCollection = {
                                        collectionPath: [],
                                        titlePath: [],
                                        titlePrefix: "",
                                        titleSuffix: ""
                                    };
                                }
                                var serverId = meter.server;
                                if (servers[serverId]) {
                                    if (!servers[serverId].meters) {
                                        servers[serverId].meters = [];
                                    }
                                    servers[serverId].meters.push(meterData);
                                }
                            }
                            user.servers = [];
                            for (var key in servers) {
                                if (servers.hasOwnProperty(key)) {
                                    user.servers.push(servers[key]);
                                }
                            }
                            delete user.password;
                            res.send(new APIResponse(true, user));
                        }
                    });
                }
            });
        }
    });
});

app.post('/register', function (req, res) {
    if (req.body.adminPassword !== config.adminPassword) {
        res.send(new APIResponse(false, "Admin permission not granted", "Could Not Register"));
    }
    if (req.body.password.length < config.minPasswordLength) {
        res.send(new APIResponse(false, "Password must be at least " + config.minPasswordLength + " characters long", "Could Not Register"));
    }
    else {
        var avatar = randomAvatar();
        db.run("INSERT INTO `users` (`email`, `password`, `avatar`) VALUES (?, ?, ?)", [req.body.email, md5(req.body.password), avatar], function (err) {
            if (err) {
                if (err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email") {
                    res.send(new APIResponse(false, "Email address already registered. Contact admin to reset password", "Could Not Register"));
                }
                else {
                    internalError(res, err);
                }
            }
            else {
                res.send(new APIResponse(true, {
                    email: req.body.email,
                    avatar: avatar,
                    fname: null,
                    lname: null,
                    servers: {}
                }));
            }
        });
    }
});

app.post('/update_profile', function (req, res) {
    function updatePassword(callback) {
        if (!req.body.newPassword) {
            return callback();
        }
        if (req.body.newPassword.length < config.minPasswordLength) {
            return res.send(new APIResponse(false, "Password must be at least " + config.minPasswordLength + " characters long", "Could Not Update Profile"));
        }
        db.get("SELECT * FROM `users` WHERE `email` = ?", [req.body.email], function (err, row) {
            if (err) {
                internalError(res, err);
            }
            else if (!row || row.password !== md5(req.body.oldPassword)) {
                res.send(new APIResponse(false, "Wrong old password given", "Could Not Update Profile"));
            }
            else {
                db.run("UPDATE `users` SET `password` = ? WHERE `email` = ?", [md5(req.body.newPassword), req.body.email], function (err) {
                    if (err) {
                        internalError(res, err);
                    }
                    else {
                        callback();
                    }
                });
            }
        });
    }
    updatePassword(function () {
        var set = [];
        var params = [];
        if (req.body.avatar) {
            set.push("`avatar` = ?");
            params.push(req.body.avatar);
        }
        if (req.body.color) {
            set.push("`color` = ?");
            params.push(req.body.color);
        }
        if (req.body.fname) {
            set.push("`fname` = ?");
            params.push(req.body.fname);
        }
        if (req.body.lname) {
            set.push("`lname` = ?");
            params.push(req.body.lname);
        }
        params.push(req.body.email);
        db.run("UPDATE `users` SET " + set.join(",") + " WHERE `email` = ?", params, function (err) {
            if (err) {
                internalError(res, err);
            }
            else {
                res.send(new APIResponse(true, null));
            }
        });
    });
});

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

function internalError(res, err) {
    console.log(err);
    res.send(new APIResponse(false, "Internal server error occurred", "Oops!"));
}

function html(res, filename) {
    res.sendFile(path.join(__dirname + '/html/' + filename + '.html'));
}

function randomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}




/// temp

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}