meetingsApp.controller('CheckinsController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, RefServices) {

    $scope.checkinNameAction = "Add New Checkin";
    $scope.checkinAction = "add";

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
      });

    const checkinUserRef = RefServices.refUser();
      checkinUserRef.on('value', function (snap) {
        $timeout(function () {
          $scope.users = $firebaseArray(checkinUserRef);
          $scope.users.$loaded().then(function (list) { 

            for (var i = 0; i < snap.numChildren(); i++) {
             // console.log($scope.users[i]);
            };

          }.bind(this));
        }, 0);
      });

    

  const checkinsList = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
  $scope.checkedList = $firebaseArray(checkinsList);
  $scope.checkedList.$loaded().then(function (list) {
    console.log($scope.checkedList);
  }.bind(this));   


  $scope.addCheckin = function(ev) {
    $timeout(function () {
      for (var i = 0; i < $scope.data.length; i++) {
        RefServices.refCheckin($scope.whichuser, $scope.whichmeeting).push().set({
          'firstname':  $scope.data[i].firstname,
          'lastname':  $scope.data[i].lastname
        })
      };
    }, 0);
  };

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