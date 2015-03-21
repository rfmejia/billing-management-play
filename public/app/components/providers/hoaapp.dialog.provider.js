/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('app.providers')
    .factory('service.hoadialog', hoaDialogProvider);

hoaDialogProvider.$inject = ["$mdDialog"];
function hoaDialogProvider($mdDialog) {
    var service = {
        getConfirmDialog : getConfirmDialog,
        getInformDialog  : getInformDialog,
        getCommentDialog : getCommentDialog
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

    function getInformDialog(okayFn, title, message, okayBtn) {
        $mdDialog.show(
            $mdDialog.alert()
                .title(title)
                .content(message)
                .ok(okayBtn)
        );
    }

    function getCommentDialog(message, box) {
        return $mdDialog
            .show(
            {
                templateUrl  : "app/components/providers/comment.dialog.tmpl.html",
                controller   : dialogCommentCtrl,
                controllerAs : "dialog",
                locals       : {
                    message : message,
                    box     : box
                }
            }
        );
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

function dialogCommentCtrl($mdDialog, message, box) {
    var vm = this;
    vm.box = box;
    vm.message = message;
    vm.cancel = cancel;
    vm.send = send;

    function cancel() {
        $mdDialog.cancel();
    }

    function send(comment) {
        $mdDialog.hide(comment);
    }
}
