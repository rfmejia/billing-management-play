var hoaControllers = angular.module("hoaControllers", []);
hoaControllers.value('entrypoint', "http://hoa-play-scala.herokuapp.com/api");

hoaControllers.controller("rootController", ["$state", "$cookies",
    function($state, $cookies) {
    console.log("loaded on page load");
    $state.go("authenticate")
    //check credentials,
    // if(!auth) $state.go("authenticate");

    console.log($cookies.id);

    //true go to workspace state,
    //false go to auhtenticate state
}]);

hoaControllers.controller("authenticateController", ["$scope", "$state",
function($scope, $state) {
    console.log($scope);
    $scope.verifyCredentials = function() {
        $state.go("workspace");
    }
}]);

hoaControllers.controller("verifyController", [function() {

}]);

hoaControllers.controller('workspaceController', ['$rootScope', '$scope', "$http", "$state",  "entrypoint", "TenantsService", "UsersService", "InvitesService", "r_hoaLinks",  "r_hoaMainService",
    function ($rootScope, $scope, $http, $state, entrypoint, TenantsService, UsersService, InvitesService, r_hoaLinks, r_hoaMainService) {
        r_hoaMainService.setLinks(r_hoaLinks);
        TenantsService.buildRequest();
        UsersService.buildRequest();
        InvitesService.buildRequest();
}]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state",
function ($scope, $location, $state) {
    $scope.sidebarItems = [
        {link : "#/inbox", header : "Mailbox", name : "Inbox", title : "Inbox" , id : "inboxLink", state : "workspace.inbox"},
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




// Inbox related controllers
hoaControllers.controller("inboxController", [
   function() {
   }
]);
// end - Inbox related controllers



// Tenant related controllers
hoaControllers.controller("tenantsListController", ["$scope", "$state", "TenantsService", "r_tenantTop",
  function ($scope, $state, TenantsService, r_tenantTop) {
    console.log(r_tenantTop);
    $scope.tenants = r_tenantTop._embedded.item;
    $scope.onTenantClick = function(tenant) {
        var tempTenant = TenantsService.getTenant(tenant.id);

        if(tempTenant.sameTenant) {
            $scope.tenant = tempTenant.tenant;
            $state.go("workspace.tenants.tenantView", {"id" : $scope.tenant.id});
        }
        else tempTenant.tenant.query({id : tenant.id}, function(data) {
            $scope.tenant = data;
            TenantsService.setTenant(data);
            $state.go("workspace.tenants.tenantView", {"id" : data.id});
        });

    }
}]);

hoaControllers.controller("tenantsViewController", ["$scope", "$state", "$stateParams", "TenantsService",
    function($scope, $state, $stateParams, TenantsService){
        $scope.selectedTenant = TenantsService.getTenant($stateParams.id).tenant;
        $scope.values = [];

        $scope.billings = [{isPaid : true, isActive : false, date : "March 2014"},
                           {isPaid : true, isActive : false, date : "February 2014"},
                           {isPaid : false, isActive : false, date : "January 2014"}];

        $scope.isInfoOpen = true;
        var data = $scope.selectedTenant._template.edit.data;
        for(var i = 0; i < data[0].length; i++) {
            $scope.values.push({"prompt" : data[0][i].prompt, "entry": $scope.selectedTenant[data[0][i].name]});
        }
        $scope.toggleInfo = function() {
            $scope.isInfoOpen = !$scope.isInfoOpen;
        }

        $scope.onEditClicked = function() {
            $state.go("workspace.tenants.tenantView.edit");
        }

        $scope.onBackClicked = function() {
            $state.go("workspace.tenants");
       }
    }]);

hoaControllers.controller("tenantsEditController", ["$scope", "$state", "r_tenant", "TenantsService",
    function($scope, $state, r_tenant, TenantsService) {
        var tenantData = r_tenant._template.edit.data;
        $scope.controlData = [];
        $scope.editedData = {};
        $scope.title = {};

        $scope.resetData = function() {
            while($scope.controlData.length > 0) {
                $scope.controlData.pop();
            }
            for(var i = 0; i < tenantData[0].length; i++) {
                var pushData = {
                    "name"         : tenantData[0][i].name,
                    "prompt"       : tenantData[0][i].prompt,
                    "value"        : r_tenant[tenantData[0][i].name],
                    "isRequired"   : tenantData[0][i].required
                };
                $scope.editedData[pushData.name] = pushData.value;

                if(tenantData[0][i].name == "tradeName") {
                    $scope.title = pushData;
                }
                else $scope.controlData.push(pushData);
            }
        }

        $scope.onCancelClicked = function() {
            $state.go("workspace.tenants.tenantView", {"id" : r_tenant.id});
        }

        $scope.onSubmitClicked = function(newData) {
            $scope.editedData = angular.copy(newData);
            TenantsService.editTenant(r_tenant.id, $scope.editedData);
        }

        $scope.resetData();
}]);
// end- Tenant related controllers

// User related controllers
hoaControllers.controller('usersListController', ["$scope", "$state", "$modal", "UsersService", "r_usersRoot", "r_invitesRoot",
    function ($scope, $state, $modal, UsersService, r_usersRoot, r_invitesRoot) {
    $scope.onUserClick = function(user) {
        console.log(user);
    }

    $scope.onInviteClick = function() {
        $scope.opts = {
            scope       : $scope,
            templateUrl : "app/components/users/maincontent-users-invite.html",
            controller  : "usersInviteController",
            resolve     : {
                r_inviteTemplate : function(UsersService) {
                    return UsersService.getList().query().$promise;
            }
        }};

        $scope.inviteUserModal = $modal.open($scope.opts);

        $scope.inviteUserModal.result.then(function (editedData) {
            //on ok button pressed
            console.log(editedData);
        }, function() {
            console.log("Modal dismissed");
        });
    }

    $scope.isPendingInvitesOpen = true;
    $scope.togglePendingInfo = function() {
        $scope.isPendingInvitesOpen = !$scope.isPendingInvitesOpen;
    }

    $scope.cancelInvitation = function(user) {
        console.log("cancel invitation");
    }

    $scope.pendingUsers = r_invitesRoot._embedded.item;
    $scope.users = r_usersRoot._embedded.item;
}]);

hoaControllers.controller('usersViewController', ['$scope', "$stateParams", "$state", "UsersService",
    function ($scope, $stateParams, $state, UsersService) {
    $scope.selectedUser = UsersService.getUser($stateParams.username).user;
    console.log($scope.selectedUser);
    $scope.onBackClicked = function() {
        $state.go("workspace.users");
    }
}]);

hoaControllers.controller('usersInviteController', ['$scope', "$modalInstance", "r_inviteTemplate", "UsersService",
    function ($scope, $modalInstance, r_inviteTemplate, UsersService) {

        $scope.roles = ["Administrator", "Approver", "Checker", "Encoder"];
        $scope.editedData = {};

        var template = r_inviteTemplate._template.create.data;
        $scope.controlData = [];
        $scope.editedData = {};

        $scope.resetData = function() {
            var pushData = {
               "name"         : "email",
               "prompt"       : "User e-mail",
               "value"        : "",
               "isRequired"   : true
           };
            $scope.editedData[pushData.name] = pushData.value;
            $scope.controlData.push(pushData);
            $scope.admin = {"name" : "admin", "prompt" : "Administrator", "value" : false};
            $scope.roles = [
                {"name" : "approver", "prompt" : "Approver", "value" : false},
                {"name" : "checker", "prompt" : "Checker", "value" : false},
                {"name" : "encoder", "prompt" : "Encoder", "value" : false}
            ];
            $scope.editedData[$scope.admin.name] = $scope.admin.value;
            for(var i = 0; i < $scope.roles.length; i++) {
                $scope.editedData[$scope.roles[i].name] = $scope.roles[i].value;
            }

            console.log($scope.editedData);
         }

        $scope.onUserInviteClicked = function(newData) {
            $scope.editedData = angular.copy(newData);
            UsersService.inviteUser($scope.editedData);
        }

        $scope.checkboxClicked = function(roleName) {
            $scope.editedData[roleName] = !$scope.editedData[roleName];
            console.log($scope.editedData);
            console.log($scope.editedData[roleName]);
        }

        $scope.adminClicked = function() {
            $scope.editedData.admin = !$scope.editedData.admin;
            for(var i = 0; i < $scope.roles.length; i++) {
                $scope.editedData[$scope.roles[i].name] = $scope.editedData.admin;
            }
        }

        $scope.onSubmitClicked = function() {
            $modalInstance.close($scope.editedData);
        }

        $scope.onCancelClicked = function() {
            $modalInstance.dismiss("cancel");
        }

        $scope.resetData();
}]);
// end - User releated controllers

hoaControllers.controller('mailboxController', ['$scope', function ($scope) {

}]);



