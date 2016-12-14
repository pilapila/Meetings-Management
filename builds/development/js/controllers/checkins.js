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
          console.log($scope.meetingChecked);
        }, 0);
      }); // Ref to ckeckin click to show meeting's information  
      
    const checkedListRef =  RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
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
          'regUser':    $scope.data[i].regUser
        }).then(function() {
          $scope.data = [];
        });
      };
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
  };
  
  $scope.clearData = function() {
    $scope.data = [];
  };

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
  };

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
  };
    
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
  };


}); // CheckinsController