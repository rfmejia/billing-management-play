angular
    .module('module.mailbox')
    .factory('service.hoadocuments', [
        '$q',
        '$resource',
        'service.hoalinks',
        documentSrv
    ]);

function documentSrv($q, $resource, hoalinks) {
    var service = {
        getDocument         : getDocument,
        getDocumentList     : getDocumentList,
        editDocument        : editDocument,
        deleteDocument      : deleteDocument,
        createDocument      : createDocument,
        getLimitRequest     : getLimitRequest,
        moveToBox           : moveToBox
    };

    var resource		= null;
    var limit = 10;
    var requestType     = Object.freeze({
        "QUERY"     : 0,
        "GET"       : 1,
        "EDIT"      : 2,
        "CREATE"    : 3,
        "DELETE"    : 4
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
    function getDocumentList(queryBox, offsetPage) {
        var startPage = (offsetPage == null) ? 0 : (offsetPage * limit);
        var query = {mailbox: queryBox, offset: startPage, limit: limit};
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

    function getLimitRequest() {
        return limit;
    }

    function moveToBox(id, url, data) {
        var deferred = $q.defer();

        var  submitResource = $resource(url, {}, {
            create  : {method: "POST", isArray: false, headers:{"Content-Type" : "application/json"}}
        });

        var submitDocument = function() {
            submitResource.create(data).$promise
                .then(success, error);
        };

        var success = function(response){
            deferred.resolve(response);
        };

        var error = function(error) {
            deferred.reject();
        };

        editDocument(id, data)
            .then(submitDocument);

        return deferred.promise;
    }

    function createResource(url) {
        resource = $resource(url, {}, {
            get     : {method: "GET", isArray: false},
            create  : {method: "POST", isArray: false, headers:{"Content-Type" : "application/json"}},
            edit    : {method: "PUT", isArray: false, headers:{"Content-Type" : "application/json"}},
            delete  : {method: "DELETE", isArray: false}
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
            switch(type) {
                case requestType.GET:
                    resource.get(id).$promise
                        .then(success, error);
                    break;
                case requestType.QUERY:
                    resource.get(documentQuery).$promise
                        .then(success, error);
                    break;
                case requestType.EDIT:
                    var comments = {"comments" :documentData.comments};
                    console.log(JSON.stringify(comments));
                    resource.edit(id, comments).$promise.then(success, error).then(function(value) {
                        console.log(value);
                    });
                    break;
                case requestType.CREATE:
                    resource.create(documentData).$promise.then(success, error);
                    break;
                case requestType.DELETE:
                    resource.delete(id).$promise.then(success, error);
            }
        };

        if(resource ==  null) {
            var linksResponse = function(response) {
                var topUrl = hoalinks.getDocumentsLink() + "/:id";
                createResource(topUrl);
                request();
            };

            hoalinks.getLinks().then(linksResponse);
        }
        else request();

        return deferred.promise;
    }
}