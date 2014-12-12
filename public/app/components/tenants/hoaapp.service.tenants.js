var tenants = angular.module("service.tenants", ["ngResource"]);

tenants.service("service.hoatenants", ["$resource", "$q", "service.hoalinks",
    function($resource, $q, hoalinks){
        var resource = null;

        var createResource = function(url){
            resource = $resource(url, {}, {
                    get     : {method: "GET", isArray: false},
                    edit    : {method: "PUT", isArray: false}
            });
        };

        var getData = function(dataId) {
            var deferred = $q.defer();
            console.log(dataId);
            var query;
            if(dataId) {
                query = function(){
                    resource.get({id : dataId}).$promise.then(
                    function(data) {
                        deferred.resolve(data);

                    });
                } 
            }
            else {console.log("here");
                query = function() {
                    resource.get().$promise.then(
                        function(data){
                            deferred.resolve(data);
                            console.log(data);
                        });
                }
            }
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

        this.getList = function() {
            return getData(null);
        }

        this.getTenant = function(tenantId) {
            return getData(tenantId);
        }

        this.editTenant = function(id, tenantDetails) {
            console.log(id);
            console.log(tenantDetails);
        } 
    }]);