/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('module.mailbox')
    .controller('controller.approvals',[
        'documentsHelper',
        'documentsResponse',
        'userResponse',
        'documentsService',
        'helper.comments',
        'service.hoadialog',
        'moment',
        '$state',
        '$stateParams',
        'toaster',
        approvalsCtrl
    ]);

function approvalsCtrl(documentsHelper, documentsResponse, userResponse, documentsService, commentsHelper, dialogProvider,  moment, $state, $stateParams, toaster) {
    var vm = this;
    /** Previous months template **/
    vm.previous = documentsResponse.viewModel.body.previous;
    /** This months template **/
    vm.thisMonth = documentsResponse.viewModel.body.thisMonth;
    /** Summary template **/
    vm.summary = documentsResponse.viewModel.body.summary;
    /** Current comment made in this phase of the workflow **/
    vm.currentComment = "";
    /** Previous comments made in different phases of the workflow **/
    vm.comments;
    /** Next box **/
    vm.submitUrl = documentsResponse.viewModel.nextAction.nextBox.url;
    /** Prev box **/
    vm.rejectUrl = documentsResponse.viewModel.nextAction.prevBox.url;
    /** Document title for display **/
    vm.documentTitle = documentsResponse.viewModel.documentTitle;
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** Display for month **/
    vm.billDate = documentsResponse.viewModel.billDate;
    /** Display for tenant name **/
    vm.tenantName = documentsResponse.viewModel.tenantName;
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId = documentsResponse.viewModel.documentId;
    /** User assigned to this document **/
    vm.assigned = documentsResponse.viewModel.assigned;
    /** Current user **/
    vm.currentUser = userResponse.userId;
    /** Disables the editing of this document if it's not locked to the user **/
    vm.isDisabled;

    console.log(vm.thisMonth);

    activate();

    vm.onUnlinkClicked = onUnlinkClicked;
    vm.onRejectClicked = onRejectClicked;
    vm.onSubmitClicked = onSubmitClicked;
    //region FUNCTION_CALL
    function activate() {
        if(documentsResponse.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = documentsResponse.viewModel.comments;
        }
        else {
            vm.comments = commentsHelper.parseComments(null, null);
        }
        vm.isDisabled = (vm.assigned.userId != vm.currentUser);
    }
    /**
     * Laucnhes a dialog for confirmation. If yes, make a network call to unlink user.
     */
    function onUnlinkClicked() {
        documentsService.assignDocument($stateParams.id, "none")
            .then(returnToList);
    }

    function returnToList() {
        $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
    }

    function onRejectClicked() {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        var success = function(response) {
            toaster.pop('success', 'Successful', 'Document was returned to the previous phase.');
            returnToList();
        };

        var error = function(error) {};

        documentsService.moveToBox(documentId, vm.rejectUrl, postData)
            .then(success);
    }

    function onSubmitClicked() {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        var success = function(response) {
            toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
            returnToList();
        };

        var error = function(error) {};

        documentsService.moveToBox(documentId, vm.submitUrl, postData)
            .then(success);
    }

    function preparePostData() {
        documentsResponse.viewModel.body.previous = vm.previous;
        documentsResponse.viewModel.body.thisMonth = vm.thisMonth;
        documentsResponse.viewModel.body.summary = vm.summary;
        documentsResponse.viewModel.comments = commentsHelper.parseComments(vm.currentComment, vm.comments);
        documentsResponse.viewModel.assigned = vm.currentUser;
    }
    //endregion
}