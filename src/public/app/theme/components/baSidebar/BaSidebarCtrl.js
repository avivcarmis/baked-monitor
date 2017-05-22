/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.theme.components')
        .controller('BaSidebarCtrl', BaSidebarCtrl);

    /** @ngInject */
    function BaSidebarCtrl($scope, baSidebarService, $http, baConfig) {

        var HEARTBEAT_INTERVAL = 15000;

        $scope.menuItems = baSidebarService.getMenuItems();
        // $scope.defaultSidebarState = $scope.menuItems[0].stateRef;

        $scope.hoverItem = function ($event) {
            $scope.showHoverElem = true;
            $scope.hoverElemHeight = $event.currentTarget.clientHeight;
            var menuTopValue = 66;
            $scope.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - menuTopValue;
        };

        $scope.$on('$stateChangeSuccess', function () {
            if (baSidebarService.canSidebarBeHidden()) {
                baSidebarService.setMenuCollapsed(true);
            }
        });

        $scope.heartbeat = function () {
            for (var i = 0; i < $scope.menuItems.length; i++) {
                $scope.heartbeatAtIndex(i);
            }
        };

        var STATUS_CHANGE_DURATION = 500;

        $scope.heartbeatAtIndex = function (index) {
            var item = $scope.menuItems[index];
            if (!item.hasOwnProperty("server")) {
                return;
            }
            $scope.healthCheck(item.server.url, item.server.method, function (success) {
                var element = $("#ba-sidebar-item-" + index).find(".health-indicator");
                if (success) {
                    element
                        .css("background-color", baConfig.colors.success)
                        .css("transition", "opacity " + STATUS_CHANGE_DURATION + "ms ease")
                        .css("opacity", "1");
                    setTimeout(function () {
                        element
                            .css("transition", "opacity " + HEARTBEAT_INTERVAL + "ms ease")
                            .css("opacity", "0.7");
                    }, STATUS_CHANGE_DURATION);
                    if (item.isDown) {
                        alert(item.title + " is back up");
                    }
                    item.isDown = false;
                }
                else {
                    element
                        .css("transition", "all " + STATUS_CHANGE_DURATION + "ms ease")
                        .css("opacity", "1")
                        .css("background-color", baConfig.colors.danger);
                    alert(item.title + " is down");
                    item.isDown = true;
                }
            });
        };

        $scope.healthCheck = function (url, method, callback) {
            $http({
                method: method,
                url: url
            })
                .then(
                    function (response) {
                        callback(response.status === 200);
                    }, function () {
                        callback(false);
                    }
                );
        };

        setInterval($scope.heartbeat, HEARTBEAT_INTERVAL);
        $scope.heartbeat();

    }
})();