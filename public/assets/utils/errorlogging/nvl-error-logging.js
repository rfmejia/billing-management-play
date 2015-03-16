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


angular.module("nvl-error-logging.module").factory("nvl-trace-service", printService);
function printService() {
    return {
        print : printStackTrace
    }
}

angular.module("nvl-error-logging.module").factory("nvlLoggingService", nvlLoggingService);

nvlLoggingService.$inject = ["$log", "$window", "nvl-trace-service"];
function nvlLoggingService($log, $window, errorPrinter) {
    return (error);
    function error(exception, cause) {
        $log.error.apply($log, arguments);
        try {
            var errorMessage = exception.toString();

            var stackTrace = errorPrinter.print({e : exception});

        } catch (loggingError) {

        }
    }
}

angular.module("nvl-error-logging.module").factory("nvl-app-logging.service", appLoggingSrvc);

appLoggingSrvc.$inject = ["$log", "$window"];
function appLoggingSrvc($log, $window) {
    return {
        error : error,
        debug : debug
    };

    function error(message) {
        $log.error.apply($log, arguments);
        console.log(message);
        //POST TO SERVER
    }

    function debug(message) {
        $log.log.apply($log, arguments);
        console.log(message);
        //POST TO SERVER
    }
}
