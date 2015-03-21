angular
    .module("app.tenants")
    .controller("controller.tenantcreate", [
                    "tenantsService",
                    "tenantHelper",
                    "tenantModel",
                    "service.hoatoasts",
                    "$state",
                    "$stateParams",
                    tenantCreateCtrl
                ]);

function tenantCreateCtrl(tenantsService, tenantHelper, tenantModel, toastSrvc, $state, $stateParams) {
    var vm = this;
    vm.tenantTemplate = tenantModel.viewModel;
    vm.pageTitle = $state.current.data.title;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.des = "";

    //region FUNCTION_CALL
    function onCreateTenantClicked() {
        var postData = tenantHelper.formatPostData(tenantModel);
        if($stateParams.id == null) {
            tenantsService.createTenant(postData)
                .then(success, error);
        }
        else {
            tenantsService.editTenant($stateParams.id, postData)
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