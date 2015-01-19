var documents = angular.module("hoaApp");

documents.service('service.hoadocuments', ['$resource', '$q', 'service.hoalinks', 
	function($resource, $q, hoalinks){
	
	var resource		= null;
	var documentsData	= [];

	var createResource = function(url) {
		resource = $resource(url, {}, {
			get  : {method : "GET", isArray : false},
			edit : {method : "PUT", isArray : false}
		});
	};

	var getData = function() {
		var deferred = $q.defer();

		var query = function() {
			resource.get().$promise
			.then(function(documentData) {
				deferred.resolve(documentData);
			})
		};

		if(resource != null) query();
		else {
			hoalinks.getLinks()
			.then(function(data) {
				var topUrl = hoalinks.getDocumentsLink();
				createResource(topUrl);
				query();
			});
		}
		return deferred.promise;
	}

	this.buildRequest = function(url) {
		createResource(url);
	}

	this.queryApi = function() {
		return getData();
	}

	this.putDocument = function(document) {
	}
}])