/**
 * Created by juancarlos.yu on 3/8/15.
 */
angular
    .module("app.mailbox")
    .controller("controller.print", [
                   "documentsHelper",
                   "documentsService",
                   "documentsResponse",
                   "userResponse",
                   "$state",
                   "$stateParams",
                   "reports.helper",
                   printCtrl
                ]);

function printCtrl(docsHelper, docsSrvc, docsResponse, userResponse,  $state, $stateParams, reportsHelper) {
    var vm = this;
    vm.document = docsResponse.viewModel;
    vm.isDisabled = true;

    vm.onSentClicked = onSentClicked;

    activate();

    function activate() {
        if(vm.document.assigned == null) {
            vm.isDisabled = true;
        } else {
            vm.isDisabled = (userResponse.userId != vm.document.assigned.userId)
        }

        vm.isDisabled = vm.isDisabled || (vm.document.mailbox != 'forSending');
    }

    //region FUNCTION_CALL
    function onSentClicked() {
        var url = docsResponse.viewModel.nextAction.nextBox.url;
        docsSrvc.moveToBox(url).then(moveToReports);
    }

    function moveToReports() {
        $state.go("workspace.reports", reportsHelper.getQueryParams());
    }

    //endregion
}