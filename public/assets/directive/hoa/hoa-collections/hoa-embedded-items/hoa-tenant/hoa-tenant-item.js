/**
 * Created by juancarlos.yu on 3/7/15.
 */
angular
    .module("app.directives")
    .directive("hoaTenant", [
                   hoaTenant
               ]);

function hoaTenant() {
    return {
        restrict         : 'E',
        replace          : true,
        transclude       : false,
        scope            : {
            theme   : '@',
            onClick : '&',
            tenant  : '='
        },
        templateUrl      : "assets/directive/hoa/hoa-collections/hoa-embedded-items/hoa-tenant/hoa-tenant-item.html",
        controller       : "hoaTenantItemCtrl",
        controllerAs     : "item",
        bindToController : true
    }
}

angular
    .module("app.directives")
    .controller("hoaTenantItemCtrl", [
                    hoaTenantItemCtrl
                ]);

function hoaTenantItemCtrl() {
    var vm = this;
    vm.onItemClick = onItemClick;
    function onItemClick() {
        vm.onClick({item : vm.tenant});
    }
}