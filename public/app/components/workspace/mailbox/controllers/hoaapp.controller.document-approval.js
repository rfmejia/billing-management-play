/**
 * Created by juancarlos.yu on 2/15/15.
 */
var approve = angular.module("module.mailbox");

approve.controller("controller.approval", ['$scope', '$state', 'documentsService', 'documentsResponse', '$modal', 'moment', 'toaster',
    function($scope, $state, documentsService, documentsResponse, $modal, moment, toaster) {
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
        var documentId = documentsResponse.documentId;
        /** The tenant's id **/
        var tenantId = documentsResponse.forTenant;
        /** The document's billing month **/
        var billingPeriod = documentsResponse.forMonth;
        /** Submit url **/
        var submitUrl = documentsResponse.nextBox.href;
        /** Reject url **/
        var rejectUrl = documentsResponse.prevBox.href;
        /** Document title for display **/
        $scope.documentTitle = documentsResponse.title;
        /** Format used for all dates **/
        $scope.format = "MMMM-YYYY";
        /** Modal button positive **/
        $scope.positiveButton = {};
        /** Modal button negative **/
        $scope.negativeButton = {};
        /** Modal information **/
        $scope.modal = {};

        /**
         * Submits the current document to the next box or previous box depending on the passed in boolean
         * @param isApproved if true will send to next box otherwise will send to previous box
         */
        $scope.onMoveToBoxClicked = function(isApproved) {
            var message = isApproved
                ? 'Document was sent for checking'
                : 'Document returned';
            var url = isApproved
                ? submitUrl
                : rejectUrl;
            var postData = preparePostData();
            var success = function(response) {
                toaster.pop('success', message);
                $state.go("workspace.pending.drafts");
            };
            var error = function(error) {};

            documentsService.moveToBox(documentId, url, postData)
                .then(success);
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
                $state.go("workspace.pending.drafts");
            };

            $scope.modalNegative = function(error) {};
        };

        /**
         * Service formats the data and this function will return the formatted post data ready for posting.
         */
        var preparePostData = function() {
            console.log($scope.commentsList)
            return documentsService.formatPostData(
                billingPeriod,
                tenantId,
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