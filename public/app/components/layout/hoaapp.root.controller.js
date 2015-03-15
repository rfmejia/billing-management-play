angular
    .module("module.layout")
    .controller('controller.root', [
                    '$cookies',
                    'service.hoalinks',
                    'tokenHandler',
                    "$rootScope",
                    rootController
                ]);

function rootController($cookies, hoalinks, tokenHandler, $rootScope) {
    var vm = this;

    activate();

    //region FUNCTION_CALL
    function activate() {
        hoalinks.getResource().get().$promise
            .then(success, error);

        $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
            console.log(error);
        });
    }

    function success(data) {
        tokenHandler.set($cookies.id);
    }

    function error() {};

    //endregion
}




