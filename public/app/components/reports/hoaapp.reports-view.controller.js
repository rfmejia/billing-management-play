/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .controller("reportUpdateController", reportUpdateController);

function reportUpdateController($location, $anchorScroll, $state, docsSrvc, reportsRoutes, toastProvider, dialogProvider, commentsHelper, documentsHelper, dateUtils, document, userDetails, queryHelper) {
    var vm = this;
    vm.payments = document.viewModel.amounts;
    vm.links = document.viewModel.links;
    vm.comments;
    vm.currentComment = "";
    vm.documentTitle = "";
    vm.assigned = document.viewModel.assigned;
    vm.currentUser = userDetails;
    vm.isDisabled = false;
    var unassignLink = null;
    var amountPaid = document.viewModel.amountPaid;
    var documentId = document.viewModel.documentId;

    //function bindings
    vm.onUpdateClicked = onUpdateClicked;
    vm.onCalculateClicked = onCalculateClicked;
    vm.onCancelClicked = onCancelClicked;
    vm.onUnlinkClicked = onUnlinkClicked;

    activate();

    function activate() {
        if (document.viewModel.links.hasOwnProperty("hoa:unassign")) {
            unassignLink = document.viewModel.links["hoa:unassign"].href;
        }
        if (document.viewModel.comments.hasOwnProperty('all')) {
            vm.comments = document.viewModel.comments;
        }
        else {
            vm.comments = commentsHelper.parseComments(null, null);
        }

        if (vm.comments.hasRecent) {
            toastProvider.showPersistentToast("1 new comment", "view").then(goToComments)
        }
        var date = dateUtils.getMomentFromString(document.viewModel.month, document.viewModel.year);
        vm.documentTitle = document.viewModel.tenant.tradeName + " ";
        vm.documentTitle += dateUtils.momentToStringDisplay(date, "MMMM YYYY");
        if (vm.assigned == null) {
            vm.isDisabled = true;
        }
        else {
            vm.isDisabled = (vm.currentUser.userId != vm.assigned.userId)
        }
    }

    function goToComments() {
        var oldHash = $location.hash();
        $location.hash("comments");
        $anchorScroll();
        $location.hash(oldHash);
    }

    function onUpdateClicked() {
        var title = isPaymentComplete()
            ? "Payment complete!"
            : "Updating balance.";

        dialogProvider.getCommentDialog(title, vm.documentTitle).then(okayClicked);

        function okayClicked(comment) {
            var parsedComments = commentsHelper.parseComments(comment, vm.comments);
            var postData = documentsHelper.formatPaidPostData(vm.payments, amountPaid, parsedComments);
            docsSrvc.editDocument(documentId, postData).then(showToast, error).then(function() {
                docsSrvc.unassignDocument(unassignLink).then(returnToReports);
            });
        }

    }

    function onCancelClicked() {
        if (vm.assigned != null && vm.assigned.userId == vm.currentUser.userId) {
            docsSrvc.unassignDocument(unassignLink).then(returnToReports)
        }
        else {
            returnToReports();
        }
    }

    function onUnlinkClicked() {
        if (vm.links.hasOwnProperty("hoa:unassign")) {
            dialogProvider.getConfirmDialog(unassignDocument, null, "This will no longer be assigned to you", "Are you sure?")
        }
    }

    function unassignDocument() {
        docsSrvc.unassignDocument(unassignLink).then(returnToReports);
    }

    function onCalculateClicked() {
        angular.forEach(vm.payments.sections, function(value) {
            value.amounts.unpaid = value.amounts.total - value.amounts.paid;
        });
    }

    function isPaymentComplete() {
        var due = 0;
        angular.forEach(vm.payments.sections, function(value) {
            due += value.amounts.total - value.amounts.paid;
        });

        return due == 0;
    }

    function showToast() {
        toastProvider.showSimpleToast('Your document was updated');
    }

    function error(error) {
        console.log(error);
    }

    function returnToReports() {
        var filter = queryHelper.getReportsFilters();
        var params = queryHelper.getReportsParams(0, dateUtils.getLocalDateNow(), filter[0].id);
        $state.go(reportsRoutes.report, params, {reload : true});
    }

}
reportUpdateController.$inject = [
    "$location",
    "$anchorScroll",
    "$state",
    //API
    "documentsApi",
    //SERVICES
    "REPORTS_ROUTES",
    "hoaToastService",
    'hoaDialogService',
    'commentsHelper',
    "documentsHelper",
    //UTIL
    "nvl-dateutils",
    //RESOLVE
    "document",
    "userDetails",
    "queryParams"
];