(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .config(['$compileProvider', function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data|blob):/);

            // var currentSrcValue = $compileProvider.imgSrcSanitizationWhitelist().toString();
            // var newSrcValue = currentSrcValue.slice(0,-1) + '|chrome-extension:' + currentSrcValue.slice(-1);
            // $compileProvider.imgSrcSanitizationWhitelist(newSrcValue);
        }]);

})();