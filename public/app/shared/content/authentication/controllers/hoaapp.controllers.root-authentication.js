var authentication = angular.module("controller.root", []);

authentication.controller("controller.root", ["$scope", "$location", "$state", "$q", "$window", "$cookies", "service.hoalinks", "tokenHandler",
	function($scope, $location, $state, $q, $window, $cookies, hoalinks, tokenHandler) {

		var success = function(data) {
			console.log($cookies.id);
			tokenHandler.set($cookies.id);
			$state.go("workspace");
		}

		var error = function() {
			
		}
		hoalinks.getResource()
			.get()
			.$promise
			.then(success, error);
	}]);