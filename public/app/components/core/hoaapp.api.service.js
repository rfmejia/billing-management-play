angular
    .module("app.core")
    .provider('linksApi', linksProvider);

function linksProvider() {
    this.$get = linksApi;

    function linksApi($resource, $q) {
        var service = {
            getResource        : getResource,
            getLinks           : getLinks,
            getUsersLinks      : getUsersLinks,
            getTenantsLinks    : getTenantsLinks,
            getCurrentUserLink : getCurrentUserLink,
            getDocumentsLink   : getDocumentsLink,
            getTemplatesLink   : getTemplatesLink,
            getMailboxesLink   : getMailboxesLink,
            getLogoutLink      : getLogoutLink,
            getApiLink         : getApiLink,
            setUrl             : setUrl,
            isUrlSet           : isUrlSet
        };

        var topUrl = null;
        var usersLink = null;
        var tenantsLink = null;
        var currentUserLink = null;
        var mailboxesLink = null;
        var documentsLink = null;
        var templatesLink = null;
        var logoutLink = null;
        var isUrlSet = false;

        return service;

        //Functions

        function getResource() {
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

        function getMailboxesLink() {
            return mailboxesLink;
        }

        function getLogoutLink() {
            return logoutLink;
        }

        function getApiLink() {
            return topUrl;
        }

        function getLinks() {
            var deferred = $q.defer();
            var resource = $resource(topUrl, {}, {
                get : {method : "GET", isArray : false}
            });

            function success(data) {
                usersLink = data._links["hoa:users"].href;
                tenantsLink = data._links["hoa:tenants"].href;
                documentsLink = data._links["hoa:documents"].href;
                templatesLink = data._links["hoa:templates"].href;
                mailboxesLink = data._links["hoa:mailboxes"].href;
                currentUserLink = data._links["hoa:currentUser"].href;
                logoutLink = data._links["hoa:logout"].href;
                isUrlSet = true;
                deferred.resolve(data);
            }

            function error(data) {
                deferred.reject("Error");
            }

            resource.get().$promise.then(success, error);
            return deferred.promise;
        }

        function setUrl(url) {
            if(url) topUrl = url;
        }

        function isUrlSet() {
            return isUrlSet;
        }
    }
}

