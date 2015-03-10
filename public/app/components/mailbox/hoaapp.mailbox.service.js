var mailbox = angular.module("module.mailbox");

angular
    .module("module.mailbox")
    .factory("service.hoamailbox", [
                 "$resource",
                 "$q",
                 "service.hoalinks",
                 mailboxService
             ]);

function mailboxService($resource, $q, hoalinks) {
    var service  ={
        getMailboxName : getMailboxName,
        getLocal       : getLocal,
        getMailboxes   : getMailboxes
    };

    var resource = null;

    return service;

    function getMailboxName() {

    }

    function getMailboxes() {
        return makeRequest();
    }

    function getLocal() {
        var deferred = $q.defer();
        resource = $resource("app/components/mailbox/mailbox.json", {}, {
            get : {method : "GET", isArray: false}
        });

        function success(response) {
            deferred.resolve(response);
        }

        function query() {
            resource.get().$promise
                .then(success);
        }
        query();
        return deferred.promise;
    }

    function createResource(url) {
        resource = $resource(url);
    }

    function makeRequest(){
        var deferred = $q.defer();

        function success(response) {
            return deferred.resolve(response);
        }

        function query() {
            resource.get().$promise
                .then(success);
        }

        if(resource != null) query();
        else {
            function init(response) {
                var topUrl = hoalinks.getMailboxesLink();
                createResource(topUrl);
                query();
            }
            hoalinks.getLinks().then(init);
        }
        return deferred.promise;
    }
}