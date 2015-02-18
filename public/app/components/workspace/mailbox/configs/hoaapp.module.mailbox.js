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
            params : {mailbox : "Drafts", offset: 0},
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
                    var success = function(response) {
                        deferred.resolve(response);
                    };

                    $q.all([tenantsPromise, templatesPromise])
                        .then(success);
                    return deferred.promise;
                },
                tenantsList         : function(response) {
                    return response[0];
                },
                template            : function(response) {
                    return response[1];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-create.html",
                    controller  : "controller.create"
                }
            }
        };

        var drafts = {
            url     : "edit/:id",
            resolve : {
                documentsService    : "service.hoadocuments",
                templatesService    : 'service.hoatemplates',
                response            : function(documentsService, templatesService, $stateParams, $q) {
                    var deferred = $q.defer();
                    var documentsPromise = documentsService.getDocument($stateParams.id);
                    var templatesPromise = templatesService.getLocal();
                    var success = function(response){
                        deferred.resolve(response);
                    };

                    $q.all([documentsPromise, templatesPromise])
                        .then(success);

                    return deferred.promise;
                },
                documentsResponse    : function(response) {
                    return response[0];
                },
                templatesResponse    : function(response) {
                    return response[1];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-drafts.html",
                    controller  : "controller.drafts"
                }
            }
        };

        var approvals = {
            url     : "approvals/:id",
            resolve : {
                documentsService    : "service.hoadocuments",
                templatesService    : 'service.hoatemplates',
                response            : function(documentsService, templatesService, $stateParams, $q) {
                    var deferred = $q.defer();
                    var documentsPromise = documentsService.getDocument($stateParams.id);
                    var templatesPromise = templatesService.getLocal();
                    var success = function(response){
                        deferred.resolve(response);
                    };

                    $q.all([documentsPromise, templatesPromise])
                        .then(success);

                    return deferred.promise;
                },
                documentsResponse    : function(response) {
                    return response[0];
                },
                templatesResponse    : function(response) {
                    return response[1];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-approval.html",
                    controller  : "controller.approval",
                    controllerAs : 'approval'
                }
            }
        };

        $stateProvider
            .state("workspace.create",                  create)
            .state("workspace.drafts",                   drafts)
            .state("workspace.approval",               approvals)
            .state("workspace.documents",              documents);
    }]);

