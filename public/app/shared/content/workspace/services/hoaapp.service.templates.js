var templates = angular.module("hoaApp");

templates.service("service.hoatemplates", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource		= null;

		var createResource = function(url) {
			resource = $resource(url, {}, {
				get : {method : "GET", isArray: false}
			});
		}

		var getLocal = function() {
			var deferred = $q.defer();
			var resource = $resource("../../../../../assets/hoa_invoice_template.json", {}, {
				get : {method : "GET", isArray: false}
			});

			resource.get().$promise.then(
                function(data) {
                    console.log(data);
				deferred.resolve(data);
			});
			return deferred.promise;
		}

		var getData = function() {
			var deferred	= $q.defer();
			var query		= function() {
				resource.get().$promise
				.then(function(templateData) {
					var hoaTemplateLink = templateData._embedded.item[0]._links.self.href;
					return hoaTemplateLink;
				
				})
				.then(function(hoaTemplateLink) {
					templateLink = $resource(hoaTemplateLink, {}, {
						get : {method : 'GET', isArray : false}
					});
					templateLink.get().$promise
					.then(function(hoaTemplate) {
						deferred.resolve(hoaTemplate);
					});
				});

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
		}

		this.queryApi = function() {
			return getData();
		}

		this.queryLocal = function() {
            console.log("local");
			return getLocal();
		}
	}]);