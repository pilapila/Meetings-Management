(function(){
 'use strict';

	meetingsApp.controller("dataDirController", function ($scope, $rootScope, $timeout, $filter, $interval) {

			$scope.activationNext = "active waves-effect grey lighten-2";
			$scope.activationPre = "disabled";
			$scope.selectedPage = 1;
			$scope.pageSize = 5;

		    $scope.selectRowNum = function(num) {
		    	$scope.pageSize = num;
		    	$scope.selectedPage = 1;
		    	$scope.activationPre = "disabled";
		    	$scope.activationNext = "active waves-effect grey lighten-2";
		    };

			$scope.selectPage = function (newPage) {
				$scope.selectedPage = newPage;
				if ($scope.selectedPage < $rootScope.pageCount) {
					$scope.activationNext = "active waves-effect grey lighten-2";

				}
				if ($scope.selectedPage == $rootScope.pageCount) {
					$scope.activationNext = "disabled";
					$scope.activationPre = "active waves-effect grey lighten-2";
				}
				if ($scope.selectedPage > 1) {

					$scope.activationPre = "active waves-effect grey lighten-2";
				}
				if ($scope.selectedPage == 1) {
					$scope.activationNext = "active waves-effect grey lighten-2";
					$scope.activationPre = "disabled";
				}
			};

			$scope.selectNextPage = function () {
				if ($scope.selectedPage < $rootScope.pageCount) {
					$scope.selectedPage += 1;
					$scope.activationPre = "active waves-effect grey lighten-2";
					if ($scope.selectedPage == $rootScope.pageCount) {
						$scope.activationNext = "disabled";
					}
				} else if ($scope.selectedPage >= $rootScope.pageCount) {
					$scope.selectedPage = $rootScope.pageCount;
				}
			};

			$scope.selectPrePage = function () {
				if ($scope.selectedPage > 1) {
					$scope.selectedPage -= 1;
					$scope.activationNext = "active waves-effect grey lighten-2";
					if ($scope.selectedPage == 1) {
						$scope.activationPre = "disabled";
					}
				} else if ($scope.selectedPage <= 1) {
					$scope.selectedPage = 1;
				}
			};

			$scope.getPageClass = function(page) {
            	return $scope.selectedPage == page ? "active blue lighten-3" : "";
        	};

        	// sort by fields
        	$scope.sort = function (field) {
        		$scope.sort.field = field;
        		console.log(field);
        		$scope.sort.order = !$scope.sort.order;
        	};


        	$scope.sort.field = 'name';
        	$scope.sort.order = false;  // ordering for meetings



  }); //dataTableController

}());
