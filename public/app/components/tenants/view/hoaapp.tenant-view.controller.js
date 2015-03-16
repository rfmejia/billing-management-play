angular
    .module('module.tenants')
    .controller('tenantViewCtrl', [
                    '$state',
                    "$stateParams",
                    'tenant',
                    'documents',
                    "documentsService",
                    "documentsHelper",
                    'service.hoadialog',
                    "service.hoatoasts",
                    "tenantsService",
                    "REPORTS_ROUTES",
                    tenantViewCtrl
                ]);

function tenantViewCtrl($state, $stateParams, tenant, documents, documentsService, docsHelper, hoaDialog, hoaToast, tenantsSrvc, reportsRoutes) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = documents._embedded.item;
    vm.isInfoOpen = true;
    vm.tradeNameColor = {color : "#689F38"};
    vm.pageTitle = $state.current.data.title;

    vm.onEditClicked = onEditClicked;
    vm.onFilterClicked = onFilterClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.onDocumentItemClicked = onDocumentItemClicked;
    vm.onUpdateItemClicked = onUpdateItemClicked;

    activate();

    //region FUNCTION_CALL
    function activate() {
        vm.filters = [
            {
                title  : "All",
                params : {
                    forTenant  : $stateParams.id,
                    others     : null,
                    isAssigned : null
                }
            },
            {
                title  : "Pending",
                params : {
                    forTenant  : $stateParams.id,
                    mailbox    : "pending",
                    others     : null,
                    isAssigned : null
                }
            },
            {
                title  : "Delivered",
                params : {
                    forTenant  : $stateParams.id,
                    mailbox    : "delivered",
                    others     : null,
                    isAssigned : null
                }
            },
            {
                title  : "Paid",
                params : {
                    forTenant  : $stateParams.id,
                    mailbox    : "delivered",
                    isPaid     : true,
                    others     : null,
                    isAssigned : null
                }
            },
            {
                title  : "Unpaid",
                params : {
                    forTenant  : $stateParams.id,
                    mailbox    : "delivered",
                    isPaid     : false,
                    others     : null,
                    isAssigned : null
                }
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

    function onDocumentItemClicked(item) {
        $state.go(docsHelper.resolveViewer(item), {id : item.id}, {reload : true});
    }

    function onUpdateItemClicked(item) {
        if (item.assigned == null) {
            documentsService.assignDocument(item._links["hoa:assign"].href)
                .then(success, error);
        }

        else {
            success();
        }

        function success() {
            $state.go(reportsRoutes.reportUpdate, {id : item.id});
        }

        function error() {}
    }

    //endregion
}