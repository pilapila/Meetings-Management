(function(){
 'use strict';

meetingsApp.controller('ArchiveController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, $routeParams,
   $mdMedia, $filter, RefServices, passDataService, productListPageCount) {

    //$scope.whichRecord = $routeParams.recordId;

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

      var vm = this;
      vm.deleteArchive = deleteArchive;
      vm.firebaseUser = firebaseUser.uid;
      vm.dataArchiveBase = passDataService.getProducts();
      vm.dataArchive = vm.dataArchiveBase[0];

      function deleteArchive(event, archive) {
	   			var confirm = $mdDialog.confirm()
			        .title('Are you sure you want to delete this archive?')
			        .ok('Yes')
			        .cancel('Cancel')
			        .targetEvent(event);
			      $mdDialog.show(confirm).then(function(){
			        RefServices.refArchiveKey(firebaseUser.uid, archive).remove();
			        showToast('Archive Deleted!', 'md-toast-delete');
			      });
	   		}; // delete Archive

	   		function showToast(message, color) {
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
