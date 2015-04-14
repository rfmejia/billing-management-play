/**
 * Created by juancarlos.yu on 3/1/15.
 */
angular
    .module('app.mailbox')
    .controller('approvalsController', approvalsCtrl);

function approvalsCtrl($state, $location, $anchorScroll, documentsApi, documentsHelper, commentsHelper, dialogProvider, toastsProvider, dateUtils, documentsResponse, userDetails, tenantsResponse, queryHelper) {
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
    vm.currentUser = userDetails.userId;
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

        if (vm.assigned == null) {
            vm.isDisabled = true;
        }
        else {
            vm.isDisabled = (vm.assigned.userId != vm.currentUser);
        }
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
            documentsApi.unassignDocument(url).then(returnToList);
        }
    }

    function returnToList() {
        var params = queryHelper.getDocsListParams("drafts", 0, "mine");
        $state.go("workspace.pending.drafts", params, {reload : true})
    }

    function onRejectClicked() {
        dialogProvider.getCommentDialog("Move document to ", vm.prevAction.title).then(okayClicked);

        //Save the document first, then submit
        function okayClicked(comment) {
            vm.currentComment = comment;
            preparePostData();
            var postData = documentsHelper.formatServerData(documentsResponse);
            documentsApi.editDocument(documentId, postData).then(submit, error);
        }

        function submit() {
            documentsApi.moveToBox(vm.prevAction.url).then(success, error);
        }
    }

    function onSubmitClicked() {
        dialogProvider.getCommentDialog("Move document to ", vm.nextAction.title).then(okayClicked);

        //Save the document first, then submit
        function okayClicked(comment) {
            vm.currentComment = comment;
            preparePostData();
            var postData = documentsHelper.formatServerData(documentsResponse);
            documentsApi.editDocument(documentId, postData).then(submit, error);
        }

        function submit() {
            documentsApi.moveToBox(vm.nextAction.url).then(success, error);
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

approvalsCtrl.$inject = [
    '$state',
    "$location",
    "$anchorScroll",
    //APIS
    'documentsApi',
    //HELPERS
    'documentsHelper',
    'commentsHelper',
    //PROVIDERS
    'hoaDialogService',
    "hoaToastService",
    //UTILS
    "nvl-dateutils",
    //RESOLVES
    'documentResponse',
    'userDetails',
    'tenantResponse',
    "queryParams"
];