meetingsApp.controller('RegistrationController',
  function($scope, $rootScope, $firebaseAuth, $location, $timeout, Authentication) {
  
    $scope.login = function() {
      Authentication.login($scope.user)
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode === 'auth/wrong-password') {
            $scope.message = errorMessage;
            alert('Wrong password.');
          } else {
            alert(errorMessage);
            $scope.message = errorMessage;
          }
          
        }).then(function(user){
           $timeout(function () {
              $scope.currentPath = $location.path('/meetings');
              }, 0);  
           });
        // [END authwithemail]
      };


  $scope.register = function() {
    Authentication.register($scope.user)
        .catch(function(error) {
            $scope.message = error.message;
          }).then(function(regUser){
            Authentication.login($scope.user);
             $timeout(function () {
              $scope.currentPath = $location.path('/meetings');
              }, 0);  
          });       
  }; // register

}); // Controller