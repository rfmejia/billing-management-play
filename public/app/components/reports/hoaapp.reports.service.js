/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("module.reports")
    .factory("reports.service", reportsSrvc);

reportsSrvc.$inject = ["$resource", "$q", "service.hoalinks"];
function reportsSrvc($resource, $q, hoalinks){
    var service = {
        getReport : getReport
    };

    return service;

    function getReport(queryParams) {
        var url = hoalinks.getReportsLink;
        url = "http://localhost:9000/api/reports/2015/2";

        var resource = $resource(url, {}, {
            get : {method: "GET", isArray: false}
        });

        var deferred= $q.defer();
        function success(response) {
            deferred.resolve(response);
        }
        function error(error) {
            deferred.reject(error.message);
        }

        resource.get(queryParams).$promise.then(success, error);
        return deferred.promise;
    }
}