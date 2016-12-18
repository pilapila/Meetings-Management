meetingsApp.controller('InvitationsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, RefServices) {

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){

    $scope.pageSize = 3;

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
	    	  }); // Ref to All invitations list

        }, 0);
	  });  //ref to User database

    $scope.acceptInvitation = function(event, invitation) {
      var confirm = $mdDialog.confirm()
          .title('Sure you want to accept this invitation from ' +  invitation.firstnameCaller + ' ' + invitation.lastnameCaller + '?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){

          const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
          refFindWhichCheckin.on('value', function (snap) {
              $scope.allCheckin = $firebaseArray(refFindWhichCheckin);
              $scope.allCheckin.$loaded().then(function (list) {
                for (var i = 0; i < $scope.allCheckin.length; i++) {
                  if ($scope.allCheckin[i].regUser == $scope.firebaseUser) {
                    RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  $scope.allCheckin[i].$id)
                      .update({
                        "accept": true
                      });
                  }
                };
              }.bind(this));
          });

        }).then(function() {

            RefServices.refData(firebaseUser).push().set({
              'name':            invitation.name,
              'description':     invitation.description,
              'dateEnter':       firebase.database.ServerValue.TIMESTAMP,
              'dateMeeting':     invitation.dateEnter,
              'time':            invitation.time,
              'firstnameCaller': invitation.firstnameCaller,
              'lastnameCaller':  invitation.lastnameCaller,
              'imageCaller':     invitation.imageCaller,
              'whichMeeting':    invitation.whichMeeting,
              'whichUser':       invitation.whichUser,
              'invitation':      true,
            });

            $scope.showToast( 'Invitation accepted');

        });
        
    }; // Accept invitation


    $scope.rejectInvitation = function(event, invitation) {
      var confirm = $mdDialog.confirm()
          .title('Sure you want to reject this invitation from ' +  invitation.firstnameCaller + ' ' + invitation.lastnameCaller + '?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){

          const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
          refFindWhichCheckin.on('value', function (snap) {
              $scope.allCheckin = $firebaseArray(refFindWhichCheckin);
              $scope.allCheckin.$loaded().then(function (list) {
                for (var i = 0; i < $scope.allCheckin.length; i++) {
                  if ($scope.allCheckin[i].regUser == $scope.firebaseUser) {
                    RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  $scope.allCheckin[i].$id)
                      .update({
                        "reject": true
                      });
                  }
                };
              }.bind(this));
          });

        }).then(function() {
              $scope.showToast( 'Invitation rejected');
        });
        
    }; // Reject invitation




    $scope.showToast = function(message) {
        $mdToast.show(
          $mdToast.simple()
            .toastClass('md-toast-error')
            .content(message)
            .position('top, right')
            .hideDelay(3000)
        );
    }; // Show Toast


    } // end if firebaseUser
  }); // end firebase.auth()

}); // InvitationsController