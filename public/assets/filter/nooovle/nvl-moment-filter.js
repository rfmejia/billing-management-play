/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("nvl.filters")
    .filter('momentString', [
        "moment",
        function() {
            return function(dateString, format) {
                if(moment(dateString).isValid()) {
                    return moment(dateString).format(format);
                }
                else return "N/A"

            }
        }
    ]);