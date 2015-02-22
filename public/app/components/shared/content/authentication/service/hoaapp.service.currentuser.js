/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module('hoaApp')
    .factory('service.hoacurrentuser',[
        '$location',
        '$resource',
        '$q',
        'service.hoalinks',
        '$window',
        hoaCurrentUserService
    ]);

function hoaCurrentUserService ($location, $resource, $q, hoalinks, $window) {
    var resource = null;

    var service = {
        getUserDetails : getUserDetails,
        logoutUser     : logoutUser
    };
    return service;


    //region FUNCTION_CALLS
    function createResource(url) {
        resource = $resource(url);
    }

    function getUserDetails() {
        return makeRequest();
    }

    function makeRequest() {
        var deferred = $q.defer();

        function success(response) {
            return deferred.resolve(response);
        }

        function error(error) {
            return deferred.reject(error);
        }

        function query() {
            resource.get().$promise
                .then(success, error);
        }

        if(resource != null) query();
        else {
            function init(response) {
                var topUrl = hoalinks.getCurrentUserLink();
                createResource(topUrl);
                query();
            }
            hoalinks.getLinks()
                .then(init);
        }

        return deferred.promise;
    }

    function logoutUser() {
        var logoutPath = hoalinks.getLogoutLink();
        if(logoutPath) {
            var logoutUrl = $window.location.origin + logoutPath;
            $window.location = logoutUrl;
        }
    }
    //endregion
}