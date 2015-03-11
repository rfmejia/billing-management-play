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

function mailboxModuleConfig($stateProvider) {

    var create = {
        url     : "create",
        resolve : {
            documentsService : "documents.service",
            tenantsService   : "service.hoatenants",
            templatesService : "service.hoatemplates",
            documentsHelper  : 'documents.helper',
            listResponse     : function(tenantsService, templatesService, documentsService, $q) {
                var deferred = $q.defer();
                var tenantsPromise = tenantsService.getList();
                var templatesPromise = templatesService.getLocal();
                var documentsPromise = documentsService.getDocumentList(null, 0);
                var success = function(response) {
                    deferred.resolve(response);
                };

                $q.all([tenantsPromise, templatesPromise, documentsPromise])
                    .then(success);
                return deferred.promise;
            },
            tenantsList      : function(listResponse) {
                return listResponse[0];
            },
            template         : function(documentsHelper, listResponse) {
                return documentsHelper.formatCreateResponse(listResponse[1], listResponse[2]);
            }

        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/create/document-create.html",
                controller  : "controller.create as documentCreate"
            }
        }
    };

    //region WORKSPACE.LIST
    var list = {
        url      : 'list?mailbox&limit&offset&forTenant&creator&assigned&forMonth&isPaid&isAssigned&others',
        views    : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/list/documents-list.html",
                controller  : "controller.documents as draftsCtrl"
            }
        },
        abstract : true,
        template : '<ui-view/>',
        resolve  : {
            documentsService    : "documents.service",
            documentsHelper     : "documents.helper",
            userService         : "service.hoacurrentuser",
            requestedParameters : function($stateParams, documentsHelper) {
                var queryParams = documentsHelper.getQueryParameters();
                for (var key in $stateParams) {
                    if ($stateParams[key] == "true") {
                        queryParams[key] = true;
                    }
                    else if ($stateParams[key] == "false") {
                        queryParams[key] = false;
                    }
                    else {
                        queryParams[key] = $stateParams[key];
                    }
                }
                return queryParams;
            },
            response            : function(documentsService, requestedParameters, userService, $q) {
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
            documentsResponse   : function(response) {
                return response[0]
            },
            userDetails         : function(response) {
                return response[1];
            }

        }
    };


    var draftsList = {url : "/drafts", data: {title : "Drafts"}};
    var forCheckingList = {url : "/forChecking", data: {title : "For checking"}};
    var forApprovalList = {url : "/forApproval", data: {title : "For approval"}};
    var forSendingList = { url :  "/forSending", data : {title : 'Ready for sending'}};
    //endregion

    //region WORKSPACE.DOC
    var editView = {
        url     : "edit/:id",
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/drafts/document-drafts.html",
                controller  : "controller.drafts as drafts"
            }
        },
        resolve : {
            documentsService  : "documents.service",
            userService       : "service.hoacurrentuser",
            tenantsService    : "service.hoatenants",
            documentsHelper   : 'documents.helper',
            tenantHelper     : "helper.tenant",
            apiResponse       : function(documentsService, userService, $stateParams, $q) {
                var deferred = $q.defer();
                var documentsPromise = documentsService.getDocument($stateParams.id);
                var userPromise = userService.getUserDetails();
                var success = function(response) {
                    deferred.resolve(response);
                };

                $q.all([documentsPromise, userPromise]).then(success);
                return deferred.promise;
            },
            documentsResponse : function(apiResponse, documentsHelper) {
                return documentsHelper.formatEditResponse(apiResponse[0]);
            },
            userResponse      : function(apiResponse) {
                return apiResponse[1];
            },
            tenantsRequest   : function(tenantsService, documentsResponse) {
                return tenantsService.getTenant(documentsResponse.viewModel.tenant.id);
            },
            tenantsResponse : function(tenantsRequest, tenantHelper) {
                return tenantHelper.formatResponse(tenantsRequest);
            }
        }
    };

    var fixedView = {
        url     : 'view/:id',
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/approvals/document-approvals.html",
                controller  : "controller.approvals as approvals"
            }
        },
        resolve : {
            documentsService  : "documents.service",
            userService       : "service.hoacurrentuser",
            tenantsService    : "service.hoatenants",
            documentsHelper   : 'documents.helper',
            tenantHelper     : "helper.tenant",
            apiResponse       : function(documentsService, userService, $stateParams, $q) {
                var deferred = $q.defer();
                var documentsPromise = documentsService.getDocument($stateParams.id);
                var userPromise = userService.getUserDetails();
                var success = function(response) {
                    deferred.resolve(response);
                };

                $q.all([documentsPromise, userPromise]).then(success);
                return deferred.promise;
            },
            documentsResponse : function(apiResponse, documentsHelper) {
                console.log("test2");
                return documentsHelper.formatEditResponse(apiResponse[0]);
            },
            userResponse      : function(apiResponse) {
                return apiResponse[1];
            },
            tenantsRequest   : function(tenantsService, documentsResponse) {
                return tenantsService.getTenant(documentsResponse.viewModel.tenant.id);
            },
            tenantsResponse : function(tenantsRequest, tenantHelper) {
                return tenantHelper.formatResponse(tenantsRequest);
            }

        }
    };

    var printView = {
        url     : 'printView/:id',
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/sending/document-sending.html",
                controller  : "controller.print as printCtrl"
            }
        },
        resolve : {
            documentsService  : "documents.service",
            documentsHelper   : "documents.helper",
            apiResponse       : function(documentsService, $stateParams) {
                return documentsService.getDocument($stateParams.id);
            },
            documentsResponse : function(apiResponse, documentsHelper) {
                return documentsHelper.formatEditResponse(apiResponse);
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
        .state("workspace.pending.for-sending", forSendingList)
        .state("workspace.fixed-view", fixedView)
        .state("workspace.edit-view", editView)
        .state("workspace.print-view", printView);

}