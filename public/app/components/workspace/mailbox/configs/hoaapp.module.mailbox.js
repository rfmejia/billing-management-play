var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"
]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {

        var create = {
            url     : "create",
            resolve : {
                documentsService    : "service.hoadocuments",
                tenantsService      : "service.hoatenants",
                templatesService    : "service.hoatemplates",
                listResponse         : function (tenantsService, templatesService, documentsService, $q) {
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
                tenantsList         : function(listResponse) {
                    return listResponse[0];
                },
                template            : function(listResponse) {
                    return listResponse[1];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-create.html",
                    controller  : "controller.create"
                }
            }
        };

        //region WORKSPACE.LIST
        var list = {
            url:'list?mailbox&page',
            abstract    : true,
            template    : '<ui-view/>',
            resolve     : {
                documentsService    : "service.hoadocuments",
                documentMailbox     : function($stateParams) {
                    if(!$stateParams.mailbox) $stateParams.mailbox = 'drafts';
                    if(!$stateParams.page) $stateParams.page=0;
                    return $stateParams.mailbox;
                },
                documentsList       : function(documentsService, documentMailbox) {
                    return documentsService.getDocumentList(documentMailbox);
                },
                page                : function($stateParams) {
                    return $stateParams.page;
                }
            }
        };

        var draftsList = {
            url   : "/drafts",
            views : {
                "contentArea@workspace": {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-list-drafts.html",
                    controller  : "controller.documents"
                }
            }
        };

        var forCheckingList = {
            url   : "/forChecking",
            views : {
                "contentArea@workspace": {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-list-forchecking.html",
                    controller  : "controller.documents"
                }
            }
        };

        var forApprovalList = {
            url   : "/forApproval",
            views : {
                "contentArea@workspace": {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-list-forapproval.html",
                    controller  : "controller.documents"
                }
            }
        };
        //endregion

        //region WORKSPACE.DOC
        var editView = {
            url     : "edit/:id",
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-drafts.html",
                    controller  : "controller.drafts"
                }
            },
            resolve : {
                documentsService    : "service.hoadocuments",
                documentsResponse   : function(documentsService, $stateParams) {
                    return documentsService.getDocument($stateParams.id);
                }
            }
        };

        var fixedView = {
            url     :'view/:id',
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-document-approval.html",
                    controller  : "controller.approval"
                }
            },
            resolve : {
                documentsService    : "service.hoadocuments",
                documentsResponse   : function(documentsService, $stateParams) {
                    return documentsService.getDocument($stateParams.id);
                }
            }
        };

        //endregion

        $stateProvider
            .state("workspace.create", create)
            .state("workspace.pending", list)
            .state("workspace.pending.drafts", draftsList)
            .state("workspace.pending.for-checking", forCheckingList)
            .state("workspace.pending.for-approval", forApprovalList)
            .state("workspace.fixed-view", fixedView)
            .state("workspace.edit-view", editView);
    }]);

