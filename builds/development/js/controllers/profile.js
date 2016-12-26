(function(){
 'use strict';

meetingsApp.controller('ProfileController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices) {


firebase.auth().onAuthStateChanged(firebaseUser =>{
  	if(firebaseUser !== null){

  		$("#firstname").next().addClass("active");
		$("#lastname").next().addClass("active");
		$("#age_input2").next().addClass("active");

  		RefServices.refCaller(firebaseUser.uid).on('value', function (snap) {
			$timeout(function () {
				$scope.user = snap.val();
			}, 0);
		}); //ref to profile

		$scope.editProfile = function() {
			RefServices.refCaller(firebaseUser.uid).update({
               'firstname':  $scope.user.firstname,
               'lastname': 	 $scope.user.lastname,
               'age':    	 $scope.user.age
            }).then(function() {
            	$scope.showToast('Profile Changed');
			});
		}; // edit profile

		$scope.showToast = function(message) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass('md-toast-error')
					.content(message)
					.position('top, right')
					.hideDelay(2000)
			);
		}; // Show Toast		

 	}   //if statement
}); //firebaseUser


}); // ProfileController
}());