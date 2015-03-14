/**
 * Created by juancarlos.yu on 3/8/15.
 */
angular
    .module("module.mailbox")
    .controller("controller.print", [
                   "documentsHelper",
                   "documentsService",
                   "documentsResponse",
                   "$state",
                   "$stateParams",
                   printCtrl
                ]);

function printCtrl(docsHelper, docsSrvc, docsResponse, $state, $stateParams) {
    var vm = this;
    vm.document = docsResponse.viewModel;
    console.log(docsResponse);

    vm.onSentClicked = onSentClicked;

    activate();

    function activate() {

    }

    //region FUNCTION_CALL
    function onSentClicked() {
        var url = docsResponse.viewModel.nextAction.nextBox.url;
        docsSrvc.moveToBox(url).then(moveToReports);
    }

    function moveToReports() {
        $state.go("workspace.reports");
    }
    //endregion
}