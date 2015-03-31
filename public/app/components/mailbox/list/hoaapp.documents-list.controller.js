angular
    .module("app.mailbox")
    .controller("documentsListController", documentsListController);

function documentsListController($state, $stateParams, docsResponse, queryHelper) {
    var vm = this;
    vm.documents = [];

    vm.filters = [];
    vm.currentFilter = null;

    //Pagination
    vm.currentPage = 0;
    vm.total = 500;
    vm.pageSize = $stateParams.limit;

    vm.onChangePageClicked = onChangePageClicked;
    vm.onFilterTabClicked = onFilterTabClicked;
    vm.pageTitle = $state.current.data.title;
    vm.isForSending = false;

    activate();

    function activate() {
        vm.documents = docsResponse._embedded.item;
        vm.isForSending = $stateParams.mailbox == 'forSending';

        //Pagination setup
        vm.currentPage = ($stateParams.offset / $stateParams.limit) + 1;
        vm.total = docsResponse.total; //TODO: Pagination activate once total is set
        vm.pageSize = $stateParams.limit;

        //filter setup
        resolveFilter();
    }

    function resolveFilter() {
        vm.filters = queryHelper.getDocsListFilters();
        vm.currentFilter = queryHelper.getDocsListFilterById($stateParams.filterId);

        angular.forEach(vm.filters, function(filter) {
            filter.isActive = (filter.id === vm.currentFilter.id);
        });

        if (vm.isForSending) {
            vm.tabTitle = "Approved documents"
        }
    }

    function onChangePageClicked(page) {
        var offset = 0;
        if(page !== null) {
            var newPage = page - 1;
            offset = newPage * vm.pageSize;
        }
        var queryParameters = queryHelper.getDocsListParams($stateParams.mailbox, offset, vm.currentFilter.id);
        $state.go($state.current, queryParameters, {reload : true});
    }

    function onFilterTabClicked(filter) {
        var params = queryHelper.getDocsListParams($stateParams.mailbox, 0, filter.id);
        $state.go($state.current, params, {reload : true});
    }
}
documentsListController.$inject = [
    "$state",
    "$stateParams",
    //API
    //SERVICES
    //UTILS
    //RESOLVES
    "documentsResponse",
    "queryParams"
];