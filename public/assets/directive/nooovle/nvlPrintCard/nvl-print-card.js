/**
 * Created by juancarlos.yu on 3/9/15.
 */
angular
    .module("module.directives")
    .directive("nvlPrintCard", [
                   nvlPrintCard
               ]);

function nvlPrintCard() {
    return {
        restrict    : 'E',
        replace     : true,
        transclude  : false,
        scope       : {
            isPrintable : '=',
            document    : '='
        },
        templateUrl : 'assets/directive/nooovle/nvlPrintCard/nvl-print-card.html'
    }
}