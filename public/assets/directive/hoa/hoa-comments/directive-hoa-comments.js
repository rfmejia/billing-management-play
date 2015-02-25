/**
 * Created by juancarlos.yu on 2/25/15.
 */
angular
    .module('hoaApp')
    .directive('hoaComments', hoaComments);

function hoaComments() {
    return {
        restrict    : 'E',
        replace     : true,
        transclude  : false,
        scope       : {
            isRecentOnly : '=',
            comments     : '='
        },
        templateUrl : 'assets/directive/hoa/hoa-comments/directive-hoa-comments.html'
    }
}