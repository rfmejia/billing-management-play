/**
 * Created by juancarlos.yu on 3/17/15.
 */
angular
    .module("nvl-directives")
    .directive("toggleSideNav", sideNavToggle);


function sideNavToggle($mdSidenav) {
    return {
        restrict : 'A',
        priority     : 1,
        terminal : true,
        link : function(scope, element, attr) {
            console.log("toggle meeee");
            element.bind('click', function() {
                console.log("toggle");
                $mdSidenav('sideNav').toggle();
            })
        }
    }
}