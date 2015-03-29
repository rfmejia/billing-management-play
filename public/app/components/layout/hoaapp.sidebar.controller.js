/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module("app.layout")
    .controller('sidebarController', sidebarController);

function sidebarController($state, mailbox, userDetails, userService, dateUtils, queryHelper) {
    var vm = this;

    vm.mailboxItems = {
        "mailbox" : mailbox.workflow
    };
    vm.onSidebarItemClicked = onSidebarItemClicked;
    vm.onCreateDocumentClicked = onCreateDocumentClicked;
    vm.onLogOutClicked = onLogoutClicked;
    vm.fullName = userDetails.fullName;

    //region FUNCTION_CALLS
    function onSidebarItemClicked(folder) {
        var params = {};
        if(folder.type === "mailbox") {
            var filter = queryHelper.getDocsListFilters();
            params = queryHelper.getDocsListParams(folder.queryParam, 0, filter[0].id);
        }
        else if(folder.type === "reports") {
            var filter = queryHelper.getReportsFilters();
            params = queryHelper.getReportsParams(0, dateUtils.getLocalDateNow(), filter[0].id);
        }
        else if(folder.type === "tenants") {
            params = null
        }

        $state.go(folder.path, params, {reload : true});
    }

    function onCreateDocumentClicked() {
        $state.go('workspace.create');
    }

    function onLogoutClicked() {
        userService.logoutUser();
    }

    //endregion
}
sidebarController.$inject = ['$state', 'mailboxes', 'userDetails', 'userApi', "nvl-dateutils", "queryParams"];