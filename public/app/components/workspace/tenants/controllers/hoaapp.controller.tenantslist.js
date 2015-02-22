var tenants = angular.module("module.tenants");

tenants.controller("controller.tenantslist", ["$scope", "$state", "$modal", "tenantsService", "tenantList",
    function($scope, $state, $modal, tenantsService, response){
        console.log(response);
        $scope.tenants = response.tenants;
        //Callback for tenant item clicked
        $scope.onTenantClick = function(tenant) {
            $state.go("workspace.management.tenants.tenant-view", {"id" : tenant.id});
        };

        //Callback for invite button clicked
        $scope.onCreateTenantClicked = function() {
        	$scope.opts = {
        		scope 	: $scope,
        		templateUrl : "app/components/workspace/tenants/views/maincontent-tenant-create.html",
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
                console.log("create");
                $state.go("workspace.management.tenants", {}, {reload : true});
        	};

        	//cancelled action callback
        	var cancelled = function() {

        	};

        	$scope.createTenantModal.result.then(create, cancelled);
        };

    }]);

