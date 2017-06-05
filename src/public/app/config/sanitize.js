(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data|blob):/);
        }]);

})();