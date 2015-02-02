var create = angular.module("module.mailbox");

create.controller("controller.create", ["$scope", "$state", "documentsService", "tenantsList", "template", "documentsResponse", "$filter",
	function($scope, $state, documentsService, tenantsList, template, documentsResponse, $filter){
		$scope.tenants = tenantsList.tenants;
        $scope.breakdown = template.breakdown;

        $scope.previous = template.breakdown.previous;
        $scope.thisMonth = template.breakdown.thisMonth;
        $scope.summary = template.summary;

		$scope.templates = template;
        $scope.postTemplate = documentsResponse.createTemplate.postTemplate;
        $scope.postTemplate.doctype = template.doctype;

		$scope.setData = function() {
			$scope.summary = [];
			angular.forEach($scope.templates.breakdown, function(value, key){
				var editedSummary = value.summary;
				editedSummary.title = value.title + " total";
				$scope.summary.push(editedSummary);
			});
		};


		$scope.setData();

		$scope.dateOptions = {
    		formatYear: 'yy',
    		startingDay: 1,
    		minMode: 'month'
  		};

		$scope.onSelect = function(tenant){
            console.log("not called");
		};

		$scope.today = function() {
			$scope.billDate = new Date();
		};
		$scope.today();

		$scope.toggleMin = function() {
		  $scope.minDate = $scope.minDate ? null : new Date();
		};
		$scope.toggleMin();

		$scope.clear = function() {
			$scope.billDate = null;
		};

		$scope.open = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.opened = true;
		};

		$scope.format = "MMMM-yyyy";

        $scope.onSubmitClicked = function() {

            angular.forEach($scope.tenants, function(value) {
                if(value.tradeName == $scope.tenantName) {
                    $scope.selectedTenant = value;
                }
            });

            preparePostData();

            documentsService.createDocument($scope.postTemplate);
        };

        $scope.computeSubtotal = function(section) {
            var total = 0;
            console.log(section.sections);


            angular.forEach(section.sections, function(subsection) {
                total += subsection.total;
            });
            section.summary.value = total;
            console.log($scope.thisMonth.summary.value);

            $scope.summary.value = $scope.previous.summary.value + $scope.thisMonth.summary.value;
        };

        var preparePostData = function() {
            $scope.postTemplate.body = {"breakdown" : {
                "previous" : $scope.previous,
                "thisMonth" : $scope.thisMonth
            }};
            $scope.postTemplate.forMonth = $scope.billDate.toISOString();
            $scope.postTemplate.forTenant = $scope.selectedTenant.id;
            $scope.postTemplate.title = $scope.selectedTenant.tradeName + "-" +$filter('date')($scope.billDate, "MMMM-yyyy");

            console.log($scope.postTemplate);
        };
	}]);