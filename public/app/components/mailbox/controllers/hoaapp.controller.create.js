var create = angular.module("module.mailbox");

create.controller("controller.create", ["$scope", "$state", "documentsService", "createBundle",
	function($scope, $state, documentsService, createBundle){
		$scope.tenants = createBundle.tenantsBundle.tenants;
		$scope.templates = createBundle.templates;
		
		
		$scope.setData = function() {
			$scope.summary = [];
			angular.forEach($scope.templates.breakdown, function(value, key){
				var editedSummary = value.summary;
				editedSummary.title = value.title + " total";

				$scope.summary.push(editedSummary);
			});
		}
		$scope.setData();

		$scope.dateOptions = {
    		formatYear: 'yy',
    		startingDay: 1,
    		minMode: 'month'
  		};



		$scope.onSelect = function(tenant){
		};

		$scope.today = function() {
			$scope.billDate = new Date();
		};
		$scope.today();

		$scope.toggleMin = function() {
		  $scope.minDate = $scope.minDate ? null : new Date();
		};
		$scope.toggleMin();

		$scope.clear = function() {
			$scope.billDate = null;
		};

		$scope.open = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.opened = true;
		};

		$scope.format = "MMMM-yyyy";
	}]);