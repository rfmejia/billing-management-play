/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular.module("hoa-app")
    .config(config);

config.$inject = ["$stateProvider", "$urlRouterProvider", "$httpProvider", "usSpinnerConfigProvider", "$mdThemingProvider"];
function config($stateProvider, $urlRouterProvider, $httpProvider, usSpinnerConfigProvider, $mdThemingProvider) {

    activate();

    function activate() {
        $httpProvider.interceptors.push('httpInterceptor');
        $urlRouterProvider.otherwise("/");

        prepareThemes();
        prepareSpinner();
        prepareRoutes();
    }

    function prepareThemes() {
        var light = $mdThemingProvider.extendPalette('green', {
            'contrastDefaultColor' : 'dark'
        });

        $mdThemingProvider.definePalette('light', light);
        $mdThemingProvider
            .theme('default')
            .primaryPalette('blue-grey', {
                                'default' : '500',
                                'hue-1'   : '100',
                                'hue-2'   : '600',
                                'hue-3'   : 'A100'
                            })
            .accentPalette('pink')
            .backg;

        $mdThemingProvider.theme('bills-dark', 'default')
            .primaryPalette('teal')
            .accentPalette('pink');



        $mdThemingProvider.theme('list', 'default')
            .primaryPalette('blue')
            .accentPalette('pink', {
                               'default' : 'A100'
                           });

        $mdThemingProvider.theme('toolbars', 'default')
            .primaryPalette('blue-grey');

        $mdThemingProvider.theme('tenants', 'default')
            .primaryPalette('light-green');

        $mdThemingProvider.theme('docs-view', 'default')
            .primaryPalette('red')
            .accentPalette('pink');

        $mdThemingProvider.theme('docs-view-inverse', 'default')
            .primaryPalette('red')
            .dark();

        $mdThemingProvider.theme('reports', 'default')
            .primaryPalette('purple');
    }

    function prepareSpinner() {
        usSpinnerConfigProvider.setDefaults({color : '#2196F3', lines : 9, corners : 1, length : 1});
    }

    function prepareRoutes() {
        var authenticate = {
            url : "/login"
        };

        var workspace = {
            url     : "/",
            resolve : {
                linksService     : "service.hoalinks",
                mailboxService   : "service.hoamailbox",
                documentsService : "documents.service",
                documentsHelper  : "documents.helper",
                userService      : 'service.hoacurrentuser',
                response         : function(linksService, mailboxService, documentsService, documentsHelper, userService, $q) {
                    var deferred = $q.defer();
                    var query = documentsHelper.getQueryParameters();
                    var linksPromise = linksService.getLinks();
                    var mailboxPromise = mailboxService.getLocal();
                    var userPromise = userService.getUserDetails();
                    var documentsPromise = documentsService.getDocumentList(query);
                    var success = function(response) {
                        deferred.resolve(response);
                    };
                    $q.all([linksPromise, mailboxPromise, documentsPromise, userPromise])
                        .then(success);
                    return deferred.promise;
                },
                mailbox          : function(response) {
                    return response[1];
                },
                documentsList    : function(response) {
                    return response[2];
                },
                userDetails      : function(response) {
                    return response[3];
                }

            },
            views   : {
                "rootView@"         : {
                    templateUrl : "app/components/layout/workspace.html",
                    controller  : "workspaceController as workspace"
                },
                "sidebar@workspace" : {
                    templateUrl : "app/components/layout/sidebar.html",
                    controller  : "sidebarController as sidebar"
                }
            }
        };

        $stateProvider
            .state("authenticate", authenticate)
            .state("workspace", workspace);
    }
}
