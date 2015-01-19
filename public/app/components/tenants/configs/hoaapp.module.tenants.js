var app = angular.module("module.tenants", [
        "ngResource",
        "ui.router"
    ]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {
        var tenantsList = {
            url         : "/tenants",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl             : "app/components/tenants/views/maincontent-tenants-list.html",
                    controller              : "controller.tenantslist"
                }
            },
            resolve : {
                r_tenantsService    : "service.hoatenants",
                service             : function(r_tenantsService) {
                    return r_tenantsService;
                },
                r_tenantTop         : function(r_tenantsService) {
                    return r_tenantsService.queryApi();
                },
                r_tenantsApi        : function(r_tenantTop) {
                    return {
                        "tenants" : r_tenantTop._embedded.item,
                        "template" : r_tenantTop._template.create.data[0]
                    };
                }
            }
        };

        var tenantsView = {
            url         : "/tenant-view/:id",
            resolve     : {
                service             : function(service) {
                    return service;
                },
                r_tenant            : function(service, $stateParams) {
                    return service.queryApi($stateParams.id);
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
            resolve     : {
                r_editTenant        : function(r_tenant) {
                    return r_tenant;
                }
            },
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