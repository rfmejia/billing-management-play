var tenants = angular.module("app.tenants");

angular
    .module("app.tenants")
    .controller("tenantsListController", tenantCtrl);

function tenantCtrl($state, $stateParams, tenantList, queryHelper) {
    var vm = this;
    vm.tenantList = tenantList;
    vm.onTenantClicked = onTenantClicked;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.pageTitle = $state.current.data.title;
    vm.profile = tenantList._links.profile.href;
    vm.tenants = tenantList._embedded.item;

    //Pagination
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.total;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    function activate() {
        vm.currentPage = $stateParams.offset % 10;
        vm.pageSize = 10;
        vm.total = tenantList.total;

        vm.currentListShown = vm.tenants.slice(0, vm.pageSize)
    }

    function onTenantClicked(tenant) {
        var params = queryHelper.getTenantDocs(0, tenant.id, "all");
        $state.go("workspace.tenant-view", params, {reload : true});
    }

    function onCreateTenantClicked() {
        $state.go("workspace.tenant-create")
    }

    function onChangePageClicked(page) {
        var offset = 0;
        if(page !== null) {
            var newPage = page - 1;
            offset = newPage * vm.pageSize;
        }
        vm.currentListShown = [];

        vm.currentListShown = vm.tenants.slice(offset, offset + vm.pageSize);
    }
}
tenantCtrl.$inject = ["$state", "$stateParams", "tenantsList", "queryParams"];
