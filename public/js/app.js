'use strict';

var hoaApp = angular.module("BillingManagementApp", [
    "ngRoute", "ngResource", "ngSanitize", "ui.bootstrap"
]);
hoaApp.value("entryPoint", URI(window.location.protocol + "//" + window.location.host + "/api"));
hoaApp.value("token", "dGVzdHVzZXIxOnRlc3RwYXNzMQ==")


// ---- Directives ---- //

// Adapted from https://gist.github.com/asafge/7430497
hoaApp.directive('ngReallyClick', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}]);

// ---- Factories for models ---- //

hoaApp.factory('Tenant', ["$http", "entryPoint", function($http, entryPoint) {
    function Tenant(data) {
        if(data) {
            this.setData(data);
        }
    };

    Tenant.prototype = {
        base: URI(entryPoint + "/tenants/"),
        setData: function(data) {
            angular.extend(this, data);
        },
        load: function(id) {
            var scope = this;
            $http.get(this.base + id).success(function(data) {
                scope.setData(data);
            });
        },
        reload: function() {
            var scope = this;
            $http.get(this.base + this.id).success(function(data) {
                scope.setData(data);
            });
        },
        update: function() {
            $http.put(this.base + this.id, this);
        },
        delete: function() {
            $http.delete(this.base + this.id);
        }
    }
    return Tenant;
}]);

// ---- Controllers ---- //

hoaApp.controller("TenantController", ["$scope", "$http", "Tenant", "entryPoint",
    function($scope, $http, Tenant, entryPoint) {
        $scope.controls = {};
        $scope.setControls = function(mode) {
            $scope.controls = {};
            if(mode == "create") {
                $scope.controls = {
                    transformable: true,
                    creationTools: true
                };
            }
            else if(mode == "edit") {
                $scope.controls = {
                    transformable: true,
                    editingTools: true
                };
            }
            else if(mode == "show") {
                $scope.controls = {
                    editToggle: true
                };
            }
        }

        // $scope.refreshTenantList = function() {
            $http.get(entryPoint + "/tenants").success(function(data) {
                $scope.tenantList = data._embedded.item;
            });
        // }

        $scope.setupNewTenant = function() {
            $scope.selectedTenant = new Tenant();
            $scope.editable = true;
            $scope.setControls("create");
        }
        $scope.addNewTenant = function() {
            if($scope.selectedTenant != null && $scope.selectedTenant != "") {
                $http.post(entryPoint + "/tenants", $scope.selectedTenant)
                    .success(function(data) {
                        $scope.showTenant(data);
                    })
                    .error(function(data) {
                        $scope.setControls("create");
                        alert(data);
                        console.log(data);
                    });
            }
        }

        // Loaded instance
        $scope.selectedTenant = null;
        $scope.showTenant = function(tenant) {
            if(tenant != null && tenant != "") {
                $scope.selectedTenant = new Tenant();
                $scope.selectedTenant.load(tenant.id);
                $scope.setControls("show");
            }
        }
    }]
);
