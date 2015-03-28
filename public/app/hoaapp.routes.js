'use strict';

angular.module("hoa-app").config(routes);

function routes($stateProvider) {
    var authenticate = {
        url : "/login"
    };

    var workspace = {
        url     : "/",
        resolve : {
            apiLinks      : getApiLinks,
            workspaceData : getWorkspaceData,
            mailboxes     : getMailboxes,
            userDetails   : getUserDetails
        },
        views   : {
            "rootView@"         : {
                templateUrl : "app/components/layout/workspace.html",
                controller  : "workspaceController as workspace"
            },
            "sidebar@workspace" : {
                templateUrl : "app/components/layout/sidebar.html",
                controller  : "sidebarController as sidebar"
            }
        }
    };

    $stateProvider
        .state("authenticate", authenticate)
        .state("workspace", workspace);
}
routes.$inject = ["$stateProvider"];

////region FUNCTION_CALL
/**
 * Important to inject this to all routes, otherwise links could be null.
 * @param linksApi
 * @returns {*}
 */
function getApiLinks(linksApi) {
    return linksApi.getLinks();
}
getApiLinks.$inject = ["linksApi"];

function getWorkspaceData($q, mailboxApi, userApi) {
    var deferred = $q.defer();

    var mailboxPromise = mailboxApi.getLocal();
    var userPromise = userApi.getUserDetails();

    var success = function(response) {
        deferred.resolve(response);
    };

    var error = function(error) {
        deferred.reject(error);
    };

    $q.all([mailboxPromise, userPromise]).then(success, error);

    return deferred.promise;
}
getWorkspaceData.$inject = ["$q", "mailboxService", "userApi"];

function getMailboxes(workspaceData) {
    return workspaceData[0];
}
getMailboxes.$inject = ["workspaceData"];

function getUserDetails(workspaceData) {
    return workspaceData[1];
}
getUserDetails.$inject = ["workspaceData"];

//endregion