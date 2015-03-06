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

        //Function to get the list of tenants and add a template to creating tenants
        var extractTenantList    = function(response) {
            return {
                "tenants"         : response._embedded.item,
                "template"        : extractCreateTemplate(response)
            };
        };

        //Function get a tenant and add a template to edit the tenant + adds the values to each field
        var formatServerResponse        = function(response) {

           return tenantHelper.formatResponse(response);
        };

        //Function to extract the template for creating tenants and adds a post template for the server
        var extractCreateTemplate      = function(response) {
            var raw = response._template.create.data[0];
            var details = [];
            angular.forEach(raw,
                function(value){
                    var template = angular.copy(value);
                    template.value = "";
                    details.push(template);
                }
            );
            return {
                "details" : details,
                "postTemplate" : extractPostTemplate(raw)
            };
        };

        //Function to extract the edit template for a tenant and adds a post template for the server
        var extractEditTemplate      = function(response) {
            var raw = response._template.edit.data[0];
            var details = [];
            angular.forEach(raw,
                function(value){
                    var template = angular.copy(value);
                    template.value = "";
                    details.push(template);
                }
            );
            return {
                "details" : details,
                "id"      : response.id,
                "postTemplate" : extractPostTemplate(raw)
            };
        };

        //Function that creates a post template for the server
        var extractPostTemplate  = function(response) {
            var postTemplate = {};
            angular.forEach(response,
                function(value){
                    postTemplate[value.name] = "";
                }
            );
            return postTemplate;
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
                            .then(formatServerResponse, error)
                            .then(success);
                        break;
                    case requestType.QUERY:
                        resource.get().$promise
                            .then(extractTenantList, error)
                            .then(success);
                        break;
                    case requestType.EDIT:
                        resource.edit(id, tenantData).$promise.then(success, error);
                        break;
                    case requestType.CREATE:
                        resource.create(tenantData).$promise.then(success, error);
                        break;
                    case requestType.DELETE:
                        resource.delete(id).$promise.then(success, error);
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