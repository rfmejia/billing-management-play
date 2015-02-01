var documents = angular.module("hoaApp");


documents.service('service.hoadocuments', ['$resource', '$q', 'service.hoalinks',
	function($resource, $q, hoalinks){
        var resource		= null;
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
                "createTemplate" : extractCreateTemplate(response)
            };
        };

        var extractCreateTemplate = function(response) {
            var raw     = response._template.create.data[0];
            var details = [];
            angular.forEach(raw,
                function(values){
                    var template = angular.copy(values);
                    template.value = null;
                    details.push(template);
                }
            );

            return {
                "details" : details,
                "postTemplate" : extractPostTemplate(raw)
            }
        };

        var extractPostTemplate = function(response) {
            var postTemplate = {};
            angular.forEach(response,
                function(value) {
                    postTemplate[value.name] = "";
                }
            );
            return postTemplate;
        };


        var makeRequest = function(documentId, documentQuery, documentData, type) {
            var deferred = $q.defer();
            var id = (documentId != null) ? {id : documentId} : documentId;
            var success = function(response) {
                deferred.resolve(response);
            };

            var error = function(response) {
                console.log(response);
                deferred.reject();
            };

            var request = function() {
                switch(type) {
                    case requestType.GET:
                        resource.get(id).$promise.then(success, error);
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

        this.getDocumentList = function(query) {
            return makeRequest(null, query, null, requestType.QUERY);
        };;

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
        }
}]);