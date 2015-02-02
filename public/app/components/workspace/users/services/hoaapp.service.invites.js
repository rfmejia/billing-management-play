var invites = angular.module("service.tenants", []);

invites.service("service.hoainvites", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource		= null;
		var createResource	= function(url) {
			resource = $resource(url, {}, {
				query          : {method : "GET", isArray : false},
				sendUserInvite : {method : "PUT", isArray : false}
			});
		};
		var getData			= function(username) {
			var deferred = $q.defer();
			var param 	 = (username != null) ? {id : param} : username;
			var query 	 = function() {
				resource.get(param).$promise.then(
					function(invitesData){
						deferred.resolve(invitesData);
					});
			};

			if(resource != null) query();
			else {
				hoalinks.getLinks().then(
					function(){
						var topUrl = hoalinks.getInvitesLink() + ":id";
						createResource(topUrl);
						query();
					});
			}
			return deferred.promise;	
		};

		var otherRoles  = [
                {"name" : "approver", "prompt" : "Approver", "value" : false},
                {"name" : "checker", "prompt" : "Checker", "value" : false},
                {"name" : "encoder", "prompt" : "Encoder", "value" : false}
        ];

        var adminRole = {"name" : "admin", "prompt" : "Administrator", "value" : false};

        var email     = {
               "name"         : "email",
               "prompt"       : "User e-mail",
               "value"        : "",
               "isRequired"   : true
           };

		this.queryApi = function(url) {
			return getData(url);
		};;

		this.getTemplate = function() {
			return {
				"email" 	  : email,
				"roles" 	  : {"admin" : adminRole, "other" : otherRoles}
			};
		}

	}]);