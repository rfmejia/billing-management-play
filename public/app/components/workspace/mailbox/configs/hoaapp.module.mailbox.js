var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {

         var documents = {
            url   : "documents",
            views : {
                "contentArea@workspace": {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-mailbox.html",
                    controller  : "controller.documents"
                }
            },
            params : ["key", "param"],
            resolve : {
                documentsService    : "service.hoadocuments",
                documentsList       : function(documentsService, $stateParams) {
                    var query = {};
                    query[$stateParams[0]] = $stateParams[1];
                    return documentsService.getDocumentList(query);
                }
            }

        };

        var create = {
            url     : "create",
            resolve : {
                documentsService    : "service.hoadocuments",
                tenantsService      : "service.hoatenants",
                templatesService    : "service.hoatemplates",
                response            : function (tenantsService, templatesService, documentsService, $q) {
                    var deferred = $q.defer();
                    var tenantsPromise   = tenantsService.getList();
                    var templatesPromise = templatesService.getLocal();
                    var documentsPromise = documentsService.getDocumentList(null);;
                    var success = function(response) {
                        deferred.resolve(response);
                    };


                    $q.all([tenantsPromise, templatesPromise, documentsPromise])
                        .then(success);

                    return deferred.promise;
                },
                tenantsList         : function(response) {
                    return response[0];
                },
                template            : function(response) {
                    console.log(response);
                    return response[1];
                },
                documentsResponse   : function(response) {
                    return response[2];
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/workspace/mailbox/views/maincontent-create.html",
                    controller  : "controller.create"
                }
            }
        };;

        $stateProvider
            .state("workspace.create",                 create)
            .state("workspace.documents",              documents);
    }]);

