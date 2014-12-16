var tenants = angular.module("controller.tenants", []);

tenants.controller("controller.tenantsList", ["$scope", "$state", "service.hoatenants", "r_tenantTop", 
    function($scope, $state, hoatenants){
        $scope.tenants = r_tenantTop._embedded.item;

        $scope.onTenantClick = function(tenant) {
            var selectedTenant = hoatenants.getTenant(tenant.id);
            $state.go("workspace.tenants.tenantView", {"id" : selectedTenant.id});
        }
    }]);