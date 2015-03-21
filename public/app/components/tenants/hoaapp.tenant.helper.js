/**
 * Created by juancarlos.yu on 3/3/15.
 */
angular
    .module("app.tenants")
    .factory("helper.tenant", [
                 tenantHelper
             ]);

function tenantHelper() {
    var helper = {
        formatResponse : formatResponse,
        formatPostData : formatPostData
    };

    return helper;

    function formatResponse(serverResponse) {
        return {
            viewModel   : getViewModel(serverResponse),
            serverModel : getTemplate(serverResponse)
        };
    }

    function getTemplate(serverResponse) {
        var template = getViewModel(serverResponse);
        var serverModel = {};
        angular.forEach(template, function(value) {
            serverModel[value.name] = value.value;
        });

        return serverModel;
    }

    function getViewModel(serverResponse) {
        var template = {};
        if (serverResponse._template.hasOwnProperty("create")) {
            angular.forEach(serverResponse._template.create.data[0], function(detail) {
                if (detail.hasOwnProperty("value")) {
                    template.value = serverResponse[detail.name];
                }
                else {
                    detail.value = null;
                }
            });
            template = serverResponse._template.create.data[0];
        }
        else if (serverResponse._template.hasOwnProperty("edit")) {
            angular.forEach(serverResponse._template.edit.data[0], function(detail) {
                if (detail.hasOwnProperty("value")) {
                    detail.value = serverResponse[detail.name];
                }
                else {
                    detail.value = null;
                }
            });
            template = serverResponse._template.edit.data[0];
        }
        return template
    }

    function formatPostData(data) {
        var postData = {};
        angular.forEach(data.viewModel, function(value) {
            if(data.serverModel.hasOwnProperty(value.name)) {
                postData[value.name] = value.value;
            }
        });
        return postData;
    }
}