/**
 * Created by juancarlos.yu on 2/14/15.
 */
angular
    .module('module.mailbox')
    .controller('controller.create', [
                    'documentsHelper',
                    'documentsService',
                    '$state',
                    'template',
                    'tenantsList',
                    'service.hoatoasts',
                    createCtrl
                ]);

function createCtrl(documentsHelper, documentsService, $state, template, tenantsList, hoaToast) {

    var vm = this;
    /** list of tenants **/
    vm.tenantsList = tenantsList._embedded.item;
    /** selected tenant from the list **/
    vm.selectedTenant = null;
    /** the index in the list of the selected tenant for ng-class='active' purposes **/
    vm.selectedIndex = null;
    /** the billing period **/
    vm.billingDate = null;
    /** Format used for all dates **/
    vm.format = "MMMM-YYYY";
    /** The query search text **/
    vm.searchText = null;

    //Function bindings
    vm.onTenantSelected = onTenantSelected;
    vm.onCreateDocumentClicked = onCreateDocumentClicked;
    vm.isDocumentReady = isDocumentReady;
    vm.title = title;
    vm.prepareDraftPost = prepareDraftPost;
    vm.getMatches = getMatches;

    activate();

    function activate() {
        angular.forEach(vm.tenantsList, function(tenant) {
            tenant.value = angular.lowercase(tenant.tradeName);
        });
    }

    //region FUNCTION_CALL
    /**
     * Callback for when a tenant is selected. We also take note of the index to switch to an active state
     * @param tenant
     * @param index
     */
    function onTenantSelected(tenant, index) {
        vm.selectedTenant = tenant;
        vm.selectedIndex = index;
    }

    /**
     * Posts a draft to the API
     */
    function onCreateDocumentClicked() {
        var success = function(response) {
            $state.go("workspace.edit-view", {id : response.id});
        };

        var error = function(response) {
            hoaToast.showSimpleToast("Sorry, we couldn't create your document")
        };

        prepareDraftPost();
        documentsService.createDocument(documentsHelper.formatServerData(template))
            .then(success, error);
    }

    /**
     * Convenience function that returns true if we can now submit the document to drafts
     * @returns {boolean}
     */
    function isDocumentReady() {
        return (vm.selectedTenant != null && vm.billingDate != null);
    }

    /**
     * Creates the title for our document.
     * @returns {string}
     */
    function title() {
        return (vm.isDocumentReady())
            ? vm.selectedTenant.tradeName + " - " + moment(vm.billingDate).format(vm.format)
            : '';
    }

    function prepareDraftPost() {
        template.viewModel.title = vm.title();
        template.viewModel.forMonth = vm.billingDate;
        template.viewModel.forTenant = vm.selectedTenant.id;
    }

    function getMatches(queryText) {
        return queryText ? vm.tenantsList.filter(filterTenantList(queryText)) : [];
    }

    function filterTenantList(queryText) {
        var lowercaseQuery = angular.lowercase(queryText);
        return function filterFn(tenant) {
            return (tenant.value.indexOf(lowercaseQuery) === 0);

        }
    }

    //endregion
}