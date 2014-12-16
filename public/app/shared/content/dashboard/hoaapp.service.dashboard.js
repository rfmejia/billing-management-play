var dashboard = angular.module("service.dashboard", ["ngResource"]);

dashboard.service("service.hoalinks", ["$resource", "$q", 
    function($resource, $q) {
        var topUrl = "http://hoa-play-scala.herokuapp.com/api";
        var resource = $resource(topUrl, {}, {
            get   : {method: "GET", isArray: false}
        });    
        var usersLink = null;
        var tenantsLink = null;
        var invitesLink = null;
        var currentUserLink = null;

        this.getLinks = function() {
            var deferred = $q.defer();
            resource.get().$promise.then(
                function(data){
                    usersLink       = data._links["hoa:users"].href;
                    tenantsLink     = data._links["hoa:tenants"].href;
                    invitesLink     = data._links["hoa:invites"].href; 
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        this.getUserLink = function() {
            return usersLink;
        }
        this.getTenantsLinks = function() {
            console.log(tenantsLink)
            return tenantsLink;
        }
        this.getInvitesLink = function() {
            return invitesLink;
        }
        this.getCurrentUserLink = function() {
            return currentUserLink;
        }
    }]);