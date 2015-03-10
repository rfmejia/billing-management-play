/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .config(config);

config.$inject = ["$stateProvider"];
function config($stateProvider) {
    var reports = {
        url     : "reports",
        resolve : {
            documentsHelper  : getDocumentsHelper,
            documentsService : getDocumentsService,
            apiResponse      : getDocumentsList,
            documentsList    : parseApiResponse
        },
        views : {
            "contentArea@workspace" : {
                templateUrl : "app/components/reports/reports.html",
                controller  : "reportsCtrl as ctrl"
            }
        },
        data : {title : "Reports"}
    };

    $stateProvider
        .state("workspace.reports", reports);
}


getDocumentsHelper.$inject = ["documents.helper"];
function getDocumentsHelper(docsHelper) {
    return docsHelper;
}

getDocumentsService.$inject = ["documents.service"];
function getDocumentsService(docsService) {
    return docsService;
}

getDocumentsList.$inject = ["documentsHelper", "documentsService"];
function getDocumentsList(docsHelper, docsService) {
    return docsService.getDocumentList();
}

parseApiResponse.$inject = ["documentsHelper", "apiResponse"];
function parseApiResponse(docsHelper, apiResponse) {
    return docsHelper.formatDocumentList(apiResponse);
}


