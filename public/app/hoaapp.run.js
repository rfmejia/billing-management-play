/**
 * Created by juancarlos.yu on 3/10/15.
 */
angular
    .module("hoa-app")
    .run(appRun);

function appRun($window, $cookies, linksApi, tokenHandler) {
    var success = function(response) {
        tokenHandler.set($cookies.id);
    };

    var error = function(error) {
        //TODO: display error message
    };

    linksApi.setUrl($window.location.origin + "/api/");
    linksApi.getLinks().then(success, error);
}
appRun.$inject = ["$window", "$cookies", "linksApi", "tokenHandler"];

