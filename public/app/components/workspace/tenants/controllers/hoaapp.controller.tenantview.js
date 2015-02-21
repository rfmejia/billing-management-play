var tenants = angular.module("module.tenants");

tenants.controller("controller.tenantview", ["$scope", "$state", "tenant",
	function($scope, $state, tenant){
        $scope.tenant = tenant.details;
        $scope.isInfoOpen = true;

        angular.forEach($scope.tenant,
            function(value){
                if(value.name == "tradeName") $scope.tradeName = value.value;
            }
        );

        //Temporary values
        $scope.billings = [
        {isPaid : true, isActive : false, date : "March 2014"},
        {isPaid : true, isActive : false, date : "February 2014"},
        {isPaid : false, isActive : false, date : "January 2014"}
        ];

        $scope.toggleInfo = function() {
             $scope.isInfoOpen = !$scope.isInfoOpen;
        };;

        $scope.onEditClicked = function() {
             $state.go("workspace.management.tenants.tenant-view.edit");
        };;

        $scope.onBackClicked = function() {
             $state.go("workspace.management.tenants");
        }
	}]);