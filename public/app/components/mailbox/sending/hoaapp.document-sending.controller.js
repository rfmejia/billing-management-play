/**
 * Created by juancarlos.yu on 3/8/15.
 */
angular
    .module("app.mailbox")
    .controller("printController", printCtrl);

function printCtrl($state, docsSrvc, dateUtils, userDetail, docsResponse, queryHelper) {
    var vm = this;
    vm.document = docsResponse.viewModel;
    vm.paymentHistory = docsResponse.viewModel.body.previous.sections[0].payment_history;
    vm.previousTotal = docsResponse.viewModel.body.previous.sections[0].sectionTotal.value;
    vm.isDisabled = true;
    vm.controlNumber = 0;

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
        var filter = queryHelper.getReportsFilters();
        var params = queryHelper.getReportsParams(0, dateUtils.getLocalDateNow(), filter[0].id);
        $state.go("workspace.reports", params, {reload : true});
    }

    //endregion
}

printCtrl.$inject = [
    "$state",
    //API
    "documentsApi",
    //SERVICES
    //UTILS
    "nvl-dateutils",
    //RESOLVE
    "userDetails",
    "documentResponse",
    "queryParams"
];