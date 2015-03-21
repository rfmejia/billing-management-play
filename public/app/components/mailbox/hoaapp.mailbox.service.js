angular
    .module("app.mailbox")
    .factory("mailbox.service", mailboxSrvc);

mailboxSrvc.$inject = ["$resource", "$q", "linksApi"];
function mailboxSrvc($resource, $q, hoalinks) {
    var service  ={
        getLocal       : getLocal,
        getMailboxes   : getMailboxes
    };

    var resource = null;

    activate();

    return service;

    function activate() {
        resource = $resource("app/components/mailbox/mailbox.json", {}, {
            get : {method : "GET", isArray: false}
        });
    }

    function getMailboxes() {
        return getLocal();
    }

    function getLocal() {
        var deferred = $q.defer();

        function success(response) {
            deferred.resolve(response);
        }

        function error(error) {
            deferred.reject(error.message);
        }

        resource.get().$promise.then(success, error);
        return deferred.promise;
    }
}