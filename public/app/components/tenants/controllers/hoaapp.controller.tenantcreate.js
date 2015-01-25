var tenantInvite = angular.module("module.tenants");

tenantInvite.controller("controller.tenantcreate", ["$scope", "$modalInstance", "tenantsService", "tenantCreateTemplate",
	function($scope, $modalInstance, tenantsService, template){

        console.log(template);
		$scope.controlData = [];
		$scope.editedData = angular.copy(template.postTemplate);
		$scope.controlData = template.details;

		$scope.resetData = function() {
			angular.forEach(Object.keys($scope.editedData), function(value){
				$scope.editedData[value] = "";
			});
		}

		$scope.onCancelClicked = function() {
			$modalInstance.dismiss("cancel");
		};

		$scope.onCreateClicked = function() {
			console.log($scope.editedData);
			tenantsService.createTenant($scope.editedData);

			$modalInstance.close($scope.editedData);
		};

		$scope.resetData();

	}]);