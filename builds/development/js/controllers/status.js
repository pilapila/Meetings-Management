meetingsApp.controller('statusController', 
  function($scope, $rootScope, $firebase, $firebaseAuth, $location, Authentication, RefServices){
      
      $scope.logout = function(){
         Authentication.logout();
         $location.path('/login');
      }


      $rootScope.$on(firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
          var userData = RefServices.refCaller(firebaseUser.uid);
          userData.on('value', function (snapshot) {
            $rootScope.currentUser = snapshot.val();
          });
          
        } else{
          $rootScope.currentUser = null;
        }
      }));

});