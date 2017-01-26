(function(){
 'use strict';

meetingsApp.controller('LoadbarController', function
  ($scope, $rootScope, $interval) {
   	
   	$rootScope.loadingBar = true;
   	$rootScope.determinateValue = 0;

    var	stop = $interval(function() {
      $rootScope.determinateValue += 2;

      if ($rootScope.determinateValue > 120) {
      	$rootScope.loadingBar = false;
      	$interval.cancel(stop);
      }

    }, 30, 0, true);



 }); // LoadbarController

}());