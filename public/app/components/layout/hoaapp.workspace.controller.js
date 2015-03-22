/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module("app.layout")
    .controller('workspaceController', workspaceController);

function workspaceController($state, $location, documentsHelper) {
    var vm = this;
    activate();

    //region FUNCTION_CALL
    function activate() {
        if ($location.path() == '/') $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
    }
    //endregion
}
workspaceController.$inject = ["$state", "$location", "documentsHelper"];