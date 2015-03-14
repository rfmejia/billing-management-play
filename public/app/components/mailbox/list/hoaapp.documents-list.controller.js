angular
    .module("module.mailbox")
    .controller("controller.documents", [
                    'service.hoadialog',
                    "$state",
                    "$stateParams",
                    "$resource",
                    "documentsResponse",
                    "userDetails",
                    "documentsHelper",
                    "documentsService",
                    "requestedParameters",
                    documentsCtrl
                ]);

function documentsCtrl(dialogProvider, $state, $stateParams, $resource, documentsResponse, userDetails, documentsHelper, documentsService, requestedParameters) {
    var vm = this;
    vm.documents = [];
    vm.pages = [];
    vm.pagesSliced = [];
    vm.currentPage = 1;
    vm.queryParameters = {};
    vm.tabState = {};

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
        vm.documents = documentsResponse._embedded.item;
        splitPages();
        vm.queryParameters = documentsHelper.getQueryParameters();
        for (var key in requestedParameters) {
            if (vm.queryParameters.hasOwnProperty(key)) {
                vm.queryParameters[key] = requestedParameters[key];
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
        if (vm.queryParameters.others) {
            vm.tabState.mine = false;
            vm.tabState.others = true;
            vm.tabState.open = false;
            vm.tabTitle = "Assigned to others";
        }
        else if (vm.queryParameters.isAssigned && vm.queryParameters.assigned) {
            vm.tabState.mine = true;
            vm.tabState.others = false;
            vm.tabState.open = false;
            vm.tabTitle = "Assigned to me";
        }
        else if (!vm.queryParameters.isAssigned && vm.queryParameters.assigned == undefined) {
            vm.tabState.mine = false;
            vm.tabState.others = false;
            vm.tabState.open = true;
            vm.tabTitle = "Open documents";
        }

        if (vm.isForSending) {
            vm.tabTitle = "Approved documents"
        }
    }

    function splitPages() {
        maxPages = parseInt(documentsResponse.count / requestedParameters.limit);
        var remainder = documentsResponse.total;
        if (remainder > 0) maxPages++;
        for (var j = 1; j <= maxPages; ++j) vm.pages.push(j);
        maxSlice = (maxPages > 5) ? 5 : maxPages;
        vm.pagesSliced = vm.pages.slice(minSlice, maxSlice);
    }

    function requestNewPage(page) {
        vm.queryParameters.offset = (page == null) ? 0 : (page * limit);
        $state.go($state.current, documentsHelper.formatParameters(vm.queryParameters), {reload : true});
    }

    function isIncrementPagePossible() {
        return vm.pagesSliced[vm.pagesSliced.length - 1] != maxPages;
    }

    function isDecrementPagePossible() {
        return vm.pagesSliced[0] != 1;
    }

    function onDocumentItemClicked(item) {
        if (vm.isForSending) {
            printableView(item.id);
        }
        else {
            workflowView(item);
        }
    }

    function printableView(docId) {
        console.log(docId);
        $state.go("workspace.print-view", {id : docId}, {reload : true});
    }

    function workflowView(item) {
        var state = "";
        var title = "Opening unassigned document";
        var message = "This document will be locked to you";

        if (vm.queryParameters.mailbox == "drafts") {
            state = "workspace.edit-view";
        }
        else {
            state = "workspace.fixed-view";
        }

        //Check if clicked document is assigned
        if (item.assigned) {
            goToViewer();
        }
        else {
            dialogProvider.getConfirmDialog(assignDocument, null, message, title);
        }

        function goToViewer(response) {
            $state.go(state, {"id" : item.id});
        }

        function assignDocument() {
            if (item._links.hasOwnProperty("hoa:assign")) {
                var url = item._links["hoa:assign"].href;
                documentsService.assignDocument(url).then(goToViewer, error);
            }
            else {
                error({title : "Error", message : "Please refresh the page"})
            }
        }

        function error(dialogContent) {
            dialogProvider.getInformDialog(null, dialogContent.title, dialogContent.message);
        }
    }

    function onChangePageClicked(selectedPage) {
        requestNewPage(selectedPage - 1);
        vm.currentPage = selectedPage;
    }

    function onFilterTabClicked(filter) {
        vm.queryParameters.isAssigned = (filter != "open");
        vm.queryParameters.others = (filter == "others");
        if (filter == "mine") {
            vm.queryParameters.assigned = userDetails.userId;
            vm.queryParameters.isAssigned = true;
        }
        else {
            vm.queryParameters.assigned = null;
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