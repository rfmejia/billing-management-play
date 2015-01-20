var userInvite = angular.module("module.users");

userInvite.controller("controller.inviteuser", ["$scope", "$modalInstance", "r_inviteTemplate", 
	function($scope, $modalInstance, r_inviteTemplate) {

		$scope.controlData = [];
        $scope.editedData  = {};
        $scope.isValid = true;
        var masterData     = r_inviteTemplate;

        $scope.resetData = function() {
            $scope.editedData[masterData.email.name] = masterData.email.value;
            $scope.controlData.push(masterData.email);
            $scope.admin = masterData.roles.admin;
            $scope.roles = masterData.roles.other;
            
            $scope.editedData[$scope.admin.name] = $scope.admin.value;
            for(var i = 0; i < $scope.roles.length; i++) {
                $scope.editedData[$scope.roles[i].name] = $scope.roles[i].value;
            }
         }

        $scope.onUserInviteClicked = function(newData) {
            $scope.editedData = angular.copy(newData);
        }

        $scope.checkboxClicked = function(roleName) {
            $scope.editedData[roleName] = !$scope.editedData[roleName];
        }

        $scope.adminClicked = function() {
            $scope.editedData.admin = !$scope.editedData.admin;
            for(var i = 0; i < $scope.roles.length; i++) {
                $scope.editedData[$scope.roles[i].name] = $scope.editedData.admin;
            }

        }

        $scope.onSubmitClicked = function() {
            if($scope.inviteUserForm.email.$invalid) {

            }
            else {
                $modalInstance.close($scope.editedData);
            }
        }

        $scope.onCancelClicked = function() {
            $modalInstance.dismiss("cancel");
        }

        $scope.validate = function(data) {
            $scope.isValid = $scope.inviteUserForm[data.name].$invalid && 
            $scope.inviteUserForm[data.name].$dirty
            return $scope.isValid;
        }

        $scope.resetData();
	}]);