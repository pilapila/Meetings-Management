meetingsApp.controller('InvitationsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, RefServices) {


  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){

  	  const userRef = RefServices.refData(firebaseUser);
	  userRef.on('value', function (snap) {
        $timeout(function () {
          $scope.firebaseUser = firebaseUser.uid;

          const invitationsRef = RefServices.refInvitations($scope.firebaseUser);
	    	invitationsRef.on('value', function (snap) {
		        $scope.invitations = $firebaseArray(invitationsRef);
		        $scope.invitations.$loaded().then(function (list) {
		        	if ($scope.invitations) {
		        		$rootScope.invitationShow = $scope.invitations.length;
		        	}
		        }.bind(this));
	    	});

        }, 0);
	  });  //ref to User database



	

    } // end if firebaseUser
  }); // end firebase.auth()

}); // InvitationsController