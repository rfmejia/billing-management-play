/**
 * Created by juancarlos.yu on 3/7/15.
 */
angular
    .module("module.directives")
    .directive("hoaTenantCard", hoaTenantCard);

function hoaTenantCard() {
    return {
        restrict         : 'E',
        replace          : true,
        transclued       : false,
        scope            : {
            tradeNameColor : '=',
            tenant         : '=',
            forBilling     : '=',
            billDate       : '=',
            format         : '='
        },
        templateUrl      : 'assets/directive/hoa/hoa-tenants/hoa-tenant-card.html',
        controller       : "tenantCardCtrl",
        controllerAs     : "cardCtrl",
        bindToController : true
    }
}

angular
    .module("module.directives")
    .controller("tenantCardCtrl", [
                    tenantCardCtrl
                ]);

function tenantCardCtrl() {
    var vm = this;

    activate();

    function activate() {
        vm.tradeName = null;
        angular.forEach(vm.tenant, function(value) {
            if (value.name == 'tradeName') vm.tradeName = value.value;
        });
    }
}