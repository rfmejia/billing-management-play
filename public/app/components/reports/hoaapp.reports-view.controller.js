/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("module.reports")
    .controller("reportUpdateCtrl", reportUpdateCtrl);

reportUpdateCtrl.$inject = ["documentsService", "document", "REPORTS_ROUTES", "service.hoatoasts", 'service.hoadialog', "$location", "$anchorScroll", 'helper.comments', "documentsHelper", "$state", "nvl-dateutils"];
function reportUpdateCtrl(docsSrvc, document, reportsRoutes, toastProvider, dialogProvider, $location, $anchorScroll, commentsHelper, documentsHelper, $state, dateUtils) {
    var vm = this;
    vm.payments = document.viewModel.amounts;
    vm.comments;
    vm.currentComment = "";
    vm.documentTitle = "";
    var unassignLink = document.viewModel.links["hoa:unassign"].href;
    var amountPaid = document.viewModel.amountPaid;
    var documentId = document.viewModel.documentId;

    //function bindings
    vm.onUpdateClicked = onUpdateClicked;
    vm.onCalculateClicked = onCalculateClicked;
    vm.onCancelClicked = onCancelClicked;

    activate();

    function activate() {
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
            docsSrvc.editDocument(documentId, postData).then(unassignDocument, error);
        }

        var unassignDocument = function() {
            docsSrvc.unassignDocument(unassignLink).then(success, error);
        };

        var success = function(response) {
            returnToReports();
            toastProvider.showSimpleToast('Your document was updated');
        };

        var error = function(error) {};
    }

    function onCalculateClicked() {
        angular.forEach(vm.payments.sections, function(value) {
            value.amounts.unpaid = value.amounts.total - value.amounts.paid;
        });
    }

    function onCancelClicked() {
        returnToReports();
    }

    function returnToReports() {
        $state.go(reportsRoutes.report);
    }
}