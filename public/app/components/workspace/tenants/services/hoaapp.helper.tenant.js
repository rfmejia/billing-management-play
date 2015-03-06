/**
 * Created by juancarlos.yu on 3/3/15.
 */
angular
    .module("module.tenants")
    .factory("helper.tenant",[
        tenantHelper
    ]);

function tenantHelper() {
    var helper = {
        formatResponse : formatResponse
    };

    return helper;

    function formatResponse(serverResponse) {
        return {
            viewModel : getViewModel(serverResponse),
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
        console.log(serverResponse);
        if(serverResponse._template.hasOwnProperty("create")) {
            angular.forEach(serverResponse._template.create.data[0], function(detail){
                if(detail.hasOwnProperty("value"))temmplate.value = serverResponse[detail.name];
                else detail.value = null;
            });
        }
        else if(serverResponse._template.hasOwnProperty("edit")) {
            angular.forEach(serverResponse._template.edit.data[0], function(detail){
                if(detail.hasOwnProperty("value"))detail.value = serverResponse[detail.name];
                else detail.value = null;
            });
        }

        return serverResponse._template.edit.data[0];
    }
}