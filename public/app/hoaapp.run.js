/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("hoa-app")
    .run(['$rootScope',
             'usSpinnerService',
             "$state",
             "$stateParams",
             "$location",
             hoaAppRun
         ]);

function hoaAppRun($rootScope, usSpinnerService, usSpinnerConfigProvider, $state, $stateParams, $location) {

    $rootScope.$on('$stateChangeStart',
                   function(event, toState, toParams, fromState, fromParams) {
                       usSpinnerService.spin('spinner');
                   });

    $rootScope.$on('$stateChangeSuccess',
                   function(event, toState, toParams, fromState, fromParams) {
                       usSpinnerService.stop('spinner');
                   });
}