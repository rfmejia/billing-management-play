/**
 * Created by juancarlos.yu on 3/8/15.
 */
angular
    .module("app.mailbox")
    .controller("printController", printCtrl);

function printCtrl($state, docsSrvc, reportsHelper, userDetail, docsResponse) {
    var vm = this;
    vm.document = docsResponse.viewModel;
    vm.isDisabled = true;

    vm.onSentClicked = onSentClicked;

    activate();

    function activate() {
        if(vm.document.assigned == null) {
            vm.isDisabled = true;
        } else {
            vm.isDisabled = (userDetail.userId != vm.document.assigned.userId)
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

printCtrl.$inject = [
    "$state",
    //API
    "documentsApi",
    //SERVICES
    "reports.helper",
    //UTILS
    //RESOLVE
    "userDetails",
    "documentResponse"
];