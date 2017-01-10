(function(){
 'use strict';

meetingsApp.controller('SuspentionController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices, productListPageCount) {

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){

    $scope.unpauseMeeting = function(event, meeting, color) {
      
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to active ' +  meeting.name  + ' ?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){
          const refActiveCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
          refActiveCheckins.on('value', function (snap) {
            $timeout(function () {
                $scope.activeCheckins = $firebaseArray(refActiveCheckins);
                $scope.activeCheckins.$loaded().then(function (list) {
                  for (var i = 0; i < $scope.activeCheckins.length; i++) {
                    
                    if ( $scope.activeCheckins[i].send == true && 
                         $scope.activeCheckins[i].accept == true && 
                         $scope.activeCheckins[i].reject == false ) {

                        RefServices.refMeetChecked($scope.activeCheckins[i].regUser, $scope.activeCheckins[i].inviteeId)
                          .update({
                                   'pause':  false,
                                   'excuse': ''
                                });

                    } else if ( $scope.activeCheckins[i].send == true && 
                                $scope.activeCheckins[i].accept == false && 
                                $scope.activeCheckins[i].reject == false ) {

                        RefServices.refDeleteInvitation($scope.activeCheckins[i].regUser, $scope.activeCheckins[i].whichInvitation)
                          .update({
                                   'pause':  false,
                                   'excuse': ''
                                });
                    } // end else if

                  };
                }.bind(this)); // asynchronous data in a wrong way actially!

                RefServices.refMeetChecked(firebaseUser.uid, meeting.$id).update({
                  'pause':  false,
                  'excuse': ''
                });

                $scope.showToast('Meeting Activated!', 'md-toast-add');
                
          }, 0); // timeout
        });  // snap val()
      }); // confirm
    }; // activeMeeting


    $scope.unpauseAllMeetings = function(event, datameetings, color) {
      
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to active all meetings ?')
          .ok('Yes')
          .cancel('Cancel')
          .targetEvent(event);
        $mdDialog.show(confirm).then(function(){

          for (var j = 0; j < datameetings.length; j++) {
            if (!datameetings[j].invitation) {
                const refActiveCheckins = RefServices.refCheckin(firebaseUser.uid, datameetings[j].$id);
                refActiveCheckins.on('value', function (snap) {
                      $scope.activeCheckins = $firebaseArray(refActiveCheckins);
                      $scope.activeCheckins.$loaded().then(function (list) {
                        for (var i = 0; i < $scope.activeCheckins.length; i++) {
                          
                          if ( $scope.activeCheckins[i].send == true && 
                               $scope.activeCheckins[i].accept == true && 
                               $scope.activeCheckins[i].reject == false ) {

                              RefServices.refMeetChecked($scope.activeCheckins[i].regUser, $scope.activeCheckins[i].inviteeId)
                                .update({
                                         'pause':  false,
                                         'excuse': ''
                                      });

                          } else if ( $scope.activeCheckins[i].send == true && 
                                      $scope.activeCheckins[i].accept == false && 
                                      $scope.activeCheckins[i].reject == false ) {

                              RefServices.refDeleteInvitation($scope.activeCheckins[i].regUser, $scope.activeCheckins[i].whichInvitation)
                                .update({
                                         'pause':  false,
                                         'excuse': ''
                                      });
                          } // end else if

                        } // end for
                      }.bind(this)); // asynchronous data in a wrong way actially!

                      RefServices.refMeetChecked(firebaseUser.uid, datameetings[j].$id).update({
                        'pause':  false,
                        'excuse': ''
                      });

            });  // snap val()
          } // end if
        }; // end for

        $scope.showToast('All Meetings Activated!', 'md-toast-add');

      }); // confirm
    }; // activeAllMeeting



    $scope.suspentionDialog = function(event, excuse, color) {
      
              $scope.excuseDialog = excuse;
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
                      '{{ctrl.parent.excuseDialog.excuse}}' +
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
              });
    }; // suspentionDialog

    $scope.showToast = function(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
    }; // Show Toast

    }   //if statement
  }); //firebaseUser
 }); // SuspentionController
}());