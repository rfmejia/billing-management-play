var drafts = angular.module("module.mailbox");

drafts.controller("controller.documents", ["$scope", "$state", "documentsList", "documentsService", "documentMailbox",
    function($scope, $state, documentsList, documentsService, documentMailbox){
        console.log(documentMailbox);
        $scope.documentsList = documentsList.documentsList;
        var maxPages = 0;
        //index of first number displayed in pagination
        var minSlice = 0;
        //index of last number displayed in pagination
        var maxSlice = 0;
        var limitRequest = documentsService.getLimitRequest();
        $scope.pages = [];
        $scope.pagesSliced = [];
        $scope.currentPage = 1;

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
            if(documentMailbox == "Drafts") {
                console.log("drafts");
                console.log(documentMailbox);
                $state.go("workspace.drafts", {"id" : document.id});
            }
            else if(documentMailbox == "forChecking" || documentMailbox == "forApproval") {
                $state.go("workspace.approval", {"id" : document.id});
            }
        };

        $scope.onChangePageClicked = function(selectedPage) {
            requestNewPage(selectedPage-1);
            $scope.currentPage = selectedPage;
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