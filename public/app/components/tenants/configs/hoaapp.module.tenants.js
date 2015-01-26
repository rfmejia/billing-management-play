var app = angular.module("module.tenants", [
        "ngResource",
        "ui.router"
    ]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {
        var tenantsList = {
            url         : "tenants",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl             : "app/components/tenants/views/maincontent-tenants-list.html",
                    controller              : "controller.tenantslist"
                }
            },
            resolve : {
                tenantsService         : "service.hoatenants",
                response               : function(tenantsService) {
                    return tenantsService.getList();
                }
            }
        };

        var tenantsView = {
            url         : "/tenant-view/:id",
            resolve     : {
                tenant            : function(tenantsService, $stateParams) {
                    return tenantsService.getTenant($stateParams.id);
                }
            },
            views    : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/tenants/views/maincontent-tenant-view.html",
                    controller      : "controller.tenantview"
                }
            }
        };

        var tenantsEdit = {
            url         : "/tenant-edit",
            views       : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/tenants/views/maincontent-tenant-edit.html",
                    controller      : "controller.tenantedit"
                }
            }
        }

        $stateProvider
            .state("workspace.tenants",                 tenantsList)
            .state("workspace.tenants.tenantView",      tenantsView)
            .state("workspace.tenants.tenantView.edit", tenantsEdit)
    }]);