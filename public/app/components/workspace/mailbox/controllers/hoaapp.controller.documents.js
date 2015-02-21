var drafts = angular.module("module.mailbox");

drafts.controller("controller.documents", ["$scope", "$state", "documentsList", "documentsService", "documentMailbox", "page",
    function($scope, $state, documentsList, documentsService, documentMailbox, page){
        $scope.documentsList = documentsList.documentsList;
        var maxPages = 0;
        //index of first number displayed in pagination
        var minSlice = 0;
        //index of last number displayed in pagination
        var maxSlice = 0;
        var limitRequest = documentsService.getLimitRequest();
        $scope.pages = [];
        $scope.pagesSliced = [];
        /** Page is 0 indexed **/
        page++;
        $scope.pagination = {
            "currentPage" : page
        };

        //Pagination
        var splitPages = function() {
            maxPages = parseInt(documentsList.documentCount / limitRequest);
            var remainder = documentsList.documentCount % limitRequest;
            if(remainder > 0) maxPages++;
            for(var j = 1; j <= maxPages; ++j) {
                $scope.pages.push(j);
            }
            maxSlice = (maxPages > 5) ? 5 : maxPages;
            $scope.pagesSliced = $scope.pages.slice(minSlice, maxSlice);
        };
        splitPages();

        var requestNewPage = function(page) {
            documentsService.getDocumentList(documentMailbox, page)
                .then(success);
        };

        $scope.isIncrementPagePossible = function() {
            return $scope.pagesSliced[$scope.pagesSliced.length-1] != maxPages;
        };

        $scope.isDecrementPagePossible = function() {
            return $scope.pagesSliced[0] != 1;
        };

        var success = function(response) {
            $scope.documentsList.splice(0, $scope.documentsList.length);
            $scope.documentsList = angular.copy(response.documentsList);
        };
        //end pagination

        //event listeners
        $scope.onDocumentItemClicked = function(document) {
            var state = "";

            if(documentMailbox == "drafts") state = "workspace.edit-view";
            else state = "workspace.fixed-view";

            $state.go(state, {"id" : document.id});
        };

        $scope.onChangePageClicked = function(selectedPage) {
            console.log(page);
            requestNewPage(selectedPage-1);
            $scope.pagination.currentPage = selectedPage;
        };

        $scope.onChangeSliceClicked = function(step) {
            if(!$scope.isDecrementPagePossible() && step < 0) return;
            if(!$scope.isIncrementPagePossible() && step > 0) return;
            minSlice += step;
            maxSlice += step;
            $scope.pagesSliced = $scope.pages.slice(minSlice, (maxSlice > maxPages-1)? maxPages : maxSlice);
            $scope.onChangePageClicked($scope.pagesSliced[0]);
        };
        //end event listeners



}]);