var users	= angular.module("module.users");

users.controller("controller.completeusers", 
	["$scope", "$state",  "$modal", "r_users", "r_invites", 
	function ($scope, $state,  $modal, r_users, r_invites){
		
		//vars
		$scope.isPendingInvitesOpen	= true;
		$scope.pendingUsers			= r_invites.pendingInvites;
		$scope.users				= r_users;
		$scope.pendingUsers			= null;
		//end vars

		//Callback for user list item clicked
		$scope.onUserClick = function(user) {
			$state.go("workspace.users.userView", {"username" : user.username});
		};;
		//Callback for invite button clicked
		$scope.onInviteClicked = function() {
			$scope.opts = {
				scope		: $scope,
				templateUrl	: "app/components/workspace/users/views/maincontent-users-invite.html",
				controller	: "controller.inviteuser",
				resolve		: {
	                r_inviteTemplate : function() {
	                    return r_invites.template;
					}
				}
			}//opts end

			//open modal
			$scope.inviteUserModal = $modal.open($scope.opts);
			
			//Send action
			var send = function(data) {

			};
			
			//Cancel clean up
			var cancelled = function() {

			};

			$scope.inviteUserModal.result.then(send, cancelled);
		};;;;

		//toggle accordion for pending invites
		$scope.togglePendingInfo = function() {
			$scope.isPendingInvitesOpen = !$scope.isPendingInvitesOpen;
		};;

		//cancel pending invite
		$scope.cancelInvitation = function(user) {

		}

	}
]);