/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("app.reports")
    .controller("reportUpdateCtrl", reportUpdateCtrl);

reportUpdateCtrl.$inject = ["documentsService", "document", "REPORTS_ROUTES", "service.hoatoasts", 'service.hoadialog', "$location", "$anchorScroll", 'helper.comments', "documentsHelper", "$state", "nvl-dateutils", "currentUser"];
function reportUpdateCtrl(docsSrvc, document, reportsRoutes, toastProvider, dialogProvider, $location, $anchorScroll, commentsHelper, documentsHelper, $state, dateUtils, currentUser) {
    var vm = this;
    vm.payments = document.viewModel.amounts;
    vm.links = document.viewModel.links;
    vm.comments;
    vm.currentComment = "";
    vm.documentTitle = "";
    vm.assigned = document.viewModel.assigned;
    vm.currentUser = currentUser;
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
        dialogProvider.getCommentDialog("update ", vm.documentTitle).then(okayClicked);

        function okayClicked(comment) {
            var parsedComments = commentsHelper.parseComments(comment, vm.comments);
            var postData = documentsHelper.formatPaidPostData(vm.payments, amountPaid, parsedComments);
            docsSrvc.editDocument(documentId, postData).then(showToast, error).then(function() {
                docsSrvc.unassignDocument(unassignLink);
                returnToReports();
            });
        }

    }

    function onCancelClicked() {
        if (vm.assigned != null && vm.assigned.userId == vm.currentUser.userId) {
            docsSrvc.unassignDocument(unassignLink).then(returnToReports)
        }
        else returnToReports();
    }

    function onUnlinkClicked() {
        if (vm.links.hasOwnProperty("hoa:unassign")) {
            var url = vm.links["hoa:unassign"].href;
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

    function showToast() {
        toastProvider.showSimpleToast('Your document was updated');
    }

    function error(error) {
        console.log(error);
    }


    function returnToReports() {
        $state.go(reportsRoutes.report, {}, {reload : true});
    }

}