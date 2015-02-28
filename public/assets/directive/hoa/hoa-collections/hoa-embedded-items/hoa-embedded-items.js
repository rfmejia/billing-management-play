/**
 * Created by juancarlos.yu on 2/27/15.
 */
angular
    .module('module.directives')
    .directive('hoaEmbeddedItems', hoaEmbeddedItems);

function hoaEmbeddedItems() {
    return {
        restrict : 'E',
        replace  : true,
        transclude : false,
        scope : {
            item : '=',
            onClick : '&'
        },
        templateUrl : 'assets/directive/hoa/hoa-collections/hoa-embedded-items/hoa-embedded-items.html',
        controller : 'hoaEmbeddedItemsCtrl',
        controllerAs : 'hoaItemsCtrl',
        bindToController : true
    }
}

angular
    .module('hoaApp')
    .controller('hoaEmbeddedItemsCtrl',[
        hoaEmbeddedItemsCtrl
    ]);

function hoaEmbeddedItemsCtrl() {
    var vm = this;

    vm.onItemClick = onItemClick;
    function onItemClick(item) {
        vm.onClick({item : item})
    }
}