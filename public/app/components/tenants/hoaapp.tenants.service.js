var tenants = angular.module("app.tenants");

angular.module("app.tenants").factory("tenantsApi", tenantsApi)

function tenantsApi($resource, $q, linksApi) {
    var service = {
        getList       : getList,
        getAllTenants : getAllTenants,
        getTenant     : getTenant,
        createTenant  : createTenant,
        editTenant    : editTenant,
        deleteTenant  : deleteTenant
    };

    var url = linksApi.getTenantsLinks() + "/:id";

    var resource = $resource(url, {}, {
        get    : {method : "GET", isArray : false},
        create : {method : "POST", isArray : false, headers : {"Content-Type" : "application/json"}},
        edit   : {method : "PUT", isArray : false, headers : {"Content-Type" : "application/json"}},
        delete : {method : "DELETE", isArray : false}
    });

    return service;

    //Returns a list of tenants and also a template to create a tenant
    function getList(queryParams) {
        var deferred = $q.defer();

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };

        resource.get(queryParams).$promise.then(success, error);
        return deferred.promise;
    }

    function getAllTenants() {
        var deferred = $q.defer();

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };

        resource.get().$promise.then(function(response) {
            getList({limit : response.total}).then(success, error);
        }, error);

        return deferred.promise;
    }

    //Returns a tenant and also a template to edit a tenant
    function getTenant(id) {
        var deferred = $q.defer();
        var tenantId = {id : id};
        var success = function(response) {
            console.log(response);
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };

        resource.get(tenantId).$promise.then(success, error);
        return deferred.promise
    }

    //Creates a tenant with the supplied data
    function createTenant(tenantData) {
        var deferred = $q.defer();

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };
        resource.create(tenantData).$promise.then(success, error);
        return deferred.promise
    }

    //Edits a tenant referenced by the id with the new data
    function editTenant(id, tenantData) {
        var deferred = $q.defer();
        var tenantId = {id : id};
        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };
        resource.edit(tenantId, tenantData).$promise.then(success, error);
        return deferred.promise
    }

    //Deletes a tenant referenced by the id
    function deleteTenant(id) {
        var deferred = $q.defer();
        var tenantId = {id : id};
        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error);
        };
        resource.delete(tenantId).$promise.then(success, error);
        return deferred.promise
    }

}
tenantsApi.$inject = ["$resource", "$q", "linksApi"];
