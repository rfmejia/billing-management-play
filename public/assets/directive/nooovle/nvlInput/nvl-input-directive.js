/**
 * Created by juancarlos.yu on 3/13/15.
 */
angular
    .module("nvl-directives")
    .directive("nvlInput", nvlInput);

function nvlInput() {
    return {
        restrict    : 'E',
        replace     : false,
        transclude  : false,
        scope       : {
            field              : "=",
            parentForm         : "=",
            isDisabled         : "=",
            changeFunction     : "&"
        },
        templateUrl : "assets/directive/nooovle/nvlInput/nvl-input.html",
        controller : "inputCtrl",
        controllerAs : "inputCtrl",
        bindToController : true
    };
}

angular.module("nvl-directives").controller(("inputCtrl"), inputCtrl);
function inputCtrl() {
    var vm = this;
}