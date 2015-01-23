var tenantInvite = angular.module("module.tenants");

tenantInvite.controller("controller.tenantcreate", ["$scope", "$modalInstance", "r_tenants", "r_createTemplate", 
	function($scope, $modalInstance, tenantsSrvc, r_createTemplate){

		$scope.controlData = [];
		$scope.editedData = {};
		$scope.controlData = r_createTemplate;

		$scope.resetData = function() {
			angular.forEach($scope.controlData, function(data){
				$scope.editedData[data.name] = data.value;
			});
		}

		$scope.onCancelClicked = function() {
			$modalInstance.dismiss("cancel");
		};

		$scope.onCreateClicked = function() {
			console.log($scope.editedData);
			tenantsSrvc.createTenant($scope.editedData);

			$modalInstance.close($scope.editedData);
		};

		$scope.resetData();

	}]);