angular
    .module("app.tenants")
    .controller("tenantCreateController", tenantCreateCtrl);

function tenantCreateCtrl($state, $stateParams, tenantsSrvc, toastSrvc, tenantHelper, tenantModel) {
    var vm = this;
    vm.tenantTemplate = tenantModel.viewModel;
    vm.pageTitle = $state.current.data.title;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.des = "";

    //region FUNCTION_CALL
    function onCreateTenantClicked() {
        var postData = tenantHelper.formatPostData(tenantModel);
        if($stateParams.id == null) {
            tenantsSrvc.createTenant(postData)
                .then(success, error);
        }
        else {
            tenantsSrvc.editTenant($stateParams.id, postData)
                .then(success, error);
        }
    }

    function success(response) {
        toastSrvc.showSimpleToast("Tenant entry saved");
        $state.go("workspace.tenants-list", {}, {reload : true});
    }

    function error(response) {
        toastSrvc.showSimpleToast("Sorry, tenant wasn't saved");
    }

    //endregion
}
tenantCreateCtrl.$inject = [
    "$state",
    "$stateParams",
    //API
    "tenantsApi",
    //SERVICES
    "hoaToastService",
    "tenantHelper",
    //UTILS
    //RESOLVE
    "createTenantModel"
];