/**
 * Created by juancarlos.yu on 5/21/15.
 */
angular.module("nvl.filters").filter("numPrecision", function() {
    return function(number, precision) {
        precision = Math.abs(parseInt(precision)) || 0;
        var multiplier = Math.pow(10, precision);
        return (Math.round(number * multiplier) / multiplier);
    }
});
