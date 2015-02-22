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
    function success(data) {
        tokenHandler.set($cookies.id);
    }
    function error(){};

    hoalinks.getResource().get().$promise
        .then(success, error);
}




