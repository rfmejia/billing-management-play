/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module("app.layout")
    .controller('workspaceController', workspaceController);

function workspaceController($state, $location, queryHelper) {
    var vm = this;
    activate();

    //region FUNCTION_CALL
    function activate() {
        if ($location.path() == '/') {
            var filter = queryHelper.getDocsListFilters();
            var params = queryHelper.getDocsListParams("drafts", 0, filter[0].id);
            $state.go("workspace.pending.drafts", params, {reload : true});
        }
    }
    //endregion
}
workspaceController.$inject = ["$state", "$location", "queryParams"];