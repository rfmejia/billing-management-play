var tenants = angular.module("module.tenants");

tenants.service("service.hoatenants", ["$resource", "$q", "service.hoalinks", "helper.tenant",
    function($resource, $q, hoalinks, tenantHelper){
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

        //Function that makes the actual request
        var makeRequest = function(tenantId, tenantData, type) {
            var deferred  = $q.defer();
            var id        = (tenantId != null) ? {id : tenantId} : tenantId;
            var success   = function(response) {
                deferred.resolve(response);
            };

            var error     = function(msg) {
                deferred.reject();
            };

            var request   = function() {
                switch(type) {
                    case requestType.GET:
                        resource.get(id).$promise
                            .then(success, error);
                        break;
                    case requestType.QUERY:
                        resource.get().$promise
                            .then(success, error);
                        break;
                    case requestType.EDIT:
                        resource.edit(id, tenantData).$promise
                            .then(success, error);
                        break;
                    case requestType.CREATE:
                        resource.create(tenantData).$promise
                            .then(success, error);
                        break;
                    case requestType.DELETE:
                        resource.delete(id).$promise
                            .then(success, error);
                }
            };

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
        };

        //Returns a list of tenants and also a template to create a tenant
        this.getList        = function() {
            return makeRequest(null, null, requestType.QUERY);
        };

        //Returns a tenant and also a template to edit a tenant
        this.getTenant      = function(id) {
            return makeRequest(id, null, requestType.GET);
        };

        //Creates a tenant with the supplied data
        this.createTenant   = function(data) {
            return makeRequest(null, data, requestType.CREATE);
        };

        //Edits a tenant referenced by the id with the new data
        this.editTenant     = function(id, data) {
            return makeRequest(id, data, requestType.EDIT);
        };

        //Deletes a tenant referenced by the id
        this.deleteTenant   = function(id) {
            return makeRequest(id, null, requestType.DELETE);
        };

        //Returns a template of the tenant
        this.getTemplate    = function() {
            return makeRequest(null, null, requestType.QUERY);
        }
    }]);