(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('ProfileCtrl', ['$scope', '$rootScope', '$state', 'toastr',
            function ($scope, $rootScope, $state, toastr) {

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
                    $(this).each(function () {
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

            }]);
})();