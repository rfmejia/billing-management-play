var documents = angular.module("hoaApp");


documents.service('service.hoadocuments', ['$resource', '$q', 'service.hoalinks',
	function($resource, $q, hoalinks){
        var resource		= null;
        var limit = 10;
        var requestType     = Object.freeze({
            "QUERY"     : 0,
            "GET"       : 1,
            "EDIT"      : 2,
            "CREATE"    : 3,
            "DELETE"    : 4
        });

        var createResource = function(url) {
            resource = $resource(url, {id : "@id"}, {
                get     : {method: "GET", isArray: false},
                create  : {method: "POST", isArray: false, headers:{"Content-Type" : "application/json"}},
                edit    : {method: "PUT", isArray: false, headers:{"Content-Type" : "application/json"}},
                delete  : {method: "DELETE", isArray: false}
            });
        };

        //Function to get the list of documents based on a query
        var extractDocumentsList = function(response) {
            return {
                "documentsList" : response._embedded.item,
                "documentCount" : response.total,
                "createTemplate" : extractCreatePostDetails(response)
            };
        };

        var extractEditDetails = function(response) {
            return {
                "details"       : response.body,
                "tenant"        : response.forTenant,
                "documentId"    : response.id,
                "nextBox"       : response._links["hoa:nextBox"],
                "postTemplate"  : extractEditPostDetails(response._template.edit.data[0])
            }
        };

        var extractEditPostDetails = function(response) {
            var postTemplate = {};
            angular.forEach(response, function(value){
                postTemplate[value.name] = null;
            });
            return postTemplate;
        };

        var extractCreateDetails = function(response) {
            var raw     = response._template.create.data[0];
            var details = [];
            angular.forEach(raw, function(values){
                    var template = angular.copy(values);
                    template.value = null;
                    details.push(template);
                }
            );
            return {
                "details"       : details,
                "postTemplate"  : extractCreatePostDetails(raw)
            }
        };

        var extractCreatePostDetails = function(response) {
            var postTemplate = {};
            angular.forEach(response, function(value) {
                    postTemplate[value.name] = "";
                }
            );

            postTemplate.body = {};
            postTemplate.body.previousMonth = {};
            postTemplate.body.thisMonth = {};
            postTemplate.body.summary = {};
            return postTemplate;
        };


        var makeRequest = function(documentId, documentQuery, documentData, type) {
            var deferred = $q.defer();
            var id = (documentId != null) ? {id : documentId} : documentId;
            var success = function(response) {
                deferred.resolve(response);
            };

            var error = function(response) {
                deferred.reject();
            };

            var request = function() {
                switch(type) {
                    case requestType.GET:
                        resource.get(id).$promise
                            .then(extractEditDetails, error)
                            .then(success);
                        break;
                    case requestType.QUERY:
                        resource.get(documentQuery).$promise
                            .then(extractDocumentsList, error)
                            .then(success);
                        break;
                    case requestType.EDIT:
                        resource.edit(id, documentData).$promise.then(success, error);
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
        };

        //Gets a specific document
        this.getDocument = function(id) {
            return makeRequest(id, null, null, requestType.GET);
        };

        this.getDocumentList = function(queryBox, offsetPage) {
            var limitRequest = this.getLimitRequest();
            var startPage = (offsetPage == null) ? 0 : (offsetPage * limit);
            var query = {mailbox: queryBox, offset: startPage, limit: limitRequest};
            return makeRequest(null, query, null, requestType.QUERY);
        };

        //Edits a document
        this.editDocument = function(id, documentData) {
            return makeRequest(id, null, documentData, requestType.EDIT);
        };

        //Deletes a document referenced by the id
        this.deleteDocument = function(id) {
            return makeRequest(id, null, null, requestType.DELETE);
        };

        this.createDocument = function(data) {
            return makeRequest(null, null, data, requestType.CREATE);
        };

        this.getLimitRequest = function() {
            return limit;
        };
}]);