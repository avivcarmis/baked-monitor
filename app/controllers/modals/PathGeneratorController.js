(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('PathGeneratorCtrl', ['$scope', 'comparator', 'utils',
            function ($scope, comparator, utils) {

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
                        text: key + (type !== "VALUE" ? '' : ' (' + utils.trimString(input, 30) + ')'),
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
                                    var childPath = utils.immutableArrayAdd(path, {type: "OBJECT", result: currentKey});
                                }
                                else if (type === "ARRAY") {
                                    var child = input[currentKey];
                                    var childType = $scope.detectType(child);
                                    if (childType !== "OBJECT") {
                                        childPath = utils.immutableArrayAdd(path, {type: "OBJECT", result: currentKey});
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
                                        childPath = utils.immutableArrayAdd(path, {
                                            type: "ARRAY",
                                            conditions: conditions
                                        });
                                    }
                                }
                                createTreeData(currentKey, input[currentKey], node.id, childPath);
                            }
                        }
                    }
                }

                if ($scope.$resolve.data.enableKeys) {
                    var prePathArray = $scope.$resolve.data.pre;
                    if (prePathArray.length > 0 && prePathArray[prePathArray.length - 1] === utils.chooseAny) {
                        var collection = $scope.walkPathArray([], 0, prePathArray.slice(0, prePathArray.length - 1));
                        var keys = [];
                        var hasMore = false;
                        for (var key in collection) {
                            if (collection.hasOwnProperty(key)) {
                                if (keys.length > 2) {
                                    hasMore = true;
                                    break;
                                }
                                keys.push(utils.trimString(key, 20));
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

            }]);
})();