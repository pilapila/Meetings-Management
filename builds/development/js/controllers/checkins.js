meetingsApp.controller('CheckinsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, RefServices) {

    $scope.checkinNameAction = "Add New Checkin";
    $scope.checkinAction = "add";
    $scope.isThereOne = false;

  	$scope.whichmeeting = $routeParams.mId;
  	$scope.whichuser = $routeParams.uId;
    $scope.whichcolor = $routeParams.colorId;

    switch($scope.whichcolor) {
      case "707070": {
            $scope.icon1 = true;
            $scope.icon2 = false;
            $scope.icon3 = false;
          }
          break;
      case "419215": {
            $scope.icon1 = false;
            $scope.icon2 = true;
            $scope.icon3 = false;
          }
          break;
      case "cc2864": {
            $scope.icon1 = false;
            $scope.icon2 = false;
            $scope.icon3 = true;
          }
          break;
    }

    RefServices.refMeetChecked($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
          $scope.meetingChecked = snap.val();
        }, 0);
      }); // Ref to ckeckin click to show meeting's information

    RefServices.refCaller($scope.whichuser)
      .on('value', function (snap) {
        $timeout(function () {
          $scope.callerInfo = snap.val();
        }, 0);
      }); // Ref to users to find picture of caller

    const checkInvitationRef = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
      checkInvitationRef.on('value', function (snap) {
        $timeout(function () {
          $scope.checkinSendPosition = $firebaseArray(checkInvitationRef);
          $scope.checkinSendPosition.$loaded().then(function (list) {

          $scope.sendAllInvitationsButton = false;
          for (var i = 0; i < snap.numChildren(); i++) {
              if ($scope.checkinSendPosition[i].send !== true) {
                $scope.sendAllInvitationsButton = true;
              }
          }

         }.bind(this)); // sync
        }, 0);
      }); // Ref to ckeckin to find any waiting invitation  
      
    const checkedListRef = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
    checkedListRef.on('value', function (snap) {
          $timeout(function () {
            //$scope.checkedListSync = []
            $scope.checkedList = $firebaseArray(checkedListRef);
            $scope.checkedList.$loaded().then(function (list) {

              // for (var i = 0; i < $scope.checkedList.length; i++) {
              //   $scope.checkedListSync.push($scope.checkedList[i]);
              // };

              if ($scope.checkedList.length == 0) {
                $scope.isThereOne = false;
              } else {
                $scope.isThereOne = true;
              }

            }.bind(this));
          }, 0);
      });  // ref to all checkin list   

    const checkinUserRef = RefServices.refUser();
      checkinUserRef.on('value', function (snap) {
        $timeout(function () {
          $scope.users = $firebaseArray(checkinUserRef);
          $scope.users.$loaded().then(function (list) { 
            $scope.usersShort = [];
            for (var i = 0; i < $scope.users.length; i++) {
              if($scope.users[i].regUser !== $scope.whichuser) {
                $scope.usersShort.push({
                  "regUser":   $scope.users[i].regUser,
                  "firstname": $scope.users[i].firstname,
                  "lastname":  $scope.users[i].lastname,
                  "image":     $scope.users[i].image
                });
              }
            };
          
            for (var j = 0; j < $scope.checkedList.length; j++) {
              for (var i = 0; i < $scope.usersShort.length; i++) {
                if ($scope.usersShort[i].regUser === $scope.checkedList[j].regUser) {
                  $scope.usersShort.splice(i,1);
                }
              }
            }

            if ($scope.usersShort.length == 0) {
              $scope.showCheckinList = false;
            } else {
              $scope.showCheckinList = true;
            }
             

          }.bind(this));
        }, 0);
      });  // Ref to all user and short them


  $scope.addCheckin = function() {
    var dataList = $scope.data;
    var allList = $scope.checkedList.length + $scope.data.length;
    var keys = {};
    $timeout(function () {      

        for (var i = 0; i < dataList.length; i++) {
          
          if (dataList[i].value) { 
            const checkedUpdatedListRef = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
            checkedUpdatedListRef.on('value', function (snap) {
                $scope.checkedListSync = $firebaseArray(checkedUpdatedListRef);
                var dataListSync = dataList[i];
                $scope.checkedListSync.$loaded().then(function (list) {

                  if (dataListSync && angular.isUndefined(keys[dataListSync.regUser])) {
                    keys[dataListSync.regUser] = true; // check to send message just one time
                    for (var j = 0; j < allList; j++) {
                      if ($scope.checkedListSync[j].regUser == dataListSync.regUser) { // check if dataCheckbox's regUser is equal to all checkedList
                        $scope.addDescription($scope.checkedList[j], dataListSync.value);
                      } //end if
                    }; // end for
                  }
                }.bind(this));
            });
          }; // end for
          
          RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).push().set({
            'firstname':         $scope.data[i].firstname,
            'lastname':          $scope.data[i].lastname,
            'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
            'image':             $scope.data[i].image,
            'regUser':           $scope.data[i].regUser,
            'whichInvitation':   '',
            'send':              false,
            'reject':            false,
            'accept':            false,
            'pause':             false
          });

      }  // end for all

      $scope.data = [];
      $scope.showToast('Added invitees', 'md-toast-add');
    }, 0);
    
  };  // Add new Checkin

  $scope.deleteAllCheckin = function() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete all invitees ?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).remove();
        $scope.showToast('All Deleted!', 'md-toast-delete');
      }, function(){
        
      });
  };  // delete all checkin
  
  $scope.clearData = function() {
    $scope.data = [];
    $scope.checkinDescription = '';
  }; // clear data

  $scope.showDescription = function(myItem) {
    myItem.show = !myItem.show;
    if (myItem.show == 'animated fadeInDown delayAnimate') {
      myItem.userState = 'animated fadeOutUp delayAnimate';
    } else {
      myItem.userState = 'animated fadeInDown delayAnimate';
    }
  };  //show description

  $scope.addDescription = function(myItem, myDescription) {
    $timeout(function () {    
        RefServices.refCheckedDescription($scope.whichuser, $scope.whichmeeting, myItem.$id).push().set({
          'description':  myDescription,
          'date':         firebase.database.ServerValue.TIMESTAMP,
        }).then(function() {
          //$scope.showToast( 'Added description!' );
        });
    }, 0);
  };  // add description

  $scope.deleteCheckin = function(event, checked) {
    
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete checkin invitee

  $scope.deleteInvitation = function(event, checked) {
    
    var confirm = $mdDialog.confirm()
        .title('Sure you want to cancel invitation for ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteInvitation(checked.regUser, checked.whichInvitation).remove();
        RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.showToast('Invitation to ' + checked.firstname  + ' Canceled!', 'md-toast-delete');
      }, function(){

      });
  }; // deleteInvitation

  $scope.rejectFromCallerDialog = function(event, checked, color) {
        $scope.dialog = checked;
        $mdDialog.show({
            controller: function () { 
              this.parent = $scope; 
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
              $scope.delete = function(myExcuse) {
                $scope.rejectFromCallerAction(myExcuse, checked);
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
                  '<i class="fa fa-pause-circle-o fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
                  '<span flex><h6>Sure you want to reject <b> {{ ctrl.parent.dialog.firstname | capitalize }} </b> from this meeting?</h6></span>' +
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
                   'No' +
               ' </md-button>' +
               '<md-button type="submit">' +
                   'Yes' +
               ' </md-button>' +
              '</md-dialog-actions>' +
            '</md-dialog>'+
            '</form>',
            targetEvent: event,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
          })
          .then(function(answer) {}, function() {
            
          });
  }; // rejectFromCaller

  $scope.rejectFromCallerAction = function(myExcuse, checked) {
      RefServices.refMeetChecked(checked.regUser, checked.inviteeId).remove();
      RefServices.refCancellations(checked.regUser).push().set({
            'dateMeeting':      $scope.meetingChecked.dateMeeting,
            'name':             $scope.meetingChecked.name,
            'description':      $scope.meetingChecked.description,
            'time':             $scope.meetingChecked.time,
            'imageCaller':      $scope.callerInfo.image,
            'firstnameCaller':  $scope.callerInfo.firstname,
            'lastnameCaller':   $scope.callerInfo.lastname,
            'excuse':           myExcuse
          });

      RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
      $scope.showToast( checked.firstname  + ' ' + checked.lastname + ' Rejected!', 'md-toast-delete');

  }; // rejectFromCallerAction

  $scope.deleteCheckinDescription = function(event, idChecked, key, des) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  des  + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteDescription($scope.whichuser, $scope.whichmeeting, idChecked, key).remove();
        $scope.showToast( 'Description deleted!', 'md-toast-delete');
      }, function(){

      });
  };  // delete checkin description

  $scope.sendOneInvitation = function(event, checkinKey) {
    var confirm = $mdDialog.confirm()
        .title('Sure you want to send invitation to ' +  checkinKey.firstname + ' ' + checkinKey.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        $timeout(function () {
          RefServices.refInvitations(checkinKey.regUser).push().set({
            'dateMeeting':      $scope.meetingChecked.dateMeeting,
            'name':             $scope.meetingChecked.name,
            'description':      $scope.meetingChecked.description,
            'time':             $scope.meetingChecked.time,
            'whichUser':        $scope.whichuser,
            'whichMeeting':     $scope.whichmeeting,
            'imageCaller':      $scope.callerInfo.image,
            'firstnameCaller':  $scope.callerInfo.firstname,
            'lastnameCaller':   $scope.callerInfo.lastname,
            'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
            'pause':            false
            }).then(function() {

                const refOneInvitations = RefServices.refInvitations(checkinKey.regUser);
                refOneInvitations.on('value', function (snap) {
                  $scope.oneInvitations = $firebaseArray(refOneInvitations);
                  $scope.oneInvitations.$loaded().then(function (list) {

                    for (var i = 0; i < $scope.oneInvitations.length; i++) {
                      if ( $scope.oneInvitations[i].whichUser === $scope.whichuser && 
                           $scope.oneInvitations[i].whichMeeting === $scope.whichmeeting ) {
                        
                              var whichInvitation = $scope.oneInvitations[i].$id;
                              RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checkinKey.$id)
                                .update({
                                  "whichInvitation":  whichInvitation,
                                  "send":             true,
                                  "reject":           false,
                                  "accept":           false,
                              });
                      } // end if
                    };

                  }.bind(this)); // sync
                  
                }); // ref to find one invitation id
                  
                $scope.showToast( 'Sent invitation to ' + checkinKey.firstname, 'md-toast-send');
            });
        }, 0);
      });
  };  // send one invitation

  $scope.sendAllInvitations = function(event, checkedList) {
    
    var countSent = checkedList.length;
    var confirm = $mdDialog.confirm()
        .title('Sure you want to send all invitations?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
    $mdDialog.show(confirm).then(function(){
      $timeout(function () {

         for (var i = 0; i < checkedList.length; i++) {
          
            if (checkedList[i].send !== true) {
              RefServices.refInvitations(checkedList[i].regUser)
                .push().set({
                  'dateMeeting':      $scope.meetingChecked.dateMeeting,
                  'name':             $scope.meetingChecked.name,
                  'description':      $scope.meetingChecked.description,
                  'time':             $scope.meetingChecked.time,
                  'checkinId':        checkedList[i].$id,
                  'whichUser':        $scope.whichuser,
                  'whichMeeting':     $scope.whichmeeting,
                  'imageCaller':      $scope.callerInfo.image,
                  'firstnameCaller':  $scope.callerInfo.firstname,
                  'lastnameCaller':   $scope.callerInfo.lastname,
                  'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
                  'pause':            false
                });
            } else {
              countSent -= 1;
            }
         } // end for

        for (var i = 0; i < checkedList.length; i++) {
          
          if (checkedList[i].send !== true) {
              const refAllInvitations = RefServices.refInvitations(checkedList[i].regUser);
              refAllInvitations.on('value', function (snap) {
                $timeout(function () {
                $scope.allInvitations = $firebaseArray(refAllInvitations);
                $scope.allInvitations.$loaded().then(function (list) {
                  
                  for (var j = 0; j < $scope.allInvitations.length; j++) {
                    if ( $scope.allInvitations[j].whichUser === $scope.whichuser && 
                         $scope.allInvitations[j].whichMeeting === $scope.whichmeeting ) {
                            
                            var whichInvitation = $scope.allInvitations[j].$id;
                            
                            RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, $scope.allInvitations[j].checkinId)
                              .update({
                                "whichInvitation":  whichInvitation,
                                "send":             true,
                                "reject":           false,
                                "accept":           false,
                            });

                    } // end if
                  }; // end for

                }.bind(this)); // sync
                }, 0);
              }); // ref to find invitation id
          } // end if
        } // end for

        if (countSent == 0) {
          $scope.showToast('Nothing New Invitee', 'md-toast-delete');
        } else if (countSent >= 0) {
          $scope.showToast('Sent ' + countSent + ' New Invitations', 'md-toast-send');
        }
      
      }, 0);
    }); // end confirm
  };  // send all invitations

  $scope.responceMessage = function(event, excuse, color) {
        $scope.dialog = excuse;
        $scope.color = color;
        $mdDialog.show({
          controller: function () { 
            this.parent = $scope; 
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template:
          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;max-height:250px;">' +
            '<md-toolbar>' +
              '<div class="md-toolbar-tools left left" style="background-color:{{ctrl.parent.color}}">' +
                '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
                '<span flex><h6>Sorry, I can not be there...</h6></span>' +
              '</div>' +
            '</md-toolbar>' +
              '<md-dialog-content>' +
               '<div class="md-dialog-content">' +
                  '{{ctrl.parent.dialog}}' +
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
  }

  $scope.showToast = function(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
  }; // Show Toast

  $scope.isChecked = function(id){
      var match = false;
      for(var i=0 ; i < $scope.data.length; i++) {
        if($scope.data[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking
    
  $scope.data = [];
  
  $scope.sync = function(bool, item){
    if(bool){
      // add item
      $scope.data.push(item);
      $scope.showAgree = $scope.data.length;
    } else {
      // remove item
      for(var i=0 ; i < $scope.data.length; i++) {
        if($scope.data[i].regUser == item.regUser){
          $scope.data.splice(i,1);
          $scope.showAgree = $scope.data.length;
        }
      }      
    }
  };  // pic data from checkbox


}); // CheckinsController