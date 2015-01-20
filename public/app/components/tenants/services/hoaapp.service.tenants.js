var tenants = angular.module("module.tenants");

tenants.service("service.hoatenants", ["$resource", "$q", "service.hoalinks",
    function($resource, $q, hoalinks){
        var resource       = null;
        var tenantsList    = [];                            
       
        var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    edit    : {method: "PUT", isArray: false}
            });
        };

         var getData        = function(dataId) {
            var deferred = $q.defer();
            var tempId   = (dataId != null) ? {id : dataId} : dataId;
            var query    = function(){
                    resource.get(tempId).$promise.then(
                    function(tenantsData) {
                        deferred.resolve(tenantsData);

                    });
                };
            
            if(resource != null) query();
            else {
                hoalinks.getLinks().then(
                    function(data){
                        var topUrl = hoalinks.getTenantsLinks() + "/:id";
                        createResource(topUrl);
                        query();
                    });
            }
            return deferred.promise;
        }

        this.buildRequest = function(url) {
            var topUrl = url + "/:id";
            createResource(topUrl);
        }

        this.queryApi = function(id) {
            return getData(id);
        }

        this.editTenant = function(id, tenantDetails) {
            console.log(id);
            console.log(tenantDetails);
        } 
    }]);