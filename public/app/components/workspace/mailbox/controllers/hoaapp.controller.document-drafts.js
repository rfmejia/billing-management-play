var create = angular.module("module.mailbox");

create.controller("controller.drafts", ["$scope", "$state", "documentsService", "tenantsList", "template", "documentsResponse", "$filter", "$modal", "moment", "toaster",
	function($scope, $state, documentsService, tenantsList, template, documentsResponse, $filter,  $modal, moment, toaster){
        /** Tenants list **/
		$scope.tenants = tenantsList.tenants;
        /** Previous months template **/
        $scope.previous = template.breakdown.previous;
        /** This months template **/
        $scope.thisMonth = template.breakdown.thisMonth;
        /** Summary template **/
        $scope.summary = template.summary;
        /** template as provided for by the server **/
        $scope.postTemplate = documentsResponse.createTemplate;
        /** The doctype of the created document**/
        $scope.postTemplate.docType = template.docType;
        /** Format used for all dates **/
        $scope.format = "MMMM-yyyy";
        /** Current billing date **/
        $scope.billDate = new Date();
        /** If null, this means that this document has not been pushed to the server yet **/
        $scope.documentId = {};
        /** Modal button positive **/
        $scope.positiveButton = {};
        /** Modal button negative **/
        $scope.negativeButton = {};

        $scope.isInEditingMode = false;
        /** Modal information **/
        $scope.modal = {};

        //Functions
        /**
         * Formats the date displayed in the input field
         * @param currentDate
         */
		$scope.setBillDateFormat = function(currentDate) {
            $scope.stringDate = $filter('date')(currentDate, $scope.format);
		};


        /**
         * Callback for the input field for Date Picker. Is not called when input is typed in
         * @param inputField
         * @param newDate
         */
        $scope.onBillDateSet = function (inputField, newDate) {
            $scope.billDate = newDate;
            $scope.setBillDateFormat(newDate);
            $scope.validateBillDate(inputField);
        };

        /**
         * Callback for when the billing date is manually inputted
         * @param inputField
         */
        $scope.validateBillDate = function(inputField) {
            $scope.billDate = moment($scope.stringDate, $scope.format);
            inputField.$setValidity("date", moment($scope.billDate).isValid());
        };

        /**
         * Sets the string date for other input fields
         * @param newDate
         * @param oldDate
         * @param field
         */
        $scope.onDateRangeSet = function(newDate, oldDate, field, inputField) {
            inputField.$setValidity("date", true);
            field.value = $filter('date')(newDate, "MMMM-yyyy");;
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
         * Validates the tenant when it's manually inputted
         * @param inputField
         */
        $scope.validateTenant = function(inputField) {
            $scope.selectedTenant = null;
            angular.forEach($scope.tenants, function(value) {
                if(value.tradeName == $scope.tenantName) {
                    $scope.selectedTenant = value;
                }
            });
            return $scope.selectedTenant != null
        };

        /**
         * Callback for when the save button is clicked
         */
        $scope.onSaveClicked = function(billingForm) {
            preparePostData();
            if($scope.isInEditingMode()) {
                documentsService.createDocument($scope.postTemplate)
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
            }
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

        $scope.isRequiredMuted = function(input) {
            if(!input.$pristine && input.$invalid) return 'text-danger';
            else return 'muted';
        };

        $scope.showErrorMessage = function(input, isRequired) {
            if(input.$pristine && !isRequired) return "";
            if(input.$pristine && isRequired) return "Required";
            if(!input.$pristine && isRequired && !input.$invalid) return "Required";
            if(!input.$pristine) {
                if(input.$error.required) return "Required";
                else if(input.$error.number) return "Invalid number";
                else if(input.$error.min) return "Positive numbers only";
                else if(input.$error.date) return "Invalid format";
                else if(input.$error.editable) return "Please select from the list"
            }
        };

        /**
         * Convenience function that prepares the data to be posted to the server
         */
        var preparePostData = function() {
            $scope.selectedTenant = null;
            angular.forEach($scope.tenants, function(value) {
                if(value.tradeName == $scope.tenantName) {
                    $scope.selectedTenant = value;
                }
            });
            $scope.isSelectedTenantValid = true;
            $scope.postTemplate.body = {
                "breakdown" : {
                    "previous" : $scope.previous,
                    "thisMonth" : $scope.thisMonth
                },
                "summary" : $scope.summary
            };

            $scope.postTemplate.forMonth = $scope.billDate.toISOString();
            $scope.postTemplate.forTenant = $scope.selectedTenant.id;
            $scope.postTemplate.title = $scope.selectedTenant.tradeName + " - " +$filter('date')($scope.stringDate, "MMMM-yyyy");
            console.log($scope.postTemplate);
        };
        //Functions end


        //Program
        //Initialize date to today
        $scope.setBillDateFormat(new Date());
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