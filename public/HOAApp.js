var hoaApp = angular.module('hoaApp', [
    "ngCookies",
    "ui.bootstrap", "ui.router",
    "module.tenants", "module.mailbox", "module.users",
    "service.dashboard", "service.tenants", "service.invites", "service.users",
    "controller.tenantslist", "controller.tenantview", "controller.tenantedit", "controller.tenantcreate",
    "controller.completeusers", "controller.userview", "controller.inviteuser",
    "hoaFilters",
    "hoaControllers",
    "hoaDirectives"]);

hoaApp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", 
    function($stateProvider, $urlRouterProvider) {

        var authenticate = {
            views       : {
                "rootView@"  : {
                    templateUrl     : "app/shared/content/authentication/views/root-authenticate.html",
                    controller      : "authenticateController"
                }
            }
        };

        var verification = {
            views   : {
                "authenticateBox@"  : {
                    templateUrl     : "app/shared/content/authentication/views/verifyBox.html",
                    controller      : "verifyController"
                }
            }
        };

        var workspace    = {
            resolve     : {
                r_linkService       : "service.hoalinks",
                r_tenantsService    : "service.hoatenants",
                r_hoaLinks          : function(r_linkService, r_tenantsService) {
                    return r_linkService.getLinks();
                }
            },
            views       : {
                "rootView@"             : {
                    templateUrl     : "app/shared/content/dashboard/views/root-workspace.html",
                    controller      : "workspaceController"
                },
                "sidebar@workspace"     : {
                    templateUrl     : "app/shared/sidebar/views/sidebar.html",
                    controller      : "sidebarController"
                },
                "contentArea@workspace" : {
                    templateUrl     : "app/components/mailbox/views/maincontent-inbox.html",
                    controller      : "inboxController"
                }
            }
        };

        $stateProvider
            .state("authenticate",          authenticate)
            .state("authenticate.verify",   verification)
            .state("workspace",             workspace);
    }
]);
