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
                        console.log($scope.checkedList[j].$id);
                        console.log(dataListSync.value);
                      } //end if
                    }; // end for
                  }
                }.bind(this));
            });
          }; // end for

          RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).push().set({
            'firstname':  $scope.data[i].firstname,
            'lastname':   $scope.data[i].lastname,
            'date':       firebase.database.ServerValue.TIMESTAMP,
            'image':      $scope.data[i].image,
            'regUser':    $scope.data[i].regUser,
            "send":       false,
            "reject":     false,
            "accept":     false,
          });

      }  // end for all

      $scope.data = [];
      $scope.showToast('Added invitees');
    }, 0);
    //console.log("checkedList is: " + $scope.checkedList.length);
  };  // Add new Checkin

  $scope.deleteAllCheckin = function() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete all invitees ?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).remove();
        $scope.showToast('All Deleted!');
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

  $scope.deleteCheckin = function(event, key, firstname, lastname) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  firstname  + ' ' + lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, key).remove();
        $scope.showToast(firstname  + ' ' + lastname + ' Deleted!');
      }, function(){

      });
  }; // delete checkin invitee

  $scope.deleteCheckinDescription = function(event, idChecked, key, des) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  des  + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteDescription($scope.whichuser, $scope.whichmeeting, idChecked, key).remove();
        $scope.showToast( 'Description deleted!' );
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
              }).then(function() {
                  $scope.showToast( 'Sent invitation to ' + checkinKey.firstname );
                  RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checkinKey.$id)
                    .update({
                      "send":       true,
                      "reject":     false,
                      "accept":     false,
              });
            });
        }, 0);
      });
  };  // send one invitation

  $scope.sendAllInvitations = function(event) {
    var countSent = $scope.checkedList.length;
    var confirm = $mdDialog.confirm()
        .title('Sure you want to send all invitations?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
    $mdDialog.show(confirm).then(function(){
      $timeout(function () {
         for (var i = 0; i < $scope.checkedList.length; i++) {
          if ($scope.checkedList[i].send !== true) {
              RefServices.refInvitations($scope.checkedList[i].regUser)
                .push().set({
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
                }).then(function() {

                    for (var i = 0; i < $scope.checkedList.length; i++) {
                      if ($scope.checkedList[i].send !== true) {
                      RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, $scope.checkedList[i].$id)
                        .update({
                          "send":       true,
                          "reject":     false,
                          "accept":     false,
                        });
                      } // end if
                    } // end for

                }); // end ref
          } else {
            countSent -= 1;
          }
        } // end for

        if (countSent == 0) {
          $scope.showToast('Nothing New Invitee');
        } else if (countSent >= 0) {
          $scope.showToast('Sent ' + countSent + ' New Invitations');
        }
      
      }, 0);
    }); // end confirm
  };  // send all invitations

  $scope.showToast = function(message) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass('md-toast-error')
          .content(message)
          .position('top, right')
          .hideDelay(3000)
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