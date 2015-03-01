/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module('hoaApp')
    .directive('hoaComments', [hoaComments]);

function hoaComments() {
    return {
        restrict    : 'E',
        replace     : true,
        transclude  : false,
        scope       : {
            isRecentOnly : '=',
            isHidden    : '=',
            comments     : '=',
            onHideClicked : '&'
        },
        templateUrl : 'assets/directive/hoa/hoa-comments/directive-hoa-comments.html',
        controller : "hoaCommentsCtrl",
        controllerAs : "commentsView",
        bindToController : true
    }
}

angular
    .module('hoaApp')
    .controller(("hoaCommentsCtrl"), hoaCommentsCtrl);

function hoaCommentsCtrl() {

    var vm = this;
    vm.toggleVisibility = toggleVisibility;
    vm.isVisible = false;
    vm.isEmpty = true;

    activate();
    function toggleVisibility() {
        vm.isVisible = !vm.isVisible;
        console.log(vm.isShown);
    }

    function activate() {
        vm.isVisible = !vm.isHidden;
        vm.isEmpty = (vm.comments.all.length < 1);
        console.log(vm.isEmpty);
    }
}