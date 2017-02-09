(function(){
 'use strict';

meetingsApp.controller('MeetingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog,
   $mdMedia, $filter, $interval, RefServices, productListPageCount) {

	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

      var vm = this;
      var ctrl = this;
      vm.clearButton = clearButton;
      vm.setAllCount = setAllCount;
      vm.addMeeting = addMeeting;
      vm.deleteCheckinsMeetingDialog = deleteCheckinsMeetingDialog;
      vm.deleteMeeting = deleteMeeting;
      vm.showToast = showToast;
      vm.getEdit = getEdit;
      vm.pauseMeetingDialog = pauseMeetingDialog;
      ctrl.showMeetDialog = showMeetDialog;
      vm.rejectMeeting = rejectMeeting;
      vm.editCheckinsMeeting = editCheckinsMeeting;
      vm.deleteCheckinsMeetingAction = deleteCheckinsMeetingAction;
      vm.pauseMeetingAction = pauseMeetingAction;
      vm.sendRejectToCaller = sendRejectToCaller;

      vm.meetingAction = "add";
      vm.nameAction = "Add New Meeting";

	   	const refAllCancelations = RefServices.refCancellations(firebaseUser.uid);
	   	refAllCancelations.on('value', function (snap) {
  			$timeout(function () {
  				vm.cancelationList = $firebaseArray(refAllCancelations);
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
					setAllCount(snap.val().day);
				}, 0);
			}); //ref to setting

			RefServices.refCaller(firebaseUser.uid)
		      .on('value', function (snap) {
		        $timeout(function () {
		          vm.callerMeetingInfo = snap.val();
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

			$rootScope.archiveShow = false;
			RefServices.refArchive(firebaseUser.uid)
				.on('value', function (snap) {
		        	if (snap.numChildren() > 0) {
		        		$rootScope.archiveShow = true;
		        		$rootScope.archiveNum = snap.numChildren();
		        	} else if (snap.numChildren() == 0) {
		        		$rootScope.archiveShow = false;
		        		$rootScope.archiveNum = 0;
		        	}
	    	}); // ref to find number of archives

		$scope.$on('newSetAllCount', function(event, day){
  		setAllCount(day);
  	});

	function setAllCount(day) {
		const meetingRef = RefServices.refData(firebaseUser);
  		  meetingRef.on('value', function (snap) {
          $timeout(function () {
            	vm.firebaseUser = firebaseUser.uid;
            	vm.allMeetings = $firebaseArray(meetingRef);
        			$rootScope.howManyMeetings = 0;
        			$rootScope.howManyCancel = 0;
        			vm.meetings = [];
        			vm.cancelMeetings = [];

		        	vm.allMeetings.$loaded().then(function (list) { // asynchronous data in AngularFire

		        		for (var i = 0; i < vm.allMeetings.length; i++) {

		        			if ( vm.allMeetings[i].pause == false ) {
		        				vm.meetings.push(vm.allMeetings[i]);
		        				$rootScope.howManyMeetings += 1;

		        			} else if ( vm.allMeetings[i].pause == true ) {
		        				vm.cancelMeetings.push(vm.allMeetings[i]);
		        				$rootScope.howManyCancel += 1;
		        			}

		        		}; // find pause meetings

		        		var countMeeting = $rootScope.howManyMeetings;
		        		var countCancel = $rootScope.howManyCancel;

			            if (countMeeting == 0) {
			            	vm.meetingsInfo = false;
			            } else {
			            	vm.meetingsInfo = true;
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

      						vm.meetingAlarm = [];
      						vm.meetingAlarmFilter = [];
      						vm.showAlarmList = false;

			            vm.meetingExp = [];
			            vm.meetingExpFilter = [];
			            vm.showExpList = false;

			            angular.forEach(vm.meetings, function (value, key) {
      			        var date1 = new Date(today);
      							var date2 = new Date(value.dateMeeting);
      							var timeDiff = (date2.getTime() - date1.getTime());
      							var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      							if ( !vm.meetings[key].dateMeeting ) {
      			            		vm.meetings[key].dayColor = "b4b4b4";
      							} // end if

		            	if(diffDays > 0 && diffDays <= day){
		            		$rootScope.alarm += 1;
		            		vm.meetings[key].dayColor = "3f3f3f";
		            		vm.meetingAlarm.push(key);
		            		if (diffDays == 1) {
		            			vm.meetings[key].remainDay = diffDays + " day remain";
		            		} else if (diffDays > 1) {
		            			vm.meetings[key].remainDay = diffDays + " days remain";
		            		}
		            	} else if (diffDays < 0) {
		            		vm.meetings[key].remainDay = "expired";
		            		$rootScope.expiredDate += 1;
		            		vm.meetings[key].dayColor = "cc2864";
		            		vm.meetings[key].textColor = "cc2864";
		            		vm.meetingExp.push(key);
		            		if (diffDays == -1) {
		            			vm.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " day passed";
		            		} else if (diffDays < -1) {
		            			vm.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " days passed";
		            		}
		            	} else if (diffDays == 0) {
		            		vm.meetings[key].remainDay = "Today!";
		            		vm.meetings[key].dayColor = "419215";
		            		vm.meetings[key].textColor = "419215";
		            		$rootScope.alarm += 1;
		            		vm.meetingAlarm.push(key);
		            	} else if (diffDays > day) {
		            		vm.meetings[key].remainDay = diffDays + " days remain";
		            		vm.meetings[key].dayColor = "3f3f3f";
		            	} // end else if

		            	for (var i = 0; i < vm.meetingAlarm.length; i++) {
		            		if ( key == vm.meetingAlarm[i]) {
		            			vm.meetingAlarmFilter[i] = value;
		            			vm.showAlarmList = true;
		            		} // end if
		            	}; // end for

		            	for (var i = 0; i < vm.meetingExp.length; i++) {
		            		if ( key == vm.meetingExp[i]) {
		            			vm.meetingExpFilter[i] = value;
		            			vm.showExpList = true;
		            		} // end if
		            	}; // end for
      			  }); // end forEach
      	    }.bind(this)); // asynchronous data in a wrong way actially!
      		}, 100); // it is 100 because this part depends on setting ref
       });  //ref to database
	};


  function addMeeting() {
    	$timeout(function () {
	      if (vm.meetingAction === "add") {
  	        RefServices.refData(firebaseUser).push().set({
                 'name':         	vm.meeting.name,
                 'description':  	vm.meeting.description,
                 'dateEnter':    	firebase.database.ServerValue.TIMESTAMP,
                 'dateMeeting':  	$('.datepicker').val(),
                 'time':         	$('.timepicker').val(),
                 'pause':         false
  	        }).then(function() {
              	showToast('Added Meeting', 'md-toast-add');
              	vm.meeting = "";
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
	      } else if (vm.meetingAction === "edit") {
	      	  RefServices.meetData(firebaseUser, vm.key).update({
               'name':         		vm.meeting.name,
               'description': 		vm.meeting.description,
               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
               'dateMeeting':  		$('.datepicker').val(),
               'time':         		$('.timepicker').val()
            }).then(function() {
            	editCheckinsMeeting(vm.meeting, $('.datepicker').val(), $('.timepicker').val());
            	showToast('Edited Meeting', 'md-toast-add');
            	vm.meeting = "";
            	vm.nameAction = "Add New Meeting";
				      vm.meetingAction = "add";
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

	function editCheckinsMeeting(meeting, date, time) {
		const refEditCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.key);
        refEditCheckins.on('value', function (snap) {
	        // ref to invitees who accepted or just sent in order to edit them
            vm.editCheckins = $firebaseArray(refEditCheckins);
            vm.editCheckins.$loaded().then(function (list) {
                for (var i = 0; i < vm.editCheckins.length; i++) {
                    if ( vm.editCheckins[i].send == true &&
                         vm.editCheckins[i].accept == true &&
                         vm.editCheckins[i].reject == false ) {

                        RefServices.refMeetChecked(vm.editCheckins[i].regUser, vm.editCheckins[i].inviteeId)
                          .update({
                                   'name':         		meeting.name,
          					               'description': 		meeting.description,
          					               'dateEnter':    		firebase.database.ServerValue.TIMESTAMP,
          					               'dateMeeting':  		date,
          					               'time':         		time,
          					               'change':          true
                          });

                    } else if ( vm.editCheckins[i].send == true &&
                                vm.editCheckins[i].accept == false &&
                                vm.editCheckins[i].reject == false ) {

                        RefServices.refDeleteInvitation(vm.editCheckins[i].regUser, vm.editCheckins[i].whichInvitation)
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


	function deleteCheckinsMeetingAction(myExcuse, meeting) {

		const refSenddeleteToCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
		refSenddeleteToCheckins.on('value', function (snap) {

			  vm.deleteCheckinsList = $firebaseArray(refSenddeleteToCheckins);
        vm.deleteCheckinsList.$loaded().then(function (list) {
          for (var i = 0; i < vm.deleteCheckinsList.length; i++) {
						if ( vm.deleteCheckinsList[i].send == true &&
  							 vm.deleteCheckinsList[i].accept == true &&
  							 vm.deleteCheckinsList[i].reject == false ) {

							  RefServices.refMeetChecked(vm.deleteCheckinsList[i].regUser, vm.deleteCheckinsList[i].inviteeId).remove();
						    RefServices.refCancellations(vm.deleteCheckinsList[i].regUser).push().set({
						            'dateMeeting':      meeting.dateMeeting,
						            'name':             meeting.name,
						            'description':      meeting.description,
						            'time':             meeting.time,
						            'imageCaller':      vm.callerMeetingInfo.image,
						            'firstnameCaller':  vm.callerMeetingInfo.firstname,
						            'lastnameCaller':   vm.callerMeetingInfo.lastname,
						            'excuse':           myExcuse
						          });
						} else if ( vm.deleteCheckinsList[i].send == true &&
      									vm.deleteCheckinsList[i].accept == false &&
      									vm.deleteCheckinsList[i].reject == false ) {

							                   RefServices.refDeleteInvitation(vm.deleteCheckinsList[i].regUser, vm.deleteCheckinsList[i].whichInvitation).remove();
						} // end else if
					}; // end for
        }.bind(this));
		}); // snap val()
		$timeout(function() {
			RefServices.refMeetChecked(firebaseUser.uid, meeting.$id).remove();
			showToast( 'Meeting Deleted', 'md-toast-delete');
		}, 0);
	}; // deleteCheckinsMeetingAction

	function deleteCheckinsMeetingDialog(event, meeting) {
		var firstCheck = true;
		const refFindAcceptedCheckin = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
		refFindAcceptedCheckin.on('value', function (snap) {

			  vm.acceptedCheckin = $firebaseArray(refFindAcceptedCheckin);
        vm.acceptedCheckin.$loaded().then(function (list) {
            $timeout(function() {
            	var checkExplain = false;
            	var valNot = meeting.$id;
            	var keys = {};
            	for (var i = 0; i < vm.acceptedCheckin.length; i++) {
            		if (vm.acceptedCheckin[i].accept) {
            			checkExplain = true;
            			var valExp = vm.acceptedCheckin[i].$id;
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
				              deleteCheckinsMeetingAction(myExcuse, meeting);
				              $mdDialog.cancel();
				            };
				          },
				          controllerAs: 'ctrl',
				          parent: angular.element(document.body),
				          template:
					          '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
					          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;min-width:400px;max-height:150px;height:150px;">' +
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
								deleteCheckinsMeetingAction('nothing', meeting);
							});

						return false;

		        } // end if else

		        }, 0);
			  }.bind(this));
			}); // snap val()
		}; // deleteCheckinsMeetingDialog


		function deleteMeeting(event, meeting) {
				var confirm = $mdDialog.confirm()
				.title('Are you sure you want to delete ' +  meeting.name  + ' ?')
				.ok('Yes')
				.cancel('Cancel')
				.targetEvent(event);
				$mdDialog.show(confirm).then(function(){
					RefServices.meetData(firebaseUser, meeting.$id).remove();
					showToast('Meeting Deleted!', 'md-toast-delete');
				});

		};  // delete Meeting


		function showToast(message, color) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass(color)
					.content(message)
					.position('top, right')
					.hideDelay(1000)
			);
		}; // Show Toast

		function getEdit(key) {
		  $timeout(function () {
  			vm.key = key;
  			vm.nameAction = "Edit Meeting";
  			vm.meetingAction = "edit";
  			$(".collapsible-header").addClass("active");
  			$(".collapsible").collapsible({accordion: false});
  			$("#name").next().addClass("active");
  			$("#description").next().addClass("active");

  			RefServices.meetData(firebaseUser, key).on('value', function (snap) {
  		        	vm.editMeeting = snap.val();
  		        	if (vm.editMeeting.dateMeeting) {
  		        		var $inputDate = $('.datepicker').pickadate();
  						var pickerDate = $inputDate.pickadate('picker');
  						var setDatePicker = pickerDate.set("select", new Date(vm.editMeeting.dateMeeting));
  		        	} else {
  		        		var setDatePicker = '';
  		        	};

  		        	if (vm.editMeeting.time) {
  						var spliceTime = vm.editMeeting.time.slice(0, 5);
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

		        	vm.meeting = {
		        	     'name':         vm.editMeeting.name,
		               'description':  vm.editMeeting.description,
		               'date':         setDatePicker,
		               'time':         time,
		               'key':          key
		        	}
	       	});  //ref to database
	      }, 0); // timeput
		}; // get edit function

		function pauseMeetingAction(excuse, meeting) {
			const refPauseCheckins = RefServices.refCheckin(firebaseUser.uid, meeting.$id);
			refPauseCheckins.on('value', function (snap) {
				$timeout(function () {
					vm.pauseCheckins = $firebaseArray(refPauseCheckins);
					vm.pauseCheckins.$loaded().then(function (list) {
						for (var i = 0; i < vm.pauseCheckins.length; i++) {

							if ( vm.pauseCheckins[i].send == true &&
  								 vm.pauseCheckins[i].accept == true &&
  								 vm.pauseCheckins[i].reject == false ) {

									            RefServices.refMeetChecked(vm.pauseCheckins[i].regUser, vm.pauseCheckins[i].inviteeId)
            										.update({
            							               'pause':  true,
            							               'excuse': excuse
            							            });

							                RefServices.refCheckedPerson(firebaseUser.uid, meeting.$id, vm.pauseCheckins[i].$id)
										            .update({
      							               'pause':  true,
      							               'excuse': excuse
      							            });

							} else if ( vm.pauseCheckins[i].send == true &&
      										vm.pauseCheckins[i].accept == false &&
      										vm.pauseCheckins[i].reject == false ) {

									                   RefServices.refDeleteInvitation(vm.pauseCheckins[i].regUser, vm.pauseCheckins[i].whichInvitation)
                    										.update({
                    							               'pause':  true,
                    							               'excuse': excuse
                    							      });

							                       RefServices.refCheckedPerson(firebaseUser.uid, meeting.$id, vm.pauseCheckins[i].$id)
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

				showToast( 'Meeting Suspended', 'md-toast-delete');

		} // pauseMeetingAction

		function pauseMeetingDialog(event, meeting, color) {
	        $mdDialog.show({
	          controller: function () {
	            this.parent = $scope;
	            $scope.cancel = function() {
	              $mdDialog.cancel();
	            };
	            $scope.suspend = function(myExcuse) {
	              pauseMeetingAction(myExcuse, meeting);
	              $mdDialog.cancel();
	            };
	          },
	          controllerAs: 'ctrl',
	          parent: angular.element(document.body),
	          template:
	          '<form ng-submit="ctrl.parent.suspend(myExcuse)">' +
	          '<md-dialog aria-label="Meeting details" style="border-radius:12px;max-width:500px;min-width:400px;max-height:150px;height:150px;">' +
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


    function showMeetDialog(event, key, meeting) {
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
    		      rejectMeeting(event, meeting, $rootScope.themeColor3);
    		    }; // reject
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template: '<md-dialog aria-label="Meeting details" style="border-radius: 12px;min-width:400px;max-width:450px;max-height:350px;">' +
	          		'<md-toolbar>' +
				      '<div class="md-toolbar-tools left left" style="background-color:'+ $rootScope.themeColor3 +'">' +
				        '<span flex><h6><img src="images/icon.png" style="margin-bottom:-5px;margin-right:5px"> Meeting details</h6></span>' +
				      '</div>' +
				    '</md-toolbar>' +
			        '<md-dialog-content>' +
				     ' <div class="md-dialog-content">' +
				     	'<div ng-show="ctrl.parent.dialog.firstnameCaller"><div class="cropInfo" style="margin-right:0px;margin-top:5px"><img src="images/personal_pics/{{ctrl.parent.dialog.imageCaller}}.jpg" style="border-radius:4px!important;border: 1px solid #fff;box-shadow: 0px 0px 5px #888888;"></div>' +
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


    function sendRejectToCaller(myExcuse, meeting) {
        $timeout(function () {
            const refFindWhichCheckin = RefServices.refCheckin(meeting.whichUser, meeting.whichMeeting);
            refFindWhichCheckin.on('value', function (snap) {
                vm.allCheckin = $firebaseArray(refFindWhichCheckin);
                vm.allCheckin.$loaded().then(function (list) {
                  for (var i = 0; i < vm.allCheckin.length; i++) {
                    if (vm.allCheckin[i].regUser == vm.firebaseUser) {
                      RefServices.refCheckedPerson(meeting.whichUser, meeting.whichMeeting,  vm.allCheckin[i].$id)
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

            	showToast( 'Meeting rejected', 'md-toast-delete');

        }, 0);
    }; // sendRejectToCaller

    function rejectMeeting(event, meeting, color) {
    	$scope.dialog = meeting;
        $mdDialog.show({
          controller: function () {
            this.parent = $scope;
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.delete = function(myExcuse) {
              sendRejectToCaller(myExcuse, $scope.dialog);
              $mdDialog.cancel();
            };
          },
          controllerAs: 'ctrl',
          parent: angular.element(document.body),
          template:
          '<form ng-submit="ctrl.parent.delete(myExcuse)">' +
          '<md-dialog aria-label="Meeting details" style="border-radius:12px;min-width:400px;max-width:500px;max-height:150px;height:150px;">' +
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


	function clearButton() {
      $( $( '#clearButton' ).data('click') ).trigger('click');
      var vm = this;
      vm.meeting = "";
      vm.nameAction = "Add New Meeting";
			vm.meetingAction = "add";
      console.log(vm.nameAction);
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
