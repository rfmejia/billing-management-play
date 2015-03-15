/**
 * Created by juancarlos.yu on 3/15/15.
 */
angular
    .module("module.reports")
    .controller("reportUpdateCtrl", reportUpdateCtrl);

reportUpdateCtrl.$inject = ["documentsService", "document", "REPORTS_ROUTES"];
function reportUpdateCtrl(docsSrvc, document, reportsRoutes) {
    var vm = this;
    vm.payments = document.viewModel.amountPaid;
    console.log(vm.payments);
}