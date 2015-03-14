/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("module.mailbox")
    .factory("documents.helper", [
                 documentHelper
             ]);

/**
 * Parse server response for views
 * Parse views data for server
 * @returns {{}}
 */
function documentHelper() {
    var helper = {
        formatCreateResponse : formatCreateResponse,
        formatEditResponse   : formatEditResponse,
        formatServerData     : formatServerData,
        formatDocumentList   : formatListResponse,
        getQueryParameters   : getQueryParameters,
        formatParameters     : formatParameters
    };
    return helper;

    //region FUNCTION_CALL
    function formatCreateResponse(viewModel, serverResponse) {
        return {
            "viewModel"   : viewModel,
            "serverModel" : serverResponse._template.create.data[0]
        }
    }

    function formatEditResponse(serverResponse) {
        return {
            "viewModel"   : createEditViewModel(serverResponse),
            "serverModel" : serverResponse._template.edit.data[0]
        }
    }

    function createEditViewModel(serverResponse) {
        return {
            "body"       : serverResponse.body,
            "comments"   : serverResponse.comments,
            "billDate"   : serverResponse.forMonth,
            "assigned"   : serverResponse.assigned,
            "nextAction" : {
                "nextBox" : searchForBox(serverResponse, "hoa:nextBox"),
                "prevBox" : searchForBox(serverResponse, "hoa:prevBox")
            },
            "actions"    : {
                last     : serverResponse.lastAction,
                prepared : serverResponse.preparedAction,
                checked  : serverResponse.checkedAction,
                approved : serverResponse.approvedAction
            },

            "mailbox"       : serverResponse.mailbox,
            "amountPaid"    : serverResponse.amountPaid,
            "documentId"    : serverResponse.id,
            "documentTitle" : serverResponse.documentTitle,
            "tenant"        : serverResponse._embedded.tenant,
            "links"         : serverResponse._links
        };
    }

    function searchForBox(response, boxTitle) {
        if (response[boxTitle] == null) {
            return null;
        }
        else {
            return {
                "url"   : response._links[boxTitle].href,
                "name"  : response[boxTitle].name,
                "title" : response[boxTitle].title
            };
        }
    }

    function formatListResponse(serverResponse) {
        return {
            "viewModel" : {
                "list"          : serverResponse._embedded.item,
                "documentCount" : serverResponse.total
            },
            serverModel : null
        }
    }

    /**
     * Checks for all keys inside the view model that is required by the server
     * @param editData
     */
    function formatServerData(editData) {
        var serverPostData = {};
        angular.forEach(editData.serverModel, function(value) {
            if (editData.viewModel.hasOwnProperty(value.name)) {
                serverPostData[value.name] = editData.viewModel[value.name];
            }
        });
        return serverPostData;
    }

    function getQueryParameters() {
        return {
            mailbox    : "drafts", //defaults to drafts
            limit      : 10,
            offset     : 0,
            forTenant  : null,
            creator    : null,
            assigned   : null,
            forMonth   : null,
            isPaid     : null,
            others     : false,
            isAssigned : false
        };
    }

    function formatParameters(parameters) {
        var queryParameters = {};
        for (var key in parameters) {
            if (parameters.hasOwnProperty(key) && parameters[key] != null) {
                queryParameters[key] = parameters[key];
            }
        }
        return queryParameters;
    }

    //endregion

}