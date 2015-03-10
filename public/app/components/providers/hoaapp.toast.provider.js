/**
 * Created by juancarlos.yu on 3/7/15.
 */
angular
    .module("module.providers")
    .factory("service.hoatoasts", hoaToastProvider);


hoaToastProvider.$inject = ["$mdToast"];
function hoaToastProvider($mdToast) {
    var service = {
        showSimpleToast : showSimpleToast,
        showActionToast : showActionToast
    };

    return service;

    //region FUNCTION_CALL
    function showSimpleToast(content) {
        var toast = $mdToast.simple()
            .content(content)
            .position('top left')
            .hideDelay(3000);

        return $mdToast.show(toast);
    }

    function showActionToast(content) {
        var toast = $mdToast.simple()
            .content(content)
            .action('OK')
            .position('top left')
            .hideDelay(3000);
        return $mdToast.show(toast);
    }

    //endregion
}