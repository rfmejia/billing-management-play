angular
    .module('module.mailbox')
    .factory('service.hoadocuments', [
        'helper.comments',
        '$q',
        '$resource',
        'service.hoalinks',
        documentsApi
    ]);

function documentsApi(commentsParser, $q, $resource, hoalinks) {
    var service = {
        getDocument         : getDocument,
        getDocumentList     : getDocumentList,
        editDocument        : editDocument,
        deleteDocument      : deleteDocument,
        createDocument      : createDocument,
        getLimitRequest     : getLimitRequest,
        moveToBox           : moveToBox,
        formatPostData      : formatPostData
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
        var limitRequest = this.getLimitRequest();
        var startPage = (offsetPage == null) ? 0 : (offsetPage * limit);
        var query = {mailbox: queryBox, offset: startPage, limit: limitRequest};
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

        this.editDocument(id, data)
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

    //Function to get the list of documents based on a query
    function extractDocumentsList(response) {
        return {
            "documentsList" : response._embedded.item,
            "documentCount" : response.total,
            "createTemplate" : extractCreatePostDetails(response)
        };
    }

    function extractEditDetails(response) {
        return {
            "details"       : response.body,
            "title"         : response.title,
            "documentId"    : response.id,
            "forTenant"     : response.forTenant,
            "forMonth"      : response.forMonth,
            "nextBox"       : response._links["hoa:nextBox"],
            "prevBox"       : response._links["hoa:prevBox"],
            "postTemplate"  : extractEditPostDetails(response)
        }
    }

    function extractEditPostDetails(response) {
        var template = {};
        if(response._template.edit == undefined) template = response._template.create.data[0];
        else template = response._template.edit;
        var postTemplate = {};
        angular.forEach(template, function(value){
            console.log(value);
            postTemplate[value.name] = null;
        });
        return postTemplate;
    };

    function extractCreateDetails(response) {
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
    }

    function extractCreatePostDetails(response) {
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
    }

    function makeRequest(documentId, documentQuery, documentData, type) {
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
                    console.log(id);
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


    /**
     * Allows objects using this service to provide the needed details and the service will format it in an acceptable form by the server.
     * @param forMonth YYYY-MMMM
     * @param forTenant tenant id of the document
     * @param previous previous billing information
     * @param thisMonth  this month's billing information
     * @param title generated title for the document
     * @param summary summary of the billing info
     * @param currentComment comments attached to the current workflow phase
     * @param previousComments previous comments in other phases of the workflow
     * @returns {{body: {summary: {}, breakdown: {previous: {}, thisMonth: {}}}, forTenant: string, forMonth: string, title: string, name: string, docType: string}}
     */
    function formatPostData(forMonth, forTenant, previous, thisMonth, title, summary, currentComment, previousComments) {
        var postTemplate = {
            "body" : {
                "summary" : {},
                "breakdown" : {
                    "previous" : {},
                    "thisMonth" : {}
                }
            },
            "forTenant" : "",
            "forMonth" : "",
            "title" : "",
            "name": "Statement of Account 1",
            "docType": "invoice-1"
        };

        postTemplate.forMonth = forMonth;
        postTemplate.forTenant = forTenant;
        postTemplate.title = title;
        postTemplate.body.breakdown.previous = previous;
        postTemplate.body.breakdown.thisMonth = thisMonth;
        postTemplate.body.summary = summary;
        postTemplate.comments= commentsParser.parseComments(currentComment, previousComments);
        return postTemplate;
    }
}