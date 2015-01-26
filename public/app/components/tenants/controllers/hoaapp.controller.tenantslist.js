var tenants = angular.module("module.tenants");

tenants.controller("controller.tenantslist", ["$scope", "$state", "$modal", "tenantsService", "response",
    function($scope, $state, $modal, tenantsService, response){
        $scope.tenants = response.tenants;

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
                    tenantsService        : function() {
                        return tenantsService;
                    },
        			tenantCreateTemplate  : function() {
        				return response.template;
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

