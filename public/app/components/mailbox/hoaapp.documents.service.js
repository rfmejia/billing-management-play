angular
    .module('app.mailbox')
    .factory('documentsApi', documentApi);

function documentApi($q, $resource, linksApi) {
    var service = {
        getDocument      : getDocument,
        getDocumentList  : getDocumentList,
        editDocument     : editDocument,
        deleteDocument   : deleteDocument,
        createDocument   : createDocument,
        assignDocument   : assignDocument,
        unassignDocument : unassignDocument,
        moveToBox        : moveToBox
    };
    var url = linksApi.getDocumentsLink() + "/:id";
    var resource = $resource(url, {}, {
        get    : {method : "GET", isArray : false},
        create : {method : "POST", isArray : false, headers : {"Content-Type" : "application/json"}},
        edit   : {method : "PUT", isArray : false, headers : {"Content-Type" : "application/json"}},
        delete : {method : "DELETE", isArray : false}
    });

    return service;

    //Gets a specific document
    function getDocument(id) {
        var deferred = $q.defer();
        var documentId = {id : id};

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            //TODO: Error meessage
            deferred.reject(error);
        };

        resource.get(documentId).$promise.then(success, error);

        return deferred.promise

    }

    //Gets document list
    function getDocumentList(query) {
        var deferred = $q.defer();

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            //TODO: Error meessage
            deferred.reject(error);
        };

        resource.get(query).$promise.then(success, error);

        return deferred.promise;
    }

    //Edits a document
    function editDocument(id, documentData) {
        var deferred = $q.defer();
        var documentId = {id: id};

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            //TODO: Error meessage
            deferred.reject(error);
        };
        resource.edit(documentId, documentData).$promise.then(success, error);
        return deferred.promise
    }

    //Deletes a document referenced by the id
    function deleteDocument(id) {
        var deferred = $q.defer();
        var documentId = {id: id};

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            //TODO: Error meessage
            deferred.reject(error);
        };
        resource.delete(documentId).$promise.then(success, error);
        return deferred.promise;
    }

    function createDocument(documentData) {
        var deferred = $q.defer();

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            //TODO: Error meessage
            deferred.reject(error);
        };
        resource.create(documentData).$promise.then(success, error);

        return deferred.promise;
    }

    function assignDocument(url) {
        var deferred = $q.defer();
        var res = $resource(url, {}, {
            put : {
                method  : "PUT",
                isArray : false,
                headers : {"Content-Type" : "application/json"}
            }
        });
        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error.message);
        };
        res.put().$promise.then(success, error);
        return deferred.promise;
    }

    function unassignDocument(url) {
        var deferred = $q.defer();
        var res = $resource(url);
        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject(error.message);
        };
        res.delete().$promise.then(success, error);
        return deferred.promise;
    }

    function moveToBox(url) {
        var deferred = $q.defer();
        var submitResource = $resource(url, {}, {
            move : {method : "POST", isArray : false, headers : {"Content-Type" : "application/json"}}
        });

        var success = function(response) {
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject();
        };

        submitResource.move().$promise.then(success, error);

        return deferred.promise;
    }
}
documentApi.$inject = ["$q", "$resource", "linksApi"];