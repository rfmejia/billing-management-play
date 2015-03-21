angular
    .module('app.mailbox')
    .factory('documents.service', [
                 '$q',
                 '$resource',
                 'linksApi',
                 documentSrv
             ]);

function documentSrv($q, $resource, hoalinks) {
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

    var resource = null;
    var requestType = Object.freeze({
                                        "QUERY"  : 0,
                                        "GET"    : 1,
                                        "EDIT"   : 2,
                                        "CREATE" : 3,
                                        "DELETE" : 4
                                    });

    return service;

    //Gets a specific document
    function getDocument(id) {
        return makeRequest(id, null, null, requestType.GET);
    }

    /**
     * Retrieves documents depending on query parameters
     * @param queryBox
     * @param offsetPage
     * @returns {*}
     */
    function getDocumentList(query) {
        return makeRequest(null, query, null, requestType.QUERY);
    }

    //Edits a document
    function editDocument(id, documentData) {
        return makeRequest(id, null, documentData, requestType.EDIT);
    }

    //Deletes a document referenced by the id
    function deleteDocument(id) {
        return makeRequest(id, null, null, requestType.DELETE);
    }

    function createDocument(data) {
        return makeRequest(null, null, data, requestType.CREATE);
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

        submitResource.move().$promise
            .then(success, error);

        return deferred.promise;
    }

    function createResource(url) {
        resource = $resource(url, {}, {
            get    : {method : "GET", isArray : false},
            create : {method : "POST", isArray : false, headers : {"Content-Type" : "application/json"}},
            edit   : {method : "PUT", isArray : false, headers : {"Content-Type" : "application/json"}},
            delete : {method : "DELETE", isArray : false}
        });
    }

    function makeRequest(documentId, documentQuery, documentData, type) {
        var deferred = $q.defer();
        var id = (documentId != null) ? {id : documentId} : documentId;
        var success = function(response) {
            deferred.resolve(response);
            return response;
        };

        var error = function(response) {
            deferred.reject();
        };

        var request = function() {
            switch (type) {
                case requestType.GET:
                    resource.get(id).$promise
                        .then(success, error);
                    break;
                case requestType.QUERY:
                    resource.get(documentQuery).$promise
                        .then(success, error);
                    break;
                case requestType.EDIT:
                    resource.edit(id, documentData).$promise
                        .then(success, error);
                    break;
                case requestType.CREATE:
                    resource.create(documentData).$promise
                        .then(success, error);
                    break;
                case requestType.DELETE:
                    resource.delete(id).$promise
                        .then(success, error);
            }
        };

        if (resource == null) {
            var linksResponse = function(response) {
                var topUrl = hoalinks.getDocumentsLink() + "/:id";
                createResource(topUrl);
                request();
            };
            console.log(type);
            hoalinks.getLinks().then(linksResponse);
        }
        else {
            request();
        }

        return deferred.promise;
    }
}