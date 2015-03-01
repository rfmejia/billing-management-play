/**
 * Created by juancarlos.yu on 2/22/15.
 */
angular
    .module('hoaApp')
    .controller('workspaceController',[
        '$modal',
        'userDetails',
        'userService',
        '$state',
        '$location',
        'helper.documents',
        workspaceController
    ]);

angular
    .module('hoaApp')
    .controller('logoutModalCtrl', [
        '$scope',
        '$modalInstance',
        'modal',
        'negativeBtn',
        'positiveBtn',
        modalController
    ]);

function workspaceController($modal ,userDetails, userService, $state, $location, documentsHelper) {
    var vm = this;

    /** On click of logout option launch a dialog **/
    vm.onLogOutClicked = onLogoutClicked;
    vm.userDetails = userDetails;

    activate();

    //region FUNCTION_CALL
    function activate() {
        if($location.path() == '/') $state.go("workspace.pending.drafts", documentsHelper.getQueryParameters(), {reload : true});
    }

    function onLogoutClicked() {
        openModal();
    }

    function openModal() {
        var modal = {
            'title'     : 'Logging out',
            'message'   : 'Are you sure you want to logout?'
        };

        var negativeButton = {
            'type'      : 'btn-default',
            'message'   : 'Cancel'
        };

        var positiveButton = {
            'type'      : 'btn-danger',
            'message'   : 'Logout'
        };

        var modalInstance = $modal.open(
            {
                templateUrl : 'app/components/shared/elements/simple-confirmation-modal.html',
                controller  : 'logoutModalCtrl',
                backdrop    : 'static',
                resolve     : {
                    modal   : function() {
                        return modal;
                    },
                    negativeBtn : function() {
                        return negativeButton;
                    },
                    positiveBtn : function() {
                        return positiveButton;
                    }
                }
            });

        modalInstance.result.then(positiveClicked, negativeClicked);

        function positiveClicked(response) {
            userService.logoutUser();
        }

        function negativeClicked() {}

    }

    //endregion
}

function modalController($scope, $modalInstance, modal, negativeButton, positiveButton) {
    $scope.modal = modal;
    $scope.negativeButton = negativeButton;
    $scope.positiveButton = positiveButton;

    console.log(negativeButton);

    $scope.onPositiveClicked = function() {
        $modalInstance.close();
    };

    $scope.onNegativeClicked = function() {
        console.log("on negative clicked");
    };
}