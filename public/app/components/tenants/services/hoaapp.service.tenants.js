var tenants = angular.module("module.tenants");

tenants.service("service.hoatenants", ["$resource", "$q", "service.hoalinks",
    function($resource, $q, hoalinks){
        var resource       = null;
        var requestType    = Object.freeze({"QUERY" : 0, "GET" : 1, "EDIT" : 2, "CREATE" : 3, "DELETE" : 4});
       
        var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    create  : {method: "POST", isArray: false, headers:{"Content-Type" : "application/json"}},
                    edit    : {method: "PUT", isArray: false, headers:{"Content-Type" : "application/json"}},
                    delete  : {method: "DELETE", isArray: false}

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
                        resource.get(id).$promise.then(success, error);
                        break;
                    case requestType.QUERY:
                        resource.get().$promise.then(success, error);
                        break;
                    case requestType.EDIT:
                        resource.edit(id, data).$promise.then(success, error);
                        break;
                    case requestType.CREATE:
                        resource.create(data).$promise.then(success, error);
                        break;
                    case requestType.DELETE:
                        resource.delete(id).$promise.then(success, error);
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

        this.deleteTenant   = function(id) {
            return makeRequest(id, null, requestType.DELETE);
        }
    }]);