var interceptor = angular.module('module.authentication');

interceptor.factory("httpInterceptor", 
	function($q, $window, $location) {
        return {
            request: function (config) {
                return config || $q.when(config);
            },
            requestError: function(request){
                return $q.reject(request);
            },
            response: function (response) {
                return response || $q.when(response);
            },
            responseError: function (response) {
                if (response && response.status === 401) {
                    $window.location.assign("/login");
                }
                if (response && response.status === 404) {
                }
                if (response && response.status >= 500) {
                }
                return $q.reject(response);
            }
        };
	});