'use strict';

angular
    .module('BlurAdmin', [
        'ngAnimate',
        'ui.bootstrap',
        'ui.sortable',
        'ui.router',
        'ngTouch',
        'toastr',
        'smart-table',
        "xeditable",
        'ui.slimscroll',
        'ngJsTree',
        'angular-progress-button-styles',
        'BlurAdmin.theme'
    ])
    .config(amChartConfig)
    .config(routesConfig)
    .factory('comparator', comparatorFactory)
    .controller('LoginCtrl', loginCtrl)
    .controller('MonitorCtrl', monitorCtrl)
    .controller('EditCtrl', editCtrl)
    .controller('ProfileCtrl', profileCtrl)
    .controller('PathGeneratorCtrl', pathGeneratorCtrl)
    .controller('ConfirmCtrl', confirmCtrl);

function routesConfig($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
        .state('login', {
            url: '/login',
            title: 'Sign In - BlurMonitor',
            templateUrl: 'app/login.html',
            controller: 'LoginCtrl'
        });
    $stateProvider
        .state('edit', {
            url: '/edit/:resourceId',
            title: 'Edit Servers',
            templateUrl: 'app/edit.html',
            controller: 'EditCtrl'
        });
    $stateProvider
        .state('monitor', {
            url: '/monitor/:serverId',
            title: 'Monitor',
            templateUrl: 'app/monitor.html',
            controller: 'MonitorCtrl'
        });
    $stateProvider
        .state('profile', {
            url: '/profile',
            title: 'Edit Profile',
            templateUrl: 'app/profile.html',
            controller: 'ProfileCtrl'
        });
    $urlRouterProvider.otherwise('login');
}

function comparatorFactory() {
    function arrayEquals(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (var i = 0; i < arr1.length; i++) {
            if (!equals(arr1[i], arr2[i])) {
                return false;
            }
        }
        return true;
    }
    function objectEquals(obj1, obj2) {
        return objectContains(obj1, obj2) && objectContains(obj2, obj1);
    }
    function objectContains(contains, containee) {
        for (var key in contains) {
            if (contains.hasOwnProperty(key)) {
                if (!containee.hasOwnProperty(key)) {
                    return false;
                }
                if (!equals(contains[key], containee[key])) {
                    return false;
                }
            }
        }
        return true;
    }
    function equals(value1, value2) {
        if (typeof value1 === "object") {
            if (value1 instanceof Array) {
                // value2 should be array
                return value2 instanceof Array && arrayEquals(value1, value2);
            }
            // value2 should not be array
            return typeof value2 === "object" && !(value2 instanceof Array) && objectEquals(value1, value2);
        }
        // both should not be array
        return typeof value2 !== "object" && value1 == value2;
    }
    return {test: equals}
}

function profileCtrl($scope, $rootScope, $state, toastr) {

    if (typeof $rootScope.profile === "undefined") {
        $rootScope.pendingRedirect = {
            state: $state.current.name
        };
        return $state.go('login');
    }

    $("title").text("Edit Profile - BlueMonitor");

    $scope.avatar = 0;
    for (var i = 0; i < $rootScope.AVATARS.length; i++) {
        var current = $rootScope.AVATARS[i];
        if (current.name === $rootScope.profile.avatar) {
            $scope.avatar = i;
            break;
        }
    }
    $scope.color = 0;
    for (i = 0; i < $rootScope.COLORS.length; i++) {
        current = $rootScope.COLORS[i];
        if (current === $rootScope.profile.color) {
            $scope.color = i;
            break;
        }
    }

    $scope.nextAvatar = function () {
        $scope.avatar = ($scope.avatar + 1) % $rootScope.AVATARS.length;
    };

    $scope.nextColor = function () {
        $scope.color = ($scope.color + 1) % $rootScope.COLORS.length;
    };

    $scope.validateSwitch = function () {
        if ($(".has-error").length > 0) {
            toastr.error("Fix all errors before moving on.", "Oops!");
            return false;
        }
        return true;
    };

    $scope.update = function () {
        if (!$scope.validateSwitch()) {
            return;
        }
        var redirect = $rootScope.firstProfileUpdate;
        $rootScope.firstProfileUpdate = false;
        $rootScope.profile.name = $("#inputProfileName").val();
        $rootScope.profile.avatar = $rootScope.AVATARS[$scope.avatar].name;
        $rootScope.profile.color = $rootScope.COLORS[$scope.color];
        $rootScope.saveProfile();
        toastr.success("Profile updated");
        if (redirect) {
            $state.go('edit');
        }
    };

    $scope.remove = function () {
        $rootScope.confirm(
            'Once removing a profile it is unrecoverable. Are you sure you want to remove it?',
            'Remove Profile',
            $rootScope.removeProfile
        );
    };

    $scope.validateFields = function () {
        $(this).each(function() {
            var element = $(this);
            switch (element.attr("id")) {
                case "inputProfileName":
                    var toast;
                    if (element.data("committedChanged")) {
                        toast = {body: "Profile name must not be empty"};
                    }
                    element.data("committedChanged", true);
                    $scope.setFieldError(element, element.val(), toast);
                    break;
            }
        });
    };

    $scope.setFieldError = function (element, isValid, errorToast) {
        var parent = element;
        while (parent && !parent.hasClass("form-group")) {
            parent = parent.parent();
        }
        if (parent) {
            var indicator = parent.find(".form-control-feedback");
            if (isValid) {
                parent.removeClass("has-error").addClass("has-success");
                indicator.addClass("ion-checkmark-circled").removeClass("ion-android-cancel");
            }
            else {
                parent.addClass("has-error").removeClass("has-success");
                indicator.removeClass("ion-checkmark-circled").addClass("ion-android-cancel");
                if (errorToast) {
                    toastr.error(errorToast.body, errorToast.title);
                }
            }
        }
    };

    $("body").on("change", ".validatable", $scope.validateFields);
    angular.element(document).ready(function () {
        $(".validatable").trigger('change');
        $("#inputProfileName").trigger("focus");
    });
    $scope.$on("$destroy", function () {
        $("body").off("change", ".validatable", $scope.validateFields);
    });

}

function confirmCtrl($scope) {

    $scope.title = $scope.$resolve.data.title;
    $scope.body = $scope.$resolve.data.body;

}

function pathGeneratorCtrl($scope, comparator) {

    $scope.title = $scope.$resolve.data.title;
    $scope.isLeaf = $scope.$resolve.data.isLeaf;
    $scope.result = $scope.$resolve.data.current;

    $scope.pathTreeData = [];
    function createTreeData(key, input, parent, path) {
        var type = $scope.detectType(input);
        var node = {
            id: $scope.pathTreeData.length,
            parent: parent,
            type: type.toLowerCase(),
            text: key + (type !== "VALUE" ? '' : ' (' + trimString(input, 30) + ')'),
            state: {
                selected: comparator.test(path, $scope.result),
                disabled: $scope.isLeaf ? type !== "VALUE" : type === "VALUE"
            },
            data: {
                path: path
            }
        };
        $scope.pathTreeData.push(node);
        if (type !== "VALUE") {
            for (var currentKey in input) {
                if (input.hasOwnProperty(currentKey)) {
                    if (type === "OBJECT") {
                        var childPath = immutableArrayAdd(path, new PathObjectEntry(currentKey));
                    }
                    else if (type === "ARRAY") {
                        var child = input[currentKey];
                        var childType = $scope.detectType(child);
                        if (childType !== "OBJECT") {
                            childPath = immutableArrayAdd(path, new PathObjectEntry(currentKey));
                        }
                        else {
                            var conditions = {};
                            for (var childKey in child) {
                                if (child.hasOwnProperty(childKey)) {
                                    var childValue = child[childKey];
                                    if ($scope.detectType(childValue) === "VALUE") {
                                        conditions[childKey] = childValue;
                                    }
                                }
                            }
                            childPath = immutableArrayAdd(path, new PathArrayEntry(conditions));
                        }
                    }
                    createTreeData(currentKey, input[currentKey], node.id, childPath);
                }
            }
        }
    }
    if ($scope.$resolve.data.enableKeys) {
        var prePathArray = $scope.$resolve.data.pre;
        if (prePathArray.length > 0 && prePathArray[prePathArray.length - 1] === chooseAny) {
            var collection = $scope.walkPathArray([], 0, prePathArray.slice(0, prePathArray.length - 1));
            var keys = [];
            var hasMore = false;
            for (var key in collection) {
                if (collection.hasOwnProperty(key)) {
                    if (keys.length > 2) {
                        hasMore = true;
                        break;
                    }
                    keys.push(trimString(key, 20));
                }
            }
            keys = keys.join(", ");
            if (hasMore) {
                keys += ", ...";
            }
            $scope.pathTreeData.push({
                id: "{{key}}",
                parent: "#",
                type: "value",
                text: 'root key (i.e. ' + keys + ')',
                state: {
                    selected: $scope.result === "{{key}}",
                    disabled: !$scope.isLeaf
                },
                data: {path: "{{key}}"}
            });
        }
    }
    var root = $scope.walkPathArray([], 0, $scope.$resolve.data.pre);
    createTreeData("root", root, "#", []);

    $scope.pathTreeConfig = {
        core: {
            check_callback: true,
            themes: {
                dots: true,
                responsive: false,
                ellipsis: true,
                stripes: true
            }
        },
        types: {
            array: {
                icon: 'fa fa-list text-primary'
            },
            object: {
                icon: 'fa fa-list text-primary'
            },
            value: {
                icon: 'fa fa-leaf text-primary'
            }
        },
        plugins: ['types']
    };

    $scope.pathTreeEventsObj = {
        select_node: function (e, data) {
            $scope.result = data.node.data.path;
        }
    };

    $scope.update = function () {
        $scope.$close($scope.result);
    };

}

function editCtrl($scope, $http, $rootScope, $state, toastr, $uibModal, $stateParams) {

    if (typeof $rootScope.profile === "undefined") {
        $rootScope.pendingRedirect = {
            state: $state.current.name,
            params: $stateParams
        };
        return $state.go('login');
    }

    $("title").text("Edit Servers - BlueMonitor");

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

    $scope.validateFields = function () {
        $(this).each(function() {
            var element = $(this);
            if (element.data("lastValue") && element.data("lastValue") === element.val()) {
                return;
            }
            var notFirstVisit = element.data("visited");
            if (notFirstVisit) {
                $scope.hasChanges(true);
                if ($scope.mode === 'server') {
                    $scope.markChanges($scope.currentServer.id);
                }
                else {
                    $scope.markChanges($scope.currentMeter.id);
                    $scope.markChanges($scope.currentMeter.serverId);
                }
            }
            else {
                element.data("visited", true);
            }
            if (element.val()) {
                element.data("lastValue", element.val());
            }
            else {
                delete element.data()["lastValue"];
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
                case "inputMeterWidth":
                    callback(true);
                    break;
                case "inputMeterType":
                    if (element.val()) {
                        $('#tree').jstree(true).set_type($scope.currentMeter.id, element.val().toLowerCase());
                        if (notFirstVisit) {
                            $scope.markChanges($scope.currentMeter.id);
                            $scope.markChanges($scope.currentMeter.serverId);
                        }
                    }
                    callback(true);
                    break;
                case "inputServerTitle":
                    if (element.val()) {
                        $('#tree').jstree("set_text", $scope.currentServer.id, element.val());
                        if (notFirstVisit) {
                            $scope.markChanges($scope.currentServer.id);
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
                            $scope.markChanges($scope.currentMeter.id);
                            $scope.markChanges($scope.currentMeter.serverId);
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
                    callback($scope.detectPathType($scope.currentMeter.prototypeCollection.titlePath, stopIndex, [$scope.currentMeter.prototypeCollection.collectionPath, chooseAny]) === "VALUE");
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
                    callback($scope.detectPathType($scope.currentMeter.config.table.titlePath, stopIndex, $scope.currentMeterPrePathArray()) === "VALUE");
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

    $scope.$watch('currentMeter.isPrototype', function (value) {
        if (value) {
            $scope.$$postDigest(function() {
                $scope.validateFields.apply($(".validatable, .prototype-path"));
            });
        }
    });

    $scope.$watch('currentMeter.type', function (value, oldValue) {
        if (!oldValue || value === oldValue) {
            return;
        }
        switch (value) {
            case "GRAPH":
                $scope.currentMeter.config = {
                    maxHistory: 120,
                    participants: []
                };
                $scope.$$postDigest(function() {
                    $scope.validateFields.apply($(".validatable, .participant-collection-path, .participant-title-path, .participant-value-path"));
                });
                break;
            case "PIE":
                $scope.currentMeter.config = {
                    participants: []
                };
                $scope.$$postDigest(function() {
                    $scope.validateFields.apply($(".validatable, .participant-collection-path, .participant-title-path, .participant-value-path"));
                });
                break;
            case "VALUE":
                $scope.currentMeter.config = {
                    prefix: "",
                    suffix: "",
                    path: []
                };
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
                    $scope.validateFields.apply($(".validatable, #inputMeterTableCollectionPath, #inputMeterTableTitlePath, .table-value-path"));
                });
                break;
        }
    });

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
        $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
                    $scope.validateFields.apply($(".prototype-path"));
                });
            }
        )
    };

    $scope.editPrototypeTitlePath = function () {
        $scope.generatePath(
            'Prototype Title',
            $scope.currentMeter.prototypeCollection.titlePath,
            [$scope.currentMeter.prototypeCollection.collectionPath, chooseAny],
            true,
            true,
            function (path) {
                $scope.currentMeter.prototypeCollection.titlePath = path;
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
                $scope.$$postDigest(function() {
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
        $scope.$$postDigest(function() {
            $scope.validateFields.apply($(".validatable, #inputMeterTableValuePath" + index));
        });
    };

    $scope.removeColumn = function (index) {
        $scope.currentMeter.config.table.values.splice(index, 1);
        $scope.$$postDigest(function() {
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
        $scope.$$postDigest(function() {
            $scope.validateFields.apply($(".validatable, #inputMeterParticipantValuePath" + index));
        });
    };

    $scope.removeParticipant = function (index) {
        $scope.currentMeter.config.participants.splice(index, 1);
        $scope.$$postDigest(function() {
            $scope.validateFields.apply($(".validatable, #inputMeterParticipantValuePath" + index));
        });
    };

    $scope.currentMeterPrePathArray = function () {
        return $scope.currentMeter.isPrototype ?
            [$scope.currentMeter.prototypeCollection.collectionPath, chooseAny] : [];
    };

    $scope.participantPrePathArray = function (participant) {
        var prePathArray = $scope.currentMeterPrePathArray();
        if (participant.type === "COLLECTION") {
            prePathArray.push(participant.collectionPath);
            prePathArray.push(chooseAny);
        }
        return prePathArray;
    };

    $scope.tablePrePathArray = function () {
        var prePathArray = $scope.currentMeterPrePathArray();
        prePathArray.push($scope.currentMeter.config.table.collectionPath);
        prePathArray.push(chooseAny);
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

    $scope.walkPathArray = function (pathArray, stopIndex, prePathArrays) {
        var input = $scope.currentSample;
        if (prePathArrays) {
            for (var i = 0; i < prePathArrays.length; i++) {
                var currentPathArray = prePathArrays[i];
                if (typeof currentPathArray === "function") {
                    if (i === prePathArrays.length - 1 && currentPathArray === chooseAny && pathArray === "{{key}}") {
                        return "key";
                    }
                    input = currentPathArray(input);
                }
                else {
                    for (var j = 0; j < currentPathArray.length; j++) {
                        var entry = currentPathArray[j];
                        input = $scope.walkPath(entry, input);
                    }
                }
            }
        }
        for (i = 0; i < pathArray.length && i < stopIndex; i++) {
            entry = pathArray[i];
            input = $scope.walkPath(entry, input);
        }
        return input;
    };

    $scope.walkPath = function (entry, input) {
        if (entry.type === "ARRAY") {
            for (var i = 0; i < input.length; i++) {
                var isValid = true;
                var sampleEntry = input[i];
                for (var key in entry.conditions) {
                    if (!entry.conditions.hasOwnProperty(key)) {
                        continue;
                    }
                    if (sampleEntry[key] != entry.conditions[key]) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    return sampleEntry;
                }
            }
            throw "could not extract entry path - array not match";
        }
        else if (entry.type === "OBJECT") {
            return input[entry.result];
        }
        return input;
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
            check_callback: function(operation, node, nodeParent) {
                if (operation === "move_node") {
                    if (node.type === "server") {
                        return nodeParent.type === "#";
                    }
                    return nodeParent.type === "server" && node.data.server === nodeParent.data.key;
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
            server: {
                icon: 'tree-icon fa fa-server'
            },
            graph: {
                icon: 'tree-icon fa fa-area-chart'
            },
            pie: {
                icon: 'tree-icon fa fa-pie-chart'
            },
            table: {
                icon: 'tree-icon fa fa-table'
            },
            value: {
                icon: 'tree-icon fa fa-info'
            }
        },
        contextmenu: {
            select_node: false,
            show_at_node: false,
            items: function (node) {
                if (node.type === 'server') {
                    return {
                        addMeter: {
                            label: "Add new meter",
                            title: "Add a new meter to this server",
                            icon: "fa fa-area-chart",
                            separator_after: true,
                            action: function () {$scope.addMeter(node.data.key)}
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
                            action: function () {$scope.duplicateServer(node.data.key)}
                        },
                        remove: {
                            label: "Remove server",
                            title: "Remove this server and all it's meters",
                            icon: "fa fa-trash-o",
                            action: function () {$scope.removeServer(node.data.key)}
                        }
                    };
                }
                return {
                    addMeter: {
                        label: "Add new meter",
                        title: "Add a new meter after this one",
                        icon: "fa fa-area-chart",
                        separator_after: true,
                        action: function () {$scope.addMeter(node.data.server)}
                    },
                    duplicate: {
                        label: "Duplicate meter",
                        title: "Create another meter identical to this one",
                        icon: "fa fa-clone",
                        action: function () {$scope.duplicateMeter(node.data.server, node.data.meter)}
                    },
                    remove: {
                        label: "Remove meter",
                        title: "Remove this meter",
                        icon: "fa fa-trash-o",
                        action: function () {$scope.removeMeter(node.data.server, node.data.meter)}
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
        $scope.hasChanges(true);
        $("#tree").jstree("delete_node", meterId, serverId);
        if ($scope.mode === 'meter' && $scope.currentMeter.id == meterId) {
            $(".has-error").removeClass("has-error");
            $scope.$$postDigest(function () {
                $("#tree").jstree("deselect_all").jstree("select_node", serverId);
                $scope.markChanges(serverId);
            });
        }
        else {
            $scope.markChanges(serverId);
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
        $scope.hasChanges(true);
    };

    $scope.duplicateMeter = function (serverId, meterId) {
        if (!$scope.validateSwitch()) {
            return;
        }
        var currentMeter = $scope.findMeter(serverId, meterId);
        var newMeter = cloneObject(currentMeter);
        newMeter.id = guid();
        newMeter.title = "Copy of " + newMeter.title;
        var server = $scope.findServer(serverId);
        if (!server.meters) {
            server.meters = [];
        }
        server.meters.push(newMeter);
        $scope.hasChanges(true);
        $("#tree").jstree("create_node", server.id, $scope.meterToTreeNode(server.id, newMeter), "last");
        $scope.$$postDigest(function () {
            $('#tree').jstree("deselect_all").jstree("select_node", newMeter.id);
            setTimeout(function () {
                $scope.markChanges(newMeter.id);
            }, 10);
        });
    };

    $scope.duplicateServer = function (serverId) {
        if (!$scope.validateSwitch()) {
            return;
        }
        var newServer = cloneObject($scope.findServer(serverId));
        newServer.id = guid();
        newServer.title = "Copy of " + newServer.title;
        $rootScope.profile.servers.push(newServer);
        if (newServer.meters) {
            for (var i = 0; i < newServer.meters.length; i++) {
                newServer.meters[i].id = guid();
            }
        }
        var allTreeNodes = $scope.serverToTreeNodes(newServer);
        for (i = 0; i < allTreeNodes.length; i++) {
            $("#tree").jstree("create_node", allTreeNodes[i].parent, allTreeNodes[i], "last");
        }
        $scope.hasChanges(true);
        $scope.$$postDigest(function () {
            $('#tree').jstree("deselect_all").jstree("select_node", newServer.id);
            $scope.markChanges(newServer.id);
        });
    };

    $scope.addMeter = function (serverId) {
        if (!$scope.validateSwitch()) {
            return;
        }
        $scope.hasChanges(true);
        var server = $scope.findServer(serverId);
        if (!server.meters) {
            server.meters = [];
        }
        var meter = {
            id: guid(),
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
            setTimeout(function () {
                $scope.markChanges(serverId);
                $scope.markChanges(meter.id);
            }, 10);
        });
    };

    $scope.addNewServer = function () {
        if (!$scope.validateSwitch()) {
            return;
        }
        $scope.hasChanges(true);
        var server = {
            id: guid(),
            user: $rootScope.email,
            title: "New Server",
            url: "",
            method: "GET",
            meters: []
        };
        $rootScope.profile.servers.push(server);
        $("#tree").jstree("create_node", "#", $scope.serverToTreeNodes(server)[0], "last");
        $scope.$$postDigest(function () {
            $("#tree").jstree("deselect_all").jstree("select_node", server.id);
            $scope.markChanges(server.id);
        });
        return server.id;
    };

    $scope.markChanges = function (resourceId) {
        $("#tree").jstree(true).get_node(resourceId, true).children(".jstree-anchor").find(".tree-icon").addClass("has-changes");
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
            if (data.node.type === 'server') {
                var server = $scope.findServer(data.node.data.key);
            }
            else {
                var meter = $scope.findMeter(data.node.data.server, data.node.data.meter);
                server = $scope.findServer(meter.serverId)
            }
            $scope.getSampleData(server.method, server.url, function () {
                if (data.node.type === 'server') {
                    $scope.mode = 'server';
                    $scope.currentServer = server;
                }
                else {
                    $scope.mode = 'meter';
                    $scope.currentMeter = meter;
                }
                $scope.$$postDigest(function() {
                    $(".validatable").trigger("change");
                });
            });
        },
        move_node: function (e, data) {
            if (data.node.type === 'server') {
                $scope.moveServer(data.node.data.key, data.position);
            }
            else {
                $scope.moveMeter(data.node.data.server, data.node.data.meter, data.position);
            }
        },
        ready: function () {
            if (!$stateParams.resourceId) {
                $scope.$$postDigest($scope.addNewServer);
            }
            else {
                $("#tree").jstree("select_node", $stateParams.resourceId);
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
    $scope.hasChangesValue = false;
    $scope.hasChanges = function (value) {
        if (value) {
            window.onbeforeunload = function(){
                return unloadWarningMessage;
            };
        }
        else {
            window.onbeforeunload = null;
        }
        $scope.hasChangesValue = value;
    };
    $scope.$on('$stateChangeStart', function(event, toState, toParams) {
        if ($scope.hasChangesValue) {
            event.preventDefault();
            $rootScope.confirm(
                unloadWarningMessage,
                "Before You Leave",
                function () {
                    $scope.hasChanges(false);
                    $rootScope.reloadProfile();
                    $state.go(toState.name, toParams);
                }
            );
        }
    });

    $scope.cancel = function () {
        $rootScope.confirm(
            'Are you sure you wish to cancel all changes to ' + $rootScope.profile.name + ' profile?',
            'Cancel Changes',
            function () {
                $scope.hasChanges(false);
                $rootScope.reloadProfile();
                $rootScope.goHome();
            }
        );
    };

    $scope.save = function () {
        $scope.hasChanges(false);
        $rootScope.saveProfile();
        window.onbeforeunload = null;
        $rootScope.goHome();
    };

    $scope.treeData = [];
    for (var i = 0; i < $rootScope.profile.servers.length; i++) {
        var nodes = $scope.serverToTreeNodes($rootScope.profile.servers[i]);
        for (var j = 0; j < nodes.length; j++) {
            $scope.treeData.push(nodes[j]);
        }
    }

}

function loginCtrl($scope, $rootScope, baSidebarService, $state, toastr, $uibModal) {

    $("title").text($state.current.title);

    $scope.initialized = false;

    if (typeof(Storage) === "undefined") {
        $rootScope.browserNotSupported = true;
        angular.element(document).ready(function () {
            $("#browserSupport").removeClass("hidden");
        });
        return;
    }

    $rootScope.AVATARS = [
        {name: "abraham", title: "Neat Abraham"},
        {name: "helen", title: "Organized Helen"},
        {name: "holly", title: "Genius Holly"},
        {name: "jim", title: "Furious Jim"},
        {name: "jones", title: "Mr. Jones"},
        {name: "leroy", title: "Experienced Leroy"},
        {name: "natalie", title: "Vigorous Natalie"},
        {name: "sandra", title: "Sweet Sandra"}
    ];

    $rootScope.COLORS = [
        '#209e91',
        '#2dacd1',
        '#90b900',
        '#dfb81c',
        '#e85656',
        "#a5a5a5",
        "#505050",
        "#ececec"
    ];

    var allProfilesData = localStorage.getItem("allProfiles");
    $rootScope.allProfiles = allProfilesData ? JSON.parse(allProfilesData) : [];

    $rootScope.confirm = function (body, title, onYesCallback, onNoCallback) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: 'app/confirm.html',
            controller: 'ConfirmCtrl',
            size: 'sm',
            resolve: {
                data: function () {
                    return {title: title, body: body};
                }
            }
        });
        modal.result.then(onYesCallback, onNoCallback);
    };

    $rootScope.reloadSidebar = function () {
        baSidebarService.clearStaticItems();
        for (var i = 0; i < $rootScope.profile.servers.length; i++) {
            var server = $rootScope.profile.servers[i];
            baSidebarService.addStaticItem({
                title: server.title,
                server: {
                    title: server.title,
                    url: server.url,
                    method: server.method
                },
                stateRef: 'monitor',
                stateParams: {serverId: server.id}
            });
        }
        baSidebarService.addStaticItem({
            title: 'New Server',
            icon: 'ion-android-add-circle',
            stateRef: 'edit'
        });
    };

    $rootScope.getProfileById = function (id) {
        for (var i = 0; i < $rootScope.allProfiles.length; i++) {
            var profile = $rootScope.allProfiles[i];
            if (profile.id == id) {
                return profile;
            }
        }
        return null;
    };

    $rootScope.saveProfile = function () {
        var current = $scope.profile;
        if (!current) {
            return;
        }
        for (var i = 0; i < $rootScope.allProfiles.length; i++) {
            var profile = $rootScope.allProfiles[i];
            if (profile.id == current.id) {
                $rootScope.allProfiles[i] = current;
                localStorage.setItem("allProfiles", JSON.stringify($rootScope.allProfiles));
                $rootScope.reloadSidebar();
                return;
            }
        }
    };

    $rootScope.removeProfile = function () {
        var current = $scope.profile;
        if (!current) {
            return;
        }
        for (var i = 0; i < $rootScope.allProfiles.length; i++) {
            var profile = $rootScope.allProfiles[i];
            if (profile.id == current.id) {
                $rootScope.allProfiles.splice(i, 1);
                localStorage.setItem("allProfiles", JSON.stringify($rootScope.allProfiles));
                return $rootScope.logout();
            }
        }
    };

    $rootScope.reloadProfile = function () {
        var current = $scope.profile;
        if (!current) {
            return;
        }
        $rootScope.profile = cloneObject($scope.getProfileById(current.id));
        if (!$rootScope.profile) {
            return;
        }
        $rootScope.reloadSidebar();
    };

    $rootScope.goHome = function () {
        if ($rootScope.pendingRedirect) {
            $state.go($rootScope.pendingRedirect.state, $rootScope.pendingRedirect.params);
            $rootScope.pendingRedirect = null;
            return;
        }
        if ($rootScope.profile.servers.length > 0) {
            $state.go('monitor', {serverId: $rootScope.profile.servers[0].id});
        }
        else {
            $state.go('edit');
        }
    };

    $rootScope.logout = function () {
        $rootScope.loggedIn = false;
        localStorage.removeItem("activeProfileId");
        $state.go('login');
    };

    $scope.login = function (profileId) {
        $rootScope.profile = cloneObject($scope.getProfileById(profileId));
        if (!$rootScope.profile) {
            toastr.error("This profile doesn't exist anymore", "Oops!");
            $rootScope.loggedIn = false;
            localStorage.removeItem("activeProfileId");
            return;
        }
        localStorage.setItem("activeProfileId", profileId);
        $rootScope.reloadSidebar();
        $rootScope.loggedIn = true;
        $rootScope.goHome();
    };

    $scope.register = function () {
        var id = guid();
        $rootScope.allProfiles.push({
            id: id,
            name: "",
            avatar: random($rootScope.AVATARS).name,
            color: random($rootScope.COLORS),
            servers: []
        });
        localStorage.setItem("allProfiles", JSON.stringify($rootScope.allProfiles));
        $rootScope.firstProfileUpdate = true;
        $rootScope.pendingRedirect = {state: "profile"};
        $scope.login(id);
    };

    $rootScope.profile = null;
    var activeProfileId = localStorage.getItem("activeProfileId");
    if (activeProfileId) {
        return $scope.login(activeProfileId);
    }

    $scope.initialized = true;

}

function monitorCtrl($scope, $stateParams, $http, $rootScope, baConfig, layoutPaths, $state) {

    if (typeof $rootScope.profile === "undefined") {
        $rootScope.pendingRedirect = {
            state: $state.current.name,
            params: $stateParams
        };
        return $state.go('login');
    }

    $scope.serverId = $stateParams.serverId;
    if (!$scope.serverId) {
        return $state.go('new');
    }

    $scope.server = null;
    for (var i = 0; i < $rootScope.profile.servers.length; i++) {
        var server = $rootScope.profile.servers[i];
        if (server.id == $scope.serverId) {
            $scope.server = server;
            break;
        }
    }
    if (!$scope.server) {
        return $state.go('new');
    }

    $("title").text($scope.server.title + " - BlurMonitor");

    $scope.serverIsUp = true;

    $scope.data = [];

    $scope.active = true;

    $scope.hoveredMeterId = null;

    $scope.onMeterMouseEnter = function () {
        $scope.hoveredMeterId = $(this).attr("id");
    };

    $scope.onMeterMouseLeave = function () {
        $scope.hoveredMeterId = null;
    };

    $scope.shouldDraw = function (id) {
        return $scope.hoveredMeterId !== id;
    };

    $("body").on("mouseenter", ".meter", $scope.onMeterMouseEnter).on("mouseleave", ".meter", $scope.onMeterMouseLeave);

    $scope.$on("$destroy", function () {
        $scope.active = false;
        $("body").off("mouseenter", ".meter", $scope.onMeterMouseEnter).off("mouseleave", ".meter", $scope.onMeterMouseLeave);
    });

    $scope.update = function (callback) {
        if (!$scope.active) {
            return;
        }
        $http({
            method: $scope.server.method,
            url: $scope.server.url
        })
            .then(
                function (response) {
                    if (response.status === 200) {
                        $scope.serverIsUp = true;
                        if (response.data) {
                            $scope.data.push({
                                time: $scope.getTime(),
                                data: response.data
                            });
                            if (callback) {
                                callback(response.data);
                            }
                            else {
                                $scope.draw();
                            }
                        }
                    }
                    else {
                        $scope.serverIsUp = false;
                    }
                }, function () {
                    $scope.serverIsUp = false;
                }
            );
        setTimeout($scope.update, 5000);
    };

    $scope.draw = function () {
        for (var i = 0; i < $scope.meters.length; i++) {
            var meter = $scope.meters[i];
            var id = "meter-wrapper-" + i;
            if (!$scope.shouldDraw(id)) {
                continue;
            }
            switch (meter.type) {
                case "GRAPH":
                    $scope.drawGraph(i, meter.config);
                    break;
                case "PIE":
                    $scope.drawPie(i, meter.config);
                    break;
                case "VALUE":
                    $scope.drawValue(i, meter.config);
                    break;
                case "TABLE":
                    $scope.drawTable(i, meter.config);
                    break;
            }
        }
    };

    $scope.drawGraph = function (index, config) {
        var data = [];
        var startIndex = config.maxHistory ? Math.max(0, $scope.data.length - config.maxHistory) : 0;
        var rawData = $scope.data.slice(startIndex);
        if (!rawData) {
            return;
        }
        var graphIndex = 0;
        var graphs = [];
        for (var i = 0; i < rawData.length; i++) {
            data.push({time: rawData[i].time});
        }
        for (i = 0; i < config.participants.length; i++) {
            var participant = config.participants[i];
            if (participant.type === "INSTANCE") {
                var graphId = "g" + ++graphIndex;
                graphs.push({
                    id: graphId,
                    balloonText: participant.title + ' - [[value]]',
                    bullet: 'square',
                    bulletSize: 8,
                    lineColor: $scope.chooseColor(graphIndex),
                    fillColors: $scope.chooseColor(graphIndex),
                    lineThickness: 1,
                    valueField: graphId,
                    type: 'smoothedLine',
                    fillAlphas: config.participants.length === 1 && config.participants[0].type === "INSTANCE" ? 0.5 : 0
                });
                for (var j = 0; j < rawData.length; j++) {
                    data[j][graphId] = $scope.getEntryByPath(participant.valuePath, config.getBaseData(rawData[j].data));
                }
            }
            else {
                var sampleCollection = $scope.getEntryByPath(participant.collectionPath, config.getBaseData(rawData[0].data));
                for (var key in sampleCollection) {
                    if (!sampleCollection.hasOwnProperty(key)) {
                        continue;
                    }
                    graphId = "g" + ++graphIndex;
                    graphs.push({
                        id: graphId,
                        balloonText: $scope.getTitle(participant.titlePath, key, sampleCollection, participant.titlePrefix, participant.titleSuffix) + ' - [[value]]',
                        bullet: 'square',
                        bulletSize: 8,
                        lineColor: $scope.chooseColor(graphIndex),
                        fillColors: $scope.chooseColor(graphIndex),
                        lineThickness: 1,
                        valueField: graphId,
                        type: 'smoothedLine',
                        fillAlphas: config.participants.length === 1 && config.participants[0].type === "INSTANCE" ? 0.5 : 0
                    });
                    for (j = 0; j < rawData.length; j++) {
                        var sample = $scope.getEntryByPath(participant.collectionPath, config.getBaseData(rawData[j].data));
                        data[j][graphId] = $scope.getEntryByPath(participant.valuePath, sample[key]);
                    }
                }
            }
        }
        var lineChart = AmCharts.makeChart("meter" + index, {
            type: 'serial',
            theme: 'blur',
            color: baConfig.colors.defaultText,
            marginTop: 0,
            marginRight: 15,
            dataProvider: data,
            categoryField: 'time',
            valueAxes: [
                {
                    axisAlpha: 0,
                    position: 'left',
                    gridAlpha: 0.5,
                    gridColor: baConfig.colors.border
                }
            ],
            graphs: graphs,
            chartScrollbar: {
                graph: 'g1',
                gridAlpha: 0,
                color: baConfig.colors.defaultText,
                scrollbarHeight: 55,
                backgroundAlpha: 0,
                selectedBackgroundAlpha: 0.05,
                selectedBackgroundColor: baConfig.colors.defaultText,
                graphFillAlpha: 0,
                autoGridCount: true,
                selectedGraphFillAlpha: 0,
                graphLineAlpha: 0.2,
                selectedGraphLineColor: baConfig.colors.defaultText,
                selectedGraphLineAlpha: 1
            },
            chartCursor: {
                cursorAlpha: 0,
                valueLineEnabled: true,
                valueLineBalloonEnabled: true,
                valueLineAlpha: 0.5,
                fullWidth: true
            },
            export: {
                enabled: true
            },
            creditsPosition: 'bottom-right',
            pathToImages: layoutPaths.images.amChart
        });
        lineChart.addListener('rendered', zoomChart);
        if (lineChart.zoomChart) {
            lineChart.zoomChart();
        }
        function zoomChart() {
            lineChart.zoomToIndexes(Math.round(lineChart.dataProvider.length * 0.4), Math.round(lineChart.dataProvider.length * 0.55));
        }
    };

    $scope.drawPie = function (index, config) {
        if ($scope.data.length === 0) {
            return;
        }
        var data = [];
        var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
        for (var i = 0; i < config.participants.length; i++) {
            var participant = config.participants[i];
            if (participant.type === "INSTANCE") {
                data.push({
                    title: participant.title,
                    value: $scope.getEntryByPath(participant.valuePath, lastSample)
                });
            }
            else {
                var collection = $scope.getEntryByPath(participant.collectionPath, lastSample);
                for (var key in collection) {
                    if (!collection.hasOwnProperty(key)) {
                        continue;
                    }
                    data.push({
                        title: $scope.getTitle(participant.titlePath, key, collection),
                        value: $scope.getEntryByPath(participant.valuePath, collection[key])
                    });
                }
            }
        }
        var layoutColors = baConfig.colors;
        var pieChart = AmCharts.makeChart("meter" + index, {
            type: 'pie',
            startDuration: 0,
            theme: 'blur',
            addClassNames: true,
            color: layoutColors.defaultText,
            labelTickColor: layoutColors.borderDark,
            legend: {
                position: 'right',
                marginRight: 100,
                autoMargins: false
            },
            innerRadius: '40%',
            defs: {
                filter: [
                    {
                        id: 'shadow',
                        width: '200%',
                        height: '200%',
                        feOffset: {
                            result: 'offOut',
                            in: 'SourceAlpha',
                            dx: 0,
                            dy: 0
                        },
                        feGaussianBlur: {
                            result: 'blurOut',
                            in: 'offOut',
                            stdDeviation: 5
                        },
                        feBlend: {
                            in: 'SourceGraphic',
                            in2: 'blurOut',
                            mode: 'normal'
                        }
                    }
                ]
            },
            dataProvider: data,
            valueField: 'value',
            titleField: 'title',
            export: {
                enabled: true
            },
            creditsPosition: 'bottom-left',
            autoMargins: false,
            marginTop: 10,
            alpha: 0.8,
            marginBottom: 30,
            marginLeft: 0,
            marginRight: 0,
            pullOutRadius: 0,
            pathToImages: layoutPaths.images.amChart,
            responsive: {
                enabled: false, // creating an issue of not reading settings each even re-draw
                rules: [
                    // at 900px wide, we hide legend
                    {
                        maxWidth: 900,
                        overrides: {
                            legend: {
                                enabled: false
                            }
                        }
                    },
                    // at 200 px we hide value axis labels altogether
                    {
                        maxWidth: 200,
                        overrides: {
                            valueAxes: {
                                labelsEnabled: false
                            },
                            marginTop: 30,
                            marginBottom: 30,
                            marginLeft: 30,
                            marginRight: 30
                        }
                    }
                ]
            }
        });
        pieChart.addListener('init', function () {
            pieChart.legend.addListener('rollOverItem', handleRollOver);
        });
        pieChart.addListener('rollOverSlice', function (e) {
            handleRollOver(e);
        });
        function handleRollOver(e) {
            var wedge = e.dataItem.wedge.node;
            wedge.parentNode.appendChild(wedge);
        }
    };

    $scope.drawValue = function (index, config) {
        if ($scope.data.length === 0) {
            return;
        }
        var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
        var value = $scope.getEntryByPath(config.path, lastSample);
        $("#meter" + index).addClass("value-view").html(config.prefix + value + config.suffix);
    };

    $scope.drawTable = function (index, config) {
        if ($scope.data.length === 0) {
            return;
        }
        var lastSample = config.getBaseData($scope.data[$scope.data.length - 1].data);
        var headerValues = [""];
        for (var i = 0; i < config.table.values.length; i++) {
            headerValues.push(config.table.values[i].title);
        }
        var tableValues = [];
        var collection = $scope.getEntryByPath(config.table.collectionPath, lastSample);
        for (var key in collection) {
            if (!collection.hasOwnProperty(key)) {
                continue;
            }
            var row = [$scope.getTitle(config.table.titlePath, key, collection, config.table.titlePrefix, config.table.titleSuffix)];
            for (i = 0; i < config.table.values.length; i++) {
                row.push($scope.getEntryByPath(config.table.values[i].valuePath, collection[key]));
            }
            tableValues.push(row);
        }
        var headerHolder = $('<tr>');
        for (i = 0; i < headerValues.length; i++) {
            headerHolder.append($('<th>').html(headerValues[i]));
        }
        var tableHolder = $('<tbody>');
        for (i = 0; i < tableValues.length; i++) {
            var rowValues = tableValues[i];
            var rowHolder = $('<tr>').addClass("no-top-border");
            for (var j = 0; j < rowValues.length; j++) {
                rowHolder.append($('<td>').html(rowValues[j]));
            }
            tableHolder.append(rowHolder);
        }
        $("#meter" + index).html(
            $('<div>').addClass("horizontal-scroll").append(
                $('<table>').addClass("table table-hover").append(
                    $('<thead>').append(headerHolder),
                    tableHolder
                )
            )
        );
    };

    $scope.getEntryByPath = function (pathArray, sample) {
        if (pathArray.length === 0) {
            return $scope.normalizeValue(sample);
        }
        if (!sample) {
            throw "could not extract entry path";
        }
        var currentInstruction = pathArray[0];
        if (currentInstruction.type === "ARRAY") {
            for (var i = 0; i < sample.length; i++) {
                var isValid = true;
                var sampleEntry = sample[i];
                for (var key in currentInstruction.conditions) {
                    if (!currentInstruction.conditions.hasOwnProperty(key)) {
                        continue;
                    }
                    if (sampleEntry[key] !== currentInstruction.conditions[key]) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    return $scope.getEntryByPath(pathArray.slice(1), sampleEntry[currentInstruction.result]);
                }
            }
            throw "could not extract entry path - array not match";
        }
        else if (currentInstruction.type === "OBJECT") {
            return $scope.getEntryByPath(pathArray.slice(1), sample[currentInstruction.result]);
        }
        return $scope.normalizeValue(sample);
    };

    $scope.getTitle = function (titlePath, key, sample, prefix, suffix) {
        var title = titlePath === "{{key}}" ? key : $scope.getEntryByPath(titlePath, sample[key]);
        if (prefix) {
            title = prefix + " " + title;
        }
        if (suffix) {
            title += " " + suffix;
        }
        return title;
    };

    $scope.getTime = function () {
        var date = new Date();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var seconds = date.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return date.getHours() + ":" + minutes + ":" + seconds;
    };

    $scope.normalizeValue = function (value) {
        if (!$.isNumeric(value)) {
            return value;
        }
        var result = $scope.formatNumber(value, 3, '.', ',');
        return result.substr(-3) === "000" ? result.substr(0, result.length - 4) : result;
    };

    $scope.formatNumber = function (number, decimals, decPoint, thousandsSep) {
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep,
            dec = (typeof decPoint === 'undefined') ? '.' : decPoint,
            toFixedFix = function (n, prec) {
                // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };

    var colors = [
        baConfig.colors.primary,
        baConfig.colors.danger,
        baConfig.colors.warning,
        baConfig.colors.success,
        baConfig.colors.info,
        baConfig.colors.primaryDark,
        baConfig.colors.warningLight,
        baConfig.colors.successDark,
        baConfig.colors.successLight,
        baConfig.colors.primaryLight,
        baConfig.colors.warningDark
    ];

    $scope.chooseColor = function (index) {
        return colors[index % colors.length];
    };

    $scope.update(function (sample) {
        $scope.meters = [];
        for (var i = 0; i < $scope.server.meters.length; i++) {
            var meter = $scope.server.meters[i];
            if (!meter.hasOwnProperty("prototypeCollection")) {
                meter.config.getBaseData = function (sample) {
                    return sample;
                };
                $scope.meters.push(meter);
                continue;
            }
            var prototypeCollection = meter.prototypeCollection;
            var collection = $scope.getEntryByPath(prototypeCollection.collectionPath, sample);
            for (var key in collection) {
                if (!collection.hasOwnProperty(key)) {
                    continue;
                }
                var meterCopy = JSON.parse(JSON.stringify(meter));
                meterCopy.title = $scope.getTitle(prototypeCollection.titlePath, key, collection,
                    prototypeCollection.titlePrefix, prototypeCollection.titleSuffix);
                (function (collectionPath, key) {
                    meterCopy.config.getBaseData = function (sample) {
                        return $scope.getEntryByPath(collectionPath, sample)[key];
                    };
                })(prototypeCollection.collectionPath, key);
                $scope.meters.push(meterCopy);
            }
        }
        $scope.$$postDigest(function(){
            $scope.draw();
        });
    });

}

function amChartConfig(baConfigProvider) {
    var layoutColors = baConfigProvider.colors;
    AmCharts.themes.blur = {

        themeName: "blur",

        AmChart: {
            color: layoutColors.defaultText,
            backgroundColor: "#FFFFFF"
        },

        AmCoordinateChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark]
        },

        AmStockChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark]
        },

        AmSlicedChart: {
            colors: [layoutColors.primary, layoutColors.danger, layoutColors.warning, layoutColors.success, layoutColors.info, layoutColors.primaryDark, layoutColors.warningLight, layoutColors.successDark, layoutColors.successLight, layoutColors.primaryLight, layoutColors.warningDark],
            labelTickColor: "#FFFFFF",
            labelTickAlpha: 0.3
        },

        AmRectangularChart: {
            zoomOutButtonColor: '#FFFFFF',
            zoomOutButtonRollOverAlpha: 0.15,
            zoomOutButtonImage: "lens.png"
        },

        AxisBase: {
            axisColor: "#FFFFFF",
            axisAlpha: 0.3,
            gridAlpha: 0.1,
            gridColor: "#FFFFFF"
        },

        ChartScrollbar: {
            backgroundColor: "#FFFFFF",
            backgroundAlpha: 0.12,
            graphFillAlpha: 0.5,
            graphLineAlpha: 0,
            selectedBackgroundColor: "#FFFFFF",
            selectedBackgroundAlpha: 0.4,
            gridAlpha: 0.15
        },

        ChartCursor: {
            cursorColor: layoutColors.primary,
            color: "#FFFFFF",
            cursorAlpha: 0.5
        },

        AmLegend: {
            color: "#FFFFFF"
        },

        AmGraph: {
            lineAlpha: 0.9
        },
        GaugeArrow: {
            color: "#FFFFFF",
            alpha: 0.8,
            nailAlpha: 0,
            innerRadius: "40%",
            nailRadius: 15,
            startWidth: 15,
            borderAlpha: 0.8,
            nailBorderAlpha: 0
        },

        GaugeAxis: {
            tickColor: "#FFFFFF",
            tickAlpha: 1,
            tickLength: 15,
            minorTickLength: 8,
            axisThickness: 3,
            axisColor: '#FFFFFF',
            axisAlpha: 1,
            bandAlpha: 0.8
        },

        TrendLine: {
            lineColor: layoutColors.danger,
            lineAlpha: 0.8
        },

        // ammap
        AreasSettings: {
            alpha: 0.8,
            color: layoutColors.info,
            colorSolid: layoutColors.primaryDark,
            unlistedAreasAlpha: 0.4,
            unlistedAreasColor: "#FFFFFF",
            outlineColor: "#FFFFFF",
            outlineAlpha: 0.5,
            outlineThickness: 0.5,
            rollOverColor: layoutColors.primary,
            rollOverOutlineColor: "#FFFFFF",
            selectedOutlineColor: "#FFFFFF",
            selectedColor: "#f15135",
            unlistedAreasOutlineColor: "#FFFFFF",
            unlistedAreasOutlineAlpha: 0.5
        },

        LinesSettings: {
            color: "#FFFFFF",
            alpha: 0.8
        },

        ImagesSettings: {
            alpha: 0.8,
            labelColor: "#FFFFFF",
            color: "#FFFFFF",
            labelRollOverColor: layoutColors.primaryDark
        },

        ZoomControl: {
            buttonFillAlpha: 0.8,
            buttonIconColor: layoutColors.defaultText,
            buttonRollOverColor: layoutColors.danger,
            buttonFillColor: layoutColors.primaryDark,
            buttonBorderColor: layoutColors.primaryDark,
            buttonBorderAlpha: 0,
            buttonCornerRadius: 0,
            gridColor: "#FFFFFF",
            gridBackgroundColor: "#FFFFFF",
            buttonIconAlpha: 0.6,
            gridAlpha: 0.6,
            buttonSize: 20
        },

        SmallMap: {
            mapColor: "#000000",
            rectangleColor: layoutColors.danger,
            backgroundColor: "#FFFFFF",
            backgroundAlpha: 0.7,
            borderThickness: 1,
            borderAlpha: 0.8
        },

        // the defaults below are set using CSS syntax, you can use any existing css property
        // if you don't use Stock chart, you can delete lines below
        PeriodSelector: {
            color: "#FFFFFF"
        },

        PeriodButton: {
            color: "#FFFFFF",
            background: "transparent",
            opacity: 0.7,
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            boxSizing: "border-box"
        },

        PeriodButtonSelected: {
            color: "#FFFFFF",
            backgroundColor: "#b9cdf5",
            border: "1px solid rgba(0, 0, 0, .3)",
            MozBorderRadius: "5px",
            borderRadius: "5px",
            margin: "1px",
            outline: "none",
            opacity: 1,
            boxSizing: "border-box"
        },

        PeriodInputField: {
            color: "#FFFFFF",
            background: "transparent",
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        },

        DataSetSelector: {
            color: "#FFFFFF",
            selectedBackgroundColor: "#b9cdf5",
            rollOverBackgroundColor: "#a8b0e4"
        },

        DataSetCompareList: {
            color: "#FFFFFF",
            lineHeight: "100%",
            boxSizing: "initial",
            webkitBoxSizing: "initial",
            border: "1px solid rgba(0, 0, 0, .3)"
        },

        DataSetSelect: {
            border: "1px solid rgba(0, 0, 0, .3)",
            outline: "none"
        }

    };
}

function ValueInstance(title, valuePath) {
    this.type = "INSTANCE";
    this.title = title;
    this.valuePath = valuePath;
}

function ValueCollection(collectionPath, titlePath, valuePath) {
    this.type = "COLLECTION";
    this.collectionPath = collectionPath;
    this.titlePath = titlePath;
    this.valuePath = valuePath;
}

function TableCollection(collectionPath, titlePath, values) {
    this.collectionPath = collectionPath;
    this.titlePath = titlePath;
    this.values = values;
}

function TableValue(title, valuePath) {
    this.title = title;
    this.valuePath = valuePath;
}

function PrototypeCollection(collectionPath, titlePrefix, titlePath, titleSuffix) {
    this.collectionPath = collectionPath;
    this.titlePrefix = titlePrefix;
    this.titlePath = titlePath;
    this.titleSuffix = titleSuffix;
}

function PathArrayEntry(conditions, result) {
    this.type = "ARRAY";
    this.conditions = conditions;
    this.result = result;
}

function PathObjectEntry(result) {
    this.type = "OBJECT";
    this.result = result;
}

function PathValueEntry() {
    this.type = "OTHER";
}

function Set() {
    this.values = {};
}
Set.prototype.add = function (value) {
    this.values[value] = true;
};
Set.prototype.toArray = function () {
    var result = [];
    for (var key in this.values) {
        if (this.values.hasOwnProperty(key)) {
            result.push(key);
        }
    }
    return result;
};

function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function immutableArrayAdd(array, newEntry) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(array[i]);
    }
    result.push(newEntry);
    return result;
}

function trimString(input, length) {
    input = input + "";
    if (input.length <= length) {
        return input;
    }
    return input.substr(0, length - 3) + "...";
}

function chooseAny(collection) {
    for (var key in collection) {
        if (collection.hasOwnProperty(key)) {
            return collection[key];
        }
    }
    return [];
}