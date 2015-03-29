/**
 * Created by juancarlos.yu on 2/28/15.
 */
angular
    .module("app.directives")
    .directive("hoaDocuments", [
                   hoaDocuments
               ]);

function hoaDocuments() {
    return {
        restrict         : 'E',
        replace          : true,
        transclude       : false,
        scope            : {
            theme           : '@',
            onClick         : '&',
            onUpdateClicked : '&',
            document        : '='
        },
        templateUrl      : "assets/directive/hoa/hoa-collections/hoa-embedded-items/hoa-document/hoa-document-item.html",
        controller       : "hoaDocumentItemCtrl",
        controllerAs     : "item",
        bindToController : true
    }
}

angular.module("app.directives")
    .controller("hoaDocumentItemCtrl", hoaDocumentItemCtrl);

function hoaDocumentItemCtrl($state, docsHelper, docsApi, dialogProvider, userApi, reportsRoutes) {
    var vm = this;
    var errorTitle = "Sorry";
    var errorMessage = "This document is being edited by another user.";
    var state = docsHelper.resolveViewer(vm.document);
    var userDetails = userApi.getUserDetails();
    vm.onItemClick = onItemClick;
    vm.onItemUpdateClicked = onItemUpdateClicked;

    function onItemClick() {
        onDocumentItemClicked();
    }

    function onItemUpdateClicked($event) {
        onUpdateItemClicked();
        $event.stopPropagation();
    }

    function onDocumentItemClicked() {
        if (vm.document.mailbox === "paid" || vm.document.mailbox === "unpaid") {
            goToViewer();
        }
        else {
            //Check if document it is not assigend and it has an assign property
            if (vm.document.assigned == null && vm.document._links.hasOwnProperty("hoa:assign")) {
                docsApi.assignDocument(vm.document._links["hoa:assign"].href).then(goToViewer, error)
            }
            //Check if the document is assigned to you then directly view the document
            else if (userDetails.userId == vm.document.assigned.userId) {
                goToViewer();
            }
            //Show an error message that the user can't view this document
            else {
                error();
            }
        }
    }

    function onUpdateItemClicked() {
        //Check if document it is not assigend and it has an assign property then assign to you first.
        if (vm.document.assigned == null && vm.document._links.hasOwnProperty("hoa:assign")) {
            docsApi.assignDocument(vm.document._links["hoa:assign"].href).then(goToEditor, error);
        }
        //Check if the document is assigned to you then directly view the document
        else if (userDetails.userId == vm.document.assigned.userId) {
            goToEditor();
        }
        //Show an error message that the user can't view this document
        else {
            error();
        }
    }

    function goToEditor() {
        $state.go(reportsRoutes.reportUpdate, {id : vm.document.id});
    }

    function goToViewer(response) {
        $state.go(state, {id : vm.document.id}, {reload : true});
    }

    function error(dialogContent) {
        dialogProvider.getInformDialog(null, errorTitle, errorMessage, "Okay");
    }
}
hoaDocumentItemCtrl.$inject = ["$state", "documentsHelper", "documentsApi", "hoaDialogService", "userApi", "REPORTS_ROUTES"];