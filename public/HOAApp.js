var hoaapp = angular.module('hoaApp', [
    "ngCookies",
    "ui.bootstrap", "ui.router", "angularSpinner",
    "module.tenants", "module.mailbox", "module.users",
    "service.dashboard", "service.templates", "service.tenants", "service.invites", "service.users", "service.documents",
    "controller.inbox", "controller.drafts", "controller.create", "controller.root",
    "controller.tenantslist", "controller.tenantview", "controller.tenantedit", "controller.tenantcreate",
    "controller.completeusers", "controller.userview", "controller.inviteuser",
    "hoaFilters",
    "hoaControllers",
    "hoaDirectives"]);

hoaapp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", 'usSpinnerConfigProvider', 
    function($stateProvider, $urlRouterProvider,  $locationProvider, $httpProvider, usSpinnerConfigProvider) {

        $httpProvider.responseInterceptors.push('httpInterceptor');
        $locationProvider.html5Mode(true);
        
        usSpinnerConfigProvider.setDefaults({
            color   : '#2196F3',
            lines   : 9,
            corners : 1,
            length  : 1
        });

        var authenticate = {
            url : "/login"
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
                    templateUrl     : "app/shared/content/workspace/views/workspace.html",
                    controller      : "workspaceController"
                },
                "sidebar@workspace"     : {
                    templateUrl     : "app/shared/content/workspace/sidebar/views/sidebar.html",
                    controller      : "sidebarController"
                },
                "contentArea@workspace" : {
                    templateUrl     : "app/components/mailbox/views/maincontent-inbox.html",
                    controller      : "controller.inbox"
                }
            }
        };

        $stateProvider
            .state("authenticate",          authenticate)
            .state("workspace",             workspace);
    }
]);

hoaapp.run(['$rootScope', 'usSpinnerService', 
    function($rootScope, usSpinnerService, usSpinnerConfigProvider){

        $rootScope.$on('$stateChangeStart', 
            function(event, toState, toParams, fromState, fromParams){
                usSpinnerService.spin('spinner');
             });  
        
        $rootScope.$on('$stateChangeSuccess', 
            function(event, toState, toParams, fromState, fromParams){ 
                usSpinnerService.stop('spinner');
            }); 
}]);
