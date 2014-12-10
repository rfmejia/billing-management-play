var app = angular.module("module.users", [
        "ui.router",
        "hoaFilters",
        "hoaServices",
        "hoaControllers",
        "hoaDirectives"
    ]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider){
        var usersList = {
            url: "/users",
            resolve     : {
                r_usersService      : "UsersService",
                r_invitesService    : "InvitesService",
                r_usersRoot         : function(r_usersService) {
                    return r_usersService.getList().query().$promise;
                },
                r_invitesRoot       : function(r_invitesService) {
                    return r_invitesService.getRootAPI().query().$promise;
                }
            },
            views       : {
                "contentArea@workspace"  : {
                    templateUrl     : "app/components/users/maincontent-users-list.html",
                    controller      : "usersListController"
                }
            }
        };

        var usersView = {
            url         : "/users-view/:username",
            resolve     : {
                r_userName      : function($stateParams) {
                    return $stateParams.username;
                },
                r_usersService  : function(r_usersService) {
                    return r_usersService;
                }
            },
            views       : {
                "contentArea@workspace"  : {
                    templateUrl     : "app/components/users/maincontent-users-view.html",
                    controller      : "usersViewController"
                }
            }
        };

        var usersInvite = {
            url         :"/invite-user",
            resolve     : {
                r_inviteTemplate : function(r_usersService) {
                    return r_usersService.getList().query().$promise;
                }
            },
            views       : {
                "contentArea@workspace"  : {
                    templateUrl     : "app/components/users/maincontent-users-invite.html",
                    controller      : "usersInviteController"
                }
            }
        };

        var usersEdit = {

        };

        $stateProvider
            .state("workspace.users",               usersList)
            .state("workspace.users.userView",      usersView)
            .state("workspace.users.inviteUser",    usersInvite);
    }]);