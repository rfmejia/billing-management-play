var hoaServices = angular.module('hoaServices', ["ngResource"]);

hoaServices.service("HOAMainService", ["$resource", "$q",
    function($resource, $q) {
        var topUrl = "http://hoa-play-scala.herokuapp.com/api";
        var resource = $resource(topUrl, {}, {
            get   : {method: "GET", isArray: false}
        });    

        var usersLink = null;
        var tenantsLink = null;
        var invitesLink = null;
        var currentUserLink = null;

        //TODO: change name to get resource
        this.getLinks = function() {
            return resource;
        }

        //accepts the top level data then sets the necessary links
        this.setLinks = function(data) {
            usersLink       = data._links["hoa:users"].href;
            tenantsLink     = data._links["hoa:tenants"].href;
            invitesLink     = data._links["hoa:invites"].href; 
            console.log("Links set");
        }
        this.getUserLink = function() {
            return usersLink;
        }
        this.getTenantsLinks = function() {
            return tenantsLink;
        }
        this.getInvitesLink = function() {
            return invitesLink;
        }
        this.getCurrentUserLink = function() {
            return currentUserLink;
        }
    }
])

hoaServices.service("TenantsService", ["$resource", "HOAMainService", 
    function($resource, HOAMainService){
        var topUrl = null; 
        var resource = null; 

        var currentTenant= {};
        var currentTenantId;
        var currentTenantDetails= {};

        this.buildRequest = function() {
            topUrl = HOAMainService.getTenantsLinks() + "/:id";
            resource = $resource(topUrl, {}, {
                query   : {method: "GET", isArray: false},
                get     : {method: "GET", isArray: false},
                edit    : {method: "PUT", isArray: false}
            });
            console.log(HOAMainService.getTenantsLinks());
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

hoaServices.service('InvitesService', ["$resource", "HOAMainService", 
    function ($resource, HOAMainService) {
    var topUrl      = null;
    var resource    = null;

    this.buildRequest = function() {
        topUrl      = HOAMainService.getInvitesLink();
        resource    = $resource(topUrl, {}, {
                query          : {method : "GET", isArray : false},
                sendUserInvite : {method : "PUT", isArray : false}
            });
    }

    this.getRootAPI = function() {
        return resource;
    }
}]);

hoaServices.service("UsersService", ["$resource", "HOAMainService",
    function ($resource, HOAMainService) {
        var topUrl      = null;
        var resource    = null;

        var currentUser = {};
        var currentUserId;
        var currentUserDetails = {};

        this.buildRequest = function() {
            topUrl      = HOAMainService.getUserLink() + "/:username";
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