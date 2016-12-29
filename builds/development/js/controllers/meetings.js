(function(){
 'use strict';

meetingsApp.controller('MeetingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices, productListPageCount) {

	
   	$scope.meetingAction = "add";
   	$scope.nameAction = "Add New Meeting";

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

		   	

		   	const settingsRef = RefServices.refSettings(firebaseUser);
			settingsRef.on('value', function (snap) {
				$timeout(function () {
					$rootScope.themeColor1 	   = snap.val().color1;
					$rootScope.themeColor2 	   = snap.val().color2;
					$rootScope.themeColor3 	   = snap.val().color3;
					$rootScope.backImage   	   = snap.val().image;
					$scope.dayToAlarm      	   = snap.val().day;
					$rootScope.animeAction     = snap.val().anime;

					$scope.setAllCount(snap.val().day);
				}, 0);
			}); //ref to setting

			
			$rootScope.invitationShow = false;
			RefServices.refInvitations(firebaseUser.uid)
				.on('value', function (snap) {
		        	if (snap.numChildren() > 0) {
		        		$rootScope.invitationShow = true;
		        		$rootScope.invitationNum = snap.numChildren();
		        	} else if (snap.numChildren() == 0) {
		        		$rootScope.invitationShow = false;
		        		$rootScope.invitationNum = 0;
		        	}
	    	}); // ref to find number of invitations

		$scope.$on('newSetAllCount', function(event, day){
			$scope.setAllCount(day);
		});

		$scope.setAllCount = function(day) {
			const meetingRef = RefServices.refData(firebaseUser);
		  		  meetingRef.on('value', function (snap) {
		            $timeout(function () {

		            	$scope.firebaseUser = firebaseUser.uid;
		            	$scope.allMeetings = $firebaseArray(meetingRef);
            			$rootScope.howManyMeetings = 0;
            			$rootScope.howManyCancel = 0;
            			$scope.meetings = [];
            			$scope.cancelMeetings = [];

			        	$scope.allMeetings.$loaded().then(function (list) { // asynchronous data in AngularFire

			        		for (var i = 0; i < $scope.allMeetings.length; i++) {

			        			if ( $scope.allMeetings[i].pause == false ) {
			        				$scope.meetings.push($scope.allMeetings[i]);
			        				$rootScope.howManyMeetings += 1;

			        			} else if ( $scope.allMeetings[i].pause == true ) {
			        				$scope.cancelMeetings.push($scope.allMeetings[i]);
			        				$rootScope.howManyCancel += 1;
			        			}

			        		}; // find pause meetings

			        		var countMeeting = $rootScope.howManyMeetings;
			        		var countCancel = $rootScope.howManyCancel;

				            if (countMeeting == 0) {
				            	$scope.meetingsInfo = false;
				            } else {
				            	$scope.meetingsInfo = true;
				            }

				            if (countCancel == 0) {
				            	$rootScope.cancelShow = false;
				            } else {
				            	$rootScope.cancelShow = true;
				            }

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
							$scope.meetingAlarmFilter = [];
							$scope.showAlarmList = false;
				            
				            $scope.meetingExp = [];
				            $scope.meetingExpFilter = [];
				            $scope.showExpList = false;
							
				            angular.forEach($scope.meetings, function (value, key) {

				            	var date1 = new Date(today);
								var date2 = new Date(value.dateMeeting);

								var timeDiff = (date2.getTime() - date1.getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

				            	if(diffDays > 0 && diffDays <= day){

				            		$rootScope.alarm += 1;
				            		$scope.meetings[key].dayColor = "707070";
				            		$scope.meetingAlarm.push(key);
				            		if (diffDays == 1) {
				            			$scope.meetings[key].remainDay = diffDays + " day remain";
				            		} else if (diffDays > 1) {
				            			$scope.meetings[key].remainDay = diffDays + " days remain";
				            		}

				            	} else if (diffDays < 0) {

				            		$scope.meetings[key].remainDay = "expired";
				            		$rootScope.expiredDate += 1;
				            		$scope.meetings[key].dayColor = "cc2864";
				            		$scope.meetings[key].textColor = "cc2864";
				            		$scope.meetingExp.push(key);
				            		if (diffDays == -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " day passed";
				            		} else if (diffDays < -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " days passed";
				            		}

				            	} else if (diffDays == 0) {

				            		$scope.meetings[key].remainDay = "Today!";
				            		$scope.meetings[key].dayColor = "419215";
				            		$scope.meetings[key].textColor = "419215";
				            		$rootScope.alarm += 1;
				            		$scope.meetingAlarm.push(key);

				            	} else if (diffDays > day) {

				            		$scope.meetings[key].remainDay = diffDays + " days remain";
				            		$scope.meetings[key].dayColor = "707070";

				            	}

				            	for (var i = 0; i < $scope.meetingAlarm.length; i++) {
				            		if ( key == $scope.meetingAlarm[i]) {
				            			$scope.meetingAlarmFilter[i] = value;
				            			$scope.showAlarmList = true;
				            		}
				            	};

				            	for (var i = 0; i < $scope.meetingExp.length; i++) {
				            		if ( key == $scope.meetingExp[i]) {
				            			$scope.meetingExpFilter[i] = value;
				            			$scope.showExpList = true;
				            		}
				            	};
				            });

		           		}.bind(this)); // asynchronous data in a wrong way actially!
					}, 100); // it is 100 because this part depends on setting ref
	       		});  //ref to database
		};

						
	    $scope.addMeeting = function() {
	    	$timeout(function () {
		      if ($scope.meetingAction === "add") {
		        RefServices.refData(firebaseUser).push().set({
	               'name':         	$scope.meeting.name,
	               'description':  	$scope.meeting.description,
	               'dateEnter':    	firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  	$('.datepicker').val(),
	               'time':         	$('.timepicker').val(),
	               'pause':         false 
		        }).then(function() {
	            	$scope.showToast('Added Meeting', 'md-toast-add');
	            	$scope.meeting = "";
	            	$(".collapsible-header").removeClass(function(){
					    return "active";
					});
					$(".collapsible").collapsible({accordion: true});
					$(".collapsible").collapsible({accordion: false});
	            	$("#name").val("");
					$("#name").next().removeClass("active");
					$("#description").val("");
					$("#description").next().removeClass("active");
					inputElement.data( 'pickadate' ).clear();
		        }); // if action is add statement
		      } else if ($scope.meetingAction === "edit") {
		      	RefServices.meetData(firebaseUser, $scope.key).update({
	               'name':         		$scope.meeting.name,
	               'description': 		$scope.meeting.description,
	               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
	               'dateMeeting':  		$('.datepicker').val(),
	               'time':         		$('.timepicker').val()
	            }).then(function() {
	            	$scope.editCheckinsMeeting($scope.meeting, $('.datepicker').val(), $('.timepicker').val());
	            	$scope.showToast('Edited Meeting', 'md-toast-add');
	            	$scope.meeting = "";
	            	$scope.nameAction = "Add New Meeting";
					$scope.meetingAction = "add";
					$(".collapsible-header").removeClass(function(){
					    return "active";
					});
					$(".collapsible").collapsible({accordion: true});
					$(".collapsible").collapsible({accordion: false});
					$("#name").val("");
					$("#name").next().removeClass("active");
					$("#description").val("");
					$("#description").next().removeClass("active");
					inputElement.data( 'pickadate' ).clear();

		        }); // if action is edit statement
		      }
		    }, 0);
		};   // add Meeting 

		$scope.editCheckinsMeeting = function(meeting, date, time) {
			const refEditCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.key);
	        refEditCheckins.on('value', function (snap) {
		        // ref to invitees who accepted or just sent in order to edit them
	            $scope.editCheckins = $firebaseArray(refEditCheckins);
	            $scope.editCheckins.$loaded().then(function (list) {
	                for (var i = 0; i < $scope.editCheckins.length; i++) {
	                    
	                    if ( $scope.editCheckins[i].send == true && 
	                         $scope.editCheckins[i].accept == true && 
	                         $scope.editCheckins[i].reject == false ) {
	                    	
	                        RefServices.refMeetChecked($scope.editCheckins[i].regUser, $scope.editCheckins[i].inviteeId)
	                          .update({
	                                   'name':         		meeting.name,
						               'description': 		meeting.description,
						               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
						               'dateMeeting':  		date,
						               'time':         		time,
						               'change':            true
	                                });

	                    } else if ( $scope.editCheckins[i].send == true && 
	                                $scope.editCheckins[i].accept == false && 
	                                $scope.editCheckins[i].reject == false ) {

	                        RefServices.refDeleteInvitation($scope.editCheckins[i].regUser, $scope.editCheckins[i].whichInvitation)
	                          .update({
	                                   'name':         		meeting.name,
						               'description': 		meeting.description,
						               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
						               'dateMeeting':  		date,
						               'time':         		time
	                                });
	                    } // end else if

	                  };
	                }.bind(this)); // asynchronous data, but in a wrong way actially!
		       
		    });  // snap val()
		}; // editCheckinsMeeting

		$scope.deleteMeeting = function(event, key, meeting) {
			var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete ' +  meeting  + ' ?')
				.ok('Yes')
				.cancel('Cancel')
				.targetEvent(event);
			$mdDialog.show(confirm).then(function(){
				RefServices.meetData(firebaseUser, key).remove();
				$scope.showToast('Meeting Deleted!', 'md-toast-delete');
			}, function(){

			});

		};  // delete Meeting

		$scope.showToast = function(message, color) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass(color)
					.content(message)
					.position('top, right')
					.hideDelay(2000)
			);
		}; // Show Toast

		$scope.getEdit = function (key) {
		  $timeout(function () {

			$scope.key = key;
			$scope.nameAction = "Edit Meeting";
			$scope.meetingAction = "edit";
			$(".collapsible-header").addClass("active");
			$(".collapsible").collapsible({accordion: false});
			$("#name").next().addClass("active");
			$("#description").next().addClass("active");

			RefServices.meetData(firebaseUser, key).on('value', function (snap) {
		        	$scope.editMeeting = snap.val();
		        	var $inputDate = $('.datepicker').pickadate();
					var pickerDate = $inputDate.pickadate('picker');
					var setDatePicker = pickerDate.set("select", new Date($scope.editMeeting.dateMeeting));
					
					var spliceTime = $scope.editMeeting.time.slice(0, 5);
					var time = new Date(),
					    s = spliceTime + " AM",
					    parts = s.match(/(\d+)\:(\d+) (\w+)/),
					    hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
					    minutes = parseInt(parts[2], 10);

					time.setHours(hours);
					time.setMinutes(minutes);
					
		        	$scope.meeting = {
		        	   'name':         $scope.editMeeting.name,
		               'description':  $scope.editMeeting.description,
		               'date':         setDatePicker,
		               'time':         time,
		               'key':          key
		        	}

		        	
	       	});  //ref to database
	      }, 0); // timeput
		}; // get edit function

		$scope.pauseMeetingAction = function(excuse, meeting) {
			const refPauseCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
			refPauseCheckins.on('value', function (snap) {
				$timeout(function () {
					$scope.pauseCheckins = $firebaseArray(refPauseCheckins);
					$scope.pauseCheckins.$loaded().then(function (list) {
						for (var i = 0; i < $scope.pauseCheckins.length; i++) {
							
							if ( $scope.pauseCheckins[i].send == true && 
								 $scope.pauseCheckins[i].accept == true && 
								 $scope.pauseCheckins[i].reject == false ) {

									RefServices.refMeetChecked($scope.pauseCheckins[i].regUser, $scope.pauseCheckins[i].inviteeId)
										.update({
							               'pause':  true,
							               'excuse': excuse
							            });

							        RefServices.refCheckedPerson(firebaseUser.uid, meeting.$id, $scope.pauseCheckins[i].$id)
										.update({
							               'pause':  true,
							               'excuse': excuse
							            });

							} else if ( $scope.pauseCheckins[i].send == true && 
										$scope.pauseCheckins[i].accept == false && 
										$scope.pauseCheckins[i].reject == false ) {

									RefServices.refDeleteInvitation($scope.pauseCheckins[i].regUser, $scope.pauseCheckins[i].whichInvitation)
										.update({
							               'pause':  true,
							               'excuse': excuse
							            });

							        RefServices.refCheckedPerson(firebaseUser.uid, meeting.$id, $scope.pauseCheckins[i].$id)
										.update({
							               'pause':  true,
							               'excuse': excuse
							            });
							} // end else if

						};
					}.bind(this)); // asynchronous data in a wrong way actially!
				}, 0); // timeout
			});  // snap val()

				RefServices.refMeetChecked(firebaseUser.uid, meeting.$id).update({
					'pause':  true,
					'excuse': excuse
				});

		} // pauseMeetingAction

		$scope.pauseMeetingDialog = function(event, meeting, color) {
	        $mdDialog.show({
	          controller: function () { 
	            this.parent = $scope; 
	            $scope.cancel = function() {
	              $mdDialog.cancel();
	            };
	            $scope.delete = function(myExcuse) {
	              $scope.pauseMeetingAction(myExcuse, meeting);
	              $mdDialog.cancel();
	            };
	          },
	          controllerAs: 'ctrl',
	          parent: angular.element(document.body),
	          template: 
	          '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
	          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;max-height:150px;height:150px;">' +
	                '<md-toolbar>' +
	              '<div class="md-toolbar-tools left left" style="background-color:'+ color +'">' +
	                '<i class="fa fa-pause-circle-o fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
	                '<span flex><h6>Are you sure you want to suspend this meeting?</h6></span>' +
	              '</div>' +
	            '</md-toolbar>' +
	              '<md-dialog-content>' +
	               '<div class="md-dialog-content">' +
	                  ' <input type="text" name="text" ng-model="myExcuse"  ' +
	                              ' class="validate" id="text" required="" aria-required="true" ' +
	                              ' style="height:2.3rem;font-size:0.9rem" placeholder="Please explain your excuse..."> ' +
	                    ' <label for="text" style="font-size:0.8rem" ' +
	                    ' data-error="Please enter your excuse."> ' +
	                     '' +
	                    ' </label> ' +
	              '</div>' +
	            '</md-dialog-content>' +
	            '<md-dialog-actions layout="row" style="margin-top:-20px">' +
	              '<md-button ng-click="ctrl.parent.cancel()">' +
	                 'No' +
	             ' </md-button>' +
	             '<md-button type="submit">' +
	                 'Yes' +
	             ' </md-button>' +
	            '</md-dialog-actions>' +
	          '</md-dialog>'+
	          '</form>',
	          targetEvent: event,
	          clickOutsideToClose:true,
	          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
	        })
	        .then(function(answer) {}, function() {
	          
	        });
		}; // pause meeting


    $scope.showMeetDialog = function(event, key, meeting) {
    	
     	$scope.dialog = meeting;
        $mdDialog.show({
          controller: function () { 
          	this.parent = $scope; 
          	$scope.cancel = function() {
		      $mdDialog.cancel();
		      if ( meeting.change ) {
			      RefServices.meetData(firebaseUser, meeting.$id)
	                  .update({
				               'change':  false
	                        });
              }

		    };
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template: '<md-dialog aria-label="Meeting details" style="border-radius: 12px;max-width:450px;max-height:350px;">' +
	          		'<md-toolbar>' +
				      '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
				        '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Meeting details</h6></span>' +
				      '</div>' +
				    '</md-toolbar>' +
			        '<md-dialog-content>' +
				     ' <div class="md-dialog-content">' +
				     	'<div ng-show="ctrl.parent.dialog.firstnameCaller"><div class="cropInfo" style="margin-right:0px;margin-top:5px"><img src="images/personal_pics/{{ctrl.parent.dialog.imageCaller}}.jpg"></div>' +
				     	'<div style="margin-left:45px;margin-top:-40px"><br><b> Caller: </b> {{ ctrl.parent.dialog.firstnameCaller }} {{ ctrl.parent.dialog.lastnameCaller }} </div></div>' +
				        '<p><i class="fa fa-users" aria-hidden="true"></i><b> Meeting Name: </b> {{ ctrl.parent.dialog.name }} </p>' +
				        '<p style="font-size:0.9rem;color:#747474">{{ ctrl.parent.dialog.description }} </p>' +
				        '<p style="margin-top:-10px;color:#2ea6c8"><i class="fa fa-calendar-o" aria-hidden="true"></i> <b style="color:#2ea6c8"> Meeting Date: </b> {{ ctrl.parent.dialog.dateMeeting | date }} </p>' +
				        '<p style="margin-top:-10px;color:#2ea6c8"><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> <b style="color:#2ea6c8"> Meeting Time: </b> {{ ctrl.parent.dialog.time | limitTo:5 }} </p>' +
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
    }; // show meeting dialog

    
	}   //if statement
  }); //firebaseUser



 //  $scope.deactiveForm = function() {
	// inputElement.data( 'pickadate' ).clear();
	// $("#name").val("");
	// $("#name").next().removeClass("active");
	// $("#description").val("");
	// $("#description").next().removeClass("active");
 //  };

	$('input#name, textarea#textarea1').characterCounter();
	$('input#description, textarea#textarea1').characterCounter();
    //$('.modal').modal();
	
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

 //  	var clearButton = $( '#clearButton' ).on({
	//     click: function() {
	//         $( $(this).data('click') ).trigger('click');
	//         $scope.meeting = "";
	//         $scope.deactiveForm();
	//         $scope.nameAction = "Add New Meeting";
	// 		$scope.meetingAction = "add";
	//     }
	// });

	$scope.clearButton =  function() {
	        $( $( '#clearButton' ).data('click') ).trigger('click');
	        $scope.meeting = "";
	        $scope.nameAction = "Add New Meeting";
			$scope.meetingAction = "add";
			$("#name").val("");
			$("#name").next().removeClass("active");
			$("#description").val("");
			$("#description").next().removeClass("active");
			inputElement.data( 'pickadate' ).clear();
	    };

  	$('.collapsible').collapsible({});
  	$('.tooltipped').tooltip({delay: 50});
  	$('select').material_select();
  	$('.timepicker').pickatime({
	    default: 'now',
	    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
	    donetext: 'OK',
	    autoclose: true,
	    vibrate: true // vibrate the device when dragging clock hand
	});

	$('.button-collapse').sideNav('destroy');
	$(".button-collapse").sideNav({
	    menuWidth: 240, // Default is 240
	    edge: 'left', // Choose the horizontal origin
	    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
	    draggable: true
	});

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


 }); // MeetingsController

}());