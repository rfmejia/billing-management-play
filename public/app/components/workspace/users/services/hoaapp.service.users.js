var users = angular.module("service.users", []);

users.service("service.hoausers", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource = null;
        var requestType = Object.freeze({
            "QUERY"  : 0,
            "GET"    : 1
        });

		var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    edit    : {method: "PUT", isArray: false}
            });
        };

        var makeRequest = function(userId, type) {
			var deferred		= $q.defer();
			var tempId	= (userId != null) ? {id : userId} : userId;
			var success         = function(response) {
                deferred.resolve;
            };
            var error           = function(error)  {
                console.log(error.message);
                deferred.reject();
            };

            var request = function() {
                switch(type) {
                    case requestType.QUERY:
                        resource.get().$promise.then(success, error);
                        break;
                    case requestType.GET:
                        resource.get(tempId);
                        break;
                }
                return deferred.promise;
            };

        	if(resource != null) request();
        	else {
        		hoalinks.getLinks().then(
        			function(links){
        				var topUrl = hoalinks.getUsersLinks() + "/:id";
        				createResource(topUrl);
        				request();
        			});
        	}
        	return deferred.promise;
        };

        //Returns a list of current users
        this.getUserList = function() {
            return makeRequest(null, requestType.QUERY);
        };

        //Returns a list of a specific user based on the passed id
        this.getUser = function(id) {
            return makeRequest(id, requestType.GET);
        };
	}]);