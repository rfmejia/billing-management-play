var create = angular.module("controller.create", []);

create.controller("controller.create", ["$scope", "$state", "r_documentsService", "r_mailboxData",
	function($scope, $state, r_documentsService, r_mailboxData){
		$scope.tenants = r_mailboxData.tenants;
		$scope.templates = r_mailboxData.templates;
		
		
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
			console.log(tenant);
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