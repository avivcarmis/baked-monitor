(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('ConfirmCtrl', ['$scope', function ($scope) {

            $scope.title = $scope.$resolve.data.title;
            $scope.body = $scope.$resolve.data.body;

        }]);
})();