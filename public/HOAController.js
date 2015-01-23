var hoaControllers = angular.module("hoaApp");

hoaControllers.controller("controller.root", ["$scope", "$location", "$state", "$q", "$window", "$cookies", "service.hoalinks", "tokenHandler",
    function($scope, $location, $state, $q, $window, $cookies, hoalinks, tokenHandler) {

        var success = function(data) {
            tokenHandler.set($cookies.id);
            $state.go("workspace");
        }

        var error = function() {
            
        }
        if(!hoalinks.isLinksSet()) {
            hoalinks.getResource()
                .get()
                .$promise
                .then(success, error);
        }
    }]);

hoaControllers.controller('workspaceController', 
    ['$rootScope', '$scope', "$http", "$state",  "$location", "$window", "$cookies", 
     "r_hoaLinks", "tokenHandler",
    function ($rootScope, $scope, $http, $state, $location, $window, $cookies, r_hoaLinks, tokenHandler) {

        $scope.onCreateClicked = function() {
            $state.go("workspace.create");
        }
}]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state",
    "r_mailboxes", 
function ($scope, $location, $state, r_mailboxes) {
    console.log(r_mailboxes);
    $scope.mailboxItems = r_mailboxes;
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
    for(var i = 0; i < $scope.mailboxItems.length; i++) {
        for(var j = 0; j < $scope.mailboxItems[i].contents.length; j++) {
            if($scope.mailboxItems[i].contents[j].section.search(path) != -1) {
                $scope.selectedIndex($scope.mailboxItems[i].contents[j]);
                break;
            }
        }
    }

    $scope.setSelectedLink= function(link) {
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

// User related controllers

hoaControllers.controller('usersInviteController', ['$scope', "$modalInstance", "r_inviteTemplate",
    function ($scope, $modalInstance, r_inviteTemplate) {
}]);
// end - User releated controllers

hoaControllers.controller('mailboxController', ['$scope', function ($scope) {

}]);



