/**
 * Created by juancarlos.yu on 3/22/15.
 */
angular.module("app.mailbox").config(mailboxConfig);

function mailboxConfig($stateProvider) {
    var create = {
        url     : "create",
        resolve : {
            createDocsData : createGetData,
            tenantsList    : createGetTenants,
            docsTemplate   : createGetDocumentTemplate
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/create/document-create.html",
                controller  : "createController as documentCreate"
            }
        }
    };

    var list = {
        abstract : true,
        url      : 'list?mailbox&limit&offset&forTenant&creator&assigned&forMonth&isPaid&isAssigned&others&filterId',
        template : "<ui-view/>",
        resolve  : {
            documentsResponse : listGetDocuments
        },
        views    : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/list/documents-list.html",
                controller  : "documentsListController as docsList"
            }
        }
    };

    var draftsList = {url : "/drafts", data : {title : "Drafts"}};
    var forCheckingList = {url : "/forChecking", data : {title : "For checking"}};
    var forApprovalList = {url : "/forApproval", data : {title : "For approval"}};
    var forSendingList = {url : "/forSending", data : {title : 'Ready for sending'}};

    var viewer = {
        abstract : true,
        url      : "viewer/:id",
        template : "<ui-view/>",
        resolve  : {
            apiDocResponse   : makeApiCallDocs,
            documentResponse : parseDocumentResponse,
            apiTenantRequest : getTenant,
            tenantResponse   : parseTenantResponse
        }
    };

    var editableView = {
        url   : "/edit",
        views : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/drafts/document-drafts.html",
                controller  : "draftsController as drafts"
            }
        }
    };

    var readOnlyView = {
        url     : '/readonly',
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/approvals/document-approvals.html",
                controller  : "approvalsController as approvals"
            }
        }
    };

    var printView = {
        url : "/print",
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/mailbox/sending/document-sending.html",
                controller  : "printController as printCtrl"
            }
        }
    };

    $stateProvider
        .state("workspace.create", create)
        .state("workspace.pending", list)
        .state("workspace.viewer", viewer)
        .state("workspace.pending.drafts", draftsList)
        .state("workspace.pending.for-checking", forCheckingList)
        .state("workspace.pending.for-approval", forApprovalList)
        .state("workspace.pending.for-sending", forSendingList)
        .state("workspace.viewer.readonly", readOnlyView)
        .state("workspace.viewer.editable", editableView)
        .state("workspace.viewer.print", printView);
}
mailboxConfig.$inject = ["$stateProvider"];


//region RESOLVE_FUNCTIONS_CREATE
function createGetData($q, docsSrvc, tenantsSrvc, templatesSrvc) {
    var deferred = $q.defer();
    var tenantsPromise = tenantsSrvc.getAllTenants();
    var templatesPromise = templatesSrvc.getLocal();
    var docsPromise = docsSrvc.getDocumentList(null, 0);

    var success = function(response) {
        deferred.resolve(response);
    };

    var error = function(error) {
        //TODO: error message
    };

    $q.all([tenantsPromise, templatesPromise, docsPromise]).then(success, error);

    return deferred.promise;
}
createGetData.$inject = ["$q", "documentsApi", "tenantsApi", "templateApi"];

function createGetTenants(createDocsData) {
    return createDocsData[0];
}
createGetTenants.$inject = ["createDocsData"];

function createGetDocumentTemplate(docsHelper, createDocsData) {
    return docsHelper.formatCreateResponse(createDocsData[1], createDocsData[2]);
}
createGetDocumentTemplate.$inject = ["documentsHelper", "createDocsData"];
//endregion

//region RESOLVE_FUNCTIONS_LIST
function listGetDocuments($q, $stateParams, docsSrvc) {
    var deferred = $q.defer();
    var success = function(response) {
        deferred.resolve(response);
    };
    var error = function(error) {
        //TODO: show error
    };
    docsSrvc.getDocumentList($stateParams).then(success, error);

    return deferred.promise;
}
listGetDocuments.$inject = ["$q", "$stateParams", "documentsApi"];

//endregion

//region RESOLVE_FUNCTIONS_VIEWER
function makeApiCallDocs($stateParams, $q, docsSrvc) {

    var deferred = $q.defer();
    var success = function(response) {
        deferred.resolve(response);
    };

    var error = function(error) {
        //TODO: show error message
        deferred.reject(error);
    };
    docsSrvc.getDocument($stateParams.id).then(success, error);

    return deferred.promise
}
makeApiCallDocs.$inject = ["$stateParams", "$q", "documentsApi"];

function parseDocumentResponse(apiDocResponse, docsHelper) {
    return docsHelper.formatEditResponse(apiDocResponse);
}
parseDocumentResponse.$inject = ["apiDocResponse", "documentsHelper"];

function getTenant(tenantsSrvc, docsResponse) {
    return tenantsSrvc.getTenant(docsResponse.viewModel.tenant.id)
}
getTenant.$inject = ["tenantsApi", "documentResponse"];

function parseTenantResponse(apiTenantRequest, tenantHelper) {
    return tenantHelper.formatResponse(apiTenantRequest);
}
parseTenantResponse.$inject = ["apiTenantRequest", "tenantHelper"];

//endregion

