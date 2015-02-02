var tenant = angular.module("module.tenants");

tenant.controller("controller.tenantedit", ["$scope", "$state", "tenant", "tenantsService",
	function($scope, $state, tenant, tenantsService){
        $scope.tenant = angular.copy(tenant.details);
        $scope.editedData = angular.copy(tenant.postTemplate);
        $scope.tenantName = {};
        console.log($scope.tenant);

        $scope.resetData = function() {
            $scope.tenant = angular.copy(tenant.details);
            $scope.editedData = angular.copy(tenant.postTemplate);

            angular.forEach($scope.tenant,
                function(detail){
                    $scope.editedData[detail.name] = detail.value;
                }
            );
            //put tradename first
            for(var i = 0; i < $scope.tenant.length; i++) {
                if($scope.tenant[i].name == "tradeName") {
                    var temp = $scope.tenant[i];
                    $scope.tenant.splice(i, 1);
                    $scope.tenant.splice(0, 0, temp);
                }
            }
        };

        console.log($scope.editedData);

        $scope.onCancelClicked = function() {
            $state.go("workspace.tenants.tenantView", {"id" : tenant.id});
        };;

        $scope.onSubmitClicked = function() {
            tenantsService.editTenant(tenant.id, $scope.editedData).then(
                function() {
                    $state.go("workspace.tenants.tenantView", {"id" : tenant.id}, {reload : true});
                }
            );

        };;

        $scope.onDeleteClicked = function() {
            tenantsService.deleteTenant(tenant.id).then(
                function() {
                    $state.go("workspace.tenants", {}, {reload : true});
                }
            )
        };;

        $scope.resetData();
	}]);