(function(){
 'use strict';

 meetingsApp.controller('CheckinsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray,
  	$mdToast, $mdDialog, $routeParams, $mdMedia, RefServices) {

    var vm = this;
    vm.addCheckin = addCheckin;
    vm.deleteAllCheckinsExplainAction = deleteAllCheckinsExplainAction;
    vm.deleteAllCheckinsExplainDialog = deleteAllCheckinsExplainDialog;
    vm.deleteAllCheckins = deleteAllCheckins;
    vm.showDescription = showDescription;
    vm.addDescription = addDescription;
    vm.deleteCheckin = deleteCheckin;
    vm.deleteInvitationAction = deleteInvitationAction;
    vm.deleteInvitationDialog = deleteInvitationDialog;
    vm.rejectFromCallerAction = rejectFromCallerAction;
    vm.rejectFromCallerDialog = rejectFromCallerDialog;
    vm.deleteCheckinDescription = deleteCheckinDescription;
    vm.sendOneInvitationAction = sendOneInvitationAction;
    vm.sendOneInvitationDialog = sendOneInvitationDialog;
    vm.getInviteeId = getInviteeId;
    vm.sendAllInvitations = sendAllInvitations;
    vm.responceMessage = responceMessage;
    vm.showToast = showToast;
    vm.clearData = clearData;
    vm.isChecked = isChecked;
    vm.sync = sync;

    vm.checkinNameAction = "Add New Checkin";
    vm.checkinAction = "add";
    vm.isThereOne = false;

  	vm.whichmeeting = $routeParams.mId;
  	vm.whichuser = $routeParams.uId;
    vm.whichcolor = $routeParams.colorId;

    switch(vm.whichcolor) {
      case "3f3f3f": {
            vm.icon1 = true;
            vm.icon2 = false;
            vm.icon3 = false;
          }
          break;
      case "419215": {
            vm.icon1 = false;
            vm.icon2 = true;
            vm.icon3 = false;
          }
          break;
      case "cc2864": {
            vm.icon1 = false;
            vm.icon2 = false;
            vm.icon3 = true;
          }
          break;
    }

    RefServices.refMeetChecked(vm.whichuser, vm.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
          vm.meetingChecked = snap.val();
        }, 0);
      }); // Ref to ckeckin click to show meeting's information

    RefServices.refCaller(vm.whichuser)
      .on('value', function (snap) {
        $timeout(function () {
          vm.callerInfo = snap.val();
        }, 0);
      }); // Ref to users to find picture of caller

    const checkInvitationRef = RefServices.refCheckin(vm.whichuser, vm.whichmeeting);
    checkInvitationRef.on('value', function (snap) {
        $timeout(function () {
          vm.checkinSendPosition = $firebaseArray(checkInvitationRef);
          vm.checkinSendPosition.$loaded().then(function (list) {

          vm.sendAllInvitationsButton = false;
          for (var i = 0; i < snap.numChildren(); i++) {
              if (vm.checkinSendPosition[i].send !== true) {
                vm.sendAllInvitationsButton = true;
              }
          }

         }.bind(this)); // sync
        }, 0);
      }); // Ref to ckeckin to find any waiting invitation

    const checkedListRef = RefServices.refCheckin(vm.whichuser, vm.whichmeeting);
    checkedListRef.on('value', function (snap) {
          $timeout(function () {

            vm.checkedList = $firebaseArray(checkedListRef);
            vm.checkedList.$loaded().then(function (list) {
              vm.deleteAllModel = false;

              for (var i = 0; i < vm.checkedList.length; i++) {
                 if (vm.checkedList[i].accept) {
                    vm.deleteAllModel = true;
                 }
              };

              if (vm.checkedList.length == 0) {
                vm.isThereOne = false;
              } else {
                vm.isThereOne = true;
              }

            }.bind(this));
          }, 0);
      });  // ref to all checkin list

    const checkinUserRef = RefServices.refUser();
    checkinUserRef.on('value', function (snap) {
        $timeout(function () {
          vm.users = $firebaseArray(checkinUserRef);
          vm.users.$loaded().then(function (list) {
            vm.usersShort = [];
            for (var i = 0; i < vm.users.length; i++) {
              if(vm.users[i].regUser !== vm.whichuser) {
                vm.usersShort.push({
                  "regUser":   vm.users[i].regUser,
                  "firstname": vm.users[i].firstname,
                  "lastname":  vm.users[i].lastname,
                  "image":     vm.users[i].image,
                });
              }
            };

            for (var j = 0; j < vm.checkedList.length; j++) {
              for (var i = 0; i < vm.usersShort.length; i++) {
                if (vm.usersShort[i].regUser === vm.checkedList[j].regUser) {
                  vm.usersShort.splice(i,1);
                }
              }
            }

            if (vm.usersShort.length == 0) {
              vm.showCheckinList = false;
            } else {
              vm.showCheckinList = true;
            }


          }.bind(this));
        }, 0);
      });  // Ref to all user and short them


  function addCheckin() {
    var dataList = vm.data;
    var allList = vm.checkedList.length + vm.data.length;
    var keys = {};
    $timeout(function () {

        for (var i = 0; i < dataList.length; i++) {

          if (dataList[i].value) {
            const checkedUpdatedListRef = RefServices.refCheckin(vm.whichuser, vm.whichmeeting);
            checkedUpdatedListRef.on('value', function (snap) {
                vm.checkedListSync = $firebaseArray(checkedUpdatedListRef);
                var dataListSync = dataList[i];
                vm.checkedListSync.$loaded().then(function (list) {

                  if (dataListSync && angular.isUndefined(keys[dataListSync.regUser])) {
                    keys[dataListSync.regUser] = true; // check to send message just one time
                    for (var j = 0; j < allList; j++) {
                      if (vm.checkedListSync[j].regUser == dataListSync.regUser) { // check if dataCheckbox's regUser is equal to all checkedList
                        addDescription(vm.checkedList[j], dataListSync.value);
                      } //end if
                    }; // end for
                  }
                }.bind(this));
            });
          }; // end for

          RefServices.refCheckin(vm.whichuser, vm.whichmeeting).push().set({
            'firstname':         vm.data[i].firstname,
            'lastname':          vm.data[i].lastname,
            'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
            'image':             vm.data[i].image,
            'regUser':           vm.data[i].regUser,
            'whichInvitation':   '',
            'send':              false,
            'reject':            false,
            'accept':            false,
            'pause':             false
          });

      }  // end for all

      vm.data = [];
      vm.showAgree = 0;
      showToast('Added invitees', 'md-toast-add');
    }, 0);

  };  // Add new Checkin


  function deleteAllCheckinsExplainAction(myExcuse, checkedList) {

    for (var i = 0; i < checkedList.length; i++) {
      if ( checkedList[i].send && checkedList[i].accept && !checkedList[i].reject ) {

            RefServices.refMeetChecked(checkedList[i].regUser, checkedList[i].inviteeId).remove();
            RefServices.refCancellations(checkedList[i].regUser).push().set({
                  'dateMeeting':      vm.meetingChecked.dateMeeting,
                  'name':             vm.meetingChecked.name,
                  'description':      vm.meetingChecked.description,
                  'time':             vm.meetingChecked.time,
                  'imageCaller':      vm.callerInfo.image,
                  'firstnameCaller':  vm.callerInfo.firstname,
                  'lastnameCaller':   vm.callerInfo.lastname,
                  'excuse':           myExcuse
                });

      } else if ( checkedList[i].send && !checkedList[i].accept && !checkedList[i].reject ) {
            RefServices.refDeleteInvitation(checkedList[i].regUser, checkedList[i].whichInvitation).remove();
      }
    }; // end for

    RefServices.refCheckin(vm.whichuser, vm.whichmeeting).remove();
    showToast('All Deleted!', 'md-toast-delete');
  // $timeout(function () {
  // }, 0);
  }; // deleteAllCheckinExplain


  function deleteAllCheckinsExplainDialog(event, checkedList, color) {
        $mdDialog.show({
            controller: function () {
              this.parent = $scope;
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
              $scope.delete = function(myExcuse) {
                deleteAllCheckinsExplainAction(myExcuse, checkedList);
                $mdDialog.cancel();
              };
            },
            controllerAs: 'ctrl',
            parent: angular.element(document.body),
            template:
            '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
            '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;min-width:400px;max-height:150px;height:150px;">' +
                  '<md-toolbar>' +
                '<div class="md-toolbar-tools left left" style="background-color:'+ color +'">' +
                  '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
                  '<span flex><h6>Sure you want to reject all checkins?</h6></span>' +
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
  }; // deleteAllCheckinExplainDialog


  function deleteAllCheckins(checkedList) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete all invitees ?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        for (var i = 0; i < checkedList.length; i++) {

          if (checkedList[i].send && !checkedList[i].accept && !checkedList[i].reject) {
            RefServices.refDeleteInvitation(checkedList[i].regUser, checkedList[i].whichInvitation).remove();
          } // end if

        }; // end for

        RefServices.refCheckin(vm.whichuser, vm.whichmeeting).remove();
        showToast('All Deleted!', 'md-toast-delete');

      }, function(){

      });
  };  // delete all checkin


  function showDescription(myItem) {
    myItem.show = !myItem.show;
    if (myItem.show == 'animated fadeInDown delayAnimate') {
      myItem.userState = 'animated fadeOutUp delayAnimate';
    } else {
      myItem.userState = 'animated fadeInDown delayAnimate';
    }
  };  //show description


  function addDescription(myItem, myDescription) {
    $timeout(function () {
        RefServices.refCheckedDescription(vm.whichuser, vm.whichmeeting, myItem.$id).push().set({
          'description':  myDescription,
          'date':         firebase.database.ServerValue.TIMESTAMP,
        }).then(function() {
          //$scope.showToast( 'Added description!' );
        });
    }, 0);
  };  // add description


  function deleteCheckin(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refCheckedPerson(vm.whichuser, vm.whichmeeting, checked.$id).remove();
        showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete checkin invitee


  function deleteInvitationAction(checked) {
    $timeout(function () {
        RefServices.refDeleteInvitation(checked.regUser, checked.whichInvitation).remove();
        RefServices.refCheckedPerson(vm.whichuser, vm.whichmeeting, checked.$id).remove();
        showToast('Invitation to ' + checked.firstname  + ' Canceled!', 'md-toast-delete');
    }, 0);
  }; // deleteInvitationAction


  function deleteInvitationDialog(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Sure you want to cancel invitation for ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        deleteInvitationAction(checked);
      });
  }; // deleteInvitation


  function rejectFromCallerAction(myExcuse, checked) {
      RefServices.refMeetChecked(checked.regUser, checked.inviteeId).remove();
      RefServices.refCancellations(checked.regUser).push().set({
            'dateMeeting':      vm.meetingChecked.dateMeeting,
            'name':             vm.meetingChecked.name,
            'description':      vm.meetingChecked.description,
            'time':             vm.meetingChecked.time,
            'imageCaller':      vm.callerInfo.image,
            'firstnameCaller':  vm.callerInfo.firstname,
            'lastnameCaller':   vm.callerInfo.lastname,
            'excuse':           myExcuse
          });

      RefServices.refCheckedPerson(vm.whichuser, vm.whichmeeting, checked.$id).remove();
      showToast( checked.firstname  + ' ' + checked.lastname + ' Rejected!', 'md-toast-delete');

  }; // rejectFromCallerAction


  function rejectFromCallerDialog(event, checked, color) {
        $scope.dialog = checked;
        $mdDialog.show({
            controller: function () {
              this.parent = $scope;
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
              $scope.delete = function(myExcuse) {
                rejectFromCallerAction(myExcuse, checked);
                $mdDialog.cancel();
              };
            },
            controllerAs: 'ctrl',
            parent: angular.element(document.body),
            template:
            '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
            '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;min-width:400px;max-height:150px;height:150px;">' +
                  '<md-toolbar>' +
                '<div class="md-toolbar-tools left left" style="background-color:'+ color +'">' +
                  '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
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


  function deleteCheckinDescription(event, idChecked, key, des) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  des  + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteDescription(vm.whichuser, vm.whichmeeting, idChecked, key).remove();
        showToast( 'Description deleted!', 'md-toast-delete');
      }, function(){

      });
  };  // delete checkin description


  function sendOneInvitationAction(checkinKey) {
          RefServices.refInvitations(checkinKey.regUser).push().set({
            'dateMeeting':      vm.meetingChecked.dateMeeting,
            'name':             vm.meetingChecked.name,
            'description':      vm.meetingChecked.description,
            'time':             vm.meetingChecked.time,
            'whichCheckin':     checkinKey.$id,
            'whichUser':        vm.whichuser,
            'whichMeeting':     vm.whichmeeting,
            'imageCaller':      vm.callerInfo.image,
            'firstnameCaller':  vm.callerInfo.firstname,
            'lastnameCaller':   vm.callerInfo.lastname,
            'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
            'pause':            false
            }).then(function() {

                const refFindInvitation = RefServices.refInvitations(checkinKey.regUser);
                refFindInvitation.on('value', function (snap) {

                  vm.findInvitation = $firebaseArray(refFindInvitation);
                  vm.findInvitation.$loaded().then(function (list) {

                    for (var i = 0; i < vm.findInvitation.length; i++) {
                      if ( vm.findInvitation[i].whichCheckin == checkinKey.$id &&
                           vm.findInvitation[i].whichUser == vm.whichuser &&
                           vm.findInvitation[i].whichMeeting == vm.whichmeeting ) {

                              var whichInvitation = vm.findInvitation[i].$id;
                              RefServices.refCheckedPerson(vm.whichuser, vm.whichmeeting, checkinKey.$id)
                                .update({
                                  "whichInvitation":  whichInvitation,
                                  "send":             true,
                                  "reject":           false,
                                  "accept":           false,
                              });
                        } // end if
                    }; // end for
                  }.bind(this)); // sync
                }); // ref to find one invitation id

               // $scope.showToast( 'Sent invitation to ' + checkinKey.firstname, 'md-toast-send');
          });

      showToast( 'Sent invitation to ' + checkinKey.firstname, 'md-toast-send');

  }; // sendOneInvitationAction


  function sendOneInvitationDialog(event, checkinKey) {
    var confirm = $mdDialog.confirm()
        .title('Sure you want to send invitation to ' +  checkinKey.firstname + ' ' + checkinKey.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
          sendOneInvitationAction(checkinKey);
      });
  };  // send one invitation


  function getInviteeId(checkedList) {
      const refAllInvitations = RefServices.refInvitations(checkedList.regUser);
      refAllInvitations.on('value', function (snap) {
        $timeout(function() {
        vm.allInvitations = $firebaseArray(refAllInvitations);
        vm.allInvitations.$loaded().then(function (list) {

          for (var j = 0; j < vm.allInvitations.length; j++) {

            if ( vm.allInvitations[j].checkinId === checkedList.$id &&
                 vm.allInvitations[j].whichUser === vm.whichuser &&
                 vm.allInvitations[j].whichMeeting === vm.whichmeeting ) {

                    var whichInvitation = vm.allInvitations[j].$id;

                    RefServices.refCheckedPerson(vm.whichuser, vm.whichmeeting, vm.allInvitations[j].checkinId)
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
  }; // getInviteeId


  function sendAllInvitations(event, checkedList) {
    var countSent = checkedList.length;
    var confirm = $mdDialog.confirm()
        .title('Sure you want to send all invitations?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
    $mdDialog.show(confirm).then(function(){
        //$timeout(function() {
          for (var i = 0; i < checkedList.length; i++) {

            if (checkedList[i].send !== true) {
              RefServices.refInvitations(checkedList[i].regUser)
                .push().set({
                  'dateMeeting':      vm.meetingChecked.dateMeeting,
                  'name':             vm.meetingChecked.name,
                  'description':      vm.meetingChecked.description,
                  'time':             vm.meetingChecked.time,
                  'checkinId':        checkedList[i].$id,
                  'whichUser':        vm.whichuser,
                  'whichMeeting':     vm.whichmeeting,
                  'imageCaller':      vm.callerInfo.image,
                  'firstnameCaller':  vm.callerInfo.firstname,
                  'lastnameCaller':   vm.callerInfo.lastname,
                  'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
                  'pause':            false
                });

              getInviteeId(checkedList[i]);

            } else {
              countSent -= 1;
            }
        }; // end for top

        if (countSent == 0) {
          showToast('Nothing New Invitee', 'md-toast-delete');
        } else if (countSent >= 0) {
          showToast('Sent ' + countSent + ' New Invitations', 'md-toast-send');
        }

      //}, 0);
    }); // end confirm
  };  // send all invitations


  function responceMessage(event, excuse, color) {
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
          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;min-width:400px;max-height:250px;">' +
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
  }; // responceMessage


  function showToast(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
  }; // Show Toast


  vm.data = [];

  function clearData() {
    //$scope.data = [];
    //$scope.checkinDescription = '';
    if (vm.data.length) {
      vm.showAgree = vm.data.length;
    } else {
      vm.showAgree = 0;
    }

    // for(var i=0 ; i < $scope.data.length; i++) {
    //   $scope.isChecked($scope.data.regUser);
    //   $scope.sync(false, $scope.data);
    // }

  }; // clear data


  function isChecked(id){
      var match = false;
      for(var i=0 ; i < vm.data.length; i++) {
        if(vm.data[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking

  function sync(bool, item){
    if(bool){
      // add item
      vm.data.push(item);
      vm.showAgree = vm.data.length;
    } else {
      // remove item
      for(var i=0 ; i < vm.data.length; i++) {
        if(vm.data[i].regUser == item.regUser){
          vm.data.splice(i,1);
          vm.showAgree = vm.data.length;
        }
      }
    }
  };  // pic data from checkbox


}); // CheckinsController

}());
