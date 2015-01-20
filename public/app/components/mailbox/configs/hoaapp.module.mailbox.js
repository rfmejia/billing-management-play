var app = angular.module("module.mailbox", [
    "ui.bootstrap",
    "ui.router"]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {

         var drafts = {
            url   : "/drafts",
            views : {
                "contentArea@workspace" : {
                    templateUrl : "app/components/mailbox/views/maincontent-drafts.html",
                    controller  : "controller.drafts"
                }
            }
        }

        var forchecking = {
            url         : "/checking",
            views       : {
                "contentArea@workspace"     : {
                    template         : "checking"
                }
            } 
        };

        var forapproval = {
            url         : "/approval",
            views       : {
                "contentArea@workspace"     : {
                    template    : "approval"
                }
            }
        };

        var unpaid = {
            url         : "/unpaid",
            views       : {
                "contentArea@workspace"     : {
                    template    : "unpaid"
                }
            }
        };

        var paid = {
            url         : "/paid",
            views       : {
                "contentArea@workspace"     : {
                    template    : "paid"
                }
            }
        };

        var create = {
            url     : "/create",
            resolve : {
                r_documentsService  : "service.hoadocuments",
                r_tenantsService    : "service.hoatenants",
                tenantsService      : function(r_tenantsService) {
                    console.log("tenants service");
                    return r_tenantsService;
                },
                r_templatesService  : "service.hoatemplates",
                templatesService    : function(r_templatesService) {
                    console.log(r_templatesService);
                    return r_templatesService;
                },
                r_combinedRoot      : function(tenantsService, templatesService, $q) {
                    var deferred = $q.defer();
                    $q.all([tenantsService.queryApi(), templatesService.queryLocal()]).then(
                        function(response) {
                        deferred.resolve(response);
                    });
                    return deferred.promise;
                },
                r_tenantTop      : function(r_tenantsService) {
                    return r_tenantsService.queryApi();
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

