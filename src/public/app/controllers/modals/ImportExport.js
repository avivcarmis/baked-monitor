(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('ImportExportCtrl', ['$scope', function ($scope) {

            $scope.showData = false;

            $scope.showDataClicked = function () {
                $scope.showData = true;
                $scope.$$postDigest(function () {
                    $("#copy-area").select();
                });
            };

            $scope.exportData = function () {
                return localStorage.getItem("allProfiles");
            };

            $scope.encodedExportData = function () {
                return encodeURI($scope.exportData());
            };

        }]);

})();