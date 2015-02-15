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

hoaControllers.controller('workspaceController', 
    ['$rootScope', '$scope', "$http", "$state",
    function ($rootScope, $scope, $http, $state) {

        $scope.onCreateDocumentClicked = function() {
            $state.go("workspace.create");
        }
}]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state", "mailbox", "$modal", "service.hoatenants", "service.hoatemplates",
    function ($scope, $location, $state, mailbox, $modal, tenantsService, templatesService) {
        console.log(tenantsService);
        $scope.mailboxItems = mailbox;
        $scope.sidebarItems = [
            {link : "#/tenants", header : "Management", section: "Tenants", title : "Tenants List", id : "tenantsLink", state : "workspace.tenants"},
            {link : "#/users", header : "Management", section : "Users", title: "Users List", id: "usersLink", state : "workspace.users"}
        ];

        var path = $location.path();

        for(var i = 0; i < $scope.sidebarItems.length; i++) {
            if($scope.sidebarItems[i].section.search(path) != -1) {
                $scope.selectedLink($scope.sidebarItems[i]);
                break;
            }
        }
        for(i = 0; i < $scope.mailboxItems.length; i++) {
            for(var j = 0; j < $scope.mailboxItems[i].contents.length; j++) {
                if($scope.mailboxItems[i].contents[j].section.search(path) != -1) {
                    $scope.selectedIndex($scope.mailboxItems[i].contents[j]);
                    break;
                }
            }
    }

    $scope.queryDocuments = function(folder) {
        var query = {mailbox: folder.queryParam, page: 0};
        console.log(query);
        $state.go("workspace.documents", query, {reload : true});
    };

    $scope.setSelectedLink = function(link) {
            $scope.selectedLink = link;
            $state.go($scope.selectedLink.state);
        };

    $scope.linkClass = function(link) {
            if($scope.selectedLink == link) {
                return "active";
            }
            else {
                return "";
            }
        }
}]);

// end - User releated controllers

hoaControllers.controller('mailboxController', ['$scope', function ($scope) {

}]);



