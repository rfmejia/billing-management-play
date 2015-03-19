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
                    'service.hoadialog',
                    'service.hoacurrentuser',
                    tenantViewCtrl
                ]);

function tenantViewCtrl($state, $stateParams, tenant, documents, documentsService, docsHelper, hoaDialog, hoaToast, tenantsSrvc, reportsRoutes, dialogProvider, userDetails) {
    var vm = this;
    vm.tenant = tenant.viewModel;
    vm.documents = documents._embedded.item;
    vm.isInfoOpen = true;
    vm.tradeNameColor = {color : "#689F38"};
    vm.pageTitle = $state.current.data.title;
    vm.currentFilter = {};
    vm.currentPage = 1;
    vm.pageSize = documents.limit;
    //TODO: CHANGE TO TOTAL
    vm.total = documents.limit;

    vm.onEditClicked = onEditClicked;
    vm.onFilterClicked = onFilterClicked;
    vm.onDeleteClicked = onDeleteClicked;
    vm.onDocumentItemClicked = onDocumentItemClicked;
    vm.onUpdateItemClicked = onUpdateItemClicked;
    vm.onChangePageClicked = onChangePageClicked;

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
        ];
        vm.currentFilter = vm.filters[0];
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

    function onDocumentItemClicked(item) {
        var title = "Sorry";
        var message = "This document is being edited by another user.";
        if (item.mailbox == 'paid' || item.mailbox == 'unpaid') {
            viewDocument();
        }
        else {
            //Check if clicked document is assigned
            if (item._links.hasOwnProperty("hoa:assign")) {
                documentsService.assignDocument(item._links["hoa:assign"].href).then(viewDocument, error);
            }
            else if (userDetails.userId == item.assigned.userId) {
                viewDocument();
            }
            else {
                error();
            }
        }

        function viewDocument() {
            $state.go(docsHelper.resolveViewer(item), {id : item.id}, {reload : true});
        }

        function error(dialogContent) {
            dialogProvider.getInformDialog(null, title, message, "Okay");
        }
    }

    function onUpdateItemClicked(item) {
        var title = "Sorry";
        var message = "This document is being edited by another user.";
        if (item._links.hasOwnProperty("hoa:assign")) {
            documentsService.assignDocument(item._links["hoa:assign"].href).then(viewDocument, error);
        }
        else if (userDetails.userId == item.assigned.userId) {
            viewDocument();
        }
        else {
            error();
        }

        function viewDocument() {
            $state.go(reportsRoutes.reportUpdate, {id : item.id});
        }

        function error(reason) {
            dialogProvider.getInformDialog(null, title, message, "Okay");
        }
    }

    function onFilterClicked(filter) {
        vm.currentFilter = filter;
        vm.documents = [];
        documentsService.getDocumentList(filter.params)
            .then(success);
    }

    function onChangePageClicked(page) {
        page -= 1;
        var offset = (page == null) ? 0 : (page * vm.pageSize);
        var changedParams = vm.currentFilter.params;
        if (changedParams.hasOwnProperty("offset")) {
            changedParams.offset = offset;
        }
        vm.documents = [];
        vm.currentPage = page + 1;
        documentsService.getDocumentList(changedParams).then(success);

    }

    function success(response) {
        vm.documents = response._embedded.item;
    }

    //endregion
}