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
    /** list of tenants **/
    $scope.tenantsList = tenantsList.tenants;
    /** selected tenant from the list **/
    $scope.selectedTenant = null;
    /** the index in the list of the selected tenant for ng-class='active' purposes **/
    $scope.selectedIndex = null;
    /** the billing period **/
    $scope.billingDate = null;
    /** Format used for all dates **/
    $scope.format = "MMMM-YYYY";

    /**
     * Callback for when a tenant is selected. We also take note of the index to switch to an active state
     * @param tenant
     * @param index
     */
    $scope.onTenantSelected = function(tenant, index) {
        $scope.selectedTenant = tenant;
        $scope.selectedIndex = index;
    };

    /**
     * Posts a draft to the API
     */
    $scope.onCreateDocumentClicked = function() {
        var success = function(response) {
            console.log(response);
            $state.go("workspace.edit-view", {id: response.id});
        };

        var error = function(response) {
            toaster.pop('error', 'Error', 'We couldn\'t create your document');
        };

        prepareDraftPost();
        documentsService.createDocument(documentsHelper.formatServerData(template))
            .then(success, error);
    };

    /**
     * Convenience function that returns true if we can now submit the document to drafts
     * @returns {boolean}
     */
    $scope.isDocumentReady = function() {
        return ($scope.selectedTenant != null && $scope.billingDate != null);
    };

    /**
     * Creates the title for our document.
     * @returns {string}
     */
    $scope.title = function() {
        return ($scope.isDocumentReady())
            ? $scope.selectedTenant.tradeName + " - " + moment($scope.billingDate).format($scope.format)
            : '';
    };

    var prepareDraftPost = function() {
        template.viewModel.title = $scope.title();
        template.viewModel.forMonth = $scope.billingDate;
        template.viewModel.forTenant = $scope.selectedTenant.id;
    };
}