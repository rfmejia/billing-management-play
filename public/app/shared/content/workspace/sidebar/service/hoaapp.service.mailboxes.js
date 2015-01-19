var mailbox = angular.module("hoaApp");

mailbox.service("service.mailbox", ["$resource", "$q", "service.hoalinks",
	function($resource, $q, hoalinks){

		var resource = null;
		var mailboxes = [];

		var createResource = function(url) {
			resource = $resource(url);
		}

		var getData = function() {
			var deferred = $q.defer();
			
			var success  = function(response) {
				return response;
			}

			var parse 	 = function(response) {
				var mailboxes = response.mailboxes;
				var folders	  = [];
				angular.forEach(mailboxes, function(value, key) {
					var header			= Object.keys(value)[0];   
					var folderContents  = [];
				    angular.forEach(value[header], function(entry){
				        var baseName = angular.lowercase(entry).replace(/ /g,'');
				        var item     = {};
				        item.link    = "#/" + baseName;
				        item.header  = "Mailbox";
				        item.section = baseName;
				        item.title   = entry;
				        item.id      = baseName + "Link";
				        item.state   = "workspace." + baseName; 
				        folderContents.push(item);
				    });
				    var folder 			= {};

					folder.header		= header; 
					folder.contents	    = folderContents;

					folders.push(folder);
				});
				deferred.resolve(folders);
			}

			var query 	 = function() {
				resource.get().$promise
				.then(success)
				.then(parse);
			}

			if(resource != null) query();
			else {
				var init = function(response) {
					var topUrl = hoalinks.getMailboxesLink();
					createResource(topUrl);
					query();
				}
				hoalinks.getLinks().then(init);
			}
			return deferred.promise;
		};

		this.queryApi = function() {
			return getData();
		};
	}]);