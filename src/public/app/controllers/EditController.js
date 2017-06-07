(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('EditCtrl', ['$scope', '$http', '$rootScope', '$state', 'toastr', '$uibModal', 'utils', 'pathManager',
            function ($scope, $http, $rootScope, $state, toastr, $uibModal, utils, pathManager) {

                if (typeof $rootScope.profile === "undefined") {
                    $rootScope.pendingRedirect = {
                        state: $state.current.name,
                        params: $rootScope.stateParams
                    };
                    return $state.go('login');
                }

                $("title").text("Edit Servers - BlueMonitor");

                $scope.walkPathArray = function (pathArray, stopIndex, prePathArrays) {
                    return pathManager.walkPath($scope.currentSample, pathArray, stopIndex, prePathArrays);
                };

                $scope.findServer = function (id) {
                    for (var i = 0; i < $rootScope.profile.servers.length; i++) {
                        var server = $rootScope.profile.servers[i];
                        if (server.id === id) {
                            return server;
                        }
                    }
                    return null;
                };

                $scope.removeServerInstance = function (id) {
                    for (var i = 0; i < $rootScope.profile.servers.length; i++) {
                        var server = $rootScope.profile.servers[i];
                        if (server.id === id) {
                            $rootScope.profile.servers.splice(i, 1);
                        }
                    }
                };

                $scope.moveServer = function (id, toIndex) {
                    var index = $scope.findServerIndex(id);
                    if (index === null) {
                        return;
                    }
                    $scope.resourceChanged(id);
                    $rootScope.profile.servers.splice(toIndex, 0, $rootScope.profile.servers.splice(index, 1)[0]);
                };

                $scope.findServerIndex = function (id) {
                    for (var i = 0; i < $rootScope.profile.servers.length; i++) {
                        var server = $rootScope.profile.servers[i];
                        if (server.id === id) {
                            return i;
                        }
                    }
                    return null;
                };

                $scope.findMeter = function (serverId, meterId) {
                    var server = $scope.findServer(serverId);
                    if (server.meters) {
                        for (var i = 0; i < server.meters.length; i++) {
                            var meter = server.meters[i];
                            if (meter.id === meterId) {
                                return meter;
                            }
                        }
                    }
                    return null;
                };

                $scope.moveMeter = function (serverId, meterId, toIndex) {
                    var server = $scope.findServer(serverId);
                    if (!server.meters) {
                        return;
                    }
                    var index = $scope.findMeterIndex(server.meters, meterId);
                    if (index === null) {
                        return;
                    }
                    $scope.resourceChanged(serverId);
                    $scope.resourceChanged(meterId);
                    server.meters.splice(toIndex, 0, server.meters.splice(index, 1)[0]);
                };

                $scope.findMeterIndex = function (meters, meterId) {
                    for (var i = 0; i < meters.length; i++) {
                        var meter = meters[i];
                        if (meter.id === meterId) {
                            return i;
                        }
                    }
                    return null;
                };

                $scope.getElementData = function (element) {
                    var resourceId = $scope.mode === 'server' ? $scope.currentServer.id : $scope.currentMeter.id;
                    if (!element.data(resourceId)) {
                        element.data(resourceId, {});
                    }
                    return element.data(resourceId);
                };

                $scope.validateFields = function () {
                    $(this).each(function () {
                        var element = $(this);
                        var elementData = $scope.getElementData(element);
                        if (elementData.lastValue && elementData.lastValue === element.val()) {
                            return;
                        }
                        var notFirstVisit = elementData.visited;
                        if (notFirstVisit) {
                            if ($scope.mode === 'server') {
                                $scope.resourceChanged($scope.currentServer.id);
                            }
                            else {
                                $scope.resourceChanged($scope.currentMeter.id);
                                $scope.resourceChanged($scope.currentMeter.serverId);
                            }
                        }
                        else {
                            elementData.visited = true;
                        }
                        if (element.val()) {
                            elementData.lastValue = element.val();
                        }
                        else {
                            delete elementData.lastValue;
                        }
                        $scope.setFieldStatus(element, FIELD_STATUS_PENDING);
                        $scope.validate(element, notFirstVisit, function (valid, errorToast) {
                            $scope.setFieldStatus(element, valid ? FIELD_STATUS_VALID : FIELD_STATUS_INVALID, errorToast);
                        })
                    });
                };

                $scope.validate = function (element, notFirstVisit, callback) {
                    try {
                        if (!element.hasClass("validatable")) {
                            return callback(true);
                        }
                        switch (element.attr("id")) {
                            case "inputMeterType":
                                if (element.val()) {
                                    if (notFirstVisit) {
                                        $('#tree').jstree(true).set_type($scope.currentMeter.id, element.val().toLowerCase() + "-changed");
                                        $scope.resourceChanged($scope.currentMeter.id);
                                        $scope.resourceChanged($scope.currentMeter.serverId);
                                    }
                                }
                                callback(true);
                                break;
                            case "inputServerTitle":
                                if (element.val()) {
                                    $('#tree').jstree("set_text", $scope.currentServer.id, element.val());
                                    if (notFirstVisit) {
                                        $scope.resourceChanged($scope.currentServer.id);
                                    }
                                }
                                callback(element.val());
                                break;
                            case "inputServerURL":
                            case "inputServerMethod":
                                $scope.getSampleData($scope.currentServer.method, $scope.currentServer.url, function (success) {
                                    if ($scope.currentServer.url !== '') {
                                        callback(success, {
                                            title: "No Server Response",
                                            body: "Try changing the given URL or HTTP Method"
                                        });
                                    }
                                    else {
                                        callback(success);
                                    }
                                });
                                break;
                            case "inputMeterTitle":
                                if (element.val()) {
                                    $('#tree').jstree("set_text", $scope.currentMeter.id, element.val());
                                    if (notFirstVisit) {
                                        $scope.resourceChanged($scope.currentMeter.id);
                                        $scope.resourceChanged($scope.currentMeter.serverId);
                                    }
                                }
                                callback(element.val());
                                break;
                            case "inputMeterPrototypeCollectionPath":
                                var stopIndex = $scope.currentMeter.prototypeCollection.collectionPath.length;
                                callback($scope.detectPathType($scope.currentMeter.prototypeCollection.collectionPath, stopIndex) !== "VALUE");
                                break;
                            case "inputMeterPrototypeTitlePath":
                                stopIndex = $scope.currentMeter.prototypeCollection.titlePath.length;
                                callback($scope.detectPathType($scope.currentMeter.prototypeCollection.titlePath, stopIndex, [$scope.currentMeter.prototypeCollection.collectionPath, utils.chooseAny]) === "VALUE");
                                break;
                            case "inputMeterPath":
                                stopIndex = $scope.currentMeter.config.path.length;
                                callback($scope.detectPathType($scope.currentMeter.config.path, stopIndex, $scope.currentMeterPrePathArray()) === "VALUE");
                                break;
                            case "inputMeterTableCollectionPath":
                                stopIndex = $scope.currentMeter.config.table.collectionPath.length;
                                callback($scope.detectPathType($scope.currentMeter.config.table.collectionPath, stopIndex, $scope.currentMeterPrePathArray()) !== "VALUE");
                                break;
                            case "inputMeterTableTitlePath":
                                stopIndex = $scope.currentMeter.config.table.titlePath.length;
                                callback($scope.detectPathType($scope.currentMeter.config.table.titlePath, stopIndex, $scope.tablePrePathArray()) === "VALUE");
                                break;
                        }
                        if (element.hasClass("participant-value-path")) {
                            for (var i = 0; i < $scope.currentMeter.config.participants.length; i++) {
                                if (element.attr("id") === "inputMeterParticipantValuePath" + i) {
                                    var participant = $scope.currentMeter.config.participants[i];
                                    var type = $scope.detectPathType(participant.valuePath, participant.valuePath.length, $scope.participantPrePathArray(participant));
                                    return callback(type === "VALUE");
                                }
                            }
                        }
                        if (element.hasClass("participant-collection-path")) {
                            for (i = 0; i < $scope.currentMeter.config.participants.length; i++) {
                                if (element.attr("id") === "inputMeterParticipantCollectionPath" + i) {
                                    participant = $scope.currentMeter.config.participants[i];
                                    type = $scope.detectPathType(participant.collectionPath, participant.collectionPath.length, $scope.currentMeterPrePathArray());
                                    return callback(type !== "VALUE");
                                }
                            }
                        }
                        if (element.hasClass("participant-title-path")) {
                            for (i = 0; i < $scope.currentMeter.config.participants.length; i++) {
                                if (element.attr("id") === "inputMeterParticipantTitlePath" + i) {
                                    participant = $scope.currentMeter.config.participants[i];
                                    type = $scope.detectPathType(participant.titlePath, participant.titlePath.length, $scope.participantPrePathArray(participant));
                                    return callback(type === "VALUE");
                                }
                            }
                        }
                        if (element.hasClass("table-value-path")) {
                            for (i = 0; i < $scope.currentMeter.config.table.values.length; i++) {
                                if (element.attr("id") === "inputMeterTableValuePath" + i) {
                                    var value = $scope.currentMeter.config.table.values[i];
                                    type = $scope.detectPathType(value.valuePath, value.valuePath.length, $scope.tablePrePathArray());
                                    return callback(type === "VALUE");
                                }
                            }
                        }
                        if (element.hasClass("always-valid")) {
                            return callback(true);
                        }
                        if (element.hasClass("not-empty")) {
                            return callback(element.val());
                        }
                    } catch (e) {
                        callback(false);
                    }
                };

                $scope.onIsPrototypeChange = function () {
                    if ($scope.currentMeter.isPrototype) {
                        $scope.$$postDigest(function () {
                            $scope.validateFields.apply($(".validatable, .prototype-path"));
                        });
                    }
                };

                $scope.onMeterTypeChange = function () {
                    switch ($scope.currentMeter.type) {
                        case "GRAPH":
                            $scope.currentMeter.config = {
                                maxHistory: 120,
                                participants: []
                            };
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".validatable, .participant-collection-path, .participant-title-path, .participant-value-path"));
                            });
                            break;
                        case "PIE":
                            $scope.currentMeter.config = {
                                participants: []
                            };
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".validatable, .participant-collection-path, .participant-title-path, .participant-value-path"));
                            });
                            break;
                        case "VALUE":
                            $scope.currentMeter.config = {
                                prefix: "",
                                suffix: "",
                                path: []
                            };
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".validatable, #inputMeterPath"));
                            });
                            break;
                        case "TABLE":
                            $scope.currentMeter.config = {
                                table: {
                                    collectionPath: [],
                                    titlePath: [],
                                    values: []
                                }
                            };
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".validatable, #inputMeterTableCollectionPath, #inputMeterTableTitlePath, .table-value-path"));
                            });
                            break;
                    }
                };

                $scope.onParticipantTypeChange = function (participant) {
                    switch (participant.type) {
                        case "INSTANCE":
                            delete participant["collectionPath"];
                            delete participant["titlePath"];
                            participant.title = "";
                            participant.valuePath = [];
                            break;
                        case "COLLECTION":
                            delete participant["title"];
                            participant.collectionPath = [];
                            participant.titlePath = [];
                            participant.valuePath = [];
                            break;
                    }
                    $scope.$$postDigest(function () {
                        $scope.validateFields.apply($(".validatable"));
                    });
                };

                $scope.getSampleData = function (method, url, callback) {
                    if (url === "") {
                        return callback(false);
                    }
                    $http({url: url, method: method})
                        .then(function (response) {
                            if (response.status === 200) {
                                $scope.currentSample = response.data;
                                if (callback) {
                                    callback(true);
                                }
                            }
                            else if (callback) {
                                callback(false);
                            }
                        }, function () {
                            if (callback) {
                                callback(false);
                            }
                        });
                };

                var FIELD_STATUS_INVALID = 0, FIELD_STATUS_VALID = 1, FIELD_STATUS_PENDING = 2;
                $scope.setFieldStatus = function (element, status, errorToast) {
                    var parent = $scope.findParentByClass(element, "form-group");
                    if (parent) {
                        var indicator = parent.find(".form-control-feedback");
                        if (status === FIELD_STATUS_INVALID) {
                            parent.addClass("has-error").removeClass("has-success");
                            indicator.removeClass("ion-checkmark-circled").addClass("ion-android-cancel").removeClass("pending-feedback");
                            if (errorToast) {
                                toastr.error(errorToast.body, errorToast.title);
                            }
                        }
                        else if (status === FIELD_STATUS_VALID) {
                            parent.removeClass("has-error").addClass("has-success");
                            indicator.addClass("ion-checkmark-circled").removeClass("ion-android-cancel").removeClass("pending-feedback");
                        }
                        else if (status === FIELD_STATUS_PENDING) {
                            indicator.addClass("pending-feedback");
                        }
                    }
                };

                $scope.findParentByClass = function (element, className) {
                    var parent = element;
                    while (parent && !parent.hasClass(className)) {
                        parent = parent.parent();
                    }
                    return parent;
                };

                $scope.countPathRecords = function (pathArray) {
                    if (!pathArray) {
                        return "-";
                    }
                    var value = $scope.walkPathArray(pathArray, pathArray.length);
                    var type = $scope.detectType(value);
                    if (type === "ARRAY") {
                        return value.length;
                    }
                    else if (type === "VALUE") {
                        return "-";
                    }
                    var result = 0;
                    for (var key in value) {
                        if (value.hasOwnProperty(key)) {
                            result++;
                        }
                    }
                    return result;
                };

                $scope.beautifyPath = function (pathArray) {
                    if (pathArray === "{{key}}") {
                        return "root key";
                    }
                    var result = "";
                    if (pathArray) {
                        for (var i = 0; i < pathArray.length; i++) {
                            var entry = pathArray[i];
                            if (entry.type === "ARRAY") {
                                var conditions = [];
                                for (var key in entry.conditions) {
                                    if (entry.conditions.hasOwnProperty(key)) {
                                        conditions.push(key + ":" + entry.conditions[key]);
                                    }
                                }
                                result += "[" + conditions.join(",") + "]";
                            }
                            else {
                                result += "." + entry.result;
                            }
                        }
                    }
                    return result;
                };

                $scope.editPrototypeCollectionPath = function () {
                    $scope.generatePath(
                        'Prototype Collection',
                        $scope.currentMeter.prototypeCollection.collectionPath,
                        [],
                        false,
                        false,
                        function (path) {
                            $scope.currentMeter.prototypeCollection.collectionPath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".prototype-path"));
                            });
                        }
                    )
                };

                $scope.editPrototypeTitlePath = function () {
                    $scope.generatePath(
                        'Prototype Title',
                        $scope.currentMeter.prototypeCollection.titlePath,
                        [$scope.currentMeter.prototypeCollection.collectionPath, utils.chooseAny],
                        true,
                        true,
                        function (path) {
                            $scope.currentMeter.prototypeCollection.titlePath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($(".prototype-path"));
                            });
                        }
                    )
                };

                $scope.editParticipantCollectionPath = function (participant, index) {
                    $scope.generatePath(
                        'Participant Collection',
                        participant.collectionPath,
                        $scope.currentMeterPrePathArray(),
                        false,
                        false,
                        function (path) {
                            participant.collectionPath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterParticipantCollectionPath" + index));
                            });
                        }
                    )
                };

                $scope.editParticipantTitlePath = function (participant, index) {
                    $scope.generatePath(
                        'Participant Title',
                        participant.titlePath,
                        $scope.participantPrePathArray(participant),
                        true,
                        true,
                        function (path) {
                            participant.titlePath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterParticipantTitlePath" + index));
                            });
                        }
                    )
                };

                $scope.editParticipantValuePath = function (participant, index) {
                    $scope.generatePath(
                        participant.title + ' Data',
                        participant.valuePath,
                        $scope.participantPrePathArray(participant),
                        true,
                        false,
                        function (path) {
                            participant.valuePath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterParticipantValuePath" + index));
                            });
                        }
                    )
                };

                $scope.editValuePath = function () {
                    $scope.generatePath(
                        $scope.currentMeter.title + ' Data',
                        $scope.currentMeter.config.path,
                        $scope.currentMeterPrePathArray(),
                        true,
                        false,
                        function (path) {
                            $scope.currentMeter.config.path = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterPath"));
                            });
                        }
                    )
                };

                $scope.editTableCollectionPath = function () {
                    $scope.generatePath(
                        $scope.currentMeter.title + ' Collection',
                        $scope.currentMeter.config.table.collectionPath,
                        $scope.currentMeterPrePathArray(),
                        false,
                        false,
                        function (path) {
                            $scope.currentMeter.config.table.collectionPath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterTableCollectionPath"));
                            });
                        }
                    )
                };

                $scope.editTableTitlePath = function () {
                    $scope.generatePath(
                        $scope.currentMeter.title + ' Row Title',
                        $scope.currentMeter.config.table.titlePath,
                        $scope.tablePrePathArray(),
                        true,
                        true,
                        function (path) {
                            $scope.currentMeter.config.table.titlePath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterTableTitlePath"));
                            });
                        }
                    )
                };

                $scope.editTableValuePath = function (value, index) {
                    $scope.generatePath(
                        'Participant Title',
                        value.valuePath,
                        $scope.tablePrePathArray(),
                        true,
                        false,
                        function (path) {
                            value.valuePath = path;
                            $scope.$$postDigest(function () {
                                $scope.validateFields.apply($("#inputMeterTableValuePath" + index));
                            });
                        }
                    )
                };

                $scope.generatePath = function (title, pathArray, prePathArrays, isLeaf, enableKeys, callback) {
                    var modal = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/path.html',
                        controller: 'PathGeneratorCtrl',
                        size: 'lg',
                        scope: $scope,
                        resolve: {
                            data: function () {
                                return {
                                    title: title,
                                    current: pathArray,
                                    pre: prePathArrays,
                                    isLeaf: isLeaf,
                                    enableKeys: enableKeys
                                }
                            }
                        }
                    });
                    modal.result.then(callback);
                };

                $scope.addColumn = function () {
                    var index = $scope.currentMeter.config.table.values.length;
                    $scope.currentMeter.config.table.values.push({
                        title: "",
                        valuePath: []
                    });
                    $scope.$$postDigest(function () {
                        $scope.validateFields.apply($(".validatable, #inputMeterTableValuePath" + index));
                    });
                };

                $scope.removeColumn = function (index) {
                    $scope.currentMeter.config.table.values.splice(index, 1);
                    $scope.$$postDigest(function () {
                        $scope.validateFields.apply($(".validatable, #inputMeterTableValuePath" + index));
                    });
                };

                $scope.addParticipant = function () {
                    var index = $scope.currentMeter.config.participants.length;
                    $scope.currentMeter.config.participants.push({
                        type: "INSTANCE",
                        title: "",
                        valuePath: []
                    });
                    $scope.$$postDigest(function () {
                        $scope.validateFields.apply($(".validatable, #inputMeterParticipantValuePath" + index));
                    });
                };

                $scope.removeParticipant = function (index) {
                    $scope.currentMeter.config.participants.splice(index, 1);
                    $scope.$$postDigest(function () {
                        $scope.validateFields.apply($(".validatable, #inputMeterParticipantValuePath" + index));
                    });
                };

                $scope.currentMeterPrePathArray = function () {
                    return $scope.currentMeter.isPrototype ?
                        [$scope.currentMeter.prototypeCollection.collectionPath, utils.chooseAny] : [];
                };

                $scope.participantPrePathArray = function (participant) {
                    var prePathArray = $scope.currentMeterPrePathArray();
                    if (participant.type === "COLLECTION") {
                        prePathArray.push(participant.collectionPath);
                        prePathArray.push(utils.chooseAny);
                    }
                    return prePathArray;
                };

                $scope.tablePrePathArray = function () {
                    var prePathArray = $scope.currentMeterPrePathArray();
                    prePathArray.push($scope.currentMeter.config.table.collectionPath);
                    prePathArray.push(utils.chooseAny);
                    return prePathArray;
                };

                $scope.detectPathType = function (pathArray, stopIndex, prePathArrays) {
                    return $scope.detectType($scope.walkPathArray(pathArray, stopIndex, prePathArrays));
                };

                $scope.detectType = function (value) {
                    if (typeof value === "object") {
                        return value instanceof Array ? "ARRAY" : "OBJECT";
                    }
                    return "VALUE";
                };

                $("body")
                    .on("change", ".validatable", $scope.validateFields)
                    .on("keyup", ".validatable.on-keypress", $scope.validateFields);
                $scope.$on("$destroy", function () {
                    $("body")
                        .off("change", ".validatable", $scope.validateFields)
                        .off("keyup", ".validatable.on-keypress", $scope.validateFields);
                });

                $scope.treeConfig = {
                    core: {
                        multiple: false,
                        check_callback: function (operation, node, nodeParent) {
                            if (operation === "move_node") {
                                if (node.type === "server" || node.type === "server-changed") {
                                    return nodeParent.type === "#";
                                }
                                return (nodeParent.type === "server" || nodeParent.type === "server-changed") &&
                                    node.data.server === nodeParent.data.key;
                            }
                            return true;
                        },
                        themes: {
                            dots: false,
                            responsive: false
                        }
                    },
                    dnd: {
                        check_while_dragging: true
                    },
                    types: {
                        "server": {
                            icon: 'tree-icon fa fa-server'
                        },
                        "graph": {
                            icon: 'tree-icon fa fa-area-chart'
                        },
                        "pie": {
                            icon: 'tree-icon fa fa-pie-chart'
                        },
                        "table": {
                            icon: 'tree-icon fa fa-table'
                        },
                        "value": {
                            icon: 'tree-icon fa fa-info'
                        },
                        "server-changed": {
                            icon: 'tree-icon fa fa-server has-changes'
                        },
                        "graph-changed": {
                            icon: 'tree-icon fa fa-area-chart has-changes'
                        },
                        "pie-changed": {
                            icon: 'tree-icon fa fa-pie-chart has-changes'
                        },
                        "table-changed": {
                            icon: 'tree-icon fa fa-table has-changes'
                        },
                        "value-changed": {
                            icon: 'tree-icon fa fa-info has-changes'
                        }
                    },
                    contextmenu: {
                        select_node: false,
                        show_at_node: false,
                        items: function (node) {
                            if (node.type === 'server' || node.type === 'server-changed') {
                                return {
                                    addMeter: {
                                        label: "Add new meter",
                                        title: "Add a new meter to this server",
                                        icon: "fa fa-area-chart",
                                        separator_after: true,
                                        action: function () {
                                            $scope.addMeter(node.data.key)
                                        }
                                    },
                                    addServer: {
                                        label: "Add new server",
                                        title: "Add a new server after this one",
                                        icon: "fa fa-server",
                                        separator_after: true,
                                        action: $scope.addNewServer
                                    },
                                    duplicate: {
                                        label: "Duplicate server",
                                        title: "Create another server identical to this one",
                                        icon: "fa fa-clone",
                                        action: function () {
                                            $scope.duplicateServer(node.data.key)
                                        }
                                    },
                                    remove: {
                                        label: "Remove server",
                                        title: "Remove this server and all it's meters",
                                        icon: "fa fa-trash-o",
                                        action: function () {
                                            $scope.removeServer(node.data.key)
                                        }
                                    }
                                };
                            }
                            return {
                                addMeter: {
                                    label: "Add new meter",
                                    title: "Add a new meter after this one",
                                    icon: "fa fa-area-chart",
                                    separator_after: true,
                                    action: function () {
                                        $scope.addMeter(node.data.server)
                                    }
                                },
                                duplicate: {
                                    label: "Duplicate meter",
                                    title: "Create another meter identical to this one",
                                    icon: "fa fa-clone",
                                    action: function () {
                                        $scope.duplicateMeter(node.data.server, node.data.meter)
                                    }
                                },
                                remove: {
                                    label: "Remove meter",
                                    title: "Remove this meter",
                                    icon: "fa fa-trash-o",
                                    action: function () {
                                        $scope.removeMeter(node.data.server, node.data.meter)
                                    }
                                }
                            };
                        }
                    },
                    plugins: ['dnd', 'types', 'contextmenu']
                };

                $scope.removeMeter = function (serverId, meterId) {
                    var server = $scope.findServer(serverId);
                    if (!server.meters) {
                        return;
                    }
                    for (var i = 0; i < server.meters.length; i++) {
                        if (server.meters[i].id == meterId) {
                            server.meters.splice(i, 1);
                            break;
                        }
                    }
                    $scope.resourceChanged(serverId);
                    $("#tree").jstree("delete_node", meterId, serverId);
                    if ($scope.mode === 'meter' && $scope.currentMeter.id == meterId) {
                        $(".has-error").removeClass("has-error");
                        $scope.$$postDigest(function () {
                            $("#tree").jstree("deselect_all").jstree("select_node", serverId);
                        });
                    }
                };

                $scope.removeServer = function (serverId) {
                    var idsToRemove = [{id: serverId, parent: "#"}];
                    var server = $scope.findServer(serverId);
                    if (server.meters) {
                        for (var i = 0; i < server.meters.length; i++) {
                            idsToRemove.push({id: server.meters[i].id, parent: serverId});
                        }
                    }
                    $scope.removeServerInstance(serverId);
                    $scope.resourceChanged(serverId);
                    for (i = 0; i < idsToRemove.length; i++) {
                        var entry = idsToRemove[i];
                        $("#tree").jstree("delete_node", entry.id, entry.parent);
                    }
                    if ($rootScope.profile.servers.length > 0) {
                        if ($scope.mode === 'server' && $scope.currentServer.id == serverId) {
                            $(".has-error").removeClass("has-error");
                            $scope.$$postDigest(function () {
                                $("#tree").jstree("deselect_all").jstree("select_node", $rootScope.profile.servers[0].id);
                            });
                        }
                    }
                    else {
                        $scope.mode = null;
                        $scope.currentServer = null;
                        $scope.currentMeter = null;
                    }
                };

                $scope.duplicateMeter = function (serverId, meterId) {
                    if (!$scope.validateSwitch()) {
                        return;
                    }
                    var currentMeter = $scope.findMeter(serverId, meterId);
                    var newMeter = utils.cloneObject(currentMeter);
                    newMeter.id = utils.guid();
                    newMeter.title = "Copy of " + newMeter.title;
                    var server = $scope.findServer(serverId);
                    if (!server.meters) {
                        server.meters = [];
                    }
                    server.meters.push(newMeter);
                    $("#tree").jstree("create_node", server.id, $scope.meterToTreeNode(server.id, newMeter), "last");
                    $scope.$$postDigest(function () {
                        $('#tree').jstree("deselect_all").jstree("select_node", newMeter.id);
                        $scope.resourceChanged(newMeter.id);
                        $scope.resourceChanged(server.id);
                    });
                };

                $scope.duplicateServer = function (serverId) {
                    if (!$scope.validateSwitch()) {
                        return;
                    }
                    var newServer = utils.cloneObject($scope.findServer(serverId));
                    newServer.id = utils.guid();
                    newServer.title = "Copy of " + newServer.title;
                    $rootScope.profile.servers.push(newServer);
                    if (newServer.meters) {
                        for (var i = 0; i < newServer.meters.length; i++) {
                            newServer.meters[i].id = utils.guid();
                        }
                    }
                    var allTreeNodes = $scope.serverToTreeNodes(newServer);
                    for (i = 0; i < allTreeNodes.length; i++) {
                        $("#tree").jstree("create_node", allTreeNodes[i].parent, allTreeNodes[i], "last");
                    }
                    $scope.$$postDigest(function () {
                        $('#tree').jstree("deselect_all").jstree("select_node", newServer.id);
                        $scope.resourceChanged(newServer.id);
                        for (i = 0; i < newServer.meters.length; i++) {
                            $scope.resourceChanged(newServer.meters[i].id);
                        }
                    });
                };

                $scope.addMeter = function (serverId) {
                    if (!$scope.validateSwitch()) {
                        return;
                    }
                    var server = $scope.findServer(serverId);
                    if (!server.meters) {
                        server.meters = [];
                    }
                    var meter = {
                        id: utils.guid(),
                        serverId: serverId,
                        title: "New Meter",
                        width: 12,
                        type: "GRAPH",
                        isPrototype: false,
                        prototypeCollection: {
                            collectionPath: [],
                            titlePrefix: "",
                            titleSuffix: "",
                            titlePath: []
                        },
                        config: {
                            maxHistory: 120,
                            participants: []
                        }
                    };
                    server.meters.push(meter);
                    $("#tree").jstree("create_node", serverId, $scope.meterToTreeNode(serverId, meter), "last");
                    $scope.$$postDigest(function () {
                        $("#tree").jstree("deselect_all").jstree("select_node", meter.id);
                        $scope.resourceChanged(serverId);
                        $scope.resourceChanged(meter.id);
                    });
                };

                $scope.addNewServer = function () {
                    if (!$scope.validateSwitch()) {
                        return;
                    }
                    var server = {
                        id: utils.guid(),
                        user: $rootScope.email,
                        title: "New Server",
                        url: "",
                        method: "GET",
                        refreshRate: "5",
                        meters: []
                    };
                    $rootScope.profile.servers.push(server);
                    $("#tree").jstree("create_node", "#", $scope.serverToTreeNodes(server)[0], "last");
                    $scope.$$postDigest(function () {
                        $("#tree").jstree("deselect_all").jstree("select_node", server.id);
                        $scope.resourceChanged(server.id);
                    });
                    return server.id;
                };

                $scope.validateSwitch = function () {
                    if ($(".has-error").length > 0) {
                        toastr.error("Fix all errors before moving on.", "Oops!");
                        return false;
                    }
                    return true;
                };

                $scope.treeEventsObj = {
                    select_node: function (e, data) {
                        if ($scope.pendingSelectError) {
                            $scope.pendingSelectError = false;
                            return;
                        }
                        if (!$scope.validateSwitch()) {
                            $scope.pendingSelectError = true;
                            $("#tree").jstree("deselect_all").jstree("select_node", $scope.selected);
                            return;
                        }
                        $scope.selected = data.node.id;
                        if (data.node.type === 'server' || data.node.type === 'server-changed') {
                            var server = $scope.findServer(data.node.data.key);
                        }
                        else {
                            var meter = $scope.findMeter(data.node.data.server, data.node.data.meter);
                            server = $scope.findServer(meter.serverId)
                        }
                        $scope.getSampleData(server.method, server.url, function () {
                            if (data.node.type === 'server' || data.node.type === 'server-changed') {
                                $scope.mode = 'server';
                                $scope.currentServer = server;
                            }
                            else {
                                $scope.mode = 'meter';
                                $scope.currentMeter = meter;
                            }
                            $scope.$$postDigest(function () {
                                $scope.$$postDigest(function () {
                                    $(".validatable").trigger("change");
                                });
                            });
                        });
                    },
                    move_node: function (e, data) {
                        if (data.node.type === 'server' || data.node.type === 'server-changed') {
                            $scope.moveServer(data.node.data.key, data.position);
                        }
                        else {
                            $scope.moveMeter(data.node.data.server, data.node.data.meter, data.position);
                        }
                    },
                    ready: function () {
                        if (!$rootScope.stateParams || !$rootScope.stateParams.resourceId) {
                            $scope.$$postDigest($scope.addNewServer);
                        }
                        else {
                            $("#tree").jstree("select_node", $rootScope.stateParams.resourceId);
                        }
                    }
                };

                $scope.serverToTreeNodes = function (server) {
                    var result = [];
                    result.push({
                        id: server.id,
                        parent: "#",
                        type: "server",
                        text: server.title,
                        state: {selected: false},
                        data: {key: server.id}
                    });
                    if (server.meters) {
                        for (var i = 0; i < server.meters.length; i++) {
                            result.push($scope.meterToTreeNode(server.id, server.meters[i]));
                        }
                    }
                    return result;
                };

                $scope.meterToTreeNode = function (serverId, meter) {
                    return {
                        id: meter.id,
                        parent: serverId,
                        type: meter.type.toLowerCase(),
                        text: meter.title,
                        state: {selected: false},
                        data: {
                            server: serverId,
                            meter: meter.id
                        }
                    };
                };

                var unloadWarningMessage = "You have made some unsaved changes. Are you sure you want to leave without saving them first?";
                $scope.resourceChanged = function (resourceId) {
                    $scope.changedResources[resourceId] = true;
                    window.onbeforeunload = function () {
                        return unloadWarningMessage;
                    };
                    var tree = $('#tree').jstree(true);
                    var node = tree.get_node(resourceId);
                    var type = node.type.substr(-8) === "-changed" ? node.type : node.type + "-changed";
                    tree.set_type(resourceId, type);
                };
                $scope.clearChanges = function () {
                    $scope.changedResources = {};
                    window.onbeforeunload = null;
                };
                $scope.changesMade = function () {
                    for (var key in $scope.changedResources) {
                        if ($scope.changedResources.hasOwnProperty(key)) {
                            return true;
                        }
                    }
                    return false;
                };
                $scope.clearChanges();

                $scope.$on('$stateChangeStart', function (event, toState) {
                    if ($scope.changesMade()) {
                        event.preventDefault();
                        $rootScope.confirm(
                            unloadWarningMessage,
                            "Before You Leave",
                            function () {
                                $scope.clearChanges();
                                $rootScope.reloadProfile();
                                $rootScope.navigate(toState.name, $rootScope.stateParams);
                            }
                        );
                    }
                });

                $scope.cancel = function () {
                    $rootScope.confirm(
                        'Are you sure you wish to cancel all changes to ' + $rootScope.profile.name + ' profile?',
                        'Cancel Changes',
                        function () {
                            $scope.clearChanges();
                            $rootScope.reloadProfile();
                            $rootScope.goHome();
                        }
                    );
                };

                $scope.save = function () {
                    $scope.clearChanges();
                    $rootScope.saveProfile();
                    $rootScope.goHome();
                };

                $scope.treeData = [];
                for (var i = 0; i < $rootScope.profile.servers.length; i++) {
                    var nodes = $scope.serverToTreeNodes($rootScope.profile.servers[i]);
                    for (var j = 0; j < nodes.length; j++) {
                        $scope.treeData.push(nodes[j]);
                    }
                }

            }]);
})();