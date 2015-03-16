/**
 * Created by juancarlos.yu on 2/27/15.
 */
angular
    .module('module.directives')
    .directive('hoaEmbeddedItems', hoaEmbeddedItems);

function hoaEmbeddedItems() {
    return {
        restrict         : 'E',
        replace          : true,
        transclude       : false,
        scope            : {
            theme           : '@',
            item            : '=',
            onClick         : '&',
            onUpdateClicked : '&'
        },
        templateUrl      : 'assets/directive/hoa/hoa-collections/hoa-embedded-items/hoa-embedded-items.html',
        controller       : 'hoaEmbeddedItemsCtrl',
        controllerAs     : 'hoaItemsCtrl',
        bindToController : true
    }
}

angular
    .module('module.directives')
    .controller('hoaEmbeddedItemsCtrl', [
                    hoaEmbeddedItemsCtrl
                ]);

function hoaEmbeddedItemsCtrl() {
    var vm = this;
    vm.onItemClick = onItemClick;
    vm.onItemUpdateClicked = onItemUpdateClicked;
    vm.profile = vm.item._links.profile.href;

    function onItemClick(item) {
        vm.onClick({item : item})
    }

    function onItemUpdateClicked(item) {
        console.log(item);
        vm.onUpdateClicked({item : item})
    }
}