angular
    .module('app.tenants')
    .controller('tenantViewCtrl', tenantViewCtrl);

function tenantViewCtrl($state, $stateParams, tenantsSrvc, dialogProvider, toastProvider, tenantDocs, tenant, queryHelper) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = tenantDocs._embedded.item;
    vm.isInfoOpen = true;

    vm.pageTitle = $state.current.data.title;
    vm.currentFilter = {};

    //Pagination
    vm.currentPage = 1;
    vm.pageSize;
    vm.total;

    vm.onEditClicked = onEditClicked;
    vm.onFilterClicked = onFilterClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        //Pagination setup
        vm.currentPage = $stateParams.offset % $stateParams.limit;
        vm.total = 500; //TODO: Pagination activate once total is set
        vm.pageSize = $stateParams.limit;

        //Filter setup
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
        var offset = 0;
        if(page !== null) {
            var newPage = page - 1;
            offset = newPage * vm.pageSize;
        }
        var queryParameters = queryHelper.getTenantDocs(offset, $stateParams.id, vm.currentFilter);
        //TODO: Pagination activate once total is set
        //$state.go($state.current, queryParameters, {reload : true});
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
    "tenantsApi",
    //SERVICES
    "hoaDialogService",
    "hoaToastService",
    //UTILS
    //RESOLVE
    "tenantDocs",
    "viewTenantModel",
    "queryParams"
];