/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module('hoaApp')
    .controller('sidebarController', [
        '$state',
        'helper.documents',
        'mailbox',
        'userDetails',
        sidebarController
    ]);

function sidebarController ($state, documentsHelper, mailbox, userDetails) {
    var vm = this;

    vm.mailboxItems = {
        "mailbox": mailbox.workflow
    };
    vm.onSidebarItemClicked = onSidebarItemClicked;
    vm.onCreateDocumentClicked = onCreateDocumentClicked;
    //region FUNCTION_CALLS
    function onSidebarItemClicked(folder) {
        var query = documentsHelper.getQueryParameters();
        query.mailbox = folder.queryParam;
        query.isAssigned = true;
        query.assigned = userDetails.userId;

        $state.go(folder.path, query, {reload : true});
    }

    function onCreateDocumentClicked () {
        $state.go('workspace.create');
    }
    //endregion
}