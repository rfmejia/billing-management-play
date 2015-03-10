var token = angular.module('module.authentication');

token.factory("tokenHandler", 
	function(){
		var tokenHandler = {};
		var token = "none";

		//wraps resource action to send request with auth token
		var tokenWrapper = function(resource, action) {
			resource['_' + action]  = resource[action];
			//create new action wrapping the original + sending token
			resource[action] = function(data, success, error) {
				return resource['_' + action](
				       // call action with provided data and
				       // appended access_token
				       angular.extend({}, data || {},
				         {"X-Auth-Token": tokenHandler.get()}),
				       success,
				       error
				);
			}
		};;

		tokenHandler.set = function(newToken) {
			token = newToken;
		};

		tokenHandler.get = function() {
			return token;
		};

		tokenHandler.wrapActions = function (resource, actions) {
			//copy of resource
			var wrappedResource = resource;

			//loop through actions and wrap them
			for(var i = 0; i < actions.length; i++) {
				tokenWrapper(wrappedResource, actions[i]);
			} 

			//return modified resource
			return wrappedResource;
		};;

		return tokenHandler;
	});