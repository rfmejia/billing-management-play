var interceptor = angular.module('module.authentication');

angular.module("module.authentication").factory("httpInterceptor", httpInterceptor);

httpInterceptor.$inject = ["$q", "$window", "$location", "nvlAppErrorLoggingService"]
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
        var error = {
            type : "request error",
            response : response
        };
        nvlAppLoggingSrvc.error(JSON.stringify(error));
        return response || $q.when(response);
    }

    function response(response) {
        return response || $q.when(response);
    }

    function responseError(response) {
        var error = determineError(response);
        if (error)nvlAppLoggingSrvc.error(JSON.stringify(error));

        return $q.reject(response);
    }

    function determineError(response) {
        var error = null;
        if (response === null) return unhandledErrors();
        if (response.status === 401) {
            $window.location.assign("/login");
            return null;
        }

        switch (response.status) {
            case 400:
            case 403:
            case 404:
            case 500:
                return parseError(response, "network error critical");

            default:
                return parseError(response, "network error unhandled");
        }
    }

    function unhandledErrors() {
        return {
            type    : "network error unhandled",
            message : "Unhandled server error"
        };
    }

    function parseError(response, type) {
        return {
            method  : response.config.method,
            url     : response.config.url,
            message : response.data,
            status  : response.status,
            type    : type
        };
    }

}
