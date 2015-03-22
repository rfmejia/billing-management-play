/**
 * Created by juancarlos.yu on 2/15/15.
 */
angular
    .module('app.mailbox')
    .controller('draftsController', draftsCtrl);

function draftsCtrl($state, $anchorScroll, $location, docsApi, documentsHelper, commentsHelper, dialogProvider, toastsProvider,  dateUtils, docsResponse, userDetails, tenantsResponse ) {
    var vm = this;
    /** Previous months template **/
    vm.previous = docsResponse.viewModel.body.previous;
    /** This months template **/
    vm.thisMonth = docsResponse.viewModel.body.thisMonth;
    /** Summary template **/
    vm.summary = docsResponse.viewModel.body.summary;
    /** Current comment made in this phase of the workflow **/
    vm.currentComment = "";
    /** Previous comments made in different phases of the workflow **/
    vm.comments;
    /** Next box **/
    vm.nextAction = docsResponse.viewModel.nextAction.nextBox;
    /** Document title for display **/
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** Display for month **/
    vm.billDate = docsResponse.viewModel.billDate;
    /** Tenant model **/
    vm.tenant = tenantsResponse.viewModel;
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId = docsResponse.viewModel.documentId;
    /** User assigned to this document **/
    vm.assigned = docsResponse.viewModel.assigned;
    /** Current user **/
    vm.currentUser = userDetails.userId;
    /** Links **/
    vm.links = docsResponse.viewModel.links;
    /** Disables the editing of this document if it's not locked to the user **/
    vm.tradeNameColor = {color : "#009688"};
    /** Mailbox **/
    vm.mailbox = docsResponse.viewModel.mailbox;

    //Function mapping
    vm.onUnlinkClicked = onUnlinkClicked;
    vm.validateDateRange = validateDateRange;
    vm.onSubmitClicked = onSubmitClicked;
    vm.onSaveClicked = onSaveClicked;
    vm.onCancelClicked = onCancelClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.computeSubtotal = computeSubtotal;
    activate();

    function activate() {
        if (docsResponse.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = docsResponse.viewModel.comments;
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
        var date = dateUtils.getMomentFromString(docsResponse.viewModel.month, docsResponse.viewModel.year)
        vm.billDate = dateUtils.momentToStringDisplay(date, "MMMM-YYYY");
    }

    //region FUNCTIONS
    /**
     * Laucnhes a dialog for confirmation. If yes, make a network call to unlink user.
     */
    function onUnlinkClicked() {
        if (vm.links.hasOwnProperty("hoa:unassign")) {
            var url = vm.links["hoa:unassign"].href;
            dialogProvider.getConfirmDialog(unassignDocument, null, "This will no longer be assigned to you", "Are you sure?")
        }
        function unassignDocument() {
            docsApi.unassignDocument(url).then(returnToList);
        }
    }

    function returnToList() {
        $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
    }

    /**
     * Validates the data ranges but we do not store the actual date type
     * @param field
     * @param inputField
     */
    function validateDateRange(field) {
        field.value = dateUtils.getLocalStringDisplay(field.value, vm.format)
    }

    /**
     * Submits the current document to the next box
     */
    function onSubmitClicked() {
        dialogProvider.getCommentDialog("Move document to ", vm.nextAction.title).then(okayClicked);

        //Save the document first, then submit
        function okayClicked(comment) {
            vm.currentComment = comment;
            preparePostData();
            var postData = documentsHelper.formatServerData(docsResponse);
            docsApi.editDocument(documentId, postData).then(submit, error);
        }

        function submit() {
            docsApi.moveToBox(vm.nextAction.url).then(success, error);
        }

        var success = function(response) {
            toastsProvider.showSimpleToast('Your document was sent for checking.');
            $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true})
        };

        var error = function(error) {};
    }

    /**
     * Callback for when the save button is clicked
     */
    function onSaveClicked(billingForm) {
        preparePostData();
        var postData = documentsHelper.formatServerData(docsResponse);
        docsApi.editDocument(documentId, postData)
            .then(function(response) {
                      if (billingForm.$invalid) {
                          toastsProvider.showSimpleToast('Saved but there are missing fields');
                          vm.currentComment = null;
                      }
                      else {
                          toastsProvider.showSimpleToast('Ready for submission');
                      }
                  }, function() {
                      toastsProvider.showSimpleToast('We couldn\t save your document');
                  });
    }

    /**
     * Callback for when the cancel button is clicked
     */
    function onCancelClicked(billingForm) {
        if (billingForm.$pristine) {
            $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
        }
        else {
            openCancelModal();
        }
    }

    /**
     * Handles the cancel modal
     */
    function openCancelModal() {
        var message = "Are you sure you want to exit?";
        var title = "Changes have not been saved";
        var okFxn = function(response) {
            $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
        };

        dialogProvider.getConfirmDialog(okFxn, null, message, title);
    }

    /**
     * Callback for when the delete button is clicked
     */
    function onDeleteClicked() {
        var message = "Delete document"
        var title = "This will delete the document permanently"
        var okFxn = function(response) {
            docsApi.deleteDocument(documentId)
                .then(function(response) {
                          toastsProvider.showSimpleToast("Delete successful");
                          $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
                      }, function(error) {
                          toastsProvider.showSimpleToast("We couldn't delete your document");
                      });
        };

        dialogProvider.getConfirmDialog(okFxn, null, message, title);
    }

    /**
     * Called when one of the total values is changed to compute the summary value of the whole billing
     * @param section
     */
    function computeSubtotal() {
        var total = 0;
        angular.forEach(vm.previous.sections, function(subsection) {
            if (subsection.hasOwnProperty("sectionTotal")) total += subsection.sectionTotal.value;
        });
        vm.previous.summary.value = total;

        total = 0;
        angular.forEach(vm.thisMonth.sections, function(subsection) {
            if (subsection.hasOwnProperty("sectionTotal")) total += subsection.sectionTotal.value;
        });
        vm.thisMonth.summary.value = total;

        if (isFinite(vm.previous.summary.value) && isFinite(vm.thisMonth.summary.value)) {
            vm.summary.value = vm.previous.summary.value + vm.thisMonth.summary.value;
        }
    }

    function goToComments() {
        var oldHash = $location.hash();
        $location.hash("comments");
        $anchorScroll();
        $location.hash(oldHash);
    }

    function preparePostData() {
        docsResponse.viewModel.body.previous = vm.previous;
        docsResponse.viewModel.body.thisMonth = vm.thisMonth;
        docsResponse.viewModel.body.summary = vm.summary;
        docsResponse.viewModel.comments = commentsHelper.parseComments(vm.currentComment, vm.comments);
        docsResponse.viewModel.assigned = vm.currentUser;
    }

    //endregion

}

draftsCtrl.$inject = [
    "$state",
    "$anchorScroll",
    "$location",
    //API
    "documentsApi",
    //SERVICES
    "documentsHelper",
    "commentsHelper",
    "hoaDialogService",
    "hoaToastService",
    //UTILS
    "nvl-dateutils",
    //RESOLVE
    "documentResponse",
    "userDetails",
    "tenantResponse"
];