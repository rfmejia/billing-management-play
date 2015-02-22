angular
    .module("hoaApp")
    .factory('service.hoalinks', [
        '$resource',
        '$q',
        hoaAppLinksService
    ]);


function hoaAppLinksService ($resource, $q) {
    // var topUrl   = "http://hoa-play-scala.herokuapp.com/api";
    var topUrl   = "http://localhost:9000/api/";
    var usersLink       = null;
    var tenantsLink     = null;
    var currentUserLink = null;
    var mailboxesLink   = null;
    var documentsLink   = null;
    var templatesLink   = null;
    var logoutLink      = null;

    var resource = $resource(topUrl, {}, {
        get   : {method: "GET", isArray: false}
    });

    var service = {
        getResource         : getResource,
        getLinks            : getLinks,
        getUsersLinks       : getUsersLinks,
        getTenantsLinks     : getTenantsLinks,
        getCurrentUserLink  : getCurrentUserLink,
        getDocumentsLink    : getDocumentsLink,
        getTemplatesLink    : getTemplatesLink,
        getMailboxesLink    : getMailboxesLink,
        getLogoutLink       : getLogoutLink
    };

    return service;

    //Functions

    function getResource (){
        return resource;
    }

    function getUsersLinks() {
        return usersLink;
    }

    function getTenantsLinks() {
        return tenantsLink;
    }

    function getCurrentUserLink() {
        return currentUserLink;
    }

    function getDocumentsLink() {
        return documentsLink;
    }

    function getTemplatesLink() {
        return templatesLink;
    }

    function getMailboxesLink () {
        return mailboxesLink;
    }

    function getLogoutLink () {
        return logoutLink;
    }

    function getLinks() {
        var deferred = $q.defer();

        resource.get().$promise
            .then(success, error);
        function success(data) {
            usersLink       = data._links["hoa:users"].href;
            tenantsLink     = data._links["hoa:tenants"].href;
            documentsLink   = data._links["hoa:documents"].href;
            templatesLink   = data._links["hoa:templates"].href;
            mailboxesLink   = data._links["hoa:mailboxes"].href;
            currentUserLink = data._links["hoa:currentUser"].href;
            logoutLink      = data._links["hoa:logout"].href;
            deferred.resolve(data);
        }

        function error(data) {
            deferred.reject("Error");
        }
        return deferred.promise;
    }
}