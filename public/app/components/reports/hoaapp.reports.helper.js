/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("module.reports")
    .factory("reports.helper", reportsHelper);

reportsHelper.$inject = ["moment"];
function reportsHelper(moment) {
    var service = {
        parseReports : parseReports
    };

    return service;

    function parseReports(apiResponse) {
        var parsed = {};
        var total = 0;
        var paid = 0;
        var unpaid = 0;
        angular.forEach(apiResponse.total, function(value) {
            total += value;
        });

        angular.forEach(apiResponse.paid, function(value) {
            paid += value;
        });

        angular.forEach(apiResponse.unpaid, function(value) {
            unpaid += value;
        });

        parsed["date"] = moment().month(apiResponse.forMonth.month).year(apiResponse.forMonth.year);
        parsed["breakdown"] = [
            {title: "Total", total : total, details: apiResponse.total},
            {title: "Unpaid", total : unpaid, details: apiResponse.unpaid},
            {title: "Paid", total : paid, details: apiResponse.paid}
        ];
        return parsed;
    }
}