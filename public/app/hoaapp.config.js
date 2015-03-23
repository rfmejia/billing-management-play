/**
 * Created by juancarlos.yu on 3/10/15.
 */

angular.module("hoa-app")
    .config(config);


function config($urlRouterProvider, $httpProvider, usSpinnerConfigProvider, $mdThemingProvider) {

    activate();

    function activate() {

        $httpProvider.interceptors.push('httpInterceptor');
        $urlRouterProvider.otherwise("/");
        prepareThemes();
        prepareSpinner();
    }

    function prepareThemes() {
        var light = $mdThemingProvider.extendPalette('green', {
            'contrastDefaultColor' : 'dark'
        });

        $mdThemingProvider.definePalette('light', light);
        $mdThemingProvider
            .theme('default')
            .primaryPalette('blue')
            .accentPalette('light-green');

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
}
config.$inject = ["$urlRouterProvider", "$httpProvider", "usSpinnerConfigProvider", "$mdThemingProvider"];