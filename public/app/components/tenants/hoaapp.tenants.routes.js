/**
 * Created by juancarlos.yu on 3/22/15.
 */
angular.module("app.tenants").config(tenantsRoutes);

function tenantsRoutes($stateProvider) {
    var tenantsList = {
        url     : "tenants?offset&limit",
        resolve : {
            tenantsList : tenantsGetTenantList
        },
        data    : {
            title : "Tenants list"
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/tenants/list/tenants-list.html",
                controller  : "tenantsListController as viewCtrl"
            }
        }
    };

    var tenantCreate = {
        url     : "tenantCreate",
        resolve : {
            createTemplate    : tenantsGetTenantList,
            createTenantModel : parseCreateTemplate
        },
        data    : {
            title : "Create tenant entry"
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/tenants/create/tenant-create.html",
                controller  : "tenantCreateController as createCtrl"
            }
        }
    };

    var tenantView = {
        url     : "tenant-view/:id?limit&offset&filterId&mailbox&isPaid",
        resolve : {
            tenantDocs       : getTenantDocs,
            viewTenantModel  : getTenantModel
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/tenants/view/tenant-view.html",
                controller  : "tenantViewCtrl as viewCtrl"
            }
        },
        data    : {
            title : "Tenant"
        }
    };

    var tenantEdit = {
        url     : "/edit",
        resolve : {
            editTenantModel : getTenantModel
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/tenants/edit/tenant-edit.html",
                controller  : "tenantEditController as editTenantCtrl"
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

tenantsRoutes.$inject = ["$stateProvider"];

//region FUNCTION_CALL
function tenantsGetTenantList($stateParams, tenantsSrvc) {
    return tenantsSrvc.getAllTenants();
}
tenantsGetTenantList.$inject = ["$stateParams", "tenantsApi"];

function parseCreateTemplate(createTemplate, tenantHelper) {
    return tenantHelper.formatResponse(createTemplate);
}
parseCreateTemplate.$inject = ["createTemplate", "tenantHelper"];

function getTenantDocs($q, $stateParams, docsSrvc) {
    var deferred = $q.defer();
    var params = {};
    angular.forEach($stateParams, function(value, key) {
        params[key] = value;
    });
    params.forTenant = $stateParams.id;
    delete params.id;
    delete params.filterId;
    var success = function(response) {
        deferred.resolve(response);
    };

    var error = function(error) {
        deferred.reject(error)
    };

    docsSrvc.getDocumentList(params).then(success, error);

    return deferred.promise;
}
getTenantDocs.$inject = ["$q", "$stateParams", "documentsApi"];


function getTenantModel($q, $stateParams, tenantsSrvc, tenantHelper) {
    var deferred = $q.defer();
    var success = function(response) {
        deferred.resolve(response);
    };

    var error = function(error) {
        deferred.reject(error)
    };

    var parse = function(response) {
       return tenantHelper.formatResponse(response);
    };

    tenantsSrvc.getTenant($stateParams.id).then(parse, error).then(success);

    return deferred.promise;
}
getTenantModel.$inject = ["$q", "$stateParams", "tenantsApi", "tenantHelper"];
//endregion