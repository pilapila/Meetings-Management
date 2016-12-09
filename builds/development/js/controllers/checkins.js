meetingsApp.controller('CheckinsController', function
  ( $scope, $rootScope, $firebase, $firebaseAuth, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $filter, 
    RefServices, productListPageCount, paginationActiveClass, 
    paginationActiveClassDir) {

  	$scope.whichmeeting = $routeParams.mId;
  	$scope.whichuser = $routeParams.uId;

	


// Jquery and html part

$('.modal').modal();

var clearButton = $( '#clearButton' ).on({
  click: function() {
    $( $(this).data('click') ).trigger('click');
    $scope.meeting = "";
    $scope.deactiveForm();
    $scope.nameAction = "Add New Meeting";
	$scope.meetingAction = "add";
  }
});

$('.collapsible').collapsible({});
$('.tooltipped').tooltip({delay: 50});
$('select').material_select();
$(".button-collapse").sideNav();

(function($) {
    $(function() {
      $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            hover: false, // Activate on hover
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
          });
    }); // End Document Ready
})(jQuery); // End of jQuery name space



}); // CheckinsController