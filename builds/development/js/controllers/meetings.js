(function(){
  'use strict';

	meetingsApp.controller('MeetingsController', 
	  function($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog) {

		const dbRefObject = firebase.database().ref().child('/meetings');
	        dbRefObject.on('value', function (snap) {
	            $timeout(function () {
		            $scope.meetings = snap.val();
	            }, 0); //timeout 
	        });  //ref to database

	    $scope.addMeeting = function() {
	        const meetingListRef = firebase.database().ref().child('/meetings').push();
	            meetingListRef.set({
	              'name':         $scope.meeting.name,
	              'description':  $scope.meeting.description,
	              'dateEnter':    Firebase.ServerValue.TIMESTAMP,
	              'dateMeeting':  $('.datepicker').val(),
	              'time':         $('.timepicker').val()
	            }).then(function() {
	            	$scope.showToast('Added Meeting');
	            	$scope.meeting = '';
	            	$scope.deactiveForm();
	            });
	    }   // addMeeting 


	    // $scope.deleteMeeting = function(key){
	    //     var meetingname = firebase.database().ref('/meetings/' + key );
	    //     meetingname.remove();
	    // } // delete meeting

		$scope.deleteMeeting = function(event, key, meeting) {
			console.log(meeting);
			var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete ' + meeting + '?')
				.ok('Yes')
				.cancel('Cancel')
				.targetEvent(event);
			$mdDialog.show(confirm).then(function(){
				var meetingname = firebase.database().ref('/meetings/' + key );
				meetingname.remove();
				$scope.showToast('Meeting Deleted!');
			}, function(){

			});

		};

		$scope.showToast = function(message) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass('md-toast-error')
					.content(message)
					.position('top, right')
					.hideDelay(3000)
			);
		};
<!-- ------------------------Html Jquery----------------------------------------------------------- -->
	    
	    $scope.deactiveForm = function() {
	    	inputElement.data( 'pickadate' ).clear();
	    	$("#name").val("");
			$("#name").next().removeClass("active");
			$("#invitees").val("");
			$("#invitees").next().removeClass("active");
			$("#description").val("");
			$("#description").next().removeClass("active");
	    };
		
		$('input#name, textarea#textarea1').characterCounter();
		//$('input#time, textarea#textarea1').characterCounter();
		$('input#description, textarea#textarea1').characterCounter();
	    $('.modal').modal();

		var inputElement = $('.datepicker').pickadate({
			onClose: function() {
			    $(document.activeElement).blur();
			},
			onSet: function (ele) {
			   if(ele.select){
			          this.close();
			   }
			},
		    selectMonths: true, // Creates a dropdown to control month
		    selectYears: 15, // Creates a dropdown of 15 years to control year
		    format: 'dd-mm-yyyy'
	  	});

	  	var clearButton = $( '#clearButton' ).on({
		    click: function() {
		        $( $(this).data('click') ).trigger('click');
		        $scope.meeting = '';
		        $scope.deactiveForm();
		    }
		});


	  	$('.collapsible').collapsible({});
	  	$('.tooltipped').tooltip({delay: 50});
	  	$('.timepicker').pickatime({
		    default: 'now',
		    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
		    donetext: 'OK',
		    autoclose: false,
		    vibrate: true // vibrate the device when dragging clock hand
		});

	  	// $('[data-click]').on('click', function (e) {
	    	
	   //  }); 
		 
	}); // MeetingsController

}());