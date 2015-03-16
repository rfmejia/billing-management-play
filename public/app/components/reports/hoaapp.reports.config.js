/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("module.reports")
    .config(config);

config.$inject = ["$stateProvider", "REPORTS_ROUTES"];
function config($stateProvider, reportsRoutes) {
    var reports = {
        url     : "reports?year&month",
        resolve : {
            documentsHelper      : getDocumentsHelper,
            documentsService     : getDocumentsService,
            unparsedDocumentList : unparsedDocumentsList,
            documentsList        : parseApiResponse,
            unparsedReport       : getReport,
            reportResponse       : parseReport
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/reports/reports.html",
                controller  : "reportsCtrl as ctrl"
            }
        },
        data    : {title : "Reports"}
    };

    var reportUpdate = {
        url     : "view/:id",
        resolve : {
            unparsedDocument : getDocument,
            document         : parseDocument
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/reports/report-view.html",
                controller  : "reportUpdateCtrl as updateCtrl"
            }
        }
    };

    $stateProvider
        .state(reportsRoutes.report, reports)
        .state(reportsRoutes.reportUpdate, reportUpdate);
}

//region LIST
getDocumentsHelper.$inject = ["documents.helper"];
function getDocumentsHelper(docsHelper) {
    return docsHelper;
}

getDocumentsService.$inject = ["documents.service"];
function getDocumentsService(docsService) {
    return docsService;
}

unparsedDocumentsList.$inject = ["documentsHelper", "documentsService", "MAILBOX_PARAMS", "$stateParams", "nvl-dateutils"];
function unparsedDocumentsList(docsHelper, docsService, mailboxParams, $stateParams, dateUtils) {
    var queryParams;
    if (angular.equals({}, $stateParams)) {
        queryParams = docsHelper.getQueryParameters();
        queryParams.others = null;
        queryParams.isAssigned = null;
        queryParams.year = dateUtils.getLocalYear(moment().format());
        queryParams.month = dateUtils.getLocalMonth(moment().format());
    }
    else {
        queryParams = $stateParams;
    }
    queryParams.mailbox = mailboxParams.delivered;
    return docsService.getDocumentList(queryParams);
}

parseApiResponse.$inject = ["documentsHelper", "unparsedDocumentList"];
function parseApiResponse(docsHelper, apiResponse) {
    return docsHelper.formatDocumentList(apiResponse);
}

getReport.$inject = ["reports.service", "$stateParams", "reports.helper"];
function getReport(reportsService, $stateParams, reportsHelper) {
    var queryParams = $stateParams;
    if(angular.equals({}, queryParams)) {
        queryParams = reportsHelper.getQueryParams();
    }
    return reportsService.getReport(queryParams);
}

parseReport.$inject = ["unparsedReport", "reports.helper"];
function parseReport(apiResponse, reportsHelper) {
    return reportsHelper.parseReports(apiResponse);
}
//endregion

//region VIEW
getDocument.$inject = ["documentsService", "$stateParams"];
function getDocument(docsSrvc, $stateParams) {
    return docsSrvc.getDocument($stateParams.id);
}

parseDocument.$inject = ["documentsHelper", "unparsedDocument"];
function parseDocument(docsHelper, response) {
    return docsHelper.formatEditResponse(response);
}
//endregion

