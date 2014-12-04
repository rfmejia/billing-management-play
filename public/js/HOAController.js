var hoaControllers = angular.module("hoaControllers", []);
hoaControllers.value('entrypoint', "http://hoa-play-scala.herokuapp.com/api");

hoaControllers.controller('mainController', ['$rootScope', '$scope', "$http", "$state",  "entrypoint",
    function ($rootScope, $scope, $http, $state, entrypoint) {
        $http.get(entrypoint).success(function(data) {
            $state.go("root");
            if(data._links) {
                if(data._links["hoa:users"]) {
                    $scope.usersTop = data._links["hoa:users"];
                    $rootScope.$broadcast("userLinksReady", null);
                }
                if(data._links["hoa:tenants"]){
                    $scope.tenantsTop = data._links["hoa:tenants"];
                    $rootScope.$broadcast("tenantsLinksReady", null);
                }
                if(data._links["hoa:invites"]) {
                    $scope.invitesTop = data._links["hoa:invites"];
                    $rootScope.$broadcast("invitesLinksReady", null);
                }

            }
        });
}]);

hoaControllers.controller("contentController", ["$rootScope", "$scope", "TenantsService", "UsersService", "InvitesService",
    function($rootScope, $scope, TenantsService, UsersService, InvitesService) {
        $scope.$on("tenantsLinksReady", function(event, args) {
            $scope.isUsersUpdated = false;
            TenantsService.setTopUrl($scope.tenantsTop);
            TenantsService.getList().query(function(data) {
                $scope.tenants = data._embedded.item;
            });
        });

        $scope.$on("userLinksReady", function(event, args) {
            UsersService.setTopUrl($scope.usersTop);
        });

        $scope.$on("invitesLinksReady", function(event, args) {
            InvitesService.setTopUrl($scope.invitesTop);
        });

    }]);

hoaControllers.controller('sidebarController', ['$scope', "$location", "$state",
function ($scope, $location, $state) {
    $scope.sidebarItems = [
        {link : "#/delivered", header : "Mailbox", name : "Delivered", title : "Delivered",  id : "deliveredLink", state : "root.delivered"},
        {link : "#/pending", header : "Mailbox", name : "Pending", title : "Pending" , id : "pendingLink", state : "root.pending"},
        {link : "#/tenants", header : "Management", name: "Tenants", title : "Tenants List", id : "tenantsLink", state : "root.tenants"},
        {link : "#/users", header : "Management", name : "Users", title: "Users List", id: "usersLink", state : "root.users"}
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
// Tenant related controllers
hoaControllers.controller("tenantsListController", ["$scope", "$state", "TenantsService",
  function ($scope, $state, TenantsService) {
    $scope.onTenantClick = function(tenant) {
        var tempTenant = TenantsService.getTenant(tenant.id);
        
        if(tempTenant.sameTenant) {
            $scope.tenant = tempTenant.tenant;
            $state.go("root.tenants.tenantView", {"id" : $scope.tenant.id});
        }
        else tempTenant.tenant.query({id : tenant.id}, function(data) {
            $scope.tenant = data;
            TenantsService.setTenant(data);
            $state.go("root.tenants.tenantView", {"id" : data.id});
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
            $state.go("root.tenants.tenantView.edit");
        }

        $scope.onBackClicked = function() {
            $state.go("root.tenants");
       }
    }]);

hoaControllers.controller("tenantsEditController", ["$scope", "$state", "tenant", "TenantsService",
    function($scope, $state, tenant, TenantsService) {
        console.log(tenant);
        var tenantData = tenant._template.edit.data;
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
                    "value"        : tenant[tenantData[0][i].name],
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
            $state.go("root.tenants.tenantView", {"id" : tenant.id});
        }

        $scope.onSubmitClicked = function(newData) {
            $scope.editedData = angular.copy(newData);
            TenantsService.editTenant(tenant.id, $scope.editedData);
        }

        $scope.resetData();
}]);
// end- Tenant related controllers

// User related controllers
hoaControllers.controller('usersListController', ["$scope", "$state", "$modal", "UsersService", "usersRoot", "invitesRoot",
    function ($scope, $state, $modal, UsersService, usersRoot, invitesRoot) {
    $scope.onUserClick = function(user) {
        console.log(user);
    }

    $scope.onInviteClick = function() {
        console.log("invite clicked");
        // $state.go("root.users.inviteUser");

        $scope.opts = {
            scope       : $scope,
            templateUrl : "../views/partials/maincontent-users-invite.html",
            controller  : "usersInviteController",
            resolve     : {
                inviteTemplate : function(UsersService) {
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
        console.log($scope.isPendingInvitesOpen);
        $scope.isPendingInvitesOpen = !$scope.isPendingInvitesOpen;
    }

    $scope.cancelInvitation = function(user) {
        console.log("cancel invitation");
    }

    $scope.pendingUsers = invitesRoot._embedded.item;
    $scope.users = usersRoot._embedded.item;
}]);

hoaControllers.controller('usersViewController', ['$scope', "$stateParams", "$state", "UsersService", 
    function ($scope, $stateParams, $state, UsersService) {
    $scope.selectedUser = UsersService.getUser($stateParams.username).user;
    console.log($scope.selectedUser);
    $scope.onBackClicked = function() {
        $state.go("root.users");
    }
}]);

hoaControllers.controller('usersInviteController', ['$scope', "$modalInstance", "inviteTemplate", "UsersService",
    function ($scope, $modalInstance, inviteTemplate, UsersService) {

        $scope.roles = ["Administrator", "Approver", "Checker", "Encoder"];
        $scope.editedData = {};

        var template = inviteTemplate._template.create.data;
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



