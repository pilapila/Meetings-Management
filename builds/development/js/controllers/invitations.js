meetingsApp.controller('InvitationsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray,
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $location, RefServices, passDataService) {

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){

    $scope.meetingListBase = passDataService.getProducts(); // get sync data from meetingsController
    $scope.meetingList = $scope.meetingListBase[0];

  	const userRef = RefServices.refData(firebaseUser);
	  userRef.on('value', function (snap) {
        $timeout(function () {
          $scope.firebaseUser = firebaseUser.uid;

          const invitationsRef = RefServices.refInvitations($scope.firebaseUser);
	    	  invitationsRef.on('value', function (snap) {
		        $scope.invitations = $firebaseArray(invitationsRef);
		        $scope.invitations.$loaded().then(function (list) {
		        	if ($rootScope.currentUser.$id === firebaseUser.uid) { // maybe solve showing other invitations list problem
                if ($scope.invitations) {
                  $rootScope.invitationShow = $scope.invitations.length;
                }
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
          $timeout(function () {
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

        }).then(function() {

            for (var i = 0; i < $scope.meetingList.length; i++) {

              if ($scope.meetingList[i].invitation) {
                if ($scope.meetingList[i].whichMeeting == invitation.whichMeeting) {
                  var inviteeId = $scope.meetingList[i].$id;
                }
              }

            };  // end for // find inviteeId
            
            const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
              $timeout(function () {
                $scope.allCheckin = $firebaseArray(refFindWhichCheckin);
                $scope.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < $scope.allCheckin.length; i++) {
                    if ($scope.allCheckin[i].regUser == $scope.firebaseUser) {
                      RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  $scope.allCheckin[i].$id)
                        .update({
                          "inviteeId":  inviteeId, 
                          "accept":     true,
                          "send":       true,
                          "reject":     false,
                        });
                    }
                  };
                }.bind(this));
              }, 0);
            }); // ref to insert response from invitee

             
            RefServices.refDeleteInvitation(firebaseUser.uid, invitation.$id).remove();
            //ref to delete invitation
            RefServices.refInvitations(firebaseUser.uid).on('value', function (snap) {
              $timeout(function () {
                if (snap.numChildren() == 0 ) {
                  $scope.currentPath = $location.path('/meetings');
                }
              }, 0);
            });
            //if there is not any invitation then go to meeting page
            $scope.showToast( 'Invitation accepted');

        }, 0);
      }); // Confirm
    }; // Accept invitation


    $scope.rejectInvitation = function(event, invitation) {
      var confirm = $mdDialog.confirm()
          .title('Sure you want to reject this invitation from ' +  invitation.firstnameCaller + ' ' + invitation.lastnameCaller + '?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){
          $timeout(function () {
            const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
                $scope.allCheckin = $firebaseArray(refFindWhichCheckin);
                $scope.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < $scope.allCheckin.length; i++) {
                    if ($scope.allCheckin[i].regUser == $scope.firebaseUser) {
                      RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  $scope.allCheckin[i].$id)
                        .update({
                          "reject": true,
                          "send":   false,
                          "accept": false,
                        });
                    }
                  };
                }.bind(this));
              });
            }).then(function() {

              RefServices.refDeleteInvitation(firebaseUser.uid, invitation.$id).remove();
                // ref to delete invitation
              RefServices.refInvitations(firebaseUser.uid).on('value', function (snap) {
                if (snap.numChildren() == 0 ) {
                  $scope.currentPath = $location.path('/meetings');
                }
              });
              $scope.showToast( 'Invitation rejected');

        }, 0);
      }); // Confirm
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