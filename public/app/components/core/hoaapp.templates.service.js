angular.module("app.core").factory("templateApi", templateApi);

function templateApi($resource, $q, linksApi) {
    var service = {
        queryApi : queryApi,
        getLocal : getLocal
    };

    return service;

    function queryApi() {
        var deferred = $q.defer();

        var resource = $resource(linksApi.getTemplatesLink(), {}, {
            get : {method : "GET", isArray: false}
        });

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };

        resource.get().$promise.then(success, error);

        return deferred.promise;
    }

    function getLocal() {
        var deferred = $q.defer();
        var resource = $resource("app/components/core/invoice-1.json", {}, {
            get : {method : "GET", isArray: false}
        });

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };

        resource.get().$promise.then(success, error);

        return deferred.promise;
    }
}
templateApi.$inject = ["$resource", "$q", "linksApi"];