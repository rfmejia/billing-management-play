/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('module.mailbox')
    .controller('controller.approvals', approvalsCtrl);

approvalsCtrl.$inject = [
    //Resolve
    'documentsHelper',
    'documentsResponse',
    'userResponse',
    'tenantsResponse',
    'documentsService',
    'helper.comments',
    //Providers
    'service.hoadialog',
    "service.hoatoasts",
    //Shared
    '$state',
    '$stateParams',
    '$resource',
    "$location",
    "$anchorScroll",
    "nvl-dateutils"
];

function approvalsCtrl(documentsHelper, documentsResponse, userResponse, tenantsResponse, documentsService, commentsHelper, dialogProvider, toastsProvider, $state, $stateParams, $resource, $location, $anchorScroll, dateUtils) {
    var vm = this;
    vm.document = documentsResponse.viewModel;
    /** Current comment made in this phase of the workflow **/
    vm.currentComment = "";
    /** Previous comments made in different phases of the workflow **/
    vm.comments;
    /** Next box **/
    vm.nextAction = documentsResponse.viewModel.nextAction.nextBox;
    /** Prev box **/
    vm.prevAction = documentsResponse.viewModel.nextAction.prevBox;
    /** Document title for display **/
    vm.documentTitle = documentsResponse.viewModel.documentTitle;
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** Display for month **/
    vm.billDate;
    /** Tenant view model **/
    vm.tenant = tenantsResponse.viewModel;
    /** Tenant server model **/
    vm.tenantPostData = tenantsResponse.serverModel
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId = documentsResponse.viewModel.documentId;
    /** User assigned to this document **/
    vm.assigned = documentsResponse.viewModel.assigned;
    /** Current user **/
    vm.currentUser = userResponse.userId;
    /** Document item links **/
    vm.links = documentsResponse.viewModel.links;
    /** Disables the editing of this document if it's not locked to the user **/
    vm.isDisabled;
    vm.tradeNameColor = {color : "#F44336"};


    activate();

    vm.onUnlinkClicked = onUnlinkClicked;
    vm.onRejectClicked = onRejectClicked;
    vm.onSubmitClicked = onSubmitClicked;
    //region FUNCTION_CALL
    function activate() {
        if (documentsResponse.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = documentsResponse.viewModel.comments;
        }
        else {
            vm.comments = commentsHelper.parseComments(null, null);
        }

        if (vm.comments.hasRecent) {
            toastsProvider.showPersistentToast("1 new comment", "view").then(goToComments)
        }
        vm.isDisabled = (vm.assigned.userId != vm.currentUser);
        var date = dateUtils.getMomentFromString(documentsResponse.viewModel.month, documentsResponse.viewModel.year)
        vm.billDate = dateUtils.momentToStringDisplay(date, "MMMM-YYYY");
    }

    /**
     * Laucnhes a dialog for confirmation. If yes, make a network call to unlink user.
     */
    function onUnlinkClicked() {
        if (vm.links.hasOwnProperty("hoa:unassign")) {
            var url = vm.links["hoa:unassign"].href;
            dialogProvider.getConfirmDialog(unassignDocument, null, "This will no longer be assigned to you", "Are you sure?")
        }
        function unassignDocument() {
            documentsService.unassignDocument(url).then(returnToList);
        }
    }

    function returnToList() {
        $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
    }

    function onRejectClicked() {
        dialogProvider.getCommentDialog("Move document to ", vm.prevAction.title).then(okayClicked);

        //Save the document first, then submit
        function okayClicked(comment) {
            vm.currentComment = comment;
            preparePostData();
            var postData = documentsHelper.formatServerData(documentsResponse);
            documentsService.editDocument(documentId, postData).then(submit, error);
        }

        function submit() {
            documentsService.moveToBox(vm.prevAction.url).then(success, error);
        }
    }

    function onSubmitClicked() {
        dialogProvider.getCommentDialog("Move document to ", vm.nextAction.title).then(okayClicked);

        //Save the document first, then submit
        function okayClicked(comment) {
            vm.currentComment = comment;
            preparePostData();
            var postData = documentsHelper.formatServerData(documentsResponse);
            documentsService.editDocument(documentId, postData).then(submit, error);
        }
    }

    function success (response) {
        toastsProvider.showSimpleToast('Your document was sent to the next phase.');
        returnToList();
    }

    function error(error) {}

    function goToComments() {
        var oldHash = $location.hash();
        $location.hash("comments");
        $anchorScroll();
        $location.hash(oldHash);
    }

    function preparePostData() {
        documentsResponse.viewModel.comments = commentsHelper.parseComments(vm.currentComment, vm.comments);
        documentsResponse.viewModel.assigned = vm.currentUser;
    }

    //endregion
}