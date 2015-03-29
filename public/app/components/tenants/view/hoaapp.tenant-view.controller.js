angular
    .module('app.tenants')
    .controller('tenantViewCtrl', tenantViewCtrl);

function tenantViewCtrl($state, $stateParams, documentsSrvc, tenantsSrvc, docsHelper, dialogProvider, toastProvider, reportsRoutes, tenantDocs, tenant, userDetails, queryHelper) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = tenantDocs._embedded.item;
    vm.isInfoOpen = true;
    vm.tradeNameColor = {color : "#689F38"};
    vm.pageTitle = $state.current.data.title;
    vm.currentFilter = {};
    vm.currentPage = 1;
    vm.pageSize = tenantDocs.limit;
    //TODO: CHANGE TO TOTAL
    vm.total = tenantDocs.total;

    vm.onEditClicked = onEditClicked;
    vm.onFilterClicked = onFilterClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        resolveFilter();
    }

    function resolveFilter() {
        vm.filters = queryHelper.getTenantsDocsFilters();
        vm.currentFilter = queryHelper.getTenantsDocsFilterById($stateParams.filterId);

        angular.forEach(vm.filters, function(filter) {
            filter.isActive = (filter.id === vm.currentFilter.id);
        })
    }

    function onEditClicked() {
        $state.go("workspace.tenant-view.edit");
    }

    function onDeleteClicked() {
        var message = "Delete this tenant permanently?";
        var title = "Warning";

        function success(response) {
            $state.go("workspace.tenants-list", {}, {reload : true});
            toastProvider.showSimpleToast("Deleted successful")
        }

        function error() {
            toastProvider.showSimpleToast("An error occurred while deleting");
        }

        function okayFn() {
            tenantsSrvc.deleteTenant($stateParams.id).then(success, error);
        }

        function cancelFn() {}

        dialogProvider.getConfirmDialog(okayFn, cancelFn, message, title);
    }

    function onFilterClicked(filter) {
        var params = queryHelper.getTenantDocs(0, $stateParams.id, filter.id);
        $state.go($state.current, params, {reload: true});
    }

    function onChangePageClicked(page) {
        page -= 1;
        var offset = (page == null) ? 0 : (page * vm.pageSize);
        var changedParams = vm.currentFilter.params;
        if (changedParams.hasOwnProperty("offset")) {
            changedParams.offset = offset;
        }
        vm.documents = [];
        vm.currentPage = page + 1;
        documentsSrvc.getDocumentList(changedParams).then(success);

    }

    function success(response) {
        vm.documents = response._embedded.item;
        vm.total = response.total;
    }

    //endregion
}

tenantViewCtrl.$inject = [
    "$state",
    "$stateParams",
    //API
    "documentsApi",
    "tenantsApi",
    //SERVICES
    "documentsHelper",
    "hoaDialogService",
    "hoaToastService",
    "REPORTS_ROUTES",
    //UTILS
    //RESOLVE
    "tenantDocs",
    "viewTenantModel",
    "userDetails",
    "queryParams"
];