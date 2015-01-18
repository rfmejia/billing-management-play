var templates = angular.module("service.templates", ["ngResource"]);

templates.service("service.hoatemplates", ["$resource", "$q", "service.hoalinks", 
	function($resource, $q, hoalinks){
		var resource		= null;
		var templatesList	= [];

		var createResource = function(url) {
			console.log(url);
			resource = $resource(url, {}, {
				get : {method : "GET", isArray: false}
			});
		}

		var getLocal = function() {
			var deferred = $q.defer();
			var resource = $resource("../../assets/hoa_invoice_template.json", {}, {
				get : {method : "GET", isArray: false}
			});

			resource.get().$promise
			.then(function(data) {
				deferred.resolve(data);
			});
			return deferred.promise;
		}

		var getData = function() {
			var deferred	= $q.defer();
			var query		= function() {
				console.log(resource);
				resource.get().$promise
				.then(function(templateData) {
					var hoaTemplateLink = templateData._embedded.item[0]._links.self.href;
					return hoaTemplateLink;
				
				})
				.then(function(hoaTemplateLink) {
					templateLink = $resource(hoaTemplateLink, {}, {
						get : {method : 'GET', isArray : false}
					});
					console.log(templateLink);
					templateLink.get().$promise
					.then(function(hoaTemplate) {
						console.log(hoaTemplate);
						deferred.resolve(hoaTemplate);
					});
				});

			};
			if(resource != null) query();
			else {
				hoalinks.getLinks().then(
					function(data){
						var topUrl = hoalinks.getTemplatesLink();
						console.log(topUrl);
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
			return getLocal();
		}
	}]);