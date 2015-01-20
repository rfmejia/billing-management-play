var users = angular.module("service.users", []);

users.service("service.hoausers", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource = null;

		var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    edit    : {method: "PUT", isArray: false}
            });
        };

        var getData = function(username) {
			var deferred		= $q.defer();
			var tempUsername	= (username != null) ? {id : username} : {};
			var query			= function(){
				resource.get(tempUsername).$promise.then(
					function(userData){
						deferred.resolve(userData);
					});
        	};

        	if(resource != null) query();
        	else {
        		hoalinks.getLinks().then(
        			function(links){
        				var topUrl = hoalinks.getUsersLinks() + "/:id";
        				createResource(topUrl);
        				query();
        			});
        	}
        	return deferred.promise;
        }

        this.buildRequest = function(url) {
            var topUrl = url + "/:id";
            createResource(topUrl);
        }

        this.queryApi = function(id) {
            return getData(id);
        }

        this.editUser = function(id, userDatails) {
        } 

	}]);