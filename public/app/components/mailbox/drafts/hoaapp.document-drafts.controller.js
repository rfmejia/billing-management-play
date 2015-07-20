/**
 * Created by juancarlos.yu on 2/15/15.
 */
angular
    .module('app.mailbox')
    .controller('draftsController', draftsCtrl);

function draftsCtrl($state, $anchorScroll, $location, docsApi, documentsHelper, commentsHelper,
                    dialogProvider, toastsProvider, dateUtils, numPrecisionFilter, docsResponse,
                    userDetails, tenantsResponse, queryHelper, Invoice, document,
                    tenantResponse) {
    var vm = this;
    /** Current comment made in this phase of the workflow **/
    vm.currentComment = "";
    /** Previous comments made in different phases of the workflow **/
    vm.comments;
    /** Next box **/
    vm.nextAction = docsResponse.viewModel.nextAction.nextBox;
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
    /** Mailbox **/
    vm.mailbox = docsResponse.viewModel.mailbox;

    vm.document = docsResponse.viewModel;

    var doc = Invoice.build(document.body, tenantResponse);
    vm.previousCharges = doc.previous;
    vm.rent = doc.rent;
    vm.electricity = doc.electricity;
    vm.water = doc.water;
    vm.cusa = doc.cusa;
    vm.summaryValue = doc.summaryValue;
    vm.previousSummary = doc.previousSummary;
    vm.thisMonthSummary = doc.thisMonthSummary;
    vm.remarks = doc.remarks;
    vm.isCusaIncluded = false;
    vm.isTaxed = true;

    //Function mapping
    vm.onUnlinkClicked = onUnlinkClicked;
    vm.validateDateRange = validateDateRange;
    vm.onSubmitClicked = onSubmitClicked;
    vm.onSaveClicked = onSaveClicked;
    vm.onSaveFromPrint = onSaveFromPrint;
    vm.onCancelClicked = onCancelClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.onPreviousChanged = onPreviousChanged;
    vm.onRentChanged = onRentChanged;
    vm.onElectricityChanged = onElectricityChanged;
    vm.onWaterChanged = onWaterChanged;
    vm.onCusaChanged = onCusaChanged;
    vm.onTaxChanged = onTaxChanged;

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
        var date = dateUtils.getMomentFromString(docsResponse.viewModel.month,
                                                 docsResponse.viewModel.year);
        vm.billDate = dateUtils.momentToStringDisplay(date, "MMMM-YYYY");

        angular.forEach(vm.tenant, function (value) {
            if (value.name == 'tradeName') {
                vm.tradeName = value.value;
            }
        });

        if (vm.cusa.sectionTotal.value != 0) {
            vm.isCusaIncluded = true;
        }

        calculatePreviousTotal();
        calculateThisMonthTotal();
    }

    //region FUNCTIONS
    /**
     * Laucnhes a dialog for confirmation. If yes, make a network call to unlink user.
     */
    function onUnlinkClicked() {
        if (vm.links.hasOwnProperty("hoa:unassign")) {
            var url = vm.links["hoa:unassign"].href;
            dialogProvider.getConfirmDialog(unassignDocument, null,
                                            "This will no longer be assigned to you",
                                            "Are you sure?")
        }
        function unassignDocument() {
            docsApi.unassignDocument(url).then(returnToList);
        }
    }

    function returnToList() {
        var params = queryHelper.getDocsListParams("drafts", 0, "mine");
        $state.go("workspace.pending.drafts", params, {reload: true})
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
        dialogProvider.getCommentDialog("Submitting to next phase.",
                                        vm.nextAction.title).then(okayClicked);

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

        var success = function (response) {
            var params = queryHelper.getDocsListParams("drafts", 0, "mine");
            $state.go("workspace.pending.drafts", params, {reload: true})
        };

        var error = function (error) {
        };
    }

    /**
     * Callback for when the save button is clicked
     */
    function onSaveClicked(billingForm) {
        preparePostData();
        var postData = documentsHelper.formatServerData(docsResponse);
        docsApi.editDocument(documentId, postData)
            .then(function (response) {
                      if (billingForm.$invalid) {
                          toastsProvider.showSimpleToast('Saved but there are missing fields');
                          vm.currentComment = null;
                      }
                      else {
                          toastsProvider.showSimpleToast('Ready for submission');
                      }
                  }, function () {
                      toastsProvider.showSimpleToast('We couldn\t save your document');
                  });
    }

    function onSaveFromPrint(billinForm) {
        preparePostData();
        documentsHelper.formatServerData(docsResponse);
        docsApi.editDocument(documentId, postData);
    }

    /**
     * Callback for when the cancel button is clicked
     */
    function onCancelClicked(billingForm) {
        if (billingForm.$pristine) {
            var params = queryHelper.getDocsListParams("drafts", 0, "all");
            $state.go("workspace.pending.drafts", params, {reload: true})
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
        var okFxn = function (response) {
            var params = queryHelper.getDocsListParams("drafts", 0, "all");
            $state.go("workspace.pending.drafts", params, {reload: true})
        };

        dialogProvider.getConfirmDialog(okFxn, null, message, title);
    }

    /**
     * Callback for when the delete button is clicked
     */
    function onDeleteClicked() {
        var message = "Delete document"
        var title = "This will delete the document permanently"
        var okFxn = function (response) {
            docsApi.deleteDocument(documentId)
                .then(function (response) {
                          toastsProvider.showSimpleToast("Delete successful");
                          var params = queryHelper.getDocsListParams("drafts", 0, "all");
                          $state.go("workspace.pending.drafts", params, {reload: true})
                      }, function (error) {
                          toastsProvider.showSimpleToast("We couldn't delete your document");
                      });
        };

        dialogProvider.getConfirmDialog(okFxn, null, message, title);
    }

    function goToComments() {
        var oldHash = $location.hash();
        $location.hash("comments");
        $anchorScroll();
        $location.hash(oldHash);
    }

    function preparePostData() {
        doc.remarks = vm.remarks;
        doc.summaryValue = vm.summaryValue;
        var compiled = doc.compile();
        docsResponse.viewModel.body = compiled.body;
        docsResponse.viewModel.comments =
        commentsHelper.parseComments(vm.currentComment, vm.comments);
        docsResponse.viewModel.assigned = vm.currentUser;
    }

    function onPreviousChanged(form) {
        if (!form.$invalid) {
            doc.previous.compute();
        }
        else {
            doc.previous.clear();
        }
        calculatePreviousTotal();
    }

    function onRentChanged(form) {
        if (!form.$invalid) {
            if (vm.isTaxed) {
                doc.rent.compute();
            } else {
                doc.rent.computeNoTax();
            }
        }
        else {
            doc.rent.clear();
        }
        calculateThisMonthTotal();
    }

    function onElectricityChanged(form) {
        if (!form.$invalid) {
            doc.electricity.compute();
        }
        else {
            doc.electricity.clear();
        }

        calculateThisMonthTotal();
    }

    function onWaterChanged(form) {
        if (!form.$invalid) {
            doc.water.compute();
        }
        else {
            doc.water.clear();
        }

        calculateThisMonthTotal();
    }

    function onCusaChanged() {
        if (vm.isCusaIncluded) {
            doc.cusa.compute();
        }
        else {
            doc.cusa.clear();
        }

        calculateThisMonthTotal();
    }

    function onTaxChanged() {
        if (vm.isTaxed) {
            doc.rent.clear();
            doc.rent.compute();
        }
        else {
            doc.rent.computeNoTax();
        }

        calculateThisMonthTotal();
    }

    function calculatePreviousTotal() {
        vm.previousSummary.value = vm.previousCharges.sectionTotal.value;
        vm.previousSummary.value = numPrecisionFilter(vm.previousSummary.value, 2);
        calculateSummaryTotal();
    }

    function calculateThisMonthTotal() {
        vm.thisMonthSummary.value = vm.rent.sectionTotal.value +
                                    vm.electricity.sectionTotal.value +
                                    vm.water.sectionTotal.value +
                                    vm.cusa.sectionTotal.value;
        vm.thisMonthSummary.value = numPrecisionFilter(vm.thisMonthSummary.value);
        calculateSummaryTotal();
    }

    function calculateSummaryTotal() {
        vm.summaryValue =
        numPrecisionFilter(doc.previousSummary.value + doc.thisMonthSummary.value, 2);
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
    "numPrecisionFilter",
    //RESOLVE
    "documentResponse",
    "userDetails",
    "tenantResponse",
    "queryParams",
    "Invoice",
    "apiDocResponse",
    "apiTenantRequest"
];