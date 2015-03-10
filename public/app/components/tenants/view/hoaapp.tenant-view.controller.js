angular
    .module('module.tenants')
    .controller('tenantViewCtrl', [
                    '$state',
                    "$stateParams",
                    'tenant',
                    'documents',
                    "documentsService",
                    'service.hoadialog',
                    "service.hoatoasts",
                    "tenantsService",
                    tenantViewCtrl
                ]);

function tenantViewCtrl($state, $stateParams, tenant, documents, documentsService, hoaDialog, hoaToast, tenantsSrvc) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = documents._embedded.item;
    vm.isInfoOpen = true;
    vm.tradeNameColor = {color : "#689F38"};
    vm.pageTitle = $state.current.data.title;

    vm.onEditClicked = onEditClicked;
    vm.onFilterClicked = onFilterClicked;
    vm.onDeleteClicked = onDeleteClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.filters = [
            {
                title  : "All",
                params : {forTenant : $stateParams.id, others : null, isAssigned : null}
            },
            {
                title  : "Pending",
                params : {forTenant : $stateParams.id, mailbox : "pending", others : null, isAssigned : null}
            },
            {
                title  : "Delivered",
                params : {forTenant : $stateParams.id, mailbox : "delivered", others : null, isAssigned : null}
            },
            {
                title  : "Paid",
                params : {forTenant : $stateParams.id, mailbox : "paid", others : null, isAssigned : null}
            },
            {
                title  : "Unpaid",
                params : {forTenant : $stateParams.id, mailbox : "unpaid", others : null, isAssigned : null}
            }
        ]
    }

    function onEditClicked() {
        $state.go("workspace.tenant-view.edit");
    }

    function onDeleteClicked() {
        var message = "Delete this tenant permanently?";
        var title = "Warning";

        function success(response) {
            $state.go("workspace.tenants-list", {}, {reload : true});
            hoaToast.showSimpleToast("Deleted successful")
        }

        function error() {
            hoaToast.showSimpleToast("An error occurred while deleting");
        }

        function okayFn() {
            tenantsSrvc.deleteTenant($stateParams.id).then(success, error);
        }

        function cancelFn() {}

        hoaDialog.getConfirmDialog(okayFn, cancelFn, message, title);
    }

    function onFilterClicked(filter) {
        vm.documents = [];
        documentsService.getDocumentList(filter.params)
            .then(success);

        function success(response) {
            vm.documents = response._embedded.item;
        }
    }

    //endregion
}