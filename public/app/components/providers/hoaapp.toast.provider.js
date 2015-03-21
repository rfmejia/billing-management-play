/**
 * Created by juancarlos.yu on 3/7/15.
 */
angular
    .module("app.providers")
    .factory("service.hoatoasts", hoaToastProvider);


hoaToastProvider.$inject = ["$mdToast"];
function hoaToastProvider($mdToast) {
    var service = {
        showSimpleToast     : showSimpleToast,
        showActionToast     : showActionToast,
        showPersistentToast : showPersistentToast
    };

    var position = 'top left';

    return service;

    //region FUNCTION_CALL
    function showSimpleToast(content) {
        var toast = $mdToast.simple()
            .content(content)
            .position(position)
            .hideDelay(3000);

        return $mdToast.show(toast);
    }

    function showActionToast(content) {
        var toast = $mdToast.simple()
            .content(content)
            .action('OK')
            .position(position)
            .hideDelay(3000);
        return $mdToast.show(toast);
    }

    function showPersistentToast(shortMessage, buttonTitle) {
        var toast = {
            controller       : persistentCtrl,
            controllerAs     : "toast",
            bindToController : true,
            templateUrl      : 'app/components/providers/persistent.toast.tmpl.html',
            hideDelay        : 0,
            position         : position,
            locals           : {message : shortMessage, buttonTitle : buttonTitle}
        };
        return $mdToast.show(toast);
    }

    function persistentCtrl(message, buttonTitle) {
        var vm = this;

        vm.close = close;
        vm.action = action;
        vm.message = message;
        vm.buttonTitle = buttonTitle;

        function close() {
            $mdToast.cancel();
        }

        function action() {
            $mdToast.hide();
        }
    }

    //endregion
}