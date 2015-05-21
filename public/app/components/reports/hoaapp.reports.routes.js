/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("app.reports")
    .config(config);

function config($stateProvider, reportsRoutes) {
    var reports = {
        url     : "reports?year&month&limit&offset&filterId&mailbox&isPaid",
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
        url     : "update/:id",
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
function unparsedDocumentsList($stateParams, docsSrvc) {
    var params = {};
    angular.copy($stateParams, params);
    delete params.filterId;
    return docsSrvc.getDocumentList(params);
}
unparsedDocumentsList.$inject = ["$stateParams", "documentsApi"];

function getReport($stateParams, reportsService) {
    var params = {};
    params.month = $stateParams.month;
    params.year = $stateParams.year;
    return reportsService.getReport(params);
}
getReport.$inject = ["$stateParams", "reports.service"];

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

