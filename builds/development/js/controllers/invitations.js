(function(){
 'use strict';

 meetingsApp.controller('InvitationsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray,
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $location, RefServices, passDataService) {

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){

    var vm = this;
    vm.acceptInvitation = acceptInvitation;
    vm.suspentionDialog = suspentionDialog;
    vm.rejectInvitation = rejectInvitation;
    vm.sendRejectToCaller = sendRejectToCaller;
    vm.showToast = showToast;

    vm.meetingListBase = passDataService.getProducts(); // get sync data from meetingsController
    vm.meetingList = vm.meetingListBase[0];




  	const userRef = RefServices.refData(firebaseUser);
	  userRef.on('value', function (snap) {
        $timeout(function () {
          vm.firebaseUser = firebaseUser.uid;

          const invitationsRef = RefServices.refInvitations(vm.firebaseUser);
	    	  invitationsRef.on('value', function (snap) {
		        vm.invitations = $firebaseArray(invitationsRef);
		        vm.invitations.$loaded().then(function (list) {

		        	if ($rootScope.currentUser.$id === firebaseUser.uid) { // maybe solve showing other invitations list problem
                if (vm.invitations) {
                  $rootScope.invitationShow = vm.invitations.length;
                }
		        	}
		        }.bind(this));
	    	  }); // Ref to All invitations list

        }, 0);
	  });  //ref to User database

    function acceptInvitation(event, invitation) {
      var confirm = $mdDialog.confirm()
          .title('Sure you want to accept this invitation from ' +  invitation.firstnameCaller + ' ' + invitation.lastnameCaller + '?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){
          $timeout(function () {

            if (invitation.excuse) {
              RefServices.refData(firebaseUser).push().set({
                'name':            invitation.name,
                'description':     invitation.description,
                'dateEnter':       firebase.database.ServerValue.TIMESTAMP,
                'dateMeeting':     invitation.dateMeeting,
                'time':            invitation.time,
                'firstnameCaller': invitation.firstnameCaller,
                'lastnameCaller':  invitation.lastnameCaller,
                'imageCaller':     invitation.imageCaller,
                'whichMeeting':    invitation.whichMeeting,
                'whichUser':       invitation.whichUser,
                'pause':           invitation.pause,
                'excuse':          invitation.excuse,
                'invitation':      true,
              });
            } else {
                RefServices.refData(firebaseUser).push().set({
                  'name':            invitation.name,
                  'description':     invitation.description,
                  'dateEnter':       firebase.database.ServerValue.TIMESTAMP,
                  'dateMeeting':     invitation.dateMeeting,
                  'time':            invitation.time,
                  'firstnameCaller': invitation.firstnameCaller,
                  'lastnameCaller':  invitation.lastnameCaller,
                  'imageCaller':     invitation.imageCaller,
                  'whichMeeting':    invitation.whichMeeting,
                  'whichUser':       invitation.whichUser,
                  'pause':           invitation.pause,
                  'invitation':      true,
                });
            }

        }).then(function() {

            for (var i = 0; i < vm.meetingList.length; i++) {

              if (vm.meetingList[i].invitation) {
                if (vm.meetingList[i].whichMeeting == invitation.whichMeeting) {
                  var inviteeId = vm.meetingList[i].$id;
                }
              }

            };  // end for // find inviteeId

            const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
              $timeout(function () {
                vm.allCheckin = $firebaseArray(refFindWhichCheckin);
                vm.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < vm.allCheckin.length; i++) {
                    if (vm.allCheckin[i].regUser == vm.firebaseUser) {
                      RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  vm.allCheckin[i].$id)
                        .update({
                          "inviteeId":          inviteeId,
                          "accept":             true,
                          "send":               true,
                          "reject":             false,
                          "whichInvitation":    ''
                        });
                    }
                  };
                }.bind(this));
              }, 0);
            }); // ref to response from invitee


            RefServices.refDeleteInvitation(firebaseUser.uid, invitation.$id).remove();
            //ref to delete invitation
            RefServices.refInvitations(firebaseUser.uid).on('value', function (snap) {
              $timeout(function () {
                if (snap.numChildren() == 0 ) {
                  vm.currentPath = $location.path('/meetings');
                }
              }, 0);
            });
            //if there is not any invitation then go to meeting page
            showToast( 'Invitation accepted', 'md-toast-add');
            //console.error("wrong thing happened");
        }, 0);
      }); // Confirm
    }; // Accept invitation


    function suspentionDialog(event, invitation, color) {
      $scope.dialog = invitation;
              $mdDialog.show({
                controller: function () {
                  this.parent = $scope;
                  $scope.cancel = function() {
                $mdDialog.cancel();
              };
                },
                controllerAs: 'ctrl',
                parent: angular.element(document.body),
                template: '<md-dialog aria-label="Meeting details" style="border-radius: 12px;max-width:450px;max-height:350px;">' +
                      '<md-toolbar>' +
                    '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
                      '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Meeting is suspended</h6></span>' +
                    '</div>' +
                  '</md-toolbar>' +
                    '<md-dialog-content>' +
                   ' <div class="md-dialog-content">' +
                      '{{ctrl.parent.dialog.excuse}}' +
                    '</div>' +
                  '</md-dialog-content>' +
                  '<md-dialog-actions layout="row">' +
                    '<md-button ng-click="ctrl.parent.cancel()">' +
                       'Ok' +
                   ' </md-button>' +
                  '</md-dialog-actions>' +
                '</md-dialog>',
                targetEvent: event,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
              })
              .then(function(answer) {

               }, function() {

              });
    }; // suspentionDialog


    function rejectInvitation(event, invitation, color) {

        $scope.dialog = invitation;
        $mdDialog.show({
          controller: function () {
            this.parent = $scope;
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.delete = function(myExcuse) {
              sendRejectToCaller(myExcuse, $scope.dialog);
              $mdDialog.cancel();
            };
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template:
          '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;max-height:150px;height:150px;">' +
                '<md-toolbar>' +
              '<div class="md-toolbar-tools left left" style="background-color:'+ color +'">' +
                '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
                '<span flex><h6>Are you sure you want to delete this invitation</h6></span>' +
              '</div>' +
            '</md-toolbar>' +
              '<md-dialog-content>' +
               '<div class="md-dialog-content">' +
                  ' <input type="text" name="text" ng-model="myExcuse"  ' +
                              ' class="validate" id="text" required="" aria-required="true" ' +
                              ' style="height:2.3rem;font-size:0.9rem" placeholder="Please explain your excuse..."> ' +
                    ' <label for="text" style="font-size:0.8rem" ' +
                    ' data-error="Please enter your excuse."> ' +
                     '' +
                    ' </label> ' +
              '</div>' +
            '</md-dialog-content>' +
            '<md-dialog-actions layout="row" style="margin-top:-20px">' +
              '<md-button ng-click="ctrl.parent.cancel()">' +
                 'Cancel' +
             ' </md-button>' +
             '<md-button type="submit">' +
                 'delete' +
             ' </md-button>' +
            '</md-dialog-actions>' +
          '</md-dialog>'+
          '</form>',
          targetEvent: event,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {

         }, function() {

        });
    }; // Reject invitation

    function sendRejectToCaller(myExcuse, invitation) {
        $timeout(function () {
            const refFindWhichCheckin = RefServices.refCheckin(invitation.whichUser, invitation.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
                vm.allCheckin = $firebaseArray(refFindWhichCheckin);
                vm.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < vm.allCheckin.length; i++) {
                    if (vm.allCheckin[i].regUser == vm.firebaseUser) {
                      RefServices.refCheckedPerson(invitation.whichUser, invitation.whichMeeting,  vm.allCheckin[i].$id)
                        .update({
                          "reject": true,
                          "send":   false,
                          "accept": false,
                          "responceMessage": myExcuse,
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
                vm.currentPath = $location.path('/meetings');
              }
            });
            showToast( 'Invitation rejected', 'md-toast-delete');

        }, 0);
    }; // sendRejectToCaller


    function showToast(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
    }; // Show Toast


    } // end if firebaseUser
  }); // end firebase.auth()

}); // InvitationsController

}());
