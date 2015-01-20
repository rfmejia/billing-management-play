var app = angular.module("module.users", [
        "ngResource",
        "ui.router",
        "service.tenants", "service.users"
    ]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider){
        var usersList = {
            url: "/users",
            resolve     : {
                r_usersService      : "service.hoausers",
                r_invitesService    : "service.hoainvites",
                usersService        : function(r_usersService) {
                    return r_usersService;
                },
                invitesService      : function(r_invitesService) {
                    return r_invitesService; 
                },
                r_combinedRoot      : function(usersService, invitesService, $q) {
                    var deferred = $q.defer();

                    $q.all([usersService.queryApi()]).then(
                        function(response){
                            deferred.resolve(response);
                        });
                    return deferred.promise;
                },
                r_users             : function(r_combinedRoot) {
                    return r_combinedRoot[0]._embedded.item;
                },
                r_invites           : function(invitesService, r_combinedRoot) {
                    var template = invitesService.getTemplate();
                    return {
                            "pendingInvites"  : "",
                            "template"        : ""
                        };
                }
            },
            views       : {
                "contentArea@workspace"  : {
                    templateUrl     : "app/components/users/views/maincontent-users-list.html",
                    controller      : "controller.completeusers"
                }
            }
        };

        var usersView = {
            url         : "/users-view/:username",
            resolve     : {
                r_user          : function($stateParams, usersService) {
                    return usersService.queryApi($stateParams.username);
                }
            },
            views       : {
                "contentArea@workspace"  : {
                    templateUrl     : "app/components/users/views/maincontent-users-view.html",
                    controller      : "controller.userview"
                }
            }
        };


        var usersEdit = {

        };

        $stateProvider
            .state("workspace.users",               usersList)
            .state("workspace.users.userView",      usersView);
    }]);