var mailbox = angular.module("hoaApp");

mailbox.service("service.hoamailbox", ["$resource", "$q", "service.hoalinks",
	function($resource, $q, hoalinks){
		var resource = null;

		var createResource = function(url) {
			resource = $resource(url);
		};

		var makeRequest = function() {
			var deferred = $q.defer();
			
			var success  = function(response) {
				return deferred.resolve(response);
			};

			var parse 	 = function(response) {
				return response.mailbox;
			};

			var query 	 = function() {
				resource.get().$promise
                    .then(parse)
				    .then(success);

			};

			if(resource != null) query();
			else {
				var init = function(response) {
					var topUrl = hoalinks.getMailboxesLink();
					createResource(topUrl);
					query();
				};
				hoalinks.getLinks().then(init);
			}
			return deferred.promise;
		};

		this.getMailbox = function() {
			return makeRequest();
		};
	}]);