/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module("module.layout")
    .controller('sidebarController', [
                    '$state',
                    'documents.helper',
                    'mailbox',
                    'userDetails',
                   'service.hoacurrentuser',
                    "nvl-dateutils",
                    sidebarController
                ]);

function sidebarController($state, documentsHelper, mailbox, userDetails, userService, dateUtils) {
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
        var query = documentsHelper.getQueryParameters();
        query.mailbox = folder.queryParam;
        if (folder.link == 'delivered') {
            query = {};
            query.year = dateUtils.getLocalYearNow();
            query.month = dateUtils.getLocalMonthNow();
            query.offset = 0;
            query.limit = 10;
        }
        else if (folder.link != 'forSending') {
            query.isAssigned = true;
            query.assigned = userDetails.userId;
        }
        else {
            query.isAssigned = null;
            query.others = null;
        }

        $state.go(folder.path, query, {reload : true});
    }

    function onCreateDocumentClicked() {
        $state.go('workspace.create');
    }

    function onLogoutClicked() {
        userService.logoutUser();
    }

    //endregion
}