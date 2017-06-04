(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .controller('LoginCtrl', ['$scope', '$rootScope', 'baSidebarService', '$state', 'toastr', '$uibModal', 'utils',
            function ($scope, $rootScope, baSidebarService, $state, toastr, $uibModal, utils) {

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
                    $rootScope.profile = utils.cloneObject($scope.getProfileById(current.id));
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
                    $rootScope.profile = utils.cloneObject($scope.getProfileById(profileId));
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
                    var id = utils.guid();
                    $rootScope.allProfiles.push({
                        id: id,
                        name: "",
                        avatar: utils.random($rootScope.AVATARS).name,
                        color: utils.random($rootScope.COLORS),
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

            }]);
})();