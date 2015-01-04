var users = angular.module("service.users", ["ngResource"]);

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
            console.log(username);
			var deferred		= $q.defer();
			var tempUsername	= (username != null) ? {id : username} : {};
			var query			= function(){
				resource.get(tempUsername).$promise.then(
					function(userData){
						deferred.resolve(userData);
                        console.log(userData);
					});
        	};

        	if(resource != null) query();
        	else {
        		hoalinks.getLinks().then(
        			function(links){
        				var topUrl = hoalinks.getUsersLinks() + "/:id";
        				createResource(topUrl);
                        console.log(topUrl);
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
            console.log("query api");
            console.log(id);
            return getData(id);
        }

        this.editUser = function(id, userDatails) {
            console.log(id);
            console.log(userDatails);
        } 

	}]);