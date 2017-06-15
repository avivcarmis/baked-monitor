(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('ImportExportCtrl', ['$scope', 'toastr', '$rootScope', function ($scope, toastr, $rootScope) {

            $scope.showData = false;

            $scope.showDataClicked = function () {
                $scope.showData = true;
                $scope.$$postDigest(function () {
                    $("#copy-area").select();
                });
            };

            $scope.showPasteExportData = function () {
                $scope.showData = true;
                $scope.$$postDigest(function () {
                    $("#paste-area").trigger("focus");
                });
            };

            $scope.exportData = function () {
                return localStorage.getItem("allProfiles");
            };

            $scope.encodedExportData = function() {
                return encodeURI($scope.exportData());
            };

            $scope.importFile = function () {
                var reader = new FileReader();
                reader.onload = function () {
                    $scope.import(reader.result);
                };
                reader.readAsBinaryString($("#importFile").get(0).files[0]);
            };

            $scope.importPaste = function () {
                $scope.import($("#paste-area").val());
            };

            $scope.import = function (rawData) {
                try {
                    var data = JSON.parse(rawData);
                    if (data.length === 0) {
                        return toastr.error("The given exported data doesn't contain any profiles", "Oops!");
                    }
                    var success = 0;
                    var failed = 0;
                    for (var i = 0; i < data.length; i++) {
                        var profile = data[i];
                        if (!profile.hasOwnProperty("id")) {
                            var message = "Skipping " + (failed === 0 ? "one" : "another") + " invalid profile";
                            if (profile.hasOwnProperty("name")) {
                                message += " (" + profile.name + ")";
                            }
                            toastr.error(message, "Oops!");
                            failed++;
                            continue;
                        }
                        if ($scope.hasProfile(profile.id)) {
                            toastr.error("Profile " + profile.name + " already exist", "Oops!");
                            failed++;
                            continue;
                        }
                        $rootScope.allProfiles.push(data[i]);
                        success++;
                    }
                    localStorage.setItem("allProfiles", JSON.stringify($rootScope.allProfiles));
                    if (success > 0) {
                        message = "Imported " + success + " profiles";
                        if (failed > 0) {
                            message += ", skipped " + failed + " profiles";
                        }
                        toastr.success(message, "Yay!");
                    }
                    $scope.$dismiss();
                } catch (e) {
                    return toastr.error("The given exported data is invalid ):", "Oops!");
                }
            };

            $scope.hasProfile = function (id) {
                for (var i = 0; i < $rootScope.allProfiles.length; i++) {
                    var profile = $rootScope.allProfiles[i];
                    if (profile.id == id) {
                        return true;
                    }
                }
                return false;
            };

        }]);

})();