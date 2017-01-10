meetingsApp.controller('RecordController', function
  ( $scope, $rootScope, $firebase, $timeout, $firebaseArray, 
  	$mdToast, $mdDialog, $routeParams, $mdMedia, $filter, RefServices, 
    $location, productListPageCount, passDataService) {

    $scope.usersRecordBase = passDataService.getProducts(); // get sync data from meetingsController
    $scope.usersRecord = $scope.usersRecordBase[0];

  	$scope.whichmeeting = $routeParams.mId;
  	$scope.whichuser = $routeParams.uId;
    $scope.isThereOne = false;
    $scope.dateError = false;
    $scope.required = '';
    $scope.alarmGeneralColor = "#dcdcdc";
    $scope.alarmGeneralTitle = "#505050";
    $scope.alarmSummeryColor = "#dcdcdc";
    $scope.alarmSummeryTitle = "#505050";
    $scope.alarmAudienceColor = "#dcdcdc";
    $scope.alarmAudienceTitle = "#2ba030";
    $scope.alarmAbsentTitle = "#b5192f";
    $rootScope.alarmDirectiveColor = "#dcdcdc";
    $rootScope.alarmDirectiveTitle = "#505050";



    RefServices.refMeetChecked($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
          $scope.meetingChecked = snap.val();
        }, 0);
    }); // Ref to meeting's information 


    RefServices.refSummery($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
            if (snap.val()) {

              $scope.summery = snap.val().summery;
              $scope.editSummery = true;
              $("#textarea1").next().addClass("active");

            } else {
              $scope.editSummery = false;
              $("#textarea1").next().removeClass("active");
            }
        }, 0);
    }); // Ref to summery information 


    RefServices.refGeneral($scope.whichuser, $scope.whichmeeting)
      .on('value', function (snap) {
        $timeout(function () {
            $scope.generalInfo = snap.val();
            if ($scope.generalInfo) {
              $scope.editGeneral = true;
            } else {
              $scope.editGeneral = false;
            }
        }, 0);
    }); // Ref to general information 



    const audienceListRef = RefServices.refAudience($scope.whichuser, $scope.whichmeeting);
    audienceListRef.on('value', function (snap) {
          $timeout(function () {

            $scope.audienceArray = [];
            $scope.audienceListSync = $firebaseArray(audienceListRef);
            $scope.audienceListSync.$loaded().then(function (list) {

              if ($scope.audienceListSync.length == 0) {
                $scope.isThereOnePresent = false;
              } else {
                $scope.isThereOnePresent = true;
                for (var i = 0; i < $scope.audienceListSync.length; i++) {
                  $scope.audienceArray.push({
                    'firstname': $scope.audienceListSync[i].firstname,
                    'image':     $scope.audienceListSync[i].image,
                    'lastname':  $scope.audienceListSync[i].lastname
                  });
                };
              }

            }.bind(this));
          }, 0);
    });  // ref to audience's list 


    const absentListRef = RefServices.refAbsence($scope.whichuser, $scope.whichmeeting);
    absentListRef.on('value', function (snap) {
          $timeout(function () {

            $scope.absentArray = [];
            $scope.absentListSync = $firebaseArray(absentListRef);
            $scope.absentListSync.$loaded().then(function (list) {
              if ($scope.absentListSync.length == 0) {
                $scope.isThereOneAbsent = false;
              } else {
                $scope.isThereOneAbsent = true;
                for (var i = 0; i < $scope.absentListSync.length; i++) {
                  $scope.absentArray.push({
                    'firstname': $scope.absentListSync[i].firstname,
                    'image':     $scope.absentListSync[i].image,
                    'lastname':  $scope.absentListSync[i].lastname
                  });
                }; // end for
              } // end if

            }.bind(this));
          }, 0);
    });  // ref to absent's list  

    const directivesListRef = RefServices.refDirectiveRecord($scope.whichuser, $scope.whichmeeting); 
    directivesListRef.on('value', function (snap) {
          $timeout(function () {

            $scope.directiveArray = [];
            
            $scope.dataRecord = $firebaseArray(directivesListRef);
            $scope.dataRecord.$loaded().then(function (list) {
              if ($scope.dataRecord.length == 0) {
                $scope.isThereOneDirective = false;
              } else {
                $scope.isThereOneDirective = true;
                for (var i = 0; i < $scope.dataRecord.length; i++) {
                  $scope.directiveArray.push({
                    'description':    $scope.dataRecord[i].description,
                    'responsible':    $scope.dataRecord[i].responsible,
                    'follow':         $scope.dataRecord[i].follow,
                    'respite':        $scope.dataRecord[i].respite
                  });
                };
              }
            }.bind(this));
          }, 0);
    });  // ref to Directive list  


  $scope.refFindRecordList = function() {   
        $timeout(function () {
            $scope.usersShortRecord = [];

            for (var i = 0; i < $scope.usersRecord.length; i++) {
              if($scope.usersRecord[i].send && !$scope.usersRecord[i].reject) {
                $scope.usersShortRecord.push({
                  "regUser":   $scope.usersRecord[i].regUser,
                  "firstname": $scope.usersRecord[i].firstname,
                  "lastname":  $scope.usersRecord[i].lastname,
                  "image":     $scope.usersRecord[i].image,
                });
              } // end if
            }; // end for
          
            for (var j = 0; j < $scope.audienceListSync.length; j++) {
              for (var i = 0; i < $scope.usersShortRecord.length; i++) {
                if ($scope.usersShortRecord[i].regUser === $scope.audienceListSync[j].regUser) {
                  $scope.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            for (var j = 0; j < $scope.absentListSync.length; j++) {
              for (var i = 0; i < $scope.usersShortRecord.length; i++) {
                if ($scope.usersShortRecord[i].regUser === $scope.absentListSync[j].regUser) {
                  $scope.usersShortRecord.splice(i,1);
                } // end if
              }; // end for
            }; // end for

            if ($scope.usersShortRecord.length == 0) {
              $scope.showCheckinList = false;
            } else if ($scope.usersShortRecord.length > 0) {
              $scope.showCheckinList = true;
            }        
            
        }, 0);
  }; // refFindRecordList
    
  $scope.refFindRecordList();

  $scope.addAudience = function() {
    $scope.alarmAudienceColor = "#dcdcdc";
    $scope.alarmAudienceTitle = "#2ba030";
    $scope.alarmAbsentTitle = "#b5192f";
    var dataList = $scope.dataAudience;
    $timeout(function () {      

      for (var i = 0; i < dataList.length; i++) {
        for (var j = 0; j < $scope.usersRecord.length; j++) {
          if ($scope.usersRecord[j].send && $scope.usersRecord[j].regUser == $scope.dataAudience[i].regUser) {
                RefServices.refAudience($scope.whichuser, $scope.whichmeeting).push().set({
                  'firstname':         $scope.dataAudience[i].firstname,
                  'lastname':          $scope.dataAudience[i].lastname,
                  'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                  'image':             $scope.dataAudience[i].image,
                  'regUser':           $scope.dataAudience[i].regUser,
                  'accept':            $scope.usersRecord[j].accept,
                });
          } // end if
        }; // end for
      };  // end for all

      
      $scope.refFindRecordList();
      $scope.dataAudience = [];
      $scope.showAgreeAudience = 0;
      $scope.showToast('Added Audience', 'md-toast-add');

    }, 0);
    
  };  // Add Audience 


  $scope.deleteAudience = function(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAudience($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.refFindRecordList();
        $scope.dataAudience = [];
        $scope.showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete Audience invitee



  $scope.addAbsent = function() {
    var dataList = $scope.dataAbsent;

    $timeout(function () {      

        for (var i = 0; i < dataList.length; i++) {
          for (var j = 0; j < $scope.usersRecord.length; j++) {
            if ($scope.usersRecord[j].send && $scope.usersRecord[j].regUser == $scope.dataAbsent[i].regUser) {
                  RefServices.refAbsence($scope.whichuser, $scope.whichmeeting).push().set({
                    'firstname':         $scope.dataAbsent[i].firstname,
                    'lastname':          $scope.dataAbsent[i].lastname,
                    'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    'image':             $scope.dataAbsent[i].image,
                    'regUser':           $scope.dataAbsent[i].regUser,
                    'accept':            $scope.usersRecord[j].accept,
                  });
            } // end if
          }; // end for
        };  // end for all

      $scope.alarmAudienceColor = "#dcdcdc";
      $scope.alarmAudienceTitle = "#2ba030";
      $scope.alarmAbsentTitle = "#b5192f";
      $scope.refFindRecordList();
      $scope.dataAbsent = [];
      $scope.showAgreeAbsent = 0;
      $scope.showToast('Added Absence', 'md-toast-add');
    }, 0);
    
  };  // Add Absent   

  
  $scope.deleteAbsent = function(event, checked) {
    var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete ' +  checked.firstname  + ' ' + checked.lastname + '?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
      $mdDialog.show(confirm).then(function(){
        RefServices.refDeleteAbsence($scope.whichuser, $scope.whichmeeting, checked.$id).remove();
        $scope.refFindRecordList();
        $scope.dataAbsent = [];
        $scope.showToast(checked.firstname  + ' ' + checked.lastname + ' Deleted!', 'md-toast-delete');
      }, function(){

      });
  }; // delete Audience invitee


  $scope.addDirective = function(record) {
    
    if( $("#api_picker_clear").val() == '' ) {

      $scope.dateError = true;
      $("#api_picker_clear").next().addClass("active");

    } else {

      $scope.dateError = false;
      $("#api_picker_clear").next().removeClass("active");
      $("#api_picker_clear").next().removeClass('ui-state-highlight');

      RefServices.refDirectiveRecord($scope.whichuser, $scope.whichmeeting).push().set({
          'description':     record.recordDescription,
          'responsible':    record.responsible,
          'follow':         record.follow,
          'respite':        $( '#api_picker_clear' ).val()
      });
      
      $rootScope.alarmDirectiveColor = "#dcdcdc";
      $rootScope.alarmDirectiveTitle = "#505050";
      $scope.showToast('Added Directive', 'md-toast-add');
      $scope.cancelDirective();
    }


  }; // addDirective

  $scope.cancelDirective = function() {
    $("#recordDescription").val("");
    $("#recordDescription").next().removeClass("active");
    $("#responsible").val("");
    $("#responsible").next().removeClass("active");
    $("#follow").val("");
    $("#follow").next().removeClass("active");
    api_calendar_clear.clear();
    $scope.dateError = false;
    $("#api_picker_clear").next().removeClass("active");
    $("#api_picker_clear").next().removeClass('ui-state-highlight');
  }; //cancelDirective


    $scope.deleteDirective = function(event, record) {
        var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete this directive?')
        .ok('Yes')
        .cancel('Cancel')
        .targetEvent(event);
        $mdDialog.show(confirm).then(function(){
          RefServices.refDirectiveRecordDelete($scope.whichuser, $scope.whichmeeting, record.$id).remove();
          $scope.showToast('Directive Deleted!', 'md-toast-delete');
        });

    };  // delete directive


    $scope.showDetails = function(event, record) {
      
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



    $scope.addSummery = function() {
      RefServices.refSummery($scope.whichuser, $scope.whichmeeting).update({
                  'summery':      $scope.summery,
                  'dateEnter':    firebase.database.ServerValue.TIMESTAMP
              });
      $scope.alarmSummeryColor = "#dcdcdc";
      $scope.alarmSummeryTitle = "#505050";
    };  // addSummery


    $scope.clearSummery = function() {
      $("#textarea1").val("");
      $("#textarea1").next().removeClass("active");
    }; // clear summery


    $scope.addGeneral = function() {    
      $(document).ready(function () {
          if( $("#date-picker1").val() == '' ) {
              $("#date-picker1").next().addClass("active");
          } 

          if ( $("#time-picker1").val() == '' ) {
              $scope.required = "required!";
              $("#time-picker1").next().addClass("active");
          }

          if ( $("#time-picker2").val() == '' ) {
              $scope.required = "required!";
              $("#time-picker2").next().addClass("active");
          }       
      });

      if ( $scope.general.places &&
           $("#date-picker1").val() &&
           $("#time-picker1").val() &&
           $("#time-picker2").val() ) {

                $scope.alarmGeneralColor = "#dcdcdc";
                $scope.alarmGeneralTitle = "#fff";
                RefServices.refGeneral($scope.whichuser, $scope.whichmeeting).update({
                  'date':         $("#date-picker1").val(),
                  'startTime':    $("#time-picker1").val(),
                  'endTime':      $("#time-picker2").val(),
                  'places':       $scope.general.places,
                  'dateEnter':    firebase.database.ServerValue.TIMESTAMP
                });
      } // end if

    }; // add general


    $scope.getEditGeneral = function() {
        $scope.editGeneral = false;
        $("#date-picker1").next().addClass("active");
        $("#time-picker1").next().addClass("active");
        $("#time-picker2").next().addClass("active");
        $("#place").next().addClass("active");


            var $inputDate = $('.datepicker').pickadate();
            var pickerDate = $inputDate.pickadate('picker');
            var setDatePicker = pickerDate.set("select", new Date($scope.generalInfo.date));

            var spliceTime1 = $scope.generalInfo.startTime.slice(0, 5);
            var spliceTime2 = $scope.generalInfo.endTime.slice(0, 5);
            var time1 = new Date(),
                s1 = spliceTime1 + " AM",
                parts1 = s1.match(/(\d+)\:(\d+) (\w+)/),
                hours1 = /am/i.test(parts1[3]) ? parseInt(parts1[1], 10) : parseInt(parts1[1], 10) + 12,
                minutes1 = parseInt(parts1[2], 10);

            var time2 = new Date(),
                s2 = spliceTime2 + " AM",
                parts2 = s2.match(/(\d+)\:(\d+) (\w+)/),
                hours2 = /am/i.test(parts2[3]) ? parseInt(parts2[1], 10) : parseInt(parts2[1], 10) + 12,
                minutes2 = parseInt(parts2[2], 10);

            time1.setHours(hours1);
            time1.setMinutes(minutes1);

            time2.setHours(hours2);
            time2.setMinutes(minutes2);
          
              $scope.general = {
                 'date':         setDatePicker,
                 'startTime':    time1,
                 'endTime':      time2,
                 'places':       $scope.generalInfo.places
              }
    }; // editGeneral


    $scope.recordMeeting = function(event, showCheckinList) {
        
        if (!$scope.generalInfo) {    
          $scope.alarmGeneralColor = "#d03468";
          $scope.alarmGeneralTitle = "#fff";      
          $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to fill general information')
              .ok('Ok')
              .targetEvent(event)
          );

        } else if (showCheckinList) {
            $scope.alarmAudienceColor = "#d03468";
            $scope.alarmAudienceTitle = "#fff";
            $scope.alarmAbsentTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have not done all attendance list')
              .ok('Ok')
              .targetEvent(event)
            );

        } else if (!$scope.summery) {
            $scope.alarmSummeryColor = "#d03468";
            $scope.alarmSummeryTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to fill meeting summery')
              .ok('Ok')
              .targetEvent(event)
            );
        
        } else if (!$scope.isThereOneDirective) {
            $rootScope.alarmDirectiveColor = "#d03468";
            $rootScope.alarmDirectiveTitle = "#fff";
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .textContent('You have to add at least one directive')
              .ok('Ok')
              .targetEvent(event)
            );
        } else if ( $scope.generalInfo &&
                    !showCheckinList &&
                    $scope.summery &&
                    $scope.isThereOneDirective) {

          $timeout(function () {
            for (var i = 0; i < $scope.usersRecord.length; i++) {

              if ( $scope.usersRecord[i].send &&
                   !$scope.usersRecord[i].accept &&
                   !$scope.usersRecord[i].reject ) {

                    RefServices.refDeleteInvitation($scope.usersRecord[i].regUser, $scope.usersRecord[i].whichInvitation).remove();
                    RefServices.refArchive($scope.usersRecord[i].regUser).push().set({
                       'absence':           $scope.absentArray,
                       'audience':          $scope.audienceArray,
                       'directives':        $scope.directiveArray,
                       'general':           $scope.generalInfo,
                       'summery':           $scope.summery,
                       'dateMeeting':       $scope.meetingChecked.dateMeeting,
                       'name':              $scope.meetingChecked.name,
                       'description':       $scope.meetingChecked.description,
                       'time':              $scope.meetingChecked.time,
                       'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    });

              } else if ( $scope.usersRecord[i].send &&
                          $scope.usersRecord[i].accept ) {

                    RefServices.refMeetChecked($scope.usersRecord[i].regUser, $scope.usersRecord[i].inviteeId).remove();
                    RefServices.refArchive($scope.usersRecord[i].regUser).push().set({
                       'absence':           $scope.absentArray,
                       'audience':          $scope.audienceArray,
                       'directives':        $scope.directiveArray,
                       'general':           $scope.generalInfo,
                       'summery':           $scope.summery,
                       'dateMeeting':       $scope.meetingChecked.dateMeeting,
                       'name':              $scope.meetingChecked.name,
                       'description':       $scope.meetingChecked.description,
                       'time':              $scope.meetingChecked.time,
                       'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                    });

                } // end if
            }; // end for

                RefServices.refMeetChecked($scope.whichuser, $scope.whichmeeting).remove();
                RefServices.refArchive($scope.whichuser).push().set({
                   'absence':           $scope.absentArray,
                   'audience':          $scope.audienceArray,
                   'directives':        $scope.directiveArray,
                   'general':           $scope.generalInfo,
                   'summery':           $scope.summery,
                   'dateMeeting':       $scope.meetingChecked.dateMeeting,
                   'name':              $scope.meetingChecked.name,
                   'description':       $scope.meetingChecked.description,
                   'time':              $scope.meetingChecked.time,
                   'dateEnter':         firebase.database.ServerValue.TIMESTAMP,
                }).then(function() {
                    $location.path('/meetings');
                });

              }, 0); 
        } // end if
    }; //addRecord















  $scope.showToast = function(message, color) {
      $mdToast.show(
        $mdToast.simple()
          .toastClass(color)
          .content(message)
          .position('top, right')
          .hideDelay(2000)
      );
  }; // Show Toast


  $scope.dataAudience = [];
  $scope.dataAbsent = [];

  $scope.clearDataAudience = function() {
    
    if ($scope.dataAudience.length) {
      $scope.showAgreeAudience = $scope.dataAudience.length;
    } else {
      $scope.showAgreeAudience = 0;
    }

  }; // clear data


  $scope.clearDataAbsent = function() {
    
    if ($scope.dataAbsent.length) {
      $scope.showAgreeAbsent = $scope.dataAbsent.length;
    } else {
      $scope.showAgreeAbsent = 0;
    }

  }; // clear data


  $scope.isCheckedAudience = function(id){
      var match = false;
      for(var i=0 ; i < $scope.dataAudience.length; i++) {
        if($scope.dataAudience[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking
  
  $scope.syncAudience = function(bool, item){
    if(bool){
      // add item
      $scope.dataAudience.push(item);
      $scope.showAgreeAudience = $scope.dataAudience.length;
    } else {
      // remove item
      for(var i=0 ; i < $scope.dataAudience.length; i++) {
        if($scope.dataAudience[i].regUser == item.regUser){
          $scope.dataAudience.splice(i,1);
          $scope.showAgreeAudience = $scope.dataAudience.length;
        }
      }      
    }
  };  // pic data from checkbox


  $scope.isCheckedAbsent = function(id){
      var match = false;
      for(var i=0 ; i < $scope.dataAbsent.length; i++) {
        if($scope.dataAbsent[i].id == id){
          match = true;
        }
      }
      return match;
  };  // checkbox checking
  
  $scope.syncAbsent = function(bool, item){
    if(bool){
      // add item
      $scope.dataAbsent.push(item);
      $scope.showAgreeAbsent = $scope.dataAbsent.length;
    } else {
      // remove item
      for(var i=0 ; i < $scope.dataAbsent.length; i++) {
        if($scope.dataAbsent[i].regUser == item.regUser){
          $scope.dataAbsent.splice(i,1);
          $scope.showAgreeAbsent = $scope.dataAbsent.length;
        }
      }      
    }
  };  // pic data from checkbox



  $('input#meetingPlaces').characterCounter();
  $('textarea#textarea1').characterCounter();

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

    var api_picker_clear = $( '#api_picker_clear' ).pickadate({
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
    }),
    api_calendar_clear = api_picker_clear.data( 'pickadate' );

    $('.timepicker').pickatime({
        default: 'now',
        twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
        donetext: 'OK',
        autoclose: true,
        vibrate: true // vibrate the device when dragging clock hand
    });

}); // CheckinsController








