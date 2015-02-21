var hoaControllers = angular.module("hoaApp");

hoaControllers.controller("controller.root", ["$scope", "$location", "$state", "$q", "$window", "$cookies", "service.hoalinks", "tokenHandler",
    function($scope, $location, $state, $q, $window, $cookies, hoalinks, tokenHandler) {

        var success = function(data) {
            tokenHandler.set($cookies.id);
        };

        var error = function() {
            
        };

        if(!hoalinks.isLinksSet()) {
            hoalinks.getResource().get().$promise
                .then(success, error);
        }
    }]);

hoaControllers.controller('workspaceController', ['$rootScope', '$scope', "$http", "$state",
    function ($rootScope, $scope, $http, $state) {
        $scope.onCreateDocumentClicked = function() {
            $state.go("workspace.create");
        }
}]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state", "mailbox",
    function ($scope, $location, $state, mailbox) {
        $scope.mailboxItems = {
            "mailbox": mailbox.workflow
        };

        $scope.onSidebarClicked = function(folder) {
            var query = {mailbox: folder.queryParam, page: 0};
            $state.go(folder.path, query, {reload : true});
        };
}]);

// end - User releated controllers

hoaControllers.controller('mailboxController', ['$scope', function ($scope) {

}]);



