var tenant = angular.module("controller.tenantedit", []);

tenant.controller("controller.tenantedit", ["$scope", "$state", "r_tenant", "service.hoatenants", 
	function($scope, $state, r_tenant, hoatenants){
		var tenantData = r_tenant._template.edit.data;
        $scope.controlData = [];
        $scope.editedData = {};
        $scope.title = {};

        $scope.resetData = function() {
            while($scope.controlData.length > 0) {
                $scope.controlData.pop();
            }
            for(var i = 0; i < tenantData[0].length; i++) {
                var pushData = {
                    "name"         : tenantData[0][i].name,
                    "prompt"       : tenantData[0][i].prompt,
                    "value"        : r_tenant[tenantData[0][i].name],
                    "isRequired"   : tenantData[0][i].required
                };
                $scope.editedData[pushData.name] = pushData.value;

                if(tenantData[0][i].name == "tradeName") {
                    $scope.title = pushData;
                }
                else $scope.controlData.push(pushData);
            }
        }

        $scope.onCancelClicked = function() {
            $state.go("workspace.tenants.tenantView", {"id" : r_tenant.id});
        }

        $scope.onSubmitClicked = function(newData) {
            $scope.editedData = angular.copy(newData);
            TenantsService.editTenant(r_tenant.id, $scope.editedData);
        }

        $scope.resetData();
	}]);