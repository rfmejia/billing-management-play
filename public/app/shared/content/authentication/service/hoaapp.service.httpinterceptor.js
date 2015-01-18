var interceptor = angular.module("hoaApp");

interceptor.factory("httpInterceptor", 
	function($q, $window, $location) {
		return function(promise) {
			var success = function(response) {
				return response;
			};

			var error = function(response) {
				if(response.status = 401) {
					$window.location.assign("/login");
				}
				return $q.reject(response);
			};

			return promise.then(success, error);
		}
	});