(function(){
 'use strict';

meetingsApp.controller('CancelationController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices, productListPageCount) {

  firebase.auth().onAuthStateChanged(firebaseUser =>{
    if(firebaseUser !== null){


    $scope.deleteAllCancelations = function(cancelations) {
      console.log(cancelations);
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete all cancelations ?')
            .ok('Yes')
            .cancel('Cancel')
            .targetEvent(event);
          $mdDialog.show(confirm).then(function(){

            for (var i = 0; i < cancelations.length; i++) {
              RefServices.refDeleteCancellations(firebaseUser.uid, cancelations[i].$id).remove();
            };
            
            $scope.showToast('All Cancelations Deleted!', 'md-toast-delete');
          });
    }; // deleteAllCancelations


    $scope.deleteCancelation = function(event, cancelation) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this cancelation ?')
            .ok('Yes')
            .cancel('Cancel')
            .targetEvent(event);
          $mdDialog.show(confirm).then(function(){
            RefServices.refDeleteCancellations(firebaseUser.uid, cancelation.$id).remove();
            $scope.showToast('Cancelation Deleted!', 'md-toast-delete');
          });
    }


    $scope.cancelationDialog = function(event, meeting, color) {
      
      $scope.dialog = meeting;
              $mdDialog.show({
                controller: function () { 
                  this.parent = $scope; 
                  $scope.cancel = function() {
                $mdDialog.cancel();
              };
                },
                controllerAs: 'ctrl',
                parent: angular.element(document.body),
                template: '<md-dialog aria-label="Meeting details" style="border-radius: 12px;max-width:450px;max-height:350px;">' +
                      '<md-toolbar>' +
                    '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
                      '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Meeting is canceled for you </h6></span>' +
                    '</div>' +
                  '</md-toolbar>' +
                    '<md-dialog-content>' +
                   ' <div class="md-dialog-content">' +
                      '{{ctrl.parent.dialog.excuse}}' +
                    '</div>' +
                  '</md-dialog-content>' +
                  '<md-dialog-actions layout="row">' +
                    '<md-button ng-click="ctrl.parent.cancel()">' +
                       'Ok' +
                   ' </md-button>' +
                  '</md-dialog-actions>' +
                '</md-dialog>',
                targetEvent: event,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
              })
              .then(function(answer) {
               
               }, function() {
                
              });
    }; // suspentionDialog

    $scope.showToast = function(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
    }; // Show Toast

    }   //if statement
  }); //firebaseUser
 }); // SuspentionController
}());