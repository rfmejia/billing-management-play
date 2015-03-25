angular
    .module("app.mailbox")
    .controller("documentsListController", documentsListController);

function documentsListController($state, $stateParams, documentsApi, documentsHelper, dialogProvider, userDetails, docsResponse, requestedParams) {
    var vm = this;
    vm.documents = [];
    vm.pages = [];
    vm.pagesSliced = [];
    vm.currentPage = 1;
    vm.queryParameters = {};
    vm.tabState = {};
    vm.total = docsResponse.count;
    vm.pageSize = requestedParams.limit;

    vm.requestNewPage = requestNewPage;
    vm.isIncrementPagePossible = isIncrementPagePossible;
    vm.isDecrementPagePossible = isDecrementPagePossible;
    vm.onDocumentItemClicked = onDocumentItemClicked;
    vm.onChangePageClicked = onChangePageClicked;
    vm.onChangeSliceClicked = onChangeSliceClicked;
    vm.onFilterTabClicked = onFilterTabClicked;
    vm.pageTitle = $state.current.data.title;
    vm.tabTitle = null;
    vm.isForSending = false;

    var maxPages = 0;
    var minSlice = 0;
    var maxSlice = 0;
    var limitRequest = 0;
    activate();

    function activate() {
        vm.documents = docsResponse._embedded.item;
        vm.queryParameters = documentsHelper.getQueryParameters();
        for (var key in requestedParams) {
            if (vm.queryParameters.hasOwnProperty(key)) {
                vm.queryParameters[key] = requestedParams[key];
            }
        }
        vm.isForSending = $stateParams.mailbox == 'forSending';
        changeTabState();
    }

    function changeTabState() {
        vm.tabState = {
            "mine"   : true,
            "others" : false,
            "open"   : false
        };
        console.log(vm.queryParameters.others);
        if (vm.queryParameters.others === true) {
            vm.tabState.mine = false;
            vm.tabState.others = true;
            vm.tabState.open = false;
            vm.tabTitle = "Assigned to others";
        }
        else if (vm.queryParameters.others === false) {
            vm.tabState.mine = true;
            vm.tabState.others = false;
            vm.tabState.open = false;
            vm.tabTitle = "Assigned to me";
        }
        else if (vm.queryParameters.others == null) {
            vm.tabState.mine = false;
            vm.tabState.others = false;
            vm.tabState.open = true;
            vm.tabTitle = "Open documents";
        }

        if (vm.isForSending) {
            vm.tabTitle = "Approved documents"
        }
    }

    function requestNewPage(page) {
        vm.queryParameters.offset = (page == null) ? 0 : (page * vm.pageSize);
        $state.go($state.current, documentsHelper.formatParameters(vm.queryParameters), {reload : true});
    }

    function isIncrementPagePossible() {
        return vm.pagesSliced[vm.pagesSliced.length - 1] != maxPages;
    }

    function isDecrementPagePossible() {
        return vm.pagesSliced[0] != 1;
    }

    function onDocumentItemClicked(item) {
        var state = documentsHelper.resolveViewer(item);
        var title = "Sorry";
        var message = "This document is being edited by another user.";
        //Check if clicked document is assigned
        if(item.assigned == null) {
            documentsApi.assignDocument(item._links["hoa:assign"].href).then(goToViewer, error);
        }
        else if (userDetails.userId == item.assigned.userId){
            goToViewer();
        }
        else if(item._links.hasOwnProperty("hoa:assign")) {
            documentsApi.assignDocument(item._links["hoa:assign"].href).then(goToViewer, error);
        }
        else {
            error();
        }

        function goToViewer(response) {
            $state.go(state, {id : item.id}, {reload : true});
        }

        function error(dialogContent) {
            dialogProvider.getInformDialog(null,  title, message, "Okay");
        }
    }

    function onChangePageClicked(page) {
        requestNewPage(page - 1);
        vm.currentPage = page;
    }

    function onFilterTabClicked(filter) {
        vm.queryParameters.assigned = null;
        if(filter == "open") {
            vm.queryParameters.isAssigned = false;
            vm.queryParameters.others = null;
        }
        else if(filter == "others") {
            vm.queryParameters.others = true;
            vm.queryParameters.isAssigned = null;
        }
        else if(filter == "mine") {
            vm.queryParameters.others = false;
            vm.queryParameters.isAssigned = null;
        }
        changeTabState();
        $state.go($state.current, vm.queryParameters, {reload : true});
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
    "requestedParams"
];