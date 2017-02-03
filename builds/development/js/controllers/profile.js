(function(){
 'use strict';

 meetingsApp.controller('ProfileController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog,
   $mdMedia, $filter, RefServices) {

    firebase.auth().onAuthStateChanged(firebaseUser =>{
      if(firebaseUser !== null){

        var vm = this;
        vm.editProfile = editProfile;
        vm.user;

      	$("#firstname").next().addClass("active");
    		$("#lastname").next().addClass("active");
    		$("#age_input2").next().addClass("active");

      	RefServices.refCaller(firebaseUser.uid).on('value', function (snap) {
    			$timeout(function () {
    				vm.user = snap.val();
    			}, 0);
    		}); //ref to profile

    		function editProfile() {
    			RefServices.refCaller(firebaseUser.uid).update({
                   'firstname':  vm.user.firstname,
                   'lastname': 	 vm.user.lastname,
                   'age':    	 vm.user.age
                }).then(function() {
                	showToast('Profile Changed');
    			});
    		}; // edit profile

    		function showToast(message) {
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
