var drafts = angular.module("module.mailbox");

drafts.controller("controller.documents", ["documentsList", function(documentsList){
   console.log(documentsList);
}]);