/**
 * Created by juancarlos.yu on 3/16/15.
 */
angular.module("nvl-error-logging.module", []);

/**
 * Override the exception handler
 */
angular.module("nvl-error-logging.module").provider("$exceptionHandler", {
    $get : function(nvlLoggingService) {
        return (nvlLoggingService);
    }
});

angular.module("nvl-error-logging.module")
    .factory("nvlTraceService", printService)
    .factory("nvlLoggingService", nvlLoggingService)
    .factory("nvlAppErrorLoggingService", nvlAppLoggingSrvc)
    .factory("nvlPostErrorService", nvlPostErrorSrvc);

function printService() {
    return {
        print : printStackTrace
    }
}

nvlLoggingService.$inject = ["$log", "$window", "nvlTraceService", "nvlPostErrorService"];
function nvlLoggingService($log, $window, errorPrinter, errorPostService) {
    return (error);
    function error(exception, cause) {
        $log.error.apply($log, arguments);
        try {
            var errorMessage = exception.toString();
            var stackTrace = errorPrinter.print({e : exception});
            var data = angular.toJson({
                                          url         : $window.location.href,
                                          message     : errorMessage,
                                          type        : "exception",
                                          stackTraace : stackTrace,
                                          cause       : (cause || "")
                                      });
            $log.debug(data);
            errorPostService.reportError(data);
        } catch (loggingError) {
            $log.debug(loggingError);
        }
    }
}

nvlAppLoggingSrvc.$inject = ["$log", "$window", "nvlPostErrorService"];
function nvlAppLoggingSrvc($log, $window, errorPostService) {
    return {
        error : error,
        debug : debug
    };

    function error(message) {
        $log.error.apply($log, arguments);
        var data = angular.toJson(
            {
                url     : $window.location.href,
                message : message,
                type    : "error"
            });
        $log.debug(data);
        errorPostService.reportError(data);
    }

    function debug(message) {
        $log.log.apply($log, arguments);
        var data = angular.toJson(
            {
                url     : $window.location.href,
                message : message,
                type    : "debug"
            });
        $log.debug(data);
        errorPostService.reportError($window.location.origin, data);

    }
}

nvlPostErrorSrvc.$inject = ["$log", "$window"];
function nvlPostErrorSrvc($log, $window) {
    var url = $window.location.origin + "/api/logservice";
    return {
        reportError : reportError
    };

    function reportError(data) {
        $.ajax(
            {
                type        : "POST",
                url         : url,
                contentType : "application/json",
                data        : data,
                success     : success,
                error       : error
            }
        );

        function success(data) {
            $log.debug("Error reported:  " + data);
        }

        function error() {
            $log.debug("Error not reported");
        }
    }

}
