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
                r_documentsService  : "service.hoadocuments",
                r_tenantsService    : "service.hoatenants",
                r_templatesService  : "service.hoatemplates",
                r_combinedRoot      : function(r_tenantsService, r_templatesService, $q) {
                    console.log(r_templatesService);
                    var deferred = $q.defer();

                    $q.all([r_tenantsService.getList(), r_templatesService.queryLocal()]).then(
                        function(response) {
                        deferred.resolve(response);
                    });
                    return deferred.promise;
                },
                r_mailboxData    : function(r_combinedRoot) {
                    return {
                        "tenants"       : r_combinedRoot[0]._embedded.item,
                        "templates"     : r_combinedRoot[1]
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

