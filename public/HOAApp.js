var hoaApp = angular.module('hoaApp', [
    "ui.bootstrap",
    "ui.router",
    "hoaFilters",
    "hoaServices",
    "hoaControllers",
    "hoaDirectives"]);

hoaApp.config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("authenticate", {
                views : {
                    "rootView@"  : {
                        templateUrl     : "app/shared/content/authentication/root-authenticate.html",
                        controller      : "authenticateController"
                    }
                }
            })
                .state("authenticate.verify", {
                    views   : {
                        "authenticateBox@"  : {
                            templateUrl     : "app/shared/content/authentication/verifyBox.html",
                            controller      : "verifyController"
                        }
                    }
                })
            .state("workspace",  {
                resolve     : {
                    r_hoaMainService    : "HOAMainService",
                    r_hoaLinks          : function(r_hoaMainService) {
                        console.log("request");
                        var list = r_hoaMainService.getLinks().get();
                        console.log(list);
                        return r_hoaMainService.getLinks().get().$promise;
                    }
                },
                views : {
                    "rootView@" : {
                        templateUrl     : "app/shared/content/dashboard/root-workspace.html",
                        controller      : "workspaceController"
                    },
                    "sidebar@workspace" : {
                        templateUrl : "app/shared/sidebar/sidebar.html",
                        controller  : "sidebarController"
                    }, 
                    "contentArea@workspace" : {
                        templateUrl : "app/components/mailbox/maincontent-inbox.html",
                        controller  : "inboxController"
                    }
                }
            })
                .state("workspace.inbox", {
                    url         :"/inbox",
                    views       : { 
                        "contentArea@workspace"  : {
                            templateUrl : "app/components/mailbox/maincontent-inbox.html",
                            controller  : "inboxController"
                        }
                    }
                })
                .state("workspace.delivered", {
                        url: "/delivered",
                        views: {
                            "contentArea@workspace"  : {
                            template    : "delivered"
                        }}
                })
                .state("workspace.pending", {
                        url: "/pending",
                        views: {
                            "contentArea@workspace"  : {
                            template    : "pending"
                        }}
                })
                .state("workspace.tenants", {
                        url: "/tenants",
                        views: {
                            "contentArea@workspace"  : {
                                templateUrl     : "app/components/tenants/maincontent-tenants-list.html",
                                controller      : "tenantsListController"
                            }
                        },
                        resolve : {
                            r_tenantsService : "TenantsService",
                            r_tenantTop     : function(r_tenantsService) {
                                var tenantApi = r_tenantsService.getList();
                                return tenantApi.query().$promise;
                            }
                        }
                })
                    .state("workspace.tenants.tenantView", {
                        url      : "/tenant-view/:id", 
                        resolve  :  {
                            r_tenantId : function($stateParams) {
                                return $stateParams.id;
                            }
                        },
                        views    : {
                            "contentArea@workspace" : {
                                templateUrl     : "app/components/tenants/maincontent-tenant-view.html",
                                controller      : "tenantsViewController"
                            }
                        }
                    })
                        .state("workspace.tenants.tenantView.edit", {
                            url: "/tenant-edit",
                            resolve : {
                                r_tenantService : "TenantsService",
                                r_tenant : function(r_tenantService, r_tenantId) {
                                     var tempTenant = r_tenantService.getTenant(r_tenantId);
                                     if(tempTenant.sameTenant) return tempTenant.tenant;
                                     else {
                                        return tempTenant.tenant.query({id : r_tenantId}).$promise;
                                     }
                                }
                            },
                            views : {
                                "contentArea@workspace" : {
                                    templateUrl     : "app/components/tenants/maincontent-tenant-edit.html",
                                    controller      : "tenantsEditController"
                                }
                            }
                        })
                .state("workspace.users", {
                        url: "/users",
                        resolve : {
                            r_usersService      : "UsersService",
                            r_invitesService    : "InvitesService",
                            r_usersRoot       : function(r_usersService) {
                                return r_usersService.getList().query().$promise;
                            },
                            r_invitesRoot     : function(r_invitesService) {
                                return r_invitesService.getRootAPI().query().$promise;
                            }
                        },
                        views: {
                            "contentArea@workspace"  : {
                            templateUrl : "app/components/users/maincontent-users-list.html",
                            controller  : "usersListController"
                        }}
                })
                    .state("workspace.users.userView", {
                        url     : "/users-view/:username",
                        resolve : {
                            r_userName: function($stateParams) {
                                return $stateParams.username;
                            },
                            r_usersService : function(r_usersService) {
                                return r_usersService;
                            }
                        },
                        views   : {
                            "contentArea@workspace"  : {
                                templateUrl     : "app/components/users/maincontent-users-view.html",
                                controller      : "usersViewController"
                            }
                        }
                    })
                    .state("workspace.users.inviteUser", {
                        url     :"/invite-user",
                        resolve : {
                            r_inviteTemplate : function(r_usersService) {
                                return r_usersService.getList().query().$promise;
                            }
                        },
                        views   : {
                            "contentArea@workspace"  : {
                                templateUrl     : "app/components/users/maincontent-users-invite.html",
                                controller      : "usersInviteController"
                            }
                        }
                    });

    }
]);
