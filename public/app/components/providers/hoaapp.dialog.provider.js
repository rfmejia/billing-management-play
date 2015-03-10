/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('module.providers')
    .factory('service.hoadialog', hoaDialogProvider);

hoaDialogProvider.$inject = ["$mdDialog"];
function hoaDialogProvider($mdDialog) {
    var service = {
        getConfirmDialog : getConfirmDialog
    };

    return service;

    //region FUNCTION_CALL
    function getConfirmDialog(okayFn, cancelFn, message, title) {
        $mdDialog
            .show({
                      controller   : dialogCtrl,
                      controllerAs : "dialogCtrl",
                      templateUrl  : 'app/components/providers/confirm-dialog.html',
                      locals       : {message : message, title : title}

                  })
            .then(okayFn, cancelFn);
    }

    //endregion
}

function dialogCtrl($mdDialog, message, title) {
    var vm = this;
    vm.message = message;
    vm.title = title;
    vm.cancel = cancel;
    vm.confirm = confirm;

    function cancel() {
        $mdDialog.cancel();
    }

    function confirm() {
        $mdDialog.hide();
    }
}
