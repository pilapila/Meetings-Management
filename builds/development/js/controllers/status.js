meetingsApp.controller('statusController', 
  function($scope, $rootScope, $firebase, $firebaseAuth, $location, Authentication){
      
      $scope.logout = function(){
         Authentication.logout();
         $location.path('/login');
      }


      $rootScope.$on(firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
          var userData = firebase.database().ref('users/' + firebaseUser.uid);
          userData.on('value', function (snapshot) {
            $rootScope.currentUser = snapshot.val();
          });
          
        } else{
          $rootScope.currentUser = null;
        }
      }));

});