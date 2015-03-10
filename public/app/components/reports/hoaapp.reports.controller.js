/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .controller("reportsCtrl", controller);

controller.$inject = ["documentsHelper", "documentsService", "documentsList", "$state", "$q"];
function controller(docsHelper, docsSrvc, docsList, $state, $q) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    /** When null, defaults to all documents **/
    vm.isPaid = null;
    /** Report filters **/
    vm.filters;
    vm.isPaidOpen = false;
    vm.isUnpaidOpen = false;
    vm.isTotalOpen = true;

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.selectedFilter = null;

    vm.toggleTotal = toggleTotal;
    vm.togglePaid = togglePaid;
    vm.toggleUnpaid = toggleUnpaid;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.filters = [
            {
                title : "All",
                value : null
            },
            {
                title : "Paid",
                value : true
            },
            {
                title : "Unpaid",
                value : false
            }
        ]
    }

    function onFilterClicked(filter) {
        var deferred = $q.defer();
        //TODO call for reports and associated doc

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
    //endregion

}