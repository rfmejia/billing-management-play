/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module("nvl-directives")
    .directive('hoaComments', hoaComments);

function hoaComments() {
    return {
        restrict    : 'E',
        transclude  : false,
        scope       : {
            comments     : '='
        },
        templateUrl : 'assets/directive/hoa/hoa-comments/directive-hoa-comments.html',
        controller : "hoaCommentsCtrl",
        controllerAs : "commentsView",
        bindToController : true
    }
}

angular
    .module("nvl-directives")
    .controller(("hoaCommentsCtrl"), hoaCommentsCtrl);

function hoaCommentsCtrl() {

    var vm = this;
    vm.count = vm.comments.all.length;
    console.log(vm.count);
    activate();
    function activate() {
    }
}