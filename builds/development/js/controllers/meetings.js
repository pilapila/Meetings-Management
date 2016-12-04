(function(){
 'use strict';

meetingsApp.controller('MeetingsController', 
  function($scope, $rootScope, $firebase, $timeout, $firebaseArray, $firebaseObject, 
  		   $mdToast, $mdDialog, $mdMedia, RefServices) {
  	
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
				            $scope.meetingAlarmFilter = [];
							
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
				            		if (diffDays == -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " day passed";
				            		} else if (diffDays < -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " days passed";
				            		}
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
				            			$scope.meetingAlarmFilter[i] = value;
				            			$scope.showAlarmList = true;
				            		}
				            	};
				            });

		           		}.bind(this)); // asynchronous data in AngularFire
					}, 0);
	       		});  //ref to database
						
	    $scope.addMeeting = function() {
	    	
	    	var shortName = "";
	    	var shortDescription = "";
	    	var nameLength = $scope.meeting.name.length;
	    	var descriptionLength = $scope.meeting.description.length;
	    	var showCountName = nameLength - 15;
	    	var showCountDes = descriptionLength - 15;

	    	if (nameLength > 15) {
	    		shortName = $scope.meeting.name.substr(0, nameLength-showCountName) + ' ...';
	    	} else {
	    		shortName = $scope.meeting.name;
	    	}
	    	if (descriptionLength > 15) {
	    		shortDescription = $scope.meeting.description.substr(0, descriptionLength-showCountDes) + ' ...';
	    	} else {
	    		shortDescription = $scope.meeting.description;
	    	} // check for name and description's string not more than 15 char

	    	$timeout(function () {
		      if ($scope.meetingAction == "add") {
		        RefServices.refData(firebaseUser).push().set({
	               'name':         		$scope.meeting.name,
	               'shortName':    		shortName,
	               'description':  		$scope.meeting.description,
	               'shortDescription': 	shortDescription,
	               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  		$('.datepicker').val(),
	               'time':         		$('.timepicker').val()
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
	               'name':         		$scope.meeting.name,
	               'shortName':    		shortName,
	               'description': 		$scope.meeting.description,
	               'shortDescription': 	shortDescription,
	               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  		$('.datepicker').val(),
	               'time':         		$('.timepicker').val()
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
		        	$scope.editMeeting = snap.val();

		        	var $inputDate = $('.datepicker').pickadate();
					var pickerDate = $inputDate.pickadate('picker');
					var setDatePicker = pickerDate.set("select", new Date($scope.editMeeting.dateMeeting));

					// var $inputTime = $('.timepicker').pickatime();
					// var pickerTime = $inputTime.pickatime('picker');
					// var setTimePicker = pickerTime.set("select", $scope.editMeeting.time);

		        	$scope.meeting = {
		        	   'name':         $scope.editMeeting.name,
		               'description':  $scope.editMeeting.description,
		               'date':         setDatePicker,
		               //'time':         setTimePicker
		        	}
		        	console.log($scope.editMeeting.dateMeeting);
		        	//console.log(new time($scope.editMeeting.time));
		        }, 0); // timeput
	       	});  //ref to database
		}; // get edit

	}   //if statement
  }); //firebaseUser


    $scope.showMeetDialog = function(ev, key, meeting) {
     	$scope.dialog = meeting;
     	console.log(meeting);
        $mdDialog.show({
          controller: function () { this.parent = $scope; },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template: '<md-dialog aria-label="Meeting details">' +
	          		'<md-toolbar>' +
				      '<div class="md-toolbar-tools left left">' +
				        '<span flex><h6>Meeting details</h6></span>' +
				      '</div>' +
				    '</md-toolbar>' +
			        '<md-dialog-content>' +
				     ' <div class="md-dialog-content">' +
				        '<p><i class="material-icons md-dark" style="color: #c2c2c2;padding-right: 10px;">people</i><b style="color:#e62291;"> Meeting Name: </b> {{ ctrl.parent.dialog.name }} </p>' +
				        '<p><i class="material-icons md-dark" style="color: #c2c2c2;padding-right: 10px;">description</i><b style="color:#e62291;"> Meeting Description: </b> {{ ctrl.parent.dialog.description }} </p>' +
				        '<p><i class="material-icons md-dark" style="color: #c2c2c2;padding-right: 10px;">today</i><b style="color:#e62291;"> Meeting Date: </b> {{ ctrl.parent.dialog.dateMeeting }} </p>' +
				        '<p><i class="material-icons md-dark" style="color: #c2c2c2;padding-right: 10px;">alarm</i><b style="color:#e62291;"> Meeting Time: </b> {{ ctrl.parent.dialog.time }} </p>' +
				      '</div>' +
				    '</md-dialog-content>' +
				'</md-dialog>',
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          
          //console.log("Answer is:", answer.firstname.$viewValue, answer.lastname.$viewValue, answer.email.$viewValue , regUser, key);
        }, function() {
          console.log("Cancel");
        });
    }

    function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
    }// Show Advanced

    


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
	    autoclose: true,
	    vibrate: true // vibrate the device when dragging clock hand
	});
		  	// $('[data-click]').on('click', function (e) {
		   //  }); 
 }); // MeetingsController

}());