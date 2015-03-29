var tenants = angular.module("app.tenants");

angular
    .module("app.tenants")
    .controller("tenantsListController", tenantCtrl);

function tenantCtrl($state, tenantList, queryHelper) {
    var vm = this;
    vm.tenantList = tenantList;
    vm.onTenantClicked = onTenantClicked;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.pageTitle = $state.current.data.title;
    vm.profile = tenantList._links.profile.href;
    vm.tenants = tenantList._embedded.item;

    function onTenantClicked(tenant) {
        var params = queryHelper.getTenantDocs(0, tenant.id, "all");
        $state.go("workspace.tenant-view", params, {reload : true});
    }

    function onCreateTenantClicked() {
        $state.go("workspace.tenant-create")
    }
}
tenantCtrl.$inject = ["$state", "tenantsList", "queryParams"];
