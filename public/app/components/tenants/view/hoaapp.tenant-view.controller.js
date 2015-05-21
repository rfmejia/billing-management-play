angular
    .module('app.tenants')
    .controller('tenantViewCtrl', tenantViewCtrl);

function tenantViewCtrl($state, $stateParams, tenantsSrvc, dialogProvider, toastProvider, userDetails, tenantDocs, tenant, queryHelper) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = tenantDocs._embedded.item;
    vm.isInfoOpen = true;

    vm.pageTitle = $state.current.data.title;
    vm.currentFilter = {};

    vm.isAdmin = false;

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
        vm.total = tenantDocs.total;
        vm.pageSize = $stateParams.limit;
        vm.currentPage = ($stateParams.offset / $stateParams.limit) + 1;

        //Filter setup
        resolveFilter();

        angular.forEach(userDetails.roles, function(role) {
            if(role.id === "admin") {
                vm.isAdmin = true;
            }
        });
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
        var queryParameters = queryHelper.getTenantDocs(offset, $stateParams.id, vm.currentFilter.id);
        $state.go($state.current, queryParameters, {reload : true});
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
    "userDetails",
    //UTILS
    //RESOLVE
    "tenantDocs",
    "viewTenantModel",
    "queryParams"
];