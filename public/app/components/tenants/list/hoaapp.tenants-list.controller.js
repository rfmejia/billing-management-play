var tenants = angular.module("app.tenants");

angular
    .module("app.tenants")
    .controller("tenantsListController", tenantCtrl);

function tenantCtrl($state, $q, $timeout, $stateParams, tenantsApi, tenantList, queryHelper) {
    var vm = this;
    vm.tenantList = tenantList;
    vm.onTenantClicked = onTenantClicked;
    vm.onCreateTenantClicked = onCreateTenantClicked;
    vm.pageTitle = $state.current.data.title;
    vm.profile = tenantList._links.profile.href;
    vm.currentPageShown = tenantList._embedded.item;
    vm.getMatches = getMatches;
    vm.loadingList = false;

    //Pagination
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.total;
    vm.onChangePageClicked = onChangePageClicked;

    activate();

    function activate() {
        if (vm.query) {
            vm.currentPage = 1;
            vm.pageSize = 10;
            vm.total = 10;
        }
        else {
            vm.currentPage = $stateParams.offset % 10;
            vm.pageSize = 10;
            vm.total = tenantList.total;
        }
    }

    function getMatches(queryText) {
        if (queryText) {
            queryApi({"startsWith": queryText, "limit": 10})
        }
        else {
            queryApi({"page": 1, "limit": 10});
        }
    }

    function onChangePageClicked(page) {
        var offset = 0;
        if (page !== null) {
            var newPage = page - 1;
            offset = newPage * vm.pageSize;
        }
        queryApi({"limit": 10, "page": page, "offset": offset});
    }

    function queryApi(queryParams) {
        vm.loadingList = true;
        var deferred = $q.defer();
        var success = function (response) {
            if (response.hasOwnProperty("_embedded") && response._embedded.hasOwnProperty("item")) {
                vm.currentPageShown = response._embedded.item;
                activate();
                deferred.resolve(response._embedded.item);
            }
            else {
                vm.currentPageShown = response._embedded.item;
                activate();
                deferred.resolve();
            }
            $timeout(function () {
                vm.loadingList = false;
            }, 500);
        };
        var error = function (error) {
            hoaToast.showSimpleToast("Sorry, something went wrong while searching for tenants");
            deferred.reject(error);
            $timeout(function () {
                vm.loadingList = false;
            }, 500);
        };

        tenantsApi.getList(queryParams)
            .then(success, error);

        return deferred.promise;
    }

    function onTenantClicked(tenant) {
        var params = queryHelper.getTenantDocs(0, tenant.id, "all");
        $state.go("workspace.tenant-view", params, {reload: true});
    }

    function onCreateTenantClicked() {
        $state.go("workspace.tenant-create")
    }
}
tenantCtrl.$inject =
["$state", "$q", "$timeout", "$stateParams", "tenantsApi", "tenantsList", "queryParams"];
