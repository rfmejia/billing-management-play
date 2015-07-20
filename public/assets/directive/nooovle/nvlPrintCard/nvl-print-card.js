/**
 * Created by juancarlos.yu on 3/9/15.
 */
angular
    .module("app.directives")
    .directive("nvlPrintCard", [
                   nvlPrintCard
               ])
    .controller("nvl-print.controller", printCtrl);

function nvlPrintCard() {
    return {
        restrict    : 'E',
        replace     : true,
        transclude  : false,
        scope       : {
            isPrintable : '=',
            document    : '='
        },
        templateUrl : 'assets/directive/nooovle/nvlPrintCard/nvl-print-card.html',
        controller  : "nvl-print.controller",
        controllerAs : "printCtrl",
        bindToController : true
    }
}

printCtrl.$inject = ["nvl-dateutils"];
function printCtrl(dateUtils) {
    var vm = this;
    vm.billDate = dateUtils.getMomentFromString(vm.document.month, vm.document.year);
    vm.currentDate = dateUtils.getLocalDateNow("MMMM DD, YYYY");
    vm.previous = vm.document.body.previous;
    vm.paymentHistory = vm.document.body.previous.sections[0].paymentHistory;
}