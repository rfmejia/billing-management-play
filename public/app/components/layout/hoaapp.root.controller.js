angular
    .module("app.layout")
    .controller('rootController', rootController);

function rootController($rootScope, appErrorService) {
    activate();

    //region FUNCTION_CALL
    function activate() {
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

    //endregion
}
rootController.$inject = ["$rootScope", "nvlAppErrorLoggingService"];




