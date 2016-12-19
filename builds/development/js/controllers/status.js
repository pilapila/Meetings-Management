meetingsApp.controller('statusController', 
  function($scope, $rootScope, $firebase, $firebaseAuth, $location, $firebaseObject, Authentication, RefServices){
      
      $scope.logout = function(){
         Authentication.logout();
         $location.path('/login');
      }


      $rootScope.$on($firebaseAuth().$onAuthStateChanged( function(firebaseUser) {
        if(firebaseUser){
          
            $rootScope.currentUser = $firebaseObject(firebase.database().ref('/users/' + firebaseUser.uid));
          
          
        } else{
          $rootScope.currentUser = null;
        }
      }));

});