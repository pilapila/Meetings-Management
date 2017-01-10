(function(){
 'use strict';

meetingsApp.controller('ArchiveDetailsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, $routeParams,
   $mdMedia, $filter, RefServices, passDataService, productListPageCount) {

	$scope.recordDetailsBase = passDataService.getProducts();
    $scope.recordDetails = $scope.recordDetailsBase[0];
    
    $scope.directiveList = $scope.recordDetails[5];
    //$scope.whichRecord = $routeParams.recordId;

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){


			$scope.showDirectiveDetails = function(event, record) {
		      
		      $scope.dialog = record;
		        $mdDialog.show({
		          controller: function () { 
		              this.parent = $scope; 
		              $scope.cancel = function() {
		                $mdDialog.cancel();
		              }; // cancel
		          },
		          controllerAs: 'ctrl',
		          parent: angular.element(document.body),
		          template: '<md-dialog aria-label="Directive details" style="border-radius: 12px;min-width:450px;max-width:500px;max-height:350px;">' +
		                '<md-toolbar>' +
		              '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
		                '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Directive details</h6></span>' +
		              '</div>' +
		            '</md-toolbar>' +
		              '<md-dialog-content>' +
		             ' <div class="md-dialog-content" style="vertical-align:bottom">' +
		                '<p style="margin-top:0px;vertical-align:bottom">  <b style="color:#2ea6c8;vertical-align:bottom"><i class="small material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">subject</i> Description Act: </b> {{ ctrl.parent.dialog.description }} </p>' +
		                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">view_carousel</i> Responsible: </b> {{ ctrl.parent.dialog.responsible }} </p>' +
		                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">perm_identity</i> Follow: </b> {{ ctrl.parent.dialog.follow }} </p>' +
		                '<p style="margin-top:-10px;vertical-align:bottom"><b style="color:#2ea6c8;vertical-align:bottom"><i class="material-icons prefix" style="font-size:1.2rem;vertical-align:bottom">restore</i>Respite: </b> {{ ctrl.parent.dialog.respite | date }} </p>' +
		              '</div>' +
		            '</md-dialog-content>' +
		            '<md-dialog-actions layout="row">' +
		              '<md-button ng-click="ctrl.parent.cancel()">' +
		                 'Ok' +
		              '</md-button>' +
		            '</md-dialog-actions>' +
		          '</md-dialog>',
		          targetEvent: event,
		          clickOutsideToClose:true,
		          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		        })
		        .then(function(answer) {
		         
		         }, function() {
		          
		        });
		    }; // show record dialog


		}   //if statement
	}); //firebaseUser




 }); // ArchiveDetailsController

}());