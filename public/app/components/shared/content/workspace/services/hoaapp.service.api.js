var dashboard = angular.module("hoaApp");

dashboard.service("service.hoalinks", ["$resource", "$q", 
    function($resource, $q) {
        // var topUrl   = "http://hoa-play-scala.herokuapp.com/api";
        var topUrl   = "http://localhost:9000/api/";;
        var resource = $resource(topUrl, {}, {
            get   : {method: "GET", isArray: false}
        });    
        var usersLink       = null;
        var tenantsLink     = null;
        var invitesLink     = null; //TODO: remove
        var currentUserLink = null; //not yet implemented
        var mailboxesLink   = null;
        var documentsLink   = null;
        var templatesLink   = null;
        var isLinksSet        = false;

        this.getResource = function() {
            return resource; 
        };;

        this.isLinksSet = function() {
            return isLinksSet;
        };;

        this.getLinks = function() {
            var deferred = $q.defer();
            resource.get().$promise.then(
                function(data){
                    usersLink       = data._links["hoa:users"].href;
                    tenantsLink     = data._links["hoa:tenants"].href;
                    documentsLink   = data._links["hoa:documents"].href;
                    templatesLink   = data._links["hoa:templates"].href;
                    mailboxesLink   = data._links["hoa:mailboxes"].href;
                    isLinksSet = true;
                    deferred.resolve(data);
                }, 
                function() {
                    isLinksSet = false;
                    deferred.reject("Error");
                });

            return deferred.promise;
        };

        this.getUsersLinks = function() {
            return usersLink;
        };;
        this.getTenantsLinks = function() {
            return tenantsLink;
        };;
        //TODO: remove
        this.getInvitesLink = function() {
            return invitesLink;
        };;
        this.getCurrentUserLink = function() {
            return currentUserLink;
        };;
        this.getDocumentsLink = function() {
            return documentsLink;
        };;
        this.getTemplatesLink = function() {
            return templatesLink;
        };;
        this.getMailboxesLink = function() {
            return mailboxesLink;
        }
    }]);