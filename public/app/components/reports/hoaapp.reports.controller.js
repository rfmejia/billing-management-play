/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .controller("reportsCtrl", controller);

controller.$inject = ["documentsHelper", "documentsService", "documentsList", "$state", "$q"];
function controller(docsHelper, docsSrvc, documents, $state, $q) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    //vm.documents = documents._embedded.item;
    vm.isPaid = null;
    vm.isPaidOpen = false;
    vm.isUnpaidOpen = false;
    vm.isTotalOpen = true;
    vm.selectedFilter = null;
    vm.toggleTotal = toggleTotal;
    vm.togglePaid = togglePaid;
    vm.toggleUnpaid = toggleUnpaid;
    vm.reportMonth = new Date();

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.onReportMonthSelected = onReportMonthSelected;
    vm.onDocumentItemClicked = onDocumentItemClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.allFilter = {title : "All", params : {mailbox : "delivered"}};
        vm.paidFilter = {title : "Paid", params : {mailbox: "delivered", isPaid: true}};
        vm.unpaidFilter = {title : "Paid", params : {mailbox: "delivered", isPaid: false}};
    }

    function onFilterClicked(params) {
        refresDocuments(params);
    }

    function toggleTotal() {
        vm.isTotalOpen = !vm.isTotalOpen;
    }
    function togglePaid() {
        vm.isPaidOpen = !vm.isPaidOpen;
    }
    function toggleUnpaid() {
        vm.isUnpaidOpen = !vm.isUnpaidOpen;
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

    }
    //endregion

}