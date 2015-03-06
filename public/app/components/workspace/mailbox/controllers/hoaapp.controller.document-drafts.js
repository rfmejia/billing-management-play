/**
 * Created by juancarlos.yu on 2/15/15.
 */
angular
    .module('module.mailbox')
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
                    'toaster',
                    draftsCtrl
                ]);

function draftsCtrl(documentsHelper, documentsResponse, userResponse, tenantsResponse, documentsService, commentsHelper, dialogProvider,  moment, $state, $stateParams, toaster){
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
    /** Document title for display **/
    vm.documentTitle = documentsResponse.viewModel.documentTitle;
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** Display for month **/
    vm.billDate = documentsResponse.viewModel.billDate;
    /** Display for tenant name **/
    vm.tenantName = documentsResponse.viewModel.tenant.tradeName;
    /** Display for tenant details **/
    vm.tenantDetails = tenantsResponse.viewModel;
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId = documentsResponse.viewModel.documentId;
    /** User assigned to this document **/
    vm.assigned = documentsResponse.viewModel.assigned;
    /** Current user **/
    vm.currentUser = userResponse.userId;
    /** Disables the editing of this document if it's not locked to the user **/
    vm.isDisabled;


    //Function mapping
    vm.onDateRangeSet       = onDateRangeSet;
    vm.onUnlinkClicked      = onUnlinkClicked;
    vm.validateDateRange    = validateDateRange;
    vm.onSubmitClicked      = onSubmitClicked;
    vm.onSaveClicked        = onSaveClicked;
    vm.onCancelClicked      = onCancelClicked;
    vm.onDeleteClicked      = onDeleteClicked;
    vm.computeSubtotal      = computeSubtotal;
    activate();

    function activate() {
        if(documentsResponse.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = documentsResponse.viewModel.comments;
        }
        else {
            vm.comments = commentsHelper.parseComments(null, null);
        }
        vm.isDisabled = (vm.assigned.userId != vm.currentUser);
    }


    //region FUNCTIONS
    /**
     * Sets the string date for other input fields
     * @param newDate
     * @param oldDate
     * @param field
     */
    function onDateRangeSet(newDate, oldDate, field, inputField) {
        inputField.$setValidity("date", true);
        field.value = moment(newDate).format(vm.format);
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

    /**
     * Validates the data ranges but we do not store the actual date type
     * @param field
     * @param inputField
     */
    function validateDateRange(field, inputField) {
        var newDate = moment(field.value, vm.format);
        if(!moment(newDate).isValid()) {
            inputField.$setValidity("date", false);
        }
        else inputField.$setValidity("date", true);
    }

    /**
     * Submits the current document to the next box
     */
    function onSubmitClicked() {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        var success = function(response) {
            toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
            $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true})
        };

        var error = function(error) {};

        documentsService.moveToBox(documentId, vm.submitUrl, postData)
            .then(success);
    }

    /**
     * Callback for when the save button is clicked
     */
    function onSaveClicked(billingForm) {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        documentsService.editDocument(documentId, postData)
            .then(function(response) {
                      if(billingForm.$invalid) {
                          toaster.pop('warning', 'Saved but...', 'Still can\'t submit your document because of missing or invalid fields.');
                          vm.currentComment = null;
                      }
                      else {
                          toaster.pop('success', 'All done!', 'Document can now be submitted to the next phase.')
                      }
                  }, function() {
                      toaster.pop('error', 'Error', 'We couldn\'t save your document');
                  });
    }

    /**
     * Callback for when the cancel button is clicked
     */
    function onCancelClicked(billingForm) {
        if(billingForm.$pristine) {
            $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
        }
        else openCancelModal();
    }

    /**
     * Handles the cancel modal
     */
    function openCancelModal() {
        var message = "Are you sure you want to exit?";
        var title = "Changes have not been saved";
        var okFxn  = function(response) {
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
                          toaster.pop("warning", "Delete successful");
                          $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
                      }, function(error) {
                          toaster.pop("error", "We couldn't delete your document");
                      });
        };

        dialogProvider.getConfirmDialog(okFxn, null, message, title);
    }

    /**
     * Called when one of the total values is changed to compute the summary value of the whole billing
     * @param section
     */
    function computeSubtotal(section) {
        var total = 0;
        angular.forEach(section.sections, function(subsection) {
            total += subsection.total;
        });
        section.summary.value = total;

        vm.summary.value = vm.previous.summary.value + vm.thisMonth.summary.value;
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