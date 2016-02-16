/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("app.mailbox")
    .factory("documentsHelper", documentHelper);

/**
 * Parse server response for views
 * Parse views data for server
 */
function documentHelper(mailboxParam, roundOff) {
    var helper = {
        formatCreateResponse : formatCreateResponse,
        formatEditResponse   : formatEditResponse,
        formatServerData     : formatServerData,
        formatDocumentList   : formatListResponse,
        getQueryParameters   : getQueryParameters,
        formatParameters     : formatParameters,
        formatPaidPostData   : formatPaidPostData,
        resolveViewer        : resolveViewer,
        summation            : summation
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
            "assigned"   : serverResponse.assigned,
            "nextAction" : {
                "nextBox" : searchForBox(serverResponse, "hoa:nextBox"),
                "prevBox" : searchForBox(serverResponse, "hoa:prevBox")
            },
            forMonth     : serverResponse.forMonth,
            "actions"    : {
                last     : serverResponse.lastAction,
                prepared : serverResponse.preparedAction,
                checked  : serverResponse.checkedAction,
                approved : serverResponse.approvedAction
            },

            "mailbox"    : serverResponse.mailbox,
            "amountPaid" : serverResponse.amountPaid,
            "amounts"    : serverResponse.amounts,
            "documentId" : serverResponse.id,
            "tenant"     : serverResponse._embedded.tenant,
            "links"      : serverResponse._links,
            "year"       : serverResponse.year,
            "month"      : serverResponse.month,
            "serialId"   : serverResponse.serialId
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
            mailbox    : mailboxParam.drafts, //defaults to drafts
            limit      : 10,
            offset     : 0,
            forTenant  : null,
            creator    : null,
            assigned   : null,
            isPaid     : null,
            others     : false,
            isAssigned : false,
            year       : null,
            month      : null
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

    function formatPaidPostData(amounts, amountPaid, comments) {
        angular.forEach(amounts.current.sections, function(section) {
            if (amountPaid.current.hasOwnProperty(section.name)) {
                amountPaid.current[section.name] = section.amounts.paid;
            }
        });

        angular.forEach(amounts.previous.sections, function(section) {
            if (amountPaid.previous.hasOwnProperty(section.name)) {
                amountPaid.previous[section.name] = section.amounts.paid;
            }
        });


        return {
            amountPaid : amountPaid,
            comments   : comments
        }
    }

    function resolveViewer(document) {
        if (document.mailbox == 'drafts') {
            return "workspace.viewer.editable";
        }
        else if (document.mailbox == 'forChecking' || document.mailbox == 'forApproval') {
            return "workspace.viewer.readonly";
        }
        else {
            return "workspace.viewer.print";
        }
    }

    function summation(previous, current) {
        var prevTotal = 0;
        var currTotal = 0;

        angular.forEach(previous.sections, function(section) {
            prevTotal += section.sectionTotal.value;
        });

        angular.forEach(current.sections, function(section) {
            currTotal += section.sectionTotal.value;
        });

        prevTotal = roundOff(prevTotal, 2);
        currTotal = roundOff(currTotal, 2);

        return {
            previousTotal : prevTotal,
            currentTotal  : currTotal,
            summaryTotal  : prevTotal + currTotal
        }
    }

    //endregion
}
documentHelper.$inject = ["mailboxQueryParams", "numPrecisionFilter"];