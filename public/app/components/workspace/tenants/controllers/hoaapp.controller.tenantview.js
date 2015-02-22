angular
    .module('module.tenants')
    .controller('tenantViewCtrl',[
        '$state',
        'tenant',
        tenantViewCtrl
    ]);

function tenantViewCtrl($state, tenant){
    var vm = this;
    vm.tenant = tenant.details;
    vm.isInfoOpen = true;
    vm.toggleInfo = toggleInfo;
    vm.onEditClicked = onEditClicked;
    vm.onBackClicked = onBackClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        angular.forEach(vm.tenant,
            function(value){
                if(value.name == "tradeName") vm.tradeName = value.value;
            }
        );
    }

    function toggleInfo() {
        vm.isInfoOpen = !vm.isInfoOpen;
    }

    function onEditClicked() {
        $state.go("workspace.management.tenants.tenant-view.edit");
    }

    function onBackClicked() {
        $state.go("workspace.management.tenants");
    }
    //endregion
}