var tenants = angular.module("app.tenants");

angular
    .module("app.tenants")
    .controller("tenantsListController", tenantCtrl);

function tenantCtrl($state, tenantList) {
    var vm = this;
    vm.tenantList = tenantList;
    vm.onTenantClicked = onTenantClicked;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.pageTitle = $state.current.data.title;
    vm.profile = tenantList._links.profile.href;
    vm.tenants = tenantList._embedded.item;

    function onTenantClicked(tenant) {
        $state.go("workspace.tenant-view", {"id" : tenant.id, limit: 10, offset: 0});
    }

    function onCreateTenantClicked() {
        $state.go("workspace.tenant-create")
    }
}
tenantCtrl.$inject = ["$state", "tenantsList"];
