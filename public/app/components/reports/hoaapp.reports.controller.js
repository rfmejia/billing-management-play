/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .controller("reportsCtrl", controller);

controller.$inject = ["documentsHelper", "documentsService", "documentsList", "reportResponse", "$state", "$q", "moment", "REPORTS_ROUTES", "nvl-dateutils"];
function controller(docsHelper, docsSrvc, documents, reportResponse, $state, $q, moment, reportsRoutes, dateUtils) {
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
    vm.onUpdateItemClicked = onUpdateItemClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.allFilter = {
            title  : "All",
            params : {
                mailbox : "delivered",
                year    : vm.report.date.year,
                month   : vm.report.date.month
            }
        };
        vm.paidFilter = {
            title : "Paid", params : {
                mailbox : "delivered",
                isPaid  : true,
                year    : vm.report.date.year,
                month   : vm.report.date.month
            }
        };
        vm.unpaidFilter = {
            title : "Unpaid", params : {
                mailbox : "delivered",
                isPaid : false,
                year    : vm.report.date.year,
                month   : vm.report.date.month
            }
        };
    }

    function onFilterClicked(params) {
        refresDocuments(params);
    }

    function onReportMonthSelected(newDate, oldDate) {
        var year = dateUtils.getLocalYear(newDate);
        var month = dateUtils.getLocalMonth(newDate);
        var params = {mailbox : "delivered", year : year, month : month}
        $state.go($state.current, params, {reload : true});
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
        if(item.assigned == null) {
            docsSrvc.assignDocument(item._links["hoa:assign"].href)
                .then(success, error);
        }

        else success();

        function success() {
            $state.go(docsHelper.resolveViewer(item), {id : item.id});
        }

        function error() {}

    }

    function onUpdateItemClicked(item) {
        if(item.assigned == null) {
            docsSrvc.assignDocument(item._links["hoa:assign"].href)
                .then(success, error);
        }

        else success();

        function success() {
            $state.go(reportsRoutes.reportUpdate, {id : item.id});
        }

        function error() {}
    }

    //endregion

}