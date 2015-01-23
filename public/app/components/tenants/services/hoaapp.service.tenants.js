var tenants = angular.module("module.tenants");

tenants.service("service.hoatenants", ["$resource", "$q", "service.hoalinks",
    function($resource, $q, hoalinks){
        var resource       = null;
        var requestType    = Object.freeze({"QUERY" : 0, "GET" : 1, "EDIT" : 2, "CREATE" : 3});
       
        var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    create  : {method: "POST", isArray: false, headers:{"Content-Type" : "application/json"}},
                    edit    : {method: "PUT", isArray: false, headers:{"Content-Type" : "application/json"}}

            });
        };

        var makeRequest = function(dataId, data, type) {
            var deferred  = $q.defer();
            var id        = (dataId != null) ? {id : dataId} : dataId;
            var success   = function(response) {
                console.log("success");
                deferred.resolve(response);
            };

            var error     = function(msg) {
                console.log(msg);
                deferred.reject();
            }

            var request   = function() {
                switch(type) {
                    case requestType.GET:
                        resource.get(id).$promise.then(success);
                        break;
                    case requestType.QUERY:
                        resource.get().$promise.then(success);
                        break;
                    case requestType.EDIT:
                        resource.edit(id, data).$promise.then(success);
                        break;
                    case requestType.CREATE:
                        resource.create(data).$promise.then(success).then(error);
                        break;
                }
            }

            if(resource == null) {
                hoalinks.getLinks().then(
                        function(response){
                            var topUrl = hoalinks.getTenantsLinks() + "/:id";
                            createResource(topUrl);
                            request();
                        }
                    );
            }
            else request();

            return deferred.promise;
        }

        this.getList        = function() {
            return makeRequest(null, null, requestType.QUERY);
        }

        this.getTenant      = function(id) {
            return makeRequest(id, null, requestType.GET);
        }

        this.createTenant   = function(data) {
            return makeRequest(null, data, requestType.CREATE);
        }

        this.editTenant     = function(id, data) {
            return makeRequest(id, data, requestType.EDIT);
        }
    }]);