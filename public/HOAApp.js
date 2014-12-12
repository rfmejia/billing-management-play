var hoaApp = angular.module('hoaApp', [
    "ui.bootstrap", "ui.router",
    "module.tenants", "module.mailbox", "module.users",
    "service.dashboard", "service.tenants", 
    "hoaFilters",
    "hoaServices",
    "hoaControllers",
    "hoaDirectives"]);

hoaApp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", 
    function($stateProvider, $urlRouterProvider) {

        var authenticate = {
            views       : {
                "rootView@"  : {
                    templateUrl     : "app/shared/content/authentication/root-authenticate.html",
                    controller      : "authenticateController"
                }
            }
        };

        var verification = {
            views   : {
                "authenticateBox@"  : {
                    templateUrl     : "app/shared/content/authentication/verifyBox.html",
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
                    templateUrl     : "app/shared/content/dashboard/root-workspace.html",
                    controller      : "workspaceController"
                },
                "sidebar@workspace"     : {
                    templateUrl     : "app/shared/sidebar/sidebar.html",
                    controller      : "sidebarController"
                }, 
                "contentArea@workspace" : {
                    templateUrl     : "app/components/mailbox/maincontent-inbox.html",
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
