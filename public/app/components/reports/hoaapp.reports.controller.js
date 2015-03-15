/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .controller("reportsCtrl", controller);

controller.$inject = ["documentsHelper", "documentsService", "documentsList", "reportResponse", "$state", "$q", "moment", "REPORTS_ROUTES"];
function controller(docsHelper, docsSrvc, documents, reportResponse, $state, $q, moment, reportsRoutes) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    vm.documents = documents.viewModel.list;
    vm.isPaid = null;
    vm.selectedFilter = null;
    vm.report = reportResponse;

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.onReportMonthSelected = onReportMonthSelected;
    vm.onDocumentItemClicked = onDocumentItemClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.allFilter = {title : "All", params : {mailbox : "delivered"}};
        vm.paidFilter = {title : "Paid", params : {mailbox: "delivered", isPaid: true}};
        vm.unpaidFilter = {title : "Unpaid", params : {mailbox: "delivered", isPaid: false}};
    }

    function onFilterClicked(params) {
        refresDocuments(params);
    }

    function onReportMonthSelected(newDate, oldDate) {
        var params = {mailbox : "delivered", forMonth: newDate}
        refresDocuments(params);
    }

    function refresDocuments(params) {
        vm.documents = [];
        docsSrvc.getDocumentList(params)
            .then(success);
        function success(response) {
            vm.documents = response._embedded.item;
        }
    }

    function onDocumentItemClicked(item) {
        $state.go(reportsRoutes.reportUpdate, {id: item.id});
    }
    //endregion

}