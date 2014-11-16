'use strict';

var hoaApp = angular.module("BillingManagementApp", [
    "ngRoute", "ngResource", "ngSanitize"
]);
hoaApp.value("entryPoint", URI(window.location.protocol + "//" + window.location.host + "/api"));
hoaApp.value("token", "dGVzdHVzZXIxOnRlc3RwYXNzMQ==")

// ---- Configuration ---- //

// ---- Services ---- //

// ---- Controllers ---- //

hoaApp.controller("TenantController", ["$scope", "$http", "entryPoint",
	function($scope, $http, entryPoint) {
		$http.get(entryPoint + "/tenants").success(function(data) {
			$scope.tenantList = data._embedded.item;
		});

		console.log();

		$scope.selectedTenant = null;
		$scope.setSelectedTenant = function(tenant) {
            if(tenant != null && tenant != "") {
                $http.get(tenant._links.self.href).success(function(data) {
                    $scope.selectedTenant = data;
                });
			}
		}

		$scope.newTenant = null;
		$scope.addNewTenant = function() {
			if($scope.newTenant != null && $scope.newTenant != "") {
				// Send PUT request to API
			}
		}
	}]
);
