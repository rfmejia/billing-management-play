var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {

         var documents = {
            url   : "documents",
            views : {
                "contentArea@workspace": {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-mailbox.html",
                    controller  : "controller.documents"
                }
            },
            params : {mailbox : null, offset: 0},
            resolve : {
                documentsService    : "service.hoadocuments",
                documentMailbox     : function($stateParams) {
                    return $stateParams.mailbox;
                },
                documentsList       : function(documentsService, documentMailbox) {
                    return documentsService.getDocumentList(documentMailbox);
                }
            }

        };

        var create = {
            url     : "create",
            resolve : {
                documentsService    : "service.hoadocuments",
                tenantsService      : "service.hoatenants",
                templatesService    : "service.hoatemplates",
                response            : function (tenantsService, templatesService, documentsService, $q) {
                    var deferred = $q.defer();
                    var tenantsPromise   = tenantsService.getList();
                    var templatesPromise = templatesService.getLocal();
                    var documentsPromise = documentsService.getDocumentList(null);
                    var success = function(response) {
                        deferred.resolve(response);
                    };

                    $q.all([tenantsPromise, templatesPromise, documentsPromise])
                        .then(success);

                    return deferred.promise;
                },
                tenantsList         : function(response) {
                    return response[0];
                },
                template            : function(response) {
                    return response[1];
                },
                documentsResponse   : function(response) {
                    return response[2];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-create.html",
                    controller  : "controller.create"
                }
            }
        };

        var edit = {
            url     : "edit/:id",
            resolve : {
                documentsService    : "service.hoadocuments",
                tenantsService      : "service.hoatenants",
                templatesService    : "service.hoatemplates",
                response            : function(tenantsService, templatesService, documentsService, $q, $stateParams) {
                    var deferred = $q.defer();
                    var tenantsPromise = tenantsService.getList();
                    var documentsPromise = documentsService.getDocument($stateParams.id);

                    var success = function(response) {
                        deferred.resolve(response);
                    };

                    $q.all([tenantsPromise, documentsPromise])
                        .then(success);
                    return deferred.promise;
                },
                tenantsList         : function(response) {
                    return response[0];
                },
                document            : function(response) {
                    return response[1];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-create.html",
                    controller  : "controller.edit"
                }
            }
        };

        $stateProvider
            .state("workspace.create",                 create)
            .state("workspace.edit",                   edit)
            .state("workspace.documents",              documents);
    }]);

