var tenantInvite = angular.module("controller.tenantcreate", []);

tenantInvite.controller("controller.tenantcreate", ["$scope", "$modalInstance", "r_createTemplate", 
	function($scope, $modalInstance, r_createTemplate){

		$scope.controlData = [];
		$scope.editedData = {};
		$scope.controlData = r_createTemplate;

		$scope.resetData = function() {
			angular.forEach($scope.controlData, function(data){
				$scope.editedData[data.name] = data.value;
			});
			console.log($scope.controlData);
		}

		$scope.onCancelClicked = function() {
			$modalInstance.dismiss("cancel");
		};

		$scope.onCreateClicked = function() {
			var newTenant = {};
			console.log($scope.editedData);
			$modalInstance.close($scope.editedData);
		};

		$scope.resetData();

	}]);