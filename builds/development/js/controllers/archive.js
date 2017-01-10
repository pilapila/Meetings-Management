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

	   	


		}   //if statement
	}); //firebaseUser




 }); // ArchiveController

}());