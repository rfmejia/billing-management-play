/**
 * Created by juancarlos.yu on 2/15/15.
 */
var approve = angular.module("module.mailbox");

approve.controller("controller.approval", ['$scope', '$state', 'documentsService', 'documentsResponse', 'templatesResponse', '$modal', 'moment', 'toaster',
    function ApprovalCtrlr($scope, $state, documentsService, documentsResponse, templatesResponse, $modal, moment, toaster) {

        this.comments = "jc";

        /** Previous months template **/
        $scope.previous = documentsResponse.details.breakdown.previous;
        /** This months template **/
        $scope.thisMonth = documentsResponse.details.breakdown.thisMonth;
        /** Summary template **/
        $scope.summary = documentsResponse.details.summary;
        /** Handles the input for the current comment **/
        $scope.currentComment = "";
        /** List of comment made in previous phases of the workflow **/
        $scope.commentsList = {
            "comments" : documentsResponse.details.summary.comments
        };
        /** If null, this means that this document has not been pushed to the server yet **/
        $scope.documentId = documentsResponse.documentId;
        /** The tenant's id **/
        $scope.tenantId = documentsResponse.forTenant;
        /** The document's billing month **/
        $scope.billingPeriod = documentsResponse.forMonth;
        /** Submit url **/
        $scope.submitUrl = documentsResponse.nextBox.href;
        /** Reject url **/
        $scope.rejectUrl = documentsResponse.prevBox.href;
        /** Document title for display **/
        $scope.documentTitle = documentsResponse.title;
        /** template as provided for by the server **/
        //TODO: remove this no longer needed since the service parses it for us.
        $scope.postTemplate = templatesResponse;
        /** Format used for all dates **/
        $scope.format = "MMMM-YYYY";
        /** Modal button positive **/
        $scope.positiveButton = {};
        /** Modal button negative **/
        $scope.negativeButton = {};
        /** Modal information **/
        $scope.modal = {};

        /**
         * Submits the current document to the next box
         */
        $scope.onApproveClicked = function() {
            var postData = preparePostData();
            var success = function(response) {
                toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
            };

            var error = function(error) {};

            documentsService.submitToNextBox($scope.documentId, $scope.submitUrl, postData)
                .then(success);
        };

        /**
         * Callback for when the cancel button is clicked
         */
        $scope.onRejectClicked = function() {
            if($scope.billingForm.$pristine) {
                $state.go("workspace.documents");
            }
            else {
                $scope.prepareCancelModal();
                $scope.openModal();
            }
        };

        /**
         * Holder for the positive button click
         * @param response
         */
        $scope.modalPositive = function(response) {};

        /**
         * Holder for negative button click
         * @param negative
         */
        $scope.modalNegative = function(negative){};

        /**
         * Opens the modal
         */
        $scope.openModal = function() {
            var modalInstance = $modal.open({
                templateUrl : 'app/components/workspace/mailbox/views/modal-document-create.html',
                controller  : "controller.approve.modal",
                backdrop    : 'static',
                resolve     : {
                    modal   : function() {
                        return $scope.modal;
                    },
                    negativeButton : function() {
                        return $scope.negativeButton;
                    },
                    positiveButton : function() {
                        return $scope.positiveButton;
                    }
                }
            });

            modalInstance.result.then(function(response) {
                $scope.modalPositive(response);
            }, function(error) {
                $scope.modalNegative(error);
            });
        };

        /**
         * Handles the cancel modal
         */
        $scope.prepareCancelModal = function() {
            $scope.negativeButton.type = "btn-default";
            $scope.negativeButton.message = "No";

            $scope.positiveButton.type = "btn-warning";
            $scope.positiveButton.message = "Yes";

            $scope.modal.title = "Changes not saved.";
            $scope.modal.message = "Are you sure you want to cancel?";

            //TODO: Prepare post data to return to the prev box
            $scope.modalPositive = function(response) {
                var postData = preparePostData();
                $state.go("workspace.documents");
            };

            $scope.modalNegative = function(error) {};
        };

        /**
         * Service formats the data and this function will return the formatted post data ready for posting.
         */
        var preparePostData = function() {
            return documentsService.formatPostData(
                $scope.forMonth,
                $scope.tenantId,
                $scope.previous,
                $scope.thisMonth,
                $scope.documentTitle,
                $scope.summary,
                $scope.currentComment,
                $scope.commentsList.comments
            );
        };
}]);

approve.controller("controller.approve.modal",["$scope", "$modalInstance", "modal", "negativeButton", "positiveButton",
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