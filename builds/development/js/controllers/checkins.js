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
            $scope.checkedList = $firebaseArray(checkedListRef);
            $scope.checkedList.$loaded().then(function (list) {
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
    $timeout(function () {
      for (var i = 0; i < $scope.data.length; i++) {
        RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).push().set({
          'firstname':  $scope.data[i].firstname,
          'lastname':   $scope.data[i].lastname,
          'date':       firebase.database.ServerValue.TIMESTAMP,
          'image':      $scope.data[i].image,
          'regUser':    $scope.data[i].regUser,
        }).then(function() {
          
        });
      };
      $scope.data = [];
      $scope.showToast('Added invitees');
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

  $scope.giveDescription = function(myItem, myDescription) {
    $scope.myDescription = '';
    $("#text").val("");
    RefServices.refCheckedDescription($scope.whichuser, $scope.whichmeeting, myItem.$id).push().set({
          'description':  myDescription,
          'date':       firebase.database.ServerValue.TIMESTAMP,
        }).then(function() {
          $scope.showToast( 'Added description!' );
        });
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
        RefServices.refInvitations(checkinKey.regUser).push().set({
          'dateMeeting':      $scope.meetingChecked.dateMeeting,
          'name':             $scope.meetingChecked.name,
          'description':      $scope.meetingChecked.description,
          'time':             $scope.meetingChecked.time,
          'whichUser':        $scope.whichuser,
          'imageCaller':      $scope.callerInfo.image,
          'firstnameCaller':  $scope.callerInfo.firstname,
          'lastnameCaller':   $scope.callerInfo.lastname,
          'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
          }).then(function() {
              $scope.showToast( 'Sent invitation to ' + checkinKey.firstname );
              RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, checkinKey.$id)
                .update({
                  "send": true
                });
          });
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

       for (var i = 0; i < $scope.checkedList.length; i++) {
        if ($scope.checkedList[i].send !== true) {
            RefServices.refInvitations($scope.checkedList[i].regUser)
              .push().set({
                'dateMeeting':      $scope.meetingChecked.dateMeeting,
                'name':             $scope.meetingChecked.name,
                'description':      $scope.meetingChecked.description,
                'time':             $scope.meetingChecked.time,
                'whichUser':        $scope.whichuser,
                'imageCaller':      $scope.callerInfo.image,
                'firstnameCaller':  $scope.callerInfo.firstname,
                'lastnameCaller':   $scope.callerInfo.lastname,
                'dateEnter':        firebase.database.ServerValue.TIMESTAMP,
              }).then(function() {
                
              });
        } else {
          countSent -= 1;
        }
       } // end for

      if (countSent == 0) {
        $scope.showToast('Nothing New Invitee');
      } else if (countSent >= 0) {
        $scope.showToast('Sent ' + countSent + ' New Invitations');
      }
      
      for (var i = 0; i < $scope.checkedList.length; i++) {
        if ($scope.checkedList[i].send !== true) {
        RefServices.refCheckedPerson($scope.whichuser, $scope.whichmeeting, $scope.checkedList[i].$id)
          .update({
            "send": true
          });
        } // end if
      } // end for
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
    } else {
      // remove item
      for(var i=0 ; i < $scope.data.length; i++) {
        if($scope.data[i].id == item.id){
          $scope.data.splice(i,1);
        }
      }      
    }
  };  // pic data from checkbox


}); // CheckinsController