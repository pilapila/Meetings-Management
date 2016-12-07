(function(){
 'use strict';

meetingsApp.controller('MeetingsController', function
  ($scope, $rootScope, $firebase, $timeout, $firebaseArray, $mdToast, $mdDialog, 
   $mdMedia, $filter, RefServices, productListPageCount, paginationActiveClass, paginationActiveClassDir) {
  	
	firebase.auth().onAuthStateChanged(firebaseUser =>{
		if(firebaseUser !== null){

			$scope.nameAction = "Add New Meeting";
			$scope.meetingAction = "add";

			// Start Pagination code

			$scope.selectedPage = 1;
			$scope.pageSize = productListPageCount;
			$scope.activationPre = "disabled";
			$scope.activationNext = paginationActiveClassDir;

		    $scope.selectRowNum = function(num) {
		    	$scope.pageSize = num;
		    	$scope.selectedPage = 1;
		    	$scope.activationPre = "disabled";
		    	$scope.activationNext = paginationActiveClassDir;
		    };

			$scope.selectPage = function (newPage) {
				$scope.selectedPage = newPage;
				if ($scope.selectedPage < $rootScope.pageCount) {
					$scope.activationNext = paginationActiveClassDir;
					//$scope.activationPre = "active";
				}
				if ($scope.selectedPage == $rootScope.pageCount) {
					$scope.activationNext = "disabled";
					$scope.activationPre = paginationActiveClassDir;
				}
				if ($scope.selectedPage > 1) {
					//$scope.activationNext = "active";
					$scope.activationPre = paginationActiveClassDir;
				}
				if ($scope.selectedPage == 1) {
					$scope.activationNext = paginationActiveClassDir;
					$scope.activationPre = "disabled";
				}
			}; // Pagination select functions

			$scope.selectNextPage = function () {
				$scope.pageCountRow = $rootScope.pageCount;
				if ($scope.selectedPage < $rootScope.pageCount) {
					$scope.selectedPage += 1;
					$scope.activationPre = paginationActiveClassDir;
					if ($scope.selectedPage == $rootScope.pageCount) {
						$scope.activationNext = "disabled";
					}
				} else if ($scope.selectedPage >= $rootScope.pageCount) {
					$scope.selectedPage = $rootScope.pageCount;
				}
			}; // Pagination select next functions

			$scope.selectPrePage = function () {
				if ($scope.selectedPage > 1) {
					$scope.selectedPage -= 1;
					$scope.activationNext = paginationActiveClassDir;
					if ($scope.selectedPage == 1) {
						$scope.activationPre = "disabled";
					}
				} else if ($scope.selectedPage <= 1) {
					$scope.selectedPage = 1;
				}
			}; // Pagination select pre functions

			$scope.getPageClass = function(page) {
            	return $scope.selectedPage == page ? paginationActiveClass : "";
        	}; // Pagination class functions
        	// End Pagination code

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
				            		$scope.meetings[key].dayColor = "#cc2864";
				            		$scope.meetings[key].textColor = "#cc2864";
				            		$scope.meetingExp.push(key);
				            		if (diffDays == -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " day passed";
				            		} else if (diffDays < -1) {
				            			$scope.meetings[key].diffDays = "/ " + Math.abs(diffDays) + " days passed";
				            		}
				            	} else if (diffDays == 0) {
				            		$scope.meetings[key].remainDay = "Today!";
				            		$scope.meetings[key].dayColor = "#419215";
				            		$scope.meetings[key].textColor = "#419215";
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

				            	for (var i = 0; i < $scope.meetingExp.length; i++) {
				            		if ( key == $scope.meetingExp[i]) {
				            			$scope.meetingExpFilter[i] = value;
				            			$scope.showExpList = true;
				            		}
				            	};
				            });

		           		}.bind(this)); // asynchronous data in AngularFire
					}, 0);
	       		});  //ref to database
						
	    $scope.addMeeting = function() {
	    	$timeout(function () {
		      if ($scope.meetingAction === "add") {
		        RefServices.refData(firebaseUser).push().set({
	               'name':         		$scope.meeting.name,
	               'description':  		$scope.meeting.description,
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
		      } else if ($scope.meetingAction === "edit") {
		      	RefServices.meetData(firebaseUser, $scope.key).update({
	               'name':         		$scope.meeting.name,
	               'description': 		$scope.meeting.description,
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
		               'time':         time
		        	}
	       	});  //ref to database
	      }, 0); // timeput
		}; // get edit function

	}   //if statement
  }); //firebaseUser


    $scope.showMeetDialog = function(ev, key, meeting) {
     	$scope.dialog = meeting;
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
	$("#description").val("");
	$("#description").next().removeClass("active");
  };

	$('input#name, textarea#textarea1').characterCounter();
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
  	$('select').material_select();
  	$('.timepicker').pickatime({
	    default: 'now',
	    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
	    donetext: 'OK',
	    autoclose: true,
	    vibrate: true // vibrate the device when dragging clock hand
	});

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


 }); // MeetingsController

}());