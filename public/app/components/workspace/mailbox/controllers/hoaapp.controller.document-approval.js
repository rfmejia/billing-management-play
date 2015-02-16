/**
 * Created by juancarlos.yu on 2/15/15.
 */
var approve = angular.module("module.mailbox");

approve.controller("controller.approval", ['$scope', '$state', 'documentsService', 'documentsResponse', 'templatesResponse', '$modal', 'moment', 'toaster',
    function($scope, $state, documentsService, documentsResponse, templatesResponse, $modal, moment, toaster) {
        console.log(documentsResponse);
        /** Previous months template **/
        $scope.previous = documentsResponse.details.breakdown.previous;
        /** This months template **/
        $scope.thisMonth = documentsResponse.details.breakdown.thisMonth;
        /** Summary template **/
        $scope.summary = documentsResponse.details.summary;
        /** If null, this means that this document has not been pushed to the server yet **/
        $scope.documentId = documentsResponse.documentId;
        /** The tenant's id **/
        $scope.tenantId = documentsResponse.forTenant;
        /** The document's billing month **/
        $scope.billingPeriod = documentsResponse.forMonth;
        /** Next box **/
        $scope.submitUrl = documentsResponse.nextBox.href;
        /** Document title for display **/
        $scope.documentTitle = documentsResponse.title;
        /** template as provided for by the server **/
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
            preparePostData();
            var success = function(response) {
                toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
            };

            var error = function(error) {};

            documentsService.submitToNextBox($scope.submitUrl, $scope.postTemplate)
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

            $scope.modalPositive = function(response) {
                $state.go("workspace.documents");
            };

            $scope.modalNegative = function(error) {};
        };

        /**
         * Convenience function that prepares the data to be posted to the server
         */
        var preparePostData = function() {
            $scope.postTemplate.body.breakdown.previous = $scope.previous;
            $scope.postTemplate.body.breakdown.thisMonth = $scope.thisMonth;
            $scope.postTemplate.body.summary = $scope.summary;
            $scope.postTemplate.forTenant = $scope.tenantId;
            $scope.postTemplate.forMonth = moment($scope.forMonth);
            $scope.postTemplate.title = $scope.documentTitle;
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