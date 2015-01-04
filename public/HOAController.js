var hoaControllers = angular.module("hoaControllers", []);
hoaControllers.value('entrypoint', "http://hoa-play-scala.herokuapp.com/api");

hoaControllers.controller("rootController", ["$state", "$cookies",
    function($state, $cookies) {
    $state.go("authenticate")
    //check credentials,
    // if(!auth) $state.go("authenticate");

    //true go to workspace state,
    //false go to auhtenticate state
}]);

hoaControllers.controller("authenticateController", ["$scope", "$state",
function($scope, $state) {
    $scope.user = {};
    $scope.isValidCredentials = true;
    $scope.verifyCredentials = function() {
        var userEq = angular.equals($scope.user.userName, "test");
        var passwordEq = angular.equals($scope.user.password, "user");
        $scope.isValidCredentials = userEq && passwordEq;

        // if($scope.isValidCredentials) $state.go("workspace");
        $state.go("workspace");
    }
}]);

hoaControllers.controller("verifyController", [function() {

}]);

hoaControllers.controller('workspaceController', ['$rootScope', '$scope', "$http", "$state",  "$location", "entrypoint", "r_hoaLinks", "service.hoalinks",
    function ($rootScope, $scope, $http, $state, $location, entrypoint, r_hoaLinks, hoalinks) {
        $scope.onCreateClicked = function() {
            console.log("create");
            $state.go("workspace.create");
        }
}]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state",
function ($scope, $location, $state) {
    $scope.sidebarItems = [
        {link : "#/inbox", header : "Mailbox", name : "Inbox", title : "Inbox" , id : "inboxLink", state : "workspace.inbox"},
        {link : "#/drafts", header : "Mailbox", name : "Drafts", title : "Drafts" , id : "draftsLink", state : "workspace.drafts"},
        {link : "#/delivered", header : "Mailbox", name : "Delivered", title : "Delivered",  id : "deliveredLink", state : "workspace.delivered"},
        {link : "#/pending", header : "Mailbox", name : "Pending", title : "Pending" , id : "pendingLink", state : "workspace.pending"},
        {link : "#/tenants", header : "Management", name: "Tenants", title : "Tenants List", id : "tenantsLink", state : "workspace.tenants"},
        {link : "#/users", header : "Management", name : "Users", title: "Users List", id: "usersLink", state : "workspace.users"}
    ];

    var path = $location.path();

    for(i = 0; i < $scope.sidebarItems.length; i++) {
            if($scope.sidebarItems[i].name.search(path) != -1) {
                $scope.selectedLink = $scope.sidebarItems[i];
                break;
            }
            else $scope.selectedLink = $scope.sidebarItems[0];
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



