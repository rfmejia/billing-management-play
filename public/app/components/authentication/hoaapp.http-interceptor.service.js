angular
    .module("app.authentication")
    .factory("httpInterceptor", httpInterceptor);

function httpInterceptor($q, $window, nvlAppLoggingSrvc) {
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
            type     : "request error",
            response : response
        };
        nvlAppLoggingSrvc.error(error);
        return response || $q.when(response);
    }

    function response(response) {
        return response || $q.when(response);
    }

    function responseError(response) {
        var error = determineError(response);
        if (error)nvlAppLoggingSrvc.error(error);
        return $q.reject(error);
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
httpInterceptor.$inject = ["$q", "$window", "nvlAppErrorLoggingService"];
