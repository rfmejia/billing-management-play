/**
 * Created by juancarlos.yu on 2/28/15.
 */
angular
    .module("module.directives")
    .directive("hoaDocuments", [
        hoaDocuments
    ]);

function hoaDocuments() {
    return {
        restrict : 'E',
        replace  : true,
        transclude : false,
        scope : {
            onClick  : '&',
            document : '='
        },
        templateUrl : "assets/directive/hoa/hoa-collections/hoa-embedded-items/hoa-documents/hoa-document-item.html",
        controller : "hoaDocumentItemCtrl",
        controllerAs : "item",
        bindToController : true
    }
}

angular.module("hoaApp")
    .controller("hoaDocumentItemCtrl" ,[
        "$log",
        hoaDocumentItemCtrl
    ]);

function hoaDocumentItemCtrl() {
    var vm = this;
    vm.onItemClick = onItemClick;
    function onItemClick() {
        vm.onClick({item : vm.document});
    }
}