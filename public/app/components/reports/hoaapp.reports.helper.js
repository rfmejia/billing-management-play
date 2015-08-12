/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .factory("reports.helper", reportsHelper);

reportsHelper.$inject = ["nvl-dateutils"];
function reportsHelper(dateUtils) {
    var service = {
        parseReports: parseReports,
        getQueryParams: getQueryParams
    };

    return service;

    function parseReports(apiResponse) {
        var parsed = {};
        var total = {title: "Total", entries: {}};
        var paid = {title: "Paid", entries: {}};
        var unpaid = {title: "Unpaid", entries: {}};
        //Parse "current" values
        angular.forEach(apiResponse.amounts.current.sections, function (section) {
            total.entries[section.name] = section.amounts.total;
            paid.entries[section.name] = section.amounts.paid;
            unpaid.entries[section.name] = section.amounts.unpaid;
        });
        //Parse "previous" values
        total.entries["Previous charges"] = 0;
        paid.entries["Previous charges"] = 0;
        unpaid.entries["Previous charges"] = 0;
        angular.forEach(apiResponse.amounts.previous.sections, function (section) {
            total.entries["Previous charges"] = section.amounts.total + total.entries["Previous charges"];
            paid.entries["Previous charges"] = section.amounts.paid + paid.entries["Previous charges"];
            unpaid.entries["Previous charges"] = section.amounts.unpaid + unpaid.entries["Previous charges"];
        });

        var date = dateUtils.getMomentFromString(apiResponse.forMonth.month,
                                                 apiResponse.forMonth.year);

        parsed["sections"] = [total, unpaid, paid];
        parsed["date"] = {
            title: dateUtils.momentToStringDisplay(date, "MMMM - YYYY"),
            year: apiResponse.forMonth.year,
            month: apiResponse.forMonth.month
        };
        return parsed;
    }

    function getQueryParams() {
        var defaultYear = dateUtils.getLocalYearNow();
        var defaultMonth = dateUtils.getLocalMonthNow();
        return {
            year: defaultYear,
            month: defaultMonth
        }
    }
}