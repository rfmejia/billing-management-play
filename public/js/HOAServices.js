var hoaServices = angular.module('hoaServices', ["ngResource"]);

hoaServices.service("TenantsService", ["$resource", 
    function($resource){
        var topUrl;
        var currentTenant= {};
        var currentTenantId;
        var currentTenantDetails={};
        var resource;

        this.setTopUrl = function(data) {
            topUrl = data.href + "/:id";
            resource = $resource(topUrl, {}, {
                query   : {method: "GET", isArray: false},
                get     : {method: "GET", isArray: false},
                edit    : {method: "PUT", isArray: false}
            });
        }

        this.getList = function() {
            return resource;
        }

        this.setTenant = function(tenant) {
            currentTenant = tenant;
        }

        this.getTenant = function(tenantId) {
            if(currentTenant && currentTenant.id == tenantId) {
                return {sameTenant : true, tenant : currentTenant};
            }
            else {
                return {sameTenant : false, tenant : resource}
            }
        }
        
        this.editTenant = function(id, tenantDetails) {
            console.log("edit tenant");
            console.log(tenantDetails);
        } 
       
}]);

hoaServices.service('InvitesService', ["$resource", function ($resource) {
    var topUrl;
    var resource;

    this.setTopUrl = function(data) {
        topUrl = data.href;
        resource = $resource(topUrl, {}, {
            query          : {method : "GET", isArray : false},
            sendUserInvite : {method : "PUT", isArray : false}
        });
    }

    this.getRootAPI = function() {
        return resource;
    }
}]);

hoaServices.service("UsersService", ["$resource", 
    function ($resource) {
        var topUrl;
        var currentUser = {};
        var currentUserId;
        var currentUserDetails = {};
        var resource; 

        this.setTopUrl = function(data) {
            topUrl = data.href + "/:username";
            resource = $resource(topUrl, {}, {
                query   : {method : "GET", isArray: false},
                edit    : {method : "PUT", isArray: false}
            });
        }

        this.getList = function() {
            return resource;
        }

        this.setUser = function(user) {
            currentUser = user;
        }

        this.getUser = function(username) {
            if(currentUser && currentUser.username == username) {
                return {sameUser : true, user : currentUser};
            }
            else {
                return {sameUser : false, user : resource}
            }
        }

        this.inviteUser = function(userDetails) {
            console.log("edit user");
            console.log(userDetails);
        }
}]);