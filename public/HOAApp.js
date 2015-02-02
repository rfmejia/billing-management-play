var hoaapp = angular.module('hoaApp', [
    "ngCookies", "ngResource",
    "ui.bootstrap", "ui.router", "angularSpinner",
    "module.users", "module.tenants", "module.mailbox",
    "mgcrea.ngStrap", "mgcrea.ngStrap.helpers.dimensions", "mgcrea.ngStrap.helpers.dateParser",
    ]);

hoaapp.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", "$datepickerProvider", 'usSpinnerConfigProvider',
    function($stateProvider, $urlRouterProvider,  $locationProvider, $httpProvider, $datepickerProvider, usSpinnerConfigProvider) {

        $httpProvider.responseInterceptors.push('httpInterceptor');

        $urlRouterProvider.otherwise("/");

        usSpinnerConfigProvider.setDefaults({
            color   : '#2196F3',
            lines   : 9,
            corners : 1,
            length  : 1
        });

        //configure angular strap datepicker
        angular.extend($datepickerProvider.defaults, {
            dateFormat: 'MMMM-yyyy',
            startWeek : 1,
            minView   : 1,
            placement : "bottom-right",
            autoclose : true,
            delay   : { show: 200, hide: 100 }
        });

        var authenticate = {
            url : "/login"
        };

        var workspace    = {
            url : "/",
            resolve     : {
                linksService        : "service.hoalinks",
                mailboxService      : "service.hoamailbox",
                documentsService    : "service.hoadocuments",
                response            : function(linksService, mailboxService, documentsService, $q) {
                    var deferred            = $q.defer();
                    var linksPromise        = linksService.getLinks();
                    var mailboxPromise      = mailboxService.getMailbox();
                    var documentsPromise    = documentsService.getDocumentList(null);
                    var success             = function(response){
                        deferred.resolve(response);
                    };

                    $q.all([linksPromise, mailboxPromise, documentsPromise])
                        .then(success);

                    return deferred.promise;
                },
                mailbox             : function(response) {
                    return response[1];
                },
                documentsList       : function(response) {
                    return response[2];
                }
            },
            views       : {
                "rootView@"             : {
                    templateUrl     : "app/components/shared/content/workspace/views/workspace.html",
                    controller      : "workspaceController"
                },
                "sidebar@workspace"     : {
                    templateUrl     : "app/components/shared/content/workspace/views/sidebar.html",
                    controller      : "sidebarController"
                },
                "contentArea@workspace" : {
                    templateUrl     : "app/components/workspace/mailbox/views/maincontent-mailbox.html",
                    controller      : "controller.documents"
                }
            }
        };

        $stateProvider
            .state("authenticate",          authenticate)
            .state("workspace",             workspace);
    }
]);

hoaapp.run(['$rootScope', 'usSpinnerService', "$state", "$stateParams", "$location",
    function($rootScope, usSpinnerService, usSpinnerConfigProvider, $state, $stateParams, $location){

        $rootScope.$on('$stateChangeStart', 
            function(event, toState, toParams, fromState, fromParams){
                usSpinnerService.spin('spinner');
             });  
        
        $rootScope.$on('$stateChangeSuccess', 
            function(event, toState, toParams, fromState, fromParams){ 
                usSpinnerService.stop('spinner');
            });
}]);
