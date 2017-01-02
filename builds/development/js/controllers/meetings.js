(function(){
 'use strict';

meetingsApp.controller('MeetingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices, productListPageCount) {

	
   	$scope.meetingAction = "add";
   	$scope.nameAction = "Add New Meeting";

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

		   	const refAllCancelations = RefServices.refCancellations(firebaseUser.uid);
		   	refAllCancelations.on('value', function (snap) {
				$timeout(function () {
					$scope.cancelationList = $firebaseArray(refAllCancelations);
					$rootScope.cancelationNum = snap.numChildren();
				}, 0);
			}); //ref to cancelation

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

			RefServices.refCaller(firebaseUser.uid)
		      .on('value', function (snap) {
		        $timeout(function () {
		          $scope.callerMeetingInfo = snap.val();
		        }, 0);
		      }); // Ref to users to find picture of caller

			
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

							if ( !$scope.meetings[key].dateMeeting ) {
			            		$scope.meetings[key].dayColor = "b4b4b4";
							}

			            	if(diffDays > 0 && diffDays <= day){

			            		$rootScope.alarm += 1;
			            		$scope.meetings[key].dayColor = "3f3f3f";
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
			            		$scope.meetings[key].dayColor = "3f3f3f";

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
	       
	    }); // snap val()
	}; // editCheckinsMeeting

	
	$scope.deleteCheckinsMeetingAction = function(myExcuse, meeting) {
		
		const refSenddeleteToCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
		refSenddeleteToCheckins.on('value', function (snap) {
		  
			$scope.deleteCheckinsList = $firebaseArray(refSenddeleteToCheckins);
            $scope.deleteCheckinsList.$loaded().then(function (list) {

            for (var i = 0; i < $scope.deleteCheckinsList.length; i++) {

						if ( $scope.deleteCheckinsList[i].send == true && 
							 $scope.deleteCheckinsList[i].accept == true && 
							 $scope.deleteCheckinsList[i].reject == false ) {

							  RefServices.refMeetChecked($scope.deleteCheckinsList[i].regUser, $scope.deleteCheckinsList[i].inviteeId).remove();
						      RefServices.refCancellations($scope.deleteCheckinsList[i].regUser).push().set({
						            'dateMeeting':      meeting.dateMeeting,
						            'name':             meeting.name,
						            'description':      meeting.description,
						            'time':             meeting.time,
						            'imageCaller':      $scope.callerMeetingInfo.image,
						            'firstnameCaller':  $scope.callerMeetingInfo.firstname,
						            'lastnameCaller':   $scope.callerMeetingInfo.lastname,
						            'excuse':           myExcuse
						          });
						      

						} else if ( $scope.deleteCheckinsList[i].send == true && 
									$scope.deleteCheckinsList[i].accept == false && 
									$scope.deleteCheckinsList[i].reject == false ) {
							
							  RefServices.refDeleteInvitation($scope.deleteCheckinsList[i].regUser, $scope.deleteCheckinsList[i].whichInvitation).remove();
							  
						} // end else if

					}; // end for
            }.bind(this));	
		}); // snap val()
		$timeout(function() {
			RefServices.refMeetChecked(firebaseUser.uid, meeting.$id).remove();
			$scope.showToast( 'Meeting Deleted', 'md-toast-delete');
		}, 0);
	}; // deleteCheckinsMeetingAction

	$scope.deleteCheckinsMeetingDialog = function(event, meeting) {
		var firstCheck = true;
		const refFindAcceptedCheckin = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
		refFindAcceptedCheckin.on('value', function (snap) {
			
			$scope.acceptedCheckin = $firebaseArray(refFindAcceptedCheckin);
            $scope.acceptedCheckin.$loaded().then(function (list) {
            $timeout(function() {
            	var checkExplain = false;
            	var valNot = meeting.$id;
            	var keys = {};
            	for (var i = 0; i < $scope.acceptedCheckin.length; i++) {
            		if ($scope.acceptedCheckin[i].accept) {
            			checkExplain = true;
            			var valExp = $scope.acceptedCheckin[i].$id;
            		}
            	};
            	
		        if (checkExplain && firstCheck) {
		        	firstCheck = false;
						$mdDialog.show({
				          controller: function () { 
				            this.parent = $scope; 
				            $scope.cancel = function() {
				              $mdDialog.cancel();
				            };
				            $scope.delete = function(myExcuse) {
				              $scope.deleteCheckinsMeetingAction(myExcuse, meeting);
				              $mdDialog.cancel();
				            };
				          },
				          controllerAs: 'ctrl',
				          parent: angular.element(document.body),
				          template: 
					          '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
					          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;max-height:150px;height:150px;">' +
					                '<md-toolbar>' +
					              '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
					                '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
					                '<span flex><h6>Are you sure you want to delete this meeting</h6></span>' +
					              '</div>' +
					            '</md-toolbar>' +
					              '<md-dialog-content>' +
					               '<div class="md-dialog-content">' +
					                  ' <input type="text" name="text" ng-model="myExcuse"  ' +
					                              ' class="validate" id="text" required="" aria-required="true" ' +
					                              ' style="height:2.3rem;font-size:0.9rem" placeholder="Please explain your excuse to your checkins"> ' +
					                    ' <label for="text" style="font-size:0.8rem" ' +
					                    ' data-error="Please enter your excuse."> ' +
					                     '' +
					                    ' </label> ' +
					              '</div>' +
					            '</md-dialog-content>' +
					            '<md-dialog-actions layout="row" style="margin-top:-20px">' +
					              '<md-button ng-click="ctrl.parent.cancel()">' +
					                 'Cancel' +
					             ' </md-button>' +
					             '<md-button type="submit">' +
					                 'delete' +
					             ' </md-button>' +
					            '</md-dialog-actions>' +
					          '</md-dialog>'+
					          '</form>',
					          targetEvent: event,
					          clickOutsideToClose:true,
					          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
					        });

						return false;

		        } else if (!checkExplain && firstCheck) {
		        		firstCheck = false;
							var confirm = $mdDialog.confirm()
							.title('Are you sure you want to delete ' +  meeting.name  + ' ?')
							.ok('Yes')
							.cancel('Cancel')
							.targetEvent(event);
							$mdDialog.show(confirm).then(function(){
								$scope.deleteCheckinsMeetingAction('nothing', meeting);
							});

						return false;

		        } // end if else
		    
		        }, 0);
			  }.bind(this));
			}); // snap val()
		  
		}; // deleteCheckinsMeetingDialog


		$scope.deleteMeeting = function(event, meeting) {

				var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete ' +  meeting.name  + ' ?')
				.ok('Yes')
				.cancel('Cancel')
				.targetEvent(event);
				$mdDialog.show(confirm).then(function(){
					RefServices.meetData(firebaseUser, meeting.$id).remove();
					$scope.showToast('Meeting Deleted!', 'md-toast-delete');
				});

		};  // delete Meeting


		$scope.showToast = function(message, color) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass(color)
					.content(message)
					.position('top, right')
					.hideDelay(1000)
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
		        	if ($scope.editMeeting.dateMeeting) {
		        		var $inputDate = $('.datepicker').pickadate();
						var pickerDate = $inputDate.pickadate('picker');
						var setDatePicker = pickerDate.set("select", new Date($scope.editMeeting.dateMeeting));
		        	} else {
		        		var setDatePicker = '';
		        	};

		        	if ($scope.editMeeting.time) {
						var spliceTime = $scope.editMeeting.time.slice(0, 5);
						var time = new Date(),
						    s = spliceTime + " AM",
						    parts = s.match(/(\d+)\:(\d+) (\w+)/),
						    hours = /am/i.test(parts[3]) ? parseInt(parts[1], 10) : parseInt(parts[1], 10) + 12,
						    minutes = parseInt(parts[2], 10);

						time.setHours(hours);
						time.setMinutes(minutes);
		        	} else {
		        		var time = '';
		        	};
					
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

						}; // end for
					}.bind(this)); // asynchronous data in a wrong way actially!
				}, 0); // timeout
			});  // snap val()

				RefServices.refMeetChecked(firebaseUser.uid, meeting.$id).update({
					'pause':  true,
					'excuse': excuse
				});

				$scope.showToast( 'Meeting Suspended', 'md-toast-delete');

		} // pauseMeetingAction

		$scope.pauseMeetingDialog = function(event, meeting, color) {
	        $mdDialog.show({
	          controller: function () { 
	            this.parent = $scope; 
	            $scope.cancel = function() {
	              $mdDialog.cancel();
	            };
	            $scope.suspend = function(myExcuse) {
	              $scope.pauseMeetingAction(myExcuse, meeting);
	              $mdDialog.cancel();
	            };
	          },
	          controllerAs: 'ctrl',
	          parent: angular.element(document.body),
	          template: 
	          '<form ng-submit="ctrl.parent.suspend(myExcuse)">' +
	          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;max-height:150px;height:150px;">' +
	                '<md-toolbar>' +
	              '<div class="md-toolbar-tools left left" style="background-color:'+ color +'">' +
	                '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
	                '<span flex><h6>Are you sure you want to suspend this meeting</h6></span>' +
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
	                 'Cancel' +
	             ' </md-button>' +
	             '<md-button type="submit">' +
	                 'Suspend' +
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
		    }; // cancel
		    $scope.reject = function() {
		      $mdDialog.cancel();
		      $scope.rejectMeeting(event, meeting, $rootScope.themeColor3);
		    }; // reject
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
					    '<md-button ng-click="ctrl.parent.reject()" ng-show="ctrl.parent.dialog.change">' +
					       'Reject' +
					    '</md-button>' +
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
    }; // show meeting dialog


    $scope.sendRejectToCaller = function(myExcuse, meeting) {
        $timeout(function () {
            const refFindWhichCheckin = RefServices.refCheckin(meeting.whichUser, meeting.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
                $scope.allCheckin = $firebaseArray(refFindWhichCheckin);
                $scope.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < $scope.allCheckin.length; i++) {
                    if ($scope.allCheckin[i].regUser == $scope.firebaseUser) {
                      RefServices.refCheckedPerson(meeting.whichUser, meeting.whichMeeting,  $scope.allCheckin[i].$id)
                        .update({
                          "reject": true,
                          "send":   false,
                          "accept": false,
                          "responceMessage": myExcuse,
                        });
                    }
                  };
                }.bind(this));
              });
            }).then(function() {

            	RefServices.meetData(firebaseUser, meeting.$id).remove();

            	$scope.showToast( 'Meeting rejected', 'md-toast-delete');

        }, 0);
    }; // sendRejectToCaller



    $scope.rejectMeeting = function (event, meeting, color) {
    	
    	$scope.dialog = meeting;
        $mdDialog.show({
          controller: function () { 
            this.parent = $scope; 
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.delete = function(myExcuse) {
              $scope.sendRejectToCaller(myExcuse, $scope.dialog);
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
                '<i class="fa fa-ban fa-lg" style="margin-right:10px" aria-hidden="true"></i>' +
                '<span flex><h6>Are you sure you want to reject this meeting</h6></span>' +
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
                 'Cancel' +
             ' </md-button>' +
             '<md-button type="submit">' +
                 'delete' +
             ' </md-button>' +
            '</md-dialog-actions>' +
          '</md-dialog>'+
          '</form>',
          targetEvent: event,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
         
         }, function() {
          
        });
    }; //rejectMeeting

    
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
	            belowOrigin: true, // Displays dropdown below the button
	            alignment: 'left', // Displays dropdown with edge aligned to the left of button
	          });
	    }); // End Document Ready
	})(jQuery); // End of jQuery name space


 }); // MeetingsController

}());