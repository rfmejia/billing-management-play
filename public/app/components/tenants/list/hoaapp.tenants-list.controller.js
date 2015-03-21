var tenants = angular.module("app.tenants");

angular
    .module("app.tenants")
    .controller("controller.tenantslist", [
                    "$state",
                    "apiResponse",
                    tenantCtrl
                ]);

function tenantCtrl($state, apiResponse) {
    var vm = this;
    vm.apiResponse = apiResponse;
    vm.onTenantClicked = onTenantClicked;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.pageTitle = $state.current.data.title;
    vm.profile = apiResponse._links.profile.href;
    vm.tenants = apiResponse._embedded.item;

    function onTenantClicked(tenant) {
        $state.go("workspace.tenant-view", {"id" : tenant.id, limit: 10, offset: 0});
    }

    function onCreateTenantClicked() {
        $state.go("workspace.tenant-create")
    }
}
