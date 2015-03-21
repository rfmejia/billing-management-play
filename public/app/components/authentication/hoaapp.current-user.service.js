/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module('app.authentication')
    .factory('userApi', userApi);

function userApi($window, $resource, $q, linksApi) {
    var userDetails = null;

    var service = {
        getUserDetails : getUserDetails,
        logoutUser     : logoutUser
    };
    return service;

    //region FUNCTION_CALLS
    function getUserDetails() {
        if (userDetails == null) {
            return makeRequest();
        }
        else {
            return userDetails;
        }
    }

    function makeRequest() {
        var deferred = $q.defer();
        var resource = $resource(linksApi.getCurrentUserLink());

        function success(response) {
            userDetails = response;
            return deferred.resolve(response);
        }

        function error(error) {
            userDetails = null;
            return deferred.reject(error);
        }

        resource.get().$promise
            .then(success, error);

        return deferred.promise;
    }

    function logoutUser() {
        var logoutPath = linksApi.getLogoutLink();
        if (logoutPath) {
            $window.location = $window.location.origin + logoutPath;
        }
    }

    //endregion
}
userApi.$inject = ["$window", "$resource", "$q", "service.hoalinks"];
