/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module('hoaApp')
    .controller('sidebarController', [
        '$state',
        'mailbox',
        sidebarController
    ]);

function sidebarController ($state, mailbox) {
    var vm = this;

    vm.mailboxItems = {
        "mailbox": mailbox.workflow
    };
    vm.onSidebarItemClicked = onSidebarItemClicked;
    vm.onCreateDocumentClicked = onCreateDocumentClicked;

    //region FUNCTION_CALLS
    function onSidebarItemClicked(folder) {
        var query = {mailbox: folder.queryParam, page: 0};
        $state.go(folder.path, query, {reload : true});
    }

    function onCreateDocumentClicked () {
        $state.go('workspace.create');
    }
    //endregion
}