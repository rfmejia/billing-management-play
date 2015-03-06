angular.module("module.tenants", []);

angular
    .module("module.tenants")
    .config([
                "$stateProvider",
                tenantsConfig
            ]);

function tenantsConfig($stateProvider) {
    var tenantsList = {
        url     : "tenants",
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/workspace/tenants/views/maincontent-tenants-list.html",
                controller  : "controller.tenantslist as viewCtrl"
            }
        },
        resolve : {
            tenantsService : "service.hoatenants",
            apiResponse    : function(tenantsService) {
                return tenantsService.getList();
            }
        },
        data    : {
            title : "Tenants list"
        }
    };

    var tenantCreate = {
        url     : "tenantCreate",
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/workspace/tenants/views/maincontent-tenant-create.html",
                controller  : "controller.tenantcreate as createCtrl"
            }
        },
        resolve : {
            tenantsService : "service.hoatenants",
            tenantHelper   : "helper.tenant",
            apiResponse    : function(tenantsService) {
                return tenantsService.getList();
            },
            tenantModel    : function(tenantHelper, apiResponse) {
                return tenantHelper.formatResponse(apiResponse);
            }
        },
        data    : {
            title : "Create tenant entry"
        }
    };

    var tenantView = {
        url     : "tenant-view/:id",
        resolve : {
            tenantsService   : "service.hoatenants",
            documentsService : "service.hoadocuments",
            documentsHelper  : "helper.documents",
            tenantHelper     : "helper.tenant",
            requestedParams  : function(documentsHelper, $stateParams) {
                var queryParams = documentsHelper.getQueryParameters();
                if (queryParams.hasOwnProperty("others")) queryParams.others = null;
                if (queryParams.hasOwnProperty("mailbox")) queryParams.mailbox = null;
                if (queryParams.hasOwnProperty("isAssigned")) queryParams.isAssigned = null;
                if (queryParams.hasOwnProperty("forTenant")) queryParams.forTenant = $stateParams.id;
                return queryParams;
            },
            apiResponse      : function(documentsService, tenantsService, $stateParams, $q, requestedParams) {
                var deferred = $q.defer();
                var documentsPromise = documentsService.getDocumentList(requestedParams);
                var tenantsPromise = tenantsService.getTenant($stateParams.id);

                function success(response) {
                    deferred.resolve(response);
                }

                $q.all([documentsPromise, tenantsPromise])
                    .then(success);

                return deferred.promise;
            },
            documents        : function(apiResponse) {
                return apiResponse[0];
            },
            tenant           : function(apiResponse, tenantHelper) {
                return tenantHelper.formatResponse(apiResponse[1]);
            }
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/workspace/tenants/views/maincontent-tenant-view.html",
                controller  : "tenantViewCtrl as viewCtrl"
            }
        },
        data    : {
            title : "Tenant"
        }
    };

    var tenantEdit = {
        url     : "/edit",
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/workspace/tenants/views/maincontent-tenant-create.html",
                controller  : "controller.tenantcreate as createCtrl"
            }
        },
        resolve : {
            tenantsService : "service.hoatenants",
            tenantHelper   : "helper.tenant",
            apiResponse    : function(tenantsService, $stateParams) {
                return tenantsService.getTenant($stateParams.id);
            },
            tenantModel    : function(tenantHelper, apiResponse) {
                return tenantHelper.formatResponse(apiResponse);
            }
        },
        data    : {
            title : "Edit tenant entry"
        }
    };

    $stateProvider
        .state("workspace.tenants-list", tenantsList)
        .state("workspace.tenant-create", tenantCreate)
        .state("workspace.tenant-view", tenantView)
        .state("workspace.tenant-view.edit", tenantEdit)
}