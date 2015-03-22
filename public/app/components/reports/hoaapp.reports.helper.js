/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .factory("reports.helper", reportsHelper);

reportsHelper.$inject = ["nvl-dateutils"];
function reportsHelper(dateUtils) {
    var service = {
        parseReports   : parseReports,
        getQueryParams : getQueryParams
    };

    return service;

    function parseReports(apiResponse) {
        var parsed = {};
        var total = {title : "Total", entries : {}};
        var paid = {title : "Paid", entries : {}};
        var unpaid = {title : "Unpaid", entries : {}};
        angular.forEach(apiResponse.amounts.sections, function(section) {
            total.entries[section.name] = section.amounts.total;
            paid.entries[section.name] = section.amounts.paid;
            unpaid.entries[section.name] = section.amounts.unpaid;
        });
        var date = dateUtils.getMomentFromString(apiResponse.forMonth.month, apiResponse.forMonth.year);

        parsed["sections"] = [total, unpaid, paid];
        parsed["date"] = {
            title : dateUtils.momentToStringDisplay(date, "MMMM - YYYY"),
            year  : apiResponse.forMonth.year,
            month : apiResponse.forMonth.month
        };
        return parsed;
    }

    function getQueryParams() {
        var defaultYear = dateUtils.getLocalYearNow();
        var defaultMonth = dateUtils.getLocalMonthNow();
        return {
            year  : defaultYear,
            month : defaultMonth
        }
    }
}