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

    const checkinsList = RefServices.refCheckin($scope.whichuser, $scope.whichmeeting);
    $scope.meetingChecked = $firebaseArray(checkinsList);
    $scope.meetingChecked.$loaded().then(function (list) {

    }.bind(this));


}); // CheckinsController