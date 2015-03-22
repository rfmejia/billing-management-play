angular
    .module("app.tenants")
    .controller("tenantEditController", tenantEditCtrl);

function tenantEditCtrl($state, $stateParams, tenantsSrvc, toastSrvc, tenantHelper, tenantModel) {
    var vm = this;
    vm.tenantTemplate = tenantModel.viewModel;
    vm.pageTitle = $state.current.data.title;
    vm.onEditTenantClicked = onEditTenantClicked;
    vm.des = "";

    //region FUNCTION_CALL
    function onEditTenantClicked() {
        var postData = tenantHelper.formatPostData(tenantModel);
        console.log(postData);
        tenantsSrvc.editTenant($stateParams.id, postData)
            .then(success, error);
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
tenantEditCtrl.$inject = [
    "$state",
    "$stateParams",
    //API
    "tenantsApi",
    //SERVICES
    "hoaToastService",
    "tenantHelper",
    //UTILS
    //RESOLVE
    "editTenantModel"
];