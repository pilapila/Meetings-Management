(function(){
 'use strict';

meetingsApp.controller('ArchiveController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, $routeParams,
   $mdMedia, $filter, RefServices, passDataService, productListPageCount) {

	$scope.dataArchiveBase = passDataService.getProducts();
    $scope.dataArchive = $scope.dataArchiveBase[0];

    //$scope.whichRecord = $routeParams.recordId;

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

	   		$scope.deleteArchive = function(event, archive) {
	   			
	   			var confirm = $mdDialog.confirm()
			        .title('Are you sure you want to delete this archive?')
			        .ok('Yes')
			        .cancel('Cancel')
			        .targetEvent(event);
			      $mdDialog.show(confirm).then(function(){
			        RefServices.refArchiveKey(firebaseUser.uid, archive).remove();
			        $scope.showToast('Archive Deleted!', 'md-toast-delete');
			      });
	   		}; // delete Archive

	   		$scope.showToast = function(message, color) {
				$mdToast.show(
					$mdToast.simple()
						.toastClass(color)
						.content(message)
						.position('top, right')
						.hideDelay(1000)
				);
			}; // Show Toast


		}   //if statement
	}); //firebaseUser




 }); // ArchiveController

}());