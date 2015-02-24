angular
    .module('hoaApp')
    .controller('controller.root', [
        '$cookies',
        'service.hoalinks',
        'tokenHandler',
        rootController
    ]);

function rootController($cookies, hoalinks, tokenHandler) {
    var vm = this;

    activate();

    //region FUNCTION_CALL
    function activate() {
        hoalinks.getResource().get().$promise
            .then(success, error);
    }

    function success(data) {
        tokenHandler.set($cookies.id);
    }

    function error(){};

    //endregion
}




