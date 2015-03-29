/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("app.reports")
    .controller("reportsController", controller);

function controller($state, $stateParams, dateUtils, documentsList, reportResponse, queryHelper) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    vm.documents = documentsList._embedded.item;
    vm.report = reportResponse;

    //Filters
    vm.currentParams = {};
    vm.filters = [];

    //Pagination
    //Pagination
    vm.currentPage = 1;
    vm.pageSize;
    vm.total;

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.onReportMonthSelected = onReportMonthSelected;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        //Filter setup
        vm.filters = queryHelper.getReportsFilters();
        vm.currentFilter = queryHelper.getReportsFiltersById($stateParams.filterId);

        angular.forEach(vm.filters, function(filter) {
            filter.isActive = (filter.id === vm.currentFilter.id);
        });

        //Pagination setup
        vm.currentPage = $stateParams.offset % $stateParams.limit;
        vm.total = 500; //TODO: Pagination activate once total is set
        vm.pageSize = $stateParams.limit;
    }

    function onFilterClicked(filter) {
        var dateString = dateUtils.getMomentFromString($stateParams.month, $stateParams.year);
        var params = queryHelper.getReportsParams(0, dateString, filter.id);
        $state.go($state.current, params, {reload : true});
    }

    function onReportMonthSelected(newDate, oldDate) {
        var dateString = dateUtils.dateToStringDisplay(newDate, null);
        var params = queryHelper.getReportsParams(0, dateString, "all");
        $state.go($state.current, params, {reload : true});
    }


    function onChangePageClicked(page) {
        var offset = 0;
        if(page !== null) {
            var newPage = page - 1;
            offset = newPage * vm.pageSize;
        }
        console.log(offset);
        var dateString = dateUtils.getMomentFromString($stateParams.month, $stateParams.year);
        var queryParameters = queryHelper.getReportsParams(offset, dateString, vm.currentFilter.id);
        //TODO: Pagination activate once total is set
        //$state.go($state.current, queryParameters, {reload : true});
    }

    //endregion

}
controller.$inject = [
    "$state",
    "$stateParams",
    //API
    //SERVICES
    //UTILS
    "nvl-dateutils",
    //RESOLVE
    "documentsList",
    "reportResponse",
    "queryParams"
];