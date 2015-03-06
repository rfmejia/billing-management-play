/**
 * Created by juancarlos.yu on 2/14/15.
 */
angular
    .module('module.mailbox')
    .controller('controller.create', [
        'documentsHelper',
        'documentsService',
        '$scope',
        '$state',
        'template',
        'tenantsList',
        'toaster',
        createCtrl
    ]);

function createCtrl(documentsHelper, documentsService, $scope, $state, template, tenantsList, toaster) {

    var vm = this;

    /** list of tenants **/
    vm.tenantsList = tenantsList.tenants;
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

    vm.onTenantSelected = onTenantSelected;
    vm.onCreateDocumentClicked = onCreateDocumentClicked;
    vm.isDocumentReady = isDocumentReady;
    vm.title = title;
    vm.prepareDraftPost = prepareDraftPost;
    vm.getMatches = getMatches;

    activate();

    function activate() {
        angular.forEach(tenantsList.tenants, function(tenant) {
            tenant.value = angular.lowercase(tenant.tradeName);
        });
    }

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
            $state.go("workspace.edit-view", {id: response.id});
        };

        var error = function(response) {
            toaster.pop('error', 'Error', 'We couldn\'t create your document');
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
            var boo = (tenant.value.indexOf(lowercaseQuery) === 0);
            return boo;

        }
    }
}