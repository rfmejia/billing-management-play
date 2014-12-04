var hoaApp = angular.module('hoaApp', [
    "ui.bootstrap",
    "ui.router",
    "ui.bootstrap.showErrors",
    "hoaFilters",
    "hoaServices",
    "hoaControllers",
    "hoaDirectives"]);

hoaApp.config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("root",  {
                views : {
                    "sidebar@"  : {
                        templateUrl : "../views/partials/sidebar.html",
                        controller  : "sidebarController"
                    }
                }
            })
                .state("root.delivered", {
                        url: "/delivered",
                        views: {
                            "contentArea@"  : {
                            template    : "delivered"
                        }}
                })
                .state("root.pending", {
                        url: "/pending",
                        views: {
                            "contentArea@"  : {
                            template    : "pending"
                        }}
                })
                .state("root.tenants", {
                        url: "/tenants",
                        views: {
                            "contentArea@"  : {
                            templateUrl     : "../views/partials/maincontent-tenants-list.html",
                            controller      : "tenantsListController"
                        }}
                })
                    .state("root.tenants.tenantView", {
                        url      : "/tenant-view/:id", 
                        resolve  :  {
                            tenantId : function($stateParams) {
                                return $stateParams.id;
                            }
                        },
                        views    : {
                            "contentArea@" : {
                                templateUrl     : "../views/partials/maincontent-tenant-view.html",
                                controller      : "tenantsViewController"
                            }
                        }
                    })
                        .state("root.tenants.tenantView.edit", {
                            url: "/tenant-edit",
                            resolve : {
                                tenantService : "TenantsService",
                                tenant : function(tenantService, tenantId) {
                                     var tempTenant = tenantService.getTenant(tenantId);
                                     if(tempTenant.sameTenant) return tempTenant.tenant;
                                     else {
                                        return tempTenant.tenant.query({id : tenantId}).$promise;
                                     }
                                }
                            },
                            views : {
                                "contentArea@" : {
                                    templateUrl     : "../views/partials/maincontent-tenant-edit.html",
                                    controller      : "tenantsEditController"
                                }
                            }
                        })
                .state("root.users", {
                        url: "/users",
                        resolve : {
                            usersService     : "UsersService",
                            invitesService  : "InvitesService",
                            usersRoot       : function(usersService) {
                                return usersService.getList().query().$promise;
                            },
                            invitesRoot     : function(invitesService) {
                                return invitesService.getRootAPI().query().$promise;
                            }
                        },
                        views: {
                            "contentArea@"  : {
                            templateUrl : "../views/partials/maincontent-users-list.html",
                            controller  : "usersListController"
                        }}
                })
                    .state("root.users.userView", {
                        url     : "/users-view/:username",
                        resolve : {
                            userName: function($stateParams) {
                                return $stateParams.username;
                            },
                            usersService : function(usersService) {
                                return usersService;
                            }
                        },
                        views   : {
                            "contentArea@"  : {
                                templateUrl     : "../views/partials/maincontent-users-view.html",
                                controller      : "usersViewController"
                            }
                        }
                    })
                    .state("root.users.inviteUser", {
                        url     :"/invite-user",
                        resolve : {
                            inviteTemplate : function(usersService) {
                                return usersService.getList().query().$promise;
                            }
                        },
                        views   : {
                            "contentArea@"  : {
                                templateUrl     : "../views/partials/maincontent-users-invite.html",
                                controller      : "usersInviteController"
                            }
                        }
                    });
    }
]);
