var tenantInvite = angular.module("module.tenants");

tenantInvite.controller("controller.tenantcreate", ["$scope", "$modalInstance", "tenantsService", "tenantCreateTemplate",
	function($scope, $modalInstance, tenantsService, template){
		$scope.controlData = [];
		var editedData = angular.copy(template.postTemplate);
		$scope.controlData = template.details;

		$scope.onCancelClicked = function() {
			$modalInstance.dismiss("cancel");
		};

		$scope.onCreateClicked = function() {
            angular.forEach($scope.controlData, function(field) {
                editedData[field.name] = field.value;
            });

            console.log(editedData);

			tenantsService.createTenant(editedData);

			$modalInstance.close(editedData);
		};

	}]);