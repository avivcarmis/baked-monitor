(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .factory('utils', function () {
            return {

                cloneObject: function cloneObject(object) {
                    return JSON.parse(JSON.stringify(object));
                },

                guid: function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }

                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                },

                random: function random(array) {
                    return array[Math.floor(Math.random() * array.length)];
                },

                immutableArrayAdd: function immutableArrayAdd(array, newEntry) {
                    var result = [];
                    for (var i = 0; i < array.length; i++) {
                        result.push(array[i]);
                    }
                    result.push(newEntry);
                    return result;
                },

                trimString: function trimString(input, length) {
                    input = input + "";
                    if (input.length <= length) {
                        return input;
                    }
                    return input.substr(0, length - 3) + "...";
                },

                chooseAny: function chooseAny(collection) {
                    for (var key in collection) {
                        if (collection.hasOwnProperty(key)) {
                            return collection[key];
                        }
                    }
                    return [];
                }

            };
        });

})();