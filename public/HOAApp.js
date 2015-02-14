var hoaapp = angular.module('hoaApp', [
    "ngCookies", "ngResource",
    "ui.bootstrap", "ui.bootstrap.tooltip", "ui.router", "angularSpinner", "ui.bootstrap.datetimepicker", "angularMoment", "toastr", 'toaster', "ngAnimate",
    "module.users", "module.tenants", "module.mailbox"
    ]);

hoaapp.config(["$stateProvider", "$modalProvider",  "$urlRouterProvider", "$locationProvider", "$httpProvider", 'usSpinnerConfigProvider', "toastrConfig",
    function($stateProvider, $modalProvider, $urlRouterProvider,  $locationProvider, $httpProvider, usSpinnerConfigProvider, toastrConfig) {

        $httpProvider.interceptors.push('httpInterceptor');

        $urlRouterProvider.otherwise("/");

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
                    console.log("mailbox");
                    return deferred.promise;
                },
                mailbox             : function(response) {
                    return response[1];
                },
                documentMailbox     : function($stateParams) {
                    return $stateParams.mailbox;
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
