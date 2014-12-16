var tenants = angular.module("controller.tenantview", []);

tenants.controller("controller.tenantview", ["$scope", "$state", "r_tenant", 
	function($scope, $state, r_tenant){
		$scope.selectedTenant = r_tenant;
        $scope.values = [];
        $scope.isInfoOpen = true;
        var data = $scope.selectedTenant._template.edit.data;

        //Temporary values
        $scope.billings = [
        {isPaid : true, isActive : false, date : "March 2014"},
        {isPaid : true, isActive : false, date : "February 2014"},
        {isPaid : false, isActive : false, date : "January 2014"}
        ];

        for(var i = 0; i < data[0].length; i++) {
             $scope.values.push({"prompt" : data[0][i].prompt, "entry": $scope.selectedTenant[data[0][i].name]});
        }   
        $scope.toggleInfo = function() {
             $scope.isInfoOpen = !$scope.isInfoOpen;
        }

        $scope.onEditClicked = function() {
            console.log("edit controller");
             $state.go("workspace.tenants.tenantView.edit");
        }

        $scope.onBackClicked = function() {
             $state.go("workspace.tenants");
        }
	}]);