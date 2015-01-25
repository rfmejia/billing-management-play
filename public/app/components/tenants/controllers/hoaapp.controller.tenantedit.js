var tenant = angular.module("module.tenants");

tenant.controller("controller.tenantedit", ["$scope", "$state", "tenant", "tenantsService",
	function($scope, $state, tenant, tenantsService){
        $scope.tenant = angular.copy(tenant.details);
        $scope.editedData = angular.copy(tenant.postTemplate);
        $scope.tenantName = {};

        $scope.resetData = function() {
            $scope.tenant = angular.copy(tenant.details);
            $scope.editedData = angular.copy(tenant.postTemplate);

            angular.forEach($scope.tenant,
                function(detail){
                    if(detail.name == "tradeName") $scope.tradeName = detail;
                    $scope.editedData[detail.name] = detail.value;
                }
            );
        };

        $scope.onCancelClicked = function() {
            $state.go("workspace.tenants.tenantView", {"id" : tenant.id});
        }

        $scope.onSubmitClicked = function() {
            tenantsService.editTenant(tenant.id, $scope.editedData).then(
                function() {
                    $state.go("workspace.tenants.tenantView", {"id" : tenant.id}, {reload : true});
                }
            );

        }

        $scope.onDeleteClicked = function() {
            tenantsService.deleteTenant(tenant.id).then(
                function() {
                    $state.go("workspace.tenants", {}, {reload : true});
                }
            )
        }

        $scope.resetData();
	}]);