(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .factory('pathManager', ['utils', function (utils) {
            function walkEntry(entry, input) {
                if (entry.type === "ARRAY") {
                    for (var i = 0; i < input.length; i++) {
                        var isValid = true;
                        var sampleEntry = input[i];
                        for (var key in entry.conditions) {
                            if (!entry.conditions.hasOwnProperty(key)) {
                                continue;
                            }
                            if (sampleEntry[key] != entry.conditions[key]) {
                                isValid = false;
                                break;
                            }
                        }
                        if (isValid) {
                            return sampleEntry;
                        }
                    }
                    throw "could not extract entry path - array not match";
                }
                else if (entry.type === "OBJECT") {
                    return input[entry.result];
                }
                return input;
            }
            return {
                walkPath: function (input, pathArray, stopIndex, prePathArrays) {
                    if (prePathArrays) {
                        for (var i = 0; i < prePathArrays.length; i++) {
                            var currentPathArray = prePathArrays[i];
                            if (typeof currentPathArray === "function") {
                                if (i === prePathArrays.length - 1 && currentPathArray === utils.chooseAny && pathArray === "{{key}}") {
                                    return "key";
                                }
                                input = currentPathArray(input);
                            }
                            else {
                                for (var j = 0; j < currentPathArray.length; j++) {
                                    var entry = currentPathArray[j];
                                    input = walkEntry(entry, input);
                                }
                            }
                        }
                    }
                    for (i = 0; i < pathArray.length && i < stopIndex; i++) {
                        entry = pathArray[i];
                        input = walkEntry(entry, input);
                    }
                    return input;
                }
            };
        }]);

})();