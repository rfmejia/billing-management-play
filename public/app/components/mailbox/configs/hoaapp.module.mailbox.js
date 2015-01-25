var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {

         var drafts = {
            url   : "drafts",
            views : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/mailbox/views/maincontent-drafts.html",
                    controller  : "controller.drafts"
                }
            }
        }

        var forchecking = {
            url         : "forchecking",
            resolve     : {
                test    : function() {
                    console.log("test");
                }
            },
            views       : {
                "contentArea@workspace"     : {
                    template         : "checking"
                }
            } 
        };

        var forapproval = {
            url         : "forapproval",
            views       : {
                "contentArea@workspace"     : {
                    template    : "approval"
                }
            }
        };

        var unpaid = {
            url         : "unpaid",
            views       : {
                "contentArea@workspace"     : {
                    template    : "unpaid"
                }
            }
        };

        var paid = {
            url         : "paid",
            views       : {
                "contentArea@workspace"     : {
                    template    : "paid"
                }
            }
        };

        var create = {
            url     : "create",
            resolve : {
                documentsService    : "service.hoadocuments",
                tenantsService      : "service.hoatenants",
                templatesService    : "service.hoatemplates",
                response            : function(tenantsService, templatesService, $q) {
                    var deferred = $q.defer();

                    $q.all([tenantsService.getList(), templatesService.queryLocal()]).then(
                        function(response) {
                        deferred.resolve(response);
                    });
                    return deferred.promise;
                },
                createBundle        : function(response) {
                    return {
                        "tenantsBundle"       : response[0],
                        "templates"     : response[1]
                    };
                }
            },
            views   : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/mailbox/views/maincontent-create.html",
                    controller  : "controller.create"
                }
            }
        }

        $stateProvider
            .state("workspace.create",                 create)
            .state("workspace.forchecking",       forchecking)
            .state("workspace.forapproval",       forapproval)
            .state("workspace.drafts",                 drafts)
            .state("workspace.unpaid",                 unpaid)
            .state("workspace.paid",                     paid);
    }]);

