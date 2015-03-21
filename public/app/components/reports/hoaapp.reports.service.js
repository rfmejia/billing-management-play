/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .factory("reports.service", reportsSrvc);

reportsSrvc.$inject = ["$resource", "$q", "service.hoalinks"];
function reportsSrvc($resource, $q, hoalinks, queryKeys){
    var service = {
        getReport : getReport
    };

    return service;

    function getReport(queryParams) {
        var url = hoalinks.getApiLink();
        url += "reports";

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