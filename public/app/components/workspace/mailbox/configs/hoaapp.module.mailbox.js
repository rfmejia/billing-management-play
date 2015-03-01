var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"
]);

angular
    .module('module.mailbox')
    .config([
        '$stateProvider',
        mailboxModuleConfig
    ]);

function mailboxModuleConfig ($stateProvider) {

    var create = {
        url     : "create",
        resolve : {
            documentsService    : "service.hoadocuments",
            tenantsService      : "service.hoatenants",
            templatesService    : "service.hoatemplates",
            documentsHelper     : 'helper.documents',
            listResponse         : function (tenantsService, templatesService, documentsService, $q) {
                var deferred = $q.defer();
                var tenantsPromise   = tenantsService.getList();
                var templatesPromise = templatesService.getLocal();
                var documentsPromise = documentsService.getDocumentList(null, 0);
                var success = function(response) {
                    deferred.resolve(response);
                };

                $q.all([tenantsPromise, templatesPromise, documentsPromise])
                    .then(success);
                return deferred.promise;
            },
            tenantsList         : function(listResponse) {
                return listResponse[0];
            },
            template            : function(documentsHelper, listResponse) {
                return documentsHelper.formatCreateResponse(listResponse[1], listResponse[2]);
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
        url:'list?mailbox&limit&offset&forTenant&creator&assigned&forMonth&isPaid&isAssigned&others',
        abstract    : true,
        template    : '<ui-view/>',
        resolve     : {
            documentsService    : "service.hoadocuments",
            documentsHelper     : "helper.documents",
            userService         : "service.hoacurrentuser",
            requestedParameters     : function($stateParams, documentsHelper) {
                var queryParams = documentsHelper.getQueryParameters();
                for(var key in $stateParams) {
                    if($stateParams[key] == "true") queryParams[key] = true;
                    else if($stateParams[key] == "false") queryParams[key] = false;
                    else queryParams[key] = $stateParams[key];
                }
                return queryParams;
            },
            response                : function(documentsService, requestedParameters, userService, $q) {
                var deferred = $q.defer();
                var documentsPromise = documentsService.getDocumentList(requestedParameters);
                var currentUserPromise = userService.getUserDetails();
                var success = function(response) {
                    deferred.resolve(response);
                };

                $q.all([documentsPromise, currentUserPromise])
                    .then(success);
                return deferred.promise;
            },
            documentsResponse       : function(response) {
                return response[0]
            },
            userDetails             : function(response) {
                return response[1];
            }

        }
    };

    var draftsList = {
        url   : "/drafts",
        views : {
            "contentArea@workspace": {
                templateUrl : "app/components/workspace/mailbox/views/maincontent-list-drafts.html",
                controller  : "controller.documents as draftsCtrl"
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
                controller  : "controller.drafts as drafts"
            }
        },
        resolve : {
            documentsService        : "service.hoadocuments",
            documentsHelper         : 'helper.documents',
            documentsApiResponse    : function(documentsService, $stateParams) {
                console.log($stateParams.id);
                return documentsService.getDocument($stateParams.id);
            },
            documentsResponse       :  function(documentsApiResponse, documentsHelper) {
                return documentsHelper.formatEditResponse(documentsApiResponse);
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
            documentsHelper     : 'helper.documents',
            documentsApiResponse   : function(documentsService, $stateParams) {
                return documentsService.getDocument($stateParams.id);
            },
            documentsResponse   : function(documenetsApiResponse, documentsHelper) {
                return documentsHelper.formatEditResponse(documenetsApiResponse);
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
}
