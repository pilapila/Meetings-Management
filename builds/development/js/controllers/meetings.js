(function(){
 'use strict';

meetingsApp.controller('MeetingsController', 
  function($scope, $rootScope, $firebase, $timeout, $firebaseArray, $firebaseObject, 
  		   $mdToast, $mdDialog, RefServices) {
  	
	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

			$scope.nameAction = "Add New Meeting";
			$scope.meetingAction = "add";

			const meetingRef = RefServices.refData(firebaseUser);
		  		  meetingRef.on('value', function (snap) {
		            $timeout(function () {

		            	// sort by fields
		            	$scope.sort = function (field) {
		            		$scope.sort.field = field;
		            		$scope.sort.order = !$scope.sort.order;
		            	};

		            	$scope.sort.field = 'name';
		            	$scope.sort.order = false;  // ordering for meetings

			            $scope.meetings = $firebaseArray(meetingRef);
			            $rootScope.howManyMeetings = snap.numChildren();

			            var count = $rootScope.howManyMeetings;

			        	$scope.meetings.$loaded().then(function (list) { // asynchronous data in AngularFire

				            var today = new Date();
							var dd = today.getDate();
							var mm = today.getMonth()+1; //January is 0!
							var yyyy = today.getFullYear();

							if(dd<10) {
							    dd='0'+dd
							} 

							if(mm<10) {
							    mm='0'+mm
							} 
							today = yyyy+'-'+mm+'-'+dd;

							$rootScope.alarm = 0;
							$rootScope.expiredDate = 0;
							$scope.meetingAlarm = [];
							$scope.showAlarmList = false;
				            $scope.meetingAlarmFilter = {};
							
				            angular.forEach($scope.meetings, function (value, key) {

				            	var date1 = new Date(today);
								var date2 = new Date(value.dateMeeting);

								var timeDiff = (date2.getTime() - date1.getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
								
				            	if(diffDays > 0 && diffDays <= 2){
				            		$rootScope.alarm += 1;
				            		$scope.meetingAlarm.push(key);
				            		if (diffDays == 1) {
				            			$scope.meetings[key].remainDay = diffDays + " day";
				            		} else {
				            			$scope.meetings[key].remainDay = diffDays + " days";
				            		}
				            	} else if (diffDays < 0) {
				            		$scope.meetings[key].remainDay = "expired";
				            		$rootScope.expiredDate += 1;
				            		$scope.meetings[key].dayColor = "#d81b60";
				            		$scope.meetings[key].textColor = "#ccc";
				            		$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " days passed";
				            	} else if (diffDays == 0) {
				            		$scope.meetings[key].remainDay = "Today!";
				            		$scope.meetings[key].dayColor = "#419215";
				            		$rootScope.alarm += 1;
				            		$scope.meetingAlarm.push(key);
				            	} else if (diffDays > 2) {
				            		$scope.meetings[key].remainDay = diffDays + " days";
				            	}

				            	for (var i = 0; i < $scope.meetingAlarm.length; i++) {
				            		if ( key == $scope.meetingAlarm[i]) {
				            			$scope.meetingAlarmFilter[key] = value;
				            			$scope.showAlarmList = true;
				            		}
				            	};

				            });
		           		}.bind(this)); // asynchronous data in AngularFire
					}, 0);
	       		});  //ref to database
						
	    $scope.addMeeting = function() {
	    	$timeout(function () {
		      if ($scope.meetingAction == "add") {
		        RefServices.refData(firebaseUser).push().set({
	               'name':         $scope.meeting.name,
	               'description':  $scope.meeting.description,
	               'dateEnter':    firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  $('.datepicker').val(),
	               'time':         $('.timepicker').val()
		        }).then(function() {
	            	$scope.showToast('Added Meeting');
	            	$scope.meeting = "";
	            	$scope.deactiveForm();
	            	$(".collapsible-header").removeClass(function(){
					    return "active";
					});
					$(".collapsible").collapsible({accordion: true});
					$(".collapsible").collapsible({accordion: false});
		        }); // if action is add statement
		      } else if ($scope.meetingAction == "edit") {
		      	RefServices.meetData(firebaseUser, $scope.key).update({
	               'name':         $scope.meeting.name,
	               'description':  $scope.meeting.description,
	               'dateEnter':    firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  $('.datepicker').val(),
	               'time':         $('.timepicker').val()
	            }).then(function() {
	            	$scope.showToast('Edited Meeting');
	            	$scope.deactiveForm();
	            	$scope.nameAction = "Add New Meeting";
					$scope.meetingAction = "add";
					$(".collapsible-header").removeClass(function(){
					    return "active";
					});
					$(".collapsible").collapsible({accordion: true});
					$(".collapsible").collapsible({accordion: false});
		        }); // if action is edit statement
		      }
		    }, 0);
		}   // add Meeting 

		$scope.deleteMeeting = function(event, key, meeting) {
			var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete ' +  meeting  + ' ?')
				.ok('Yes')
				.cancel('Cancel')
				.targetEvent(event);
			$mdDialog.show(confirm).then(function(){
				RefServices.meetData(firebaseUser, key).remove();
				$scope.showToast('Meeting Deleted!');
			}, function(){

			});

		};  // delete Meeting

		$scope.showToast = function(message) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass('md-toast-error')
					.content(message)
					.position('top, right')
					.hideDelay(3000)
			);
		}; // Show Toast

		$scope.getEdit = function (key) {
			$scope.nameAction = "Edit Meeting";
			$scope.meetingAction = "edit";
			$(".collapsible-header").addClass("active");
			$(".collapsible").collapsible({accordion: false});
			$("#name").next().addClass("active");
			$("#description").next().addClass("active");

			RefServices.meetData(firebaseUser, key).on('value', function (snap) {
		        $timeout(function () {
		        	$scope.key = key;
		        	$scope.meeting = snap.val();
		        }, 0); // timeput
	       	});  //ref to database
		}; // get edit

	}   //if statement
  }); //firebaseUser

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
				//selectMonths: true,
			    min: new Date(),
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
			    format: 'yyyy-mm-dd'
		  	});

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