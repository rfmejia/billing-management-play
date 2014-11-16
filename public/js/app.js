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

hoaApp.factory('Tenant', ["$http", "entryPoint",
    function($http, entryPoint) {
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
    }
]);

hoaApp.factory('User', ["$http", "entryPoint", function($http, entryPoint) {
    function User(data) {
        if(data) {
            this.setData(data);
        }
    };

    User.prototype = {
        base: URI(entryPoint + "/users/"),
        setData: function(data) {
            angular.extend(this, data);
        },
        load: function(username) {
            var scope = this;
            $http.get(this.base + username).success(function(data) {
                scope.setData(data);
            });
        },
        reload: function() {
            var scope = this;
            $http.get(this.base + this.username).success(function(data) {
                scope.setData(data);
            });
        },
        update: function() {
            $http.put(this.base + this.username, this);
        },
        delete: function() {
            $http.delete(this.base + this.username);
        }
    }
    return User;
}]);

// ---- Controllers ---- //

hoaApp.controller("MainController", ["$scope", "$http", "$modal", "Tenant", "User", "entryPoint",
    function($scope, $http, $modal, Tenant, User, entryPoint) {
        $http.get(entryPoint + "/setupTestEnvironment");

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
            else if(mode == "none") {
                $scope.selectedTenant = null;
                $scope.selectedUser = null;
            }
        }

        /* -------------------------------------------------- */

        $scope.refreshTenantList = function() {
            $http.get(entryPoint + "/tenants").success(function(data) {
                $scope.tenantList = data._embedded.item;
            });
        }

        $scope.selectedTenant = null;
        $scope.showTenant = function(tenant) {
            if(tenant != null && tenant != "") {
                $scope.selectedTenant = new Tenant();
                $scope.selectedTenant.load(tenant.id);
                $scope.setControls("show");
            }
        }

        $scope.setupNewTenant = function() {
            $scope.selectedTenant = new Tenant();
            $scope.editable = true;
            $scope.setControls("create");
        }
        $scope.addNewTenant = function() {
            if($scope.selectedTenant != null && $scope.selectedTenant != "") {
                $http.post(entryPoint + "/tenants", $scope.selectedTenant)
                    .success(function(data, status, headers) {
                        $scope.setControls();
                        $scope.refreshTenantList();
                    })
                    .error(function(data) {
                        $scope.setControls("create");
                        alert(data);
                    });
            }
        }

        /* -------------------------------------------------- */

        $scope.refreshUserList = function() {
            $http.get(entryPoint + "/users").success(function(data) {
                $scope.userList = data._embedded.item;
            });
        }

        $scope.selectedUser = null;
        $scope.showUser = function(user) {
            if(user != null && user != "") {
                $scope.selectedUser = new User();
                $scope.selectedUser.load(user.username);
                $scope.setControls("show");
            }
        }

        /* -------------------------------------------------- */
        $scope.openInvitations = function () {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl'
            });
        };
    }]
);

hoaApp.controller('ModalInstanceCtrl', ["$scope", "$http", "$modalInstance", "entryPoint",
    function ($scope, $http, $modalInstance, entryPoint) {
        $scope.refreshInviteList = function() {
            $http.get(entryPoint + "/invites").success(function(data) {
                $scope.inviteList = data._embedded.item;
            });
        }
        $scope.refreshInviteList();

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        $scope.minDate = tomorrow;

        $scope.openCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.inviteViaEmail = function() {
            if($scope.inviteEmail != null && $scope.inviteEmail != "" &&
                $scope.inviteUsername != null && $scope.inviteUsername != "" &&
                $scope.inviteValidUntil != null && $scope.inviteValidUntil != "") {
                var date = $scope.inviteValidUntil.getFullYear() + "-" + ($scope.inviteValidUntil.getMonth() + 1) + "-" + $scope.inviteValidUntil.getDate();
                var invite = {
                    email: $scope.inviteEmail,
                    username: $scope.inviteUsername,
                    validUntil: date,
                    roles: ["encoder"]
                };
                console.log(invite);
                $http.post(entryPoint + "/invites", invite)
                    .success(function(data, status, headers) {
                        $scope.refreshInviteList();
                    })
                    .error(function(data) {
                        alert(data);
                    });
            } else {
                alert("Missing values; please check your request.");
            }
        }
    }
]);
