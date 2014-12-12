var app = angular.module("module.tenants", [
        "ui.router",
        "service.tenants",
        "hoaFilters",
        "hoaServices",
        "hoaControllers",
        "hoaDirectives"
    ]);

app.config(["$stateProvider", "$urlRouterProvider", 
    function($stateProvider, $urlRouterProvider) {
        var tenantsList = {
            url         : "/tenants",
            views       : {
                "contentArea@workspace"     : {
                    templateUrl             : "app/components/tenants/maincontent-tenants-list.html",
                    controller              : "tenantsListController"
                }
            },
            resolve : {
                r_tenantsService : "service.hoatenants",
                r_tenantTop     : function(r_tenantsService) {
                    return r_tenantsService.getList();
                }
            }
        };
        var tenantsView = {
            url         : "/tenant-view/:id",
            resolve     : {
                r_tenantsService     : "service.hoatenants",
                r_tenant            : function(r_tenantsService, $stateParams) {
                    console.log($stateParams.id);
                    return r_tenantsService.getTenant($stateParams.id);
                }
            },
            views    : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/tenants/maincontent-tenant-view.html",
                    controller      : "tenantsViewController"
                }
            }
        };

        var tenantsEdit = {
            url         : "/tenant-edit",
            resolve     : {
                r_tenantService     : "TenantsService",
                r_tenant            : function(r_tenantService, r_tenantId) {
                     var tempTenant = r_tenantService.getTenant(r_tenantId);
                     if(tempTenant.sameTenant) return tempTenant.tenant;
                     else {
                        return tempTenant.tenant.query({id : r_tenantId}).$promise;
                     }
                }
            },
            views       : {
                "contentArea@workspace" : {
                    templateUrl     : "app/components/tenants/maincontent-tenant-edit.html",
                    controller      : "tenantsEditController"
                }
            }
        }

        $stateProvider
            .state("workspace.tenants",                 tenantsList)
            .state("workspace.tenants.tenantView",      tenantsView)
            .state("workspace.tenants.tenantView.edit", tenantsEdit)
    }]);