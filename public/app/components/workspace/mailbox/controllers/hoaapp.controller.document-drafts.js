var drafts = angular.module("module.mailbox");

drafts.controller("controller.drafts", ["$scope", "$state", "documentsService", "documentsResponse", "templatesResponse", "$modal", "moment", "toaster",
        function($scope, $state, documentsService, documentsResponse, templatesResponse, $modal, moment, toaster){
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
            //Functions
            /**
             * Sets the string date for other input fields
             * @param newDate
             * @param oldDate
             * @param field
             */
            $scope.onDateRangeSet = function(newDate, oldDate, field, inputField) {
                inputField.$setValidity("date", true);
                field.value = moment(newDate).format($scope.format);
            };

            /**
             * Validates the data ranges but we do not store the actual date type
             * @param field
             * @param inputField
             */
            $scope.validateDateRange = function(field, inputField) {
                var newDate = moment(field.value, $scope.format);
                if(!moment(newDate).isValid()) {
                    inputField.$setValidity("date", false);
                }
                else inputField.$setValidity("date", true);
            };

            /**
             * Submits the current document to the next box
             */
            $scope.onSubmitClicked = function() {
                preparePostData();
                var success = function(response) {
                    toaster.pop('success', 'Submitted!', 'Your document was sent for checking.');
                };

                var error = function(error) {};

                documentsService.submitToNextBox($scope.submitUrl, $scope.postTemplate)
                    .then(success);
            };

            /**
             * Callback for when the save button is clicked
             */
            $scope.onSaveClicked = function(billingForm) {
                preparePostData();
                console.log($scope.documentId);
                documentsService.editDocument($scope.documentId, $scope.postTemplate)
                    .then(function(response) {
                        if(billingForm.$invalid) {
                            toaster.pop('warning', 'Saved but...', 'Still can\'t submit your document because of missing or invalid fields.');
                        }
                        else {
                            toaster.pop('success', 'All done!', 'Document can now be submitted to the next phase.')
                        }
                        console.log(response);
                    }, function() {
                        toaster.pop('error', 'Error', 'We couldn\'t save your document');
                    });
            };

            /**
             * Callback for when the cancel button is clicked
             */
            $scope.onCancelClicked = function() {
                if($scope.billingForm.$pristine) {
                    $state.go("workspace.documents");
                }
                else {
                    $scope.prepareCancelModal();
                    $scope.openModal();
                }
            };

            /**
             * Callback for when the delete button is clicked
             */
            $scope.onDeleteClicked = function() {
                $scope.prepareDeleteModal();
                $scope.openModal();
            };

            /**
             * Called when one of the total values is changed to compute the summary value of the whole billing
             * @param section
             */
            $scope.computeSubtotal = function(section) {
                var total = 0;
                angular.forEach(section.sections, function(subsection) {
                    total += subsection.total;
                });
                section.summary.value = total;

                $scope.summary.value = $scope.previous.summary.value + $scope.thisMonth.summary.value;
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
                    controller  : "controller.create.modal",
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
             * Handles the delete modal values
             */
            $scope.prepareDeleteModal = function() {
                $scope.negativeButton.type = "btn-default";
                $scope.negativeButton.message = "Cancel";

                $scope.positiveButton.type = "btn-danger";
                $scope.positiveButton.message = "Delete";

                $scope.modal.title = "Delete draft";
                $scope.modal.message = "Are you sure you want to permanently delete this document?";

                $scope.modalPositive = function(response) {
                    documentsService.deleteDocument($scope.documentId)
                        .then(function(response) {
                            toaster.pop("warning", "Delete successful");
                            $state.go("workspace.documents");
                        }, function(error) {
                            toaster.pop("error", "We couldn't delete your document");
                        });
                };

                $scope.modalNegative = function(error){

                };
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
             * Will change the helper text's decoration depending on validity
             * @param input
             * @returns {string}
             */
            $scope.isRequiredMuted = function(input) {
                if(!input.$pristine && input.$invalid) return 'text-danger';
                else return 'muted';
            };

            /**
             * Will determine which error message to shwo
             * @param input
             * @param isRequired
             * @returns {string}
             */
            $scope.showErrorMessage = function(input, isRequired) {
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
                console.log($scope.postTemplate);
            };


        //Functions end

	}]
);

create.controller("controller.create.modal",["$scope", "$modalInstance", "modal", "negativeButton", "positiveButton",
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