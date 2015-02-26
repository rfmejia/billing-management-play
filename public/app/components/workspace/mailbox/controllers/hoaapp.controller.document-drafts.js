/**
 * Created by juancarlos.yu on 2/15/15.
 */
var drafts = angular.module("module.mailbox");

angular
    .module('module.mailbox')
    .controller('controller.drafts', [
        'documentsHelper',
        'documentsResponse',
        'documentsService',
        'helper.comments',
        '$modal',
        'moment',
        '$scope',
        '$state',
        'toaster',
        draftsCtrl
    ]);

function draftsCtrl(documentsHelper, documentsResponse, documentsService, commentsHelper, $modal,  moment, $scope, $state,  toaster){

    var vm = this;
    /** Previous months template **/
    vm.previous;
    /** This months template **/
    vm.thisMonth;
    /** Summary template **/
    vm.summary;
    /** Current comment made in this phase of the workflow **/
    vm.currentComment;
    /** Previous comments made in different phases of the workflow **/
    vm.comments;
    /** If null, this means that this document has not been pushed to the server yet **/
    var documentId;
    /** Next box **/
    vm.submitUrl;
    /** Document title for display **/
    vm.documentTitle;
    /** Format used for all dates **/
    vm.format;
    /** Modal button positive **/
    vm.positiveButton = {};
    /** Modal button negative **/
    vm.negativeButton = {};
    /** Modal information **/
    vm.modal = {};

    activate();

    function activate() {
        vm.previous = documentsResponse.viewModel.body.previous;
        vm.thisMonth = documentsResponse.viewModel.body.thisMonth;
        vm.summary = documentsResponse.viewModel.body.summary;
        vm.currentComment = "";
        documentId = documentsResponse.viewModel.documentId;
        vm.submitUrl = documentsResponse.viewModel.nextAction.nextBox.url;
        vm.documentTitle = documentsResponse.viewModel.documentTitle;
        vm.format = "MMMM-YYYY";


        if(documentsResponse.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = documentsResponse.viewModel.comments;
        }
        else {
            vm.comments = commentsHelper.parseComments(null, null);
        }

    }


    //region FUNCTIONS
    /**
     * Sets the string date for other input fields
     * @param newDate
     * @param oldDate
     * @param field
     */
    vm.onDateRangeSet = function(newDate, oldDate, field, inputField) {
        inputField.$setValidity("date", true);
        field.value = moment(newDate).format(vm.format);
    };

    /**
     * Validates the data ranges but we do not store the actual date type
     * @param field
     * @param inputField
     */
    vm.validateDateRange = function(field, inputField) {
        var newDate = moment(field.value, vm.format);
        if(!moment(newDate).isValid()) {
            inputField.$setValidity("date", false);
        }
        else inputField.$setValidity("date", true);
    };

    /**
     * Submits the current document to the next box
     */
    vm.onSubmitClicked = function() {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        console.log(postData);
        var success = function(response) {
            toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
            $state.go("workspace.pending.drafts")
        };

        var error = function(error) {};

        documentsService.moveToBox(documentId, vm.submitUrl, postData)
            .then(success);

    };

    /**
     * Callback for when the save button is clicked
     */
    vm.onSaveClicked = function(billingForm) {
        preparePostData();
        var postData = documentsHelper.formatServerData(documentsResponse);
        console.log(postData);
        documentsService.editDocument(documentId, postData)
            .then(function(response) {
                if(billingForm.$invalid) {
                    toaster.pop('warning', 'Saved but...', 'Still can\'t submit your document because of missing or invalid fields.');
                }
                else {
                    toaster.pop('success', 'All done!', 'Document can now be submitted to the next phase.')
                }
            }, function() {
                toaster.pop('error', 'Error', 'We couldn\'t save your document');
            });
    };

    /**
     * Callback for when the cancel button is clicked
     */
    vm.onCancelClicked = function() {
        if(vm.billingForm.$pristine) {
            $state.go("workspace.pending.drafts");
        }
        else {
            vm.prepareCancelModal();
            vm.openModal();
        }
    };

    /**
     * Callback for when the delete button is clicked
     */
    vm.onDeleteClicked = function() {
        vm.prepareDeleteModal();
        vm.openModal();
    };

    /**
     * Called when one of the total values is changed to compute the summary value of the whole billing
     * @param section
     */
    vm.computeSubtotal = function(section) {
        var total = 0;
        angular.forEach(section.sections, function(subsection) {
            total += subsection.total;
        });
        section.summary.value = total;

        vm.summary.value = vm.previous.summary.value + vm.thisMonth.summary.value;
    };

    /**
     * Holder for the positive button click
     * @param response
     */
    vm.modalPositive = function(response) {};

    /**
     * Holder for negative button click
     * @param negative
     */
    vm.modalNegative = function(negative){};

    /**
     * Opens the modal
     */
    vm.openModal = function() {
        var modalInstance = $modal.open({
            templateUrl : 'app/components/workspace/mailbox/views/modal-document-create.html',
            controller  : "controller.create.modal",
            backdrop    : 'static',
            resolve     : {
                modal   : function() {
                    return vm.modal;
                },
                negativeButton : function() {
                    return vm.negativeButton;
                },
                positiveButton : function() {
                    return vm.positiveButton;
                }
            }
        });

        modalInstance.result.then(function(response) {
            vm.modalPositive(response);
        }, function(negative) {
            vm.modalNegative(negative);
        });
    };

    /**
     * Handles the delete modal values
     */
    vm.prepareDeleteModal = function() {
        vm.negativeButton.type = "btn-default";
        vm.negativeButton.message = "Cancel";

        vm.positiveButton.type = "btn-danger";
        vm.positiveButton.message = "Delete";

        vm.modal.title = "Delete draft";
        vm.modal.message = "Are you sure you want to permanently delete this document?";

        vm.modalPositive = function(response) {
            documentsService.deleteDocument(documentId)
                .then(function(response) {
                    toaster.pop("warning", "Delete successful");
                    $state.go("workspace.pending.drafts");
                }, function(error) {
                    toaster.pop("error", "We couldn't delete your document");
                });
        };

        vm.modalNegative = function(error){

        };
    };

    /**
     * Handles the cancel modal
     */
    vm.prepareCancelModal = function() {
        vm.negativeButton.type = "btn-default";
        vm.negativeButton.message = "No";

        vm.positiveButton.type = "btn-warning";
        vm.positiveButton.message = "Yes";

        vm.modal.title = "Changes not saved.";
        vm.modal.message = "Are you sure you want to cancel?";

        vm.modalPositive = function(response) {
            $state.go("workspace.pending.drafts");
        };

        vm.modalNegative = function(error) {};
    };

    /**
     * Will change the helper text's decoration depending on validity
     * @param input
     * @returns {string}
     */
    vm.isRequiredMuted = function(input) {
        if(!input.$pristine && input.$invalid) return 'text-danger';
        else return 'muted';
    };

    /**
     * Will determine which error message to show
     * @param input
     * @param isRequired
     * @returns {string}
     */
    vm.showErrorMessage = function(input, isRequired) {
        if(input.$pristine && !isRequired) return "";
        if(input.$pristine && isRequired) return "Required";
        if(!input.$pristine && isRequired && !input.$invalid) return "Required";
        if(!input.$pristine) {
            if(input.$error.required) return "Required";
            else if(input.$error.number) return "Invalid number";
            else if(input.$error.min) return "Positive numbers only";
            else if(input.$error.date) return "Invalid format";
        }
    };

    var preparePostData = function() {
        documentsResponse.viewModel.body.previous = vm.previous;
        documentsResponse.viewModel.body.thisMonth = vm.thisMonth;
        documentsResponse.viewModel.body.summary = vm.summary;
        documentsResponse.viewModel.comments = commentsHelper.parseComments(vm.currentComment, vm.comments);
    }
    //endregion

}

drafts.controller("controller.create.modal",["$scope", "$modalInstance", "modal", "negativeButton", "positiveButton",
    function($scope, $modalInstance, modal, negativeButton, positiveButton) {

        $scope.modal = modal;
        $scope.negativeButton = negativeButton;
        $scope.positiveButton = positiveButton;

        $scope.onPositiveClicked = function() {
            $modalInstance.close();
        };

        $scope.onNegativeClicked = function() {
            console.log("on negative clicked");
        };
}]);