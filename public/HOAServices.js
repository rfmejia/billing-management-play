var hoaServices = angular.module('hoaServices', ["ngResource"]);

hoaServices.service("TenantsService", ["$resource", "service.hoalinks", 
    function($resource, hoalinks){
        var topUrl = null; 
        var resource = null; 

        var currentTenant= {};
        var currentTenantId;

        this.buildRequest = function(url) {
            topUrl = url + "/:id";
            console.log(topUrl);
            resource = $resource(topUrl, {}, {
                query   : {method: "GET", isArray: false},
                get     : {method: "GET", isArray: false},
                edit    : {method: "PUT", isArray: false}
            });
            console.log(hoalinks);
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
        } 
       
}]);

hoaServices.service('InvitesService', ["$resource", "service.hoalinks", 
    function ($resource, hoalinks) {
    var topUrl      = null;
    var resource    = null;

    this.buildRequest = function() {
        topUrl      = hoalinks.getInvitesLink();
        resource    = $resource(topUrl, {}, {
                query          : {method : "GET", isArray : false},
                sendUserInvite : {method : "PUT", isArray : false}
            });
    }

    this.getRootAPI = function() {
        return resource;
    }
}]);

hoaServices.service("UsersService", ["$resource", "service.hoalinks",
    function ($resource, hoalinks) {
        var topUrl      = null;
        var resource    = null;

        var currentUser = {};
        var currentUserId;
        var currentUserDetails = {};

        this.buildRequest = function() {
            topUrl      = hoalinks.getUserLink() + "/:username";
            resource    = $resource(topUrl, {}, {
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