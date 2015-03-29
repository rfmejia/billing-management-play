/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("app.reports")
    .controller("reportsController", controller);

function controller($state, $stateParams, docsSrvc, docsHelper, reportsRoutes, dialogProvider, dateUtils, documentsList, reportResponse, userDetails, queryHelper) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    vm.documents = documentsList._embedded.item;
    vm.isPaid = null;
    vm.selectedFilter = null;
    vm.report = reportResponse;
    vm.pageSize = $stateParams.limit;
    vm.count = 10;
    vm.total = documentsList.count;
    vm.currentPage = 1;
    vm.currentParams = {};
    vm.filters = [];

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.onReportMonthSelected = onReportMonthSelected;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.filters = queryHelper.getReportsFilters();
        vm.currentFilter = queryHelper.getReportsFiltersById($stateParams.filterId);

        angular.forEach(vm.filters, function(filter) {
            filter.isActive = (filter.id === vm.currentFilter.id);
        })
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

    function refreshDocuments(params) {
        vm.documents = [];
        docsSrvc.getDocumentList(params)
            .then(success);
        function success(response) {
            vm.documents = response._embedded.item;
            vm.total = response.count;
        }
    }

    function onChangePageClicked(page) {
        page -= 1;
        var offset = (page == null) ? 0 : vm.pageSize * page;
        if (vm.currentParams.hasOwnProperty("offset")) {
            vm.currentParams.offset = offset;
        }
        vm.currentPage = page + 1;
        refreshDocuments(vm.currentParams);
    }

    //endregion

}
controller.$inject = [
    "$state",
    "$stateParams",
    //API
    "documentsApi",
    //SERVICES
    "documentsHelper",
    "REPORTS_ROUTES",
    'hoaDialogService',
    //UTILS
    "nvl-dateutils",
    //RESOLVE
    "documentsList",
    "reportResponse",
    'userDetails',
    "queryParams"
];