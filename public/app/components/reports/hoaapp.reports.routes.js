/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("app.reports")
    .config(config);

function config($stateProvider, reportsRoutes) {
    var reports = {
        url     : "reports?year&month&limit&offset",
        resolve : {
            documentsList   : unparsedDocumentsList,
            unparsedReport  : getReport,
            reportResponse  : parseReport
        },
        views   : {
            "contentArea@workspace" : {
                templateUrl : "app/components/reports/reports.html",
                controller  : "reportsController as ctrl"
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
                controller  : "reportUpdateController as updateCtrl"
            }
        }
    };

    $stateProvider
        .state(reportsRoutes.report, reports)
        .state(reportsRoutes.reportUpdate, reportUpdate);
}
config.$inject = ["$stateProvider", "REPORTS_ROUTES"];

//region LIST
function unparsedDocumentsList($stateParams, docsHelper, docsSrvc, mailboxParams, dateUtils) {
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
    return docsSrvc.getDocumentList(queryParams);
}
unparsedDocumentsList.$inject = ["$stateParams", "documentsHelper", "documentsApi", "mailboxQueryParams", "nvl-dateutils"];

function getReport($stateParams, reportsService, reportsHelper) {
    var queryParams = $stateParams;
    if (angular.equals({}, queryParams)) {
        queryParams = reportsHelper.getQueryParams();
    }
    return reportsService.getReport(queryParams);
}
getReport.$inject = ["$stateParams", "reports.service", "reports.helper"];

function parseReport(apiResponse, reportsHelper) {
    return reportsHelper.parseReports(apiResponse);
}
parseReport.$inject = ["unparsedReport", "reports.helper"];
//endregion

//region VIEW
function getDocument($stateParams, docsSrvc) {
    return docsSrvc.getDocument($stateParams.id);
}
getDocument.$inject = ["$stateParams", "documentsApi"];

function parseDocument(docsHelper, response) {
    return docsHelper.formatEditResponse(response);
}
parseDocument.$inject = ["documentsHelper", "unparsedDocument"];

//endregion

