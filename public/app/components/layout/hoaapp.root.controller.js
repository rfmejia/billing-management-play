angular
    .module("module.layout")
    .controller('controller.root', [
                    '$cookies',
                    'service.hoalinks',
                    'tokenHandler',
                    "$rootScope",
                    "$log",
                    "nvlAppErrorLoggingService",
                    rootController
                ]);

function rootController($cookies, hoalinks, tokenHandler, $rootScope, $log, appErrorService) {
    var vm = this;

    activate();

    //region FUNCTION_CALL
    function activate() {
        hoalinks.getResource().get().$promise
            .then(success, error);

        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            var message = error.message;
            var stack = error.stack;
            var data = {
                fromState  : fromState,
                fromParams : fromParams,
                toState    : toState,
                toParams   : toParams,
                message    : message,
                stackTrace : stack,
                type       : "routing"
            };

            appErrorService.error(
                {
                    message : "Route error",
                    data    : data
                }
            )
        });
    }

    function success(data) {
        tokenHandler.set($cookies.id);
    }

    function error() {};

    //endregion
}




