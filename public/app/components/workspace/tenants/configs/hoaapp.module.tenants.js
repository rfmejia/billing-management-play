var app = angular.module("module.tenants", [
        "ngResource",
        "ui.router"
    ]);

app.config(["$stateProvider",
    function($stateProvider) {
        var tenantsList = {
            url         : "tenants",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl             : "app/components/workspace/tenants/views/maincontent-tenants-list.html",
                    controller              : "controller.tenantslist"
                }
            },
            resolve : {
                tenantsService         : "service.hoatenants",
                tenantList             : function(tenantsService) {
                    return tenantsService.getList();
                }
            }
        };

        var tenantsView = {
            url         : "/tenant-view/:id",
            views    : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/workspace/tenants/views/maincontent-tenant-view.html",
                    controller      : "controller.tenantview"
                }
            },
            resolve     : {
                tenant            : function(tenantsService, $stateParams) {
                    return tenantsService.getTenant($stateParams.id);
                }
            }
        };

        var tenantsEdit = {
            url         : "/tenant-edit",
            views       : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/workspace/tenants/views/maincontent-tenant-edit.html",
                    controller      : "controller.tenantedit"
                }
            }
        };

        $stateProvider
            .state("workspace.tenants",                 tenantsList)
            .state("workspace.tenants.tenantView",      tenantsView)
            .state("workspace.tenants.tenantView.edit", tenantsEdit)
    }]);