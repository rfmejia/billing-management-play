var user = angular.module("module.users");

user.controller("controller.userview", ['$scope', "$state", "r_user",
    function ($scope, $state, r_user) {
    $scope.selectedUser = r_user;
    $scope.onBackClicked = function() {
        $state.go("workspace.users");
    }
}]);