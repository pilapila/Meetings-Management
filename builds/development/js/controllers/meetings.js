meetingsApp.controller('MeetingsController', function($scope, $firebase, $timeout) {

	 const dbRefObject = firebase.database().ref().child('/meetings');
           dbRefObject.on('value', function (snap) {
             $timeout(function () {
              $scope.meetings = snap.val();
              console.log($scope.meetings);
              }, 0); //timeout 
          });

});