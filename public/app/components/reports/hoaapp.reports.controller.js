/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("app.reports")
    .controller("reportsController", controller);


function controller($state, $stateParams, docsSrvc, docsHelper, reportsRoutes, dialogProvider, dateUtils, documentsList, reportResponse, userDetails) {
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
    var filters = [];

    //function mapping
    vm.onFilterClicked = onFilterClicked;
    vm.onReportMonthSelected = onReportMonthSelected;
    vm.onDocumentItemClicked = onDocumentItemClicked;
    vm.onUpdateItemClicked = onUpdateItemClicked;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.allFilter = {
            title    : "All",
            isActive : true,
            params   : {
                mailbox : "delivered",
                year    : vm.report.date.year,
                month   : vm.report.date.month,
                offset  : 0,
                limit   : vm.pageSize
            }
        };
        vm.paidFilter = {
            title    : "Paid",
            isActive : false,
            params   : {
                mailbox : "delivered",
                isPaid  : true,
                year    : vm.report.date.year,
                month   : vm.report.date.month,
                offset  : 0,
                limit   : vm.pageSize
            }
        };
        vm.unpaidFilter = {
            title    : "Unpaid",
            isActive : false,
            params   : {
                mailbox : "delivered",
                isPaid  : false,
                year    : vm.report.date.year,
                month   : vm.report.date.month,
                offset  : 0,
                limit   : vm.pageSize
            }
        };
        filters = [vm.allFilter, vm.paidFilter, vm.unpaidFilter];
        vm.currentParams = vm.allFilter.params;
    }

    function onFilterClicked(filter) {
        vm.currentParams = filter.params;
        angular.forEach(filters, function(value) {
            value.isActive = (value.title === filter.title);
        });

        refreshDocuments(vm.currentParams);
    }

    function onReportMonthSelected(newDate, oldDate) {
        var year = dateUtils.getLocalYear(newDate);
        var month = dateUtils.getLocalMonth(newDate);
        var params = {mailbox : "delivered", year : year, month : month};
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

    function onDocumentItemClicked(item) {
        $state.go(docsHelper.resolveViewer(item), {id : item.id});
    }

    function onUpdateItemClicked(item) {
        var title = "Sorry";
        var message = "This document is being edited by another user.";
        if(item.assigned == null) {
            docsSrvc.assignDocument(item._links["hoa:assign"].href).then(viewDocument, error);
        }
        else if(userDetails.userId == item.assigned.userId) {
            viewDocument();
        }
        else if(item._links.hasOwnProperty("hoa:assign")) {

            docsSrvc.assignDocument(item._links["hoa:assign"].href).then(viewDocument, error);
        }
        else {
            error();
        }

        function viewDocument() {
            $state.go(reportsRoutes.reportUpdate, {id : item.id});
        }

        function error(reason) {

            dialogProvider.getInformDialog(null,  title, message, "Okay");
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
    'userDetails'
];