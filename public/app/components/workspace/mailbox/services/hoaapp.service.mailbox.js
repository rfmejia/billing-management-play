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

			var query 	 = function() {
				resource.get().$promise
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

        this.getLocal = function() {
            var deferred = $q.defer();
            resource = $resource("../../../../../../assets/templates/mailbox.json", {}, {
                get : {method : "GET", isArray: false}
            });

            var success = function(response) {
                deferred.resolve(response);
            };

            var query = function() {
                resource.get().$promise
                    .then(success);
            };

            query();
            return deferred.promise;
        }
	}]);