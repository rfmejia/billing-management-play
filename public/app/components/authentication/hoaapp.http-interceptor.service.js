var interceptor = angular.module('module.authentication');

angular.module("module.authentication").factory("httpInterceptor", httpInterceptor);

httpInterceptor.$inject = ["$q", "$window", "$location", "nvl-app-logging.service"]
function httpInterceptor($q, $window, $location, nvlAppLoggingSrvc) {
    return {
        request       : request,
        requestError  : requestError,
        response      : response,
        responseError : responseError
    };

    function request(config) {
        return config || $q.when(config);
    }

    function requestError(response) {
        nvlAppLoggingSrvc.error(response);
        // JSON.stringify(response)
        return response || $q.when(response);
    }

    function response(response) {
        return response || $q.when(response);
    }

    function responseError(response) {
        var error = {
            method : response.config.method,
            url : response.config.url,
            message : response.data,
            status : response.status
        };
        nvlAppLoggingSrvc.error(JSON.stringify(error));
        if (response && response.status === 401) {
            $window.location.assign("/login");
        }
        if (response && response.status === 404) {
        }
        if (response && response.status >= 500) {
        }
        return $q.reject(response);
    }

}
