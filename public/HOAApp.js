var hoaapp = angular.module('hoaApp', [
    "ngCookies", "ngResource",
    "ui.bootstrap", "ui.router", "angularSpinner",
    "module.users", "module.tenants", "module.mailbox", 
    ]);

hoaapp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", 'usSpinnerConfigProvider', 
    function($stateProvider, $urlRouterProvider,  $locationProvider, $httpProvider, usSpinnerConfigProvider) {

        $httpProvider.responseInterceptors.push('httpInterceptor');
        
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
                r_linkSrvc          : "service.hoalinks",
                r_mailboxSrvc       : "service.mailbox",
                r_workspace         : function(r_linkSrvc, r_mailboxSrvc, $q) {
                    var deferred       = $q.defer();
                    var linksPromise   = r_linkSrvc.getLinks();
                    
                    var mailboxPromise = r_mailboxSrvc.queryApi();
                    
                    var success        = function(response) {
                        deferred.resolve(response);
                    }

                    $q.all([linksPromise, mailboxPromise]).then(success);
                    return deferred.promise;
                },
                r_hoaLinks          : function(r_workspace) {
                    return r_workspace[0];
                },
                r_mailboxes         : function(r_workspace) {
                    return r_workspace[1];
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
                    controller      : "controller.drafts"
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
