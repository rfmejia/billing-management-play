angular
    .module("app.mailbox")
    .controller("documentsListController", documentsListController);

function documentsListController($state, $stateParams, documentsApi, documentsHelper, dialogProvider, userDetails, docsResponse, queryHelper) {
    var vm = this;
    vm.documents = [];
    vm.pages = [];
    vm.pagesSliced = [];
    vm.currentPage = 1;
    vm.total = docsResponse.count;
    vm.pageSize = $stateParams.limit;
    vm.filters = [];
    vm.currentFilter = null;

    vm.requestNewPage = requestNewPage;
    vm.isIncrementPagePossible = isIncrementPagePossible;
    vm.isDecrementPagePossible = isDecrementPagePossible;
    vm.onChangePageClicked = onChangePageClicked;
    vm.onChangeSliceClicked = onChangeSliceClicked;
    vm.onFilterTabClicked = onFilterTabClicked;
    vm.pageTitle = $state.current.data.title;
    vm.isForSending = false;

    var maxPages = 0;
    var minSlice = 0;
    var maxSlice = 0;
    var limitRequest = 0;
    activate();

    function activate() {
        vm.documents = docsResponse._embedded.item;
        vm.isForSending = $stateParams.mailbox == 'forSending';
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

    function requestNewPage(page) {
        var offset = (page == null) ? 0 : (page * vm.pageSize);
        var queryParameters = queryHelper.getDocsListParams($stateParams.mailbox, offset, vm.currentFilter);
        $state.go($state.current, queryParameters, {reload : true});
    }

    function isIncrementPagePossible() {
        return vm.pagesSliced[vm.pagesSliced.length - 1] != maxPages;
    }

    function isDecrementPagePossible() {
        return vm.pagesSliced[0] != 1;
    }

    function onChangePageClicked(page) {
        requestNewPage(page - 1);
        vm.currentPage = page;
    }

    function onFilterTabClicked(filter) {
        var params = queryHelper.getDocsListParams($stateParams.mailbox, 0, filter.id);
        $state.go($state.current, params, {reload : true});
    }

    function onChangeSliceClicked(step) {
        if (!vm.isDecrementPagePossible() && step < 0) return;
        if (!vm.isIncrementPagePossible() && step > 0) return;
        minSlice += step;
        maxSlice += step;
        vm.pagesSliced = vm.pages.slice(minSlice, (maxSlice > maxPages - 1) ? maxPages : maxSlice);
        vm.onChangePageClicked(vm.pagesSliced[0]);
    }
}
documentsListController.$inject = [
    "$state",
    "$stateParams",
    //API
    "documentsApi",
    //SERVICES
    "documentsHelper",
    'hoaDialogService',
    //UTILS
    //RESOLVES
    "userDetails",
    "documentsResponse",
    "queryParams"
];