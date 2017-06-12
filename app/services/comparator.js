(function () {
    'use strict';

    angular
        .module('BlurAdmin')
        .factory('comparator', function () {

            function arrayEquals(arr1, arr2) {
                if (arr1.length !== arr2.length) {
                    return false;
                }
                for (var i = 0; i < arr1.length; i++) {
                    if (!equals(arr1[i], arr2[i])) {
                        return false;
                    }
                }
                return true;
            }

            function objectEquals(obj1, obj2) {
                return objectContains(obj1, obj2) && objectContains(obj2, obj1);
            }

            function objectContains(contains, containee) {
                for (var key in contains) {
                    if (contains.hasOwnProperty(key)) {
                        if (!containee.hasOwnProperty(key)) {
                            return false;
                        }
                        if (!equals(contains[key], containee[key])) {
                            return false;
                        }
                    }
                }
                return true;
            }

            function equals(value1, value2) {
                if (typeof value1 === "object") {
                    if (value1 instanceof Array) {
                        // value2 should be array
                        return value2 instanceof Array && arrayEquals(value1, value2);
                    }
                    // value2 should not be array
                    return typeof value2 === "object" && !(value2 instanceof Array) && objectEquals(value1, value2);
                }
                // both should not be array
                return typeof value2 !== "object" && value1 == value2;
            }

            return {test: equals}

        });

})();