var templates = angular.module("hoaApp");

templates.service("service.hoatemplates", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource		= null;

		var createResource = function(url) {
			resource = $resource(url, {}, {
				get : {method : "GET", isArray: false}
			});
		};

        //From the response, get the template link
        var extractTemplateLink = function(response) {
            return response._embedded.item[0]._links.self.href;
        };

        //Using the response (url) make a request to get that url
        var queryTemplateLink = function(response) {
            var templateResource = $resource(response);
            return templateResource.get().$promise;
        };

		var makeRequest = function() {
			var deferred	= $q.defer();
            var success = function(response) {
                deferred.resolve(response);
            };
			var query		= function() {
				resource.get().$promise
				    .then(extractTemplateLink)
                    .then(queryTemplateLink)
                    .then(success);

			};
			if(resource != null) query();
			else {
				hoalinks.getLinks().then(
					function(data){
						var topUrl = hoalinks.getTemplatesLink();
						createResource(topUrl);
						query();
					});
			}
			return deferred.promise;
		};

		this.queryApi = function() {
			return makeRequest();
		};

        this.getLocal = function() {
            var deferred = $q.defer();
            resource = $resource("../../../../../../assets/templates/invoice-1.json", {}, {
               get : {method : "GET", isArray: false}
            });

            var success = function(response) {
                console.log(response);
                deferred.resolve(response);
            };

            var error = function(error) {
                deferred.reject(error);
            };

            var query = function() {
                resource.get().$promise
                    .then(success, error);
            };

            query();
            return deferred.promise;
        }
	}]);