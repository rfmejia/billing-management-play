/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('hoaApp')
    .factory('service.hoadialog',[
        '$mdDialog',
        hoaDialogProvider
    ]);

function hoaDialogProvider($mdDialog) {
    var service = {
        getConfirmDialog : getConfirmDialog
    };

    return service;

    //region FUNCTION_CALL
    function getConfirmDialog(okayFn, cancelFn, message) {
        $mdDialog
            .show({
                controller: dialogCtrl,
                controllerAs : "dialogCtrl",
                templateUrl: 'app/components/shared/elements/dialogs/confirm-dialog.html',
                locals : {message : message}

            })
            .then(okayFn, cancelFn);
    }
    //endregion
}

function dialogCtrl($mdDialog, message) {
    var vm = this;
    vm.message = message;
    vm.cancel = cancel;
    vm.confirm = confirm;

    function cancel() {
        $mdDialog.cancel();
    }
    function confirm() {
        $mdDialog.hide();
    }
}
