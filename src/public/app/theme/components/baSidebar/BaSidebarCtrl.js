/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.theme.components')
        .controller('BaSidebarCtrl', BaSidebarCtrl);

    /** @ngInject */
    function BaSidebarCtrl($scope, baSidebarService, $http, baConfig, toastr) {

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
                $scope.setDurationClass(element);
                if (success) {
                    element
                        .removeClass("unhealthy")
                        .addClass("healthy")
                        .css("background-color", baConfig.colors.success)
                        .css("transition", "all " + STATUS_CHANGE_DURATION + "ms ease")
                        .css("opacity", "1")
                        .css("transform", "scale(1)");
                    setTimeout(function () {
                        element
                            .css("transition", "all " + HEARTBEAT_INTERVAL + "ms cubic-bezier(.5,.06,.9,.43)")
                            .css("opacity", "0.8")
                            .css("transform", "scale(0.5)");
                    }, STATUS_CHANGE_DURATION);
                    if (item.isDown) {
                        toastr.success(item.title + " is back up", "HealthCheck Status");
                    }
                    item.isDown = false;
                }
                else {
                    element
                        .removeClass("healthy")
                        .addClass("unhealthy")
                        .css("transition", "all " + STATUS_CHANGE_DURATION + "ms ease")
                        .css("opacity", "1")
                        .css("transform", "scale(1)")
                        .css("background-color", baConfig.colors.danger);
                    if (!item.isDown) {
                        toastr.error(item.title + " is down", "HealthCheck Status");
                    }
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

        $scope.setDurationClass = function (element) {
            for (var i = 0; i < BLINK_DURATION_CLASSES.length; i++) {
                var durationClass = BLINK_DURATION_CLASSES[i];
                if (element.hasClass(durationClass)) {
                    return;
                }
            }
            var chosen = BLINK_DURATION_CLASSES[Math.floor(Math.random() * BLINK_DURATION_CLASSES.length)];
            element.addClass(chosen);
        };

        var BLINK_DURATION_CLASSES = [
            "duration-5",
            "duration-6",
            "duration-7",
            "duration-8",
            "duration-9"
        ];
        var interval = setInterval($scope.heartbeat, HEARTBEAT_INTERVAL);
        $scope.heartbeat();

        $scope.$on("$destroy", function handler() {
            interval = clearInterval(interval);
        });

    }
})();