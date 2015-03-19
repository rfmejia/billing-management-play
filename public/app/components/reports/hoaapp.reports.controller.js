/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .controller("reportsCtrl", controller);

controller.$inject = ["documentsHelper", "documentsService", "documentsList", "reportResponse", "$state", "REPORTS_ROUTES", "nvl-dateutils", "$stateParams", 'service.hoadialog', 'service.hoacurrentuser'];
function controller(docsHelper, docsSrvc, documents, reportResponse, $state, reportsRoutes, dateUtils, $stateParams, dialogProvider, userDetails) {
    var vm = this;
    vm.pageTitle = $state.current.data.title;
    vm.documents = documents._embedded.item;
    vm.isPaid = null;
    vm.selectedFilter = null;
    vm.report = reportResponse;
    vm.pageSize = $stateParams.limit;
    vm.count = 10;
    vm.total = documents.count;
    vm.currentPage = 1;
    vm.currentParams = {};

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
            isActive : true,
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
            isActive : true,
            params   : {
                mailbox : "delivered",
                isPaid  : false,
                year    : vm.report.date.year,
                month   : vm.report.date.month,
                offset  : 0,
                limit   : vm.pageSize
            }
        };
        vm.currentParams = vm.allFilter.params;
    }

    function onFilterClicked(filter) {
        vm.currentParams = filter.params;
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
        }
    }

    function onDocumentItemClicked(item) {
        $state.go(docsHelper.resolveViewer(item), {id : item.id});
    }

    function onUpdateItemClicked(item) {
        var title = "Sorry";
        var message = "This document is being edited by another user.";
        if(item._links.hasOwnProperty("hoa:assign")) {
            docsSrvc.assignDocument(item._links["hoa:assign"].href).then(viewDocument, error);
        }
        else if(uesrDetails.userId == item.assigned.userId) {
            viewDocument();
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