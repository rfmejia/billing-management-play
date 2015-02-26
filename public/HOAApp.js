angular
    .module('hoaApp', [
        "ngAnimate",
        "ngCookies",
        "ngResource",
        "ngMessages",
        "ngMaterial",
        "ui.bootstrap",
        "ui.bootstrap.tooltip",
        "ui.router",
        "angularSpinner",
        "ui.bootstrap.datetimepicker",
        "angularMoment",
        'toaster',
        "ngAnimate",
        "module.users",
        "module.tenants",
        "module.mailbox"
    ]);

angular
    .module('hoaApp')
    .config([
        "$stateProvider",
        "$urlRouterProvider",
        "$httpProvider",
        'usSpinnerConfigProvider',
        '$mdThemingProvider',
        hoaAppConfig
    ]);

angular
    .module('hoaApp')
    .run([
        '$rootScope',
        'usSpinnerService',
        "$state",
        "$stateParams",
        "$location",
        hoaAppRun
    ]);


function hoaAppConfig($stateProvider, $urlRouterProvider, $httpProvider, usSpinnerConfigProvider, $mdThemingProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    $urlRouterProvider.otherwise("/");

    var authenticate = {
        url: "/login"
    };

    var light = $mdThemingProvider.extendPalette('green', {
        'contrastDefaultColor'  :   'dark'
    });

    $mdThemingProvider.definePalette('light', light);
    $mdThemingProvider
        .theme('default')
        .primaryPalette('blue-grey', {
            'default'   : '500',
            'hue-1'     : '100',
            'hue-2'     : '600',
            'hue-3'     : 'A100'
        })
        .accentPalette('pink', {
            'default' : 'A200'
        });

    $mdThemingProvider.theme('bills-dark', 'default')
        .primaryPalette('teal')
        .dark();



    usSpinnerConfigProvider.setDefaults({
        color: '#2196F3',
        lines: 9,
        corners: 1,
        length: 1
    });
    var workspace = {
        url: "/",
        resolve: {
            linksService        : "service.hoalinks",
            mailboxService      : "service.hoamailbox",
            documentsService    : "service.hoadocuments",
            userService         : 'service.hoacurrentuser',
            response            : function (linksService, mailboxService, documentsService, userService, $q) {
                var deferred            = $q.defer();
                var linksPromise        = linksService.getLinks();
                var mailboxPromise      = mailboxService.getLocal();
                var documentsPromise    = documentsService.getDocumentList(null, 0);
                var userPromise         = userService.getUserDetails();
                var success = function (response) {
                    deferred.resolve(response);
                };
                $q.all([linksPromise, mailboxPromise, documentsPromise, userPromise])
                    .then(success);
                return deferred.promise;
            },
            mailbox             : function (response) {
                return response[1];
            },
            documentMailbox     : function ($stateParams) {
                return $stateParams.mailbox;
            },
            documentsList       : function (response) {
                return response[2];
            },
            userDetails         : function(response) {
                return response[3];
            }
        },
        views: {
            "rootView@": {
                templateUrl: "app/components/shared/content/workspace/views/workspace.html",
                controller: "workspaceController as workspace"
            },
            "sidebar@workspace": {
                templateUrl: "app/components/shared/content/workspace/views/sidebar.html",
                controller: "sidebarController as sidebar"
            }
        }
    };

    $stateProvider
        .state("authenticate", authenticate)
        .state("workspace", workspace);
}

function hoaAppRun($rootScope, usSpinnerService, usSpinnerConfigProvider, $state, $stateParams, $location) {

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            usSpinnerService.spin('spinner');
        });

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
            usSpinnerService.stop('spinner');
        });
}