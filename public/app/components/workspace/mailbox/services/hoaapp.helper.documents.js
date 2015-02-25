/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular.module('module.mailbox')
    .factory('helper.documents', [
        documentHelper
    ]);

/**
 * Parse server response for views
 * Parse views data for server
 * @returns {{}}
 */
function documentHelper() {
    var helper = {
        formatCreateResponse    : formatCreateResponse,
        formatEditResponse      : formatEditResponse,
        formatServerData        : formatServerData
    };

    return helper;

    function formatCreateResponse(viewModel, serverResponse) {
        return {
            'viewModel'     : viewModel,
            'serverModel'   : serverResponse._template.create.data[0]
        }
    }

    function formatEditResponse(serverResponse) {
        return {
            'viewModel'     : createEditViewModel(serverResponse),
            'serverModel'   : serverResponse._template.edit.data[0]
        }
    }

    function createEditViewModel(serverResponse) {
        return  {
            'body'      : serverResponse.body,
            'comments'  : serverResponse.comments,
            'actions' : [
                serverResponse.lastAction,
                serverResponse.preparedAction,
                serverResponse.checkedAction,
                serverResponse.approvedAction
            ],
            'nextAction'  : {
                'nextBox' : searchForBox(serverResponse, 'hoa:nextBox'),
                'prevBox' : searchForBox(serverResponse, 'hoa:prevBox')
            },
            'mailbox'     : serverResponse.mailbox,
            'amountPaid'  : serverResponse.amountPaid
        };
    }

    function searchForBox(response, boxTitle) {
        if(response.hasOwnProperty(boxTitle)) {
            return {
                'url' : response._links[boxTitle],
                'name' : response[boxTitle].name,
                'title' : response[boxTitle].title
            }
        }
        else {
            return null;
        }
    }

    /**
     * Checks for all keys inside the view model that is required by the server
     * @param editData
     */
    function formatServerData(editData) {
        var serverPostData = {};
        angular.forEach(editData.serverModel, function(value){
            if(editData.viewModel.hasOwnProperty(value.name)) {
                serverPostData[value.name] = editData.viewModel[value.name];
            }
        });
        return serverPostData;
    }
}