(function(){
 'use strict';

 meetingsApp.controller('RegistrationController',
  function($scope, $rootScope, $firebaseAuth, $location, $timeout, $interval, Authentication) {

    var vm = this;
    vm.login = login;
    vm.register = register;

    function login() {
      Authentication.login(vm.user)
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode === 'auth/wrong-password') {
            vm.message = errorMessage;
            alert('Wrong password.');
          } else {
            alert(errorMessage);
            vm.message = errorMessage;
          }

        }).then(function(user){
           $timeout(function () {
              vm.currentPath = $location.path('/meetings');
              }, 0);
           });
        // [END authwithemail]
      };


  function register() {
    Authentication.register(vm.user)
        .catch(function(error) {
            $scope.message = error.message;
          }).then(function(regUser){
            Authentication.login(vm.user);
             $timeout(function () {
              vm.currentPath = $location.path('/meetings');
              }, 0);
          });
  }; // register

}); // Controller

}());
