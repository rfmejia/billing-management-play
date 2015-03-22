/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("hoa-app")
    .run(appRun);

function appRun($rootScope, $window, $location, $cookies, $urlRouter, linksApi, tokenHandler) {
    $rootScope.initialized = linksApi.isUrlSet();
    $rootScope.targetUrl = $location.absUrl();
    console.log($rootScope.initialized);
    var deregister = $rootScope.$on("$locationChangeStart", function(event){
        event.preventDefault();

        if(linksApi.isUrlSet()) {
            $rootScope.initialized = true;
            $urlRouter.sync();
            deregister();
        } else {
            linksApi.setUrl($window.location.origin + "/api/");
            linksApi.getLinks().then(success, error);
            deregister();
        }
    });

    var success = function(response) {
        tokenHandler.set($cookies.id);
        $rootScope.initialized = linksApi.isUrlSet();
        $urlRouter.sync();
    };

    var error = function(error) {
        //TODO: display error message
    };

    if(!$rootScope.initialized) {
        linksApi.setUrl($window.location.origin + "/api/");
        linksApi.getLinks().then(success, error);        console.log("prevented");
    }
    else {}
}
appRun.$inject = ["$rootScope", "$window", "$location", "$cookies", "$urlRouter", "linksApi", "tokenHandler"];
