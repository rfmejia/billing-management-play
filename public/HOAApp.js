var hoaApp = angular.module('hoaApp', [
    "ngCookies",
    "ui.bootstrap", "ui.router",
    "module.tenants", "module.mailbox", "module.users",
    "hoaFilters",
    "hoaServices",
    "hoaControllers",
    "hoaDirectives"]);

hoaApp.config(["$stateProvider", "$urlRouterProvider",
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
                r_hoaMainService    : "HOAMainService",
                r_hoaLinks          : function(r_hoaMainService) {
                    console.log("request");
                    var list = r_hoaMainService.getLinks().get();
                    console.log(list);
                    return r_hoaMainService.getLinks().get().$promise;
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
