/**
 * Created by juancarlos.yu on 2/15/15.
 */
angular
    .module('app.mailbox')
    .controller('controller.drafts', [
                    'documentsHelper',
                    'documentsResponse',
                    'userResponse',
                    'tenantsResponse',
                    'documentsService',
                    'helper.comments',
                    'service.hoadialog',
                    'moment',
                    '$state',
                    '$stateParams',
                    '$resource',
                    "$anchorScroll",
                    "$location",
                    'service.hoatoasts',
                    "nvl-dateutils",
                    draftsCtrl
                ]);

function draftsCtrl(documentsHelper, documentsResponse, userResponse, tenantsResponse, documentsService, commentsHelper, dialogProvider, moment, $state, $stateParams, $resource, $anchorScroll, $location, toastsProvider, dateUtils) {
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
    vm.nextAction = documentsResponse.viewModel.nextAction.nextBox;
    /** Document title for display **/
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** Display for month **/
    vm.billDate = documentsResponse.viewModel.billDate;
    /** Tenant model **/
    vm.tenant = tenantsResponse.viewModel;
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId = documentsResponse.viewModel.documentId;
    /** User assigned to this document **/
    vm.assigned = documentsResponse.viewModel.assigned;
    /** Current user **/
    vm.currentUser = userResponse.userId;
    /** Links **/
    vm.links = documentsResponse.viewModel.links;
    /** Disables the editing of this document if it's not locked to the user **/
    vm.tradeNameColor = {color : "#009688"};
    /** Mailbox **/
    vm.mailbox = documentsResponse.viewModel.mailbox;

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
            documentsService.unassignDocument(url).then(returnToList);
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
            var postData = documentsHelper.formatServerData(documentsResponse);
            documentsService.editDocument(documentId, postData).then(submit, error);
        }

        function submit() {
            documentsService.moveToBox(vm.nextAction.url).then(success, error);
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
        var postData = documentsHelper.formatServerData(documentsResponse);
        documentsService.editDocument(documentId, postData)
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
            documentsService.deleteDocument(documentId)
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
        documentsResponse.viewModel.body.previous = vm.previous;
        documentsResponse.viewModel.body.thisMonth = vm.thisMonth;
        documentsResponse.viewModel.body.summary = vm.summary;
        documentsResponse.viewModel.comments = commentsHelper.parseComments(vm.currentComment, vm.comments);
        documentsResponse.viewModel.assigned = vm.currentUser;
    }

    //endregion

}