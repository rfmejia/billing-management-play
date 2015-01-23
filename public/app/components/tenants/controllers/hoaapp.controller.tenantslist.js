var tenants = angular.module("module.tenants");

tenants.controller("controller.tenantslist", ["$scope", "$state", "$modal", "service.hoatenants", "r_tenantsApi",
    function($scope, $state, $modal, hoatenants, r_tenantsApi){
        $scope.tenants = r_tenantsApi.tenants

        //Callback for tenant item clicked
        $scope.onTenantClick = function(tenant) {
            $state.go("workspace.tenants.tenantView", {"id" : tenant.id});
        }

        //Callback for invite button clicked
        $scope.onCreateTenantClicked = function() {
        	$scope.opts = {
        		scope 	: $scope,
        		templateUrl : "app/components/tenants/views/maincontent-tenant-create.html",
        		controller : "controller.tenantcreate",
        		resolve : {
                    r_tenants        : function() {
                        return hoatenants;
                    },
        			r_createTemplate : function() {
        				return r_tenantsApi.template;
        			}
        		}
        	}//opts end

        	//open modal
        	$scope.createTenantModal = $modal.open($scope.opts);

        	//create action callback
        	var create =  function(data) {
                $state.go($state.current, {}, {reload : true});
        	};

        	//cancelled action callback
        	var cancelled = function() {

        	};

        	$scope.createTenantModal.result.then(create, cancelled);
        }

    }]);

